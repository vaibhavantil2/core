import { checkThrowCallback, nonEmptyStringDecoder, restoreWorkspaceConfigDecoder, workspaceDefinitionDecoder, workspaceBuilderCreateConfigDecoder, resizeConfigDecoder, moveConfigDecoder } from "../shared/decoders";
import { SubscriptionConfig } from "../types/subscription";
import { PrivateDataManager } from "../shared/privateDataManager";
import { FrameStreamData, WorkspaceStreamData, WindowStreamData, ContainerStreamData } from "../types/protocol";
import { Glue42Workspaces } from "../../workspaces.d";
import { FramePrivateData } from "../types/privateData";

interface PrivateData {
    manager: PrivateDataManager;
}

const data = new WeakMap<Frame, PrivateData>();

const getData = (model: Frame): FramePrivateData => {
    return data.get(model).manager.getFrameData(model);
};

const getDataManager = (model: Frame): PrivateDataManager => {
    return data.get(model).manager;
};

export class Frame implements Glue42Workspaces.Frame {

    constructor(dataManager: PrivateDataManager) {
        data.set(this, { manager: dataManager });
    }

    public get id(): string {
        return getData(this).summary.id;
    }

    public resize(config: Glue42Workspaces.ResizeConfig): Promise<void> {
        const validatedConfig = resizeConfigDecoder.runWithException(config);
        const myId = getData(this).summary.id;

        return getData(this).controller.resizeItem(myId, validatedConfig);
    }

    public move(config: Glue42Workspaces.MoveConfig): Promise<void> {
        const validatedConfig = moveConfigDecoder.runWithException(config);

        const myId = getData(this).summary.id;
        return getData(this).controller.moveFrame(myId, validatedConfig);
    }

    public focus(): Promise<void> {
        const myId = getData(this).summary.id;
        return getData(this).controller.focusItem(myId);
    }

    public close(): Promise<void> {
        const myId = getData(this).summary.id;
        return getData(this).controller.closeItem(myId);
    }

    public snapshot(): Promise<Glue42Workspaces.FrameSnapshot> {
        const myId = getData(this).summary.id;
        return getData(this).controller.getSnapshot(myId, "frame");
    }

    public async workspaces(): Promise<Glue42Workspaces.Workspace[]> {
        const controller = getData(this).controller;
        return controller.getWorkspaces((wsp) => wsp.frameId === this.id);
    }

    public async restoreWorkspace(name: string, options?: Glue42Workspaces.RestoreWorkspaceConfig): Promise<Glue42Workspaces.Workspace> {
        nonEmptyStringDecoder.runWithException(name);
        const validatedOptions = restoreWorkspaceConfigDecoder.runWithException(options);

        return getData(this).controller.restoreWorkspace(name, validatedOptions);
    }

    public createWorkspace(definition: Glue42Workspaces.WorkspaceDefinition, config?: Glue42Workspaces.WorkspaceCreateConfig): Promise<Glue42Workspaces.Workspace> {
        const validatedDefinition = workspaceDefinitionDecoder.runWithException(definition);
        const validatedConfig = workspaceBuilderCreateConfigDecoder.runWithException(config);

        return getData(this).controller.createWorkspace(validatedDefinition, validatedConfig);
    }

    public async onClosing(callback: (frame: Frame) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = (payload: FrameStreamData): void => {
            getDataManager(this).remapFrame(this, payload.frameSummary);
            callback(this);
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "closing",
            streamType: "frame",
            level: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }

    public async onClosed(callback: (closed: { frameId: string }) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = (payload: FrameStreamData): void => {
            callback({ frameId: payload.frameSummary.id });
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "closed",
            streamType: "frame",
            level: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }

    public async onFocusChange(callback: (frame: Frame) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = (payload: FrameStreamData): void => {
            getDataManager(this).remapFrame(this, payload.frameSummary);
            callback(this);
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "focus",
            streamType: "frame",
            level: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }

    public async onWorkspaceOpened(callback: (workspace: Glue42Workspaces.Workspace) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = async (payload: WorkspaceStreamData): Promise<void> => {
            const workspace = await getData(this).controller.getWorkspace((wsp) => wsp.id === payload.workspaceSummary.id);
            callback(workspace);
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "opened",
            streamType: "workspace",
            level: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }

    public async onWorkspaceFocusChange(callback: (workspace: Glue42Workspaces.Workspace) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = async (payload: WorkspaceStreamData): Promise<void> => {
            const workspace = await getData(this).controller.getWorkspace((wsp) => wsp.id === payload.workspaceSummary.id);
            callback(workspace);
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "focus",
            streamType: "workspace",
            level: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }

    public async onWorkspaceClosing(callback: (workspace: Glue42Workspaces.Workspace) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = async (payload: WorkspaceStreamData): Promise<void> => {
            const workspace = await getData(this).controller.getWorkspace((wsp) => wsp.id === payload.workspaceSummary.id);
            callback(workspace);
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "focus",
            streamType: "workspace",
            level: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }

    public async onWorkspaceClosed(callback: (closed: { frameId: string; workspaceId: string }) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = (payload: WorkspaceStreamData): void => {
            callback({ frameId: payload.frameSummary.id, workspaceId: payload.workspaceSummary.id });
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "closed",
            streamType: "workspace",
            level: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }

    public async onWindowAdded(callback: (window: Glue42Workspaces.WorkspaceWindow) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = async (payload: WindowStreamData): Promise<void> => {
            const foundParent = await getData(this).controller.getParent((parent) => parent.id === payload.windowSummary.parentId);
            const foundWindow = foundParent.children.find((child) => child.type === "window" && child.positionIndex === payload.windowSummary.config.positionIndex);
            callback(foundWindow as Glue42Workspaces.WorkspaceWindow);
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "added",
            streamType: "window",
            level: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }

    public async onWindowRemoved(callback: (removed: { windowId?: string; workspaceId: string; frameId: string }) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = (payload: WindowStreamData): void => {
            const { windowId, workspaceId, frameId } = payload.windowSummary.config;
            callback({ windowId, workspaceId, frameId });
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "removed",
            streamType: "window",
            level: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }

    public async onWindowLoaded(callback: (window: Glue42Workspaces.WorkspaceWindow) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = async (payload: WindowStreamData): Promise<void> => {
            const foundParent = await getData(this).controller.getParent((parent) => {
                return parent.id === payload.windowSummary.parentId;
            });
            const foundWindow = foundParent.children.find((child) => child.type === "window" && child.positionIndex === payload.windowSummary.config.positionIndex);
            callback(foundWindow as Glue42Workspaces.WorkspaceWindow);
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "loaded",
            streamType: "window",
            level: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }

    public async onWindowFocusChange(callback: (window: Glue42Workspaces.WorkspaceWindow) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = async (payload: WindowStreamData): Promise<void> => {
            const foundParent = await getData(this).controller.getParent((parent) => parent.id === payload.windowSummary.parentId);
            const foundWindow = foundParent.children.find((child) => child.type === "window" && child.positionIndex === payload.windowSummary.config.positionIndex);
            callback(foundWindow as Glue42Workspaces.WorkspaceWindow);
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "focus",
            streamType: "window",
            level: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }

    public async onBoxAdded(callback: (parent: Glue42Workspaces.Row | Glue42Workspaces.Column | Glue42Workspaces.Group) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = async (payload: ContainerStreamData): Promise<void> => {
            const foundParent = await getData(this).controller.getParent((parent) => parent.id === payload.containerSummary.itemId);
            callback(foundParent);
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "added",
            streamType: "container",
            level: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }

    public async onBoxRemoved(callback: (removed: { id: string; workspaceId: string; frameId: string }) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = (payload: ContainerStreamData): void => {
            const { workspaceId, frameId } = payload.containerSummary.config;
            callback({ id: payload.containerSummary.itemId, workspaceId, frameId });
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "removed",
            streamType: "container",
            level: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }

    public async onBoxUpdated(callback: (parent: Glue42Workspaces.Row | Glue42Workspaces.Column | Glue42Workspaces.Group) => void): Promise<Glue42Workspaces.Unsubscribe> {
        checkThrowCallback(callback);
        const myId = getData(this).summary.id;

        const wrappedCallback = async (payload: ContainerStreamData): Promise<void> => {
            const foundParent = await getData(this).controller.getParent((parent) => parent.id === payload.containerSummary.itemId);
            callback(foundParent);
        };

        const config: SubscriptionConfig = {
            callback: wrappedCallback,
            action: "childrenUpdate",
            streamType: "container",
            level: "frame"
        };
        const unsubscribe = await getData(this).controller.processLocalSubscription(config, myId);
        return unsubscribe;
    }
}
