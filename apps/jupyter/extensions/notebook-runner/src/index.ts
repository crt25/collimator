import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

/**
 * Initialization data for the notebook-runner extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'notebook-runner:plugin',
  description: 'A JupyterLab extension to run Jupyter notebooks in Jupyterlite environments with pyodide kernels.',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension notebook-runner is activated!');
  }
};

export default plugin;
