# Subsocial Off-chain Storage by [DappForce](https://github.com/dappforce)

This app builds user feeds and notifications by subscribing to Substrate events.

To learn more about Subsocial, please visit [Subsocial Network](http://subsocial.network).

## Supported by Web3 Foundation

<img src="https://github.com/dappforce/dappforce-subsocial/blob/master/w3f-badge.svg" width="100%" height="200" alt="Web3 Foundation grants badge" />

Subsocial is a recipient of the technical grant from Web3 Foundation. We have successfully delivered all three milestones described in Subsocial's grant application. [Official announcement](https://medium.com/web3foundation/web3-foundation-grants-wave-3-recipients-6426e77f1230).

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

