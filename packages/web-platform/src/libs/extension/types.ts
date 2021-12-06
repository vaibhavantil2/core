export type ExtensionOperationTypes = "clientHello";

export interface ClientHello {
    windowId: string;
}

export interface ClientHelloResponse {
    widget: {
        inject: boolean;
    };
}
