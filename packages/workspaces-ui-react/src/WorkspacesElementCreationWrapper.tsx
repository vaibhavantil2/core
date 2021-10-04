import React from "react";
import AddApplicationPopup from "./defaultComponents/popups/addApplication/AddApplicationPopup";
import AddWorkspacePopup from "./defaultComponents/popups/addWorkspace/AddWorkspacePopup";
import SaveWorkspacePopup from "./defaultComponents/popups/saveWorkspace/SaveWorkspacePopup";
import Portal from "./Portal";
import { AddApplicationPopupProps, CreateElementRequestOptions, ElementCreationWrapperState, AddWorkspacePopupProps, SaveWorkspacePopupProps, WorkspacesProps, CreateWorkspaceContentsRequestOptions, CreateGroupRequestOptions, RemoveWorkspaceContentsRequestOptions, RemoveGroupRequestOptions } from "./types/internal";
import WorkspacesWrapper from "./WorkspacesWrapper";

class WorkspacesElementCreationWrapper extends React.Component<WorkspacesProps, ElementCreationWrapperState> {
    constructor(props: WorkspacesProps) {
        super(props);
        this.state = {
            logo: undefined,
            addWorkspace: undefined,
            systemButtons: undefined,
            workspaceContents: [],
            groupIcons: [],
            groupTabControls: [],
            groupHeaderButtons: [],
            saveWorkspacePopup: undefined,
            addApplicationPopup: undefined,
            addWorkspacePopup: undefined
        }
    }

    onCreateLogoRequested = (options: CreateElementRequestOptions) => {
        if (options === this.state.logo) {
            return;
        }
        this.setState(s => {
            return {
                ...s,
                logo: options
            }
        });
    }

    onCreateAddWorkspaceRequested = (options: CreateElementRequestOptions) => {
        if (options === this.state.addWorkspace) {
            return;
        }
        this.setState(s => {
            return {
                ...s,
                addWorkspace: options
            }
        });
    }

    onCreateSystemButtonsRequested = (options: CreateElementRequestOptions) => {
        if (options === this.state.systemButtons) {
            return;
        }
        this.setState(s => {
            return {
                ...s,
                systemButtons: options
            }
        });
    }

    onCreateWorkspaceContentsRequested = (options: CreateWorkspaceContentsRequestOptions) => {
        if (this.state.workspaceContents.some(wc => wc.domNode === options.domNode)) {
            return;
        }

        this.setState(s => {
            return {
                ...s,
                workspaceContents: [
                    ...s.workspaceContents,
                    options
                ]
            }
        });
    }

    onCreateGroupIconsRequested = (options: CreateGroupRequestOptions) => {
        if (this.state.groupIcons.some(g => g.domNode === options.domNode)) {
            return;
        }

        this.setState(s => {
            return {
                ...s,
                groupIcons: [
                    ...s.groupIcons,
                    options
                ]
            }
        });
    }

    onCreateGroupTabControlsRequested = (options: CreateGroupRequestOptions) => {
        if (this.state.groupTabControls.some(g => g.domNode === options.domNode)) {
            return;
        }
        this.setState(s => {
            return {
                ...s,
                groupTabControls: [
                    ...s.groupTabControls,
                    options
                ]
            }
        });
    }

    onCreateGroupHeaderButtonsRequested = (options: CreateGroupRequestOptions) => {
        if (this.state.groupHeaderButtons.some(g => g.domNode === options.domNode)) {
            return;
        }

        this.setState(s => {
            return {
                ...s,
                groupHeaderButtons: [
                    ...s.groupHeaderButtons,
                    options
                ]
            }
        });
    }

    onCreateSaveWorkspaceRequested = (options: CreateElementRequestOptions & SaveWorkspacePopupProps) => {
        if (options === this.state.saveWorkspacePopup) {
            return;
        }
        this.setState(s => {
            return {
                ...s,
                saveWorkspacePopup: options
            }
        }, options.callback);
    }

    onCreateAddApplicationRequested = (options: CreateElementRequestOptions & AddApplicationPopupProps) => {
        if (options === this.state.addApplicationPopup) {
            return;
        }
        this.setState(s => {
            return {
                ...s,
                addApplicationPopup: options
            }
        }, options.callback);
    }

    onCreateAddWorkspacePopupRequested = (options: CreateElementRequestOptions & AddWorkspacePopupProps) => {
        if (options === this.state.addWorkspacePopup) {
            return;
        }
        this.setState(s => {
            return {
                ...s,
                addWorkspacePopup: options
            }
        }, options.callback);
    }

    onRemoveWorkspaceContentsRequested = (options: RemoveWorkspaceContentsRequestOptions) => {
        this.setState(s => {
            return {
                ...s,
                workspaceContents: [
                    ...s.workspaceContents.filter((wc) => wc.workspaceId !== options.workspaceId),
                ]
            }
        });
    }

    onRemoveGroupIconsRequested = (options: RemoveGroupRequestOptions) => {
        this.setState(s => {
            return {
                ...s,
                groupIcons: [
                    ...s.groupIcons.filter((wc) => wc.groupId !== options.groupId),
                ]
            }
        });
    }

    onRemoveGroupTabControlsRequested = (options: RemoveGroupRequestOptions) => {
        this.setState(s => {
            return {
                ...s,
                groupTabControls: [
                    ...s.groupTabControls.filter((wc) => wc.groupId !== options.groupId),
                ]
            }
        });
    }

    onRemoveGroupHeaderButtonsRequested = (options: RemoveGroupRequestOptions) => {
        this.setState(s => {
            return {
                ...s,
                groupHeaderButtons: [
                    ...s.groupHeaderButtons.filter((wc) => wc.groupId !== options.groupId),
                ]
            }
        });
    }

    onHideSystemPopups = (cb: () => void) => {
        this.setState((s) => ({
            ...s,
            addApplicationPopup: undefined,
            saveWorkspacePopup: undefined,
            addWorkspacePopup: undefined
        }), cb);
    }

    renderLogoComponent = () => {
        const LogoCustomElement = this.props.components?.header?.LogoComponent;
        if (!LogoCustomElement || (!this.state.logo || !this.state.logo.domNode)) {
            return;
        }

        const { domNode, callback, ...options } = this.state.logo;
        return <Portal domNode={domNode}><LogoCustomElement {...options} /></Portal>
    }

    renderAddWorkspaceComponent = () => {
        const AddWorkspaceCustomComponent = this.props.components?.header?.AddWorkspaceComponent;

        if (!AddWorkspaceCustomComponent || (!this.state.addWorkspace || !this.state.addWorkspace.domNode)) {
            return;
        }

        const { domNode, callback, ...options } = this.state.addWorkspace;
        return <Portal domNode={domNode}><AddWorkspaceCustomComponent {...options} /></Portal>
    }

    renderSystemButtonsComponent = () => {
        const SystemButtonsCustomComponent = this.props.components?.header?.SystemButtonsComponent;
        if (!SystemButtonsCustomComponent || (!this.state.systemButtons || !this.state.systemButtons.domNode)) {
            return;
        }

        const { domNode, callback, ...options } = this.state.systemButtons;

        return <Portal domNode={domNode}><SystemButtonsCustomComponent {...options} /></Portal>
    }

    renderWorkspaceContents = () => {
        const WorkspaceContentsComponent = this.props.components?.WorkspaceContents;

        return this.state.workspaceContents.map((wc) => {
            if (!WorkspaceContentsComponent || !wc.domNode) {
                return;
            }

            const { domNode, callback, ...options } = wc;
            return <Portal key={options.workspaceId} domNode={domNode}><WorkspaceContentsComponent {...options} /></Portal>
        });
    }

    renderGroupIcons = () => {
        const GroupIconComponent = this.props.components?.containers?.group?.header?.IconComponent;

        return this.state.groupIcons.map((g) => {
            if (!GroupIconComponent || !g.domNode) {
                return;
            }

            const { domNode, callback, ...options } = g;
            return <Portal key={`${options.groupId}-icons`} domNode={domNode}><GroupIconComponent {...options} /></Portal>
        });
    }

    renderGroupTabControls = () => {
        const GroupTabControlsComponent = this.props.components?.containers?.group?.header?.TabControlsComponent;

        return this.state.groupTabControls.map((g) => {
            if (!GroupTabControlsComponent || !g.domNode) {
                return;
            }

            const { domNode, callback, ...options } = g;
            return <Portal key={`${options.groupId}-tab-controls`} domNode={domNode}><GroupTabControlsComponent {...options} /></Portal>
        });
    }

    renderGroupHeaderButtons = () => {
        const GroupHeaderButtonsComponent = this.props.components?.containers?.group?.header?.ButtonsComponent;

        return this.state.groupHeaderButtons.map((g) => {
            if (!GroupHeaderButtonsComponent || !g.domNode) {
                return;
            }

            const { domNode, callback, ...options } = g;
            return <Portal key={`${options.groupId}-buttons`} domNode={domNode}><GroupHeaderButtonsComponent {...options} /></Portal>
        });
    }

    renderSaveWorkspacePopupComponent = () => {
        const SaveWorkspaceCustomComponent = this.props.components?.popups?.SaveWorkspaceComponent || SaveWorkspacePopup;
        if (!SaveWorkspaceCustomComponent || (!this.state.saveWorkspacePopup || !this.state.saveWorkspacePopup.domNode)) {
            return;
        }

        const { domNode, ...options } = this.state.saveWorkspacePopup;

        return <Portal domNode={domNode}><SaveWorkspaceCustomComponent glue={this.props.glue} {...options} /></Portal>
    }

    renderAddApplicationPopupComponent = () => {
        const AddApplicationCustomComponent = this.props.components?.popups?.AddApplicationComponent || AddApplicationPopup;
        if (!AddApplicationCustomComponent || (!this.state.addApplicationPopup || !this.state.addApplicationPopup.domNode)) {
            return;
        }

        const { domNode, ...options } = this.state.addApplicationPopup;

        return <Portal domNode={domNode}><AddApplicationCustomComponent glue={this.props.glue} {...options} /></Portal>
    }

    renderAddWorkspacePopupComponent = () => {
        const AddWorkspaceCustomComponent = this.props.components?.popups?.AddWorkspaceComponent || AddWorkspacePopup;
        if (!AddWorkspaceCustomComponent || (!this.state.addWorkspacePopup || !this.state.addWorkspacePopup.domNode)) {
            return;
        }
        const { domNode, callback, ...options } = this.state.addWorkspacePopup;

        return <Portal domNode={domNode}><AddWorkspaceCustomComponent glue={this.props.glue} {...options} /></Portal>
    }

    render() {
        const { components, glue, ...additionalProperties } = this.props;
        const addApplicationComponent = components?.popups?.AddApplicationComponent || AddApplicationPopup;
        const saveWorkspaceComponent = components?.popups?.SaveWorkspaceComponent || SaveWorkspacePopup;
        const addWorkspaceComponent = components?.popups?.AddWorkspaceComponent || AddWorkspacePopup;

        const onCreateAddApplicationRequested = addApplicationComponent && typeof addApplicationComponent !== "string" ?
            this.onCreateAddApplicationRequested : undefined;

        const onCreateAddWorkspacePopupRequested = addWorkspaceComponent && typeof addWorkspaceComponent !== "string" ?
            this.onCreateAddWorkspacePopupRequested : undefined;

        const onCreateSaveWorkspaceRequested = saveWorkspaceComponent && typeof saveWorkspaceComponent !== "string" ?
            this.onCreateSaveWorkspaceRequested : undefined;

        const addApplication = typeof addApplicationComponent === "string" ? addApplicationComponent : undefined;
        const saveWorkspace = typeof saveWorkspaceComponent === "string" ? saveWorkspaceComponent : undefined;
        const addWorkspace = typeof addWorkspaceComponent === "string" ? addWorkspaceComponent : undefined;

        const externalPopupApplications = {
            addApplication,
            saveWorkspace,
            addWorkspace
        }

        return (
            <div {...additionalProperties} style={{ overflow: "hidden", width: "100%", height: "100%" }}>
                {this.renderLogoComponent()}
                {this.renderAddWorkspaceComponent()}
                {this.renderSystemButtonsComponent()}
                {this.renderWorkspaceContents()}
                {this.renderGroupIcons()}
                {this.renderGroupTabControls()}
                {this.renderGroupHeaderButtons()}
                {this.renderSaveWorkspacePopupComponent()}
                {this.renderAddApplicationPopupComponent()}
                {this.renderAddWorkspacePopupComponent()}
                <WorkspacesWrapper
                    onCreateSystemButtonsRequested={components?.header?.SystemButtonsComponent ? this.onCreateSystemButtonsRequested : undefined}
                    onCreateAddWorkspaceRequested={components?.header?.AddWorkspaceComponent ? this.onCreateAddWorkspaceRequested : undefined}
                    onCreateLogoRequested={components?.header?.LogoComponent ? this.onCreateLogoRequested : undefined}
                    onCreateWorkspaceContentsRequested={components?.WorkspaceContents ? this.onCreateWorkspaceContentsRequested : undefined}
                    onCreateGroupIconsRequested={components?.containers?.group?.header?.IconComponent ? this.onCreateGroupIconsRequested : undefined}
                    onCreateGroupTabControlsRequested={components?.containers?.group?.header?.TabControlsComponent ? this.onCreateGroupTabControlsRequested : undefined}
                    onCreateGroupHeaderButtonsRequested={components?.containers?.group?.header?.ButtonsComponent ? this.onCreateGroupHeaderButtonsRequested : undefined}
                    onCreateSaveWorkspacePopupRequested={onCreateSaveWorkspaceRequested}
                    onCreateAddApplicationPopupRequested={onCreateAddApplicationRequested}
                    onCreateAddWorkspacePopupRequested={onCreateAddWorkspacePopupRequested}
                    onRemoveWorkspaceContentsRequested={components?.WorkspaceContents ? this.onRemoveWorkspaceContentsRequested : undefined}
                    onRemoveGroupIconsRequested={components?.containers?.group?.header?.IconComponent ? this.onRemoveGroupIconsRequested : undefined}
                    onRemoveGroupTabControlsRequested={components?.containers?.group?.header?.TabControlsComponent ? this.onRemoveGroupTabControlsRequested : undefined}
                    onRemoveGroupHeaderButtonsRequested={components?.containers?.group?.header?.ButtonsComponent ? this.onRemoveGroupHeaderButtonsRequested : undefined}
                    onHideSystemPopupsRequested={this.onHideSystemPopups}
                    externalPopupApplications={externalPopupApplications}
                    glue={glue}
                />
            </div>
        );
    }
}

export default WorkspacesElementCreationWrapper;
