# Deployment

ClassMosaic uses GitHub workflows and OpenTofu for deployment and tests. Infrastructure as code is maintained in the [collimator-infrastructure](https://github.com/crt25/collimator-infrastructure) repository.

## Overview

The workflow builds applications and prepares the deployment by creating a Docker image.

The root OpenTofu configuration in `collimator-infrastructure` orchestrates the deployment of modules in AWS. These include a VPC, Fargate services for the backend, S3 buckets for static frontends, an RDS database, and a CloudFront distribution to route traffic and serve content efficiently.

## Configuration and secrets management

The deployment is driven by the `development.yml` and `production.yml` workflows, which both call the reusable `deploy_collimator.yml` workflow. Tests run through the `tests.yml` workflow. Their variables and secrets are stored in the GitHub repository settings.

Each key exists once per environment, prefixed with `DEV_` (used by `development.yml`) or `PROD_` (used by `production.yml`) — for example `DEV_AWS_REGION` and `PROD_AWS_REGION`. The base names are:

| Key (prefixed with `DEV_` / `PROD_`) | Type |
| ----------- | ---------- |
| ROLE_TO_ASSUME | Repository Variable |
| AWS_REGION | Repository Variable |
| DEPLOY_URL | Repository Variable |
| ENTRA_ID_CLIENT_ID | Repository Variable |
| BACKEND_ECR_REGISTRY_URI | Repository Variable |
| BACKEND_IMAGE_NAME | Repository Variable |
| BACKEND_CLUSTER_NAME | Repository Variable |
| BACKEND_SERVICE_NAME | Repository Variable |
| FRONTEND_BUCKET_ID | Repository Variable |
| SCRATCH_APP_BUCKET_ID | Repository Variable |
| JUPYTER_APP_BUCKET_ID | Repository Variable |
| CLOUDFRONT_DISTRIBUTION_ID | Repository Variable |
| FRONTEND_SENTRY_DSN | Repository Variable |
| APP_SCRATCH_SENTRY_DSN | Repository Variable |
| APP_JUPYTER_SENTRY_DSN | Repository Variable |
| SENTRY_AUTH_TOKEN | Repository Secret |
| SONAR_TOKEN | Repository Secret |

A single `SENTRY_AUTH_TOKEN` is shared by the backend and both apps (there are no per-app auth tokens). `SONAR_TOKEN` is also available as a Dependabot secret.
