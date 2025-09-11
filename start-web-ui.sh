#!/bin/bash

echo "🚀 Starting MCP EA Suite Web UI"
echo "================================"
echo ""
echo "Building packages..."
cd packages/common && npm run build
cd ../tools && npm run build  
cd ../agent-sprint0 && npm run build
cd ../..

echo ""
echo "Starting web server..."
cd apps/web-ui
npm run dev &

echo ""
echo "✅ Web UI is starting on http://localhost:3001"
echo ""
echo "Features:"
echo "  - Interactive form for repository analysis"
echo "  - Real-time Sprint 0 EA review generation"
echo "  - Architecture diagrams and documentation"
echo "  - Risk assessment and ROI calculations"
echo "  - Export capabilities for all artifacts"
echo ""
echo "Press Ctrl+C to stop the server"

# Wait for the server to be killed
wait