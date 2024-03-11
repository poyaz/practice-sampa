FROM node:20-alpine3.19 AS build

RUN apk add --no-cache curl bash su-exec git; \
    mkdir -p /app /app/src; \
    chown -R node:node /app; \
    npm i -g @nestjs/cli

WORKDIR /app

COPY --chown=node:node \
        tsconfig*.json \
        package.json \
        package-lock.json \
        nest-cli.json \
        ./

COPY --chown=node:node \
        src/ \
        ./src

COPY --chown=node:node \
        prisma/ \
        ./prisma/

RUN su-exec node sh -c "npm install && npx prisma generate && npm run build"

FROM node:20-alpine3.19 

RUN apk add --no-cache curl su-exec bash git; \
    mkdir -p /app /app/dist /app/storage/tmp; \
    chown -R node:node /app

WORKDIR /app

COPY --chown=node:node \
        package.json \
        package-lock.json \
        ./

RUN su-exec node bash -c "npm install --omit=dev"

COPY --from=build --chown=node:node \
        /app/dist \
        ./dist

COPY --chown=node:node \
        prisma/ \
        /app/prisma/

COPY ./docker/images/app/docker-entrypoint.sh /usr/local/bin/

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

CMD npm run start:prod