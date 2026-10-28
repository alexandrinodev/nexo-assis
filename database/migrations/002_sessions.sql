\set ON_ERROR_STOP on
SELECT pg_advisory_lock(801001);
SELECT EXISTS (
  SELECT 1 FROM app.schema_migrations WHERE version = '002_sessions'
) AS already_applied \gset

\if :already_applied
  \echo 'Migração 002 já aplicada.'
\else
BEGIN;

CREATE TABLE app.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES app.employees(id) ON DELETE RESTRICT,
  token_hash varchar(64) NOT NULL UNIQUE CHECK (token_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  CONSTRAINT sessions_expiration_order CHECK (expires_at > created_at)
);

CREATE INDEX sessions_employee_idx ON app.sessions (employee_id);
CREATE INDEX sessions_expiration_idx ON app.sessions (expires_at);

INSERT INTO app.schema_migrations (version) VALUES ('002_sessions');
COMMIT;
\endif

SELECT pg_advisory_unlock(801001);
