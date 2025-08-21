# notebook_runner

[![Github Actions Status](/workflows/Build/badge.svg)](/actions/workflows/build.yml)

A JupyterLab extension to run Jupyter notebooks in Jupyterlite environments with pyodide kernels.

## Overview

The `notebook-runner` extension is a JupyterLab extension designed to enhance the functionality of JupyterLite environments. It provides an integrated solution for running, grading, and managing Jupyter notebooks with Pyodide kernels, while offering seamless communication between embedded iframe contexts and the JupyterLab interface.

### Core Architecture

The extension is built around several key architectural components that work together to provide a comprehensive notebook execution and grading environment:

#### 1. Plugin Entrypoint (`src/index.ts`)

The entrypoint follows the standard JupyterLab plugin bolderplate and manages:

- **Mode-Based UI Simplification**: Dynamically adjusts the interface based on URL parameters:
  - `edit` mode: Full JupyterLab interface with all panels
  - `solve` mode: Simplified interface for students
  - `show` mode: Minimal interface for display purposes

The mode is determined by the `mode` query parameter.

#### 2. Notebook Runner State Management (`src/notebook-runner-state.ts`)

The `NotebookRunnerState` class serves as the core orchestrator for notebook execution and kernel management:

- **Dedicated Otter Kernel**: Maintains a separate kernel specifically for grading operations using Otter Grader
- **Session Management**: Handles kernel initialization, restart, and cleanup
- **Package Auto-Installation**: Automatically installs required Python packages (Otter Grader, nbconvert, dependencies) when kernels start
- **Communication Target Registration**: Sets up bidirectional communication channels between kernels and the extension

#### 3. Iframe Communication System

A robust RPC (Remote Procedure Call) system enables seamless communication when JupyterLab is embedded in the CMT:

**Supported Operations:**

- `getHeight()`: Returns the current document height for iframe resizing
- `getTask()`: Packages and returns assignment tasks with autograders
- `loadTask()`: Loads assignment templates and autograders into the environment
- `getSubmission()`: Retrieves student submissions as packaged files
- `loadSubmission()`: Loads student work for grading
- `setLocale()`: Manages internationalization settings

#### 4. Command System (`src/commands/`)

The extension provides two primary commands for educational workflows:

**Assign Command (`src/commands/assign.ts`):**

- Executes Otter Grader's `assign()` function to generate student versions from master notebooks
- Creates autograder packages and student templates
- Manages file system operations for generated content

**Grade Command (`src/commands/grade.ts`):**

- Runs Otter Grader's `run()` function to execute autograding
- Processes student submissions against autograder tests
- Generates detailed grading results in JSON format

#### 5. User Interface Management (`src/user-interface.ts`)

Intelligent UI adaptation based on operational modes:

- **Widget Control**: Dynamically shows/hides JupyterLab panels
- **Simplified Workflows**: Removes complexity for end-users while preserving functionality for developers

#### 6. Package Management (`src/packages.ts`)

Automated Python package installation system:

- **Kernel Event Listeners**: Monitors for new kernel creation
- **Automatic Installation**: Installs required packages on kernel startup
- **Otter Grader Setup**: Specifically installs and configures Otter Grader for assessment workflows
- **nbconvert Integration**: Sets up nbconvert for notebook processing

#### 7. Utility Functions (`src/utils.ts`)

Core utilities for kernel management:

- **`addKernelListeners`**: Provides a robust system for attaching event handlers to kernel lifecycle events
- **Kernel State Tracking**: Monitors kernel changes and restarts

### Technical Implementation Details

#### `iframe-rpc` symlink

Instead of using a yarn portal like we do in the other projects in the `collimator` repository, we rely on a symlink created by the `scripts/create-symlink.js` script to use the `iframe-rpc` dependency.
This is necessary because the yarn portal does not seem to be compatible with the jupyter extension build process.

#### Kernel Management

The extension maintains two types of kernels:

1. **User Kernels**: Standard notebook kernels for student/user interaction
2. **Otter Kernel**: Dedicated kernel for grading operations, pre-configured with all necessary packages

#### File System / Data transfer between the kernel and the extension

This plugin does not rely on the service worker mounting `/drive` to the virtual pyodide file system because of its issues when accessed concurrently by multiple kernels. The issue is documented here: https://github.com/jupyterlite/jupyterlite/issues/1460. While it was reported as resolved, it was clearly still broken when testing (21.08.2025).

To work around this, transfers between the jupyter contents and the pyodide file system is handled manually.
To transfer files into the pyodide kernel, we can simply use the ability to execute code in the kernel and transfer the file contents encoded within the code to be executed and then write it to the file system (for example encode it in base64, then send this as a string + the code to decode it and write it to a specific location).

To transfer files from the pyodide kernel to the extension, we can leverage the comm interface. In particular, we can execute code on the kernel that reads the file in pyodide's virtual file system and once again encodes it in some form.
Next, the code can open a comm channel to the extension and send the encoded file contents. After the extension receives said message, the contents can be written to the jupyter contents if desired.

## Requirements

- JupyterLab >= 4.0.0

## Install

To install the extension, execute:

```bash
pip install notebook_runner
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall notebook_runner
```

## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the notebook_runner directory
# Initialize the project, creating symlinks necessary for the project to build
jlpm prepare
# Install package in development mode
pip install -e "."
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Rebuild extension Typescript source after making changes
jlpm build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
pip uninstall notebook_runner
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `notebook-runner` within that folder.

### Testing the extension

#### Frontend tests

This extension is using [Jest](https://jestjs.io/) for JavaScript code testing.

To execute them, execute:

```sh
jlpm
jlpm test
```

#### Integration tests

This extension uses [Playwright](https://playwright.dev/docs/intro) for the integration tests (aka user level tests).
More precisely, the JupyterLab helper [Galata](https://github.com/jupyterlab/jupyterlab/tree/master/galata) is used to handle testing the extension in JupyterLab.

More information are provided within the [ui-tests](./ui-tests/README.md) README.

### Packaging the extension

See [RELEASE](RELEASE.md)
