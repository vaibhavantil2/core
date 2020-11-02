import { Glue42Core } from "../../../glue";
import { default as CallbackRegistryFactory, CallbackRegistry } from "callback-registry";
import { Transport } from "../types";
import Utils from "../../utils/utils";
import { PromiseWrapper } from "../../utils/pw";

const WebSocketConstructor = Utils.isNode() ? require("ws") : window.WebSocket;

export default class WS implements Transport {
    private logger: Glue42Core.Logger.API;
    private settings: Glue42Core.Connection.Settings;
    private ws: WebSocket;

    /**
     * If the flag is true the connection should keep trying to connect.
     * If false the user explicitly closed it and it should not reconnect
     */
    private _running = true;

    private _registry: CallbackRegistry = CallbackRegistryFactory();

    constructor(settings: Glue42Core.Connection.Settings, logger: Glue42Core.Logger.API) {
        this.settings = settings;
        this.logger = logger;
    }

    public onMessage(callback: (msg: string) => void): () => void {
        return this._registry.add("onMessage", callback);
    }

    // Create a function for sending a message
    public send(msg: string, product?: string, type?: string, options?: Glue42Core.Connection.SendMessageOptions): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            options = options || {};
            this.waitForSocketConnection(() => {
                try {
                    this.ws.send(msg);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            }, reject, options.maxRetries, options.retryInterval);
        });

    }

    public open(): Promise<void> {
        this.logger.info(`opening ws...`);
        this._running = true;
        return new Promise<void>((resolve, reject) => {
            this.waitForSocketConnection(
                resolve,
                reject
            );
        });
    }

    public close() {
        this._running = false;
        if (this.ws) {
            this.ws.close();
        }
    }

    public reconnect() {
        this.ws.close();
        const pw = new PromiseWrapper<void>();
        this.waitForSocketConnection(() => {
            pw.resolve();
        });
        return pw.promise;
    }

    public onConnectedChanged(callback: (connected: boolean) => void): () => void {
        return this._registry.add("onConnectedChanged", callback);
    }

    private initiateSocket() {
        this.logger.debug(`initiating ws to ${this.settings.ws}...`);
        const pw = new PromiseWrapper();
        this.ws = new WebSocketConstructor(this.settings.ws);
        this.ws.onerror = (err: any) => {
            let reason: string = "";
            try {
                reason = JSON.stringify(err);
            } catch (error) {
                const seen = new WeakSet();
                const replacer = (key: string, value: any) => {
                    if (typeof value === "object" && value !== null) {
                        if (seen.has(value)) {
                            return;
                        }
                        seen.add(value);
                    }
                    return value;
                };

                reason = JSON.stringify(err, replacer);
            }

            this.notifyStatusChanged(false, reason);
        };
        this.ws.onclose = () => {
            this.logger.info("ws closed");
            this.notifyStatusChanged(false);
        };
        // Log on connection
        this.ws.onopen = () => {
            this.logger.debug("ws opened");
            this.notifyStatusChanged(true);
            pw.resolve();
        };
        // Attach handler
        this.ws.onmessage = (message: { data: object }) => {
            this._registry.execute("onMessage", message.data);
        };
        return pw.promise;
    }

    // Holds callback execution until socket connection is established.
    private waitForSocketConnection(callback?: () => void, failed?: (err?: string) => void, retriesLeft?: number, retryInterval?: number) {
        if (!callback) {
            callback = () => { /** Do nothing */ };
        }
        if (!failed) {
            failed = () => { /** DO nothing */ };
        }

        if (retryInterval === undefined) {
            retryInterval = this.settings.reconnectInterval;
        }

        if (retriesLeft !== undefined) {
            if (retriesLeft === 0) {
                failed(`wait for socket on ${this.settings.ws} failed - no more retries left`);
                return;
            }
            this.logger.debug(`will retry ${retriesLeft} more times (every ${retryInterval} ms)`);
        }

        // check if we're still running
        if (!this._running) {
            failed(`wait for socket on ${this.settings.ws} failed - socket closed by user`);
            return;
        }

        // reduce the initial wait by racing between initiateSocket promise and retryInterval - the one that comes first will set initiated
        // to true and cancel the other
        let initiated = false;
        // > 1 means closing or closed
        if (!this.ws || this.ws.readyState > 1) {
            this.initiateSocket()
                .then(() => {
                    if (initiated) {
                        return;
                    }
                    initiated = true;
                    callback();
                });
        } else if (this.ws.readyState === 1) {
            return callback();
        }

        setTimeout(() => {
            if (initiated) {
                return;
            }
            initiated = true;
            const retries = retriesLeft === undefined ? undefined : retriesLeft - 1;
            this.waitForSocketConnection(callback, failed, retries, retryInterval);
        }, retryInterval); // wait X milliseconds for the connection...
    }

    private notifyStatusChanged(status: boolean, reason?: string) {
        this._registry.execute("onConnectedChanged", status, reason);
    }
}
