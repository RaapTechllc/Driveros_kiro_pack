#!/bin/bash
# self-improve.sh - Lightweight learning capture for Kiro agents

set -euo pipefail

ROOT_DIR=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
PROJECT_NAME=$(basename "$ROOT_DIR")
EVOLUTION_DIR="${KIRO_EVOLUTION_DIR:-$HOME/.kiro/evolution}"
DEFAULT_AGENT="${KIRO_AGENT:-global}"

usage() {
  cat << EOF
Usage: self-improve.sh <command> [args]

Commands:
  add <type> "<message>" [agent]  Add a learning (types: correction, prefer, pattern, avoid)
  path [agent]                    Print evolution log path

Examples:
  ./self-improve.sh add correction "Use pnpm not npm" orchestrator
  ./self-improve.sh path orchestrator

Notes:
  Logs are stored in: $EVOLUTION_DIR
EOF
}

ensure_dir() {
  mkdir -p "$EVOLUTION_DIR"
}

log_path() {
  local agent=${1:-$DEFAULT_AGENT}
  echo "$EVOLUTION_DIR/${agent}-evolution.md"
}

add_learning() {
  local type=$1
  local message=$2
  local agent=${3:-$DEFAULT_AGENT}
  local file
  local ts
  local type_upper

  type_upper=$(echo "$type" | tr '[:lower:]' '[:upper:]')
  ts=$(date '+%Y-%m-%d %H:%M')
  file=$(log_path "$agent")

  ensure_dir

  if [ ! -f "$file" ]; then
    cat > "$file" << EOF
# ${agent^} Evolution Log

EOF
  fi

  cat >> "$file" << EOF
## ${ts} - ${type_upper}
- Project: $PROJECT_NAME
- Note: $message

EOF

  echo "Logged to: $file"
}

case "${1:-help}" in
  add)
    [ -n "${2:-}" ] || { echo "Missing type."; usage; exit 1; }
    [ -n "${3:-}" ] || { echo "Missing message."; usage; exit 1; }
    add_learning "$2" "$3" "${4:-}"
    ;;
  path)
    log_path "${2:-}"
    ;;
  help|--help|-h|*)
    usage
    ;;
esac
