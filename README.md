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

# Create databases
```bash
cd ./server
# Run migrations
npm run migrate
# Add seed dta
npm run seed
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


# Adding seed data and creating new migrations
```bash
cd ./server
npx knex --knexfile db/knexfile.js migrate:make <migration_name>
# Seed
npx knex --knexfile db/knexfile.js seed:make <seed_name>
```
