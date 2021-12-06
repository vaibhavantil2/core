import { Glue42Web } from "../../web";
import { BridgeOperation } from "../shared/types";
import { extensionConfigDecoder } from "./decoders";

export type ExtensionOperationTypes = "clientHello";

export const operations: { [key in ExtensionOperationTypes]: BridgeOperation } = {
    clientHello: { name: "clientHello", resultDecoder: extensionConfigDecoder }
};

export interface ExtensionConfig {
    widget: {
        inject: boolean;
    };
}

export interface WidgetInjectionPermission { 
    command: "permissionResponse";
    allowed: boolean;
    channels?: Glue42Web.Channels.ChannelContext[]; 
    currentChannel?: Glue42Web.Channels.ChannelContext; 
}