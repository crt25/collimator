## Custom Storage Extension for JupyterLite

A custom extension was developed for JupyterLite to support a custom storage backend.  
The development process followed the tutorial from the [official JupyterLab extension examples repository](https://github.com/jupyterlab/extension-examples/tree/main/hello-world),  
which provides a detailed, step-by-step guide for creating JupyterLite extensions.

As a result, a JavaScript file containing the plugin was generated.  
This file must be referenced in the `jupyter-lite.json` configuration file of a pre-built JupyterLite project.

Example configuration:

```json
"federated_extensions": [
  {
    "extension": "./extension",
    "liteExtension": true,
    "load": "static/customStorage.js",
    "name": "storage"
  }
]
```

### Known Issue: Importing LocalForage Module

The plugin uses the `localForage` module, which needs to be imported.  
However, during the build process, the import statement remains in the output:

```js
import { ILocalForage } from "@jupyterlite/localforage";
```

This causes a runtime error in the browser:
`SyntaxError: Cannot use import statement outside a module`
