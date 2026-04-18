#!/usr/bin/env bash
# ============================================================
# firstrun.sh — Configuración inicial completa en Raspberry Pi
# Uso: bash firstrun.sh [ruta-del-proyecto]
#   ruta-del-proyecto  Directorio donde ya está el repo clonado
#                      (default: ~/cactus)
# ============================================================
set -euo pipefail

PROJECT_DIR="${1:-$HOME/cactus}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; NC='\033[0m'

step() { echo -e "\n${CYAN}[►]${NC} $*"; }
ok()   { echo -e "${GREEN}[✓]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
die()  { echo -e "${RED}[✗]${NC} $*" >&2; exit 1; }

# ── 0. Comprobaciones previas ────────────────────────────────

[[ "${EUID}" -eq 0 ]] && die "No ejecutar como root. Usá un usuario con sudo."

command -v git >/dev/null 2>&1 || die "git no está instalado."

# ── 1. Docker ────────────────────────────────────────────────

step "Verificando Docker"
if ! command -v docker >/dev/null 2>&1; then
  warn "Docker no encontrado — instalando..."
  sudo apt-get update -qq
  sudo apt-get install -y -q ca-certificates curl git ufw fail2ban
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "${USER}"
  sudo systemctl enable docker
  sudo systemctl start docker
  ok "Docker instalado. IMPORTANTE: esta sesión necesita relogueo para usar"
  warn "Docker sin sudo. Ejecutá: newgrp docker   (o abrí nueva sesión SSH)"
  # Continuar usando sudo docker por ahora
  DOCKER_CMD="sudo docker"
else
  ok "Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"
  DOCKER_CMD="docker"
fi

# Verificar docker compose plugin
if ! ${DOCKER_CMD} compose version >/dev/null 2>&1; then
  warn "docker compose plugin no encontrado — instalando..."
  sudo apt-get install -y -q docker-compose-plugin
fi
ok "Docker Compose $(${DOCKER_CMD} compose version --short)"

# ── 2. Firewall ──────────────────────────────────────────────

step "Configurando firewall"
if command -v ufw >/dev/null 2>&1; then
  sudo ufw allow OpenSSH   >/dev/null
  sudo ufw allow 80/tcp    >/dev/null
  sudo ufw allow 443/tcp   >/dev/null
  sudo ufw --force enable  >/dev/null
  ok "ufw activo (SSH + 80 + 443)"
else
  warn "ufw no disponible, saltando firewall"
fi

# ── 3. Proyecto ──────────────────────────────────────────────

step "Verificando directorio del proyecto"
[[ -d "${PROJECT_DIR}" ]] || die "Directorio no encontrado: ${PROJECT_DIR}"
[[ -f "${PROJECT_DIR}/docker-compose.yml" ]] || \
  die "No es un directorio de proyecto válido: ${PROJECT_DIR}"
ok "Proyecto en ${PROJECT_DIR}"

cd "${PROJECT_DIR}"

# ── 4. .env ──────────────────────────────────────────────────

step "Configurando variables de entorno"
if [[ ! -f ".env" ]]; then
  warn ".env no encontrado — generando desde plantilla..."
  bash scripts/raspberry/setup-env.sh
else
  ok ".env ya existe"
  # Validar que no tenga valores placeholder
  if grep -q "change_me" .env 2>/dev/null; then
    warn ".env contiene valores 'change_me' — editalo antes de producción"
    warn "Podés regenerar con: bash scripts/raspberry/setup-env.sh"
  fi
fi

# ── 5. Optimizaciones del sistema ───────────────────────────

step "Optimizando parámetros del sistema para Raspberry Pi"

# Aumentar límite de inotify watches (útil para Docker)
SYSCTL_FILE="/etc/sysctl.d/99-cactus.conf"
if [[ ! -f "${SYSCTL_FILE}" ]]; then
  sudo tee "${SYSCTL_FILE}" > /dev/null <<'EOF'
# Cactus ERP — tuning para Raspberry Pi 4
fs.inotify.max_user_watches = 524288
vm.swappiness = 10
EOF
  sudo sysctl --system -q
  ok "Parámetros del kernel ajustados"
else
  ok "Parámetros del kernel ya configurados"
fi

# Swap extra si la RAM disponible es < 1GB libre
MEMFREE_MB=$(awk '/MemAvailable/ {printf "%d", $2/1024}' /proc/meminfo)
if (( MEMFREE_MB < 800 )); then
  warn "RAM disponible baja (${MEMFREE_MB} MB). Considerá agregar swap."
fi

# ── 6. Deploy ────────────────────────────────────────────────

step "Construyendo y levantando servicios (modo producción)"
${DOCKER_CMD} compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  up -d --build

# ── 7. Validación ────────────────────────────────────────────

step "Esperando que los servicios levanten..."
TIMEOUT=90
ELAPSED=0
until ${DOCKER_CMD} compose ps | grep -q "healthy\|running" 2>/dev/null; do
  if (( ELAPSED >= TIMEOUT )); then
    warn "Timeout esperando servicios. Revisá con: docker compose logs"
    break
  fi
  sleep 5
  ELAPSED=$((ELAPSED + 5))
  echo -n "."
done
echo

step "Estado final de los servicios"
${DOCKER_CMD} compose ps

# Obtener IP local
LOCAL_IP=$(hostname -I | awk '{print $1}')

echo ""
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Cactus ERP listo en la Raspberry Pi!${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo ""
echo -e "  App:    ${CYAN}http://${LOCAL_IP}${NC}"
echo -e "  API:    ${CYAN}http://${LOCAL_IP}/api/docs${NC}"
echo ""
echo -e "  Logs:   docker compose logs -f"
echo -e "  Stop:   docker compose down"
echo ""
