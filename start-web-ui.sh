#!/bin/bash

# EA Generator Web UI - Startup Script
# This script starts both the API server and the web UI

echo "🚀 Starting EA Generator Web UI..."
echo "================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to check if a port is in use
check_port() {
    lsof -i :$1 >/dev/null 2>&1
    return $?
}

# Kill any existing processes on our ports
echo -e "${YELLOW}Checking for existing processes...${NC}"

if check_port 3000; then
    echo -e "${YELLOW}Port 3000 is in use. Killing existing process...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

if check_port 3001; then
    echo -e "${YELLOW}Port 3001 is in use. Killing existing process...${NC}"
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Start API server
echo -e "\n${BLUE}Starting API Server on port 3000...${NC}"
cd "$SCRIPT_DIR/web-ui"
node api-server.js &
API_PID=$!

# Wait for API server to start
sleep 2

# Check if API server started successfully
if kill -0 $API_PID 2>/dev/null; then
    echo -e "${GREEN}✓ API Server started successfully (PID: $API_PID)${NC}"
else
    echo -e "${RED}✗ Failed to start API Server${NC}"
    exit 1
fi

# Start Web UI
echo -e "\n${BLUE}Starting Web UI on port 3001...${NC}"
cd "$SCRIPT_DIR/web-ui"
npm run dev &
UI_PID=$!

# Wait for UI to start
sleep 3

# Check if UI started successfully
if kill -0 $UI_PID 2>/dev/null; then
    echo -e "${GREEN}✓ Web UI started successfully (PID: $UI_PID)${NC}"
else
    echo -e "${RED}✗ Failed to start Web UI${NC}"
    kill $API_PID
    exit 1
fi

# Save PIDs to file for stop script
echo "$API_PID" > "$SCRIPT_DIR/.web-ui-pids"
echo "$UI_PID" >> "$SCRIPT_DIR/.web-ui-pids"

echo -e "\n${GREEN}================================="
echo -e "✨ EA Generator Web UI is ready!"
echo -e "=================================${NC}"
echo -e "\n${BLUE}📊 API Server:${NC} http://localhost:3000"
echo -e "${BLUE}🌐 Web UI:${NC}     http://localhost:3001"
echo -e "\n${YELLOW}To stop all services, run: ./stop-web-ui.sh${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}\n"

# Function to handle shutdown
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    kill $API_PID 2>/dev/null
    kill $UI_PID 2>/dev/null
    rm -f "$SCRIPT_DIR/.web-ui-pids"
    echo -e "${GREEN}✓ All services stopped${NC}"
    exit 0
}

# Set up trap to handle Ctrl+C
trap cleanup INT TERM

# Wait for processes
wait $API_PID $UI_PID