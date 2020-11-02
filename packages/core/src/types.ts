import { Glue42Core } from "../glue";

export interface Timer {
    startTime: number;
    endTime: number;
    period: number;
    stop: () => number;
}

export interface InternalConfig {
    identity: Glue42Core.Metrics.Identity;
    connection: Glue42Core.Connection.Settings;
    application: string | undefined;
    logger: Glue42Core.LoggerConfig;
    customLogger: Glue42Core.CustomLogger;
    auth: Glue42Core.Auth | string | number;
    metrics: {
        identity: Glue42Core.Metrics.Identity;
        disableAutoAppSystem: boolean;
    };
    version: string;
    agm: {
        instance: {
            application?: string;
            machine?: string;
            user?: string;
        }
    };
    libs: any[];
    bus: boolean;

    [key: string]: any;
}
