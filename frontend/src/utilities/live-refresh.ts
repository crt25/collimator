// SWR-agnostic but SWR-compatible config to interact with backend services,
// for usage by any network-based hook.
export interface NetworkHookConfig {
  // the polling interval in milliseconds
  refreshInterval: number;
}

// poll at most once every 30 seconds
export const defaultRefreshIntervalMs = 30 * 1000;

export const DefaultAutoRefreshingConfig: NetworkHookConfig = {
  refreshInterval: defaultRefreshIntervalMs,
};
