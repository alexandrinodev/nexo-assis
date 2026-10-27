'use client'

import { useState } from 'react'
import type {
  ConversationFilter,
  TechnicianConversationListProps,
} from '@/types/technician'
import ChatIcon from '../chat/chat-icon'

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  mobileChatOpen,
}: TechnicianConversationListProps) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<ConversationFilter>('all')
  const filters: { id: ConversationFilter; label: string; count?: number }[] = [
    { id: 'all', label: 'Todas' },
    {
      id: 'waiting',
      label: 'Para você',
      count: conversations.filter((item) => item.status === 'waiting').length,
    },
    {
      id: 'agent',
      label: 'Com o agent',
      count: conversations.filter((item) => item.status === 'agent').length,
    },
    {
      id: 'mine',
      label: 'Minhas',
      count: conversations.filter((item) => item.status === 'assigned').length,
    },
  ]
  const normalize = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
  const visible = conversations.filter((item) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'mine' ? item.status === 'assigned' : item.status === filter)
    return (
      matchesFilter &&
      normalize(`${item.name} ${item.ticketId} ${item.preview}`).includes(
        normalize(query.trim()),
      )
    )
  })

  return (
    <aside
      className={`${mobileChatOpen ? 'hidden md:flex' : 'flex'} min-h-0 min-w-0 flex-1 flex-col border-r border-[#e3e7ed] bg-white md:w-[280px] md:shrink-0 md:flex-none xl:w-[320px]`}
      aria-label="Lista de conversas"
    >
      <div className="px-3 pt-4 pb-2">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h1 className="text-base font-semibold tracking-tight">Conversas</h1>
          <span className="flex items-center gap-1 rounded-full bg-[#eaf9f1] px-2 py-1 text-[10px] font-medium text-[#087349]">
            <span
              className="size-1.5 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            Disponível
          </span>
        </div>
        <div className="relative">
          <ChatIcon
            name="search"
            className="pointer-events-none absolute top-2.5 left-3 size-3.5 text-[#667185]"
          />
          <label htmlFor="conversation-search" className="sr-only">
            Pesquisar conversa ou chamado
          </label>
          <input
            id="conversation-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquisar conversa ou chamado"
            className="h-9 w-full rounded-full bg-[#f5f6f8] pr-3 pl-8 text-[11px] outline-[#0064c9] placeholder:text-[#667185]"
          />
        </div>
        <div
          className="mt-3 flex flex-wrap gap-1"
          role="group"
          aria-label="Filtrar conversas"
        >
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-2 py-1.5 text-[10px] font-medium ${filter === item.id ? 'bg-[#eaf4ff] text-[#0064c9]' : 'bg-[#f5f6f8] text-[#536073] hover:bg-slate-200'}`}
            >
              {item.label}
              {item.count !== undefined && (
                <span className="ml-1">{item.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
        {visible.length === 0 && (
          <p className="px-3 py-10 text-center text-xs text-[#667185]">
            Nenhuma conversa encontrada.
          </p>
        )}
        <ul>
          {visible.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                aria-current={selectedId === item.id ? 'true' : undefined}
                onClick={() => onSelect(item.id)}
                className={`flex w-full gap-2.5 rounded-xl px-2.5 py-3 text-left ${selectedId === item.id ? 'bg-[#f4f6f8]' : 'hover:bg-slate-50'}`}
              >
                <span
                  className={`relative mt-1 flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-medium ${item.avatarClassName}`}
                  aria-hidden="true"
                >
                  {item.initials}
                  {item.status !== 'closed' && (
                    <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-white bg-emerald-500" />
                  )}
                </span>
                <span className="min-w-0 flex-1 border-b border-[#edf0f4] pb-2">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-medium">
                      {item.name}
                    </span>
                    <span
                      className={`shrink-0 text-[10px] ${item.unread ? 'text-[#0064c9]' : 'text-[#667185]'}`}
                    >
                      {item.time}
                    </span>
                  </span>
                  <span className="mt-0.5 flex items-center gap-2">
                    <span className="truncate text-[11px] text-[#667185]">
                      {item.preview}
                    </span>
                    {item.unread > 0 && (
                      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-[#0064c9] text-[9px] text-white">
                        {item.unread}
                        <span className="sr-only"> mensagens não lidas</span>
                      </span>
                    )}
                  </span>
                  <span
                    className={`mt-1 flex items-center gap-1 text-[9px] ${item.status === 'waiting' ? (item.id === 'bruno' ? 'text-[#946000]' : 'text-[#c63544]') : item.status === 'assigned' ? 'text-[#087349]' : 'text-[#667185]'}`}
                  >
                    <span
                      className={`size-1 shrink-0 rounded-full ${item.status === 'waiting' ? (item.id === 'bruno' ? 'bg-amber-500' : 'bg-[#e94c5b]') : item.status === 'closed' ? 'bg-slate-400' : 'bg-emerald-500'}`}
                      aria-hidden="true"
                    />
                    {item.status === 'assigned'
                      ? 'Você está atendendo'
                      : item.note}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
