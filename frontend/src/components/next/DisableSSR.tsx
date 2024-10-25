import dynamic from "next/dynamic";

const DisableSSR = dynamic(
  () => import("@/components/next/DisableSSRChildren"),
  { ssr: false },
);

export default DisableSSR;
