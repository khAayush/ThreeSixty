#!/usr/bin/env bash
# setup.sh — One-command Docker deployment for ThreeSixty
# Usage: chmod +x setup.sh && ./setup.sh

set -euo pipefail

# ─── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ─── Helpers ─────────────────────────────────────────────────────────────────
info()    { echo -e "${CYAN}  ▸ $*${NC}"; }
success() { echo -e "${GREEN}  ✓ $*${NC}"; }
warn()    { echo -e "${YELLOW}  ⚠ $*${NC}"; }
error()   { echo -e "${RED}  ✗ $*${NC}"; exit 1; }
banner()  {
  echo ""
  echo -e "${BOLD}╔══════════════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}║         ThreeSixty  ·  Docker Setup              ║${NC}"
  echo -e "${BOLD}╚══════════════════════════════════════════════════╝${NC}"
  echo ""
}

# ─── Step 1: Check dependencies ──────────────────────────────────────────────
check_deps() {
  echo -e "${BOLD}[1/5] Checking dependencies...${NC}"

  if ! command -v docker &> /dev/null; then
    error "Docker is not installed. Install it from: https://docs.docker.com/get-docker/"
  fi
  success "Docker $(docker --version | cut -d' ' -f3 | tr -d ',')"

  # Support both Docker Compose v2 (plugin) and v1 (standalone)
  if docker compose version &> /dev/null 2>&1; then
    COMPOSE="docker compose"
  elif command -v docker-compose &> /dev/null; then
    COMPOSE="docker-compose"
  else
    error "Docker Compose not found. Update Docker Desktop or install the Compose plugin."
  fi
  success "Docker Compose (${COMPOSE})"
}

# ─── Step 2: Verify .env ─────────────────────────────────────────────────────
check_env() {
  echo ""
  echo -e "${BOLD}[2/5] Checking environment configuration...${NC}"

  if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
      cp .env.example .env
      warn ".env not found — created from .env.example"
      warn "Open .env and fill in your actual values, then re-run this script."
      echo ""
      echo -e "  ${YELLOW}nano .env${NC}"
      echo ""
      exit 0
    else
      error ".env file not found and no .env.example to copy from."
    fi
  fi

  # Warn if placeholder values are still present
  if grep -qE "^(VITE_API_URL|FRONTEND_URL|CLIENT_URL)=http://your-server" .env 2>/dev/null; then
    warn "Placeholder URLs detected in .env (e.g. http://your-server-ip-or-domain)."
    warn "Make sure to set your actual server IP or domain before deploying publicly."
    echo ""
    read -rp "  Continue anyway? (y/N): " proceed
    [[ "${proceed,,}" == "y" ]] || { echo "Aborting."; exit 0; }
  fi

  if grep -qE "^JWT_SECRET=REPLACE_WITH" .env 2>/dev/null; then
    warn "JWT_SECRET is still the placeholder value — change it before going live."
  fi

  if grep -qE "^ENCRYPTION_KEY=REPLACE_WITH" .env 2>/dev/null; then
    warn "ENCRYPTION_KEY is still the placeholder value — change it before going live."
  fi

  success ".env file found"
}

# ─── Step 3: Build and start containers ──────────────────────────────────────
build_and_start() {
  echo ""
  echo -e "${BOLD}[3/5] Building and starting containers...${NC}"
  info "This may take a few minutes on the first run."
  echo ""

  # --wait: blocks until all services with healthchecks report healthy.
  # Requires Docker Compose v2.4+. Falls back to a plain up if unsupported.
  if $COMPOSE up --build -d --wait --wait-timeout 180 2>/dev/null; then
    success "All containers are healthy"
  else
    warn "--wait flag not supported by your Compose version. Starting without health wait..."
    $COMPOSE up --build -d
    info "Waiting 20 seconds for services to initialize..."
    sleep 20
  fi
}

# ─── Step 4: Run interactive setup wizard ────────────────────────────────────
run_setup() {
  echo ""
  echo -e "${BOLD}[4/5] Running ThreeSixty initial setup...${NC}"
  info "You will be prompted to configure your organisation and create the manager (super-admin) account."
  echo ""

  # Run interactively — TTY is inherited from this terminal session.
  # If the manager account already exists, setup.js will ask if you want to update it.
  $COMPOSE exec backend node backend/scripts/setup.js

  echo ""
  success "Setup wizard complete"
}

# ─── Step 5: Print access URLs ───────────────────────────────────────────────
print_summary() {
  # Derive the base URL from VITE_API_URL (strip trailing /api)
  local api_url
  api_url=$(grep -E "^VITE_API_URL=" .env 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'")
  local base_url="${api_url%/api}"
  [ -z "$base_url" ] && base_url="http://your-server-ip"

  echo ""
  echo -e "${BOLD}╔══════════════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}║               Setup Complete!  🎉                ║${NC}"
  echo -e "${BOLD}╚══════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "  ${GREEN}${BOLD}Application:${NC}  ${base_url}"
  echo -e "  ${GREEN}${BOLD}API:${NC}          ${base_url}/api"
  echo ""
  echo -e "  ${CYAN}Useful commands:${NC}"
  echo -e "    View logs:      ${COMPOSE} logs -f"
  echo -e "    Stop:           ${COMPOSE} down"
  echo -e "    Restart:        ${COMPOSE} restart"
  echo -e "    Re-run setup:   ${COMPOSE} exec backend node backend/scripts/setup.js"
  echo -e "    Update app:     git pull && ${COMPOSE} up --build -d"
  echo ""
}

# ─── Main ────────────────────────────────────────────────────────────────────
main() {
  banner
  check_deps
  check_env
  build_and_start
  run_setup
  print_summary
}

main "$@"
