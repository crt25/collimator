# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim
WORKDIR /app

# copy over the data
COPY . .

RUN corepack enable

# create folders for corepack - they must be accessible by the non-privileged user
RUN mkdir -p /nonexistent/.cache/
RUN mkdir -p /nonexistent/.yarn/
RUN chmod -R 777 /nonexistent/.cache/
RUN chmod -R 777 /nonexistent/.yarn/

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN chown -R nextjs:nodejs .
RUN chmod -R 700 .

USER nextjs

RUN yarn install
RUN yarn build

CMD [ "yarn", "start" ]