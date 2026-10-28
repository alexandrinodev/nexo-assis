import { z } from 'zod'

const envSchema = z.object({
  HOST: z.string().trim().min(1).default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3333),
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  APP_ORIGIN: z
    .url()
    .refine((value) => {
      const url = new URL(value)
      return ['http:', 'https:'].includes(url.protocol) && url.origin === value
    }, 'Informe somente a origem, sem caminho ou barra final')
    .default('http://localhost:3000'),
  PGHOST: z.string().trim().min(1).default('127.0.0.1'),
  PGPORT: z.coerce.number().int().min(1).max(65535).default(5433),
  PGDATABASE: z.string().trim().min(1).default('nexo_assist'),
  PGUSER: z.string().trim().min(1).default('nexo_local'),
  PGPASSWORD: z.string().min(1),
})

export const env = envSchema.parse(process.env)
