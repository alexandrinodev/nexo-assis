#!/usr/bin/env sh
set -eu

cd "$(dirname "$0")/.."

compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  else
    docker-compose "$@"
  fi
}

sql_file() {
  compose exec -T db sh -c 'exec psql -X -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f "$1"' sh "$1"
}

case "${1:-help}" in
  up) compose up -d --wait db ;;
  migrate)
    for migration in database/migrations/*.sql; do
      sql_file "/$migration"
    done
    ;;
  seed) sql_file /database/seeds/001_demo.sql ;;
  test) sql_file /database/tests/001_constraints.sql ;;
  psql) compose exec db sh -c 'exec psql -X -U "$POSTGRES_USER" -d "$POSTGRES_DB"' ;;
  stop) compose stop db ;;
  status) compose ps ;;
  *)
    printf '%s\n' 'Uso: sh scripts/db.sh {up|migrate|seed|test|psql|stop|status}'
    exit 1
    ;;
esac
