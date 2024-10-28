import classNames from "classnames";
import { FormattedMessage } from "react-intl";

import Box from "@scratch-submodule/scratch-gui/src/components/box/box.jsx";
import styles from "@scratch-submodule/scratch-gui/src/components/stage-selector/stage-selector.css";

interface Props {
  backdropCount: number;
  containerRef?: () => void;
  dragOver?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  raised?: boolean;
  receivedBlocks?: boolean;
  selected?: boolean;
  url?: string;
}

const MinimalStageSelector = (props: Props) => {
  const {
    backdropCount,
    containerRef,
    dragOver,
    selected,
    raised,
    receivedBlocks,
    url,
    onClick,
    onMouseEnter,
    onMouseLeave,
  } = props;
  return (
    <Box
      className={classNames(styles.stageSelector, {
        [styles.isSelected]: selected,
        [styles.raised]: raised || dragOver,
        [styles.receivedBlocks]: receivedBlocks,
      })}
      componentRef={containerRef}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <FormattedMessage
            defaultMessage="Stage"
            description="Label for the stage in the stage selector"
            id="gui.stageSelector.stage"
          />
        </div>
      </div>
      {url ? <img className={styles.costumeCanvas} src={url} /> : null}
      <div className={styles.label}>
        <FormattedMessage
          defaultMessage="Backdrops"
          description="Label for the backdrops in the stage selector"
          id="gui.stageSelector.backdrops"
        />
      </div>
      <div className={styles.count}>{backdropCount}</div>
    </Box>
  );
};

export default MinimalStageSelector;
