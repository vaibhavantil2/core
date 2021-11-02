import metrics from "./metrics/main";
import Connection from "./connection/connection";
import { Logger } from "./logger/logger";
import { Glue42Core } from "../glue";
import prepareConfig from "./config";
import timer, { getAllTimers } from "./utils/timer";
import Utils from "./utils/utils";
import { Timer } from "./types";
import { ContextsModule } from "./contexts/contextsModule";
import { ContextMessageReplaySpec } from "./contexts/contextMessageReplaySpec";
import { InteropSettings } from "./interop/types";
import Interop from "./interop/interop";
import { MessageBus } from "./bus/main";
import { version } from "../package.json";
import shortid from "shortid";

const GlueCore = (userConfig?: Glue42Core.Config, ext?: Glue42Core.Extension): Promise<Glue42Core.GlueCore> => {
    const gdVersion: number | undefined = Utils.getGDMajorVersion();
    let glue42gd: Glue42Core.GDObject | undefined;
    let preloadPromise: Promise<any> = Promise.resolve();

    if (gdVersion) {
        if (gdVersion < 3) {
            throw new Error("GD v2 is not supported. Use v4 of the API to run in that context.");
        } else if (gdVersion >= 3) {
            glue42gd = window.glue42gd;
            preloadPromise = window.gdPreloadPromise || preloadPromise;
        }
    }

    const glueInitTimer = timer("glue");

    userConfig = userConfig || {};
    ext = ext || {};
    const internalConfig = prepareConfig(userConfig, ext, glue42gd);

    // Init the GLUE namespace
    let _connection: Connection;
    let _interop: Interop;
    let _logger: Logger;
    let _metrics: Glue42Core.Metrics.API;
    let _contexts: Glue42Core.Contexts.API;
    let _bus: Glue42Core.Bus.API;
    let _allowTrace: boolean; // true if trace logging is enabled

    const libs: { [key: string]: any } = {};

    function registerLib(name: string | string[], inner: any, t: Timer) {

        _allowTrace = _logger.canPublish("trace");
        if (_allowTrace) {
            _logger.trace(`registering ${name} module`);
        }

        const done = () => {
            inner.initTime = t.stop();
            inner.initEndTime = t.endTime;
            inner.marks = t.marks;
            if (_allowTrace) {
                _logger.trace(`${name} is ready - ${t.endTime - t.startTime}`);
            }
        };

        inner.initStartTime = t.startTime;
        if (inner.ready) {
            inner.ready().then(() => {
                done();
            });
        } else {
            done();
        }

        if (!Array.isArray(name)) {
            name = [name];
        }

        name.forEach((n) => {
            libs[n] = inner;
            (GlueCore as any)[n] = inner;
        });
    }

    function setupConnection(): Promise<object> {
        const initTimer = timer("connection");
        _connection = new Connection(internalConfig.connection, _logger.subLogger("connection"));

        let authPromise: Promise<any> = Promise.resolve(internalConfig.auth);

        // no auth - what we do in different protocol versions
        if (internalConfig.connection && !internalConfig.auth) {
            if (glue42gd) {
                authPromise = glue42gd.getGWToken()
                    .then((token) => {
                        // initTimer.mark("got-gw-token");
                        return {
                            gatewayToken: token
                        };
                    });
            } else if (typeof window !== "undefined" && window?.glue42electron) {
                if (typeof window.glue42electron.gwToken === "string") {
                    authPromise = Promise.resolve({
                        gatewayToken: window.glue42electron.gwToken
                    });
                }
            } else {
                // assign to auth promise so we ca cleanup the connection
                authPromise = Promise.reject("You need to provide auth information");
            }
        }

        return authPromise
            .then((authConfig) => {
                initTimer.mark("auth-promise-resolved");
                // convert the authConfig to AuthRequest object
                let authRequest: Glue42Core.Auth;
                if (Object.prototype.toString.call(authConfig) === "[object Object]") {
                    authRequest = authConfig;
                } else {
                    throw new Error("Invalid auth object - " + JSON.stringify(authConfig));
                }
                // do the login
                return _connection.login(authRequest);
            })
            .then(() => {
                registerLib("connection", _connection, initTimer);
                return internalConfig;
            })
            .catch((e) => {
                if (_connection) {
                    _connection.logout();
                }
                throw e;
            });
    }

    function setupLogger(): Promise<void> {
        // Logger
        const initTimer = timer("logger");
        _logger = new Logger(`${internalConfig.connection.identity?.application}`, undefined, internalConfig.customLogger);
        _logger.consoleLevel(internalConfig.logger.console);
        _logger.publishLevel(internalConfig.logger.publish);

        if (_logger.canPublish("debug")) {
            _logger.debug("initializing glue...");
        }
        registerLib("logger", _logger, initTimer);

        return Promise.resolve(undefined);
    }

    function setupMetrics(): Promise<void> {
        const initTimer = timer("metrics");
        const config = internalConfig.metrics;

        const metricsPublishingEnabledFunc = glue42gd?.getMetricsPublishingEnabled;
        const identity = internalConfig.connection.identity;
        const canUpdateMetric = metricsPublishingEnabledFunc ? metricsPublishingEnabledFunc : () => true;
        const disableAutoAppSystem: boolean = (typeof config !== "boolean" && config.disableAutoAppSystem) ?? false;
        _metrics = metrics({
            connection: config ? _connection : undefined,
            logger: _logger.subLogger("metrics"),
            canUpdateMetric,
            system: "Glue42",
            service: identity?.service ?? glue42gd?.applicationName ?? internalConfig.application,
            instance: identity?.instance ?? identity?.windowId ?? shortid(),
            disableAutoAppSystem,
            pagePerformanceMetrics: typeof config !== "boolean" ? config?.pagePerformanceMetrics : undefined
        });

        registerLib("metrics", _metrics, initTimer);
        return Promise.resolve();
    }

    function setupInterop(): Promise<void> {
        const initTimer = timer("interop");

        const agmConfig: InteropSettings = {
            connection: _connection,
            logger: _logger.subLogger("interop"),
        };

        _interop = new Interop(agmConfig);
        Logger.Interop = _interop;
        registerLib(["interop", "agm"], _interop, initTimer);
        return Promise.resolve();
    }

    function setupContexts() {
        const hasActivities = ((internalConfig as any).activities && _connection.protocolVersion === 3);
        const needsContexts = internalConfig.contexts || hasActivities;
        if (needsContexts) {
            const initTimer = timer("contexts");

            _contexts = new ContextsModule({
                connection: _connection,
                logger: _logger.subLogger("contexts")
            });
            registerLib("contexts", _contexts, initTimer);
            return _contexts;

            // NB: The shared contexts data is part of the global domain,
            // which is joined implicitly and there is no 'Success' message
            // to indicate that the initial state has arrived.
            // We're relying on the fact that none of the other Glue libs
            // rely on the shared contexts' state, and that the 'contexts'
            // lib is created first so any other domain's success message
            // will arrive after our state, so the contexts will be visible
            // when the Glue promise resolves.
        } else {
            const replayer = _connection.replayer;
            if (replayer) {
                replayer.drain(ContextMessageReplaySpec.name);
            }
        }
    }

    async function setupBus(): Promise<void> {
        if (!internalConfig.bus) {
            return Promise.resolve();
        }

        const initTimer = timer("bus");
        _bus = new MessageBus(_connection, _logger.subLogger("bus"));
        registerLib("bus", _bus, initTimer);
        return Promise.resolve();
    }

    function setupExternalLibs(externalLibs: Glue42Core.ExternalLib[]): Promise<any> {
        try {
            externalLibs.forEach((lib) => {
                setupExternalLib(lib.name, lib.create);
            });

            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    }

    function setupExternalLib(name: string, createCallback: (core: any) => any) {
        const initTimer = timer(name);
        const lib = createCallback(libs);
        if (lib) {
            registerLib(name, lib, initTimer);
        }
    }

    function waitForLibs(): Promise<object[]> {
        // get all libs that have ready promises and wait for these to be ready
        const libsReadyPromises = Object.keys(libs).map((key) => {
            const lib = libs[key];
            return lib.ready ?
                lib.ready() : Promise.resolve();
        });

        return Promise.all(libsReadyPromises);
    }

    function constructGlueObject(): Glue42Core.GlueCore {

        const feedbackFunc = (feedbackInfo?: Glue42Core.FeedbackInfo) => {
            if (!_interop) {
                return;
            }
            _interop.invoke("T42.ACS.Feedback", feedbackInfo, "best");
        };

        const info: { [key: string]: any } = {
            coreVersion: version,
            version: internalConfig.version
        };

        glueInitTimer.stop();

        const glue: Glue42Core.GlueCore & ({ [key: string]: any }) = {
            feedback: feedbackFunc,
            info,
            logger: _logger,
            interop: _interop,
            agm: _interop,
            connection: _connection,
            metrics: _metrics,
            contexts: _contexts,
            bus: _bus,
            version: internalConfig.version,
            userConfig,
            done: () => {
                _logger?.info(`done called by user...`);
                return _connection.logout();
            }
        };

        // ver performance
        glue.performance = {
            get glueVer() {
                return internalConfig.version;
            },
            get glueConfig() {
                return JSON.stringify(userConfig);
            },
            get browser() {
                return window.performance.timing.toJSON();
            },
            get memory() {
                return (window as any).performance.memory;
            },
            get initTimes() {
                const all = getAllTimers();
                return Object.keys(all).map((key) => {
                    const t = all[key];
                    return {
                        name: key,
                        duration: t.endTime - t.startTime,
                        marks: t.marks,
                        startTime: t.startTime,
                        endTime: t.endTime
                    };
                });
            }
        };

        // attach each lib to glue
        Object.keys(libs).forEach((key) => {
            const lib = libs[key];
            glue[key] = lib;
        });

        // construct the config object to be exposed to end user
        // transfer config keys from internalConfig and then ext
        glue.config = {};

        Object.keys(internalConfig).forEach((k) => {
            glue.config[k] = (internalConfig as any)[k];
        });

        if (ext && ext.extOptions) {
            Object.keys(ext.extOptions).forEach((k) => {
                glue.config[k] = ext?.extOptions[k];
            });
        }

        if (ext?.enrichGlue) {
            ext.enrichGlue(glue);
        }

        if (glue42gd && glue42gd.updatePerfData) {
            glue42gd.updatePerfData(glue.performance);
        }

        if (glue.agm) {
            const deprecatedDecorator = (fn: any, wrong: string, proper: string) => {
                // tslint:disable-next-line:only-arrow-functions
                return function() {
                    // tslint:disable-next-line:no-console
                    glue.logger.warn(`glue.js - 'glue.agm.${wrong}' method is deprecated, use 'glue.interop.${proper}' instead.`);
                    return fn.apply(glue.agm, arguments);
                };
            };
            // extend glue.agm with legacy support
            const agmAny: any = glue.agm;
            agmAny.method_added = deprecatedDecorator(glue.agm.methodAdded, "method_added", "methodAdded");
            agmAny.method_removed = deprecatedDecorator(glue.agm.methodRemoved, "method_removed", "methodRemoved");
            agmAny.server_added = deprecatedDecorator(glue.agm.serverAdded, "server_added", "serverAdded");
            agmAny.server_method_aded = deprecatedDecorator(glue.agm.serverMethodAdded, "server_method_aded", "serverMethodAdded");
            agmAny.server_method_removed = deprecatedDecorator(glue.agm.serverMethodRemoved, "server_method_removed", "serverMethodRemoved");
        }
        return glue;
    }

    return preloadPromise
        .then(setupLogger)
        .then(setupConnection)
        .then(() => Promise.all([setupMetrics(), setupInterop(), setupContexts(), setupBus()]))
        .then(() => _interop.readyPromise)
        .then(() => {
            return setupExternalLibs(internalConfig.libs || []);
        })
        .then(waitForLibs)
        .then(constructGlueObject)
        .catch((err) => {
            // if there is some some error include the libs object for debugging purposes
            return Promise.reject({
                err,
                libs
            });
        });
};

if (typeof window !== "undefined") {
    (window as any).GlueCore = GlueCore;
}
(GlueCore as any).version = version;
// add default library for ES6 modules
(GlueCore as any).default = GlueCore;

export default GlueCore;
