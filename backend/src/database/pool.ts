import pg, { type PoolConfig } from 'pg'

export function createDatabasePool(
  config: PoolConfig,
  onError: (error: Error) => void,
) {
  const pool = new pg.Pool({
    ...config,
    max: 5,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 3_000,
    statement_timeout: 5_000,
    query_timeout: 6_000,
    application_name: 'nexo-assist-backend',
  })

  // Conexões ociosas também podem falhar, por exemplo ao reiniciar o banco.
  pool.on('error', onError)

  return pool
}
