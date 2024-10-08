FROM node:22-bookworm-slim as scratch-builder
WORKDIR /app
COPY ./frontend/app-scratch .
RUN corepack enable
RUN yarn install
RUN yarn build