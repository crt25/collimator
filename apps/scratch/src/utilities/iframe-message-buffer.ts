declare global {
  interface Window {
    bufferedMessages: MessageEvent<unknown>[];
    stopBufferingIframeMessages: () => MessageEvent<unknown>[];
  }
}

export const stopBufferingIframeMessages = (): MessageEvent<unknown>[] => {
  return window.stopBufferingIframeMessages();
};
