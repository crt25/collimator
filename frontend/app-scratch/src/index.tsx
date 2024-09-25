import ReactDOM from "react-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import {
  default as GUI,
  AppStateHOC,
} from "@scratch-submodule/scratch-gui/src";
import HashParserHOC from "@scratch-submodule/scratch-gui/src/lib/hash-parser-hoc";
import VM from "scratch-vm";
import { setAppElement } from "react-modal";

// Analogous to https://github.com/scratchfoundation/scratch-gui/blob/develop/src/playground/render-gui.jsx#L37

const WrappedGui = AppStateHOC(HashParserHOC(GUI));

const appRoot = document.getElementById("root") as HTMLElement;

setAppElement(appRoot);

// initialize vm s.t. we get a handle on it
const vm = new VM();

vm.runtime.targets[0].y;

ReactDOM.render(
  <WrappedGui
    canSave={false}
    vm={vm}
    onClickLogo={() => console.log("clicked logo")}
  />,
  appRoot,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
