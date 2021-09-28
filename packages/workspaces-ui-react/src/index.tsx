import AddWorkspaceButton from './defaultComponents/AddWorkspaceButton';
import CloseFrameButton from './defaultComponents/CloseFrameButton';
import GlueLogo from './defaultComponents/GlueLogo';
import MaximizeFrameButton from './defaultComponents/MaximizeFrameButton';
import MinimizeFrameButton from './defaultComponents/MinimizeFrameButton';
import AddApplicationPopup from './defaultComponents/popups/addApplication/AddApplicationPopup';
import AddWorkspacePopup from './defaultComponents/popups/addWorkspace/AddWorkspacePopup';
import SaveWorkspacePopup from './defaultComponents/popups/saveWorkspace/SaveWorkspacePopup';
import WorkspaceContents from "./defaultComponents/WorkspaceContents";
import useWorkspacePopup from './useWorkspacePopup';
import useWorkspaceWindowClicked from './useWorkspaceWindowClicked';

import WorkspacePopup from './WorkspacePopup';
import {
    Bounds,
    WorkspacesManager,
    WorkspacesProps,
    AddWorkspaceButtonProps,
    MaximizeFrameButtonProps,
    MinimizeFrameButtonProps,
    SaveWorkspacePopupComponentProps,
    AddWorkspacePopupComponentProps,
    AddApplicationPopupComponentProps,
    AddWorkspacePopupProps,
    SaveWorkspacePopupProps,
    AddApplicationPopupProps,
    WorkspaceContentsProps,
    AddWindowButtonProps,
    MaximizeGroupButtonProps,
    EjectButtonProps
} from './types/internal';
import WorkspacesElementCreationWrapper from './WorkspacesElementCreationWrapper'
import workspacesManager from './workspacesManager';
import AddWindowButton from './defaultComponents/groups/AddWindowButton';
import MaximizeGroupButton from './defaultComponents/groups/MaximizeGroupButton';
import EjectButton from './defaultComponents/groups/EjectButton';

export {
    SaveWorkspacePopup,
    AddWorkspacePopup,
    AddApplicationPopup,
    CloseFrameButton,
    GlueLogo,
    MaximizeFrameButton,
    MinimizeFrameButton,
    AddWorkspaceButton,
    AddWindowButton,
    MaximizeGroupButton,
    EjectButton,
    WorkspacePopup,
    useWorkspacePopup,
    useWorkspaceWindowClicked,
    WorkspaceContents
};
export const notifyMoveAreaChanged: () => void = () => workspacesManager?.notifyMoveAreaChanged();
export const getComponentBounds: () => Bounds = () => workspacesManager?.getComponentBounds();
export const getFrameId: () => string = () => workspacesManager?.getFrameId();
export const requestFocus: () => void = () => workspacesManager?.requestFocus();

export {
    WorkspacesProps,
    Bounds,
    AddWorkspaceButtonProps,
    MaximizeFrameButtonProps,
    MinimizeFrameButtonProps,
    AddWindowButtonProps,
    MaximizeGroupButtonProps,
    EjectButtonProps,
    SaveWorkspacePopupComponentProps,
    AddWorkspacePopupComponentProps,
    AddApplicationPopupComponentProps,
    AddWorkspacePopupProps,
    SaveWorkspacePopupProps,
    AddApplicationPopupProps,
    WorkspaceContentsProps
};
export default WorkspacesElementCreationWrapper;