export const mockOidcProviderPort = 3888;
export const mockOidcProviderUrl = `http://localhost:${mockOidcProviderPort}`;
export const mockOidcClientId =
  "can_be_any_value_because_this_is_not_checked_by_the_mock_server";

export const mockOidcProxyUrl = `https://localhost:3880`;

// Fast mode, see fast-stack.ts. Each slot gets a range of ports of its own.
export const fastStackBasePort = 4300;
export const fastStackPortsPerSlot = 10;
export const fastStackLogLabel = "[fast-stack]";
