import dynamic from "next/dynamic";
const Gui = dynamic(
  () => import("../containers/customized-scratch-containers/Gui"),
  {
    ssr: false,
  },
);

const Solve = () => {
  return (
    <Gui
      canEditTask={false}
      isStudentSolving={true}
      isCodeTabEnabled={true}
      isStageEnabled={true}
      isCostumesTabEnabled={false}
      isSoundsTabEnabled={false}
      basePath="/scratch"
    />
  );
};

export default Solve;
