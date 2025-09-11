#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}                    MCP EA Suite - Full Stack Startup                           ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Function to kill all background processes on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down services...${NC}"
    kill $(jobs -p) 2>/dev/null
    echo -e "${GREEN}✅ All services stopped${NC}"
    exit 0
}

# Set up trap to call cleanup on script exit
trap cleanup EXIT INT TERM

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing root dependencies...${NC}"
    npm install
fi

# Build all packages first
echo -e "${BLUE}🔨 Building packages...${NC}"
echo "  Building @ea-mcp/common..."
(cd packages/common && npm run build) > /dev/null 2>&1
echo -e "  ${GREEN}✓${NC} Common package built"

echo "  Building @ea-mcp/tools..."
(cd packages/tools && npm run build) > /dev/null 2>&1
echo -e "  ${GREEN}✓${NC} Tools package built"

echo "  Building @ea-mcp/agent-sprint0..."
(cd packages/agent-sprint0 && npm run build) > /dev/null 2>&1
echo -e "  ${GREEN}✓${NC} Sprint0 agent built"

echo ""
echo -e "${BLUE}🚀 Starting services...${NC}"
echo ""

# Start the backend API server
echo -e "${GREEN}▶ Backend API Server${NC}"
echo "  Starting on port 3000..."
(
    cd packages/agent-sprint0
    node dist/api-server.js 2>&1 | while read line; do
        echo -e "  ${YELLOW}[BACKEND]${NC} $line"
    done
) &
BACKEND_PID=$!
echo -e "  ${GREEN}✓${NC} Backend started (PID: $BACKEND_PID)"

# Give backend a moment to start
sleep 2

# Start the frontend web UI
echo ""
echo -e "${GREEN}▶ Frontend Web UI${NC}"
echo "  Starting on port 3001..."
(
    cd apps/web-ui
    npm run dev 2>&1 | while read line; do
        echo -e "  ${BLUE}[FRONTEND]${NC} $line"
    done
) &
FRONTEND_PID=$!
echo -e "  ${GREEN}✓${NC} Frontend started (PID: $FRONTEND_PID)"

# Wait for services to be ready
echo ""
echo -e "${BLUE}⏳ Waiting for services to be ready...${NC}"
sleep 5

# Display access information
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}                           Services Running                                     ${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  🌐 ${BLUE}Web UI:${NC}          http://localhost:3001"
echo -e "  🔧 ${BLUE}API Server:${NC}      http://localhost:3000/api"
echo -e "  📊 ${BLUE}Health Check:${NC}    http://localhost:3000/health"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Keep script running and wait for interrupt
wait