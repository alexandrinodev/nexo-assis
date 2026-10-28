import { createHash, randomBytes } from 'node:crypto'
import type { Pool } from 'pg'

export const SESSION_COOKIE = 'nexo_session'
export const SESSION_DURATION_SECONDS = 8 * 60 * 60

export type SessionEmployee = {
  id: string
  name: string
  email: string
  role: 'employee' | 'analyst'
  department: string | null
  supportLevel: 'n1' | 'n2' | null
}

function tokenHash(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function isSessionToken(token: string | undefined): token is string {
  return token !== undefined && /^[a-f0-9]{64}$/.test(token)
}

export function createSessionService(pool: Pool) {
  return {
    async create(email: string, previousToken?: string) {
      const client = await pool.connect()

      try {
        await client.query('BEGIN')
        const result = await client.query<SessionEmployee>(
          `SELECT id, name, email, role, department, support_level AS "supportLevel"
           FROM app.employees
           WHERE email = $1 AND is_active = true
           FOR SHARE`,
          [email],
        )
        const employee = result.rows[0]
        if (!employee) {
          await client.query('ROLLBACK')
          return null
        }

        const token = randomBytes(32).toString('hex')
        if (isSessionToken(previousToken)) {
          await client.query('DELETE FROM app.sessions WHERE token_hash = $1', [
            tokenHash(previousToken),
          ])
        }
        const session = await client.query<{ expiresAt: Date }>(
          `INSERT INTO app.sessions (employee_id, token_hash, expires_at)
           VALUES ($1, $2, now() + ($3::integer * interval '1 second'))
           RETURNING expires_at AS "expiresAt"`,
          [employee.id, tokenHash(token), SESSION_DURATION_SECONDS],
        )
        const expiresAt = session.rows[0]?.expiresAt
        if (!expiresAt) throw new Error('Sessão não foi criada')

        await client.query('COMMIT')
        return { employee, token, expiresAt }
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      } finally {
        client.release()
      }
    },

    async getEmployee(
      token: string | undefined,
    ): Promise<SessionEmployee | null> {
      if (!isSessionToken(token)) return null

      const result = await pool.query<SessionEmployee>(
        `SELECT e.id, e.name, e.email, e.role, e.department,
                e.support_level AS "supportLevel"
         FROM app.sessions AS s
         JOIN app.employees AS e ON e.id = s.employee_id
         WHERE s.token_hash = $1 AND s.expires_at > now() AND e.is_active = true`,
        [tokenHash(token)],
      )
      return result.rows[0] ?? null
    },

    async revoke(token: string | undefined) {
      if (!isSessionToken(token)) return
      await pool.query('DELETE FROM app.sessions WHERE token_hash = $1', [
        tokenHash(token),
      ])
    },
  }
}

export type SessionService = ReturnType<typeof createSessionService>
