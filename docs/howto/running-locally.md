# Running ClassMosaic locally

## Prerequisites

Make sure the following tools are installed:

- [Yarn](https://yarnpkg.com/) (via corepack)
- [PostgreSQL](https://www.postgresql.org/)

## Clone the Repository

Download the source code and initialize submodules:

```sh
git clone https://github.com/crt25/collimator.git
cd collimator
git submodule update --init --recursive
```

## Backend Setup

?> Docker is only used for deployment. For local development, use the native setup described below.

1. Create a PostgreSQL database for ClassMosaic. See the  [official PostgreSQL documentation](https://www.postgresql.org/docs/current/) for details

2. Copy `.env.sample` to `.env` and set `DATABASE_URL` to match your database.

3. Install dependencies:
```sh
$ cd backend
$ yarn install
```

4. Apply migrations and generate the Prisma client:
```sh 
$ yarn prisma migrate deploy
$ yarn prisma:generate
```

5. Build the backend:
```sh
$ yarn build
```

6. Seed the database:
```sh
$ yarn prisma:seed
```

7. Start the backend in development mode:
```sh
$ yarn dev
```

## Frontend Setup

1. Move to the `frontend` folder.

2. If you changed the backend URI, copy `.env.development` to `.env` and update it. If not, you can keep `.env.development` as is.

3. Install dependencies:
```sh
$ yarn install
```

4. Start the frontend:
```sh
$ yarn dev
```
