import assert from 'node:assert/strict'
import { test } from 'node:test'
import pg from 'pg'
import { buildApp } from '../dist/app.js'

const anaId = '00000000-0000-4000-8000-000000000001'
const carlaId = '00000000-0000-4000-8000-000000000002'
const cookie = `nexo_session=${'a'.repeat(64)}`

function sessionResult(sql) {
  if (sql.includes('FROM app.sessions')) return { rows: [{ id: anaId }] }
  return null
}

function setup(t, options = {}) {
  const pool = new pg.Pool()
  const app = buildApp({ pool, ...options })
  t.after(async () => {
    await app.close()
    await pool.end()
  })
  return { app, pool }
}

test('sem autenticação, rejeita IDs enviados pelo cliente e não consulta o banco', async (t) => {
  const { app, pool } = setup(t)
  const query = t.mock.method(pool, 'query', async () => {
    throw new Error('Não deveria acessar o banco')
  })

  const response = await app.inject({
    method: 'GET',
    url: `/tickets?requesterId=${anaId}`,
    headers: { 'x-requester-id': anaId },
  })

  assert.equal(response.statusCode, 401)
  assert.deepEqual(response.json(), { message: 'Autenticação necessária.' })
  assert.equal(query.mock.callCount(), 0)
})

test('usa a identidade validada e retorna apenas rows, sem metadados do driver', async (t) => {
  const { app, pool } = setup(t)
  const rows = [{ id: 'ticket-ana', requesterId: anaId, title: 'VPN' }]
  t.mock.method(pool, 'query', async (sql, values) => {
    const session = sessionResult(sql)
    if (session) return session
    assert.match(sql, /WHERE requester_id = \$1/)
    assert.deepEqual(values, [anaId])
    return { rows, rowCount: 1, fields: [], command: 'SELECT' }
  })

  const response = await app.inject({
    method: 'GET',
    url: `/tickets?requesterId=${carlaId}`,
    headers: { cookie, 'x-requester-id': carlaId },
  })

  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.json(), rows)
})

test('retorna lista vazia quando o funcionário não possui chamados', async (t) => {
  const { app, pool } = setup(t)
  t.mock.method(
    pool,
    'query',
    async (sql) => sessionResult(sql) ?? { rows: [] },
  )

  const response = await app.inject({ url: '/tickets', headers: { cookie } })

  assert.equal(response.statusCode, 200)
  assert.deepEqual(response.json(), [])
})

test('responde 503 sem expor detalhes do PostgreSQL quando a consulta falha', async (t) => {
  const { app, pool } = setup(t)
  t.mock.method(pool, 'query', async () => {
    throw new Error('Detalhes internos do PostgreSQL')
  })

  const response = await app.inject({ url: '/tickets', headers: { cookie } })

  assert.equal(response.statusCode, 503)
  assert.deepEqual(response.json(), {
    message: 'Serviço de chamados temporariamente indisponível.',
  })
})
