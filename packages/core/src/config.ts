/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Core } from "../glue";
import { InternalConfig, GDStaringContext } from "./types";
import generate from "shortid";
import Utils from "./utils/utils";
import { ContextMessageReplaySpec } from "./contexts/contextMessageReplaySpec";
import { version as pjsonVersion } from "../package.json";
import { ConnectionSettings } from "./connection/types";

export default function (configuration: Glue42Core.Config, ext: Glue42Core.Extension, glue42gd: Glue42Core.GDObject | undefined): InternalConfig {

    let nodeStartingContext: GDStaringContext;
    if (Utils.isNode()) {
        const startingContextString = process.env._GD_STARTING_CONTEXT_;
        if (startingContextString) {
            try {
                nodeStartingContext = JSON.parse(startingContextString);
            } catch {
                // Do nothing - we will continue with the flow as if there is no starting context
            }
        }
    }

    function getConnection(): ConnectionSettings {

        const gwConfig = configuration.gateway;

        const protocolVersion = gwConfig?.protocolVersion ?? 3;
        const reconnectInterval = gwConfig?.reconnectInterval;
        const reconnectAttempts = gwConfig?.reconnectAttempts;

        const defaultWs = "ws://localhost:8385";
        let ws = gwConfig?.ws;
        const sharedWorker = gwConfig?.sharedWorker;
        const inproc = gwConfig?.inproc;
        const webPlatform = gwConfig?.webPlatform ?? undefined;

        // If running in GD use the injected ws URL
        if (glue42gd) {
            // GD3
            ws = glue42gd.gwURL;
        }
        // if running in Node app, started from GD, use the ws from starting context
        if (Utils.isNode() && nodeStartingContext && nodeStartingContext.gwURL) {
            ws = nodeStartingContext.gwURL;
        }

        // if nothing specified use default WS
        if (!ws && !sharedWorker && !inproc) {
            ws = defaultWs;
        }

        let instanceId: string | undefined;
        let windowId: string | undefined;
        let pid: number | undefined;
        let environment: string | undefined;
        let region: string | undefined;
        const appName = getApplication();
        let uniqueAppName = appName;
        if (typeof glue42gd !== "undefined") {
            windowId = glue42gd.windowId;
            pid = glue42gd.pid;
            if (glue42gd.env) {
                environment = glue42gd.env.env;
                region = glue42gd.env.region;
            }
            // G4E-1668
            uniqueAppName = glue42gd.application ?? "glue-app";
            instanceId = glue42gd.appInstanceId;
        } else if (Utils.isNode()) {
            pid = process.pid;
            if (nodeStartingContext) {
                environment = nodeStartingContext.env;
                region = nodeStartingContext.region;
                instanceId = nodeStartingContext.instanceId;
            }
        } else if (typeof window?.glue42electron !== "undefined") {
            windowId = window?.glue42electron.instanceId;
            pid = window?.glue42electron.pid;
            environment = window?.glue42electron.env;
            region = window?.glue42electron.region;
            // G4E-1668
            uniqueAppName = window?.glue42electron.application ?? "glue-app";
            instanceId = window?.glue42electron.instanceId;
        } else {
            // this is the case where this is is running in Glue42 Core V2
            // in this case the windowId of the identity is set by the WebTransport, because it needs to communicate with possible parents
        }

        // replay specs for core connection
        const replaySpecs = configuration.gateway?.replaySpecs ?? [];
        // inject Context message replay
        replaySpecs.push(ContextMessageReplaySpec);

        let identity = {
            application: uniqueAppName,
            applicationName: appName,
            windowId,
            instance: instanceId,
            process: pid,
            region,
            environment,
            api: ext.version || pjsonVersion
        };

        if (configuration.identity) {
            identity = Object.assign(identity, configuration.identity);
        }

        return {
            identity,
            reconnectInterval,
            ws,
            sharedWorker,
            webPlatform,
            inproc,
            protocolVersion,
            reconnectAttempts,
            replaySpecs,
        };
    }

    function getApplication() {
        if (configuration.application) {
            return configuration.application;
        }

        if (glue42gd) {
            return glue42gd.applicationName;
        }

        if (typeof window !== "undefined" && typeof (window as any).glue42electron !== "undefined") {
            return (window as any).glue42electron.application;
        }

        const uid = generate();
        if (Utils.isNode()) {
            if (nodeStartingContext) {
                return nodeStartingContext.applicationConfig.name;
            }

            return "NodeJS" + uid;
        }

        if (typeof window !== "undefined" && typeof document !== "undefined") {
            return document.title + ` (${uid})`;
        }

        return uid;
    }

    function getAuth(): Glue42Core.Auth | undefined {
        if (typeof configuration.auth === "string") {
            return {
                token: configuration.auth
            };
        }

        if (configuration.auth) {
            return configuration.auth;
        }

        if (Utils.isNode() && nodeStartingContext && nodeStartingContext.gwToken) {
            return {
                gatewayToken: nodeStartingContext.gwToken
            };
        }

        if (configuration.gateway?.webPlatform || configuration.gateway?.inproc || configuration.gateway?.sharedWorker) {
            return {
                username: "glue42", password: "glue42"
            };
        }
    }

    function getLogger(): { console: Glue42Core.LogLevel; publish: Glue42Core.LogLevel } {
        let config = configuration.logger;
        const defaultLevel = "warn";
        if (!config) {
            config = defaultLevel;
        }

        // console level can be overridden by a gd setting
        let gdConsoleLevel: Glue42Core.LogLevel | undefined;
        if (glue42gd) {
            gdConsoleLevel = glue42gd.consoleLogLevel;
        }

        if (typeof config === "string") {
            return { console: gdConsoleLevel ?? config, publish: defaultLevel };
        }

        return {
            console: gdConsoleLevel ?? config.console ?? defaultLevel,
            publish: config.publish ?? defaultLevel
        };
    }

    const connection = getConnection();
    let application: string = getApplication();
    if (typeof window !== "undefined") {
        const windowAsAny = window as any;
        const containerApplication = windowAsAny.htmlContainer ?
            `${windowAsAny.htmlContainer.containerName}.${windowAsAny.htmlContainer.application}` :
            windowAsAny?.glue42gd?.application;
        if (containerApplication) {
            application = containerApplication;
        }
    }

    return {
        bus: configuration.bus ?? false,
        application,
        auth: getAuth(),
        logger: getLogger(),
        connection,
        metrics: configuration.metrics ?? true,
        contexts: configuration.contexts ?? true,
        version: ext.version || pjsonVersion,
        libs: ext.libs ?? [],
        customLogger: configuration.customLogger
    };
}
