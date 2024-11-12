import EmbeddedApp, { EmbeddedAppRef } from "@/components/EmbeddedApp";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    sendRequest: EmbeddedAppRef["sendRequest"];
  }
}

const EmbeddedAppStory = ({ src }: { src: string }) => {
  const ref = useRef<EmbeddedAppRef | null>(null);
  useEffect(() => {
    window.sendRequest = (...args) =>
      new Promise((resolve, reject) => {
        const sendRequest = () => {
          if (!ref.current) {
            setTimeout(sendRequest, 300);
            return;
          }

          ref.current
            .sendRequest(...args)
            .then(resolve)
            .catch(reject);
        };

        sendRequest();
      });
  }, []);

  return <EmbeddedApp src={src} ref={ref} />;
};

export default EmbeddedAppStory;
