#!/bin/bash
node -r dotenv/config lib/application.js | pino-pretty
