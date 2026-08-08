// This script is loaded when the JupyterLite app starts up and before the load event is fired
// so that we can buffer any incoming iframe messages until the main app is ready to handle them.

const logModule = "[Iframe Message Buffer]";

const bufferIncomingMessages = (e) => {
  // Only buffer RPC messages (JSON-RPC objects). Non-object payloads are foreign
  // traffic on the shared message channel - most notably the setImmediate
  // polyfill's "setImmediate$<rand>$<handle>" strings, which fire in huge volume
  // during JupyterLite/Pyodide boot. Buffering them would bloat the buffer and,
  // on replay, spam the console with "unknown source".
  if (typeof e.data !== "object" || e.data === null) {
    return;
  }

  console.debug(`${logModule} Buffering incoming message:`, e);
  window.bufferedMessages.push(e);
};

window.stopBufferingIframeMessages = () => {
  console.debug(
    `${logModule} Stopping message buffering, returning ${window.bufferedMessages.length} messages`
  );
  window.removeEventListener("message", bufferIncomingMessages);

  return window.bufferedMessages;
};

console.debug(`${logModule} Starting message buffering`);

window.bufferedMessages = [];
window.addEventListener("message", bufferIncomingMessages);
