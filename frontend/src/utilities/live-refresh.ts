// Shared SWR configuration for live monitoring views (lesson progress, class
// student lists): poll so changes made by students show up without a manual
// page refresh (CRT-435) — by default SWR only revalidates when the window
// regains focus. Polling at most once every 30 seconds.
export const liveRefreshConfig = { refreshInterval: 30 * 1000 };
