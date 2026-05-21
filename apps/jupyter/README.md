# ClassMosaic Jupyter Application

A [JupyterLite-based](https://jupyterlite.readthedocs.io/en/stable/) interactive Python environment for educational purposes, built as part of the [ClassMosaic](https://github.com/crt25/collimator) platform. This application provides a browser-based Jupyter experience using Pyodide kernels, with integrated autograding capabilities through [Otter Grader](https://otter-grader.readthedocs.io/en/latest/) and custom notebook execution extensions.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Building and Running](#building-and-running)
- [Components](#components)
- [Development](#development)
- [Configuration](#configuration)
- [Extensions](#extensions)

## Overview

The ClassMosaic Jupyter Application is a customized JupyterLite deployment that enables students to run Python notebooks directly in their browsers without requiring a traditional Jupyter server. The application integrates several key components:

- **JupyterLite Core**: Provides the browser-based Jupyter environment
- **Pyodide Kernel**: Enables Python execution in the browser via WebAssembly
- **Otter Grader**: Automated grading and testing framework for educational assignments
- **Notebook Runner Extension**: Custom JupyterLab extension for enhanced notebook execution and iframe communication

### Key Design Principles

- **Browser-only execution**: No server-side Python required
- **Memory-based storage**: Storage is handled by the CMT platform.
- **Iframe integration**: Designed to be embedded within larger educational platforms
- **Autograding support**: Built-in testing and validation capabilities
- **Cross-platform compatibility**: Works on Windows, macOS, and Linux

## Building and Running

All build automation lives in [`Taskfile.yml`](./Taskfile.yml). Run `task --list` from this directory to see every available task with its description.

### Quick Start

1. **Initialize the project** (first time setup):

   ```bash
   task setup
   ```

   This command:

   - Initializes git submodules (otter-grader)
   - Installs all required Python dependencies via `pipx`/`poetry`
   - Builds the custom otter grader wheel
   - Bootstraps the JupyterLab extensions (symlinks, version stamping, `pip install -e`, `jupyter labextension develop/link`)

2. **Build the application**:

   ```bash
   task build
   ```

   `task build` depends on `task setup`, so it will (re)run setup steps that are out of date before producing the bundle.

3. **Serve the application locally**:

   ```bash
   task serve
   ```

The application will be available at `http://localhost:8000/jupyter/lab/`

### Step-by-Step Build Process

Each high-level task above is composed of smaller, individually-callable tasks. Most of them declare `sources:`/`generates:` so Task will skip work that is already up to date.

#### 1. Init Submodules

```bash
task submodules:init
```

This only needs to be run once after cloning the repo.

#### 2. Install Dependencies

```bash
task deps:install
```

Installs `pipx`, `poetry` (pinned versions from `Taskfile.yml`) and then `pipx run poetry install`. Re-run whenever the `pyproject.toml` / `poetry.lock` dependencies change.

#### 3. Build Otter Grader Wheel

```bash
task build:otter
```

This creates a custom wheel file (`otter_grader-6.1.3-py3-none-any.whl`) in the `dist/` directory.

Re-run this command whenever the otter submodule changes (the task tracks `otter-grader/**/*` as sources, so it is a no-op otherwise).

#### 4. Initialize and build jupyter extensions

```bash
task exts:setup
```

This runs some initialization scripts for the different extensions.
For instance, this creates symlinks which are necessary for the `notebook-runner` extension to build and then installs the npm dependencies.

This only needs to be run once when setting up the project.

#### 5. Build JupyterLite Extensions

```bash
task exts:build
```

Builds all the custom extensions.
Needs to be run once initially and whenever you want to re-build all extensions.
Since this scales with the number of extensions, it is faster to just re-build an extension whenever it is changed.

#### 6. Build JupyterLite Application

```bash
task build
```

The build process:

1. Builds the extensions (`task exts:build`)
2. Restores cached `lab.html` if available
3. Runs `jupyter lite build` with the arguments from `JUPYTER_LITE_ARGS`
4. Caches the built `lab.html` file
5. Injects iframe message buffering JavaScript
6. Outputs to `./dist/app/` directory

Note that it does **not** re-build the extensions, this must be done manually whenever they change.

Re-run whenever you change an extension or a JupyterLite configuration.

### Cleaning the Build

```bash
task clean
```

This removes:

- Built application files (`./dist/app/`)
- Cache files (`.cache/`)
- JupyterLite database (`.jupyterlite.doit.db`)

Try this first, if the build process results in weird error messages.

### Other Useful Tasks

- `task lint` / `task lint:fix` — lint hooks (currently a no-op for the Jupyter app, present for monorepo parity).
- `task test` — runs the notebook-runner extension test suite (`task exts:nbrunner:test`).
- `task sourcemap:upload` — uploads the notebook-runner sourcemap to Sentry (requires `SENTRY_AUTH_TOKEN`).

## Components

### 1. JupyterLite Core Configuration

**File**: `jupyter-lite.jsonc`

- Memory-only storage, loading and saving is handled by the ClassMosaic platform
- Custom branding (ClassMosaic)
- Disables service worker extension (see the README of the `notebook-runner` extension for more information as to why)

### 2. Iframe Message Buffering

**File**: `iframe-message-buffering.js`

This component enables the Jupyter application to be embedded within iframes while maintaining proper message communication between parent and child frames.

**Functionality**:

- Buffers incoming window messages during initialization
- Provides `stopBufferingIframeMessages()` function to retrieve buffered messages
- Without this, incoming calls during the initialization phase may be missed.

### 3. Otter Grader Integration

**Submodule**: `otter-grader/`

Otter Grader is integrated as a Git submodule and provides:

- **Autograding**: Automated testing of student code
- **Test framework**: Unit tests for Python notebooks
- **Gradebook integration**: Export capabilities for LMS systems
- **Custom checks**: Validation of notebook outputs and structure

The customized wheel is built and included in the JupyterLite environment, making autograding functions available directly in the browser.

### 4. File Management

**Directory**: `files/`

Files placed in this directory are automatically included in the JupyterLite file browser. This enables:

- Pre-loading assignment templates
- Providing reference materials
- Including starter code and datasets

## Development

### Extension Development

The project includes a custom JupyterLab extension located in `extensions/notebook-runner/`.

#### Key Extension Features

1. **Enhanced Notebook Execution**: Custom commands for running notebooks
2. **Iframe API**: JavaScript functions exposed to parent frames
3. **Package Pre-installation**: Automatic installation of required Python packages
4. **UI Simplification**: Streamlined interface for educational use
5. **Mode Detection**: Different behaviors based on URL parameters

#### Building the Extension

```bash
task exts:build
```

### Creating New Extensions

The Makefile includes utilities for creating new JupyterLab extensions:

```bash
task exts:create EXTENSION='path/to/my/extension'
```

This uses the official JupyterLab extension template via Copier. After scaffolding, add a matching set of `exts:<name>:*` tasks to `Taskfile.yml` (use the `exts:nbrunner:*` tasks as a reference).

### Python Development

For Python-related development within the project:

1. Activate the virtual environment
2. Install development dependencies
3. Make changes to Otter Grader or build scripts
4. Rebuild the wheel and JupyterLite application

## Configuration

### JupyterLite Configuration

**Primary file**: [`jupyter-lite.jsonc`](https://jupyterlite.readthedocs.io/en/latest/howto/configure/config_files.html#jupyter-lite-json)

Key configuration options:

- `appName`: Application display name
- `appVersion`: Version identifier
- `enableMemoryStorage`: Use memory-only storage
- `contentsStorageDrivers`: Storage backend configuration
- `disabledExtensions`: Extensions to disable

### [Settings Overrides](https://jupyterlite.readthedocs.io/en/latest/howto/configure/settings.html)

**File**: `overrides.json`

Currently empty but can be used to override default JupyterLab settings such as:

- Theme preferences
- Extension configurations
- Keyboard shortcuts
- Editor settings

### Build Configuration

**File**: `Taskfile.yml`

Environment variables for customization:

- `OUTPUT_DIR`: Build output directory (default: `./dist/app`)
- `PORT`: Development server port (default: `8000`)
- `BASE_URL`: Application base URL (default: `/jupyter/`)
- `JUPYTER_LITE_ARGS`: Additional JupyterLite build arguments

## Extensions

### Notebook Runner Extension

The main custom extension provides:

#### API Functions

- `runNotebook()`: Execute entire notebooks programmatically
- `runCell()`: Execute individual cells
- `getResults()`: Retrieve execution results
- `installPackages()`: Install Python packages dynamically

#### UI Modifications

- Simplified toolbar
- Hidden unnecessary panels
- Streamlined file browser
- Custom status indicators

#### Integration Features

- Parent frame communication
- Message buffering
- Mode-based behavior switching
- Automatic package installation
