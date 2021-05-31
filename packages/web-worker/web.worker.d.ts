/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Glue42NotificationClickHandler {
    handler: (event: Event, isPlatformOpened: boolean) => Promise<void>;
    action: string;
}

export interface WebWorkerConfig {
    platform?: {
        url: string;
        openIfMissing?: boolean;
    };
    notifications?: {
        defaultClick?: (event: Event, isPlatformOpened: boolean) => Promise<void>;
        actionClicks?: Glue42NotificationClickHandler[];
    };
}

export type Glue42WebWorkerFactoryFunction = (config?: WebWorkerConfig) => void;
export type openCorePlatform = (url: string) => Promise<void>;
export type raiseGlueNotification = (settings: any) => Promise<void>;

declare const WebWorkerFactory: Glue42WebWorkerFactoryFunction;

export default WebWorkerFactory;