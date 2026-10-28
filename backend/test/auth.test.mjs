import assert from 'node:assert/strict'
import { test } from 'node:test'
import pg from 'pg'
import { buildApp } from '../dist/app.js'

test('rejeita dados inválidos, cookie malformado e origem externa sem consultar o banco', async (t) => {
  const pool = new pg.Pool()
  const app = buildApp({ pool })
  t.after(async () => {
    await app.close()
    await pool.end()
  })
  const query = t.mock.method(pool, 'query', async () => {
    throw new Error('Não deveria consultar o banco')
  })
  const connect = t.mock.method(pool, 'connect', async () => {
    throw new Error('Não deveria reservar uma conexão')
  })

  for (const payload of [
    {},
    { email: 'invalido', password: '123' },
    { email: 'ana@nexo.test', password: '   ' },
  ]) {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload,
    })
    assert.equal(response.statusCode, 400)
    assert.equal(response.headers['set-cookie'], undefined)
  }

  const invalidCookie = await app.inject({
    url: '/auth/me',
    headers: { cookie: 'nexo_session=inventado' },
  })
  assert.equal(invalidCookie.statusCode, 401)

  for (const url of ['/auth/login', '/auth/logout']) {
    const response = await app.inject({
      method: 'POST',
      url,
      headers: { origin: 'https://site-externo.test' },
    })
    assert.equal(response.statusCode, 403)
  }
  const crossSite = await app.inject({
    method: 'POST',
    url: '/auth/logout',
    headers: { 'sec-fetch-site': 'cross-site' },
  })
  assert.equal(crossSite.statusCode, 403)
  assert.equal(query.mock.callCount(), 0)
  assert.equal(connect.mock.callCount(), 0)
})

test('falha no login reverte a transação, libera a conexão e não emite cookie', async (t) => {
  const pool = new pg.Pool()
  const app = buildApp({ pool })
  t.after(async () => {
    await app.close()
    await pool.end()
  })
  const commands = []
  let released = false
  t.mock.method(pool, 'connect', async () => ({
    query: async (sql) => {
      commands.push(sql)
      if (sql.includes('FROM app.employees'))
        throw new Error('Detalhe privado do banco')
      return { rows: [] }
    },
    release: () => {
      released = true
    },
  }))

  const response = await app.inject({
    method: 'POST',
    url: '/auth/login',
    payload: { email: 'ana@nexo.test', password: 'qualquer' },
  })
  assert.equal(response.statusCode, 503)
  assert.equal(response.headers['set-cookie'], undefined)
  assert.ok(commands.includes('ROLLBACK'))
  assert.equal(released, true)
  assert.equal(response.body.includes('Detalhe privado'), false)
})
