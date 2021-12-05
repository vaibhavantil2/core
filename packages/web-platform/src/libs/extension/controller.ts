/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BridgeOperation, LibController } from "../../common/types";
import { Glue42Core } from "@glue42/core";
import { ClientHello, ClientHelloResponse, ExtensionOperationTypes } from "./types";
import logger from "../../shared/logger";
import { clientHelloDecoder, clientHelloResponseDecoder, extensionOperationTypesDecoder } from "./decoders";
import { SessionStorageController } from "../../controllers/session";

export class ExtensionController implements LibController {

    private started = false;

    private operations: { [key in ExtensionOperationTypes]: BridgeOperation } = {
        clientHello: { name: "appHello", resultDecoder: clientHelloResponseDecoder, dataDecoder: clientHelloDecoder, execute: this.handleClientHello.bind(this) }
    }

    constructor(
        private readonly session: SessionStorageController
    ) { }

    private get logger(): Glue42Core.Logger.API | undefined {
        return logger.get("extension.controller");
    }

    public async start(): Promise<void> {

        this.started = true;

        this.logger?.trace("initialization is completed");

    }

    public async handleControl(args: any): Promise<any> {
        if (!this.started) {
            new Error("Cannot handle this extension control message, because the controller has not been started");
        }

        const applicationData = args.data;

        const commandId = args.commandId;

        const operationValidation = extensionOperationTypesDecoder.run(args.operation);

        if (!operationValidation.ok) {
            throw new Error(`This extension request cannot be completed, because the operation name did not pass validation: ${JSON.stringify(operationValidation.error)}`);
        }

        const operationName: ExtensionOperationTypes = operationValidation.result;

        const incomingValidation = this.operations[operationName].dataDecoder?.run(applicationData);

        if (incomingValidation && !incomingValidation.ok) {
            throw new Error(`Extension request for ${operationName} rejected, because the provided arguments did not pass the validation: ${JSON.stringify(incomingValidation.error)}`);
        }

        this.logger?.debug(`[${commandId}] ${operationName} command is valid with data: ${JSON.stringify(applicationData)}`);

        const result = await this.operations[operationName].execute(applicationData, commandId);

        const resultValidation = this.operations[operationName].resultDecoder?.run(result);

        if (resultValidation && !resultValidation.ok) {
            throw new Error(`Extension request for ${operationName} could not be completed, because the operation result did not pass the validation: ${JSON.stringify(resultValidation.error)}`);
        }

        this.logger?.trace(`[${commandId}] ${operationName} command was executed successfully`);

        return result;
    }

    public async handleClientHello(config: ClientHello, commandId: string): Promise<ClientHelloResponse> {
        this.logger?.trace(`[${commandId}] handling client hello command`);

        const widgetConfig = (await this.getWidgetConfig()).widget;

        const isWorkspaceFrame = !!this.session.getFrameData(config.windowId);

        const shouldInjectWidget = isWorkspaceFrame ? false :
            widgetConfig ? widgetConfig.enable : false;

        const response = {
            widget: {
                inject: shouldInjectWidget
            }
        };

        this.logger?.trace(`[${commandId}] responding to client hello command with: ${JSON.stringify(response)}`);

        return response;
    }

    private getWidgetConfig(): Promise<{ widget: { enable: boolean } }> {
        const currentProtocol = (new URL(window.location.href)).protocol;

        if (!currentProtocol.includes("extension")) {
            return Promise.resolve({ widget: { enable: false } });
        }

        return new Promise((resolve) => {
            chrome.storage.local.get("widget", (entry: any) => {
                resolve(entry);
            });
        });
    }
}