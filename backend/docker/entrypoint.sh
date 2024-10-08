#!/bin/bash

# migrate the database
yarn prisma migrate deploy

# start the application
yarn start