#!/bin/bash

# Server
export HOST=${HOST:-0.0.0.0}
export PORT=${PORT:-5050}
# SSL_KEY_PATH=
# SSL_CERT_PATH=
export LOG_LEVEL=${LOG_LEVEL:-info}
export DEBUG=${DEBUG:-false}

node -r dotenv/config lib/application.js