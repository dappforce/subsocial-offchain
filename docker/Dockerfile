FROM node:14-slim as builder

RUN apt update && apt install cpio -y

COPY package.json yarn.lock* ./
RUN yarn install

COPY . .

COPY localhost.env .env
RUN NODE_ENV=production yarn build

FROM node:14-alpine

WORKDIR /app
COPY --from=builder package.json tsconfig.json .env yarn.lock ./
COPY --from=builder build/ ./build
COPY --from=builder node_modules/ ./node_modules

RUN yarn global add concurrently pm2

EXPOSE 3001 3011 3012

ENTRYPOINT [ "pm2", "start", "--no-daemon" ]
CMD [ "yarn init-postgres && yarn start" ]
