import { Meta as MetaType } from "@storybook/react/*";
import { EmbeddedAppRef } from "./EmbeddedApp";
import Task from "./Task";
import { useState, useRef } from "@storybook/preview-api";
import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport";

type Args = Omit<
  Parameters<typeof Task>[0],
  "showSessionMenu" | "setShowSessionMenu" | "embeddedApp"
>;

const meta: MetaType<typeof Task> = {
  component: Task,
  parameters: {
    viewports: {
      viewports: INITIAL_VIEWPORTS,
      defaultViewport: "ipad",
    },
  },
};

export default meta;

export const Default = {
  args: {
    sessionId: 1,
    sessionName: "Introduction to React",
    iFrameSrc: "https://example.com",
  } as Args,
  render: (args: Args) => {
    const [showSessionMenu, setShowSessionMenu] = useState(false);
    const embeddedApp = useRef<EmbeddedAppRef | null>(null);

    return (
      <div
        style={{
          minHeight: "30rem",
          display: "flex",
        }}
      >
        <Task
          {...args}
          showSessionMenu={showSessionMenu}
          setShowSessionMenu={setShowSessionMenu}
          embeddedApp={embeddedApp}
        />
      </div>
    );
  },
};

export const WithOpenSessionMenu = {
  args: {
    sessionId: 1,
    sessionName: "Introduction to React",
    iFrameSrc: "https://example.com",
  } as Args,
  render: (args: Args) => {
    const [showSessionMenu, setShowSessionMenu] = useState(true);
    const embeddedApp = useRef<EmbeddedAppRef | null>(null);

    return (
      <div
        style={{
          minHeight: "30rem",
          display: "flex",
        }}
      >
        <Task
          {...args}
          showSessionMenu={showSessionMenu}
          setShowSessionMenu={setShowSessionMenu}
          embeddedApp={embeddedApp}
        />
      </div>
    );
  },
};
