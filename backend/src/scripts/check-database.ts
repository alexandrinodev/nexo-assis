import { databaseConfig } from '../database/config.js'
import { createDatabasePool } from '../database/pool.js'

const pool = createDatabasePool(databaseConfig, (error) => {
  console.error('Falha em uma conexão ociosa com PostgreSQL:', error.message)
  process.exitCode = 1
})

try {
  await pool.query('SELECT 1')
  console.log('Conexão com PostgreSQL verificada com sucesso.')
} catch (error) {
  console.error(
    'Não foi possível conectar ao PostgreSQL:',
    error instanceof Error ? error.message : 'Erro desconhecido',
  )
  process.exitCode = 1
} finally {
  await pool.end()
}
