# Deployment

ClassMosaic uses GitHub workflows and OpenTofu for deployment and tests. Infrastructure as code is maintained in the [collimator-infrastructure](https://github.com/crt25/collimator-infrastructure) repository.

## Overview

The workflow builds applications and prepares the deployment by creating a Docker image.

The root OpenTofu configuration in `collimator-infrastructure` orchestrates the deployment of modules in AWS. These include a VPC, Fargate services for the backend, S3 buckets for static frontends, an RDS database, and a CloudFront distribution to route traffic and serve content efficiently.

## Configuration and secrets management

Variables and secrets for the `deployment.yml` and `test.yml` are stored in the GitHub repository settings.

| Key | Type |
| ----------- | ---------- |
| APP_SCRATCH_SENTRY_AUTH_TOKEN | Repository Secret |
| APP_SCRATCH_SENTRY_DNS | Repository Variable |
| AWS_REGION | Repository Variable |
| BACKEND_SENTRY_AUTH_TOKEN | Repository Secret |
| DEPLOY_URL | Repository Variable |
| DEV_ROLE_TO_ASSUME | Repository Variable |
| ECR_REGISTRY_URI | Repository Variable |
| ENTRA_ID_CLIENT_ID | Repository Variable |
| FRONTEND_SENTRY_AUTH_TOKEN | Repository Secret |
| FRONTEND_SENTRY_DSN | Repository Variable |
| SONAR_TOKEN | Repository Secret |
| SONAR_TOKEN | Dependabot Secret |
