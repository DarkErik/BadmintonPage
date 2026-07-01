#!/usr/bin/env bash

set -euo pipefail

# Project locations
VUE_PROJECT_DIR="FrontEnd/BadmintonFrontend"
SERVER_DIR="BadmintonPage"
SERVER_ENTRY="index.js"

echo "Building Vue project..."
cd "$VUE_PROJECT_DIR"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Build the Vue application
npm run build

echo "Vue build completed."

echo "Starting backend server with forever..."
cd - >/dev/null

cd "$SERVER_DIR"

# Install backend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Stop any existing instance of the same application
forever stop "$SERVER_ENTRY" >/dev/null 2>&1 || true

# Start the server
forever start "$SERVER_ENTRY"

echo "Backend server started successfully."