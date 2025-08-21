# ClassMosaic Jupyter Application

A JupyterLite-based interactive Python environment for educational purposes, built as part of the ClassMosaic platform. This application provides a browser-based Jupyter experience using Pyodide kernels, with integrated autograding capabilities through Otter Grader and custom notebook execution extensions.

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

## Prerequisites

### System Requirements

- **Python 3.8+**: Required for building and development
- **Node.js 16+**: Required for extension development
- **Git**: For submodule management
- **Make**: For build automation (on Windows, consider using WSL or install make via chocolatey)

### Platform-Specific Notes

**Windows:**

- PowerShell is assumed to used as a shell

## Building and Running

### Quick Start

1. **Create virtual environment:**

```bash
make create-env
```

2. **Activate environment:**

On Windows:

```powershell
.\pyenv\Scripts\Activate.ps1
```

On Unix-like systems:

```bash
source pyenv/bin/activate
```

3. **Initialize the project** (first time setup):

   ```bash
   make init
   ```

   This command:

   - Initializes git submodules (otter-grader)
   - Installs all required dependencies
   - Initializes JupyterLab extensions
   - Builds the custom otter grader wheel

4. **Build the application**:

   ```bash
   make build
   ```

5. **Serve the application locally**:
   ```bash
   make serve
   ```

The application will be available at `http://localhost:8000/jupyter/lab/`

### Step-by-Step Build Process

#### 1. Environment Setup

**Create virtual environment:**

```bash
make create-env
```

**Activate environment:**

On Windows:

```powershell
.\pyenv\Scripts\Activate.ps1
```

On Unix-like systems:

```bash
source pyenv/bin/activate
```

#### 2. Init Submodules

```bash
make init-submodules
```

#### 3. Install Dependencies

```bash
make install-deps
```

This installs:

- `jupyterlite-core`: Core JupyterLite functionality
- `jupyterlite-pyodide-kernel`: Python kernel for browser execution
- `jupyterlab`: JupyterLab interface components
- `jupyterlab_server`: Server components
- `libarchive-c`: Archive handling
- `copier`: Template copying utility
- `jinja2-time`: Templating with time functions

#### 4. Build Otter Grader Wheel

```bash
make build-otter
```

This creates a custom wheel file (`otter_grader-6.1.3-py3-none-any.whl`) in the `dist/` directory.

#### 5. Initialize and build jupyter extensions

```bash
make init-extensions
```

This runs some initialization scripts for the different extensions.
For instance, this creates symlinks which are necessary for the `notebook-runner` extension to build and then installs the npm dependencies.

#### 6. Build JupyterLite Application

```bash
make build
```

The build process:

1. Restores cached lab.html if available
2. Runs `jupyter lite build` with custom arguments
3. Caches the built lab.html file
4. Injects iframe message buffering JavaScript
5. Outputs to `./dist/app/` directory

### Cleaning the Build

```bash
make clean
```

This removes:

- Built application files (`./dist/app/`)
- Cache files (`.cache/`)
- JupyterLite database (`.jupyterlite.doit.db`)

## Components

### 1. JupyterLite Core Configuration

**File**: `jupyter-lite.json`

**Key Features**:

- Memory-only storage for enhanced security
- Custom branding (ClassMosaic)
- Disabled default JupyterLab logo

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
cd extensions/notebook-runner
jlpm build
```

### Creating New Extensions

The Makefile includes utilities for creating new JupyterLab extensions:

```bash
make create-extension EXTENSION='path/to/my/extension'
```

This uses the official JupyterLab extension template via Copier.

### Python Development

For Python-related development within the project:

1. Activate the virtual environment
2. Install development dependencies
3. Make changes to Otter Grader or build scripts
4. Rebuild the wheel and JupyterLite application

## Configuration

### JupyterLite Configuration

**Primary file**: `jupyter-lite.json`

Key configuration options:

- `appName`: Application display name
- `appVersion`: Version identifier
- `enableMemoryStorage`: Use memory-only storage
- `contentsStorageDrivers`: Storage backend configuration
- `disabledExtensions`: Extensions to disable

### Settings Overrides

**File**: `overrides.json`

Currently empty but can be used to override default JupyterLab settings such as:

- Theme preferences
- Extension configurations
- Keyboard shortcuts
- Editor settings

### Build Configuration

**File**: `Makefile`

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
