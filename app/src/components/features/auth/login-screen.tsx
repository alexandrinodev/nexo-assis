import Link from 'next/link'
import LoginForm from './login-form'

export default function LoginScreen() {
  return (
    <main className="grid min-h-svh grid-cols-1 bg-white min-[900px]:grid-cols-[5fr_4fr]">
      <section
        className="flex flex-col bg-[#1B2430] px-6 py-8 text-white sm:px-11 min-[900px]:min-h-svh min-[900px]:px-[clamp(44px,4.45vw,80px)] min-[900px]:py-10"
        aria-labelledby="intro-title"
      >
        <Link
          href="/"
          aria-label="Nexo Assist, início"
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold tracking-tight outline-offset-4 focus-visible:outline-2 focus-visible:outline-white"
        >
          <svg
            className="size-5"
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

        <div className="my-auto w-full pt-16 pb-14 min-[900px]:pt-20 min-[900px]:pb-16">
          <p className="mb-3 text-xs text-[#b7bec8]">
            Service desk de TI da Nexo
          </p>
          <h1
            id="intro-title"
            className="max-w-[650px] font-[Georgia,serif] text-[clamp(34px,3.55vw,56px)] leading-[1.08] font-normal tracking-[-1.5px]"
          >
            Seu problema de TI, resolvido em uma conversa.
          </h1>
          <p className="mt-6 max-w-[450px] text-sm leading-[1.75] text-[#b7bec8]">
            Descreva o que está acontecendo. O assistente consulta seus
            chamados, busca na central de ajuda e chama um analista quando
            precisa.
          </p>

          <figure className="mx-auto mt-8 w-full max-w-[440px] sm:w-[80%] rounded-2xl border border-white/[0.06] bg-[#232d39] p-4 text-[11px] leading-relaxed min-[1200px]:mt-9">
            <figcaption className="sr-only">
              Exemplo ilustrativo de conversa e abertura de chamado
            </figcaption>
            <p className="ml-auto w-fit max-w-[90%] rounded-xl rounded-br-sm bg-white px-3 py-2 text-[#1b2430]">
              Meu notebook não conecta na VPN. Erro 809.
            </p>
            <p className="mt-2 text-[#b5bdc8]">
              <span className="font-medium text-white">Nexo Assist</span>{' '}
              consultou seus chamados · criou um chamado
            </p>
            <p className="mt-1 w-fit max-w-[86%] rounded-xl rounded-tl-sm bg-[#37414e] px-3 py-2 text-[#f3f4f6]">
              Pronto: abri o chamado com prioridade alta. Um analista fala com
              você em até 4 h úteis.
            </p>
            <div className="mt-1.5 inline-flex max-w-full flex-wrap items-center gap-x-1.5 gap-y-1 rounded-xl bg-white px-2.5 py-1 text-[10px] text-[#536073]">
              <span
                className="size-1.5 rounded-full bg-amber-500"
                aria-hidden="true"
              />
              <span className="font-semibold text-[#1b2430]">INC-20517</span>
              <span>Rede e VPN · Alta · em até 4 h</span>
            </div>
          </figure>
        </div>

        <dl
          className="grid grid-cols-3 [&>div]:flex [&>div]:flex-col [&_dd]:order-first border-t border-white/10 pt-5 [&>div+div]:border-l [&>div+div]:border-white/10 [&>div+div]:pl-4"
          aria-label="Indicadores ilustrativos de atendimento"
        >
          <div>
            <dt className="mt-1 text-[10px] leading-relaxed text-[#b7bec8]">
              primeira resposta, em média
            </dt>
            <dd className="font-[Georgia,serif] text-[28px] leading-none">
              8 s
            </dd>
          </div>
          <div>
            <dt className="mt-1 text-[10px] leading-relaxed text-[#b7bec8]">
              resolvidos sem fila
            </dt>
            <dd className="font-[Georgia,serif] text-[28px] leading-none">
              72%
            </dd>
          </div>
          <div>
            <dt className="mt-1 text-[10px] leading-relaxed text-[#b7bec8]">
              analistas online agora
            </dt>
            <dd className="flex items-center gap-2 font-[Georgia,serif] text-[28px] leading-none">
              6{' '}
              <span
                className="size-1.5 rounded-full bg-emerald-400"
                aria-hidden="true"
              />
            </dd>
          </div>
        </dl>
      </section>

      <section
        className="flex min-h-[640px] flex-col bg-white px-6 py-8 sm:px-11 min-[900px]:min-h-svh min-[900px]:px-[clamp(32px,3.9vw,70px)] min-[900px]:py-10"
        aria-labelledby="login-title"
      >
        <p className="text-right text-[11px] leading-relaxed text-[#536073]">
          Problema para entrar?{' '}
          <a
            className="font-medium text-[#0064c9] underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0064c9]"
            href="tel:4000"
          >
            Ligue no ramal 4000
          </a>
        </p>

        <div className="mx-auto my-auto w-full max-w-[380px] py-16 min-[900px]:w-[72%]">
          <h2
            id="login-title"
            className="font-[Georgia,serif] text-[36px] leading-tight font-normal tracking-[-0.8px]"
          >
            Entrar
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-[#536073]">
            Use seu e-mail corporativo e a senha da rede Nexo.
          </p>
          <LoginForm />
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 text-[10px] text-[#536073]">
          <p>© 2026 Nexo · Service desk de TI</p>
          <details className="relative">
            <summary className="cursor-pointer list-none underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0064c9] [&::-webkit-details-marker]:hidden">
              Privacidade e uso de dados
            </summary>
            <p className="absolute right-0 bottom-full mb-3 w-60 rounded-lg border border-slate-200 bg-white p-4 text-xs leading-relaxed shadow-lg">
              Solicite à equipe de TI a política interna da Nexo sobre
              privacidade e uso de dados.
            </p>
          </details>
        </footer>
      </section>
    </main>
  )
}
