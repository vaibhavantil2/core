import { METHODS, OPERATIONS } from "./constants";
import { Glue42Workspaces } from "../../workspaces";
import { Bridge } from "./bridge";
import { FrameSummaryResult } from "../types/protocol";
import { WindowsAPI, Instance, GDWindow, InteropAPI } from "../types/glue";

export class CoreFrameUtils {

    private readonly workspacesRoute: string;
    private readonly workspacesIndex = "/workspaces/";
    private readonly defaultAssetsBase = "/glue";
    private readonly defaultWidth = 1280;
    private readonly defaultHeight = 720;

    constructor(
        private readonly interop: InteropAPI,
        private readonly windows: WindowsAPI,
        private readonly bridge: Bridge,
        private readonly assetsBaseLocation: string
    ) {
        const inCsbSuffix = location.href.includes("csb.app") ? "/index.html" : "";
        this.workspacesRoute = `${this.assetsBaseLocation || this.defaultAssetsBase}${this.workspacesIndex}${inCsbSuffix}`;
    }

    public getAllFrameInstances(): Instance[] {
        return this.interop.servers()
            .filter((server) => {
                if (server?.getMethods) {
                    return server.getMethods()?.some((method) => method.name === METHODS.control.name);
                }
            });
    }

    public async focusFrame(frame: Instance): Promise<void> {
        const coreWindow = this.windows.list().find((w) => w.id === frame.windowId);
        await coreWindow.focus();
    }

    public async getFrameInstance(config?: { frameId?: string; newFrame?: Glue42Workspaces.NewFrameConfig | boolean }): Promise<Instance> {

        if (config?.frameId && config?.newFrame) {
            throw new Error("Cannot retrieve the frame, because of over-specification: both frameId and newFrame were provided.");
        }

        const frames = this.getAllFrameInstances();

        if (config?.frameId) {
            const foundFrame = frames.find((frame) => frame.peerId === config.frameId);

            if (!foundFrame) {
                throw new Error(`Frame with id: ${config.frameId} was not found`);
            }

            return foundFrame;
        }

        if (config?.newFrame) {
            return this.openNewWorkspacesFrame(config.newFrame);
        }

        return frames.length ? this.getLastFrameInteropInstance() : this.openNewWorkspacesFrame();
    }

    public async getFrameInstanceByItemId(itemId: string): Promise<Instance> {
        const frames = this.getAllFrameInstances();

        const queryResult = await Promise.all(frames.map((frame) => this.bridge.send<FrameSummaryResult>(OPERATIONS.getFrameSummary.name, { itemId }, frame)));

        const foundFrameSummary = queryResult.find((result) => result.id !== "none");

        if (!foundFrameSummary) {
            throw new Error(`Cannot find frame for item: ${itemId}`);
        }

        const frameInstance = await this.getFrameInstance({ frameId: foundFrameSummary.id });

        return frameInstance;
    }

    public getLastFrameInteropInstance(): Instance | undefined {
        return this.getAllFrameInstances()
            .sort((a, b) => {
                const aIncrementor = a?.peerId ? +a.peerId.slice(a.peerId.lastIndexOf("-") + 1) : 0;
                const bIncrementor = b?.peerId ? +b.peerId.slice(b.peerId.lastIndexOf("-") + 1) : 0;

                return bIncrementor - aIncrementor;
            })[0];
    }

    public openNewWorkspacesFrame(newFrameConfig?: Glue42Workspaces.NewFrameConfig | boolean): Promise<Instance> {
        return new Promise<Instance>((resolve, reject) => {

            const framesCount = this.getAllFrameInstances().length;

            let frameWindow: GDWindow;

            const unsubscribe = this.interop.serverMethodAdded((info) => {

                if (!info?.server || !info?.method) {
                    return;
                }

                const nameMatch = info.method.name === METHODS.control.name;
                const serverMatch = info.server.windowId === frameWindow?.id;

                if (frameWindow?.id && nameMatch && serverMatch) {
                    unsubscribe();
                    resolve(info.server);
                }
            });

            const frameOptions = {
                url: `${this.workspacesRoute}?emptyFrame=true`,
                width: typeof newFrameConfig === "object" ? newFrameConfig.bounds?.width || this.defaultWidth : this.defaultWidth,
                height: typeof newFrameConfig === "object" ? newFrameConfig.bounds?.height || this.defaultHeight : this.defaultHeight
            };

            this.windows.open(`frame_${framesCount + 1}`, frameOptions.url, frameOptions)
                .then((frWin) => {
                    frameWindow = frWin;

                    const foundServer = this.interop.servers().find((server) => {

                        const serverMatch = server.windowId === frameWindow.id;
                        const methodMatch = server.getMethods().some((method) => method.name === METHODS.control.name);

                        return serverMatch && methodMatch;
                    });

                    if (foundServer) {
                        unsubscribe();
                        resolve(foundServer);
                    }
                })
                .catch(reject);
        });
    }

    public async closeFrame(frameInstance: Instance): Promise<void> {
        const coreWindow = this.windows.list().find((w) => w.id === frameInstance.windowId);

        await coreWindow.close();
    }

    public async moveFrame(frameId: string, config: Glue42Workspaces.MoveConfig): Promise<void> {
        const frameInstance = await this.getFrameInstanceByItemId(frameId);

        if (frameId !== frameInstance.peerId) {
            return;
        }

        const coreWindow = this.windows.list().find((w) => w.id === frameInstance.windowId);

        if (config.relative) {
            await coreWindow.moveTo(config.top, config.left);
            return;
        }

        await coreWindow.moveResize({ top: config.top, left: config.left });
    }

    public async resizeFrame(frameId: string, config: Glue42Workspaces.ResizeConfig): Promise<void> {
        const frameInstance = await this.getFrameInstanceByItemId(frameId);

        if (frameId !== frameInstance.peerId) {
            return;
        }

        const coreWindow = this.windows.list().find((w) => w.id === frameInstance.windowId);

        if (config.relative) {
            await coreWindow.resizeTo(config.width, config.height);
            return;
        }

        await coreWindow.moveResize({ width: config.width, height: config.height });
    }
}