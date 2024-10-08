# syntax=docker/dockerfile:1

# Stage 1 - Build the scratch app
FROM node:22-bookworm-slim AS scratch-builder
WORKDIR /app
COPY ./frontend/app-scratch .
RUN corepack enable
RUN yarn install
RUN yarn build

# Stage 2 - Build the nginx server
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/
RUN rm -rf app-scratch
RUN mkdir app-scratch
COPY --from=scratch-builder /app/build /usr/share/nginx/app-scratch/
ENTRYPOINT ["nginx", "-g", "daemon off;"]
