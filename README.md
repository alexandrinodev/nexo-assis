# nexo-assist

Este projeto usa um único repositório Git na raiz.

- `app/`: aplicação Next.js.
- `backend/`: API Fastify em TypeScript, com PostgreSQL, autenticação de demonstração
  por sessão e consulta de chamados do funcionário autenticado.
- `docs/`: documentação de arquitetura e interface.
- `database/`: migrações SQL, dados de exemplo e testes do PostgreSQL.
- `scripts/db.sh`: comandos para executar e administrar o banco local.
- `Desafio_Tecnico_Nexo_Assist_PRD_v5.pdf`: requisitos do projeto.

Para iniciar a aplicação:

```bash
cd app
npm install
npm run dev
```

Para preparar o banco local, com Docker e Compose instalados:

```bash
cp .env.example .env
sh scripts/db.sh up
sh scripts/db.sh migrate
sh scripts/db.sh seed
sh scripts/db.sh test
```

Se `.env` já existir, preserve sua configuração. O PostgreSQL usa a porta local
5433 por padrão e um volume persistente. As telas continuam com dados de
demonstração; a integração com o serviço de chamados será a próxima etapa.

Consulte [o guia do banco](database/README.md) para entender os arquivos,
consultar os registros e parar o banco sem perder os dados.

Para iniciar a API, em outro terminal (Node.js 24):

```bash
cd backend
npm ci
# Apenas se backend/.env ainda não existir; ajuste os dados do banco:
cp .env.example .env
npm run db:check
npm run dev
```

Acesse `http://127.0.0.1:3333/health`. Veja [o guia do backend](backend/README.md)
para entender o fluxo, a configuração e os comandos de validação. A conexão
PostgreSQL, login, logout e listagem de chamados por sessão estão implementados.
O guia inclui exemplos de requisições. O login das telas ainda usa a demonstração
local e será integrado à API em uma próxima etapa.
