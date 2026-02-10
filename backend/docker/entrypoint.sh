#!/bin/bash

# migrate the database
yarn prisma migrate deploy

# the database must be fully migrated before running prisma:generate
yarn prisma:generate

# and seed the database
yarn prisma:seed

# start the application
yarn start