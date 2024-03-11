## Description

This project is a practice challenge for Sampa company

## Installation

```bash
$ npm install
### Or using make file
$ make testinstall
```

## Running the app (Docker)

First, you should copy file `env.example` to `.env` in **env/app** and **env/mysql**. Then run docker-compose

```bash
$ cp ./env/app/.env.example ./env/app/.env
### Using your favorite editor and fill env ./env/app/.env (The important variable is DB_MYSQL_URL, JWT_SECRET_KEY)
$ vi ./env/app/.env

$ cp ./env/mysql/.env.example ./env/mysql/.env
### Using your favorite editor and fill env ./env/app/.env (The all of variable is require)
$ vi ./env/mysql/.env

### --------------------------

$ docker compose -f docker-compose.yml -f docker/docker-compose.env.yml up --build
### Or using Makefile
$ make compose
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Api docs (swagger)

The swagger API docs exist in http://127.0.0.1:3000/api url

## Websocket usage

For using websocket and listen to events, at first make sure using **socket.io** then send any message to `impression`
topic and listen to below events:

* like
* dislike

After each time, the like and dislike is called by user, the event was emitted and fire in above topic

## Test

```bash
# unit tests
$ npm run test
### Or using Makefile
$ make test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
