# How to add a new app

To integrate a new application (or programming language), follow the steps below.

## Overview

Adding a new app requires work on three main parts of the system:

1. The application itself (installation and JSON-RPC integration).
2. The backend (database, task type, and AST conversion).
3. The frontend (task type handling and configuration).

## App

### Setup

1. Create a dedicated folder inside the `apps` directory.
2. Install the application, its dependencies, and any required tools.

Additional steps depend on the application you are integrating. For example:

- Customize the application (e.g. Scratch)
- Create a dedicated extension or plugin (e.g. [Jupyter](../python/python.md))

### JSON-RPC integration

To integrate the app into ClassMosaic, you must implement the [`iframe-rpc` API](../architecture/iframe-rpc.md).

This includes declaring the events exchanged between the app and the frontend (e.g. `GetTask`, `LoadTask`).

As an example, to retrieve the height of the embedded iframe, you must implement the `GetHeight` event.

In a non-React environment, this can be implemented in a file named `iframe-api.ts`, for example:

```typescript
import { AppCrtIframeApi, AppHandleRequestMap, GetHeight } from "./iframe-rpc/src";

const logModule = "[Embedded MyApp]";

const initIframeApi = (handleRequest: AppHandleRequestMap): void => {
  const crtPlatform = new AppCrtIframeApi({
    ...handleRequest,
  });

  if (window.parent && window.parent !== window) {
    crtPlatform.setTarget(window.parent);
  }

  window.addEventListener(
    "message",
    crtPlatform.handleWindowMessage.bind(crtPlatform),
  );
};

export class EmbeddedMyAppCallbacks {

  async getHeight(): Promise<number> {
    return document.body.scrollHeight;
  }

  export const setupIframeApi = (callbacks: EmbeddedMyAppCallbacks): void => {
    initIframeApi({
      getHeight: callbacks.getHeight.bind(callbacks),
    });
  };
}

```

## Backend

### Database and task type

You must update the database schema to support the new task type.

Edit  `backend/prisma/schema.prisma` and add a new value to the `TaskType` enum:

```psl
enum TaskType {
  SCRATCH
  JUPYTER
  NEW_TASK_TYPE
}
```

Then generate and apply a migration:

```sh
prisma migrate dev --name added_my_new_task_type
```

### AST converter

The AST converter is responsible for transforming solutions from their original format (e.g., Scratch project JSON) into a standardized, language-agnostic General AST. See [AST conversion](../data-analyzer/ast-conversion.md) to go deeper.

As a first step, create a folder for the app (and/or the language) in `backend/src/ast/converters`.

#### Nodes converters

If the language is supported by ANTLR, you can use an [existing grammar](https://github.com/antlr/grammars-v4). Otherwise, refer to the [Scratch implementation](../scratch/scratch.md) as an example.

1. Adapt all commands prefixed with `antlr:generate` in `package.json` to match your grammar and output.
2. Use the generated parser to implement converters for each node. Each node must be converted into one or more elements of the general AST.

The Python implementation can be used as a reference. Review the files in `backend/src/ast/converters/python`, starting by the `README.md`.

#### Main converter

1. Create a main converter function `convertMyAppToGeneralAst` in the `backend/src/ast/converters/my_app/index.ts`.
2. Declare this converter in `backend/src/ast/converters/solution-conversion-worker.piscina.ts`.

## Frontend

1. Add the application hostname to the environment files:
   - `.env.development`
   - `.env.test.sample`
2. Declare the hostname constant in `frontend/src/utilities/constants.ts`:
  ```ts
  export const myNewAppHostName = process.env
    .NEXT_PUBLIC_MY_NEW_APP_HOSTNAME as unknown as string
  ```
3. In the frontend codebase, search for `TaskType.SCRATCH`.
  Copy the surrounding conditional logic, paste it, and adapt it for the new task type.

## Testing

Testing is highly application-specific and is not covered in this documentation.

## Deployment

ClassMosaic uses Github workflows and Terraform for deployment. 

To deploy a new app, update the workflow `.github/workflows/deployment.yml` and Terraform files to:

- Register the new app.
- Install required dependencies.
- Fulfill infrastructure or runtime requirements.

Please review the following folders: `terraform/deployment/`, `terraform/infrastructure/` and `terraform/infrastructure/cloudfront`. When possible, follow a similar approach.

## Documentation

You are encouraged to document your implementation process and changes in one or more Markdown files, covering all the steps described above.
