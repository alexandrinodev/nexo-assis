\set ON_ERROR_STOP on

-- O lock serializa execuções concorrentes desta migração.
SELECT pg_advisory_lock(801001);
CREATE SCHEMA IF NOT EXISTS app;
CREATE TABLE IF NOT EXISTS app.schema_migrations (
  version text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
SELECT EXISTS (
  SELECT 1 FROM app.schema_migrations WHERE version = '001_employees_and_tickets'
) AS already_applied \gset

\if :already_applied
  \echo 'Migração 001 já aplicada.'
\else
BEGIN;

CREATE SCHEMA service_desk;

CREATE TYPE app.employee_role AS ENUM ('employee', 'analyst');
CREATE TYPE app.support_level AS ENUM ('n1', 'n2');
CREATE TYPE service_desk.ticket_type AS ENUM ('incident', 'request');
CREATE TYPE service_desk.ticket_category AS ENUM (
  'access', 'network_vpn', 'hardware', 'software', 'email', 'other'
);
CREATE TYPE service_desk.ticket_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE service_desk.ticket_status AS ENUM (
  'open', 'waiting_analyst', 'in_progress', 'approved', 'resolved'
);
CREATE TYPE service_desk.affected_scope AS ENUM ('individual', 'team', 'company');
CREATE TYPE service_desk.event_source AS ENUM ('employee', 'analyst', 'agent');
CREATE TYPE service_desk.event_type AS ENUM (
  'created', 'updated', 'assigned', 'transferred', 'resolved', 'reopened'
);

CREATE TABLE app.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(120) NOT NULL CHECK (length(btrim(name)) > 0),
  email varchar(254) NOT NULL UNIQUE,
  role app.employee_role NOT NULL DEFAULT 'employee',
  department varchar(120),
  support_level app.support_level,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT employees_normalized_email CHECK (
    email = lower(btrim(email)) AND email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  ),
  CONSTRAINT employees_role_support_level CHECK (
    (role = 'employee' AND support_level IS NULL)
    OR (role = 'analyst' AND support_level IS NOT NULL)
  )
);

CREATE SEQUENCE service_desk.ticket_number_seq START WITH 20000;

CREATE TABLE service_desk.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL UNIQUE,
  requester_id uuid NOT NULL REFERENCES app.employees(id) ON DELETE RESTRICT,
  assigned_analyst_id uuid REFERENCES app.employees(id) ON DELETE RESTRICT,
  support_level app.support_level NOT NULL DEFAULT 'n1',
  title varchar(160) NOT NULL CHECK (length(btrim(title)) > 0),
  description varchar(5000) NOT NULL CHECK (length(btrim(description)) > 0),
  type service_desk.ticket_type NOT NULL,
  category service_desk.ticket_category NOT NULL,
  priority service_desk.ticket_priority NOT NULL,
  status service_desk.ticket_status NOT NULL DEFAULT 'open',
  affected_scope service_desk.affected_scope NOT NULL,
  impact_description varchar(2000) NOT NULL CHECK (length(btrim(impact_description)) > 0),
  work_blocked boolean NOT NULL,
  has_workaround boolean NOT NULL,
  urgency_description varchar(2000) NOT NULL CHECK (length(btrim(urgency_description)) > 0),
  commitment_at timestamptz,
  priority_reason varchar(2000) NOT NULL CHECK (length(btrim(priority_reason)) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_service_update_at timestamptz,
  next_response_due_at timestamptz NOT NULL,
  resolved_at timestamptz,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  CONSTRAINT tickets_number_type CHECK (
    (type = 'incident' AND number ~ '^INC-[0-9]+$')
    OR (type = 'request' AND number ~ '^REQ-[0-9]+$')
  ),
  CONSTRAINT tickets_approval_type CHECK (status != 'approved' OR type = 'request'),
  CONSTRAINT tickets_resolution_date CHECK (
    (status = 'resolved') = (resolved_at IS NOT NULL)
  ),
  CONSTRAINT tickets_date_order CHECK (
    next_response_due_at >= created_at
    AND (resolved_at IS NULL OR resolved_at >= created_at)
    AND (last_service_update_at IS NULL OR last_service_update_at >= created_at)
  )
);

CREATE INDEX tickets_requester_status_idx ON service_desk.tickets (requester_id, status);
CREATE INDEX tickets_open_due_idx ON service_desk.tickets (next_response_due_at)
  WHERE status != 'resolved';
CREATE INDEX tickets_analyst_idx ON service_desk.tickets (assigned_analyst_id)
  WHERE assigned_analyst_id IS NOT NULL;
CREATE INDEX tickets_requester_resolved_idx ON service_desk.tickets (requester_id, resolved_at)
  WHERE status = 'resolved';

CREATE TABLE service_desk.ticket_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES service_desk.tickets(id) ON DELETE RESTRICT,
  actor_id uuid NOT NULL REFERENCES app.employees(id) ON DELETE RESTRICT,
  source service_desk.event_source NOT NULL,
  event_type service_desk.event_type NOT NULL,
  note text NOT NULL CHECK (length(btrim(note)) > 0),
  changes jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(changes) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ticket_events_timeline_idx ON service_desk.ticket_events (ticket_id, created_at, id);

-- Timestamps administrativos não alteram o prazo de atendimento.
CREATE FUNCTION app.touch_employee() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.email := lower(btrim(NEW.email));
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at := clock_timestamp();
    IF NEW.role != 'analyst' AND EXISTS (
      SELECT 1 FROM service_desk.tickets WHERE assigned_analyst_id = OLD.id
    ) THEN
      RAISE EXCEPTION 'Funcionário atribuído a chamado precisa manter perfil de analista'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER employees_before_write BEFORE INSERT OR UPDATE ON app.employees
  FOR EACH ROW EXECUTE FUNCTION app.touch_employee();

CREATE FUNCTION service_desk.prepare_ticket() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.number IS NOT NULL THEN
      RAISE EXCEPTION 'O número do chamado é gerado pelo banco' USING ERRCODE = '23514';
    END IF;
    NEW.number := CASE NEW.type WHEN 'incident' THEN 'INC-' ELSE 'REQ-' END
      || nextval('service_desk.ticket_number_seq')::text;
  ELSE
    IF NEW.number IS DISTINCT FROM OLD.number
      OR NEW.type IS DISTINCT FROM OLD.type
      OR NEW.requester_id IS DISTINCT FROM OLD.requester_id
      OR NEW.id IS DISTINCT FROM OLD.id
      OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Identidade, tipo e solicitante do chamado são imutáveis'
        USING ERRCODE = '23514';
    END IF;
    NEW.updated_at := clock_timestamp();
    NEW.version := OLD.version + 1;
  END IF;
  IF NEW.assigned_analyst_id IS NOT NULL THEN
    -- O lock evita alteração concorrente do perfil durante a atribuição.
    PERFORM 1 FROM app.employees
      WHERE id = NEW.assigned_analyst_id AND role = 'analyst' FOR SHARE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Responsável precisa ser um analista cadastrado'
        USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER tickets_before_write BEFORE INSERT OR UPDATE ON service_desk.tickets
  FOR EACH ROW EXECUTE FUNCTION service_desk.prepare_ticket();

CREATE FUNCTION service_desk.reject_event_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Eventos de histórico não podem ser alterados ou removidos'
    USING ERRCODE = '23514';
END;
$$;
CREATE TRIGGER ticket_events_immutable BEFORE UPDATE OR DELETE ON service_desk.ticket_events
  FOR EACH ROW EXECUTE FUNCTION service_desk.reject_event_change();

INSERT INTO app.schema_migrations (version) VALUES ('001_employees_and_tickets');
COMMIT;
\endif

SELECT pg_advisory_unlock(801001);
