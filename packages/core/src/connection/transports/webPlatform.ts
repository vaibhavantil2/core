/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Core } from "../../../glue";
import { Identity, Transport } from "../types";
import { Logger } from "../../logger/logger";
import {
    default as CallbackRegistryFactory,
    CallbackRegistry,
    UnsubscribeFunction,
} from "callback-registry";
import generate from "shortid";
import { PromisePlus } from "../../utils/promise-plus";

type MessageType = "connectionAccepted" | "connectionRejected" | "connectionRequest" | "parentReady" |
    "parentPing" | "platformPing" | "platformUnload" | "platformReady" | "clientUnload" | "manualUnload" |
    "extConnectionResponse" | "extSetupRequest";

export default class WebPlatformTransport implements Transport {

    private publicWindowId: string | undefined;
    private parentReady = false;
    private iAmConnected = false;
    private rejected = false;
    private parentPingResolve: ((value?: void | PromiseLike<void> | undefined) => void) | undefined;
    private connectionResolve: ((value?: void | PromiseLike<void> | undefined) => void) | undefined;
    private extConnectionResolve: ((value: void | PromiseLike<void>) => void) | undefined;
    private extConnectionReject: ((reason?: any) => void) | undefined;
    private connectionReject: ((reason?: unknown) => void) | undefined;
    private port: MessagePort | undefined;
    private myClientId: string | undefined;
    private children: Array<{ grandChildId: string; source: Window; connected: boolean; origin: string }> = [];

    private extContentAvailable = false;
    private extContentConnecting = false;
    private extContentConnected = false;
    private parentWindowId: string | undefined;
    private parentInExtMode = false;

    private readonly parent: Window | undefined;
    private readonly parentType: "opener" | "top" | "workspace" | undefined;
    private readonly parentPingTimeout = 3000;
    private readonly connectionRequestTimeout = 5000;
    private readonly defaultTargetString = "*";
    private readonly registry: CallbackRegistry = CallbackRegistryFactory();
    private readonly messages: { [key in MessageType]: { name: string; handle: (event: MessageEvent) => void } } = {
        connectionAccepted: { name: "connectionAccepted", handle: this.handleConnectionAccepted.bind(this) },
        connectionRejected: { name: "connectionRejected", handle: this.handleConnectionRejected.bind(this) },
        connectionRequest: { name: "connectionRequest", handle: this.handleConnectionRequest.bind(this) },
        parentReady: { name: "parentReady", handle: this.handleParentReady.bind(this) },
        parentPing: { name: "parentPing", handle: this.handleParentPing.bind(this) },
        platformPing: { name: "platformPing", handle: this.handlePlatformPing.bind(this) },
        platformUnload: { name: "platformUnload", handle: this.handlePlatformUnload.bind(this) },
        platformReady: { name: "platformReady", handle: this.handlePlatformReady.bind(this) },
        clientUnload: { name: "clientUnload", handle: this.handleClientUnload.bind(this) },
        manualUnload: { name: "manualUnload", handle: this.handleManualUnload.bind(this) },
        extConnectionResponse: { name: "extConnectionResponse", handle: this.handleExtConnectionResponse.bind(this) },
        extSetupRequest: { name: "extSetupRequest", handle: this.handleExtSetupRequest.bind(this) }
    };

    constructor(private readonly settings: Glue42Core.WebPlatformConnection, private readonly logger: Logger, private readonly identity?: Identity) {
        this.extContentAvailable = !!(window as any).glue42ext;

        this.setUpMessageListener();
        this.setUpUnload();

        if (!this.settings.port) {
            this.parent = window.opener || window.top;

            this.parentType = window.opener ? "opener" :
                window.name.indexOf("#wsp") !== -1 ? "workspace" : "top";
        }
    }

    public get transportWindowId(): string | undefined {
        return this.publicWindowId;
    }

    public async sendObject(msg: object): Promise<void> {

        if (this.extContentConnected) {
            return window.postMessage({ glue42ExtOut: msg }, this.defaultTargetString);
        }

        if (!this.port) {
            throw new Error("Cannot send message, because the port was not opened yet");
        }
        this.port.postMessage(msg);
    }

    public get isObjectBasedTransport(): boolean {
        return true;
    }

    public onMessage(callback: (msg: string | object) => void): UnsubscribeFunction {
        return this.registry.add("onMessage", callback);
    }

    public send(): Promise<void> {
        return Promise.reject("not supported");
    }

    public onConnectedChanged(callback: (connected: boolean, reason?: string) => void): UnsubscribeFunction {
        return this.registry.add("onConnectedChanged", callback);
    }

    public async open(): Promise<void> {

        this.logger.debug("opening a connection to the web platform gateway.");

        await this.connect();

        this.notifyStatusChanged(true);
    }

    public close(): Promise<void> {
        // DO NOTHING
        return Promise.resolve();
    }

    public name(): string {
        return "web-platform";
    }

    public reconnect(): Promise<void> {
        // DO NOTHING
        return Promise.resolve();
    }

    private async connect(): Promise<void> {

        if (this.parentReady) {
            this.logger.debug("cancelling connection attempt, because this client's parent has already given a ready signal");
            return;
        }

        if (this.settings.port) {
            this.logger.debug("opening an internal web platform connection");
            this.port = this.settings.port;

            this.publicWindowId = this.settings.windowId;

            if (this.identity) {
                this.identity.windowId = this.publicWindowId;
            }

            this.port.onmessage = (event): object[] => this.registry.execute("onMessage", event.data);
            this.logger.debug("internal web platform connection completed");
            return;
        }

        if (!this.parentType || !this.parent) {
            throw new Error("Cannot initiate a connection, because there is no opener, no top and no port.");
        }

        this.logger.debug(`opening a ${this.parentType === "opener" ? "child" : "grandchild"} client web platform connection`);

        await this.waitParent(this.parent, this.parentType);

        if (this.parentInExtMode) {
            await this.requestConnectionPermissionFromExt();
        }

        await this.initiateRemoteConnection(this.parent, this.parentType);

        this.logger.debug(`the ${this.parentType === "opener" ? "child" : "grandchild"} client is connected`);
    }

    private initiateRemoteConnection(target: Window, parentType: "opener" | "top" | "workspace"): Promise<void> {

        return PromisePlus<void>((resolve, reject) => {
            this.connectionResolve = resolve;
            this.connectionReject = reject;

            this.myClientId = generate();

            const bridgeInstanceId = this.parentType === "workspace" ? window.name.substring(0, window.name.indexOf("#wsp")) : window.name;

            const request = {
                glue42core: {
                    type: this.messages.connectionRequest.name,
                    clientId: this.myClientId,
                    clientType: parentType === "top" || parentType === "workspace" ? "grandChild" : "child",
                    bridgeInstanceId
                }
            };

            this.logger.debug(`sending connection request to ${parentType}`);

            if (this.extContentConnecting) {
                request.glue42core.clientType = "child";
                request.glue42core.bridgeInstanceId = this.myClientId;
                (request as any).glue42core.parentWindowId = this.parentWindowId;
                return window.postMessage(request, this.defaultTargetString);
            }

            target.postMessage(request, this.defaultTargetString);
        }, this.connectionRequestTimeout, "The connection to the opener/top window timed out");

    }

    private async waitParent(target: Window, parentType: "opener" | "top" | "workspace"): Promise<void> {
        const connectionNotPossibleMsg = "Cannot initiate glue, because this window was not opened or created by a glue client";

        const parentCheck = PromisePlus<void>((resolve, reject) => {

            const isIframe = window.self !== window.top;

            if (parentType === "top" && !isIframe) {
                return reject(connectionNotPossibleMsg);
            }

            this.parentPingResolve = resolve;

            const message = {
                glue42core: {
                    type: parentType === "opener" ? this.messages.platformPing.name : this.messages.parentPing.name
                }
            };

            this.logger.debug(`checking for ${parentType} window availability`);

            target.postMessage(message, this.defaultTargetString);
        }, this.parentPingTimeout, connectionNotPossibleMsg);

        if (!this.extContentAvailable) {
            return parentCheck;
        }

        try {
            await parentCheck;

            return;
        } catch (error) {
            this.logger.debug("the parent check failed, but there is an associated extension content script, requesting permission...");
            // all attempts failed, but there is a glue extension content script
            // requesting connection permission there
            await this.requestConnectionPermissionFromExt();
        }

    }

    private setUpMessageListener(): void {
        if (this.settings.port) {
            this.logger.debug("skipping generic message listener, because this is an internal client");
            // do not set up listener, because this is running as an internal client for the platform
            return;
        }

        window.addEventListener("message", (event) => {
            const data = event.data?.glue42core;

            if (!data || this.rejected) {
                return;
            }

            if (!this.checkMessageTypeValid(data.type)) {
                this.logger.error(`cannot handle the incoming glue42 core message, because the type is invalid: ${data.type}`);
                return;
            }

            const messageType = data.type as MessageType;

            this.logger.debug(`received valid glue42core message of type: ${messageType}`);

            this.messages[messageType].handle(event);
        });
    }

    private setUpUnload(): void {
        if (this.settings.port) {
            this.logger.debug("skipping unload event listener, because this is an internal client");
            // do not set up listener, because this is running as an internal client for the platform
            return;
        }

        window.addEventListener("beforeunload", () => {

            if (this.extContentConnected) {
                // before unload in this case should be handled in the content script
                return;
            }

            const message = {
                glue42core: {
                    type: this.messages.clientUnload.name,
                    data: {
                        clientId: this.myClientId,
                        ownWindowId: this.identity?.windowId
                    }
                }
            };

            if (this.parent) {
                this.parent.postMessage(message, this.defaultTargetString);
            }

            this.port?.postMessage(message);
        });
    }

    private handleParentReady(event: MessageEvent): void {
        this.logger.debug("handling the ready signal from the parent, by resoling the pending promise.");
        this.parentReady = true;

        const data = event.data?.glue42core;

        if (data && data.extMode) {
            this.logger.debug("my parent is connected to its content script, fetching windowId and proceeding with content script connection");
            this.parentWindowId = data.extMode.windowId;
            this.parentInExtMode = true;
        }

        if (this.parentPingResolve) {
            this.parentPingResolve();
            delete this.parentPingResolve;
            return;
        }

        this.logger.debug("silently handling the ready signal from the top parent, because there is no defined promise");
    }

    private handlePlatformReady(): void {
        this.logger.debug("the web platform gave the ready signal");
        this.parentReady = true;

        if (this.parentPingResolve) {
            this.parentPingResolve();
            delete this.parentPingResolve;
            return;
        }

        this.logger.debug("silently handling the ready signal from the top parent, because there is no defined promise");
    }

    private handleConnectionAccepted(event: MessageEvent): void {
        const data = event.data?.glue42core;

        if (this.myClientId === data.clientId) {
            return this.handleAcceptanceOfMyRequest(data);
        }

        return this.handleAcceptanceOfGrandChildRequest(data, event);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private handleAcceptanceOfMyRequest(data: any): void {
        this.logger.debug("handling a connection accepted signal targeted at me.");

        if (this.extContentConnecting) {
            return this.processExtContentConnection(data);
        }

        if (!data.port) {
            this.logger.error("cannot set up my connection, because I was not provided with a port");
            return;
        }

        this.publicWindowId = this.parentType === "opener" ? window.name :
            this.parentType === "top" ? data.parentWindowId :
                window.name.substring(0, window.name.indexOf("#wsp"));

        if (this.identity && this.parentType !== "top") {
            this.identity.windowId = this.publicWindowId;
        }

        if (this.identity && data.appName) {
            this.identity.application = data.appName;
            this.identity.applicationName = data.appName;
        }

        this.port = data.port as MessagePort;
        this.port.onmessage = (e): object[] => this.registry.execute("onMessage", e.data);

        if (this.connectionResolve) {
            this.logger.debug("my connection is set up, calling the connection resolve.");
            this.connectionResolve();
            delete this.connectionResolve;
            return;
        }

        this.logger.error("unable to call the connection resolve, because no connection promise was found");
    }

    private processExtContentConnection(data: any): void {
        this.logger.debug("handling a connection accepted signal targeted at me for extension content connection.");

        this.extContentConnecting = false;
        this.extContentConnected = true;

        this.publicWindowId = this.parentWindowId || this.myClientId;

        if (this.extContentConnecting && this.identity) {
            this.identity.windowId = this.publicWindowId;
        }

        if (this.identity && data.appName) {
            this.identity.application = data.appName;
            this.identity.applicationName = data.appName;
        }

        window.addEventListener("message", (event) => {
            const extData = event.data?.glue42ExtInc;

            if (!extData) {
                return;
            }

            this.registry.execute("onMessage", extData);
        });

        if (this.connectionResolve) {
            this.logger.debug("my connection is set up, calling the connection resolve.");
            this.connectionResolve();
            delete this.connectionResolve;
            return;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private handleAcceptanceOfGrandChildRequest(data: any, event: MessageEvent): void {
        if (this.extContentConnecting || this.extContentConnected) {
            this.logger.debug("cannot process acceptance of a grandchild, because I am connected to a content script");
            return;
        }
        this.logger.debug(`handling a connection accepted signal targeted at a grandchild: ${data.clientId}`);

        const child = this.children.find((c) => c.grandChildId === data.clientId);

        if (!child) {
            this.logger.error(`cannot handle connection accepted for grandchild: ${data.clientId}, because there is no grandchild with this id`);
            return;
        }

        child.connected = true;

        this.logger.debug(`the grandchild connection for ${data.clientId} is set up, forwarding the success message and the gateway port`);

        data.parentWindowId = this.publicWindowId;

        child.source.postMessage(event.data, child.origin, [data.port]);
        return;
    }

    private handleConnectionRejected(): void {
        this.logger.debug("handling a connection rejection. Most likely the reason is that this window was not created by a glue API call");
        if (this.connectionReject) {
            this.connectionReject("The platform connection was rejected. Most likely because this window was not created by a glue API call");
            delete this.connectionReject;
        }
    }

    private handleConnectionRequest(event: MessageEvent): void {

        if (this.extContentConnecting) {
            // I am being connected now and this is handled in the associated content script
            this.logger.debug("This connection request event is targeted at the extension content");
            return;
        }

        const source = event.source as Window;
        const data = event.data.glue42core;

        if (!data.clientType || data.clientType !== "grandChild") {
            return this.rejectConnectionRequest(source, event.origin, "rejecting a connection request, because the source was not opened by a glue API call");
        }

        if (!data.clientId) {
            return this.rejectConnectionRequest(source, event.origin, "rejecting a connection request, because the source did not provide a valid id");
        }

        if (this.parentType !== "opener" || !this.parent) {
            return this.rejectConnectionRequest(source, event.origin, "Cannot forward the connection request, because no direct connection to the platform was found");
        }

        this.logger.debug(`handling a connection request for a grandchild: ${data.clientId}`);

        this.children.push({ grandChildId: data.clientId, source, connected: false, origin: event.origin });

        this.logger.debug(`grandchild: ${data.clientId} is prepared, forwarding connection request to the platform`);

        this.parent.postMessage(event.data, this.defaultTargetString);
    }

    private handleParentPing(event: MessageEvent): void {

        if (!this.parentReady) {
            this.logger.debug("my parent is not ready, I am ignoring the parent ping");
            return;
        }

        if (!this.iAmConnected) {
            this.logger.debug("i am not fully connected yet, I am ignoring the parent ping");
            return;
        }

        const message = {
            glue42core: {
                type: this.messages.parentReady.name
            }
        };

        if (this.extContentConnected) {
            (message as any).glue42core.extMode = { windowId: this.myClientId };
        }

        const source = event.source as Window;

        this.logger.debug("responding to a parent ping with a ready message");

        source.postMessage(message, event.origin);
    }

    private handlePlatformUnload(event: MessageEvent): void {
        this.logger.debug("detected a web platform unload");

        this.parentReady = false;

        if (this.children.length) {
            this.logger.debug("forwarding the platform unload to all known children and starting platform discovery polling");
            this.children.forEach((child) => child.source.postMessage(event.data, child.origin));
        }

        this.notifyStatusChanged(false, "Gateway unloaded");

    }

    private handleManualUnload(): void {
        const message = {
            glue42core: {
                type: this.messages.clientUnload.name,
                data: {
                    clientId: this.myClientId,
                    ownWindowId: this.identity?.windowId
                }
            }
        };

        if (this.parent) {
            this.parent.postMessage(message, this.defaultTargetString);
        }

        if (this.extContentConnected) {
            return window.postMessage({ glue42ExtOut: message }, this.defaultTargetString);
        }

        this.port?.postMessage(message);
    }

    private handleClientUnload(event: MessageEvent): void {
        const data = event.data.glue42core;
        const clientId = data?.data.clientId;

        if (!clientId) {
            this.logger.warn("cannot process grand child unload, because the provided id was not valid");
            return;
        }

        const foundChild = this.children.find((child) => child.grandChildId === clientId);

        if (!foundChild) {
            this.logger.warn("cannot process grand child unload, because this client is unaware of this grandchild");
            return;
        }

        this.logger.debug(`handling grandchild unload for id: ${clientId}`);

        this.children = this.children.filter((child) => child.grandChildId !== clientId);
    }

    private handlePlatformPing(): void {
        this.logger.error("cannot handle platform ping, because this is not a platform calls handling component");
    }

    private notifyStatusChanged(status: boolean, reason?: string): void {
        this.iAmConnected = status;
        this.registry.execute("onConnectedChanged", status, reason);
    }

    private checkMessageTypeValid(typeToValidate: string): boolean {
        return typeof typeToValidate === "string" && !!this.messages[typeToValidate as MessageType];
    }

    private rejectConnectionRequest(source: Window, origin: string, reason: string): void {
        this.rejected = true;
        this.logger.error(reason);

        const rejection = {
            glue42core: {
                type: this.messages.connectionRejected.name
            }
        };

        source.postMessage(rejection, origin);
    }

    // --- ext methods ---

    private requestConnectionPermissionFromExt(): Promise<void> {

        // here I know that a content script is started, but not sure if it is ready

        return this.waitForContentScript()
            .then(() => PromisePlus<void>((resolve, reject) => {
                this.extConnectionResolve = resolve;
                this.extConnectionReject = reject;

                const message = {
                    glue42core: {
                        type: "extSetupRequest"
                    }
                };

                this.logger.debug("permission request to the extension content script was sent");

                window.postMessage(message, this.defaultTargetString);
            }, this.parentPingTimeout, "Cannot initialize glue, because this app was not opened or created by a Glue Client and the request for extension connection timed out"));
    }

    private handleExtConnectionResponse(event: MessageEvent): void {
        const data = event.data?.glue42core;

        if (!data.approved && this.extConnectionReject) {
            return this.extConnectionReject("Cannot initialize glue, because this app was not opened or created by a Glue Client and the request for extension connection was rejected");
        }

        if (this.extConnectionResolve) {
            this.extContentConnecting = true;
            this.logger.debug("The extension connection was approved, proceeding.");
            this.extConnectionResolve();
            delete this.extConnectionResolve;
        }
    }

    private handleExtSetupRequest(): void {
        // this is handled by the associated content script
        return;
    }

    private waitForContentScript(): Promise<void> {
        const contentReady = !!(window as any).glue42ext?.content;

        if (contentReady) {
            return Promise.resolve();
        }

        return PromisePlus<void>((resolve) => {

            window.addEventListener("Glue42EXTReady", () => {
                resolve();
            });

        }, this.connectionRequestTimeout, "The content script was available, but was never heard to be ready");
    }
}
