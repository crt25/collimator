# `iframe-rpc` & `iframe-rpc-react` documentation

This documentation covers both the core library `iframe-rpc` and its React integration `iframe-rpc-react`.

The React package builds on top of the core, providing hooks for integration in React applications.

## Introduction

- `iframe-rpc`: A TypeScript library that implements a typed JSON-RPC 2.0 mechanism over the browser's [`postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) API.
    It enables secure and structured communication between two applications across iframe boundaries.

- `iframe-rpc-react`: A React wrapper around `iframe-rpc`, exposing two hooks, `useIframeParent` and `useIframeChild`, for seamless integration in React applications.

## Core library: `iframe-rpc`

### Overview

`iframe-rpc` facilitates communication between two applications connected via an iframe:

- the host application (aka the frontend), which embeds the iframe.
- the embedded application (like Scratch), which runs inside the iframe.

It defines strict types for requests and responses, ensuring reliability and security.

### Use cases

- Exchange data between the frontend ClassMosaic and an iframe hosting an app (like Scratch).
- Call methods defined inside the iframe from the frontend.
- Trigger events or actions in the iframe from the frontend.
- Retrieve data from the app to the frontend.
- Ensure secure communication across different origins.

### Installation and setup

The library is installed with ClassMosaic.

Only for development purposes, you can install it via yarn:

```sh
# From: collimator/
cd /libraries/iframe-rpc
yarn install
```

### Public API

#### Main classes

- `AppIframeRpcApi` (exported as `AppCrtIframeApi`): for the embedded application (iframe).
- `PlatformIframeRpcApi` (exported as `PlatformCrtIframeApi`): for the host application (frontend).

#### Available methods

Defined in `methods/index.ts`. Methods are organized by caller (who initiates the request).

**Frontend → Embedded application**

| Method           | Description                               |
|------------------|-------------------------------------------|
| `getHeight`      | Retrieves the embedded app's height       |
| `getSubmission`  | Retrieves the current submission          |
| `getTask`        | Retrieves the current task                |
| `loadSubmission` | Loads a submission in the embedded app    |
| `loadTask`       | Loads a task in the embedded app          |
| `setLocale`      | Sets the interface language               |
| `exportTask`     | Exports the current task as a file        |
| `importTask`     | Imports a task file into the embedded app |

**Embedded application → Frontend**

| Method                   | Description                                           |
|--------------------------|-------------------------------------------------------|
| `postSubmission`         | Sends a submission                                    |
| `postSolutionRun`        | Sends a solution to execute                           |
| `postTaskSolution`       | Sends a task solution                                 |
| `postStudentAppActivity` | Reports student activity (action, data, and solution) |

Each method is strongly typed for parameters and return values.

### Demo

?> A running app with `iframe-rpc` implemented is needed

```sh
# From: libraries/iframe-rpc
yarn demo
```

## React integration: `iframe-rpc-react`

### Overview

`iframe-rpc-react` is built on top of `iframe-rpc` to provide React hooks that simplify integration.
It encapsulates origin validation, lifecycle handling, and communication setup for a React environment.

### Installation and setup

The library is installed with ClassMosaic.

Only for development purposes when working on the library, you can install it via yarn:

```sh
# From: collimator/
cd /libraries/iframe-rpc-react
yarn install
```

### Hooks

#### `useIframeParent`

Used in the embedded app

```ts
const { isInIframe, hasLoaded, sendRequest } = useIframeParent(handleRequest);
```

##### Parameters

- `handleRequest`: function handling incoming requests from the host application (frontend).

##### Returns

- `isInIframe`: `boolean` - if running inside an iframe.
- `hasLoaded`: `boolean` - if the iframe has finished loading.
- `sendRequest`: function - sends requests to the frontend.

#### `useIframeChild`

Used inside the host application (frontend)

```ts
const { sendRequest, iframeRef } = useIframeChild(handleRequest, onAppAvailable);
```

##### Parameters

- `handleRequest`: function handling incoming requests from the embedded app.
- `onAppAvailable`: callback triggered when the app is ready.

##### Returns

- `sendRequest`: function - sends requests to the app.
- `iframeRef`: ref to attach to the `<iframe>` element
