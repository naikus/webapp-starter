# docker run -d -p 5443:5050 -e API_LOG_LEVEL=verbose webapp-starter:latest

FROM node:18-bullseye-slim
# FROM node:18.17.1-alpine3.17

LABEL vendor="Naiksu" \
    maintainer="aniketn3@gmail.com" \
    version="1.0" \
    name="Starter App" \
    description="Starter react app with fastify api server"

ENV HOST=0.0.0.0 \
    PORT=8080 \
    API_LOG_LEVEL="info" \
    APP_USER=appuser \
    APP_PASSWD=passwd

RUN useradd -Ms /bin/bash ${APP_USER} \
    # && useradd -ms /bin/bash  docker \
    # && chown -R ubuntu:ubuntu /home/ubuntu \
    && echo root:PASSw0rd | /usr/sbin/chpasswd \
    && echo ${APP_USER}:${APP_PASSWD} | /usr/sbin/chpasswd

# Project dir
RUN mkdir -p /opt/livehelp-server \
    && chown -R ${APP_USER}:${APP_USER} /opt/livehelp-server

WORKDIR /opt/livehelp-server
# Copy binary and starter script
COPY --chown=appuser:appuser dist/run-exec.sh    ./run-exec.sh
COPY --chown=appuser:appuser dist/run.sh         ./run.sh
COPY --chown=appuser:appuser dist/lib            ./lib
COPY --chown=appuser:appuser dist/public         ./public
COPY --chown=appuser:appuser dist/package.json   ./package.json

RUN chmod +x ./run.sh
RUN chmod +x ./run-exec.sh

# Install git
RUN apt update && apt --assume-yes install git

# Run npm install
RUN npm install --omit=dev

# Un-Install git
RUN apt --assume-yes remove git

EXPOSE ${PORT}

USER appuser

CMD ["./run-exec.sh"]
