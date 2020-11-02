import { Glue42Core } from "../glue";
import { InternalConfig } from "./types";
import generate from "shortid";
import Utils from "./utils/utils";
import { ContextMessageReplaySpec } from "./contexts/contextMessageReplaySpec";

import { version as pjsonVersion } from "../package.json";

declare var global: any;

interface GDStaringContext {
    gwURL?: string;
    gwToken?: string;
    applicationConfig: {
        name: string
    };
    env: string;
    region: string;
    instanceId: string;
}

export default function (configuration: Glue42Core.Config, ext: Glue42Core.Extension, hc: Glue42Core.HtmlContainerObject, glue42gd: Glue42Core.GDObject, gdVersion: number): InternalConfig {
    let globalScope;
    if (typeof window !== "undefined") {
        globalScope = window;
    }
    if (typeof global !== "undefined") {
        globalScope = global; // ... Safari WebView
    }
    globalScope = globalScope || {};     // ... a bit paranoid

    const uid = generate();

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

    // when searching for a configuration value check the following chain until the value is resolved:
    //
    // 1. global.GLUE_CONFIG            - a way to override user preferences. Use case is GLUE Mobile
    // 2. userConfig                    - user configuration
    // 3. global.GLUE_DEFAULT_CONFIG    - a way to dynamically override hard coded defaults
    // 4. hardDefaults                  - glue.js hard coded defaults

    const masterConfig = globalScope.GLUE_CONFIG || {};
    const dynamicDefaults = globalScope.GLUE_DEFAULT_CONFIG || {};
    const hardDefaults = getHardDefaults();

    const metricsIdentity = {
        system: getConfigProp<string>("metrics", "system"),
        service: getConfigProp<string>("metrics", "service"),
        instance: getConfigProp<string>("metrics", "instance")
    };

    const disableAutoAppSystem = getConfigProp<boolean>("metrics", "disableAutoAppSystem");

    function getMetrics() {
        return {
            identity: metricsIdentity,
            disableAutoAppSystem
        };
    }

    function getGateway(): Glue42Core.Connection.Settings {
        const force = getConfigProp<boolean>("gateway", "force");
        const gw = hc === undefined || force;
        if (gw) {
            const gwConfig = getConfigProp<any>("gateway");

            const protocolVersion = getConfigProp<number>("gateway", "protocolVersion");
            const reconnectInterval = getConfigProp<number>("gateway", "reconnectInterval");
            const reconnectAttempts = getConfigProp<number>("gateway", "reconnectAttempts");

            let ws = gwConfig.ws;
            let http = gwConfig.http;
            const inproc = gwConfig.inproc;

            // if not we will select endpoint for him
            if (!ws && !http && !inproc) {

                if (Utils.isNode() || ("WebSocket" in window && window.WebSocket.CLOSING === 2)) {
                    // if in node, or we have WebSockets use ws
                    ws = getConfigProp<string>("gateway", "ws");
                } else {
                    // fallback to http
                    http = getConfigProp<string>("gateway", "http");
                }
            }
            let instanceId: string;
            let windowId: string;
            let pid: number;
            let environment: string;
            let region: string;
            const appName = getApplication();
            let uniqueAppName = appName;
            if (hc) {
                windowId = hc.windowId;
                environment = hc.env.env;
                region = hc.env.region;
            } else if (typeof glue42gd !== "undefined") {
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
            }

            // replay specs for core connection
            const replaySpecs = getConfigProp<Glue42Core.Connection.MessageReplaySpec[]>("gateway", "replaySpecs") || [];
            // inject Context message replay
            replaySpecs.push(ContextMessageReplaySpec);
            return {
                identity: {
                    application: uniqueAppName,
                    applicationName: appName,
                    windowId,
                    instance: instanceId,
                    process: pid,
                    region,
                    environment,
                    api: ext.version || pjsonVersion
                },
                reconnectInterval,
                ws,
                http,
                gw: inproc,
                protocolVersion,
                reconnectAttempts,
                force: true,
                replaySpecs,
                gdVersion,
            };
        }

        return { gdVersion };
    }

    function getLogger(): Glue42Core.LoggerConfig {
        const logger = getConfigProp<Glue42Core.LoggerConfig | string>("logger");
        if (typeof logger === "string") {
            return {
                console: logger,
                metrics: "off",
                publish: "off"
            };
        }
        return logger;
    }

    function getAgm() {
        return ifNotFalse(
            configuration.agm,
            {
                instance: {
                    application: getApplication()
                }
            });
    }

    function getContexts(connectionConfig: Glue42Core.Connection.Settings) {
        // context does not work on GW1
        if (connectionConfig.protocolVersion < 3) {
            return false;
        }

        // if turned off in config
        const contextConfig = getConfigProp("contexts");
        if (typeof contextConfig === "boolean" && !contextConfig) {
            return false;
        }
        return true;
    }

    function getChannels(contextsEnabled: boolean) {
        // channels depend on contexts
        if (!contextsEnabled) {
            return false;
        }
        // if turned off in config
        const channelsConfig = getConfigProp("channels");
        if (typeof channelsConfig === "boolean" && !channelsConfig) {
            return false;
        }
        return true;
    }

    function getBus(connectionConfig: Glue42Core.Connection.Settings) {
        // TURNED OFF BY DEFAULT

        const contextConfig = getConfigProp("bus");
        if (typeof contextConfig === "boolean" && contextConfig) {
            // context works only in in GD3 when connected to GW3
            if (connectionConfig.protocolVersion && connectionConfig.protocolVersion < 3) {
                return false;
            }
            if (gdVersion === 2) {
                return false;
            }

            // if the env is ok, bus is turned off by default
            return true;
        }
        return false;
    }

    function getApplication() {
        return getConfigProp<string>("application");
    }

    function getAuth() {
        return getConfigProp<any>("auth");
    }

    function getHardDefaults() {
        function getMetricsDefaults() {
            let documentTitle = typeof document !== "undefined" ? document.title : "unknown";
            // check for empty titles
            documentTitle = documentTitle || "none";

            if (typeof hc === "undefined") {
                return {
                    system: "Connect.Browser",
                    service: configuration.application || documentTitle,
                    instance: "~" + uid
                };
            }

            if (typeof hc.metricsFacade.getIdentity !== "undefined") {
                const identity = hc.metricsFacade.getIdentity();
                return {
                    system: identity.system,
                    service: identity.service,
                    instance: identity.instance
                };
            }

            // backward compatibility for HC <= 1.60
            return {
                system: "HtmlContainer." + hc.containerName,
                service: "JS." + hc.browserWindowName,
                instance: "~" + hc.machineName
            };
        }

        function getGatewayDefaults() {
            let defaultProtocol = 3;
            const gatewayURL = "localhost:8385";
            let defaultWs = "ws://" + gatewayURL;
            const defaultHttp = "http://" + gatewayURL;

            if (glue42gd) {
                // GD3
                defaultProtocol = 3;
                defaultWs = glue42gd.gwURL;
            }

            if (Utils.isNode() && nodeStartingContext) {
                defaultProtocol = 3;
                defaultWs = nodeStartingContext.gwURL;
            }

            return {
                ws: defaultWs,
                http: defaultHttp,
                protocolVersion: defaultProtocol,
                reconnectInterval: 1000
            };
        }

        function getDefaultApplicationName() {
            if (hc) {
                return hc.containerName + "." + hc.browserWindowName;
            }

            if (glue42gd) {
                return glue42gd.applicationName;
            }

            if (Utils.isNode()) {
                if (nodeStartingContext) {
                    return nodeStartingContext.applicationConfig.name;
                }

                return "NodeJS" + uid;
            }

            if (typeof window !== "undefined" && typeof document !== "undefined") {
                return ((window as any).agm_application || document.title) + uid;
            }
        }

        function getDefaultLogger() {
            return {
                publish: "off",
                console: "error",
                metrics: "off",
            };
        }

        function getDefaultAuth() {
            if (Utils.isNode() && nodeStartingContext) {
                return {
                    gatewayToken: nodeStartingContext.gwToken
                };
            }
        }

        return {
            application: getDefaultApplicationName(),
            metrics: getMetricsDefaults(),
            agm: {},
            gateway: getGatewayDefaults(),
            logger: getDefaultLogger(),
            bus: false,
            auth: getDefaultAuth()
        };
    }

    function getConfigProp<T>(prop1: string, prop2?: string): T {

        const masterConfigProp1 = masterConfig[prop1];
        const userProp1 = (configuration as any)[prop1];
        const dynamicDefaultsProp1 = dynamicDefaults[prop1];
        const hardDefaultsProp1 = (hardDefaults as any)[prop1];

        if (prop2) {
            if (masterConfigProp1 && masterConfigProp1[prop2] !== undefined) {
                return masterConfigProp1[prop2] as T;
            }

            if (userProp1 && userProp1[prop2] !== undefined) {
                return userProp1[prop2] as T;
            }

            if (dynamicDefaultsProp1 && dynamicDefaultsProp1[prop2] !== undefined) {
                return dynamicDefaultsProp1[prop2] as T;
            }

            if (hardDefaultsProp1 && hardDefaultsProp1[prop2] !== undefined) {
                return hardDefaultsProp1[prop2] as T;
            }

        } else {

            if (masterConfigProp1 !== undefined) {
                return masterConfigProp1 as T;
            }
            if (userProp1 !== undefined) {
                return userProp1 as T;
            }
            if (dynamicDefaultsProp1 !== undefined) {
                return dynamicDefaultsProp1 as T;
            }
            if (hardDefaultsProp1 !== undefined) {
                return hardDefaultsProp1 as T;
            }
        }

        return undefined;

    }

    function ifNotFalse(what: any, then: any) {
        if (typeof what === "boolean" && !what) {
            return undefined;
        } else {
            return then;
        }
    }

    const connection = getGateway();
    const contexts = getContexts(connection);
    const channels = getChannels(contexts);
    const bus = getBus(connection);
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
        bus,
        identity: metricsIdentity,
        application,
        auth: getAuth(),
        logger: getLogger(),
        connection,
        metrics: getMetrics(),
        agm: getAgm(),
        contexts,
        channels,
        version: ext.version || pjsonVersion,
        libs: ext.libs,
        customLogger: configuration.customLogger
    };
}
