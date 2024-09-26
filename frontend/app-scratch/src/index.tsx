import ReactDOM from "react-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { AppStateHOC } from "@scratch-submodule/scratch-gui/src";
import HashParserHOC from "@scratch-submodule/scratch-gui/src/lib/hash-parser-hoc";
import VM from "scratch-vm";
import { setAppElement } from "react-modal";
import Gui from "./containers/Gui";
import { registerCustomBlocks } from "./blocks/blocks";

// Analogous to https://github.com/scratchfoundation/scratch-gui/blob/develop/src/playground/render-gui.jsx#L37

const WrappedGui = AppStateHOC(HashParserHOC(Gui));

const appRoot = document.getElementById("root") as HTMLElement;

setAppElement(appRoot);

ReactDOM.render(
  <WrappedGui
    isScratchDesktop={false}
    isTotallyNormal={false}
    onStorageInit={(storageInstance: any) =>
      storageInstance.addOfficialScratchWebStores()
    }
    canSave={false}
    basePath=""
    onClickLogo={() => console.log("clicked logo")}
    onProjectLoaded={() => console.log("project loaded")}
    onUpdateProjectId={() => console.log("update project id")}
    onVmInit={(vm: VM) => {
      console.log("vm initialized");

      registerCustomBlocks(vm);
    }}
  />,
  appRoot,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
