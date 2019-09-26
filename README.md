# Offchain storage in PostgreSQL

## Setup

```sh
# Install Node.js dependencies:
yarn

# Run TypeScript compilation:
yarn build


## Usage
yarn start
```

## Available scripts

+ `clean` - remove coverage data, Jest cache and transpiled files,
+ `build` - transpile TypeScript to ES6,
+ `start` - run subscribe and express-api servers,
+ `api` - run only express-api server,
+ `subscribe` - run only subscribe server

## What's included:

+ [TypeScript][typescript] [3.5][typescript-35],
+ [TSLint][tslint] with [Microsoft rules][tslint-microsoft-contrib],
+ [Jest][jest] unit testing and code coverage,
+ Type definitions for Node.js and Jest,
+ [Prettier][prettier] to enforce a consistent code style,
+ [NPM scripts for common operations](#available-scripts),
+ .editorconfig for consistent file format.

The main code is located in the `src/substrate-subsrcibe`

## Run with Docker

### Option 1

- Clone [subsocial-offchain repository](https://github.com/dappforce/dappforce-subsocial-offchain-storage.git)
- From the root of the repo run `./docker/compose.sh`

### Option 2

1. Run PostgreSQL with `docker run --restart always -d -e POSTGRES_DB=subsocial -e POSTGRES_USER=dev -e POSTGRES_PASSWORD=1986 -p 5432:5432 -v /tmp/subsocial/postgres:/var/lib/postgresql/data postgres:alpine`
2. Run offchain Node.JS app with `docker run --restart on-failure --network="host" -d dappforce/subsocial-offchain:latest`
