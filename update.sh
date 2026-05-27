#!/usr/bin/env bash
# update.sh — Pull latest code and rebuild ThreeSixty containers
# Usage: chmod +x update.sh && ./update.sh

set -euo pipefail

# ─── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

info()    { echo -e "${CYAN}  ▸ $*${NC}"; }
success() { echo -e "${GREEN}  ✓ $*${NC}"; }
warn()    { echo -e "${YELLOW}  ⚠ $*${NC}"; }
error()   { echo -e "${RED}  ✗ $*${NC}"; exit 1; }
banner()  {
  echo ""
  echo -e "${BOLD}╔══════════════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}║         ThreeSixty  ·  Update                    ║${NC}"
  echo -e "${BOLD}╚══════════════════════════════════════════════════╝${NC}"
  echo ""
}

# ─── Step 1: Check dependencies ──────────────────────────────────────────────
check_deps() {
  echo -e "${BOLD}[1/4] Checking dependencies...${NC}"

  if ! command -v docker &> /dev/null; then
    error "Docker is not installed."
  fi
  success "Docker found"

  if docker compose version &> /dev/null 2>&1; then
    COMPOSE="docker compose"
  elif command -v docker-compose &> /dev/null; then
    COMPOSE="docker-compose"
  else
    error "Docker Compose not found."
  fi
  success "Docker Compose found"

  if ! command -v git &> /dev/null; then
    error "git is not installed."
  fi
  success "git found"
}

# ─── Step 2: Pull latest code ────────────────────────────────────────────────
pull_code() {
  echo ""
  echo -e "${BOLD}[2/4] Pulling latest code...${NC}"

  # Warn about uncommitted local changes that could block the pull
  if ! git diff --quiet || ! git diff --cached --quiet; then
    warn "You have uncommitted local changes."
    warn "These may conflict with incoming changes."
    echo ""
    read -rp "  Continue with git pull anyway? (y/N): " proceed
    [[ "${proceed,,}" == "y" ]] || { echo "Aborting. Commit or stash your changes first."; exit 0; }
  fi

  # Save the current commit hash so we can show what changed
  BEFORE_HASH=$(git rev-parse HEAD)
  BEFORE_SHORT=$(git rev-parse --short HEAD)

  info "Current commit: ${BEFORE_SHORT}"
  echo ""

  git pull

  AFTER_HASH=$(git rev-parse HEAD)
  AFTER_SHORT=$(git rev-parse --short HEAD)

  echo ""
  if [ "$BEFORE_HASH" = "$AFTER_HASH" ]; then
    success "Already up to date (${AFTER_SHORT}) — no new commits."
    NEW_COMMITS=0
  else
    success "Updated to ${AFTER_SHORT}"
    NEW_COMMITS=1
    echo ""
    echo -e "${BOLD}  New commits:${NC}"
    # Show commits added since the last version, one line each
    git log --oneline --no-decorate "${BEFORE_HASH}..${AFTER_HASH}" | sed 's/^/    /'
    echo ""

    # Remind about VITE_API_URL if .env.example changed
    if git diff --name-only "${BEFORE_HASH}..${AFTER_HASH}" | grep -q ".env.example"; then
      warn ".env.example changed — check if new variables need to be added to your .env"
    fi
  fi
}

# ─── Step 3: Rebuild and restart containers ──────────────────────────────────
rebuild() {
  echo -e "${BOLD}[3/4] Rebuilding and restarting containers...${NC}"

  if [ "${NEW_COMMITS:-0}" -eq 0 ]; then
    info "No new commits — skipping rebuild."
    echo ""
    read -rp "  Force a rebuild anyway? (y/N): " force
    if [[ "${force,,}" != "y" ]]; then
      echo ""
      success "Nothing to do."
      print_summary
      exit 0
    fi
  fi

  info "Building images and restarting services..."
  echo ""

  if $COMPOSE up --build -d --wait --wait-timeout 180 2>/dev/null; then
    success "All containers are healthy"
  else
    warn "--wait not supported by your Compose version — starting without health wait..."
    $COMPOSE up --build -d
    info "Waiting 20 seconds for services to initialize..."
    sleep 20
  fi
}

# ─── Step 4: Status and summary ──────────────────────────────────────────────
print_summary() {
  echo ""
  echo -e "${BOLD}[4/4] Status${NC}"
  echo ""
  $COMPOSE ps
  echo ""

  local api_url
  api_url=$(grep -E "^VITE_API_URL=" .env 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'" || echo "")
  local base_url="${api_url%/api}"
  [ -z "$base_url" ] && base_url="http://your-server-ip"

  echo -e "${BOLD}╔══════════════════════════════════════════════════╗${NC}"
  echo -e "${BOLD}║               Update Complete!                   ║${NC}"
  echo -e "${BOLD}╚══════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "  ${GREEN}${BOLD}Application:${NC}  ${base_url}"
  echo ""
  echo -e "  ${CYAN}Useful commands:${NC}"
  echo -e "    View logs:    ${COMPOSE} logs -f"
  echo -e "    Stop:         ${COMPOSE} down"
  echo -e "    Restart:      ${COMPOSE} restart"
  echo ""
}

# ─── Main ────────────────────────────────────────────────────────────────────
main() {
  banner
  check_deps
  pull_code
  rebuild
  print_summary
}

main "$@"
