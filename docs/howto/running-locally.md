# Running ClassMosaic locally

## Prerequisites

Make sure the following tools are installed:

- [Yarn](https://yarnpkg.com/) (via corepack)
- [PostgreSQL](https://www.postgresql.org/)

You need a Microsoft account to login.

## Clone the Repository

Download the source code and initialize submodules:

```sh
git clone https://github.com/crt25/collimator.git
cd collimator
git submodule update --init --recursive
```

## Backend Setup

?> Docker is only used for deployment. For local development, use the native setup described below.

1. Create a PostgreSQL database for ClassMosaic. See the  [official PostgreSQL documentation](https://www.postgresql.org/docs/current/) for details.

2. Copy `.env.sample` to `.env` and set `DATABASE_URL` to match your database.

3. Install dependencies:
```sh
$ cd backend
$ yarn install
```
3. Customize the admin account by edit `prisma/seed/production.ts`:
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
Please keep your registration token. You need it later to connect to the frontend.

1. Start the backend in development mode:
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

## Scratch Setup

1. Move to the `apps/scratch` folder.
2. Ensure you have activated submodules with:
    ```sh
    $ git submodule update --init --recursive
    ```

3. Install dependencies:
    ```sh
    $ yarn install
    ```
4. Start the scratch app:
   ```sh
   $ yarn dev
   ```


## Visit the frontend

1. In your browser, go to `http://localhost:3000/` to check it works.
2. Modify the URL to `http://localhost:3000/login?registrationToken=XXXX`, where XXX is your Registration Token.
3. Now you can click on "Authenticate using Microsoft".
4. Enjoy!
