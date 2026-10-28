import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import {
  SESSION_COOKIE,
  SESSION_DURATION_SECONDS,
  type SessionService,
} from '../auth/sessions.js'

type AuthOptions = {
  sessions: SessionService
  secureCookies: boolean
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  // Autenticação de demonstração exigida pelo PRD: a senha não é persistida.
  password: z
    .string()
    .min(1)
    .max(256)
    .refine((value) => value.trim().length > 0),
})

export const authRoutes: FastifyPluginAsync<AuthOptions> = async (
  app,
  { sessions, secureCookies },
) => {
  const cookieOptions = {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: secureCookies,
  }

  app.addHook('onRequest', async (_request, reply) => {
    reply.header('Cache-Control', 'no-store')
  })

  app.setErrorHandler<Error & { statusCode?: number }>(
    (error, _request, reply) => {
      if (error.statusCode && error.statusCode < 500) {
        return reply
          .code(error.statusCode)
          .send({ message: 'Requisição inválida.' })
      }
      app.log.error({ err: error }, 'Falha no serviço de autenticação')
      return reply
        .code(503)
        .send({ message: 'Autenticação temporariamente indisponível.' })
    },
  )

  app.post('/auth/login', { bodyLimit: 4096 }, async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply
        .code(400)
        .send({ message: 'Informe e-mail válido e senha não vazia.' })
    }

    const session = await sessions.create(
      parsed.data.email,
      request.cookies[SESSION_COOKIE],
    )
    if (!session) {
      return reply.code(401).send({ message: 'E-mail ou senha inválidos.' })
    }

    reply.setCookie(SESSION_COOKIE, session.token, {
      ...cookieOptions,
      maxAge: SESSION_DURATION_SECONDS,
      expires: session.expiresAt,
    })
    return { employee: session.employee }
  })

  app.get('/auth/me', async (request, reply) => {
    const employee = await sessions.getEmployee(request.cookies[SESSION_COOKIE])
    if (!employee) {
      reply.clearCookie(SESSION_COOKIE, cookieOptions)
      return reply.code(401).send({ message: 'Autenticação necessária.' })
    }
    return { employee }
  })

  app.post('/auth/logout', async (request, reply) => {
    await sessions.revoke(request.cookies[SESSION_COOKIE])
    reply.clearCookie(SESSION_COOKIE, cookieOptions)
    return reply.code(204).send()
  })
}
