# Subsocial Faucet by [DappForce](https://github.com/dappforce)

Subsocial is a set of Substrate pallets with web UI that allows anyone to launch their own decentralized censorship-resistant social network aka community. Every community can be a separate Substrate chain and connect with other communities via a Polkadot-based relay chain.

You can think of this as decentralized versions of Reddit, Stack Exchange or Medium, where subreddits or communities of Stack Exchange or blogs on Medium run on their own chain. At the same time, users of these decentralized communities should be able to share their reputation or transfer coins and other values from one community to another via Polkadot relay chain.

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

# Run
yarn start
```

## Available scripts

+ `clean` - remove coverage data, Jest cache and transpiled files,
+ `build` - transpile TypeScript to ES6,
+ `start` - run subscribe and express-api servers,
+ `api` - run only express-api server,
+ `subscribe` - run only subscribe server

## Interaction with off-chain repository via Docker

### Start infrastructure

Run PostgreSQL, IPFS Node, IPFS Cluster and ElasticSearch in docker containers with one command:

```sh
./docker/run.sh
```

Additional options to provide to the development script mentioned above:

- `--stop` - just kills containers, data won't be lost.
- `--stop --clean` - stops the containers and removes all related docker volumes (data). At the end asks whether to delete `ipfs-data` folder in `./docker/` directory.
- `+peers` - add an IPFS peer to the starting node. (e.g. `+peers /ip4/<IP_ADDRESS>/tcp/4001/p2p/<PEER_ID>`) 

### Build your own docker image

```sh
docker build . -f docker/Dockerfile -t subsocial-offchain:latest
```

### Start all parts of Subsocial at once with [Subsocial Starter](https://github.com/dappforce/dappforce-subsocial-starter)

## License

Subsocial is [GPL 3.0](./LICENSE) licensed.
