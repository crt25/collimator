# Running ClassMosaic locally

## Prerequisites

Make sure the following tools are installed:

- [Yarn](https://yarnpkg.com/) (via corepack)
- [PostgreSQL](https://www.postgresql.org/)

You need a Microsoft account to log in.

## Clone the Repository

Download the source code and initialize submodules:

```sh
git clone https://github.com/crt25/collimator.git
cd collimator
git submodule update --init --recursive --progress
```

## Backend Setup

?> Docker is only used for deployment. For local development, use the native setup described below.

1. Create a PostgreSQL database for ClassMosaic. See the  [official PostgreSQL documentation](https://www.postgresql.org/docs/current/) for details.

2. In the `backend` folder, copy `.env.sample` to `.env` and set `DATABASE_URL` to match your database.

3. Install dependencies:
```sh
$ cd backend
$ yarn install
```

3. Customize the admin account by editing `prisma/seed/production.ts`:
    ```ts
    export const seedProduction = async (prisma: PrismaClient): Promise<void> => {
      const count = await prisma.user.count({
          where: { email: "yourMicrosoftAccountEmail" },
    });
    if (count === 0) {
        const admin = await prisma.user.create({
        data: {
            email: "yourMicrosoftAccountEmail",
            authenticationProvider: AuthenticationProvider.MICROSOFT,
            name: "yourName",
            type: "ADMIN",
        },
        });

    ```

5. Apply migrations and generate the Prisma client:
```sh 
$ yarn prisma migrate deploy
$ yarn prisma:generate
```

1. Build the backend:
```sh
$ yarn build
```

1. Seed the database:
```sh
$ yarn prisma:seed
```
In the console, you should see:
```sh
[
  'admin',
  {
    id: 1,
    name: 'yourName',
    oidcSub: null,
    email: 'yourMicrosoftAccountEmail',
    authenticationProvider: 'MICROSOFT',
    type: 'ADMIN'
  },
  'yourRegistrationToken'
]
```             
Keep your registration token. You will need it to log in from the frontend.

1. Start the backend in development mode:
```sh
$ yarn dev
```

## Frontend Setup

1. Move to the `frontend` folder.

2. If you changed the backend URI, copy `.env.development` to `.env` and update it. If not, you can keep `.env.development` as is.

3. Install dependencies, then start the frontend:
```sh
$ yarn install
$ yarn dev
```

## Scratch Setup

1. Move to the `apps/scratch` folder.
2. Ensure submodules are initialized:
    ```sh
    $ git submodule update --init --recursive
    ```

3. Install dependencies and start the app:
    ```sh
    $ yarn install
    $ yarn dev
    ```

## Visit the frontend

1. Open your browser at `http://localhost:3000/`.
2. Modify the URL to `http://localhost:3000/login?registrationToken=XXXX`, replacing XXXX with your registration token.
3. Click "Authenticate using Microsoft".
