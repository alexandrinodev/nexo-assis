\set ON_ERROR_STOP on
BEGIN;

-- IDs estáveis permitem executar novamente sem duplicar os dados.
INSERT INTO app.employees (id, name, email, role, department, support_level) VALUES
  ('00000000-0000-4000-8000-000000000001', 'Ana Souza', 'ana.souza@nexo.com.br', 'employee', 'Financeiro', NULL),
  ('00000000-0000-4000-8000-000000000002', 'Carla Mendes', 'carla.mendes@nexo.com.br', 'employee', 'Comercial', NULL),
  ('00000000-0000-4000-8000-000000000003', 'Bruno Tavares', 'bruno.tavares@nexo.com.br', 'employee', 'Operações', NULL),
  ('00000000-0000-4000-8000-000000000004', 'Rafael Lima', 'rafael.lima@nexo.com.br', 'analyst', 'TI', 'n2'),
  ('00000000-0000-4000-8000-000000000005', 'Marina Costa', 'marina.costa@nexo.com.br', 'analyst', 'TI', 'n1')
ON CONFLICT DO NOTHING;

-- Os prazos abaixo são fixtures relativas à primeira execução, não um cálculo
-- de dias úteis. O cálculo de SLA será implementado no serviço.
WITH examples (
  id_suffix, requester_suffix, title, description, type, category, priority,
  status, affected_scope, impact_description, work_blocked, has_workaround,
  urgency_description, priority_reason, created_at, last_service_update_at,
  next_response_due_at, resolved_at
) AS (
  VALUES
    ('000001', '000001', 'Notebook lento após atualização',
     'Notebook apresenta lentidão; é possível usar outro equipamento temporariamente.',
     'incident', 'hardware', 'medium', 'waiting_analyst', 'individual',
     'Ana trabalha com lentidão, mas tem equipamento alternativo.', false, true,
     'Sem compromisso no mesmo dia.', 'Atrapalha o trabalho, mas há alternativa.',
     now() - interval '10 days', now() - interval '8 days', now() - interval '3 days', NULL::timestamptz),
    ('000002', '000001', 'Segundo monitor para home office',
     'Solicitação aprovada, aguardando disponibilização do monitor.',
     'request', 'hardware', 'low', 'approved', 'individual',
     'Ana deseja melhorar seu posto de trabalho.', false, true,
     'Melhoria sem urgência.', 'Pedido de equipamento sem urgência.',
     now(), NULL, now() + interval '7 days', NULL::timestamptz),
    ('000003', '000001', 'Senha do SAP bloqueada',
     'Acesso ao SAP restabelecido pelo suporte.',
     'incident', 'access', 'high', 'resolved', 'individual',
     'Ana não conseguia trabalhar no SAP.', true, false,
     'Impedimento de trabalho.', 'Uma pessoa estava impedida de trabalhar.',
     now() - interval '5 days', now() - interval '4 days', now() - interval '4 days', now() - interval '4 days'),
    ('000004', '000002', 'Outlook não envia mensagens',
     'Carla não consegue enviar propostas e não possui alternativa.',
     'incident', 'email', 'high', 'open', 'individual',
     'Carla não consegue executar seu trabalho.', true, false,
     'Impedimento de trabalho.', 'Uma pessoa impedida de trabalhar.',
     now(), NULL, now() + interval '4 hours', NULL::timestamptz),
    ('000005', '000003', 'Rede indisponível na operação',
     'Toda a equipe de operações está sem rede e com o trabalho parado.',
     'incident', 'network_vpn', 'critical', 'waiting_analyst', 'team',
     'Equipe de operações parada, sem alternativa.', true, false,
     'Atendimento imediato necessário.', 'Algo parado para uma equipe.',
     now(), NULL, now() + interval '1 hour', NULL::timestamptz)
), inserted AS (
  INSERT INTO service_desk.tickets (
    id, requester_id, title, description, type, category, priority, status,
    affected_scope, impact_description, work_blocked, has_workaround,
    urgency_description, priority_reason, created_at, updated_at,
    last_service_update_at, next_response_due_at, resolved_at
  )
  SELECT
    ('10000000-0000-4000-8000-000000' || id_suffix)::uuid,
    ('00000000-0000-4000-8000-000000' || requester_suffix)::uuid,
    title, description, type::service_desk.ticket_type,
    category::service_desk.ticket_category, priority::service_desk.ticket_priority,
    status::service_desk.ticket_status, affected_scope::service_desk.affected_scope,
    impact_description, work_blocked, has_workaround, urgency_description,
    priority_reason, created_at, coalesce(last_service_update_at, created_at),
    last_service_update_at, next_response_due_at, resolved_at
  FROM examples
  ON CONFLICT (id) DO NOTHING
  RETURNING *
)
INSERT INTO service_desk.ticket_events (ticket_id, actor_id, source, event_type, note, changes, created_at)
SELECT id, requester_id, 'employee'::service_desk.event_source,
  'created'::service_desk.event_type, 'Chamado de demonstração cadastrado.',
  jsonb_build_object('status', jsonb_build_object('old', NULL, 'new', 'open')), created_at
FROM inserted
UNION ALL
SELECT id, '00000000-0000-4000-8000-000000000005'::uuid, 'analyst',
  'resolved', 'Acesso restabelecido pelo suporte.',
  jsonb_build_object('status', jsonb_build_object('old', 'open', 'new', 'resolved')), resolved_at
FROM inserted WHERE status = 'resolved'
UNION ALL
SELECT id, '00000000-0000-4000-8000-000000000005'::uuid, 'analyst',
  'updated', 'Situação de demonstração atualizada.',
  jsonb_build_object('status', jsonb_build_object('old', 'open', 'new', status)),
  coalesce(last_service_update_at, created_at)
FROM inserted WHERE status NOT IN ('open', 'resolved');

COMMIT;
