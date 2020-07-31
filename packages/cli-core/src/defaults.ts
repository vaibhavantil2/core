/* eslint-disable @typescript-eslint/no-explicit-any */
import { Configuration } from "log4js";
import { FullDevConfig } from "./config/cli.config.d";

export const loggerConfig: Configuration = {
    appenders: {
        out: { type: "console" },
        app: {
            type: "file",
            filename: "glue.core.cli.log"
        }
    },
    categories: {
        "default": { appenders: ["out"], level: "info" },
        "dev": { appenders: ["out"], level: "trace" },
        "full": { appenders: ["out", "app"], level: "trace" }
    }
};

export const gCoreDeps = ["@glue42/gateway-web", "@glue42/worker-web"];

export const workspacesDeps = ["@glue42/workspaces-app"];

export const workspacesDefaults = {
    appLocation: "./node_modules/@glue42/workspaces-app",
    manifestLocation: "./workspaces.webmanifest"
};

export const layoutsDefaults: { name: string; data: { workspaces: any[] } } = {
    name: "glue.layouts.json",
    data: {
        workspaces: []
    }
};

export const glueDevConfigDefaults: { name: string; location: string; data: FullDevConfig } = {
    location: "./",
    name: "glue.config.dev.json",
    data: {
        glueAssets: {
            gateway: {
                location: "./node_modules/@glue42/gateway-web/web/gateway-web.js"
            },
            worker: "./node_modules/@glue42/worker-web/dist/worker.js",
            config: "./glue.config.json",
            layouts: "./glue.layouts.json",
            route: "/glue"
        },
        server: {
            settings: {
                port: 4242,
                disableCache: true
            },
            apps: [],
            sharedAssets: []
        },
        logging: "default"
    }
};

export const glueConfigDefaults = {
    name: "glue.config.json",
    data: {
        glue: {
            layouts: {
                autoRestore: false,
                autoSaveWindowContext: false
            },
            channels: false,
            appManager: false,
            assets: {
                location: "/glue"
            }
        },
        gateway: {},
        appManager: {},
        channels: [] as any[]
    }
};
