// Configuration for live monitoring views (lesson progress, class student
// lists): poll so changes made by students show up without a manual page
// refresh (CRT-435) — by default data is only revalidated when the window
// regains focus.
export interface AutoRefreshingConfig {
  // the polling interval in milliseconds
  refreshInterval: number;
}

// poll at most once every 30 seconds
export const defaultRefreshIntervalMs = 30 * 1000;

export const DefaultAutoRefreshingConfig: AutoRefreshingConfig = {
  refreshInterval: defaultRefreshIntervalMs,
};
