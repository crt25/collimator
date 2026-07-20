# Installation

## Developer setup guide

This guide provides instructions for setting up the ClassMosaic project for local development. The project is a monorepo and uses Git submodules as well.

The repository is structured into several key directories, including `backend`, `frontend`, `apps` for the applications, `e2e` for end-to-end tests, and `terraform` for infrastructure as code.

### Prerequisites

You will need the tool [Mise](https://mise.jdx.dev/) to be installed.

You will also need a Microsoft account to log in. It can be either a personal account or an organizational account, provided the organization has allowed its users to access the application.

Furthermore, on Windows, you may need:
- [Developer Mode](https://learn.microsoft.com/en-us/windows/advanced-settings/developer-mode) to be active
- `pwsh` (PowerShell 7+) to be installed 

### Clone the repository

Download the source code and initialize submodules:

```sh
git clone https://github.com/crt25/collimator.git
cd collimator
git submodule update --init --recursive --progress
```

### Installing the development tools

```sh
mise trust
mise install
task setup:dev
```

### Runtime environment

You can start and stop the PostgreSQL-based database system required by ClassMosaic through the following commands:
```sh
task db:run   # start the PostgreSQL container
task db:stop  # stop the PostgreSQL container
task db:clean # erase the database 
```

By default, when you run `task setup:dev` the PostgreSQL container will be running.

### Backend setup

1. By running the commands above, a `.env` file will have been created in your `backend` folder,
   with a `DATABASE_URL` matching the PostgreSQL container configuration. 

2. Configure the admin account by setting environment variables in your `backend/.env` file:

    ```sh
    SEED_ADMIN_EMAIL=yourMicrosoftAccountEmail
    SEED_ADMIN_USERNAME=yourName
    FRONTEND_HOSTNAME=http://localhost:3000
    ```

    If not set, the seeding will use default values (`admin@example.com` and `Admin`).

3. Seed the database:

    ```sh
    $ task db:seed:dev
    ```

    In the console, you should see:

    ```sh
    Created admin user with email yourMicrosoftAccountEmail.
    Visit the following URL to complete your registration: http://localhost:3000/login?registrationToken=yourRegistrationToken
    ```

    Keep this URL. You will need it to log in from the frontend.

    ?> If an admin user with the specified email already exists, seeding will be skipped.

4. Start the backend in development mode:

    ```sh
    $ task backend:dev
    ```

### Frontend setup

1. If you changed the backend URI, you will need to update it in `frontend/.env`.

2. Start the frontend in development mode:

    ```sh
    $ task frontend:dev
    ```

### Scratch setup

1. Start the app in development mode:

    ```sh
    $ task apps:scratch:dev
    ```

### Jupyter setup
1. 
2. Start the app in development mode:

    ```sh
    $ task apps:jupyter:dev
    ```

See [apps/jupyter/README.md](https://github.com/crt25/collimator/blob/main/apps/jupyter/README.md) for more information.

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
