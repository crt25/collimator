# Installation

## Developer setup guide

This guide provides instructions for setting up the ClassMosaic project for local development. The project is a monorepo and uses Git submodules as well.

The repository is structured into several key directories, including `backend`, `frontend`, `apps` for the applications, `e2e` for end-to-end tests, and `terraform` for infrastructure as code.

### Prerequisites

Make sure the following tools are installed:

- [Yarn](https://yarnpkg.com/) (via corepack)
- [Node.js](https://nodejs.org/fr) `^22.0`
- [PostgreSQL](https://www.postgresql.org/)

You need a Microsoft account to log in. It can be either a personal account or an organizational account, provided the organization has allowed its users to access the application.

### Clone the repository

Download the source code and initialize submodules:

```sh
git clone https://github.com/crt25/collimator.git
cd collimator
git submodule update --init --recursive --progress
```

### Backend setup

?> The `docker/` folder and `backend/Dockerfile` are only used for deployment. For local development, use the native setup described below.

1. Create a PostgreSQL database for ClassMosaic.

   You can either use the [Postgres Docker](#postgres-docker) instructions in the appendices, or install PostgreSQL directly (see the [official documentation](https://www.postgresql.org/docs/current/)).

2. In the `backend` folder, copy `.env.sample` to `.env` and set `DATABASE_URL` to match your database, if needed.

3. Install dependencies:

    ```sh
    $ cd backend
    $ yarn install
    ```

4. Configure the admin account by setting environment variables in your `.env` file:

    ```sh
    SEED_ADMIN_EMAIL=yourMicrosoftAccountEmail
    SEED_ADMIN_USERNAME=yourName
    FRONTEND_HOSTNAME=http://localhost:3000
    ```

    If not set, the seeding will use default values (`admin@example.com` and `Admin`).

5. Apply migrations and generate the Prisma client:

    ```sh
    # From: backend/
    $ yarn prisma migrate deploy
    $ yarn prisma:generate
    ```

6. Build the backend:

    ```sh
    $ yarn build
    ```

7. Seed the database:

    ```sh
    $ yarn prisma:seed
    ```

    In the console, you should see:

    ```sh
    Created admin user with email yourMicrosoftAccountEmail.
    Visit the following URL to complete your registration: http://localhost:3000/login?registrationToken=yourRegistrationToken
    ```

    Keep this URL. You will need it to log in from the frontend.

    ?> If an admin user with the specified email already exists, seeding will be skipped.

8. Start the backend in development mode:

    ```sh
    $ yarn dev
    ```

### Frontend setup

1. Move to the `frontend` folder.

2. If you changed the backend URI, copy `.env.development` to `.env` and update it. If not, you can keep `.env.development` as is.

3. Install dependencies, then start the frontend:

    ```sh
    $ yarn install
    $ yarn dev
    ```

### Scratch setup

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

### Jupyter setup
See [apps/jupyter/README.md](../../apps/jupyter/README.md) for detailed instructions.

### Visit the frontend

1. Open the registration URL displayed after seeding (e.g., `http://localhost:3000/login?registrationToken=XXXX`).
2. Click "Authenticate using Microsoft".

### Appendices

#### Postgres Docker

This process creates two Docker containers:  

- one for the PostgreSQL server
- one for pgAdmin (a web-based management tool)

1. Create a PostgreSQL container:

    ```sh
    $ docker run --name postgres \
        -p 5432:5432 \
        -e POSTGRES_PASSWORD=password \
        -d postgres
    ```

2. Create a pgAdmin container:

    ```sh
    $ docker run --name pgadmin \
        -p 5050:80 \
        -e PGADMIN_DEFAULT_EMAIL=YOUR_EMAIL \
        -e PGADMIN_DEFAULT_PASSWORD=YOUR_PASSWORD \
        -d dpage/pgadmin4
    ```

3. Find the virtual IP address postgres is working on:

    ```sh
    $ docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' postgres
    ```
4. Open pgAdmin in your browser: http://localhost:5050
5. Log in with the email and password you set in step 2.
6. In pgAdmin, select **Servers** (top-left).
7. Select **Object > Register > Server**, then enter a server name (any name).
8. Under **Connection**, use:
    - Host name/address: (IP address from step 3)
    - Port: 5432 (default postgres port)
    - Username: postgres
    - Password: password (value from step 1)
9. Save. Update the `backend/.env` file by setting `DATABASE_URL` to `postgresql://postgres:password@localhost:5432/database?schema=public`.

## Infrastructure and deployment

The project uses Terraform to manage its cloud infrastructure on AWS. The configuration is located in the `terraform/infrastructure` directory. It defines modules for networking, database, backend (Fargate), frontend (S3/CloudFront), and apps (S3/CloudFront).

This setup is intended for deployment and is not required for local development, but it provides context on how the application is hosted in a production-like environment. Files into `.github/workflows` provide another way to understand the project architecture.

See [Deployment](../infrastructure/deployment.md) for more.
