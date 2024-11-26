import Gui from "../containers/customized-scratch-containers/Gui";

const Edit = () => {
  return (
    <Gui
      canEditTask={true}
      isCodeTabEnabled={true}
      isStageEnabled={true}
      isCostumesTabEnabled={true}
      isSoundsTabEnabled={true}
      onStorageInit={(storageInstance: {
        addOfficialScratchWebStores: () => void;
      }) => storageInstance.addOfficialScratchWebStores()}
      basePath="/"
    />
  );
};

export default Edit;
