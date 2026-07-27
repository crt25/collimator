// iframe-rpc-react/src pulls in react through its hooks, which jest cannot
// resolve through the portal symlink. Only the language helpers re-exported
// from iframe-rpc are needed here, so we substitute those.
jest.mock("iframe-rpc-react/src", () => jest.requireActual("iframe-rpc/src"));

import { ReactNode } from "react";
import { renderHook } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { useStudentName } from "@/hooks/useStudentName";
import { getStudentNickname } from "@/utilities/student-name";

const wrapper = ({ children }: { children: ReactNode }) => (
  <IntlProvider locale="en">{children}</IntlProvider>
);

describe("useStudentName", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns the nickname of an anonymized student", () => {
    const { result } = renderHook(() => useStudentName({ studentId: 42 }), {
      wrapper,
    });

    expect(result.current.name).toBe(getStudentNickname(42));
  });

  it("returns no name while the student id is not resolved yet", () => {
    const { result } = renderHook(() => useStudentName({ studentId: NaN }), {
      wrapper,
    });

    expect(result.current.name).toBeNull();
  });
});
