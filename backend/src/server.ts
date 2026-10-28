import { buildApp } from './app.js'
import { env } from './config/env.js'
import { databaseConfig } from './database/config.js'
import { createDatabasePool } from './database/pool.js'

const pool = createDatabasePool(databaseConfig, (error) => {
  console.error('Falha em uma conexão ociosa com PostgreSQL:', error.message)
})
const app = buildApp({
  pool,
  logger: true,
  appOrigin: env.APP_ORIGIN,
  secureCookies: env.NODE_ENV === 'production',
})

app.addHook('onClose', async () => {
  await pool.end()
})

async function shutdown() {
  try {
    await app.close()
  } catch (error) {
    app.log.error(error)
    process.exitCode = 1
  }
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)

try {
  await pool.query('SELECT 1')
  app.log.info('Conexão com PostgreSQL verificada')
  await app.listen({ host: env.HOST, port: env.PORT })
} catch (error) {
  app.log.error(error)
  await shutdown()
  process.exitCode = 1
}
