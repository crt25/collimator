import { render } from "@testing-library/react";
import Test from "../Test";

describe("Test Component", () => {
  it("renders homepage unchanged", () => {
    const { container } = render(<Test />);
    expect(container).toMatchSnapshot();
  });

  it("runs simple tests", () => {
    expect(1).toEqual(1);
    expect(true).toBeTruthy();
  });
});
