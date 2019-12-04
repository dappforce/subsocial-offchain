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
COPY --from=builder package.json tsconfig.json .env setup-ipfs.sh ./
COPY --from=builder build/ ./build
COPY --from=builder node_modules/ ./node_modules

RUN ./setup-ipfs.sh
RUN yarn add global concurrently
RUN ln -s /root/.jsipfs /data

EXPOSE 3001
VOLUME [ "/data" ]

CMD bash -c "yarn init-offchain && yarn start"
