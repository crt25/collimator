#!/bin/bash

# migrate the database
yarn prisma migrate deploy

# the database must be fully migrated before running prisma:generate
yarn prisma:generate

# now we can build the application
yarn build

# start the application
yarn start