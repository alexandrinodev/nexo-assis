import type { FastifyPluginAsync, FastifyRequest } from 'fastify'
import type { Pool } from 'pg'

export type TicketRouteOptions = {
  pool: Pool
  getRequesterId: (request: FastifyRequest) => Promise<string | null>
}

export const ticketRoutes: FastifyPluginAsync<TicketRouteOptions> = async (
  app,
  { pool, getRequesterId },
) => {
  app.get('/tickets', async (request, reply) => {
    reply.header('Cache-Control', 'no-store')
    try {
      const requesterId = await getRequesterId(request)
      if (!requesterId) {
        return reply.code(401).send({ message: 'Autenticação necessária.' })
      }

      const tickets = await pool.query(
        `SELECT id, number, title, type, category, priority, status,
                requester_id AS "requesterId",
                next_response_due_at AS "nextResponseDueAt",
                updated_at AS "updatedAt",
                (status != 'resolved' AND now() > next_response_due_at) AS overdue
         FROM service_desk.tickets
         WHERE requester_id = $1
         ORDER BY created_at DESC, id DESC`,
        [requesterId],
      )

      return tickets.rows
    } catch (error) {
      app.log.error(
        { err: error },
        'Falha ao consultar chamados do solicitante',
      )
      return reply
        .code(503)
        .send({ message: 'Serviço de chamados temporariamente indisponível.' })
    }
  })
}
