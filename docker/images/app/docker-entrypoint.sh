#!/usr/bin/env bash
set -Eeo pipefail

file_env() {
  local var="$1"
  local fileVar="${var}_FILE"
  local def="${2:-}"
  if [ "${!var:-}" ] && [ "${!fileVar:-}" ]; then
    echo >&2 "error: both $var and $fileVar are set (but are exclusive)"
    exit 1
  fi
  local val="$def"
  if [ "${!var:-}" ]; then
    val="${!var}"
  elif [ "${!fileVar:-}" ]; then
    val="$(<"${!fileVar}")"
  fi
  export "$var"="$val"
  unset "$fileVar"
}

_main() {
  file_env 'DISABLE_AUTO_MIGRATE' 'false'

  if [ "$(id -u)" = '0' ]; then
    exec su-exec node "$BASH_SOURCE" "$@"
  fi

  npx prisma generate
  if [ $DISABLE_AUTO_MIGRATE == 'false' ] || [ $DISABLE_AUTO_MIGRATE -eq 0 ]; then
    sleep 3
    npx prisma migrate deploy
  fi

  exec "$@"
}

_main "$@"
