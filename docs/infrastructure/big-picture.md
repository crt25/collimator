# Overview of the ClassMosaic modules

ClassMosaic is composed of several modules that communicate and work together. The diagram below provides a visual overview of these modules.

![](../assets/ClassMosaic-big-picture.png "Overview ClassMosaic")

## Frontend: NextJS

The `/frontend` is responsible for:

- Creating classes, lessons and tasks.
- Displaying app iframes (e.g., Scratch).
- Participating in [identity management](../identity-management/student.md).
- Performing analysis to compare task results.

## Backend: NestJS

The `/backend` module has three main responsibilities:

- Handling database requests.
- Storing keys to bridge students, teachers, and the OpenID provider.
- Converting task results into a [Generalized Abstract Syntax Tree (G-AST)](../data-analyzer/ast.md)

## Libraries : iframe-rpc

- `iframe-rpc` is used to exchange data between apps and the frontend in a platform-agnostic way.

- `iframe-rpc-react` is built on top of `iframe-rpc` to simplify its usage in a React environment, i.e. the frontend.

## Apps

An app implements a programming language within ClassMosaic.

Each app must:

- implement the `iframe-rpc` interface,
- provide tools to create, edit, and solve tasks,
- and support displaying submissions.

For example, the `scratch` app is built on top of the **Scratch GUI**.

Currently supported apps:

- [Scratch](../scratch/modifications.md)

Planned future apps:

- Python
