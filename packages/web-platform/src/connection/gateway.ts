/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/triple-slash-reference */
/* eslint-disable @typescript-eslint/camelcase */
/// <reference path="../common/gateway.d.ts"/>

import { Glue42WebPlatform } from "../../platform";
import "@glue42/gateway-web/web/gateway-web.js";
import { GatewayWebAPI, configure_logging, create } from "@glue42/gateway-web/web/gateway-web.js";
import { Glue42CoreMessageTypes } from "../common/constants";

export class Gateway {
    private _gatewayWebInstance!: GatewayWebAPI;
    private readonly configureLogging: configure_logging;
    private readonly create: create;

    constructor() {
        this.configureLogging = (window as any).gateway_web.core.configure_logging;
        this.create = (window as any).gateway_web.core.create;
    }

    public async start(config?: Glue42WebPlatform.Gateway.Config): Promise<void> {
        if (config?.logging) {
            this.configureLogging({
                level: config.logging.level,
                appender: config.logging.appender
            });
        }

        this._gatewayWebInstance = this.create({ clients: { inactive_seconds: 0 } });

        await this._gatewayWebInstance.start();
    }

    public async connectClient(clientPort: MessagePort, removeFromPlatform?: (clientId: string) => void): Promise<void> {

        const client = await this._gatewayWebInstance.connect((_: object, message: string) => clientPort.postMessage(message));

        clientPort.onmessage = (event): void => {
            const data = event.data?.glue42core;

            if ((clientPort as any).closed) {
                return;
            }

            if (data && data.type === Glue42CoreMessageTypes.clientUnload.name) {

                (clientPort as any).closed = true;

                if (removeFromPlatform) {
                    removeFromPlatform(data.data.clientId);
                }
                client.disconnect();
                return;
            }

            client.send(event.data);
        };
    }

    public async connectExtClient(port: chrome.runtime.Port, removeFromPlatform?: (clientId: string, announce?: boolean) => void): Promise<void> {

        const client = await this._gatewayWebInstance.connect((_: object, message: string) => port.postMessage({ glue42ExtInc: message }));

        port.onMessage.addListener((message) => {

            const coreData = message?.glue42ExtOut?.glue42core;

            if (coreData && coreData.type === Glue42CoreMessageTypes.clientUnload.name) {

                client.disconnect();

                port.disconnect();

                if (removeFromPlatform) {
                    removeFromPlatform(coreData.data.clientId, true);
                }

                return;
            }

            if (message.glue42ExtOut && !coreData) {
                const msg = message.glue42ExtOut;

                client.send(msg);

                return;
            }

        });
    }
}