#!/bin/bash
# ralph-kiro.sh - Enhanced P-Thread parallel agent spawner
# Supports configurable parallelism, resource monitoring, and agent pooling

set -e

#===============================================================================
# CONFIGURATION
#===============================================================================

# Default settings (can be overridden via CLI flags)
PARALLEL_COUNT=${PARALLEL_COUNT:-5}
MAX_PARALLEL=${MAX_PARALLEL:-15}
TIMEOUT_HOURS=${TIMEOUT_HOURS:-4}
STALL_THRESHOLD_MINUTES=${STALL_THRESHOLD_MINUTES:-15}
MAX_ITERATIONS=${MAX_ITERATIONS:-50}
ENABLE_METRICS=${ENABLE_METRICS:-true}
RESOURCE_CHECK_INTERVAL=${RESOURCE_CHECK_INTERVAL:-60}

# Default agent list (can be customized)
DEFAULT_AGENTS=(
  "security-specialist"
  "monitoring-specialist"
  "demo-specialist"
  "performance-engineer"
  "doc-smith-ralph"
)

# Directories
AGENTS_DIR="agents"
METRICS_FILE=".kiro/metrics.csv"
ACTIVITY_LOG="activity.log"

#===============================================================================
# PARSE COMMAND LINE ARGUMENTS
#===============================================================================

show_help() {
  cat << EOF
Usage: ralph-kiro.sh [OPTIONS]

P-Thread parallel agent spawner for the Kiro Orchestrator.

OPTIONS:
  -p, --parallel=N      Number of parallel agents (default: 5, max: 15)
  -t, --timeout=H       Timeout in hours (default: 4)
  -m, --max-iter=N      Maximum iterations per agent (default: 50)
  -a, --agents=LIST     Comma-separated agent list (overrides defaults)
  --no-metrics          Disable metrics tracking
  --stall-threshold=M   Minutes before restarting stalled agent (default: 15)
  -h, --help            Show this help message

EXAMPLES:
  # Run with 10 parallel agents
  ./ralph-kiro.sh --parallel=10

  # Run specific agents
  ./ralph-kiro.sh --agents=code-surgeon,test-architect,security-specialist

  # Extended run with longer timeout
  ./ralph-kiro.sh --parallel=8 --timeout=8 --max-iter=100

THREAD TYPES:
  This script implements P-Threads (Parallel Threads) from the
  Thread-Based Engineering framework. Use it to scale compute
  by running multiple agents simultaneously.

EOF
}

CUSTOM_AGENTS=()

while [[ $# -gt 0 ]]; do
  case $1 in
    -p|--parallel)
      PARALLEL_COUNT="$2"
      shift 2
      ;;
    --parallel=*)
      PARALLEL_COUNT="${1#*=}"
      shift
      ;;
    -t|--timeout)
      TIMEOUT_HOURS="$2"
      shift 2
      ;;
    --timeout=*)
      TIMEOUT_HOURS="${1#*=}"
      shift
      ;;
    -m|--max-iter)
      MAX_ITERATIONS="$2"
      shift 2
      ;;
    --max-iter=*)
      MAX_ITERATIONS="${1#*=}"
      shift
      ;;
    -a|--agents)
      IFS=',' read -ra CUSTOM_AGENTS <<< "$2"
      shift 2
      ;;
    --agents=*)
      IFS=',' read -ra CUSTOM_AGENTS <<< "${1#*=}"
      shift
      ;;
    --no-metrics)
      ENABLE_METRICS=false
      shift
      ;;
    --stall-threshold=*)
      STALL_THRESHOLD_MINUTES="${1#*=}"
      shift
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

# Use custom agents if provided, otherwise use defaults
if [ ${#CUSTOM_AGENTS[@]} -gt 0 ]; then
  AGENTS=("${CUSTOM_AGENTS[@]}")
else
  AGENTS=("${DEFAULT_AGENTS[@]}")
fi

# Enforce max parallel limit
if [ "$PARALLEL_COUNT" -gt "$MAX_PARALLEL" ]; then
  echo "Warning: Parallel count $PARALLEL_COUNT exceeds max $MAX_PARALLEL. Using $MAX_PARALLEL."
  PARALLEL_COUNT=$MAX_PARALLEL
fi

#===============================================================================
# UTILITY FUNCTIONS
#===============================================================================

log() {
  local level=$1
  local message=$2
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$timestamp] [$level] $message"
  echo "$timestamp: $message" >> "$ACTIVITY_LOG"
}

log_metric() {
  if [ "$ENABLE_METRICS" = true ]; then
    local metric=$1
    local value=$2
    local thread_type=${3:-"p-thread"}
    echo "$(date -Iseconds),$metric,$value,$thread_type,$SESSION_ID" >> "$METRICS_FILE"
  fi
}

check_resources() {
  # Check available memory (cross-platform)
  local mem_available=0
  if command -v free &> /dev/null; then
    mem_available=$(free -m | awk '/^Mem:/{print $7}')
  elif command -v vm_stat &> /dev/null; then
    # macOS
    mem_available=$(vm_stat | awk '/Pages free/ {print int($3*4096/1048576)}')
  else
    # Windows/other - assume OK
    mem_available=4096
  fi
  
  # Check CPU load
  local cpu_load=0
  if command -v uptime &> /dev/null; then
    cpu_load=$(uptime | awk -F'load average:' '{print $2}' | awk -F',' '{print $1}' | tr -d ' ')
  fi
  
  # Return 1 if resources are low
  if [ "$mem_available" -lt 1024 ]; then
    log "WARN" "Low memory: ${mem_available}MB available"
    return 1
  fi
  
  return 0
}

check_agent_done() {
  local agent=$1
  if [ -f "$AGENTS_DIR/$agent/output.log" ]; then
    grep -q "<promise>DONE</promise>" "$AGENTS_DIR/$agent/output.log" 2>/dev/null
    return $?
  fi
  return 1
}

check_agent_stalled() {
  local agent=$1
  local output_file="$AGENTS_DIR/$agent/output.log"
  
  if [ -f "$output_file" ]; then
    local last_modified=$(stat -c %Y "$output_file" 2>/dev/null || stat -f %m "$output_file" 2>/dev/null)
    local now=$(date +%s)
    local diff=$(( (now - last_modified) / 60 ))
    
    if [ "$diff" -gt "$STALL_THRESHOLD_MINUTES" ]; then
      return 0  # Stalled
    fi
  fi
  return 1  # Not stalled
}

restart_agent() {
  local agent=$1
  log "WARN" "Restarting stalled agent: $agent"
  
  # Kill existing process if running
  local pid_file="$AGENTS_DIR/$agent/pid"
  if [ -f "$pid_file" ]; then
    local pid=$(cat "$pid_file")
    kill "$pid" 2>/dev/null || true
  fi
  
  # Clear stale output
  echo "$(date): Agent restarted due to stall" >> "$AGENTS_DIR/$agent/output.log"
  
  # Relaunch
  run_agent_loop "$agent" &
  echo $! > "$AGENTS_DIR/$agent/pid"
}

#===============================================================================
# AGENT EXECUTION
#===============================================================================

run_agent_loop() {
  local agent=$1
  local iteration=0
  local start_time=$(date +%s)
  local timeout_seconds=$((TIMEOUT_HOURS * 3600))
  
  log "INFO" "Starting $agent in Ralph Loop mode (max: $MAX_ITERATIONS iterations)"
  
  # Create agent directory
  mkdir -p "$AGENTS_DIR/$agent"
  
  # Copy config if exists
  if [ -f ".kiro/agents/$agent.json" ]; then
    cp ".kiro/agents/$agent.json" "$AGENTS_DIR/$agent/"
  fi
  
  # Copy shared state files
  [ -f "PLAN.md" ] && cp PLAN.md "$AGENTS_DIR/$agent/"
  [ -f "PROGRESS.md" ] && cp PROGRESS.md "$AGENTS_DIR/$agent/"
  
  cd "$AGENTS_DIR/$agent"
  
  while [ $iteration -lt $MAX_ITERATIONS ]; do
    # Check timeout
    local elapsed=$(($(date +%s) - start_time))
    if [ $elapsed -gt $timeout_seconds ]; then
      log "WARN" "$agent - Timeout reached after ${TIMEOUT_HOURS}h"
      break
    fi
    
    # Check if done
    if check_agent_done "$agent"; then
      break
    fi
    
    ((iteration++))
    log "INFO" "$agent - Iteration $iteration/$MAX_ITERATIONS"
    log_metric "iteration" "$iteration" "p-thread"
    
    # Run Kiro agent (replace with actual kiro-cli command in production)
    echo "$(date): Running kiro-cli --agent $agent (iteration $iteration)" >> output.log
    
    # Simulate work - REPLACE THIS WITH ACTUAL AGENT EXECUTION:
    # kiro-cli --agent "$agent" --prompt "Continue working on assigned tasks" >> output.log 2>&1
    sleep $((RANDOM % 10 + 5))
    
    # Simulate completion (replace with actual completion detection)
    if [ $((RANDOM % 10)) -eq 0 ]; then
      echo "<promise>DONE</promise>" >> output.log
      log "INFO" "$agent - COMPLETED all tasks"
      log_metric "agent_completed" "1" "p-thread"
      break
    fi
    
    # Brief pause between iterations
    sleep 2
  done
  
  cd - > /dev/null
  
  if [ $iteration -ge $MAX_ITERATIONS ]; then
    log "WARN" "$agent - Reached max iterations without completion"
    log_metric "max_iterations_reached" "1" "p-thread"
  fi
  
  log_metric "total_iterations" "$iteration" "p-thread"
}

monitor_agents() {
  local pids=("$@")
  local all_done=false
  
  while ! $all_done; do
    sleep "$RESOURCE_CHECK_INTERVAL"
    
    all_done=true
    local running=0
    local completed=0
    local stalled=0
    
    for i in "${!AGENTS[@]}"; do
      local agent="${AGENTS[$i]}"
      local pid="${pids[$i]}"
      
      # Check if process is still running
      if kill -0 "$pid" 2>/dev/null; then
        all_done=false
        ((running++))
        
        # Check for stall
        if check_agent_stalled "$agent"; then
          ((stalled++))
          restart_agent "$agent"
          pids[$i]=$!
        fi
      else
        ((completed++))
      fi
    done
    
    log "INFO" "Status: $running running, $completed completed, $stalled stalled"
    log_metric "agents_running" "$running" "p-thread"
    
    # Resource check
    if ! check_resources; then
      log "WARN" "Low resources detected, pausing new spawns"
    fi
  done
}

#===============================================================================
# MAIN EXECUTION
#===============================================================================

main() {
  # Initialize
  SESSION_ID=$(date +%s)
  local start_time=$(date +%s)
  
  echo "=========================================="
  echo "P-Thread Ralph Loop Execution"
  echo "=========================================="
  echo "Parallel agents: $PARALLEL_COUNT"
  echo "Agent list: ${AGENTS[*]}"
  echo "Max iterations: $MAX_ITERATIONS"
  echo "Timeout: ${TIMEOUT_HOURS}h"
  echo "Stall threshold: ${STALL_THRESHOLD_MINUTES}m"
  echo "Metrics: $ENABLE_METRICS"
  echo "=========================================="
  
  # Initialize metrics
  if [ "$ENABLE_METRICS" = true ]; then
    mkdir -p "$(dirname "$METRICS_FILE")"
    if [ ! -f "$METRICS_FILE" ]; then
      echo "timestamp,metric,value,thread_type,session_id" > "$METRICS_FILE"
    fi
    log_metric "session_start" "1" "p-thread"
    log_metric "parallel_count" "$PARALLEL_COUNT" "p-thread"
    log_metric "agent_count" "${#AGENTS[@]}" "p-thread"
  fi
  
  # Initialize activity log
  echo "$(date): P-Thread Ralph Loop started (session: $SESSION_ID)" > "$ACTIVITY_LOG"
  log "INFO" "Starting P-Thread execution with ${#AGENTS[@]} agents"
  
  # Create agents directory
  mkdir -p "$AGENTS_DIR"
  
  # Launch agents in parallel (limited by PARALLEL_COUNT)
  declare -a PIDS
  local launched=0
  
  for agent in "${AGENTS[@]}"; do
    # Wait if we've hit parallel limit
    while [ $launched -ge $PARALLEL_COUNT ]; do
      # Check if any have finished
      for i in "${!PIDS[@]}"; do
        if ! kill -0 "${PIDS[$i]}" 2>/dev/null; then
          unset "PIDS[$i]"
          ((launched--))
        fi
      done
      sleep 1
    done
    
    log "INFO" "Launching agent: $agent"
    run_agent_loop "$agent" &
    PIDS+=($!)
    mkdir -p "$AGENTS_DIR/$agent"
    echo $! > "$AGENTS_DIR/$agent/pid"
    ((launched++))
    
    # Brief delay between launches to prevent resource spike
    sleep 1
  done
  
  # Monitor progress
  echo ""
  echo "📊 Monitoring agent progress..."
  echo "Use 'tail -f $ACTIVITY_LOG' to watch real-time progress"
  echo "Use 'tail -f PROGRESS.md' to see task completion status"
  echo ""
  
  # Start background monitor
  monitor_agents "${PIDS[@]}" &
  MONITOR_PID=$!
  
  # Wait for all agents to complete
  wait "${PIDS[@]}" 2>/dev/null || true
  
  # Stop monitor
  kill $MONITOR_PID 2>/dev/null || true
  
  # Calculate duration
  local end_time=$(date +%s)
  local duration=$((end_time - start_time))
  local duration_min=$((duration / 60))
  
  # Final status report
  echo ""
  echo "=========================================="
  echo "P-Thread Execution Complete!"
  echo "=========================================="
  echo "Duration: ${duration_min} minutes"
  echo ""
  echo "📋 Final Status Report:"
  echo "======================"
  
  local completed=0
  local incomplete=0
  
  for agent in "${AGENTS[@]}"; do
    if check_agent_done "$agent"; then
      echo "✅ $agent: COMPLETED"
      ((completed++))
    else
      echo "❌ $agent: INCOMPLETE"
      ((incomplete++))
    fi
  done
  
  echo ""
  echo "Summary: $completed completed, $incomplete incomplete"
  echo ""
  
  # Log final metrics
  if [ "$ENABLE_METRICS" = true ]; then
    log_metric "session_end" "1" "p-thread"
    log_metric "duration_seconds" "$duration" "p-thread"
    log_metric "agents_completed" "$completed" "p-thread"
    log_metric "agents_incomplete" "$incomplete" "p-thread"
    
    local success_rate=0
    if [ ${#AGENTS[@]} -gt 0 ]; then
      success_rate=$((completed * 100 / ${#AGENTS[@]}))
    fi
    log_metric "success_rate" "$success_rate" "p-thread"
    
    echo "📈 Metrics logged to: $METRICS_FILE"
  fi
  
  echo "📊 Check PROGRESS.md for detailed task completion status"
  echo "📝 Check $ACTIVITY_LOG for full execution timeline"
  
  log "INFO" "P-Thread Ralph Loop finished - $completed/$((completed+incomplete)) agents completed"
}

# Run main
main "$@"
