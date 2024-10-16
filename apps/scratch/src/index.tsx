import ReactDOM from "react-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import VM from "scratch-vm";
import Gui from "./containers/Gui";
import { registerCustomBlocks } from "./blocks/blocks";
import downloadBlob from "@scratch-submodule/scratch-gui/src/lib/download-blob";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Solve } from "./components/Solve";
import { ErrorPage } from "./components/ErrorPage";

// Analogous to https://github.com/scratchfoundation/scratch-gui/blob/develop/src/playground/render-gui.jsx#L37

const appRoot = document.getElementById("root") as HTMLElement;

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Gui
        isScratchDesktop={false}
        isTotallyNormal={false}
        backpackHost={null}
        backpackVisible={false}
        canChangeLanguage={true}
        canChangeTheme={true}
        canCreateNew={false}
        canEditTitle={false}
        canManageFiles={true}
        canRemix={false}
        canCreateCopy={false}
        canShare={false}
        enableCommunity={false}
        isCreating={false}
        isShared={false}
        showComingSoon={false}
        canSave={true}
        onStorageInit={(storageInstance: {
          addOfficialScratchWebStores: () => void;
        }) => storageInstance.addOfficialScratchWebStores()}
        basePath="/"
        onClickLogo={() => console.log("clicked logo")}
        onProjectLoaded={() => console.log("project loaded")}
        onUpdateProjectId={() => console.log("update project id")}
        onVmInit={(vm: VM) => {
          console.log("vm initialized");

          // @ts-expect-error We set a property on the global window object
          window.download = () =>
            vm.saveProjectSb3().then((blob: Blob) => {
              console.log(vm.toJSON());
              downloadBlob("export.sb3", blob);
            });

          registerCustomBlocks(vm);
        }}
      />
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "solve/:sessionId/:taskId",
    element: <Solve />,
  },
]);

ReactDOM.render(<RouterProvider router={router} />, appRoot);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
