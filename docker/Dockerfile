#LATEST TAG: 1.0.0
FROM node:8.15-alpine
USER 0:0
RUN mkdir /app
COPY app.js /app
COPY package.json /app
COPY env.settings.js /app
COPY entrypoint.sh /app

RUN apk update && apk upgrade \
    && echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories \
    && echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories \
    && apk add --no-cache \
    bash grep \
    harfbuzz@edge \
    chromium@edge \
    nss@edge \
    && rm -rf /var/lib/apt/lists/* \
    /var/cache/apk/* \
    /usr/share/man \
    /tmp/*

ENV CHROME_BIN=/usr/bin/chromium-browser \
    CHROME_PATH=/usr/bin/chromium-browser \
    SHELL=/bin/bash \
    LIGHTHOUSE_SETTINGS=env.settings

WORKDIR /app/
RUN yarn
RUN chown -R 1000:1000 /app/

USER 1000:1000

ENTRYPOINT ["/app/entrypoint.sh"]
EXPOSE 8080
