# Subsocial Off-chain Storage by [DappForce](https://github.com/dappforce)

This app builds user feeds and notifications by subscribing to Substrate events.

To learn more about Subsocial, please visit [Subsocial Network](http://subsocial.network).

## Setup

```sh
# Install Node.js dependencies
yarn

# Compile TypeScript
yarn build

# Run app
yarn start
```

## Available Scripts

+ `clean` - remove coverage data, Jest cache and transpiled files,
+ `build` - transpile TypeScript to ES6,
+ `start` - run subscribe and express-api servers,
+ `api` - run only express-api server,
+ `subscribe` - run only subscribe server

## Building from Docker

### Easiest Start

To start Subsocial offchain storage separately (you should have docker-compose):

```
cd docker/
./compose.sh
```

It will start 3 containers: postgres, elasticsearch and offchain itself.

### Start all parts of Subsocial at once with [Subsocial Starter](https://github.com/dappforce/dappforce-subsocial-starter).

## License

Subsocial is [GPL 3.0](./LICENSE) licensed.

