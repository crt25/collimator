import Button from "@/components/Button";
import { EmbeddedAppRef } from "@/components/EmbeddedApp";
import Header from "@/components/Header";
import MaxScreenHeight from "@/components/layout/MaxScreenHeight";
import Task from "@/components/Task";
import { scratchAppHostName } from "@/utilities/constants";
import { useRouter } from "next/router";
import { useCallback, useMemo, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";

const SolveTaskPage = () => {
  const router = useRouter();
  const { sessionId: sessionIdString, taskId: taskIdString } = router.query as {
    sessionId: string;
    taskId: string;
  };

  const sessionId = parseInt(sessionIdString, 10);
  const taskId = parseInt(taskIdString, 10);

  const iFrameSrc = useMemo(() => {
    return `${scratchAppHostName}/solve/${sessionId}/${taskId}`;
  }, [sessionId, taskId]);

  const [showSessionMenu, setShowSessionMenu] = useState(false);
  const embeddedApp = useRef<EmbeddedAppRef | null>(null);

  const onSubmitSolution = useCallback(async () => {
    if (!embeddedApp.current) {
      return;
    }

    const response = await embeddedApp.current.sendRequest({
      procedure: "getSubmission",
    });

    // TODO: Save submission

    // for now, just log the result
    const result = response.result;
    if (result.type === "application/json") {
      const json = await result.text();
      console.log(json);
    }
  }, []);

  const toggleSessionMenu = useCallback(() => {
    setShowSessionMenu((show) => !show);
  }, []);

  return (
    <MaxScreenHeight>
      <Header>
        <li>
          <Button
            onClick={toggleSessionMenu}
            data-testid="toggle-session-menu-button"
          >
            {showSessionMenu ? (
              <span>
                <FormattedMessage
                  id="SolveTask.getStarted"
                  defaultMessage="Hide Session"
                />
              </span>
            ) : (
              <span>
                <FormattedMessage
                  id="SolveTask.getStarted"
                  defaultMessage="Show Session"
                />
              </span>
            )}
          </Button>
        </li>
        <li>
          <Button
            onClick={onSubmitSolution}
            data-testid="submit-solution-button"
          >
            <FormattedMessage
              id="SolveTask.getStarted"
              defaultMessage="Submit Solution"
            />
          </Button>
        </li>
      </Header>
      <Task
        sessionId={sessionId}
        sessionName="Session 1"
        showSessionMenu={showSessionMenu}
        setShowSessionMenu={setShowSessionMenu}
        embeddedApp={embeddedApp}
        iFrameSrc={iFrameSrc}
      />
    </MaxScreenHeight>
  );
};

export default SolveTaskPage;
