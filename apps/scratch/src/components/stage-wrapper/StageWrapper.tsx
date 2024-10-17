import classNames from "classnames";
import VM from "scratch-vm";

import Box from "@scratch-submodule/scratch-gui/src/components/box/box.jsx";
import {
  STAGE_DISPLAY_SIZES,
  STAGE_SIZE_MODES,
} from "@scratch-submodule/scratch-gui/src/lib/layout-constants.js";
import Stage from "@scratch-submodule/scratch-gui/src/containers/stage.jsx";
import Loader from "@scratch-submodule/scratch-gui/src/components/loader/loader.jsx";
import styles from "./stage-wrapper.css";
import { useDispatch } from "react-redux";
import { setStageSize } from "@scratch-submodule/scratch-gui/src/reducers/stage-size";
import { setFullScreen } from "@scratch-submodule/scratch-gui/src";
import Button from "@scratch-submodule/scratch-gui/src/components/button/button";
import { defineMessages, InjectedIntl, injectIntl } from "react-intl";

import fullScreenIcon from "@scratch-submodule/scratch-gui/src/components/stage-header/icon--fullscreen.svg";
import largeStageIcon from "@scratch-submodule/scratch-gui/src/components/stage-header/icon--large-stage.svg";
import smallStageIcon from "@scratch-submodule/scratch-gui/src/components/stage-header/icon--small-stage.svg";
import unFullScreenIcon from "@scratch-submodule/scratch-gui/src/components/stage-header/icon--unfullscreen.svg";
import { getStageDimensions } from "@scratch-submodule/scratch-gui/src/lib/screen-utils";
import Controls from "../../scratch/scratch-gui/src/containers/controls";
import ToggleButtons from "../../scratch/scratch-gui/src/components/toggle-buttons/toggle-buttons";
import { useSelector } from "react-redux";

const messages = defineMessages({
  largeStageSizeMessage: {
    defaultMessage: "Switch to large stage",
    description: "Button to change stage size to large",
    id: "gui.stageHeader.stageSizeLarge",
  },
  smallStageSizeMessage: {
    defaultMessage: "Switch to small stage",
    description: "Button to change stage size to small",
    id: "gui.stageHeader.stageSizeSmall",
  },
  fullStageSizeMessage: {
    defaultMessage: "Enter full screen mode",
    description: "Button to change stage size to full screen",
    id: "gui.stageHeader.stageSizeFull",
  },
  unFullStageSizeMessage: {
    defaultMessage: "Exit full screen mode",
    description: "Button to get out of full screen mode",
    id: "gui.stageHeader.stageSizeUnFull",
  },
  fullscreenControl: {
    defaultMessage: "Full Screen Control",
    description: "Button to enter/exit full screen mode",
    id: "gui.stageHeader.fullscreenControl",
  },
});

interface Props {
  intl: InjectedIntl;
  isFullScreen?: boolean;
  isRendererSupported?: boolean;
  isRtl?: boolean;
  loading?: boolean;
  stageSize: keyof typeof STAGE_DISPLAY_SIZES;
  vm: VM;

  isStageInteractive?: boolean;
}

const StageWrapper = function (props: Props) {
  const {
    intl,
    isFullScreen,
    isRtl,
    isRendererSupported,
    isStageInteractive,
    loading,
    stageSize,
    vm,
  } = props;

  const dispatch = useDispatch();

  const onSetStageLarge = () => dispatch(setStageSize(STAGE_SIZE_MODES.large));
  const onSetStageSmall = () => dispatch(setStageSize(STAGE_SIZE_MODES.small));
  const onSetStageFull = () => dispatch(setFullScreen(true));
  const onSetStageUnFull = () => dispatch(setFullScreen(false));

  const stageSizeMode = useSelector(
    (state: { scratchGui: { stageSize: { stageSize: string } } }) =>
      state.scratchGui.stageSize.stageSize,
  );

  return (
    <Box
      className={classNames(styles.stageWrapper, {
        [styles.fullScreen]: isFullScreen,
      })}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {isFullScreen ? (
        <Box className={styles.stageHeaderWrapperOverlay}>
          <Box
            className={styles.stageMenuWrapper}
            style={{ width: getStageDimensions(null, true).width }}
          >
            <Controls vm={vm} />
            <div className={styles.unselectWrapper}>
              <Button
                className={styles.stageButton}
                onClick={onSetStageUnFull}
                disabled={false}
                iconSrc={undefined}
                iconClassName={undefined}
              >
                <img
                  alt={intl.formatMessage(messages.unFullStageSizeMessage)}
                  className={styles.stageButtonIcon}
                  draggable={false}
                  src={unFullScreenIcon}
                  title={intl.formatMessage(messages.fullscreenControl)}
                />
              </Button>
            </div>
          </Box>
        </Box>
      ) : (
        <Box className={styles.stageHeaderWrapper}>
          <Box className={styles.stageMenuWrapper}>
            <Controls vm={vm} />
            <div className={styles.stageSizeRow}>
              <div className={styles.stageSizeToggleGroup}>
                <ToggleButtons
                  buttons={[
                    {
                      handleClick: onSetStageSmall,
                      icon: smallStageIcon,
                      iconClassName: styles.stageButtonIcon,
                      isSelected: stageSizeMode === STAGE_SIZE_MODES.small,
                      title: intl.formatMessage(messages.smallStageSizeMessage),
                    },
                    {
                      handleClick: onSetStageLarge,
                      icon: largeStageIcon,
                      iconClassName: styles.stageButtonIcon,
                      isSelected: stageSizeMode === STAGE_SIZE_MODES.large,
                      title: intl.formatMessage(messages.largeStageSizeMessage),
                    },
                  ]}
                />
              </div>
              <div>
                <Button
                  className={styles.stageButton}
                  onClick={onSetStageFull}
                  disabled={false}
                  iconSrc={undefined}
                  iconClassName={undefined}
                >
                  <img
                    alt={intl.formatMessage(messages.fullStageSizeMessage)}
                    className={styles.stageButtonIcon}
                    draggable={false}
                    src={fullScreenIcon}
                    title={intl.formatMessage(messages.fullscreenControl)}
                  />
                </Button>
              </div>
            </div>
          </Box>
        </Box>
      )}
      <Box
        className={
          isStageInteractive
            ? styles.stageCanvasWrapper
            : classNames(styles.stageCanvasWrapper, styles.nonInteractive)
        }
      >
        {isRendererSupported ? <Stage stageSize={stageSize} vm={vm} /> : null}
      </Box>
      {loading ? <Loader isFullScreen={isFullScreen} /> : null}
    </Box>
  );
};
export default injectIntl(StageWrapper);
