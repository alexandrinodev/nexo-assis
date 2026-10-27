'use client'

import { useState } from 'react'
import type { TechnicianTicketsProps } from '@/types/technician'
import ChatIcon from '../chat/chat-icon'

export default function TechnicianTickets({
  conversation,
  visibility,
  onClose,
}: TechnicianTicketsProps) {
  const [selectedId, setSelectedId] = useState(conversation.ticketId)
  const [showAll, setShowAll] = useState(false)
  const ticket =
    conversation.tickets.find((item) => item.id === selectedId) ??
    conversation.tickets[0]
  const isCurrent = ticket?.id === conversation.ticketId
  const assigned = isCurrent && conversation.status === 'assigned'
  const closed = isCurrent
    ? conversation.status === 'closed'
    : ticket?.status === 'resolved'
  const label = closed
    ? 'Resolvido'
    : assigned
      ? 'Em atendimento'
      : ticket?.status === 'waiting'
        ? 'Aguardando analista'
        : ticket?.status === 'approved'
          ? 'Aprovado'
          : 'Em andamento'
  const openCount = conversation.tickets.filter(
    (item) =>
      item.status !== 'resolved' &&
      !(item.id === conversation.ticketId && conversation.status === 'closed'),
  ).length
  const resolvedCount = conversation.tickets.length - openCount

  return (
    <aside
      className={`${visibility === 'closed' ? 'hidden' : visibility === 'open' ? 'fixed inset-y-0 right-0 z-30 flex w-[min(320px,100vw)] shadow-xl xl:static xl:shadow-none' : 'hidden xl:flex'} min-h-0 shrink-0 flex-col border-l border-[#e3e7ed] bg-white xl:w-[290px] 2xl:w-[310px]`}
      aria-label="Chamados do cliente"
    >
      <header className="flex min-h-16 shrink-0 items-center justify-between gap-2 border-b border-[#e3e7ed] px-4 py-3">
        <div>
          <h2 className="text-xs font-semibold">
            Chamados{' '}
            {conversation.id === 'ana'
              ? 'da Ana'
              : `de ${conversation.name.split(' ')[0]}`}
          </h2>
          <p className="mt-0.5 text-[10px] text-[#667185]">
            {openCount} abertos · {resolvedCount} encerrados
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar painel de chamados"
          className="rounded p-1 text-[#536073]"
        >
          <ChatIcon name="close" className="size-3.5" />
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <p className="mb-2 text-[10px] text-[#536073]">
          {isCurrent ? 'Desta conversa' : 'Chamado selecionado'}
        </p>
        {ticket && (
          <article
            className="rounded-xl bg-[#f5f6f8] p-3.5"
            aria-label={`Detalhes do chamado ${ticket.id}`}
          >
            <div className="mb-1 flex flex-wrap items-center justify-between gap-1 text-[9px]">
              <span className="text-[#667185]">{ticket.id}</span>
              <span
                className={`inline-flex items-center gap-1 ${closed ? 'text-[#536073]' : assigned || ticket.status === 'active' ? 'text-[#0064c9]' : ticket.status === 'approved' ? 'text-[#087349]' : 'text-[#946000]'}`}
              >
                <span
                  className="size-1.5 rounded-full bg-current"
                  aria-hidden="true"
                />
                {label}
              </span>
            </div>
            <h3 className="text-xs font-medium leading-relaxed">
              {ticket.title}
            </h3>
            <p className="mt-1 text-[10px] text-[#667185]">{ticket.category}</p>
            <p className="mt-3 flex items-center gap-1.5 border-t border-[#e3e7ed] pt-3 text-[9px] text-[#536073]">
              <ChatIcon
                name={assigned ? 'headset' : 'transfer'}
                className="size-3 shrink-0"
              />
              <span>
                {closed
                  ? 'Atendimento concluído'
                  : assigned
                    ? 'Assumido por Rafael Lima'
                    : ticket.detail}
              </span>
              <span className="ml-auto shrink-0">
                {assigned ? '10:12' : '10:05'}
              </span>
            </p>
          </article>
        )}
        <p className="mt-7 mb-2 text-[10px] text-[#536073]">
          {showAll ? 'Todos os chamados' : 'Outros chamados'}
        </p>
        <ul>
          {conversation.tickets
            .filter((item) => showAll || item.id !== ticket?.id)
            .map((item) => (
              <li
                key={item.id}
                className="border-b border-[#edf0f4] last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  aria-pressed={selectedId === item.id}
                  className="flex w-full items-center gap-2 py-3 text-left hover:bg-slate-50"
                >
                  <span
                    className={`size-1.5 shrink-0 rounded-full ${item.status === 'resolved' ? 'bg-slate-400' : item.status === 'approved' ? 'bg-emerald-500' : 'bg-[#0879f7]'}`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] leading-relaxed">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[9px] text-[#667185]">
                      {item.id} ·{' '}
                      {item.id === conversation.ticketId &&
                      conversation.status === 'closed'
                        ? 'Resolvido'
                        : item.detail === 'Transferido para um analista'
                          ? 'Em acompanhamento'
                          : item.detail}
                    </span>
                  </span>
                  <ChatIcon
                    name="chevron"
                    className="size-3 shrink-0 text-[#667185]"
                  />
                </button>
              </li>
            ))}
        </ul>
      </div>
      <div className="shrink-0 px-3 pt-2 pb-3">
        <button
          type="button"
          onClick={() => setShowAll((value) => !value)}
          aria-expanded={showAll}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-[#dce3eb] px-2 py-2.5 text-[10px] hover:bg-slate-50"
        >
          {showAll
            ? 'Mostrar apenas outros chamados'
            : `Ver todos os chamados ${conversation.id === 'ana' ? 'da Ana' : `de ${conversation.name.split(' ')[0]}`}`}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
    </aside>
  )
}
