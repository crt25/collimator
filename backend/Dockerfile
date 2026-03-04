# syntax=docker/dockerfile:1
FROM node:22-trixie-slim
WORKDIR /app

# install dependencies
RUN apt-get update -y && apt-get upgrade -y && apt-get install -y openssl

# copy over the data
COPY . .

RUN corepack enable

# create folders for corepack - they must be accessible by the non-privileged user
RUN mkdir -p /nonexistent/.cache/
RUN mkdir -p /nonexistent/.yarn/
RUN chmod -R 777 /nonexistent/.cache/
RUN chmod -R 777 /nonexistent/.yarn/

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
RUN chown -R nestjs:nodejs .
RUN chmod -R 700 .

USER nestjs

RUN yarn install

ENTRYPOINT ["docker/entrypoint.sh"]
