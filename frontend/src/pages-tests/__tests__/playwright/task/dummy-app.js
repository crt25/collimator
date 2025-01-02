const respondToMessageEvent = (event, message) => {
  if (!event.source) {
    console.error("Cannot respond to event without source:", event);
    return;
  }

  return event.source.postMessage(
    {
      id: event.data.id,
      type: "response",
      ...message,
    },
    {
      targetOrigin: event.origin,
    },
  );
};

let task = new Blob(['{"dummy": "task"}'], {
  type: "application/json",
});

window.addEventListener("message", (event) => {
  const message = event.data;

  if (message.type === "response") {
    // ignore responses to requests sent by us
  } else if (message.type === "request") {
    switch (message.procedure) {
      case "getHeight":
        respondToMessageEvent(event, {
          procedure: "getHeight",
          result: document.body.scrollHeight,
        });
        break;

      case "getSubmission":
        respondToMessageEvent(event, {
          procedure: "getSubmission",
          result: task,
        });
        break;

      case "getTask":
        respondToMessageEvent(event, {
          procedure: "getTask",
          result: task,
        });
        break;

      case "loadTask":
        task = message.arguments.task;

        task.text().then((text) => console.log("loaded task", text));
        break;
    }
  } else {
    throw new Error("Unknown message type");
  }
});
