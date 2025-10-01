# `iframe-rpc` & `iframe-rpc-react` Documentation

This documentation covers both the core library `iframe-rpc` and its React integration `iframe-rpc-react`.

The React package is built on top of the core, providing hooks for integration in React applications.


## Introduction

- `iframe-rpc`: A TypeScript library that implements a typed JSON-RPC 2.0 mechanism over the browser's `postMessage` API ([see MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)), enabling secure and structured communication between a parent window and an iframe. It allows calling remote methods (RPC) while handling cross-origin restrictions (Same-Origin Policy).

- `iframe-rpc-react`: A React wrapper around `iframe-rpc`, exposing two hooks (`useIframeParent` and `useIframeChild`) to integrate RPC communication in React components.

## Core Library: `iframe-rpc`

### Overview

`iframe-rpc` enables communication between a parent window and an iframe using RPC (Remote Procedure Calls).

It defines strict types for requests and responses, ensuring reliability and security.

### Uses cases

- Exchange data between the frontend ClassMosaic and an iframe hosting an app (like Scratch).
- Call methods defined inside the iframe from the parent window.
- Trigger events or actions in the iframe from the parent.
- Ensure secure communication across different origins.

### Installation and Setup

The library is installed with ClassMosaic parts.

For development purpose on the library, you can install it via yarn:

```sh
# From: collimator/
cd /libraries/iframe-rpc
yarn install
```

### Public API

#### Main classes

- `AppIframeRpcApi` (exported as `AppCrtIframeApi`): for use inside the application side (iframe).
- `PlatformIframeRpcApi` (exported as `PlatformCrtIframeApi`): for use in the parent window (frontend).

#### Available Methods

Defined in methods/index.ts:

| Method            | Description                      |
| ----------------- | -------------------------------- |
| `getHeight`       | Retrieves the iframe height      |
| `getSubmission`   | Retrieves the current submission |
| `getTask`         | Retrieves the current task       |
| `loadSubmission`  | Loads a submission in the iframe |
| `loadTask`        | Loads a task in the iframe       |
| `postSolutionRun` | Sends a solution to execute      |
| `postSubmission`  | Submits a solution               |
| `setLocale`       | Sets the interface language      |

Each method is strongly typed for parameters and return values.

### Demo

?> A running app with `iframe-rpc` implemented is needed

```sh
# From: libraries/iframe-rpc
yarn demo
```

## React Integration: `iframe-rpc-react`

### Overview

`iframe-rpc-react` is build on top of `iframe-rpc` to provide React hooks that simplify integration.
It encapsulates origin validation, lifecycle handling, and communication setup for a React environment.

### Installation and Setup

### Installation and Setup

The library is installed with ClassMosaic parts.

For development purpose on the library, you can install it via yarn:

```sh
# From: collimator/
cd /libraries/iframe-rpc-react
yarn install
```

### Hooks

#### `useIframeParent`

Used in the app (like Scratch)

```ts
const { isInIframe, hasLoaded, sendRequest } = useIframeParent(handleRequest);
```

##### Parameters

- `handleRequest`: an object exposing RPC methods to the frontend

##### Returns

- `isInIframe`: `boolean` - if running inside an iframe.
- `hasLoaded`: `boolean` - if the iframe has finished loading.
- `sendRequest`: function - sends requests to the frontend.

#### `useIframeChild`

Used inside the frontend

```ts
const { sendRequest. iframeRef } = useIframeChild(handleRequest, onAppAvailable);
```

##### Parameters

- `handleRequest`: function handling incoming requests from the app.
- `onAppAvailable`: callback triggered when the app is ready.

##### Returns

- `sendRequest`: function - sends requests to the app.
- `iframeRef`: ref to attach to the `<iframe>` element
