import bindAll from "lodash.bindall";
import React from "react";
import VM from "@scratch/scratch-vm";
import { defineMessages, InjectedIntl, injectIntl } from "react-intl";

import LibraryComponent from "@scratch-submodule/packages/scratch-gui/src/components/library/library.jsx";
import extensionIcon from "@scratch-submodule/packages/scratch-gui/src/components/action-menu/icon--sprite.svg";
import extensionLibraryContent, { ExtensionId } from "../../extensions";

const messages = defineMessages({
  extensionTitle: {
    defaultMessage: "Choose an Extension",
    description: "Heading for the extension library",
    id: "gui.extensionLibrary.chooseAnExtension",
  },
  extensionUrl: {
    defaultMessage: "Enter the URL of the extension",
    description: "Prompt for unoffical extension url",
    id: "gui.extensionLibrary.extensionUrl",
  },
});

interface Props {
  intl: InjectedIntl;
  onCategorySelected: (id: string) => void;
  onRequestClose: () => void;
  visible?: boolean;
  showNewFeatureCallouts?: boolean;
  username?: string;
  vm: VM;
}

class ExtensionLibrary extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    bindAll(this, ["handleItemSelect"]);
  }
  handleItemSelect(item: { extensionId: ExtensionId; disabled: boolean }) {
    const id = item.extensionId;

    if (id && !item.disabled) {
      if (this.props.vm.extensionManager.isExtensionLoaded(id)) {
        this.props.onCategorySelected(id);
      } else {
        this.props.vm.extensionManager.loadExtensionURL(id).then(() => {
          this.props.onCategorySelected(id);
        });
      }
    }
  }
  render() {
    const extensionLibraryThumbnailData = Object.entries(
      extensionLibraryContent,
    ).map(([extensionId, extension]) => ({
      extensionId,
      rawURL: extension.iconURL || extensionIcon,
      ...extension,
    }));
    return (
      <LibraryComponent
        data={extensionLibraryThumbnailData}
        filterable={false}
        id="extensionLibrary"
        title={this.props.intl.formatMessage(messages.extensionTitle)}
        visible={this.props.visible}
        onItemSelected={this.handleItemSelect}
        onRequestClose={this.props.onRequestClose}
        showNewFeatureCallouts={false}
        username={undefined}
      />
    );
  }
}

export default injectIntl(ExtensionLibrary);
