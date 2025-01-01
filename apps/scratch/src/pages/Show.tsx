import { useSearchParams } from "react-router-dom";
import Gui from "../containers/customized-scratch-containers/Gui";

const Show = () => {
  const [searchParams] = useSearchParams();

  const showStage = searchParams.get("showStage") !== null;

  return (
    <Gui
      cannotInteractWithBlocks={true}
      canEditTask={false}
      isStandaloneCodeEnabled={true}
      isCostumesTabEnabled={false}
      isSoundsTabEnabled={false}
      isStageEnabled={showStage}
      onStorageInit={(storageInstance: {
        addOfficialScratchWebStores: () => void;
      }) => storageInstance.addOfficialScratchWebStores()}
      basePath="/"
    />
  );
};

export default Show;
