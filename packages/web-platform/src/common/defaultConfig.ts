import { InternalPlatformConfig } from "./types";

export const defaultPlatformConfig: InternalPlatformConfig = {
    windows: {
        windowResponseTimeoutMs: 10000,
        defaultWindowOpenBounds: {
            top: 0,
            left: 0,
            width: 800,
            height: 600
        }
    },
    applications: {
        local: []
    },
    layouts: {
        mode: "idb",
        local: []
    },
    channels: {
        definitions: []
    },
    plugins: {
        definitions: []
    },
    gateway: {
        logging: {
            level: "info"
        }
    },
    glue: {},
    environment: {}
};

export const defaultTargetString = "*";

export const defaultFetchTimeoutMs = 3000;

export const defaultOpenerTimeoutMs = 1000;