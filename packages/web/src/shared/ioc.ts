import { WebWindowModel } from "../windows/webWindow";
import { LibController, LibDomains, ParsedConfig } from "./types";
import { WindowsController } from "../windows/controller";
import { Glue42Core } from "@glue42/core";
import { GlueBridge } from "../communication/bridge";
import { AppManagerController } from "../appManager/controller";
import { WindowProjection } from "../windows/protocol";
import { BaseApplicationData, InstanceData } from "../appManager/protocol";
import { Glue42Web } from "../../web";
import { InstanceModel } from "../appManager/instance";
import { ApplicationModel } from "../appManager/application";
import { LayoutsController } from "../layouts/controller";
import { NotificationsController } from "../notifications/controller";
import { IntentsController } from "../intents/controller";
import { ChannelsController } from "../channels/controller";
import { SystemController } from "../system/controller";
import { Notification } from "../notifications/notification";
import { ExtController } from "../extension/controller";
import { EventsDispatcher } from "./dispatcher";

export class IoC {
    private _webConfig!: ParsedConfig;
    private _windowsControllerInstance!: WindowsController;
    private _appManagerControllerInstance!: AppManagerController;
    private _layoutsControllerInstance!: LayoutsController;
    private _notificationsControllerInstance!: NotificationsController;
    private _intentsControllerInstance!: IntentsController;
    private _channelsControllerInstance!: ChannelsController;
    private _extensionController!: ExtController;
    private _systemControllerInstance!: SystemController;
    private _bridgeInstance!: GlueBridge;
    private _eventsDispatcher!: EventsDispatcher;

    public controllers: { [key in LibDomains]: LibController } = {
        windows: this.windowsController,
        appManager: this.appManagerController,
        layouts: this.layoutsController,
        notifications: this.notificationsController,
        intents: this.intentsController,
        channels: this.channelsController,
        system: this.systemController,
        extension: this.extensionController
    }

    constructor(private readonly coreGlue: Glue42Core.GlueCore) { }

    public get windowsController(): WindowsController {
        if (!this._windowsControllerInstance) {
            this._windowsControllerInstance = new WindowsController();
        }

        return this._windowsControllerInstance;
    }

    public get appManagerController(): AppManagerController {
        if (!this._appManagerControllerInstance) {
            this._appManagerControllerInstance = new AppManagerController();
        }

        return this._appManagerControllerInstance;
    }

    public get layoutsController(): LayoutsController {
        if (!this._layoutsControllerInstance) {
            this._layoutsControllerInstance = new LayoutsController();
        }

        return this._layoutsControllerInstance;
    }

    public get notificationsController(): NotificationsController {
        if (!this._notificationsControllerInstance) {
            this._notificationsControllerInstance = new NotificationsController();
        }

        return this._notificationsControllerInstance;
    }

    public get intentsController(): IntentsController {
        if (!this._intentsControllerInstance) {
            this._intentsControllerInstance = new IntentsController();
        }

        return this._intentsControllerInstance;
    }

    public get systemController(): SystemController {
        if (!this._systemControllerInstance) {
            this._systemControllerInstance = new SystemController();
        }

        return this._systemControllerInstance;
    }

    public get channelsController(): ChannelsController {
        if (!this._channelsControllerInstance) {
            this._channelsControllerInstance = new ChannelsController();
        }

        return this._channelsControllerInstance;
    }

    public get extensionController(): ExtController {
        if (!this._extensionController) {
            this._extensionController = new ExtController();
        }

        return this._extensionController;
    }

    public get eventsDispatcher(): EventsDispatcher {
        if (!this._eventsDispatcher) {
            this._eventsDispatcher = new EventsDispatcher();
        }

        return this._eventsDispatcher;
    }

    public get bridge(): GlueBridge {
        if (!this._bridgeInstance) {
            this._bridgeInstance = new GlueBridge(this.coreGlue);
        }

        return this._bridgeInstance;
    }
    
    public get config(): ParsedConfig {
        return this._webConfig;
    }

    public defineConfig(config: ParsedConfig): void {
        this._webConfig = config;
    }

    public async buildWebWindow(id: string, name: string): Promise<WindowProjection> {

        const model = new WebWindowModel(id, name, this.bridge);

        const api = await model.toApi();

        return { id, model, api };
    }

    public buildNotification(config: Glue42Web.Notifications.RaiseOptions): Glue42Web.Notifications.Notification {
        return new Notification(config);
    }

    public async buildApplication(app: BaseApplicationData, applicationInstances: InstanceData[]): Promise<Glue42Web.AppManager.Application> {

        const application = (new ApplicationModel(app, [], this.appManagerController)).toApi();

        const instances = applicationInstances.map((instanceData) => this.buildInstance(instanceData, application));

        application.instances.push(...instances);

        return application;
    }

    public buildInstance(instanceData: InstanceData, app: Glue42Web.AppManager.Application): Glue42Web.AppManager.Instance {
        return (new InstanceModel(instanceData, this.bridge, app)).toApi();
    }
}
