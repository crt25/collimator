import { render } from "@testing-library/react";
import Gui from "../Gui";

describe("Scratch GUI Component", () => {
  it("renders the Scratch UI unchanged", () => {
    const { container } = render(<Gui showMenuBar={true} />);
    expect(container).toMatchSnapshot();
  });
});
