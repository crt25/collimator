# How to add a new app

To implement a new app (or programming language), you need to follow this steps.

1. Install the app and implement JSON-RPC.
2. Adapt the backend stuff to integrate the new app and define a new AST converter.
3. Introduce the new task type into the frontend.

## App

1. Create a specific folder into `apps`.
2. Install the app, its dependencies and tools.

Next needed steps can be very specific, according to the choosen app:

- Customize the app (ex. Scratch)
- Create a dedicated extension (ex. Jupyter)

### JSON-RPC

To support the integration into the CRT platform, you need to implement its `iframe-rpc` API for applications.

Declare events that needed to be sent to the backend or received by, for example, `GetTask` or `LoadTask`.

## Backend

You need to adapt the database schema. Modify the `backend/prisma/schema.prisma` and add the a new type of task:

```psl
enum TaskType {
  SCRATCH
  JUPYTER
  NEWTASKTYPE
}
```

Then generate a migration and apply it:

```sh
prisma migrate dev --name added_my_new_task_type
```

### AST converter

In the folder `backend/src/ast/converters`, create a folder for the app (and/or language).

You probably can use ANTLR4 project to obtain a parser if the language is [supported](https://github.com/antlr/grammars-v4). If not, you can see our implementation of Scratch.

Adapt all commands prefixed by `antlr:generate` in the `package.json` to your needs.

Then use the parser to write specific converters for each node in it. Each node must be translated into one or more AST elements.

Create a general converter named `convertMyAppToGeneralAst` in the `backend/src/ast/converters/my_app/index.ts` and add it into `backend/src/ast/converters/solution-conversion-worker.piscina.ts`.

See Python implementation as example.

## Frontend

Add the app hostname in environment files `.env.development` and `.env.test.sample` and add the following line in `frontend/src/utilities/constants.ts`:

```ts
export const myNewAppHostName = process.env
  .NEXT_PUBLIC_MY_NEW_APP_HOSTNAME as unknown as string
```

In your code editor, search `TaskType.SCRATCH`, copy the block code around the condition. Then paste it and adapt with your new task type.

## Testing

It's very specific to the application and will be not covered in this documentation.

## Deployment

ClassMosaic uses Github workflows and Terraform recipes. For a deployment, you need to update files to add the new app and satisfy its dependencies and requirements.

## Documentation

We invite you to document your process and your modifications about this all previous step in one or more markdown files.
