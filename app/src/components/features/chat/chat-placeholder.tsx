import Link from 'next/link'

import type { ChatPlaceholderProps } from '@/types/chat'

export default function ChatPlaceholder({ audience }: ChatPlaceholderProps) {
  const isTechnician = audience === 'technician'

  return (
    <main className="grid min-h-svh place-items-center bg-[#1b2430] px-6 py-8 text-[#f6f8fa]">
      <div className="w-full max-w-[540px]">
        <p className="mb-16 text-[27px] font-[650] tracking-[-1px]">
          nexo assist.
        </p>
        <span className="inline-block rounded-md border border-[#426059] px-2.5 py-1.5 text-xs text-[#8be4cb]">
          Em desenvolvimento
        </span>
        <h1 className="mt-5 mb-4 text-[clamp(30px,5vw,42px)] leading-[1.2] tracking-[-1px]">
          {isTechnician ? 'Console dos técnicos' : 'Seu espaço de atendimento'}
        </h1>
        <p className="leading-[1.8] text-[#aeb9c7]">
          {isTechnician
            ? 'Esta área receberá o chat dos técnicos e a gestão dos atendimentos.'
            : 'Esta área receberá suas conversas com o assistente e o acompanhamento dos seus chamados.'}
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-[#8be4cb] underline underline-offset-[5px] focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-[#8be4cb]"
        >
          ← Voltar ao login
        </Link>
      </div>
    </main>
  )
}
