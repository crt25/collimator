import ReactDOM from "react-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import GUI, { AppStateHOC, setAppElement } from "scratch-gui";

// Analogous to https://github.com/scratchfoundation/scratch-gui/blob/develop/src/playground/render-gui.jsx#L37

// note that redux's 'compose' function is just being used as a general utility to make
// the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
// ability to compose reducers.
const WrappedGui = AppStateHOC(GUI);

const appRoot = document.getElementById("root") as HTMLElement;

setAppElement(appRoot);

ReactDOM.render(
  <WrappedGui
    canSave={false}
    onClickLogo={() => console.log("clicked logo")}
  />,
  appRoot,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
