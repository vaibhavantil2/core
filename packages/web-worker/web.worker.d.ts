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

declare const WebWorkerFactory: Glue42WebWorkerFactoryFunction;

export default WebWorkerFactory;