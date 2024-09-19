import dynamic from "next/dynamic";

const NoSsrPlayground = dynamic(
  () => import("@/components/scratch/Playground"),
  {
    // scratch-gui cannot be rendered server-side
    ssr: false,
  },
);

const Scratch = () => {
  return <NoSsrPlayground />;
};

export default Scratch;
