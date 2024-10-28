import { ColorSet } from "@scratch-submodule/scratch-gui/src/lib/themes";
import { categorySeparator } from "./constants";

export enum EventOpCode {
  whenflagclicked = "event_whenflagclicked",
  whenkeypressed = "event_whenkeypressed",
  whenstageclicked = "event_whenstageclicked",
  whenthisspriteclicked = "event_whenthisspriteclicked",
  whenbackdropswitchesto = "event_whenbackdropswitchesto",
  whengreaterthan = "event_whengreaterthan",
  whenbroadcastreceived = "event_whenbroadcastreceived",
  broadcast = "event_broadcast",
  broadcastandwait = "event_broadcastandwait",
}

const eventXmlByOpCode: Record<EventOpCode, (isStage: boolean) => string> = {
  [EventOpCode.whenflagclicked]: () => `
        <block type="event_whenflagclicked"/>`,
  [EventOpCode.whenkeypressed]: () => `
        <block type="event_whenkeypressed">
        </block>`,
  [EventOpCode.whenstageclicked]: (isStage) =>
    isStage
      ? `
        <block type="event_whenstageclicked"/>`
      : "",
  [EventOpCode.whenthisspriteclicked]: (isStage) =>
    isStage
      ? ""
      : `
        <block type="event_whenthisspriteclicked"/>`,
  [EventOpCode.whenbackdropswitchesto]: () => `
        <block type="event_whenbackdropswitchesto">
        </block>`,
  [EventOpCode.whengreaterthan]: () => `
        <block type="event_whengreaterthan">
            <value name="VALUE">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>`,
  [EventOpCode.whenbroadcastreceived]: () => `
        <block type="event_whenbroadcastreceived">
        </block>`,
  [EventOpCode.broadcast]: () => `
        <block type="event_broadcast">
            <value name="BROADCAST_INPUT">
                <shadow type="event_broadcast_menu"></shadow>
            </value>
        </block>`,
  [EventOpCode.broadcastandwait]: () => `
        <block type="event_broadcastandwait">
            <value name="BROADCAST_INPUT">
              <shadow type="event_broadcast_menu"></shadow>
            </value>
        </block>`,
};

export const buildEventXml = function (
  isInitialSetup: boolean,
  isStage: boolean,
  targetId: string,
  colors: ColorSet,
  showBlocks: Partial<Record<EventOpCode, boolean>> = {},
): string {
  const xml = Object.entries(showBlocks)
    .filter(([, show]) => show)
    .map(([opCode]) => {
      const entry = eventXmlByOpCode[opCode as EventOpCode];

      if (!entry) {
        return "";
      }

      return entry(isStage);
    })
    .join("");

  if (xml.length === 0) {
    return "";
  }

  // Note: the category's secondaryColour matches up with the blocks' tertiary color, both used for border color.
  return `
    <category name="%{BKY_CATEGORY_EVENTS}" id="events" colour="${colors.primary}" secondaryColour="${colors.tertiary}">
        ${xml}
        ${categorySeparator}
    </category>
    `;
};
