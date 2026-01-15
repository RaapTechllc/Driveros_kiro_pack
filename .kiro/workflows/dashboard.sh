#!/bin/bash
# dashboard.sh - Generate the metrics dashboard

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
"$SCRIPT_DIR/metrics-tracker.sh" dashboard

echo "Dashboard generated at .kiro/metrics-dashboard.md"
