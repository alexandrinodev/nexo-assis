\set ON_ERROR_STOP on
-- Todos os registros deste teste são descartados ao final.
BEGIN;

CREATE FUNCTION pg_temp.expect_error(command text, expected_state text) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE actual_state text;
BEGIN
  BEGIN
    EXECUTE command;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS actual_state = RETURNED_SQLSTATE;
    IF actual_state != expected_state THEN
      RAISE EXCEPTION 'Esperado SQLSTATE %, recebido %: %', expected_state, actual_state, SQLERRM;
    END IF;
    RETURN;
  END;
  RAISE EXCEPTION 'Operação deveria ter sido rejeitada: %', command;
END;
$$;

DO $$
DECLARE
  employee_id uuid;
  analyst_id uuid;
  ticket_id uuid;
  event_id uuid;
  original_number text;
  normalized_email text;
  email_suffix text := gen_random_uuid()::text;
BEGIN
  INSERT INTO app.employees (name, email)
    VALUES ('Pessoa Teste', '  TESTE-' || email_suffix || '@NEXO.COM.BR  ')
    RETURNING id, email INTO employee_id, normalized_email;
  IF normalized_email != 'teste-' || email_suffix || '@nexo.com.br' THEN
    RAISE EXCEPTION 'E-mail não foi normalizado';
  END IF;

  PERFORM pg_temp.expect_error(format(
    'INSERT INTO app.employees (name, email) VALUES (%L, %L)', 'Duplicado', normalized_email
  ), '23505');
  PERFORM pg_temp.expect_error(
    'INSERT INTO app.employees (name, email, role) VALUES (''Inválido'', ''analyst@test.local'', ''analyst'')', '23514');
  PERFORM pg_temp.expect_error(
    'INSERT INTO app.employees (name, email) VALUES (''Inválido'', ''sem-arroba'')', '23514');
  PERFORM pg_temp.expect_error(
    'INSERT INTO app.employees (name, email) VALUES (''   '', ''blank@test.local'')', '23514');

  INSERT INTO app.employees (name, email, role, support_level)
    VALUES ('Analista Teste', 'analyst-' || email_suffix || '@nexo.com.br', 'analyst', 'n1')
    RETURNING id INTO analyst_id;

  INSERT INTO service_desk.tickets (
    requester_id, title, description, type, category, priority, affected_scope,
    impact_description, work_blocked, has_workaround, urgency_description,
    priority_reason, next_response_due_at
  ) VALUES (
    employee_id, 'VPN indisponível', 'Erro na conexão', 'incident', 'network_vpn',
    'high', 'individual', 'Pessoa impedida de trabalhar', true, false,
    'Trabalho impedido', 'Sem alternativa', now() + interval '4 hours'
  ) RETURNING id, number INTO ticket_id, original_number;

  IF original_number !~ '^INC-[0-9]+$' THEN
    RAISE EXCEPTION 'Número de incidente inválido';
  END IF;

  PERFORM pg_temp.expect_error(format('UPDATE service_desk.tickets SET title = '' '' WHERE id = %L', ticket_id), '23514');
  PERFORM pg_temp.expect_error(format('UPDATE service_desk.tickets SET status = ''resolved'' WHERE id = %L', ticket_id), '23514');
  PERFORM pg_temp.expect_error(format('UPDATE service_desk.tickets SET status = ''approved'' WHERE id = %L', ticket_id), '23514');
  PERFORM pg_temp.expect_error(format('UPDATE service_desk.tickets SET priority = ''urgent'' WHERE id = %L', ticket_id), '22P02');
  PERFORM pg_temp.expect_error(format('UPDATE service_desk.tickets SET number = ''INC-1'' WHERE id = %L', ticket_id), '23514');
  PERFORM pg_temp.expect_error(format('UPDATE service_desk.tickets SET type = ''request'' WHERE id = %L', ticket_id), '23514');
  PERFORM pg_temp.expect_error(format('UPDATE service_desk.tickets SET requester_id = %L WHERE id = %L', analyst_id, ticket_id), '23514');
  PERFORM pg_temp.expect_error(format('UPDATE service_desk.tickets SET next_response_due_at = created_at - interval ''1 hour'' WHERE id = %L', ticket_id), '23514');
  PERFORM pg_temp.expect_error(format('UPDATE service_desk.tickets SET assigned_analyst_id = %L WHERE id = %L', employee_id, ticket_id), '23514');
  PERFORM pg_temp.expect_error(format('DELETE FROM app.employees WHERE id = %L', employee_id), '23503');

  UPDATE service_desk.tickets SET assigned_analyst_id = analyst_id WHERE id = ticket_id;
  IF (SELECT version != 2 OR next_response_due_at != now() + interval '4 hours'
      FROM service_desk.tickets WHERE id = ticket_id) THEN
    RAISE EXCEPTION 'Versão ou prazo incorreto após atribuição';
  END IF;
  PERFORM pg_temp.expect_error(format(
    'UPDATE app.employees SET role = ''employee'', support_level = NULL WHERE id = %L', analyst_id
  ), '23514');

  UPDATE service_desk.tickets SET status = 'resolved', resolved_at = now() WHERE id = ticket_id;
  UPDATE service_desk.tickets SET status = 'open', resolved_at = NULL WHERE id = ticket_id;
  IF (SELECT version != 4 OR number != original_number FROM service_desk.tickets WHERE id = ticket_id) THEN
    RAISE EXCEPTION 'Reabertura não preservou número ou incremento de versão';
  END IF;

  INSERT INTO service_desk.ticket_events (ticket_id, actor_id, source, event_type, note)
    VALUES (ticket_id, employee_id, 'employee', 'created', 'Evento de teste')
    RETURNING id INTO event_id;
  PERFORM pg_temp.expect_error(format('UPDATE service_desk.ticket_events SET note = ''Alterado'' WHERE id = %L', event_id), '23514');
  PERFORM pg_temp.expect_error(format('DELETE FROM service_desk.ticket_events WHERE id = %L', event_id), '23514');

  -- Uma requisição aprovada é válida e recebe prefixo REQ.
  INSERT INTO service_desk.tickets (
    requester_id, title, description, type, category, priority, status, affected_scope,
    impact_description, work_blocked, has_workaround, urgency_description,
    priority_reason, next_response_due_at
  ) VALUES (
    employee_id, 'Monitor', 'Pedido de monitor', 'request', 'hardware', 'low',
    'approved', 'individual', 'Melhoria do posto', false, true,
    'Sem urgência', 'Pedido sem urgência', now() + interval '7 days'
  ) RETURNING number INTO original_number;
  IF original_number !~ '^REQ-[0-9]+$' THEN
    RAISE EXCEPTION 'Número de requisição inválido';
  END IF;

  RAISE NOTICE 'Restrições e operações válidas verificadas com sucesso.';
END;
$$;

ROLLBACK;
