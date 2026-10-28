# Banco local

Esta etapa implementa o armazenamento de funcionários, chamados e histórico.
Não conecta as telas ao banco e ainda não implementa o serviço HTTP de chamados.

## Iniciar

Na raiz do repositório, copie `.env.example` para `.env` se ainda não existir.
Em seguida:

```bash
sh scripts/db.sh up
sh scripts/db.sh migrate
sh scripts/db.sh seed
sh scripts/db.sh test
```

O script usa `docker compose` ou, se indisponível, `docker-compose`. Não é
necessário instalar PostgreSQL ou um cliente `psql` no computador.

O banco fica em `127.0.0.1:5433` por padrão. Banco, usuário, senha e porta são
configurados no `.env` da raiz. Essas credenciais são de desenvolvimento local;
não são contas dos funcionários. O `.env` não é versionado.

Um cliente gráfico pode usar os mesmos dados do `.env`. As futuras aplicações
usarão usuários de banco com permissões próprias; nesta etapa usamos somente
a conta administrativa local para aplicar migrações e validar a modelagem.

## Entender os arquivos

- `../compose.yaml`: executa PostgreSQL 17, expõe a porta apenas no computador
  local e mantém os dados em um volume nomeado.
- `migrations/001_employees_and_tickets.sql`: cria schemas, tipos, tabelas,
  índices e restrições. Registra sua versão em `app.schema_migrations`.
- `seeds/001_demo.sql`: insere cinco funcionários, cinco chamados e nove
  eventos, sem substituir registros existentes ao executar novamente.
- `tests/001_constraints.sql`: verifica operações válidas e rejeições esperadas,
  revertendo os registros de teste ao final.

Uma migração é uma alteração versionada na estrutura do banco. Depois que ela
é aplicada, alterações seguintes devem usar um novo arquivo numerado, em vez
de editar a migração antiga. Executar `migrate` novamente pula versões aplicadas.
Usamos SQL diretamente nesta etapa para tornar visíveis as relações e as
restrições; nenhuma biblioteca de acesso ao banco foi adicionada à aplicação.

O schema `app` agrupa `employees` e o controle de migrações. O schema
`service_desk` agrupa `tickets`, `ticket_events` e seus tipos. Campos do banco
usam `snake_case`; contratos TypeScript poderão usar `camelCase`, com conversão
explícita na camada de acesso a dados.

## Consultar

```bash
sh scripts/db.sh psql
```

Dentro do `psql`, experimente:

```sql
SELECT name, email, role, support_level FROM app.employees;

SELECT t.number, t.title, t.status, t.priority,
       t.status != 'resolved' AND now() > t.next_response_due_at AS overdue
FROM service_desk.tickets AS t
JOIN app.employees AS e ON e.id = t.requester_id
WHERE e.email = 'ana.souza@nexo.com.br'
ORDER BY t.created_at;

SELECT t.number, e.event_type, e.note, e.created_at
FROM service_desk.ticket_events AS e
JOIN service_desk.tickets AS t ON t.id = e.ticket_id
ORDER BY t.number, e.created_at;
```

Essas são consultas administrativas de aprendizado. O filtro por funcionário
na futura API virá da sessão validada, não de um e-mail escolhido pelo modelo.
Para sair do cliente, digite `\q`.

## Dados de demonstração

| Pessoa | E-mail | Perfil |
| --- | --- | --- |
| Ana Souza | ana.souza@nexo.com.br | Funcionária |
| Carla Mendes | carla.mendes@nexo.com.br | Funcionária |
| Bruno Tavares | bruno.tavares@nexo.com.br | Funcionário |
| Rafael Lima | rafael.lima@nexo.com.br | Analista N2 |
| Marina Costa | marina.costa@nexo.com.br | Analista N1 |

Ana possui um incidente vencido, uma requisição aprovada e um incidente resolvido
há quatro dias. Carla possui um incidente aberto e Bruno um incidente crítico.
Isso permite testar posteriormente acesso por solicitante e reabertura recente.

Datas são relativas à primeira execução do seed e não são atualizadas ao repeti-lo.
Os prazos são exemplos fixados para os cenários, sem implementar calendário útil.
Com o tempo, outros chamados também vencerão e o resolvido sairá da janela de
sete dias. O número visível é gerado pelo banco e não deve ser fixado nas telas.

## Restrições implementadas

- E-mail normalizado e único; perfis e níveis de suporte compatíveis.
- Campos obrigatórios, limites de tamanho e valores permitidos pelo domínio.
- Chaves estrangeiras entre solicitantes, analistas, chamados e eventos.
- Número gerado por sequência com prefixo INC ou REQ, imutável após a abertura.
- Solicitante, tipo e identidade do chamado imutáveis.
- Somente analistas podem ser atribuídos; uma pessoa atribuída precisa manter
  esse perfil enquanto houver referência.
- Status aprovado apenas em requisições; resolução exige data correspondente.
- Versão incrementada e `updated_at` atualizado a cada alteração do chamado,
  sem modificar automaticamente o SLA.
- Eventos protegidos contra `UPDATE` e `DELETE` pelo fluxo normal de SQL.

As sequências não são revertidas com transações. Testes, conflitos ou falhas podem
deixar intervalos na numeração; isso é esperado e não significa perda de chamados.

## Responsabilidades da próxima etapa

A API ainda precisa garantir autenticação, privacidade por sessão, confirmação
do rascunho, idempotência e detecção de duplicidade. Também aplicará o limite de
sete dias para reabertura, calculará prioridade/SLA e verificará a versão esperada
ao atualizar (`WHERE id = ... AND version = ...`). O incremento da versão no banco,
sozinho, não impede sobrescrita concorrente.

Ao alterar um chamado, a API deverá inserir o evento na mesma transação, validando
o conteúdo de `changes`. Um `UPDATE` administrativo isolado não gera histórico
automaticamente. O banco estabelece integridade estrutural; não substitui as
regras e o controle de acesso do serviço.

## Parar e preservar os dados

```bash
sh scripts/db.sh stop
sh scripts/db.sh up
```

O volume `postgres_data` conserva os registros. Mudanças nas credenciais do `.env`
não modificam usuários ou senhas de um banco já inicializado. A montagem
`/database` apenas disponibiliza os arquivos: migrações e seeds são executados
explicitamente pelos comandos, inclusive quando o volume já existe.
