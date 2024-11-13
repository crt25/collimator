import Gui from "../containers/customized-scratch-containers/Gui";

const Show = () => {
  return (
    <Gui
      canEditTask={false}
      isStandaloneCodeEnabled={true}
      isCostumesTabEnabled={false}
      isSoundsTabEnabled={false}
      onStorageInit={(storageInstance: {
        addOfficialScratchWebStores: () => void;
      }) => storageInstance.addOfficialScratchWebStores()}
      basePath="/"
    />
  );
};

export default Show;
