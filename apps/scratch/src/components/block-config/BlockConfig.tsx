import { FormEvent, useCallback, useEffect, useState } from "react";
import VM from "scratch-vm";
import { FormattedMessage } from "react-intl";
import { ModifyBlockConfigEvent } from "../../events/modify-block-config";

import { UpdateBlockToolboxEvent } from "../../events/update-block-toolbox";
import Modal from "../modal/Modal";

const cannotBeUsed = 0;
const infiniteUses = -1;

const BlockConfig = ({ vm }: { vm: VM }) => {
  const [blockId, setBlockId] = useState<string | null>(null);
  const [canBeUsed, setCanBeUsed] = useState<boolean>(true);
  const [hasBlockLimit, setHasBlockLimit] = useState<boolean>(true);
  const [blockLimit, setBlockLimit] = useState<string>("1");

  const onModifyBlockConfig = useCallback(
    (e: Event) => {
      const config = vm.crtConfig;
      if (!(e instanceof ModifyBlockConfigEvent) || !config) {
        return;
      }

      const currentConfig = config.allowedBlocks[e.blockId];

      if (typeof currentConfig === "boolean") {
        console.error(
          `Trying to limit the number of blocks for ${e.blockId} which is not configured for this`,
        );
        return;
      }

      const blockCanBeUsed =
        currentConfig !== undefined && currentConfig !== cannotBeUsed;

      setCanBeUsed(blockCanBeUsed);
      setHasBlockLimit(blockCanBeUsed && currentConfig !== infiniteUses);

      const limit = currentConfig ?? 1;

      setBlockLimit(limit.toString());
      setBlockId(e.blockId);
    },
    [vm],
  );

  useEffect(() => {
    window.addEventListener(
      ModifyBlockConfigEvent.eventName,
      onModifyBlockConfig,
    );

    return () => {
      window.removeEventListener(
        ModifyBlockConfigEvent.eventName,
        onModifyBlockConfig,
      );
    };
  }, [onModifyBlockConfig]);

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const config = vm.crtConfig;

      if (!config) {
        console.error("No task config found");
        return;
      }

      if (!blockId) {
        console.error("Block ID not found", blockId);
        return;
      }

      const limitOrNaN = parseInt(blockLimit, 10);
      const limit = isNaN(limitOrNaN) ? 1 : limitOrNaN;

      if (canBeUsed) {
        config.allowedBlocks[blockId] = hasBlockLimit ? limit : infiniteUses;
      } else {
        config.allowedBlocks[blockId] = cannotBeUsed;
      }

      // update toolbox
      window.dispatchEvent(new UpdateBlockToolboxEvent());

      // hide modal
      setBlockId(null);
    },
    [blockId, vm, canBeUsed, hasBlockLimit, blockLimit],
  );

  return (
    <Modal isShown={blockId !== null}>
      <h1>
        <FormattedMessage
          defaultMessage="Block Config"
          description="Heading of the block config modal shown when configuring whether a given block can be used by students."
          id="crt.blockConfig.heading"
        />
        <small>({blockId})</small>
      </h1>

      <form onSubmit={onSubmit} data-testid="block-config-form">
        <label>
          <span>
            <FormattedMessage
              defaultMessage="Can this block be used by students?"
              description="Label shown next to the checkbox for configuring whether a given block can be used by students."
              id="crt.blockConfig.canBlockBeUsed"
            />
          </span>
          <input
            type="checkbox"
            min="0"
            checked={canBeUsed}
            onChange={(e) => setCanBeUsed(e.target.checked)}
            data-testid="can-be-used-checkbox"
          />
        </label>

        {canBeUsed && (
          <label>
            <span>
              <FormattedMessage
                defaultMessage="Is there a limit to how many times this block can be used?"
                description="Label shown next to the checkbox for configuring whether a there is a limit to how often a block can be used by students."
                id="crt.blockConfig.hasBlockUsageLimit"
              />
            </span>
            <input
              type="checkbox"
              min="0"
              checked={hasBlockLimit}
              onChange={(e) => setHasBlockLimit(e.target.checked)}
              data-testid="has-block-limit-checkbox"
            />
          </label>
        )}

        {hasBlockLimit && (
          <label>
            <span>
              <FormattedMessage
                defaultMessage="How many times can this block be used?"
                description="Label shown next to the input field for configuring how often a block can be used by students."
                id="crt.blockConfig.blockUsageLimit"
              />
            </span>
            <input
              type="number"
              min="1"
              value={blockLimit}
              onChange={(e) => setBlockLimit(e.target.value)}
              data-testid="block-limit-input"
            />
          </label>
        )}

        <input
          type="submit"
          value="Save"
          data-testid="block-config-form-submit-button"
        />
      </form>
    </Modal>
  );
};

export default BlockConfig;
