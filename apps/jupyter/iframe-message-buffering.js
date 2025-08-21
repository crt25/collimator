const logModule = "[Iframe Message Buffer]";

const bufferIncomingMessages = (e) => {
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
