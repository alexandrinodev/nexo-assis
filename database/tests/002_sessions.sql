\set ON_ERROR_STOP on
BEGIN;

DO $$
DECLARE
  employee_id uuid;
  hash text := repeat(replace(gen_random_uuid()::text, '-', ''), 2);
BEGIN
  INSERT INTO app.employees (name, email)
    VALUES ('Teste de sessão', gen_random_uuid()::text || '@nexo.test')
    RETURNING id INTO employee_id;

  INSERT INTO app.sessions (employee_id, token_hash, expires_at)
    VALUES (employee_id, hash, now() + interval '8 hours');

  BEGIN
    INSERT INTO app.sessions (employee_id, token_hash, expires_at)
      VALUES (employee_id, hash, now() + interval '8 hours');
    RAISE EXCEPTION 'Hash duplicado deveria ser rejeitado';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO app.sessions (employee_id, token_hash, expires_at)
      VALUES (employee_id, 'invalido', now() + interval '8 hours');
    RAISE EXCEPTION 'Hash malformado deveria ser rejeitado';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO app.sessions (employee_id, token_hash, expires_at)
      VALUES (employee_id, repeat('b', 64), now() - interval '1 hour');
    RAISE EXCEPTION 'Prazo anterior à criação deveria ser rejeitado';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO app.sessions (employee_id, token_hash, expires_at)
      VALUES (gen_random_uuid(), repeat('c', 64), now() + interval '8 hours');
    RAISE EXCEPTION 'Funcionário inexistente deveria ser rejeitado';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;

  RAISE NOTICE 'Restrições de sessões verificadas com sucesso.';
END;
$$;

ROLLBACK;
