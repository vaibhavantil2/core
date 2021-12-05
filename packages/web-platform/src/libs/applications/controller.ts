/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Web } from "@glue42/web";
import { Glue42Core } from "@glue42/core";
import { generate } from "shortid";
import { ApplicationStartConfig, BridgeOperation, InternalApplicationsConfig, InternalPlatformConfig, LibController, SessionWindowData } from "../../common/types";
import { GlueController } from "../../controllers/glue";
import { SessionStorageController } from "../../controllers/session";
import { WindowsStateController } from "../../controllers/state";
import { IoC } from "../../shared/ioc";
import { PromiseWrap } from "../../shared/promisePlus";
import { getRelativeBounds } from "../../shared/utils";
import { appHelloDecoder, appHelloSuccessDecoder, applicationStartConfigDecoder, appManagerOperationTypesDecoder, appRemoveConfigDecoder, appsExportOperationDecoder, appsImportOperationDecoder, appsRemoteRegistrationDecoder, basicInstanceDataDecoder, instanceDataDecoder } from "./decoders";
import { AppsImportOperation, AppHello, AppHelloSuccess, ApplicationData, AppManagerOperationTypes, BasicInstanceData, InstanceData, InstanceLock, InstanceProcessInfo, AppsExportOperation, AppRemoveConfig, AppsRemoteRegistration, AppDirectoryStateChange } from "./types";
import logger from "../../shared/logger";
import { workspaceWindowDataDecoder } from "../workspaces/decoders";
import { simpleWindowDecoder } from "../windows/decoders";
import { WorkspaceWindowData } from "../workspaces/types";
import { SimpleWindowCommand, WindowTitleConfig } from "../windows/types";
import { AppDirectory } from "./appStore/directory";

export class ApplicationsController implements LibController {
    private config!: InternalApplicationsConfig;
    private applicationStartTimeoutMs = 15000;
    private started = false;
    private defaultBounds!: Glue42Web.Windows.Bounds;

    private locks: { [key: string]: InstanceLock } = {};

    private operations: { [key in AppManagerOperationTypes]: BridgeOperation } = {
        appHello: { name: "appHello", dataDecoder: appHelloDecoder, resultDecoder: appHelloSuccessDecoder, execute: this.handleAppHello.bind(this) },
        applicationStart: { name: "applicationStart", dataDecoder: applicationStartConfigDecoder, resultDecoder: instanceDataDecoder, execute: this.handleApplicationStart.bind(this) },
        instanceStop: { name: "instanceStop", dataDecoder: basicInstanceDataDecoder, execute: this.handleInstanceStop.bind(this) },
        registerWorkspaceApp: { name: "registerWorkspaceApp", dataDecoder: workspaceWindowDataDecoder, execute: this.registerWorkspaceApp.bind(this) },
        unregisterWorkspaceApp: { name: "unregisterWorkspaceApp", dataDecoder: simpleWindowDecoder, execute: this.unregisterWorkspaceApp.bind(this) },
        import: { name: "import", dataDecoder: appsImportOperationDecoder, execute: this.handleImport.bind(this) },
        remove: { name: "remove", dataDecoder: appRemoveConfigDecoder, execute: this.handleRemove.bind(this) },
        export: { name: "export", resultDecoder: appsExportOperationDecoder, execute: this.handleExport.bind(this) },
        clear: { name: "clear", execute: this.handleClear.bind(this) },
        registerRemoteApps: { name: "registerRemoteApps", dataDecoder: appsRemoteRegistrationDecoder, execute: this.handleRegisterRemoteApps.bind(this) },
    }

    constructor(
        private readonly glueController: GlueController,
        private readonly sessionStorage: SessionStorageController,
        private readonly stateController: WindowsStateController,
        private readonly appDirectory: AppDirectory,
        private readonly ioc: IoC
    ) { }

    private get logger(): Glue42Core.Logger.API | undefined {
        return logger.get("applications.controller");
    }

    public async start(config: InternalPlatformConfig): Promise<void> {
        this.defaultBounds = config.windows.defaultWindowOpenBounds;

        this.logger?.trace("initializing applications");

        this.config = config.applications;

        await this.appDirectory.start({
            config: config.applications,
            appsStateChange: (data: AppDirectoryStateChange) => this.emitStreamData("appDirectoryStateChange", data),
            sequelizer: this.ioc.createSequelizer()
        });

        this.started = true;
        this.stateController.onWindowDisappeared(this.processInstanceClosed.bind(this));

        this.logger?.trace("initialization is completed");
    }

    public async handleControl(args: any): Promise<any> {
        if (!this.started) {
            new Error("Cannot handle this windows control message, because the controller has not been started");
        }

        const applicationData = args.data;

        const commandId = args.commandId;

        const operationValidation = appManagerOperationTypesDecoder.run(args.operation);

        if (!operationValidation.ok) {
            throw new Error(`This appManager request cannot be completed, because the operation name did not pass validation: ${JSON.stringify(operationValidation.error)}`);
        }

        const operationName: AppManagerOperationTypes = operationValidation.result;

        const incomingValidation = this.operations[operationName].dataDecoder?.run(applicationData);

        if (incomingValidation && !incomingValidation.ok) {
            throw new Error(`AppManager request for ${operationName} rejected, because the provided arguments did not pass the validation: ${JSON.stringify(incomingValidation.error)}`);
        }

        this.logger?.debug(`[${commandId}] ${operationName} command is valid with data: ${JSON.stringify(applicationData)}`);

        const result = await this.operations[operationName].execute(applicationData, commandId);

        const resultValidation = this.operations[operationName].resultDecoder?.run(result);

        if (resultValidation && !resultValidation.ok) {
            throw new Error(`AppManager request for ${operationName} could not be completed, because the operation result did not pass the validation: ${JSON.stringify(resultValidation.error)}`);
        }

        this.logger?.trace(`[${commandId}] ${operationName} command was executed successfully`);

        return result;
    }

    public handleClientUnloaded(windowId: string, win: Window): void {
        this.logger?.trace(`handling unloading of ${windowId}`);

        if (!windowId) {
            return;
        }

        if (!win || win.closed) {
            this.logger?.trace(`${windowId} detected as closed, processing instance closed`);
            return this.processInstanceClosed(windowId);
        }

        this.logger?.trace(`${windowId} detected as not closed, skipping instance closed procedure`);
    }

    public unregisterWorkspaceApp(config: SimpleWindowCommand): void {
        this.processInstanceClosed(config.windowId);
        this.ioc.windowsController.cleanUpWindow(config.windowId);
    }

    public async handleApplicationStart(config: ApplicationStartConfig, commandId: string): Promise<InstanceData> {

        this.logger?.trace(`[${commandId}] handling application start command for application: ${config.name}`);

        const appDefinition = (await this.appDirectory.getAll()).find((app) => app.name === config.name);

        if (!appDefinition) {
            throw new Error(`Cannot start an instance of application: ${config.name}, because it is not found.`);
        }

        const instance: InstanceData = {
            id: config.id ?? generate(),
            applicationName: config.name
        };

        const openBounds = await this.getStartingBounds(appDefinition.createOptions, config, commandId);

        const options = config.forceChromeTab ?
            undefined :
            `left=${openBounds.left},top=${openBounds.top},width=${openBounds.width},height=${openBounds.height}`;

        this.logger?.trace(`[${commandId}] open arguments are valid, opening to bounds: ${options}`);

        const childWindow = window.open(appDefinition.createOptions.url, instance.id, options);

        if (!childWindow) {
            throw new Error(`Cannot an instance with url: ${appDefinition.createOptions.url} for application: ${config.name}. The most likely reason is that the user has not approved popups or has a blocker.`);
        }

        this.sessionStorage.saveBridgeInstanceData({ windowId: instance.id, appName: instance.applicationName });

        this.logger?.trace(`[${commandId}] the new window has been opened successfully with id: ${instance.id}, checking for AGM ready and notifying windows`);

        if (config.waitForAGMReady) {
            this.logger?.trace(`[${commandId}] wait for AGM is set, configuring the lock`);
            this.setLock(instance.id);
        }

        await this.notifyWindows(instance, config.context, childWindow);

        if (this.locks[instance.id]) {
            try {
                await PromiseWrap(() => this.locks[instance.id]?.keyOne, this.applicationStartTimeoutMs);
            } catch (error) {
                throw new Error(`Application start for ${config.name} timed out waiting for client to initialize Glue`);
            }
        }

        this.logger?.trace(`[${commandId}] the windows controller has been successfully notified`);

        const processConfig: InstanceProcessInfo = {
            data: instance,
            monitorState: config.waitForAGMReady ? undefined : { child: childWindow },
            context: config.context
        };

        await this.processNewInstance(processConfig);

        this.logger?.trace(`[${commandId}] the new instance with id ${instance.id} has been saved, announced and context set, lifting key two and responding to caller`);

        this.locks[instance.id]?.openKeyTwo();

        return instance;
    }

    private processInstanceClosed(selfWindowId?: string): void {
        if (!selfWindowId) {
            return;
        }

        const instanceData = this.sessionStorage.getInstanceData(selfWindowId);

        if (instanceData) {
            this.sessionStorage.removeInstance(instanceData.id);
            this.emitStreamData("instanceStopped", instanceData);
        }
    }

    private async notifyWindows(instance: InstanceData, context?: any, child?: Window): Promise<void> {
        const windowData: SessionWindowData = {
            windowId: instance.id,
            name: `${instance.applicationName}_${instance.id}`
        };

        await this.ioc.windowsController.processNewWindow(windowData, context, child);
    }

    private async handleAppHello(helloMsg: AppHello, commandId: string): Promise<AppHelloSuccess> {
        this.logger?.trace(`[${commandId}] handling hello message for id: ${helloMsg.windowId}`);

        if (helloMsg.windowId && this.locks[helloMsg.windowId]) {
            this.logger?.trace(`[${commandId}] found an app lock, unlocking key one and waiting for the second one`);

            this.locks[helloMsg.windowId].openKeyOne();

            await this.locks[helloMsg.windowId].keyTwo;

            delete this.locks[helloMsg.windowId];

            this.logger?.trace(`[${commandId}] the lock is lifted, proceeding`);
        }

        const allInstances = this.sessionStorage.getAllInstancesData();

        const allAppsFull = (await this.appDirectory.getAll()).map<ApplicationData>((app) => {

            const appInstances = allInstances.filter((inst) => inst.applicationName === app.name);

            return Object.assign({}, app, { instances: appInstances });
        });

        if (helloMsg.windowId) {
            this.logger?.trace(`[${commandId}] there is a valid windowId, removing ${helloMsg.windowId} from the state controller`);
            this.stateController.remove(helloMsg.windowId);

            const foundApp = allAppsFull.find((app) => app.instances.some((inst) => inst.id === helloMsg.windowId));

            if (foundApp && foundApp.title) {

                const windowId: string = helloMsg.windowId;
                const title: string = foundApp.title;

                PromiseWrap<void>(() => this.glueController.callWindow<WindowTitleConfig, void>(this.ioc.windowsController.setTitleOperation, { windowId, title }, windowId), 20000)
                    .catch((err) => this.logger?.trace(`[${commandId}] error while setting the application instance title: ${err.message}`));
            }
        }

        const helloSuccessMessage = { apps: allAppsFull };

        this.logger?.trace(`[${commandId}] compiled a list of all active applications and instances and returning it to the caller`);

        return helloSuccessMessage;
    }

    private async handleInstanceStop(inst: BasicInstanceData, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling stop command for instance: ${inst.id}`);

        const workspaceClient = this.sessionStorage.getWorkspaceClientById(inst.id);

        if (workspaceClient) {
            this.logger?.trace(`[${commandId}] this instance is detected as a workspace window, closing via the workspaces controller`);

            await this.ioc.workspacesController.closeItem({ itemId: inst.id }, commandId);

            return;
        }

        const instanceData = this.sessionStorage.getInstanceData(inst.id);

        if (!instanceData) {
            throw new Error(`Cannot close instance: ${inst.id}, because it is not known by the platform`);
        }

        const windowData = this.sessionStorage.getWindowDataById(inst.id);

        if (!windowData) {
            throw new Error(`Cannot close instance: ${inst.id}, because it's window is not known by the platform`);
        }

        if (windowData.name === "Platform") {
            throw new Error("Closing the main application is not allowed");
        }

        window.open(undefined, windowData.windowId)?.close();

        this.processInstanceClosed(inst.id);

        this.ioc.windowsController.cleanUpWindow(inst.id);

        this.logger?.trace(`[${commandId}] instance ${inst.id} has been closed, removed from store, announced stopped and notified windows, responding to caller`);
    }

    public async handleRegisterRemoteApps(config: AppsRemoteRegistration, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling remote bypass command`);

        if (this.config.remote) {
            throw new Error(`[${commandId}] cannot accept remote apps from the protocol, because there is an active remote configuration.`);
        }

        await this.appDirectory.processAppDefinitions(config.definitions, { mode: "replace", type: "remote" });

        this.logger?.trace(`[${commandId}] remote bypass command completed`);
        return;
    }

    public async handleImport(config: AppsImportOperation, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling import command`);

        await this.appDirectory.processAppDefinitions(config.definitions, { type: "inmemory", mode: config.mode });

        this.logger?.trace(`[${commandId}] import command completed`);
        return;
    }

    public async handleRemove(config: AppRemoveConfig, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling remove command for ${config.name}`);

        const removed = await this.appDirectory.removeInMemory(config.name);

        if (removed) {
            this.logger?.trace(`definition ${removed.name} removed successfully`);
            this.emitStreamData("appDirectoryStateChange", { appsRemoved: [removed], appsAdded: [], appsChanged: [] });
        }
    }

    public async handleExport(_: any, commandId: string): Promise<AppsExportOperation> {
        this.logger?.trace(`[${commandId}] handling export command`);

        const definitions = await this.appDirectory.exportInMemory();

        this.logger?.trace(`[${commandId}] export command successful`);

        return { definitions };
    }

    public async handleClear(_: any, commandId: string): Promise<void> {
        this.logger?.trace(`[${commandId}] handling clear command`);

        await this.appDirectory.processAppDefinitions([], { type: "inmemory", mode: "replace" });

        this.logger?.trace(`[${commandId}] all in-memory apps are cleared`);
    }

    private setLock(id: string): void {

        const lock: any = {};

        const keyOne = new Promise<void>((resolve) => {
            lock.openKeyOne = resolve;
        });

        const keyTwo = new Promise<void>((resolve) => {
            lock.openKeyTwo = resolve;
        });

        lock.keyOne = keyOne;
        lock.keyTwo = keyTwo;

        this.locks[id] = lock;
    }

    private async registerWorkspaceApp(data: WorkspaceWindowData, commandId: string): Promise<void> {
        if (!data.appName) {
            throw new Error(`Cannot register application with config: ${JSON.stringify(data)}, because no app name was found`);
        }

        const allAppDefinitions = await this.appDirectory.getAll();

        if (!allAppDefinitions.some((app) => app.name === data.appName)) {
            throw new Error(`Cannot register application with config: ${JSON.stringify(data)}, because no app with this name name was found`);
        }

        this.sessionStorage.saveBridgeInstanceData({ windowId: data.windowId, appName: data.appName });

        this.logger?.trace(`[${commandId}] processing valid workspace application registration with id ${data.windowId}, app name ${data.appName} and frame ${data.frameId}`);

        if (data.context) {
            await this.glueController.setInstanceStartContext(data.windowId, data.context);
        }

        const instanceData: InstanceData = { id: data.windowId, applicationName: data.appName };

        this.sessionStorage.saveInstanceData(instanceData);

        this.emitStreamData("instanceStarted", instanceData);

        this.logger?.trace(`[${commandId}] instance registration is completed and announced, calling windows registration`);

        await this.ioc.windowsController.registerWorkspaceWindow(data, commandId);
    }

    private async processNewInstance(config: InstanceProcessInfo): Promise<void> {
        if (config.context) {
            await this.glueController.setInstanceStartContext(config.data.id, config.context);
        }

        this.sessionStorage.saveInstanceData(config.data);

        if (config.monitorState) {
            this.stateController.add(config.monitorState.child, config.data.id);
        }

        this.emitStreamData("instanceStarted", config.data);
    }

    private emitStreamData(operation: "appDirectoryStateChange" | "instanceStarted" | "instanceStopped", data: any): void {
        this.logger?.trace(`sending notification of event: ${operation} with data: ${JSON.stringify(data)}`);
        this.glueController.pushSystemMessage("appManager", operation, data);
    }

    private async getStartingBounds(appDefOptions: Glue42Web.AppManager.DefinitionDetails, openOptions: ApplicationStartConfig, commandId: string): Promise<Glue42Web.Windows.Bounds> {

        const openBounds: Glue42Web.Windows.Bounds = {
            top: openOptions.top || appDefOptions.top || this.defaultBounds.top,
            left: openOptions.left || appDefOptions.left || this.defaultBounds.left,
            width: openOptions.width || appDefOptions.width || this.defaultBounds.width,
            height: openOptions.height || appDefOptions.height || this.defaultBounds.height
        };

        if (!openOptions.relativeTo) {
            return openBounds;
        }

        try {
            const relativeWindowBounds = await this.ioc.windowsController.getWindowBounds(openOptions.relativeTo, commandId);

            const relativeDir = openOptions.relativeDirection ?? "right";

            const newBounds = getRelativeBounds(openBounds, relativeWindowBounds, relativeDir);

            return newBounds;
        } catch (error) {
            return openBounds;
        }
    }
}
