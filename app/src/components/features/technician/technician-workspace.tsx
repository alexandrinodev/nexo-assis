'use client'

import Link from 'next/link'
import { useState } from 'react'
import type {
  TechnicianConversation,
  TechnicianMessage,
} from '@/types/technician'
import ChatIcon from '../chat/chat-icon'
import ConversationList from './conversation-list'
import { demoConversations } from './demo-conversations'
import TechnicianThread from './technician-thread'
import TechnicianTickets from './technician-tickets'

export default function TechnicianWorkspace() {
  const [conversations, setConversations] =
    useState<TechnicianConversation[]>(demoConversations)
  const [selectedId, setSelectedId] = useState('ana')
  const [mobileChatOpen, setMobileChatOpen] = useState(false)
  const [ticketVisibility, setTicketVisibility] = useState<
    'auto' | 'open' | 'closed'
  >('auto')
  const [notice, setNotice] = useState('')
  const selected =
    conversations.find((item) => item.id === selectedId) ?? conversations[0]
  const waitingCount = conversations.filter(
    (item) => item.status === 'waiting',
  ).length

  function updateConversation(
    transform: (item: TechnicianConversation) => TechnicianConversation,
  ) {
    setConversations((current) =>
      current.map((item) => (item.id === selectedId ? transform(item) : item)),
    )
  }

  function assumeAttendance() {
    if (selected.status !== 'waiting' && selected.status !== 'agent') return
    updateConversation((item) => ({
      ...item,
      status: 'assigned',
      unread: 0,
      preview: 'Você assumiu este atendimento.',
      reply:
        item.id === 'ana'
          ? 'Ótimo! Vou iniciar o acesso remoto, é só aceitar o pedido que vai aparecer na tela!'
          : '',
      messages: [
        ...item.messages,
        {
          id: `${item.id}-assumed-${item.messages.length}`,
          role: 'event',
          text: 'Rafael Lima assumiu · agent pausado',
          time: '10:12',
        },
        {
          id: `${item.id}-greeting-${item.messages.length}`,
          role: 'technician',
          text:
            item.id === 'ana'
              ? 'Oi, Ana! Aqui é o Rafael. Já li o histórico e vou verificar o driver de vídeo remotamente. Pode deixar o notebook ligado agora?'
              : `Olá, ${item.name.split(' ')[0]}! Aqui é o Rafael, do Suporte N2. Vou continuar seu atendimento.`,
          time: '10:12',
        },
        ...(item.id === 'ana'
          ? [
              {
                id: `ana-response-${item.messages.length}`,
                role: 'user' as const,
                text: 'Posso sim, está ligado.',
                time: '10:13',
              },
            ]
          : []),
      ],
    }))
    setNotice('Atendimento assumido nesta prévia. O agent permanece pausado.')
  }

  function returnToAgent() {
    if (selected.status === 'closed') return
    updateConversation((item) => ({
      ...item,
      status: 'agent',
      note: 'Agent atendendo',
      preview: 'Conversa devolvida ao agent.',
      reply: '',
      messages: [
        ...item.messages,
        {
          id: `${item.id}-returned-${item.messages.length}`,
          role: 'event',
          text: 'Rafael Lima devolveu o atendimento ao agent',
          time: '10:14',
        },
      ],
    }))
    setNotice('Conversa devolvida ao agent nesta prévia.')
  }

  function closeAttendance() {
    if (selected.status !== 'assigned') return
    updateConversation((item) => ({
      ...item,
      status: 'closed',
      preview: 'Atendimento encerrado por Rafael Lima.',
      note: 'Resolvida por Rafael Lima',
      reply: '',
      messages: [
        ...item.messages,
        {
          id: `${item.id}-closed-${item.messages.length}`,
          role: 'event',
          text: 'Atendimento encerrado por Rafael Lima',
          time: '10:15',
        },
      ],
    }))
    setNotice(
      'Atendimento encerrado nesta prévia. Nenhum chamado foi alterado no servidor.',
    )
  }

  function sendReply() {
    if (selected.status !== 'assigned' || !selected.reply.trim()) return
    const time = new Date().toLocaleTimeString('pt-BR', {
      timeZone: 'America/Manaus',
      hour: '2-digit',
      minute: '2-digit',
    })
    updateConversation((item) => {
      const message: TechnicianMessage = {
        id: `${item.id}-reply-${item.messages.length}`,
        role: 'technician',
        text: item.reply.trim(),
        time,
      }
      return {
        ...item,
        messages: [...item.messages, message],
        reply: '',
        preview: message.text,
        time,
      }
    })
    setNotice('Mensagem adicionada à demonstração local.')
  }

  return (
    <main className="flex h-svh min-w-0 overflow-hidden bg-white text-[#152033] [&_button]:cursor-pointer [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-2 [&_button:focus-visible]:outline-[#0064c9] [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-2 [&_a:focus-visible]:outline-[#0064c9]">
      <nav
        className="flex w-12 shrink-0 flex-col items-center gap-4 border-r border-[#e3e7ed] bg-[#f7f8fa] py-4 sm:w-14"
        aria-label="Menu do atendente"
      >
        <Link
          href="/admin"
          aria-label="Nexo Assist, console do atendente"
          className="rounded"
        >
          <svg
            className="size-6 text-[#0879f7]"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 20V6a2 2 0 0 1 3.3-1.5L17 13V5a2 2 0 0 1 4 0v15h-4L8 12v8H4Z"
              fill="currentColor"
            />
          </svg>
        </Link>
        <button
          type="button"
          onClick={() => setMobileChatOpen(false)}
          aria-label="Ver conversas"
          className="relative rounded-lg border border-[#e3e7ed] bg-white p-2"
        >
          <ChatIcon name="chat" />
          <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-[#0064c9] text-[8px] text-white">
            {waitingCount}
          </span>
        </button>
        <details className="relative mt-auto">
          <summary
            aria-label="Perfil de Rafael Lima"
            className="relative flex size-8 cursor-pointer list-none items-center justify-center rounded-full bg-[#deefff] text-[10px] font-medium text-[#0064c9] focus-visible:outline-2 focus-visible:outline-[#0064c9] [&::-webkit-details-marker]:hidden"
          >
            RL
            <span
              className="absolute right-0 bottom-0 size-2 rounded-full border border-white bg-emerald-500"
              aria-hidden="true"
            />
          </summary>
          <div className="absolute bottom-0 left-10 z-40 w-48 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
            <p className="text-xs font-medium">Rafael Lima</p>
            <p className="mt-1 text-[10px] text-[#667185]">
              Suporte N2 · Perfil de demonstração
            </p>
            <Link
              href="/"
              className="mt-3 flex items-center gap-2 text-xs text-[#536073]"
            >
              <ChatIcon name="logout" />
              Sair
            </Link>
          </div>
        </details>
      </nav>
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id)
          setMobileChatOpen(true)
          setNotice('')
          setConversations((current) =>
            current.map((item) =>
              item.id === id ? { ...item, unread: 0 } : item,
            ),
          )
        }}
        mobileChatOpen={mobileChatOpen}
      />
      <TechnicianThread
        key={selected.id}
        conversation={selected}
        onAssume={assumeAttendance}
        onReturn={returnToAgent}
        onClose={closeAttendance}
        onSend={sendReply}
        onReplyChange={(reply) =>
          updateConversation((item) => ({ ...item, reply }))
        }
        onShowTickets={() => setTicketVisibility('open')}
        onBack={() => setMobileChatOpen(false)}
        mobileChatOpen={mobileChatOpen}
      />
      <TechnicianTickets
        key={`tickets-${selected.id}`}
        conversation={selected}
        visibility={ticketVisibility}
        onClose={() => setTicketVisibility('closed')}
      />
      <p role="status" className="sr-only">
        {notice}
      </p>
    </main>
  )
}
