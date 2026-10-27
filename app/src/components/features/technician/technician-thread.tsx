'use client'

import { useEffect, useRef, useState } from 'react'
import type { TechnicianThreadProps } from '@/types/technician'
import ChatIcon from '../chat/chat-icon'

export default function TechnicianThread({
  conversation,
  onAssume,
  onReturn,
  onClose,
  onSend,
  onReplyChange,
  onShowTickets,
  onBack,
  mobileChatOpen,
}: TechnicianThreadProps) {
  const scrollArea = useRef<HTMLDivElement>(null)
  const composer = useRef<HTMLTextAreaElement>(null)
  const [confirmClose, setConfirmClose] = useState(false)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const assigned = conversation.status === 'assigned'
  const waiting = conversation.status === 'waiting'
  const disabled = !assigned

  useEffect(() => {
    const area = scrollArea.current
    if (area) area.scrollTop = area.scrollHeight
  }, [conversation.id, conversation.messages.length])

  return (
    <section
      className={`${mobileChatOpen ? 'flex' : 'hidden md:flex'} min-h-0 min-w-0 flex-1 flex-col bg-[#edf1f5]`}
      aria-label={`Conversa com ${conversation.name}`}
    >
      <header className="flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#e3e7ed] bg-white px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded p-1 md:hidden"
            aria-label="Voltar para as conversas"
          >
            <ChatIcon name="back" />
          </button>
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-medium ${conversation.avatarClassName}`}
            aria-hidden="true"
          >
            {conversation.initials}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-xs font-semibold">
              {conversation.name}
            </h2>
            <p className="mt-0.5 text-[10px] text-[#667185]">
              online · {conversation.department}
              <span className="hidden 2xl:inline">
                {' '}
                · {conversation.ticketId}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {assigned ? (
            <>
              <button
                type="button"
                onClick={onReturn}
                className="hidden items-center gap-1.5 rounded-md border border-[#e3e7ed] bg-white px-2.5 py-2 text-[10px] hover:bg-slate-50 min-[1100px]:flex"
              >
                <ChatIcon name="robot" className="size-3" />
                Devolver ao agent
              </button>
              <button
                type="button"
                onClick={() => setConfirmClose(true)}
                className="flex items-center gap-1.5 rounded-md bg-[#fff0f1] px-2.5 py-2 text-[10px] font-medium text-[#c52939]"
              >
                <ChatIcon name="check" className="size-3" />
                Encerrar atendimento
              </button>
            </>
          ) : (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-medium ${waiting ? 'bg-[#fff6e6] text-[#946000]' : conversation.status === 'closed' ? 'bg-slate-100 text-[#536073]' : 'bg-[#eaf9f1] text-[#087349]'}`}
            >
              <ChatIcon
                name={waiting ? 'briefcase' : 'robot'}
                className="size-3"
              />
              {waiting
                ? 'Aguardando atendente'
                : conversation.status === 'closed'
                  ? 'Atendimento encerrado'
                  : 'Agent atendendo'}
            </span>
          )}
          <button
            type="button"
            onClick={() => setSearchOpen((value) => !value)}
            aria-label="Buscar na conversa"
            aria-expanded={searchOpen}
            className="rounded p-1.5 text-[#536073]"
          >
            <ChatIcon name="search" className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onShowTickets}
            aria-label="Mostrar chamados do cliente"
            className="rounded p-1.5 text-[#536073]"
          >
            <ChatIcon name="briefcase" className="size-3.5" />
          </button>
          <details className="relative">
            <summary
              aria-label="Mais ações da conversa"
              className="cursor-pointer list-none rounded p-1.5 focus-visible:outline-2 focus-visible:outline-[#0064c9] [&::-webkit-details-marker]:hidden"
            >
              <ChatIcon name="more" className="size-3.5" />
            </summary>
            <div className="absolute top-full right-0 z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
              <button
                type="button"
                onClick={onShowTickets}
                className="w-full rounded px-2 py-2 text-left text-xs hover:bg-slate-50"
              >
                Ver chamados do cliente
              </button>
              {assigned && (
                <button
                  type="button"
                  onClick={onReturn}
                  className="w-full rounded px-2 py-2 text-left text-xs hover:bg-slate-50"
                >
                  Devolver ao agent
                </button>
              )}
              <p className="px-2 py-2 text-[10px] text-[#667185]">
                Prévia local · sem envio ao servidor
              </p>
            </div>
          </details>
        </div>
      </header>
      {searchOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-2">
          <label className="sr-only" htmlFor="thread-search">
            Buscar mensagem
          </label>
          <input
            id="thread-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar mensagem nesta conversa"
            className="w-full rounded-md border border-slate-400 px-3 py-2 text-xs outline-[#0064c9]"
          />
        </div>
      )}
      {confirmClose && (
        <div
          className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-200 bg-rose-50 px-4 py-3 text-xs"
          role="alert"
        >
          <p>Encerrar o atendimento de {conversation.name}?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onClose()
                setConfirmClose(false)
              }}
              className="rounded bg-[#c52939] px-3 py-2 font-medium text-white"
            >
              Confirmar encerramento
            </button>
            <button
              type="button"
              onClick={() => setConfirmClose(false)}
              className="rounded border border-slate-300 bg-white px-3 py-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      <div
        ref={scrollArea}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6"
        tabIndex={0}
        aria-label="Histórico do atendimento"
      >
        <div className="mx-auto flex min-h-full max-w-[760px] flex-col justify-end gap-3">
          <span className="mx-auto mb-1 rounded-full bg-white px-2 py-1 text-[9px] text-[#667185]">
            Hoje
          </span>
          <div
            role="log"
            aria-label="Mensagens do atendimento"
            aria-live="polite"
            aria-relevant="additions"
            className="space-y-3"
          >
            {conversation.messages
              .filter(
                (message) =>
                  !query ||
                  message.text.toLowerCase().includes(query.toLowerCase()),
              )
              .map((message) =>
                message.role === 'event' ? (
                  <p
                    key={message.id}
                    className="flex items-center gap-2 py-1 text-center text-[9px] text-[#667185] before:h-px before:flex-1 before:bg-[#dce3eb] after:h-px after:flex-1 after:bg-[#dce3eb]"
                  >
                    <ChatIcon name="transfer" className="size-3 shrink-0" />
                    {message.text} · {message.time}
                  </p>
                ) : (
                  <div
                    key={message.id}
                    className={`max-w-[92%] sm:max-w-[82%] ${message.role !== 'user' ? 'ml-auto' : ''}`}
                  >
                    {message.role !== 'user' && (
                      <p className="mb-1 text-right text-[9px] text-[#536073]">
                        {message.role === 'agent'
                          ? 'Nexo Assist'
                          : 'Rafael Lima'}
                        <span
                          className={`ml-2 rounded px-1 text-[8px] ${message.role === 'agent' ? 'bg-[#dcecff] text-[#0064c9]' : 'bg-[#d8f1e5] text-[#087349]'}`}
                        >
                          {message.role === 'agent' ? 'IA' : 'Suporte N2'}
                        </span>
                      </p>
                    )}
                    <div
                      className={`w-fit rounded-xl px-3 py-2.5 text-[11px] leading-relaxed ${message.role === 'user' ? 'rounded-bl-sm bg-white' : message.role === 'agent' ? 'ml-auto rounded-br-sm border border-[#dce7f5] bg-[#e5effb]' : 'ml-auto rounded-br-sm border border-[#d9ecdf] bg-[#e2f3e9]'}`}
                    >
                      <span className="sr-only">
                        {message.role === 'user'
                          ? conversation.name
                          : message.role === 'agent'
                            ? 'Nexo Assist'
                            : 'Rafael Lima'}
                        :{' '}
                      </span>
                      {message.text}
                      <span
                        className={`ml-2 whitespace-nowrap text-[9px] text-[#667185] ${message.role === 'user' ? '' : 'mt-1 block text-right'}`}
                      >
                        {message.time}
                        {message.role !== 'user' && (
                          <span
                            className="ml-1 text-[#0879f7]"
                            aria-label="Mensagem entregue"
                          >
                            ✓✓
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                ),
              )}
            {query &&
              !conversation.messages.some((message) =>
                message.text.toLowerCase().includes(query.toLowerCase()),
              ) && (
                <p className="py-5 text-center text-xs text-[#667185]">
                  Nenhuma mensagem encontrada.
                </p>
              )}
          </div>
        </div>
      </div>
      <footer className="shrink-0 border-t border-[#e3e7ed] bg-white px-4 pt-2.5 pb-3">
        {!assigned && (
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-full bg-[#fff6e6] text-[#946000]">
                <ChatIcon
                  name={waiting ? 'hand' : 'robot'}
                  className="size-4"
                />
              </span>
              <div>
                <p className="text-[11px] font-medium">
                  {waiting
                    ? `${conversation.name.split(' ')[0]} espera um atendente`
                    : conversation.status === 'closed'
                      ? 'Atendimento encerrado'
                      : 'O agent está atendendo'}
                </p>
                <p className="text-[10px] text-[#667185]">
                  {waiting
                    ? 'Agent pausado · até 12:05'
                    : conversation.status === 'closed'
                      ? 'Histórico disponível para consulta'
                      : 'Você pode assumir a conversa'}
                </p>
              </div>
            </div>
            {conversation.status !== 'closed' && (
              <div className="flex gap-2">
                {waiting && (
                  <button
                    type="button"
                    onClick={onReturn}
                    className="flex items-center gap-1.5 rounded-md border border-[#dce3eb] px-2.5 py-2 text-[10px] hover:bg-slate-50"
                  >
                    <ChatIcon name="robot" className="size-3" />
                    Devolver ao agent
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onAssume()
                    requestAnimationFrame(() => composer.current?.focus())
                  }}
                  className="flex items-center gap-1.5 rounded-md bg-[#0064c9] px-3 py-2 text-[10px] font-medium text-white hover:bg-[#0054ad]"
                >
                  <ChatIcon name="headset" className="size-3.5" />
                  Assumir atendimento
                </button>
              </div>
            )}
          </div>
        )}
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSend()
          }}
          className="flex items-end gap-2"
        >
          <label className="sr-only" htmlFor="technician-reply">
            Mensagem para {conversation.name}
          </label>
          <textarea
            ref={composer}
            id="technician-reply"
            rows={1}
            value={conversation.reply}
            onChange={(event) => onReplyChange(event.target.value)}
            disabled={disabled}
            maxLength={4000}
            placeholder={
              waiting
                ? 'Assuma o atendimento para responder'
                : disabled
                  ? 'Envio de mensagens indisponível'
                  : 'Escreva sua mensagem...'
            }
            onKeyDown={(event) => {
              if (
                event.key === 'Enter' &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }}
            className="max-h-32 min-h-10 flex-1 resize-none rounded-xl bg-[#f5f6f8] px-3 py-3 text-[11px] leading-relaxed outline-[#0064c9] placeholder:text-[#667185] disabled:cursor-not-allowed disabled:opacity-70"
          />
          {assigned && (
            <button
              type="submit"
              disabled={!conversation.reply.trim()}
              aria-label="Enviar mensagem"
              className="mb-1 flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0064c9] text-white hover:bg-[#0054ad] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChatIcon name="send" className="size-5" />
            </button>
          )}
        </form>
      </footer>
    </section>
  )
}
