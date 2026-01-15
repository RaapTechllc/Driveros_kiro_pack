#!/bin/bash
# worktree-manager.sh - Simple git worktree helper for agent isolation

set -euo pipefail

ROOT_DIR=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
REPO_NAME=$(basename "$ROOT_DIR")
WORKTREE_ROOT="${WORKTREE_ROOT:-"$(dirname "$ROOT_DIR")/.worktrees/$REPO_NAME"}"

usage() {
  cat << EOF
Usage: worktree-manager.sh <command> [args]

Commands:
  create <name> [branch]   Create a worktree (default branch: wt/<name>)
  list                     List all worktrees
  path <name>              Print the path for a worktree
  merge <name> [target]    Merge worktree branch into target (default: master)
  remove <name>            Remove a worktree
  prune                    Prune stale worktree refs

Environment:
  WORKTREE_ROOT            Base directory for worktrees

Examples:
  ./worktree-manager.sh create frontend-designer
  ./worktree-manager.sh merge frontend-designer main
  ./worktree-manager.sh remove frontend-designer
EOF
}

require_git() {
  if ! git -C "$ROOT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "Error: not inside a git repository."
    exit 1
  fi
}

worktree_path() {
  local name=$1
  echo "$WORKTREE_ROOT/$name"
}

create_worktree() {
  local name=$1
  local branch=${2:-"wt/$name"}
  local path
  path=$(worktree_path "$name")

  mkdir -p "$WORKTREE_ROOT"

  if git -C "$ROOT_DIR" show-ref --verify --quiet "refs/heads/$branch"; then
    git -C "$ROOT_DIR" worktree add "$path" "$branch"
  else
    git -C "$ROOT_DIR" worktree add -b "$branch" "$path"
  fi

  echo "Created worktree: $path (branch: $branch)"
}

merge_worktree() {
  local name=$1
  local target=${2:-"master"}
  local branch="wt/$name"

  if ! git -C "$ROOT_DIR" show-ref --verify --quiet "refs/heads/$branch"; then
    echo "Error: branch $branch not found."
    exit 1
  fi

  git -C "$ROOT_DIR" checkout "$target"
  git -C "$ROOT_DIR" merge --no-ff "$branch" -m "Merge worktree $name"
  echo "Merged $branch into $target"
}

remove_worktree() {
  local name=$1
  local path
  path=$(worktree_path "$name")

  git -C "$ROOT_DIR" worktree remove "$path"
  echo "Removed worktree: $path"
}

require_git

case "${1:-help}" in
  create)
    [ -n "${2:-}" ] || { echo "Missing worktree name."; usage; exit 1; }
    create_worktree "$2" "${3:-}"
    ;;
  list)
    git -C "$ROOT_DIR" worktree list
    ;;
  path)
    [ -n "${2:-}" ] || { echo "Missing worktree name."; usage; exit 1; }
    worktree_path "$2"
    ;;
  merge)
    [ -n "${2:-}" ] || { echo "Missing worktree name."; usage; exit 1; }
    merge_worktree "$2" "${3:-}"
    ;;
  remove)
    [ -n "${2:-}" ] || { echo "Missing worktree name."; usage; exit 1; }
    remove_worktree "$2"
    ;;
  prune)
    git -C "$ROOT_DIR" worktree prune
    ;;
  help|--help|-h|*)
    usage
    ;;
esac
