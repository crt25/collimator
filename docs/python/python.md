# Jupyterlite modifications

This document is intended for developers working on this project and who may need to update or maintain the Jupyterlite integration.

To be compatible with the ClassMosaic platform, Jupyterlite was modified. The scope of the changes and their purpose are described below.

All modifications are made either through the jupyterlite configuration files `jupyter-lite.json` and `overrides.json` or through the custom extension `notebook-runner`.
The only exception is described in [the next section](#iframe-communication) because it requires to load custom javascript code before Jupyterlite finishes loading.

## `iframe` communication

To support the integration into ClassMosaic, we need to implement its `iframe-rpc` API for applications.

To ensure no messages are missed, we load custom javascript code (`iframe-message-buffering.js`) before the page finishes loading which immediately attaches a listener and starts buffering incoming `iframe-rpc` messages.
The `notebook-runner` extension then later retrieves the buffered messages and stops the buffering process.

## Mode detection

Analogous to the scratch application, the jupyter application supports three modes.
The three modes are detected based on the query parameter `mode`.

1. Edit mode through `?mode=edit` (default)
2. Solve mode through `?mode=solve`
3. Show mode through `?mode=show`

## G-AST converter

The G-AST converter is based on the ANTLR grammar. Specific information is given in `backend/src/ast/converters/python/README.md`.

## Auto-installing a modified version of `otter-grader`

To each session that is attached to a notebook widget, we attach a listener that is called whenever the kernel changes.

This listener pre-installs [our modified version of `otter-grader`](https://github.com/crt25/otter-grader) with all its dependencies.

The modifications on top of the upstream code are minimal and could be contributed back.
What needs to be modified is the execution of the notebook and the logging server used during the execution.
In `otter-grader`, a logging server is always started before executing a notebook.
Because Jupyterlite runs in a browser environment, we cannot do so and therefore need an way to disable it.
Moreover, `otter-grader` executes notebooks using `nbconvert.preprocessors.ExecutePreprocessor`.

Because `ExecutePreprocessor` seems to spin up a jupyter server and communicate through a network protocol to execute the notebok, it is again infeasible to run this in a Jupyterlite environment.
To work around this, we need 1) a way to execute the notebook at the correct time and 2) a way to provide the results computed outside of `otter-grader`.

To cover both use cases, we add the following two options

1. `precomputed_results` - Optional path to the precomputed results file. If this path is provided, the notebook will not be executed.
2. `log_server` - Whether to start a logging server for the autograder.

## Autograding

### Commands

To support the autograding functionality through `otter-grader`, the following commands are added by the extension:

### `notebook-runner:run-assign`

This runs `otter-grader`'s `assign` command.
Based on the opened otter-compatible notebook (aka the _template_), this generates the task file to be filled in by students (aka the _task_) plus the corresponding autograding files.

### `notebook-runner:run-grading`

This runs `otter-grader`'s `grade` command on the _task_ notebook and returns the grading results.

### Command execution and the _Otter kernel_

To provide minimal isolation of the execution environments, 1) assigning a notebook, 2) executing and 3) grading it are all executed in a separated Jupyter kernel named the _otter kernel_.

The _otter kernel_ is initialized when the extension loads.
On top of `otter-grader`, we also install `nbconvert` which is necessary for executing the [assign](#notebook-runnerrun-assign) command.

### Virtual file system

Because Jupyterlite simulates a full Jupyter environment in a browser, `pyodide` (the software used to execute python on a browser) provides a virtual filesystem.

By default, the files visible in the file inspector are mounted on `/drive`.
Unfortunately we observed spurious and transient issues when reading from and writing to `/drive` from pyodide.

Therefore, we disabled this feature by adding `@jupyterlite/application-extension:service-worker-manager` to `disabledExtensions` in `jupyter-lite.json`.

Unfortunately this requires us to handle data transfers between pyodide and the `notebook-runner` extension ourselves resulting in more complicated code.
Once Jupyterlite provides a stable implementation for `/drive`, it is advisable to revert back to using it.

## User interface modifications

### Simplifications

To avoid confusing users with dozens of redundant UI elements, we try to remove as many as we can, based on [the detected mode](#mode-detection).

On top, we enable Jupyterlite's simple mode and hide the status bar.

Finally, unless we are in `edit` mode, we also hide the [Grading folders](#jupyterlite-file-format) from the file browser.

### Additional UI elements

To allow users to run all cells in a notebook, the additional command `notebook-runner:run-all-cells` is added which is trigerred by a play button displayed in the toolbar.

## Jupyterlite project structure

There are multiple files in the ClassMosaic version of Jupyterlite:

- `/task.ipynb` - The _template_ file created and filled-in by the teacher
- `/student/task.ipynb` - The _task_ file generated by running [`assign`](#notebook-runnerrun-assign) and filled-in by the teacher
- `/autograder/autograder.zip` - The autograding files generated by running [`assign`](#notebook-runnerrun-assign)

On top, arbitrary additional files may be provided in the following folders:

- `/data` and `/src` - Any data that should be available for teachers and students
- `/grading_data` and `/grading_src` - Any data that should exclusively be available to teachers and the grading system

From a technical perspective the `data` and `src` directories are equivalent but users are encouraged to place additional files in the folder describing their purpose.
