'use client'

import { useState, type FormEvent } from 'react'
import type { LoginFeedback } from '@/types/auth'

const feedbackMessages: Record<LoginFeedback, string> = {
  idle: '',
  'sign-in':
    'O acesso estará disponível assim que a autenticação for configurada.',
  password:
    'Para recuperar sua senha, ligue para a equipe de TI no ramal 4000.',
}

const inputClassName =
  'h-11 w-full rounded-lg border border-[#8591a0] bg-white pr-11 pl-10 text-xs text-[#1b2430] outline-none transition-[border-color,box-shadow] placeholder:text-[#657184] focus:border-[#0064c9] focus:ring-2 focus:ring-[#0064c9]/20 motion-reduce:transition-none'

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [feedback, setFeedback] = useState<LoginFeedback>('idle')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback('sign-in')
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-7 border-b border-[#e3e7ed] pb-6 [&_button]:cursor-pointer [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-[#0064c9]"
    >
      <label htmlFor="email" className="mb-2 block text-xs text-[#1b2430]">
        E-mail corporativo
      </label>
      <div className="relative">
        <svg
          className="pointer-events-none absolute top-3.5 left-3.5 size-4 text-[#536073]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 6 9 7 9-7" />
        </svg>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="ana.souza@nexo.com.br"
          required
          className={inputClassName}
        />
      </div>

      <div className="mt-4 mb-2 flex items-center justify-between gap-3">
        <label htmlFor="password" className="text-xs text-[#1b2430]">
          Senha
        </label>
        <button
          type="button"
          className="rounded-sm text-xs text-[#0064c9] underline-offset-4 hover:underline"
          onClick={() => setFeedback('password')}
        >
          Esqueci minha senha
        </button>
      </div>
      <div className="relative text-[#0064c9] focus-within:text-[#0064c9]">
        <svg
          className="pointer-events-none absolute top-3.5 left-3.5 size-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <rect x="5" y="10" width="14" height="11" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
        </svg>
        <input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Digite sua senha"
          required
          className={inputClassName}
        />
        <button
          className="absolute top-1 right-1 flex size-9 items-center justify-center rounded text-[#536073] hover:text-[#0064c9]"
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={showPassword}
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
            {showPassword && <path d="m3 3 18 18" />}
          </svg>
        </button>
      </div>

      <label className="mt-4 flex w-fit cursor-pointer items-center gap-2 text-[11px] leading-relaxed text-[#536073]">
        <input
          type="checkbox"
          name="remember"
          defaultChecked
          className="size-4 shrink-0 rounded accent-[#0064c9] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0064c9]"
        />
        Manter conectado neste computador
      </label>
      <button
        type="submit"
        className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#0064c9] text-sm font-medium text-white shadow-[0_4px_12px_#0064c926] transition-colors hover:bg-[#0054ad] active:bg-[#00458e] motion-reduce:transition-none"
      >
        Entrar <span aria-hidden="true">→</span>
      </button>
      <p
        role="status"
        className="mt-3 text-xs leading-relaxed text-[#536073] empty:hidden"
      >
        {feedbackMessages[feedback]}
      </p>
    </form>
  )
}
