#!/usr/bin/env bash
# ============================================================
# setup-env.sh — Genera el archivo .env con secrets seguros
# Uso: bash scripts/raspberry/setup-env.sh [--defaults]
#   --defaults  No pide confirmaciones, usa valores por defecto
# ============================================================
set -euo pipefail

NON_INTERACTIVE="${1:-}"
CYAN='\033[0;36m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'; NC='\033[0m'

prompt() {
  # prompt <var_name> <default> <description>
  local var="$1" default="$2" desc="$3" value
  if [[ "${NON_INTERACTIVE}" == "--defaults" ]]; then
    echo "${default}"
    return
  fi
  read -rp "$(echo -e "${CYAN}${desc}${NC} [${default}]: ")" value
  echo "${value:-${default}}"
}

# Generar secret key segura
if command -v openssl >/dev/null 2>&1; then
  SECRET_KEY="$(openssl rand -hex 32)"
else
  # fallback con /dev/urandom
  SECRET_KEY="$(head -c 32 /dev/urandom | base64 | tr -d '+/=' | head -c 64)"
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}  Configuración de Cactus ERP — .env  ${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo ""

POSTGRES_DB=$(prompt "POSTGRES_DB" "cactus" "Nombre de la base de datos")
POSTGRES_USER=$(prompt "POSTGRES_USER" "cactus" "Usuario de PostgreSQL")

# Password: si está en modo interactivo, usar read -s para no mostrarla
if [[ "${NON_INTERACTIVE}" == "--defaults" ]]; then
  POSTGRES_PASSWORD="$(openssl rand -hex 16 2>/dev/null || head -c 16 /dev/urandom | base64 | tr -d '+/=' | head -c 24)"
else
  read -rsp "$(echo -e "${CYAN}Contraseña de PostgreSQL${NC} (Enter = auto-generar): ")" POSTGRES_PASSWORD
  echo
  if [[ -z "${POSTGRES_PASSWORD}" ]]; then
    POSTGRES_PASSWORD="$(openssl rand -hex 16 2>/dev/null || head -c 16 /dev/urandom | base64 | tr -d '+/=' | head -c 24)"
    echo -e "${YELLOW}Password generada automáticamente${NC}"
  fi
fi

ACCESS_TOKEN_MINUTES=$(prompt "ACCESS_TOKEN_EXPIRE_MINUTES" "480" \
  "Minutos de validez del JWT (480 = 8h)")

ENVIRONMENT=$(prompt "ENVIRONMENT" "production" "Entorno (production/development)")

ENV_FILE=".env"

cat > "${ENV_FILE}" <<EOF
# Generado por setup-env.sh — $(date '+%Y-%m-%d %H:%M:%S')
# NO subir este archivo a git.

POSTGRES_DB=${POSTGRES_DB}
POSTGRES_USER=${POSTGRES_USER}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_PORT=5432

API_HOST=0.0.0.0
API_PORT=8000
ENVIRONMENT=${ENVIRONMENT}

SECRET_KEY=${SECRET_KEY}
ACCESS_TOKEN_EXPIRE_MINUTES=${ACCESS_TOKEN_MINUTES}

FRONTEND_PORT=3000
EOF

echo ""
echo -e "${GREEN}[✓]${NC} .env generado en ${ENV_FILE}"
echo -e "${YELLOW}[!]${NC} Guardá la contraseña en un lugar seguro:"
echo -e "    POSTGRES_PASSWORD=${POSTGRES_PASSWORD}"
echo ""
