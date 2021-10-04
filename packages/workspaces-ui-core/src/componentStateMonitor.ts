import { ComponentFactory, DecoratedComponentFactory, VisibilityState } from "./types/internal";
import createRegistry, { UnsubscribeFunction } from "callback-registry";
import shortId from "shortid";
const ResizeObserver = require("resize-observer-polyfill").default || require("resize-observer-polyfill");

class ComponentStateMonitor {

    private readonly visibilityState: VisibilityState = {
        logo: undefined,
        addWorkspace: undefined,
        systemButtons: undefined,
        workspaceContents: [],
        groupIcons: [],
        groupTabControls: [],
        groupHeaderButtons: []
    };

    private componentsFactory: ComponentFactory = {};
    private readonly _decoratedFactory: DecoratedComponentFactory = {};
    private readonly callbackRegistry = createRegistry();
    private readonly observer = new MutationObserver((mutations) => {
        Array.from(mutations).forEach((m) => {
            const targetDiv = m.target as HTMLDivElement;

            const workspaceId = this.getWorkspaceIdFromContents(targetDiv);
            const action = targetDiv.style.display === "none" ? "workspace-contents-hidden" : "workspace-contents-shown";
            this.callbackRegistry.execute(action, workspaceId);
        });
    });

    public get decoratedFactory(): ComponentFactory {
        return this._decoratedFactory;
    }

    public init(frameId: string, componentsFactory?: ComponentFactory): void {
        this.componentsFactory = componentsFactory;
        if (componentsFactory?.createAddWorkspace) {
            this.decoratedFactory.createAddWorkspace = (...args): void => {
                args[0].frameId = frameId;
                this.visibilityState.addWorkspace = [...args];

                return this.componentsFactory.createAddWorkspace(...this.visibilityState.addWorkspace);
            };
        }

        if (componentsFactory?.createLogo) {
            this.decoratedFactory.createLogo = (...args): void => {
                args[0].frameId = frameId;
                this.visibilityState.logo = [...args];

                return this.componentsFactory.createLogo(...this.visibilityState.logo);
            };
        }

        if (componentsFactory?.createSystemButtons) {
            this.decoratedFactory.createSystemButtons = (...args): void => {
                args[0].frameId = frameId;
                this.visibilityState.systemButtons = [...args];

                return componentsFactory.createSystemButtons(...this.visibilityState.systemButtons);
            };
        }

        if (componentsFactory?.createWorkspaceContents) {
            this.decoratedFactory.createWorkspaceContents = (...args): void => {
                const visibilityStateEntry = args;
                this.visibilityState.workspaceContents.push(visibilityStateEntry);

                const unsub = this.onWorkspaceClosed(args[0]?.workspaceId, () => {
                    this.componentsFactory.removeWorkspaceContents({ workspaceId: args[0]?.workspaceId });
                    this.visibilityState.workspaceContents = this.visibilityState.workspaceContents.filter((entry) => entry !== visibilityStateEntry);
                    unsub();
                });

                this.subscribeForWorkspaceContentsVisibility(args[0]?.workspaceId);
                this.subscribeForWorkspaceContentsResize(args[0]?.workspaceId);
                return componentsFactory.createWorkspaceContents(...args);
            };
        }

        if (componentsFactory?.createGroupIcons) {
            this.decoratedFactory.createGroupIcons = (...args): void => {
                const visibilityStateEntry = args;
                this.visibilityState.groupIcons.push(visibilityStateEntry);
                let groupUnsub = (): void => {
                    // do nothing
                };
                let workspaceUnsub = (): void => {
                    // do nothing
                };
                const cleanUp = (): void => {
                    if (this.componentsFactory.removeGroupIcons) {
                        this.componentsFactory.removeGroupIcons({ groupId: args[0]?.groupId });
                    }
                    this.visibilityState.groupIcons = this.visibilityState.groupIcons.filter((entry) => entry !== visibilityStateEntry);
                    groupUnsub();
                    workspaceUnsub();
                };
                groupUnsub = this.onGroupClosed(args[0]?.groupId, cleanUp);
                workspaceUnsub = this.onWorkspaceClosed(args[0]?.workspaceId, cleanUp);
                return componentsFactory.createGroupIcons(...args);
            };
        }

        if (componentsFactory?.createGroupTabControls) {
            this.decoratedFactory.createGroupTabControls = (...args): void => {
                const visibilityStateEntry = args;
                this.visibilityState.groupTabControls.push(visibilityStateEntry);
                let groupUnsub = (): void => {
                    // do nothing
                };
                let workspaceUnsub = (): void => {
                    // do nothing
                };
                const cleanUp = (): void => {
                    if (this.componentsFactory.removeGroupTabControls) {
                        this.componentsFactory.removeGroupTabControls({ groupId: args[0]?.groupId });
                    }
                    this.visibilityState.groupTabControls = this.visibilityState.groupTabControls.filter((entry) => entry !== visibilityStateEntry);
                    groupUnsub();
                    workspaceUnsub();
                };
                groupUnsub = this.onGroupClosed(args[0]?.groupId, cleanUp);
                workspaceUnsub = this.onWorkspaceClosed(args[0]?.workspaceId, cleanUp);
                return componentsFactory.createGroupTabControls(...args);
            };
        }

        if (componentsFactory?.createGroupHeaderButtons) {
            this.decoratedFactory.createGroupHeaderButtons = (...args): void => {
                const visibilityStateEntry = args;
                this.visibilityState.groupHeaderButtons.push(visibilityStateEntry);
                let groupUnsub = (): void => {
                    // do nothing
                };
                let workspaceUnsub = (): void => {
                    // do nothing
                };
                const cleanUp = (): void => {
                    this.componentsFactory.removeGroupHeaderButtons({ groupId: args[0]?.groupId });
                    this.visibilityState.groupHeaderButtons = this.visibilityState.groupHeaderButtons.filter((entry) => entry !== visibilityStateEntry);
                    groupUnsub();
                    workspaceUnsub();
                };
                groupUnsub = this.onGroupClosed(args[0]?.groupId, cleanUp);
                workspaceUnsub = this.onWorkspaceClosed(args[0]?.workspaceId, cleanUp);
                return componentsFactory.createGroupHeaderButtons(...args);
            };
        }

        if (componentsFactory) {
            this.decoratedFactory.createId = (): string => {
                return shortId.generate();
            };
        }
    }

    public reInitialize(incomingFactory?: ComponentFactory): void {
        if (incomingFactory?.createAddWorkspace && this.visibilityState.addWorkspace) {
            incomingFactory.createAddWorkspace(...this.visibilityState.addWorkspace);
        }

        if (incomingFactory?.createLogo && this.visibilityState.logo) {
            incomingFactory.createLogo(...this.visibilityState.logo);
        }

        if (incomingFactory?.createSystemButtons && this.visibilityState.systemButtons) {
            incomingFactory.createSystemButtons(...this.visibilityState.systemButtons);
        }

        if (incomingFactory?.createWorkspaceContents) {
            this.visibilityState.workspaceContents.forEach((wc) => {
                incomingFactory.createWorkspaceContents(...wc);
            });
        }

        if (incomingFactory?.createGroupIcons) {
            this.visibilityState.groupIcons.forEach((g) => {
                incomingFactory.createGroupIcons(...g);
            });
        }

        if (incomingFactory?.createGroupTabControls) {
            this.visibilityState.groupTabControls.forEach((g) => {
                incomingFactory.createGroupTabControls(...g);
            });
        }

        if (incomingFactory?.createGroupHeaderButtons) {
            this.visibilityState.groupHeaderButtons.forEach((g) => {
                incomingFactory.createGroupHeaderButtons(...g);
            });
        }

        this.componentsFactory = incomingFactory;
    }

    public onWorkspaceContentsShown(callback: (workspaceId: string) => void): UnsubscribeFunction {
        return this.callbackRegistry.add("workspace-contents-shown", callback);
    }

    public onWorkspaceContentsHidden(callback: (workspaceId: string) => void): UnsubscribeFunction {
        return this.callbackRegistry.add("workspace-contents-hidden", callback);
    }

    public onWorkspaceContentsResized(callback: (workspaceId: string) => void): UnsubscribeFunction {
        return this.callbackRegistry.add("workspace-contents-resized", callback);
    }

    public notifyWorkspaceClosed(workspaceId: string): void {
        this.callbackRegistry.execute(`workspace-closed-${workspaceId}`, workspaceId);
    }

    public notifyGroupClosed(groupId: string): void {
        this.callbackRegistry.execute(`group-closed-${groupId}`, groupId);
    }

    private onWorkspaceClosed(workspaceId: string, callback: (workspaceId: string) => void): UnsubscribeFunction {
        return this.callbackRegistry.add(`workspace-closed-${workspaceId}`, callback);
    }

    private onGroupClosed(groupId: string, callback: (groupId: string) => void): UnsubscribeFunction {
        return this.callbackRegistry.add(`group-closed-${groupId}`, callback);
    }

    private subscribeForWorkspaceContentsVisibility(workspaceId: string): void {
        const contentsElement = document.getElementById(`nestHere${workspaceId}`);
        if (!contentsElement) {
            return;
        }
        this.observer.observe(contentsElement, {
            attributes: true,
            attributeFilter: ["style"]
        });
    }

    private subscribeForWorkspaceContentsResize(workspaceId: string): void {
        const contentsElement = document.getElementById(`nestHere${workspaceId}`);
        if (!contentsElement) {
            return;
        }
        const resizeObserver = new ResizeObserver(() => {
            this.callbackRegistry.execute("workspace-contents-resized", workspaceId);
        });

        resizeObserver.observe(contentsElement);
    }

    private getWorkspaceIdFromContents(element: HTMLElement): string {
        return element.id.split("nestHere")[1];
    }

}

export default new ComponentStateMonitor();
