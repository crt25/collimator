import { useEffect } from "react";
import { useIntl } from "react-intl";
import { compose } from "redux";
import ReactDOM from "react-dom";
import { default as GUI, AppStateHOC, setAppElement } from "scratch-gui";
import VM from "scratch-vm";

// Analogous to https://github.com/scratchfoundation/scratch-gui/blob/develop/src/playground/render-gui.jsx#L37

// note that redux's 'compose' function is just being used as a general utility to make
// the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
// ability to compose reducers.
const WrappedGui = AppStateHOC(GUI);

const Playground = () => {
  useEffect(() => {
    const element = document.getElementById("scratch");

    if (element) {
      setAppElement(element);
    } else {
      throw new Error("Element with id 'scratch' not found");
    }

    ReactDOM.render(
      <WrappedGui
        canEditTitle
        backpackVisible
        showComingSoon
        canSave={false}
        onClickLogo={() => console.log("clicked logo")}
      />,
      element,
    );
  });

  return <div>hi</div>;
};

export default Playground;
