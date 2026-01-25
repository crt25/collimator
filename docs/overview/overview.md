# Implementation

The system is architected as a multi-package monorepo, called `crt25/collimator`. The primary components are the `frontend`, `backend`, and the embedded `apps` dedicated to support programming languages. End-to-end testing is managed within the `e2e` directory.

This diagram shows the high-level architecture of the ClassMosaic project.

![Overview ClassMosaic](../assets/ClassMosaic-big-picture.png)

And this diagram shows the data flow of the project.

![Overview ClassMosaic](../assets/ClassMosaic-Data-Flow.png)

## Frontend

The frontend is a Next.js application written in TypeScript. It serves as the main user interface for both teachers and students.

It is responsible for:

- Creating classes, lessons and tasks.
- Displaying app iframes (e.g., Scratch).
- Participating in [identity management](../identity-management/student.md).
- Performing analysis to compare task results.

## Backend

The backend is a server-side application built with the NestJS framework and TypeScript. It provides the API that the frontend consumes for all data operation.

It has three main responsibilities:

- Handling database requests.
- Storing keys to bridge students, teachers, and the OpenID provider.
- Converting task results into a [Generalized Abstract Syntax Tree (G-AST)](../data-analyzer/ast-conversion.md)

## Apps

A crucial part of ClassMosaic is the integration of language applications, located in `apps`.

An app is embedded into the frontend using an `<iframe>` and communicates with the parent Next.js application via `iframe-rpc-react`. This allows the main application to load tasks, get submissions, and control the programming environment.

Each app must:

- implement the `iframe-rpc` interface,
- provide tools to create, edit, and solve tasks,
- and support displaying submissions.

Currently supported apps:

- [Scratch](../scratch/scratch.md)
- [Python](../python/python.md)

## `iframe-rpc` libraries

- `iframe-rpc` is used to exchange data between apps and the frontend in a platform-agnostic way.

- `iframe-rpc-react` is built on top of `iframe-rpc` to simplify its usage in a React environment, i.e. the frontend.

See also: [`iframe-rpc` Documentation](../architecture/iframe-rpc.md)
