import Gui from "../containers/customized-scratch-containers/Gui";

const Solve = () => {
  return (
    <Gui
      canEditTask={false}
      isCodeTabEnabled={true}
      isStageEnabled={true}
      isCostumesTabEnabled={false}
      isSoundsTabEnabled={false}
      onStorageInit={(storageInstance: {
        addOfficialScratchWebStores: () => void;
      }) => storageInstance.addOfficialScratchWebStores()}
      basePath="/"
      reportProgress={true}
    />
  );
};

export default Solve;
