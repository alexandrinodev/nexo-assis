import Link from 'next/link'
import ChatConversation from './chat-conversation'
import ChatIcon from './chat-icon'

export default function UserChatScreen() {
  return (
    <main className="flex h-svh flex-col overflow-hidden bg-white text-[#152033] md:flex-row [&_button]:cursor-pointer [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-[#0064c9] [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-[#0064c9]">
      <aside
        className="flex shrink-0 flex-row items-center gap-4 border-b border-[#e5e9ef] px-4 py-3 md:w-[16%] md:min-w-[172px] md:flex-col md:items-stretch md:gap-0 md:border-r md:border-b-0 md:px-3 md:py-5"
        aria-label="Menu principal"
      >
        <Link
          href="/chat"
          className="flex shrink-0 items-center gap-2 text-sm font-semibold tracking-tight md:mb-6 md:px-2"
          aria-label="Nexo Assist, atendimento"
        >
          <svg
            className="size-5 text-[#0879f7]"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 20V6a2 2 0 0 1 3.3-1.5L17 13V5a2 2 0 0 1 4 0v15h-4L8 12v8H4Z"
              fill="currentColor"
            />
          </svg>
          Nexo Assist
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-xs md:ml-0 md:block">
          <Link
            href="/chat"
            aria-current="page"
            className="flex items-center gap-2 rounded-lg bg-[#edf6ff] px-3 py-2.5 font-medium text-[#0064c9]"
          >
            <ChatIcon name="chat" />
            <span className="hidden sm:inline">Atendimento</span>
            <span className="sr-only sm:hidden">Atendimento</span>
          </Link>
          <details className="relative md:mt-1">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2.5 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0064c9] [&::-webkit-details-marker]:hidden">
              <ChatIcon name="user" />
              <span className="hidden sm:inline">Meu perfil</span>
              <span className="sr-only sm:hidden">Meu perfil</span>
            </summary>
            <div className="absolute top-full right-0 z-20 mt-2 w-56 rounded-xl border border-[#e5e9ef] bg-white p-4 text-xs leading-relaxed shadow-lg md:left-0">
              <p className="font-semibold">Ana Souza</p>
              <p className="break-all text-[#596579]">ana.souza@nexo.com.br</p>
              <p className="mt-2 text-[#596579]">
                Perfil de demonstração · Colaboradora
              </p>
            </div>
          </details>
        </nav>
        <div className="hidden border-t border-[#e5e9ef] pt-3 md:mt-auto md:block">
          <div className="flex items-center gap-2 px-2">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#edf6ff] text-xs font-semibold text-[#0064c9]"
              aria-hidden="true"
            >
              AS
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium">Ana Souza</p>
              <p className="truncate text-[10px] text-[#596579]">
                ana.souza@nexo.com.br
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="mt-2 flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-[#596579] hover:bg-slate-50"
          >
            <ChatIcon name="logout" /> Sair
          </Link>
        </div>
        <Link
          href="/"
          className="rounded p-1 text-[#596579] md:hidden"
          aria-label="Sair"
        >
          <ChatIcon name="logout" />
        </Link>
      </aside>

      <section
        className="flex min-h-0 min-w-0 flex-1 flex-col"
        aria-labelledby="chat-title"
      >
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#e5e9ef] px-4 sm:px-7">
          <div className="flex items-center gap-2 text-xs">
            <span className="hidden text-[#596579] sm:inline">
              Service desk de TI
            </span>
            <span className="hidden text-[#596579] sm:inline">
              <ChatIcon name="chevron" className="size-3" />
            </span>
            <h1 id="chat-title" className="font-medium">
              Atendimento
            </h1>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ecfaf3] px-2.5 py-1 text-[10px] font-medium text-[#087349]">
            <span
              className="size-1.5 rounded-full bg-[#10b981]"
              aria-hidden="true"
            />
            Assistente online
          </span>
        </header>
        <ChatConversation />
      </section>
    </main>
  )
}
