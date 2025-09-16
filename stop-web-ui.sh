#!/bin/bash

# EA Generator Web UI - Stop Script
# This script stops all running services

echo "🛑 Stopping EA Generator Web UI..."
echo "================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to kill processes on a port
kill_port() {
    local port=$1
    local name=$2
    
    if lsof -i :$port >/dev/null 2>&1; then
        echo -e "${YELLOW}Stopping $name on port $port...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null
        echo -e "${GREEN}✓ $name stopped${NC}"
    else
        echo -e "${YELLOW}$name not running on port $port${NC}"
    fi
}

# Kill processes from PID file if it exists
if [ -f "$SCRIPT_DIR/.web-ui-pids" ]; then
    echo -e "${YELLOW}Reading PIDs from .web-ui-pids file...${NC}"
    while IFS= read -r pid; do
        if kill -0 $pid 2>/dev/null; then
            kill -9 $pid 2>/dev/null
            echo -e "${GREEN}✓ Killed process $pid${NC}"
        fi
    done < "$SCRIPT_DIR/.web-ui-pids"
    rm -f "$SCRIPT_DIR/.web-ui-pids"
fi

# Kill processes on ports (fallback)
kill_port 3000 "API Server"
kill_port 3001 "Web UI"

# Kill any remaining node processes related to our app
echo -e "\n${YELLOW}Cleaning up any remaining processes...${NC}"
pkill -f "node.*api-server" 2>/dev/null
pkill -f "npm.*dev" 2>/dev/null
pkill -f "vite" 2>/dev/null

echo -e "\n${GREEN}================================="
echo -e "✓ All services stopped successfully"
echo -e "=================================${NC}"