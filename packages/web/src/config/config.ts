import { Glue42Web } from "../../web";
import { defaultConfig, defaultWorkerName, defaultAssetsBaseLocation, defaultConfigName } from "./defaults";
import { Glue42CoreConfig } from "../glue.config";
import { fetchTimeout } from "../utils";

const getRemoteConfig = async (userConfig: Glue42Web.Config): Promise<Glue42CoreConfig> => {

    if (userConfig.assets?.extendConfig === false || userConfig.extends === false) {
        // the user has disabled extending the config
        return {};
    }

    const remoteConfigLocation: string = userConfig.assets?.location ? `${userConfig.assets.location}/${defaultConfigName}` :
        typeof userConfig.extends === "string" ? userConfig.extends :
            `${defaultAssetsBaseLocation}/${defaultConfigName}`;

    let response: Response;
    try {
        response = await fetchTimeout(remoteConfigLocation);
        if (!response.ok) {
            return {};
        }

        const json = await response.json();
        return json ?? {};
    } catch {
        return {};
    }
};

export const buildConfig = async (userConfig?: Glue42Web.Config): Promise<Glue42CoreConfig> => {
    userConfig = userConfig ?? {};
    const remoteConfig = await getRemoteConfig(userConfig);

    // merge user->remote->default
    const resultWebConfig: Glue42Web.Config = {
        ...defaultConfig,
        ...remoteConfig.glue,
        ...userConfig
    };

    resultWebConfig.worker = `${resultWebConfig.assets.location}/${defaultWorkerName}`;

    // if we have extends options, we need to set the worker location to be the same
    // because worker is always on the same level as custom config
    if (typeof resultWebConfig?.extends === "string") {
        const lastIndex = resultWebConfig.extends.lastIndexOf("/");
        const worker = resultWebConfig.extends.substr(0, lastIndex + 1) + defaultWorkerName;
        resultWebConfig.worker = worker;
    }

    if (!remoteConfig.layouts) {
        remoteConfig.layouts = { remoteType: "json" };
    }

    return {
        ...remoteConfig,
        glue: resultWebConfig
    };
};
