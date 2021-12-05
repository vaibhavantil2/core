/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* tslint:disable:no-console no-empty */
import { GlueCoreFactoryFunction } from "@glue42/core";
import { Glue42 } from "@glue42/desktop";
import { Glue42Web, Glue42WebFactoryFunction } from "../web";
import { parseConfig } from "./config";
import { checkSingleton } from "./config/checkSingleton";
import { enterprise } from "./enterprise";
import { IoC } from "./shared/ioc";
import { PromiseWrap } from "./shared/promise-plus";
import { version } from "../package.json";

/** This function creates the factory function which is the default export of the library */
export const createFactoryFunction = (coreFactoryFunction: GlueCoreFactoryFunction): Glue42WebFactoryFunction => {

    return async (userConfig?: Glue42Web.Config): Promise<Glue42Web.API | Glue42.Glue> => {

        const config = parseConfig(userConfig);

        if (window.glue42gd) {
            return enterprise(config);
        }

        checkSingleton();

        const glue = await PromiseWrap<Glue42Web.API>(() => coreFactoryFunction(config, { version }) as Promise<Glue42Web.API>, 30000, "Glue Web initialization timed out, because core didn't resolve");

        const logger = glue.logger.subLogger("web.main.controller");

        const ioc = new IoC(glue);

        await ioc.bridge.start(ioc.controllers);

        ioc.defineConfig(config);

        logger.trace("the bridge has been started, initializing all controllers");

        await Promise.all(Object.values(ioc.controllers).map((controller) => controller.start(glue, ioc)));

        logger.trace("all controllers reported started, starting all additional libraries");

        await Promise.all(config.libraries.map((lib: any) => lib(glue, config)));

        logger.trace("all libraries were started");

        ioc.eventsDispatcher.start(glue);

        logger.trace("start event dispatched, glue is ready, returning it");

        return glue;
    };
};
