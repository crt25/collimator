# syntax=docker/dockerfile:1
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN corepack enable
RUN yarn install
RUN yarn build

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
RUN chown -R nestjs:nodejs .
RUN chmod -R 700 .

USER nestjs

CMD [ "yarn", "start" ]