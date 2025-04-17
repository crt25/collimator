import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ILocalForage } from '@jupyterlite/localforage';

const myCustomDriver = {
  _driver: 'customDriverUniqueName',
  _storage: {} as { [key: string]: any },
  _initStorage: function (options: any) {
    this._storage = {};
  },
  clear: function (): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this._storage = {};
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },
  getItem: function (key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const value = this._storage[key] || null;
        resolve(value);
      } catch (err) {
        reject(err);
      }
    });
  },
  iterate: function (
    iteratorCallback: (value: any, key: string, iterationNumber: number) => any
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const keys = Object.keys(this._storage);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const value = this._storage[key];
          const result = iteratorCallback(value, key, i);
          if (result !== undefined) {
            resolve(result);
            return;
          }
        }
        resolve(null);
      } catch (err) {
        reject(err);
      }
    });
  },
  key: function (n: number): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const keys = Object.keys(this._storage);
        const key = keys[n] || '';
        resolve(key);
      } catch (err) {
        reject(err);
      }
    });
  },
  keys: function (): Promise<string[]> {
    return new Promise((resolve, reject) => {
      try {
        const keys = Object.keys(this._storage);
        resolve(keys);
      } catch (err) {
        reject(err);
      }
    });
  },
  length: function (): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        const length = Object.keys(this._storage).length;
        resolve(length);
      } catch (err) {
        reject(err);
      }
    });
  },
  removeItem: function (key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        delete this._storage[key];
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },
  setItem: function <T>(key: string, value: T): Promise<T> {
    return new Promise((resolve, reject) => {
      try {
        this._storage[key] = value;
        resolve(value);
      } catch (err) {
        reject(err);
      }
    });
  }
};

/**
 * Initialization data for the customStorageDriver extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'customStorageDriver:plugin',
  description: 'A JupyterLite extension for custom storage using LocalForage',
  autoStart: true,
  requires: [ILocalForage],
  activate: async (app: JupyterFrontEnd, forage: ILocalForage) => {
    console.log('✅ customStorageDriver activated');

    const { localforage } = forage;

    // Define and register the driver
    try {
      await localforage.defineDriver(myCustomDriver);
      console.log('✅ Custom driver defined');
    } catch (err) {
      console.error('❌ Failed to define custom driver:', err);
    }

    // Set the custom driver
    try {
      await localforage.setDriver('customDriverUniqueName');
      console.log('✅ Custom driver set as active');

      // Test write/read
      const key = 'STORE_KEY';
      const value = new Uint8Array(8);
      value[0] = 65;

      await localforage.setItem(key, value);
      console.log('💾 Saved:', value);

      const readValue = await localforage.getItem<Uint8Array>(key);
      console.log('📖 Read:', readValue);

      const unknown = await localforage.getItem('unknown_key');
      console.log('🔍 Read unknown_key:', unknown);
    } catch (err) {
      console.error('❌ Failed to use custom driver:', err);
    }
  }
};

export default plugin;
