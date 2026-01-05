#!/bin/bash
# Bash script to set environment variables for Serverless deployment
# Run this before deploying: source set-env-vars.sh

# Read from .env file if it exists
if [ -f .env ]; then
    echo "Loading variables from .env file..."
    export $(grep -v '^#' .env | xargs)
    echo "Environment variables loaded from .env"
else
    echo ".env file not found. Please set environment variables manually:"
    echo "export MONGODB_URI=\"your-connection-string\""
    echo "export JWT_SECRET=\"your-secret-key\""
fi

echo ""
echo "Environment variables set. You can now run: npm run deploy:dev"

