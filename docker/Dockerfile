FROM node:16.18.1-slim as builder

RUN apt update && apt install cpio -y

COPY package.json yarn.lock* ./
RUN yarn install

COPY . .

COPY localhost.env .env
RUN NODE_ENV=production yarn build

FROM node:16.18.1-alpine

WORKDIR /app
COPY --from=builder package.json tsconfig.json yarn.lock ./
COPY --from=builder build/ ./build
COPY --from=builder node_modules/ ./node_modules

EXPOSE 3001 3011 3012

ENTRYPOINT [ "yarn", "start" ]
