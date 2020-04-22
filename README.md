# Offchain storage in PostgreSQL

## Setup

```sh
# Install Node.js dependencies
yarn

# Compile TypeScript
yarn build

# Run
yarn start
```

## Available scripts

+ `clean` - remove coverage data, Jest cache and transpiled files,
+ `build` - transpile TypeScript to ES6,
+ `start` - run subscribe and express-api servers,
+ `api` - run only express-api server,
+ `subscribe` - run only subscribe server

## Building from Docker

### Easiest start

To start Subsocial offchain storage separately (you should have docker-compose):

```
cd docker/
./compose.sh
```

It will start 3 containers: postgres, elasticsearch and offchain itself.

### Start all parts of Subsocial at once with [Subsocial-Starter](https://github.com/dappforce/dappforce-subsocial-starter)
