FROM node:10

RUN apt update

WORKDIR /app

COPY package.json package-lock.json* setup-ipfs.sh ./
RUN yarn add global concurrently
RUN yarn
RUN ./setup-ipfs.sh

COPY . .

RUN yarn build
COPY src/df-types/ ./build/src/df-types/

EXPOSE 3001

CMD bash -c "yarn init-offchain && yarn start"