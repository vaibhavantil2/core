import { Glue42Web } from "../../web";

export const defaultAssetsBaseLocation = "/glue";
export const defaultWorkerName = "worker.js";
export const defaultConfigName = "glue.config.json";
export const defaultLayoutsName = "glue.layouts.json";

export const defaultWorkerLocation = `${defaultAssetsBaseLocation}/${defaultWorkerName}`;

export const defaultConfig: Glue42Web.Config = {
    layouts: {
        autoRestore: false,
        autoSaveWindowContext: false
    },
    logger: "error",
    assets: {
        location: defaultAssetsBaseLocation
    },
    channels: false,
    appManager: false,
    libraries: []
};
