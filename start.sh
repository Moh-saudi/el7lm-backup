#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting Next.js application..."

# Set environment variables
export NODE_ENV=production
export PORT=${PORT:-3000}
export HOSTNAME=${HOSTNAME:-0.0.0.0}

echo "📋 Environment:"
echo "   NODE_ENV: $NODE_ENV"
echo "   PORT: $PORT"
echo "   HOSTNAME: $HOSTNAME"

# Check if standalone server exists
if [ ! -f "server.js" ]; then
    echo "❌ Error: server.js not found!"
    echo "📁 Current directory contents:"
    ls -la
    echo "📁 .next/standalone contents (if exists):"
    ls -la .next/standalone/ 2>/dev/null || echo "No .next/standalone directory"
    exit 1
fi

echo "✅ server.js found, starting application..."

# Start the application
exec node server.js 