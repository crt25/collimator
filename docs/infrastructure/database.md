# Database

To connect to a deployed database, use the AWS session manager for port forwarding:

```pwsh
aws ssm start-session `
  --target ecs:collimator-dev-backend_<task-id>_<container-runtime_id> `
  --document-name AWS-StartPortForwardingSessionToRemoteHost `
  --parameters '{"host": ["collimator-dev-database.c3ymcso8wh4o.eu-central-2.rds.amazonaws.com"], "portNumber":["5432"], "localPortNumber":["5555"]}' `
  --region eu-central-2

```

See https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-sessions-start.html#sessions-remote-port-forwarding and https://stackoverflow.com/a/67641633.

This will expose the remote Postgres port 5432 locally on port 5555.
In order to connect to it from within a docker container, use the address `host.docker.internal` as described [here](https://docs.docker.com/desktop/features/networking/#i-want-to-connect-from-a-container-to-a-service-on-the-host).
