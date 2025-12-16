import { useRouter } from "next/router";
import dynamic from "next/dynamic";
const Gui = dynamic(
  () => import("../containers/customized-scratch-containers/Gui"),
  {
    ssr: false,
  },
);

const Show = () => {
  const router = useRouter();

  const showStage = router.query.showStage !== null;

  return (
    <Gui
      cannotInteractWithBlocks={true}
      canEditTask={false}
      isStandaloneCodeEnabled={true}
      isCostumesTabEnabled={false}
      isSoundsTabEnabled={false}
      isStageEnabled={showStage}
      basePath="/scratch"
    />
  );
};

export default Show;
