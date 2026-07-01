#!/usr/bin/env bash
set -euo pipefail

# Kerocket: bind Tomcat to $PORT and inject MySQL as JNDI jdbc/appDB.
# Docs: https://kerocket.com/docs/java-servlet

HTTP_PORT="${PORT:-8080}"
sed -i "s/<Connector port=\"8080\"/<Connector port=\"${HTTP_PORT}\"/" "${CATALINA_HOME}/conf/server.xml"

url_decode() {
  local s="${1//+/ }"
  printf '%b' "${s//%/\\x}"
}

parse_database_url() {
  local url="$1"
  url="${url#jdbc:mysql://}"
  url="${url#mysql://}"
  [ -n "$url" ] || return 1

  local userpass hostpart
  userpass="${url%%@*}"
  hostpart="${url#*@}"
  if [ "$userpass" = "$url" ] || [ -z "$hostpart" ]; then
    return 1
  fi

  MYSQL_USER="$(url_decode "${userpass%%:*}")"
  if [[ "$userpass" == *:* ]]; then
    MYSQL_PASSWORD="$(url_decode "${userpass#*:}")"
  else
    MYSQL_PASSWORD=""
  fi

  local hostport="${hostpart%%/*}"
  MYSQL_DATABASE="${hostpart#*/}"
  MYSQL_DATABASE="${MYSQL_DATABASE%%\?*}"
  MYSQL_DATABASE="${MYSQL_DATABASE%%/*}"

  if [[ "$hostport" == *:* ]]; then
    MYSQL_HOST="${hostport%%:*}"
    MYSQL_PORT="${hostport##*:}"
  else
    MYSQL_HOST="$hostport"
    MYSQL_PORT="3306"
  fi
  return 0
}

if [ -n "${DATABASE_URL:-}" ]; then
  if ! parse_database_url "$DATABASE_URL"; then
    echo "error: invalid DATABASE_URL (expected mysql://user:pass@host:port/database)" >&2
    exit 1
  fi
else
  MYSQL_HOST="${MYSQL_HOST:-${MYSQLHOST:-}}"
  MYSQL_USER="${MYSQL_USER:-${MYSQLUSER:-}}"
  MYSQL_PASSWORD="${MYSQL_PASSWORD:-${MYSQLPASSWORD:-}}"
  MYSQL_DATABASE="${MYSQL_DATABASE:-${MYSQLDATABASE:-campuslink}}"
  MYSQL_PORT="${MYSQL_PORT:-${MYSQLPORT:-3306}}"
fi

MYSQL_USE_SSL="${MYSQL_USE_SSL:-false}"

if [ -z "$MYSQL_HOST" ] || [ -z "$MYSQL_USER" ] || [ -z "$MYSQL_DATABASE" ]; then
  echo "error: database config incomplete — set DATABASE_URL or MYSQLHOST/MYSQLUSER/MYSQLDATABASE" >&2
  exit 1
fi

escape_xml_attr() {
  local s="$1"
  s="${s//&/&amp;}"
  s="${s//</&lt;}"
  s="${s//>/&gt;}"
  s="${s//\"/&quot;}"
  s="${s//\'/&apos;}"
  printf '%s' "$s"
}

U="$(escape_xml_attr "${MYSQL_USER}")"
P="$(escape_xml_attr "${MYSQL_PASSWORD}")"

URL_RAW="jdbc:mysql://${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}?useSSL=${MYSQL_USE_SSL}&serverTimezone=UTC&allowPublicKeyRetrieval=true"
if [ -n "${MYSQL_JDBC_EXTRA_PARAMS:-}" ]; then
  URL_RAW="${URL_RAW}&${MYSQL_JDBC_EXTRA_PARAMS}"
fi
URL_XML="$(printf '%s' "${URL_RAW}" | sed 's/&/\&amp;/g')"

mkdir -p "${CATALINA_HOME}/conf/Catalina/localhost"

cat > "${CATALINA_HOME}/conf/Catalina/localhost/ROOT.xml" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<Context>
    <Resource name="jdbc/appDB"
              auth="Container"
              type="javax.sql.DataSource"
              maxTotal="100"
              maxIdle="30"
              maxWaitMillis="10000"
              username="${U}"
              password="${P}"
              driverClassName="com.mysql.cj.jdbc.Driver"
              url="${URL_XML}"/>
    <Environment name="spring.profiles.active" value="kerocket" type="java.lang.String" override="false"/>
</Context>
EOF

export JAVA_OPTS="${JAVA_OPTS:-} -Dspring.profiles.active=kerocket"

exec "$@"
