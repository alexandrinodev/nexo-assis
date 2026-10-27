'use client'

import { useRef, useState, type FormEvent } from 'react'
import type {
  AffectedAudience,
  ChatMessage,
  DraftStatus,
  TicketDraft,
} from '@/types/chat'
import ChatIcon from './chat-icon'

const audiences: AffectedAudience[] = [
  'Só eu',
  'Minha equipe',
  'Toda a empresa',
  'Não sei',
]
const initialDraft: TicketDraft = {
  title: 'VPN não conecta no notebook — erro 809',
  description:
    'Desde 20/10 o notebook (Windows 11) não conecta na VPN e mostra o erro 809. Precisa dela para a reunião das 14h.',
  category: 'Rede e VPN',
  priority: 'Alta',
}
const affectedLabels: Record<AffectedAudience, string> = {
  'Só eu': 'Somente você',
  'Minha equipe': 'Sua equipe',
  'Toda a empresa': 'Toda a empresa',
  'Não sei': 'A confirmar',
}
const actionClassName =
  'inline-flex min-h-8 items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium'

export default function ChatConversation() {
  const [affected, setAffected] = useState<AffectedAudience>('Só eu')
  const [draft, setDraft] = useState<TicketDraft>(initialDraft)
  const [editingDraft, setEditingDraft] = useState<TicketDraft>(initialDraft)
  const [draftStatus, setDraftStatus] = useState<DraftStatus>('pending')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [notice, setNotice] = useState('')
  const scrollArea = useRef<HTMLDivElement>(null)
  const messageCount =
    18 + messages.filter((item) => item.role === 'user').length
  const limitReached = messageCount >= 30

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = message.trim()
    if (!content || limitReached) return
    setMessages((current) => [
      ...current,
      { id: current.length + 1, role: 'user', content },
      {
        id: current.length + 2,
        role: 'assistant',
        content:
          'Mensagem adicionada à prévia. As respostas do assistente estarão disponíveis quando o serviço de atendimento for conectado.',
      },
    ])
    setMessage('')
    requestAnimationFrame(() => {
      if (scrollArea.current)
        scrollArea.current.scrollTop = scrollArea.current.scrollHeight
    })
  }

  function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editingDraft.title.trim() || !editingDraft.description.trim()) return
    setDraft({
      ...editingDraft,
      title: editingDraft.title.trim(),
      description: editingDraft.description.trim(),
    })
    setDraftStatus('pending')
    setNotice('Rascunho atualizado. Confira as alterações antes de confirmar.')
  }

  return (
    <>
      <div
        ref={scrollArea}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        tabIndex={0}
        aria-label="Histórico da conversa"
      >
        <div className="mx-auto w-full max-w-[768px] px-4 pt-8 pb-5 sm:px-6 sm:pt-16 lg:pt-20">
          <p className="ml-auto max-w-[88%] rounded-xl rounded-br-sm bg-[#1b2430] px-3.5 py-3 text-xs leading-relaxed text-white sm:max-w-[65%]">
            Meu notebook não conecta na VPN desde ontem. Aparece o erro 809.
          </p>

          <div className="mt-4 max-w-full sm:max-w-[75%]">
            <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#596579]">
              <span className="font-medium text-[#152033]">Nexo Assist</span>
              <span className="inline-flex items-center gap-1">
                <ChatIcon name="check" className="size-3" />
                consultou seus chamados
              </span>
              <span className="inline-flex items-center gap-1">
                <ChatIcon name="check" className="size-3" />
                buscou na central de ajuda
              </span>
            </div>
            <div className="rounded-xl rounded-tl-sm border border-[#e5e9ef] px-3.5 py-3 text-xs leading-relaxed">
              <p>
                Não há chamado aberto sobre VPN, e o artigo do erro 809 vale só
                para Windows 10 — o seu é Windows 11. Vou abrir um chamado.
              </p>
              <fieldset className="mt-2">
                <legend className="font-medium">
                  Quem está sendo afetado?
                </legend>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {audiences.map((audience) => (
                    <label
                      key={audience}
                      className={`cursor-pointer rounded-md border px-2.5 py-1.5 text-[11px] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-[#0064c9] ${affected === audience ? 'border-[#0075f5] bg-[#edf6ff] text-[#0064c9]' : 'border-[#e5e9ef] bg-white hover:bg-slate-50'}`}
                    >
                      <input
                        className="sr-only"
                        type="radio"
                        name="affected"
                        value={audience}
                        checked={affected === audience}
                        disabled={
                          draftStatus === 'confirmed' ||
                          draftStatus === 'cancelled'
                        }
                        onChange={() => setAffected(audience)}
                      />
                      {audience}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>

          <p className="mt-4 ml-auto max-w-[88%] rounded-xl rounded-br-sm bg-[#1b2430] px-3.5 py-3 text-xs leading-relaxed text-white sm:max-w-[65%]">
            Só eu. Tenho reunião com um cliente às 14h e preciso da VPN
            funcionando.
          </p>

          <div className="mt-4 max-w-full sm:max-w-[75%]">
            <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#596579]">
              <span className="font-medium text-[#152033]">Nexo Assist</span>
              {[
                'classificou a prioridade',
                'consultou o SLA',
                'montou o rascunho',
              ].map((action) => (
                <span key={action} className="inline-flex items-center gap-1">
                  <ChatIcon name="check" className="size-3" />
                  {action}
                </span>
              ))}
            </div>
            <p className="rounded-xl rounded-tl-sm border border-[#e5e9ef] px-3.5 py-3 text-xs leading-relaxed">
              Coloquei prioridade alta por causa da reunião — a resposta chega
              antes das 14h. Confira antes de eu criar:
            </p>
          </div>

          <article
            className="mt-1.5 overflow-hidden rounded-2xl border border-[#e5e9ef] shadow-[0_2px_5px_#15203308]"
            aria-labelledby="draft-title"
          >
            <div className="p-3.5">
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                <span className="text-[#596579]">
                  Novo chamado <span className="mx-1">·</span> Rascunho D-381
                </span>
                <span
                  className={
                    draftStatus === 'confirmed'
                      ? 'text-[#087349]'
                      : 'text-[#946000]'
                  }
                >
                  ●{' '}
                  {draftStatus === 'confirmed'
                    ? 'Confirmado nesta prévia'
                    : draftStatus === 'cancelled'
                      ? 'Rascunho cancelado'
                      : 'Aguardando confirmação'}
                </span>
              </div>
              <h2
                id="draft-title"
                className="text-base font-medium tracking-[-0.3px]"
              >
                {draft.title}
              </h2>
              <p className="mt-1 text-[11px] leading-relaxed text-[#47556b]">
                {draft.description}
              </p>
              <dl className="mt-3 grid grid-cols-1 gap-3 border-t border-[#edf0f4] pt-3 text-xs min-[480px]:grid-cols-3">
                <div>
                  <dt className="mb-1 text-[10px] text-[#596579]">Categoria</dt>
                  <dd className="font-medium">{draft.category}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-[10px] text-[#596579]">
                    Prioridade
                  </dt>
                  <dd>
                    <span className="text-[#946000]" aria-hidden="true">
                      ●{' '}
                    </span>
                    {draft.priority}
                    <span className="text-[10px] text-[#596579]">
                      {' '}
                      ·{' '}
                      {draft.priority === 'Alta'
                        ? 'resposta até 13:43'
                        : 'prazo a confirmar'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="mb-1 text-[10px] text-[#596579]">Afetados</dt>
                  <dd className="font-medium">{affectedLabels[affected]}</dd>
                </div>
              </dl>
            </div>

            {draftStatus === 'editing' ? (
              <form
                onSubmit={saveDraft}
                className="space-y-3 border-t border-[#e5e9ef] bg-[#f7f8fa] p-3.5"
              >
                <label className="block text-xs">
                  Título
                  <input
                    className="mt-1 block w-full rounded-md border border-slate-400 bg-white px-3 py-2 outline-[#0064c9]"
                    value={editingDraft.title}
                    onChange={(event) =>
                      setEditingDraft({
                        ...editingDraft,
                        title: event.target.value,
                      })
                    }
                    required
                    maxLength={160}
                  />
                </label>
                <label className="block text-xs">
                  Descrição
                  <textarea
                    className="mt-1 block min-h-20 w-full rounded-md border border-slate-400 bg-white px-3 py-2 outline-[#0064c9]"
                    value={editingDraft.description}
                    onChange={(event) =>
                      setEditingDraft({
                        ...editingDraft,
                        description: event.target.value,
                      })
                    }
                    required
                    maxLength={2000}
                  />
                </label>
                <label className="block text-xs">
                  Prioridade
                  <select
                    className="mt-1 block rounded-md border border-slate-400 bg-white px-3 py-2 outline-[#0064c9]"
                    value={editingDraft.priority}
                    onChange={(event) => {
                      const value = event.target.value
                      if (
                        value === 'Baixa' ||
                        value === 'Média' ||
                        value === 'Alta'
                      )
                        setEditingDraft({ ...editingDraft, priority: value })
                    }}
                  >
                    <option>Baixa</option>
                    <option>Média</option>
                    <option>Alta</option>
                  </select>
                </label>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className={`${actionClassName} bg-[#0064c9] text-white hover:bg-[#0054ad]`}
                  >
                    Salvar alterações
                  </button>
                  <button
                    type="button"
                    className={`${actionClassName} border border-[#dce2ea] bg-white`}
                    onClick={() => setDraftStatus('pending')}
                  >
                    Voltar
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-wrap items-center gap-1.5 border-t border-[#edf0f4] bg-[#f6f7f9] p-2">
                {draftStatus === 'pending' ? (
                  <>
                    <button
                      type="button"
                      className={`${actionClassName} gap-2 bg-[#0064c9] text-white hover:bg-[#0054ad]`}
                      onClick={() => {
                        setDraftStatus('confirmed')
                        setNotice(
                          'Rascunho confirmado nesta prévia. Nenhum chamado foi enviado ao servidor.',
                        )
                      }}
                    >
                      Confirmar
                      <ChatIcon name="check" className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      className={`${actionClassName} border border-[#dce2ea] bg-white hover:bg-slate-50`}
                      onClick={() => {
                        setEditingDraft(draft)
                        setDraftStatus('editing')
                        setNotice('')
                      }}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className={`${actionClassName} hover:bg-slate-200`}
                      onClick={() => {
                        setDraftStatus('cancelled')
                        setNotice(
                          'Rascunho cancelado. Nenhum chamado foi criado.',
                        )
                      }}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <p className="px-1.5 py-1 text-xs text-[#596579]">
                    {draftStatus === 'confirmed'
                      ? 'Confirmação registrada apenas na demonstração.'
                      : 'Você pode continuar a conversa abaixo.'}
                  </p>
                )}
              </div>
            )}
          </article>

          <p
            role="status"
            className="mt-2 text-xs leading-relaxed text-[#596579] empty:hidden"
          >
            {notice}
          </p>
          <div
            role="log"
            aria-label="Novas mensagens"
            aria-live="polite"
            aria-relevant="additions"
            className="space-y-4"
          >
            {messages.map((item) => (
              <div
                key={item.id}
                className={`mt-4 max-w-[88%] rounded-xl px-3.5 py-3 text-xs leading-relaxed whitespace-pre-wrap break-words sm:max-w-[75%] ${item.role === 'user' ? 'ml-auto rounded-br-sm bg-[#1b2430] text-white' : 'rounded-tl-sm border border-[#e5e9ef] text-[#47556b]'}`}
              >
                <span className="sr-only">
                  {item.role === 'user' ? 'Você' : 'Nexo Assist'}:{' '}
                </span>
                {item.content}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[768px] shrink-0 bg-white px-4 pt-1 pb-3 sm:px-6">
        <form
          onSubmit={sendMessage}
          className="flex items-end gap-2 rounded-xl border border-[#8591a0] p-1.5 focus-within:border-[#0064c9] focus-within:ring-2 focus-within:ring-[#0064c9]/15"
        >
          <label htmlFor="chat-message" className="sr-only">
            Mensagem para o Nexo
          </label>
          <textarea
            id="chat-message"
            rows={1}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={2000}
            disabled={limitReached}
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
            placeholder="Escreva para o Nexo..."
            className="max-h-32 min-h-8 flex-1 resize-none bg-transparent px-2 py-2 text-xs outline-none placeholder:text-[#596579] disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!message.trim() || limitReached}
            className="flex min-h-8 shrink-0 items-center gap-1.5 rounded-md bg-[#0064c9] px-3 py-2 text-xs font-medium text-white hover:bg-[#0054ad] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ChatIcon name="arrow" className="size-3.5" />
            Enviar
          </button>
        </form>
        <p className="mt-1.5 text-right text-[10px] text-[#596579]">
          {messageCount}/30 mensagens nesta sessão
          {limitReached && ' · Limite atingido nesta prévia'}
        </p>
      </div>
    </>
  )
}
