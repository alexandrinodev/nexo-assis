import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import { createSessionService, SESSION_COOKIE } from './auth/sessions.js'
import { authRoutes } from './routes/auth.js'
import { healthRoutes } from './routes/health.js'
import { ticketRoutes, type TicketRouteOptions } from './routes/tickets.js'

type AppOptions = {
  pool: TicketRouteOptions['pool']
  logger?: boolean
  appOrigin?: string
  secureCookies?: boolean
}

export function buildApp({
  pool,
  logger = false,
  appOrigin = 'http://localhost:3000',
  secureCookies = false,
}: AppOptions) {
  const app = Fastify({
    logger: logger
      ? {
          redact: [
            'req.headers.cookie',
            'req.headers.authorization',
            'res.headers["set-cookie"]',
          ],
        }
      : false,
  })
  const sessions = createSessionService(pool)

  app.register(cookie)

  // Bloqueia operações iniciadas por sites não autorizados. Clientes de terminal
  // sem Origin continuam permitidos; o cookie ainda precisa ser validado.
  app.addHook('onRequest', async (request, reply) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) return
    const origin = request.headers.origin
    if (
      (origin !== undefined && origin !== appOrigin) ||
      request.headers['sec-fetch-site'] === 'cross-site'
    ) {
      return reply.code(403).send({ message: 'Origem não permitida.' })
    }
  })

  app.register(healthRoutes)
  app.register(authRoutes, { sessions, secureCookies })
  app.register(ticketRoutes, {
    pool,
    getRequesterId: async (request) => {
      const employee = await sessions.getEmployee(
        request.cookies[SESSION_COOKIE],
      )
      return employee?.id ?? null
    },
  })

  return app
}
