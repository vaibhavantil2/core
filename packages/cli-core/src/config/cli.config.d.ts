import { ServerApp, ServerSettings, SharedAsset } from "./user.config";

export type CliCommand = "serve" | "build" | "init" | "version" | "workspaces";

export interface CliConfig extends FullDevConfig {
    rootDirectory: string;
    command: CliCommand;
    workspaces: boolean;
}

export interface FullDevConfig {
    glueAssets: CliGlueAssets;
    server: {
        settings: CliServerSettings;
        apps: CliServerApp[];
        sharedAssets: SharedAsset[];
    };
    logging?: "full" | "dev" | "default";
}

export interface CliServerApp extends ServerApp {
    cookieID: string;
}

export interface CliGlueAssets {
    worker: string;
    gateway: {
        location: string;
        gwLogAppender?: string;
    };
    workspaces?: {
        appLocation: string;
        manifestLocation: string;
        frameCss?: string;
        popupsCss?: string;
    };
    config: string;
    layouts: string;
    route: string;
}

export interface CliServerSettings extends ServerSettings {
    port: number;
}
