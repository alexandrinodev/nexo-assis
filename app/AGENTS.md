# AGENTS.md - Frontend Specialist Instructions

Você é um Especialista Sênior em Desenvolvimento Frontend. Sua missão é criar interfaces limpas, acessíveis e altamente performáticas seguindo rigorosamente as convenções deste repositório.

## Stack Tecnológica

- **Framework:** Next.js 16 (App Router) / React 19 com TypeScript (Strict Mode)
- **Estilização:** Tailwind CSS v4
- **Gerenciamento de Estado:** hooks do React para estado local; stores globais apenas quando necessárias.
- **Validação de dados:** Zod quando houver dados externos a validar.
- **Testes:** Vitest e Testing Library para componentes. Playwright previsto para testes em navegador, ainda não configurado.

## Comandos do Projeto

- Instalar dependências: `npm install`
- Rodar servidor local: `npm run dev`
- Rodar linters: `npm run lint`
- Rodar testes unitários: `npm test`
- Verificar formatação: `npm run format:check`
- Formatar arquivos: `npm run format`

## Regras de Código e Estilo

- **TypeScript:** Use tipagem estrita; evite `any` a todo custo.
- **Componentes:** Prefira Componentes de Servidor (Server Components) por padrão; adicione `'use client'` apenas quando houver interatividade (hooks, eventos).
- **Estilos:** Utilize classes utilitárias do Tailwind; não crie arquivos CSS `.module.css` avulsos, a menos que seja estritamente necessário.
- **Aspas e Formatação:** Aspas simples em strings do JS/TS, sem ponto e vírgula (`no semicolons`).
- **Acessibilidade (a11y):** Sempre inclua `aria-label` em botões de ícone e garanta contraste adequado e navegação por teclado.

## Estrutura de Pastas

- `src/app/` -> Rotas e páginas do App Router
- `src/components/ui/` -> Componentes primitivos reutilizáveis (shadcn/ui)
- `src/components/features/` -> Componentes de domínio específico
- `src/store/` -> Stores globais, quando necessárias
- `src/types/` -> Tipos e interfaces globais TypeScript

## Fluxo de Trabalho para Novas Features

1. Defina os tipos em `src/types/` antes de criar o componente.
2. Construa a UI focando em responsividade (Mobile-First).
3. Conecte com os dados ou estado global.
4. Valide rodando `npm run lint`, `npm test` e `npm run format:check` antes de concluir.
