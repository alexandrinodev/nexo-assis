import assert from 'node:assert/strict'
import { createHash, randomUUID } from 'node:crypto'
import { test } from 'node:test'
import { buildApp } from '../../dist/app.js'
import { databaseConfig } from '../../dist/database/config.js'
import { createDatabasePool } from '../../dist/database/pool.js'

function sessionCookie(response) {
  const headers = response.headers['set-cookie']
  const header = Array.isArray(headers) ? headers[0] : headers
  assert.ok(header)
  return header.split(';')[0]
}

function hashCookie(cookie) {
  return createHash('sha256').update(cookie.split('=')[1]).digest('hex')
}

test('autenticação e isolamento com sessões reais no PostgreSQL', async (t) => {
  const pool = createDatabasePool(databaseConfig, () => {})
  let app = buildApp({ pool })
  const ids = [randomUUID(), randomUUID(), randomUUID(), randomUUID()]
  const [anaId, carlaId, inactiveId, analystId] = ids
  const email = (id) => `${id}@nexo.test`
  const login = (id, previousCookie) =>
    app.inject({
      method: 'POST',
      url: '/auth/login',
      headers: previousCookie ? { cookie: previousCookie } : {},
      payload: {
        email: `  ${email(id).toUpperCase()}  `,
        password: 'qualquer-senha',
      },
    })
  const me = (cookie) => app.inject({ url: '/auth/me', headers: { cookie } })

  try {
    for (const [index, id] of ids.entries()) {
      await pool.query(
        `INSERT INTO app.employees (id, name, email, role, support_level, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          id,
          `Teste ${index}`,
          email(id),
          index === 3 ? 'analyst' : 'employee',
          index === 3 ? 'n1' : null,
          index !== 2,
        ],
      )
    }
    for (const id of [anaId, carlaId]) {
      await pool.query(
        `INSERT INTO service_desk.tickets (
          requester_id, title, description, type, category, priority, affected_scope,
          impact_description, work_blocked, has_workaround, urgency_description,
          priority_reason, next_response_due_at
         ) VALUES ($1, 'Teste de autenticação', 'Dados temporários de teste',
          'incident', 'software', 'medium', 'individual', 'Atrapalha o trabalho',
          false, true, 'Sem urgência', 'Existe alternativa', now() + interval '4 days')`,
        [id],
      )
    }

    await t.test(
      'recusa usuário desconhecido ou inativo sem emitir sessão',
      async () => {
        for (const id of [randomUUID(), inactiveId]) {
          const response = await login(id)
          assert.equal(response.statusCode, 401)
          assert.equal(response.headers['set-cookie'], undefined)
        }
      },
    )

    let anaCookie
    await t.test(
      'login normaliza e-mail, aceita senha de demonstração e armazena somente hash',
      async () => {
        const response = await login(anaId)
        assert.equal(response.statusCode, 200)
        assert.equal(response.json().employee.id, anaId)
        assert.equal(response.headers['cache-control'], 'no-store')
        anaCookie = sessionCookie(response)
        const setCookie = String(response.headers['set-cookie'])
        assert.match(setCookie, /HttpOnly/i)
        assert.match(setCookie, /SameSite=Lax/i)
        assert.match(setCookie, /Max-Age=28800/i)
        const stored = await pool.query(
          'SELECT token_hash FROM app.sessions WHERE employee_id = $1',
          [anaId],
        )
        assert.equal(stored.rows.length, 1)
        assert.equal(stored.rows[0].token_hash, hashCookie(anaCookie))
        assert.notEqual(stored.rows[0].token_hash, anaCookie.split('=')[1])
        assert.equal(response.body.includes(anaCookie.split('=')[1]), false)
      },
    )

    await t.test(
      'identifica o funcionário e isola chamados apesar de IDs forjados no cliente',
      async () => {
        assert.equal((await me(anaCookie)).json().employee.id, anaId)
        const carlaCookie = sessionCookie(await login(carlaId))
        for (const [cookie, ownId, otherId] of [
          [anaCookie, anaId, carlaId],
          [carlaCookie, carlaId, anaId],
        ]) {
          const response = await app.inject({
            url: `/tickets?requesterId=${otherId}`,
            headers: { cookie, 'x-requester-id': otherId },
          })
          assert.equal(response.statusCode, 200)
          assert.equal(response.json().length, 1)
          assert.ok(
            response.json().every((ticket) => ticket.requesterId === ownId),
          )
        }
        const anonymous = await app.inject({
          url: `/tickets?requesterId=${anaId}`,
        })
        assert.equal(anonymous.statusCode, 401)
        assert.equal(
          (await me(`nexo_session=${'f'.repeat(64)}`)).statusCode,
          401,
        )
      },
    )

    await t.test(
      'novo login substitui a sessão anterior deste navegador',
      async () => {
        const oldCookie = anaCookie
        anaCookie = sessionCookie(await login(anaId, oldCookie))
        assert.notEqual(anaCookie, oldCookie)
        assert.equal((await me(oldCookie)).statusCode, 401)
        assert.equal((await me(anaCookie)).statusCode, 200)
      },
    )

    await t.test('sessão persiste ao reconstruir a aplicação', async () => {
      await app.close()
      app = buildApp({ pool })
      assert.equal((await me(anaCookie)).statusCode, 200)
    })

    await t.test(
      'funcionário desativado perde acesso mesmo com sessão não vencida',
      async () => {
        await pool.query(
          'UPDATE app.employees SET is_active = false WHERE id = $1',
          [anaId],
        )
        assert.equal((await me(anaCookie)).statusCode, 401)
        assert.equal(
          (
            await app.inject({
              url: '/tickets',
              headers: { cookie: anaCookie },
            })
          ).statusCode,
          401,
        )
        await pool.query(
          'UPDATE app.employees SET is_active = true WHERE id = $1',
          [anaId],
        )
      },
    )

    await t.test(
      'origem externa não consegue encerrar uma sessão válida',
      async () => {
        const response = await app.inject({
          method: 'POST',
          url: '/auth/logout',
          headers: { cookie: anaCookie, origin: 'https://site-externo.test' },
        })
        assert.equal(response.statusCode, 403)
        assert.equal((await me(anaCookie)).statusCode, 200)
      },
    )

    await t.test('sessão expirada é recusada pelo servidor', async () => {
      await pool.query(
        `UPDATE app.sessions SET created_at = now() - interval '2 hours',
         expires_at = now() - interval '1 hour' WHERE token_hash = $1`,
        [hashCookie(anaCookie)],
      )
      assert.equal((await me(anaCookie)).statusCode, 401)
      assert.equal(
        (await app.inject({ url: '/tickets', headers: { cookie: anaCookie } }))
          .statusCode,
        401,
      )
    })

    await t.test(
      'logout invalida a sessão no banco e limpa o cookie',
      async () => {
        anaCookie = sessionCookie(await login(anaId))
        const response = await app.inject({
          method: 'POST',
          url: '/auth/logout',
          headers: { cookie: anaCookie },
        })
        assert.equal(response.statusCode, 204)
        assert.match(
          String(response.headers['set-cookie']),
          /Expires=Thu, 01 Jan 1970/i,
        )
        assert.equal((await me(anaCookie)).statusCode, 401)
        assert.equal(
          (await app.inject({ method: 'POST', url: '/auth/logout' }))
            .statusCode,
          204,
        )
      },
    )

    await t.test(
      'perfil do analista vem do banco e cookie de produção usa Secure',
      async () => {
        await app.close()
        app = buildApp({ pool, secureCookies: true })
        const response = await login(analystId)
        assert.equal(response.statusCode, 200)
        assert.equal(response.json().employee.role, 'analyst')
        assert.equal(response.json().employee.supportLevel, 'n1')
        assert.match(String(response.headers['set-cookie']), /; Secure/i)
      },
    )
  } finally {
    await app.close()
    try {
      await pool.query(
        'DELETE FROM app.sessions WHERE employee_id = ANY($1::uuid[])',
        [ids],
      )
      await pool.query(
        'DELETE FROM service_desk.tickets WHERE requester_id = ANY($1::uuid[])',
        [ids],
      )
      await pool.query('DELETE FROM app.employees WHERE id = ANY($1::uuid[])', [
        ids,
      ])
    } finally {
      await pool.end()
    }
  }
})
