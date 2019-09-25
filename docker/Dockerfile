FROM node:10-buster as builder

RUN apt update

WORKDIR /offchain

COPY package.json package-lock.json* setup-ipfs.sh ./
RUN yarn
RUN ./setup-ipfs.sh

COPY . .

RUN yarn build
COPY src/df-types/ ./offchain/build/src/df-types/
# RUN apt install -y postgresql postgresql-contrib
# USER postgres
# RUN createdb subsocial
# RUN yarn init-offchain

FROM node:10-buster

COPY --from=builder /offchain/* ./
RUN yarn add global concurrently

CMD ["yarn", "start"]