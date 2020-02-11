FROM node:10 as builder

RUN apt update && apt install cpio -y

COPY package.json yarn.lock* setup-ipfs.sh ./
RUN yarn install --no-optional

COPY . .
RUN yarn && yarn cache clean --force
RUN NODE_ENV=production yarn build
COPY src/df-types/ ./build/src/df-types/

FROM node:10

WORKDIR /app
COPY --from=builder package.json tsconfig.json .env setup-ipfs.sh yarn.lock ./
COPY --from=builder build/ ./build
COPY --from=builder node_modules/ ./node_modules

RUN ./setup-ipfs.sh
RUN yarn add global concurrently

VOLUME /root/.jsipfs
EXPOSE 3001

CMD bash -c "yarn init-offchain && yarn start"
