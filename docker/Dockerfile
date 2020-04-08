FROM node:10 as builder

RUN apt update && apt install cpio -y

COPY package.json yarn.lock* ./
RUN yarn install --no-optional

COPY . .
RUN yarn && yarn cache clean --force
RUN NODE_ENV=production yarn build

FROM node:10

WORKDIR /app
COPY --from=builder package.json tsconfig.json .env yarn.lock ./
COPY --from=builder build/ ./build
COPY --from=builder node_modules/ ./node_modules

RUN yarn add global concurrently

EXPOSE 3001

CMD bash -c "yarn init-offchain && yarn start"
