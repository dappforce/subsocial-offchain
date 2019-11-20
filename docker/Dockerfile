FROM node:10 as builder

RUN apt update

COPY package.json yarn.lock* setup-ipfs.sh ./
RUN yarn install --no-optional

RUN ./setup-ipfs.sh

COPY . .
RUN yarn add global concurrently
RUN yarn && yarn cache clean --force

RUN NODE_ENV=production yarn build
COPY src/df-types/ ./build/src/df-types/

FROM node:10

WORKDIR /app
COPY --from=builder package.json tsconfig.json .env ./
COPY --from=builder build/ ./build
COPY --from=builder node_modules/ ./node_modules

EXPOSE 3001

CMD bash -c "yarn init-offchain && yarn start"
