# Makefile for devin

setup: setup-repo setup-deps setup-db

setup-repo:
	git pull
	git submodule update --init --recursive
	cd apps/jupyter && git submodule update --init --recursive

setup-deps:
	cd backend && yarn install
	cd frontend && yarn install
	cd apps/scratch && yarn install
	cd apps/jupyter && make init

setup-db:
	cd backend && yarn prisma migrate dev

build: build-frontend build-backend build-scratch build-jupyter

build-frontend:
	cd frontend && yarn build

build-backend:
	cd backend && yarn build

build-scratch:
	cd apps/scratch && yarn build

build-jupyter:
	cd apps/jupyter && make build

build-e2e: build-e2e-frontend build-e2e-backend build-e2e-scratch

build-e2e-frontend:
	cd e2e && yarn build:frontend

build-e2e-backend:
	cd e2e && yarn build:backend

build-e2e-scratch:
	cd e2e && yarn build:scratch

test: test-unit test-e2e

test-unit: test-frontend test-backend test-scratch test-storybook

test-e2e:
	cd e2e && yarn test

test-e2e-nobuild:
	cd e2e && yarn test:nobuild

test-frontend:
	cd frontend && yarn test

test-backend:
	cd backend && yarn test

test-scratch:
	cd apps/scratch && yarn test

test-storybook:
	cd storybook && yarn test

lint: lint-frontend lint-backend

lint-frontend:
	cd frontend && yarn lint

lint-backend:
	cd backend && yarn lint

dev-backend:
	cd backend && yarn start:dev

dev-frontend:
	cd frontend && yarn dev

dev-scratch:
	cd apps/scratch && yarn dev

dev:
	make dev-backend & make dev-frontend & make dev-scratch

storybook:
	cd storybook && yarn storybook

jupyter-serve:
	cd apps/jupyter && make serve

i18n-update:
	cd frontend && yarn i18n:update

prisma-generate:
	cd backend && yarn prisma generate

api-generate:
	cd frontend && yarn update:api

clean-jupyter:
	cd apps/jupyter && make clean

clean: clean-jupyter
	rm -rf frontend/node_modules backend/node_modules apps/scratch/node_modules
	rm -rf frontend/dist backend/dist apps/scratch/dist
	rm -rf e2e/node_modules

devin-pull:
	git pull

devin-deps:
	make setup-deps && make setup-db

devin-lint:
	make lint

devin-test:
	make test-unit

devin-dev:
	make dev-backend & make dev-frontend & make dev-scratch

.PHONY: setup setup-repo setup-deps setup-db test test-unit test-e2e test-frontend test-backend test-scratch test-storybook build build-frontend build-backend build-scratch build-jupyter build-e2e build-e2e-frontend build-e2e-backend build-e2e-scratch clean clean-jupyter lint lint-frontend lint-backend dev dev-backend dev-frontend dev-scratch storybook jupyter-serve i18n-update prisma-generate api-generate devin-pull devin-deps devin-lint devin-test devin-dev