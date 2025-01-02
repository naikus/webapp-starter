# WepApp Starter
This project is organized  as a npm [workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces).
This is a monorepo for two projects.

```bash
./server
./web
```

# Install dependencies
```bash
npm install
```

# Start a dev server (api server)
```bash
npm run server
```

# Start a web app in a separate terminal
```bash
npm run web
```

# Build and Run
```npm run build```
Then
```bash
cd dist
sh ./run.sh
```

To start local tunnel, in your root directory:

```bash
# To start the localtunnel
npx lt --port 8080 --local-host "127.0.0.1" --print-requests
OR
npx lt --subdomain <subdomain> --port <local-port> --local-host "127.0.0.1" --print-requests
```

Copy the URL into the browser to access the app (The first time you'll be promped to enter your pubilc IP)
Follow the instructions on the page to get it. 

# Docker
To build a docker image use the following command:

```bash
docker build -t webapp-starter .
```

To run use the following:
```bash
docker run -d -p 8080:8080 [-e ENV_VAR=value]* webapp-starter:latest
```

e.g.
```bash

docker run -d -p 8080:8080
  -e LOG_LEVEL=info
  webapp-starter:latest
```

Following env values can be set:
```bash
LOG_LEVEL=info
API_LOG_LEVEL=debug
DEBUG=true
```
