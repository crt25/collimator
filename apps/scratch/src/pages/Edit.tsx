import dynamic from "next/dynamic";
const Gui = dynamic(
  () => import("../containers/customized-scratch-containers/Gui"),
  {
    ssr: false,
  },
);

const Edit = () => {
  return (
    <Gui
      canEditTask={true}
      isCodeTabEnabled={true}
      isStageEnabled={true}
      isCostumesTabEnabled={true}
      isSoundsTabEnabled={true}
      basePath="/scratch"
    />
  );
};

export default Edit;
