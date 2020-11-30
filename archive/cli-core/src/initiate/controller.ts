import { access, constants, writeFile } from "fs";
import { join } from "path";
import { Npm } from "./npm";
import { gCoreDeps, glueConfigDefaults, glueDevConfigDefaults, layoutsDefaults } from "../defaults";
import { CliConfig } from "../config/cli.config";
import { Logger } from "log4js";
import { WorkspacesController } from "../workspaces/controller";

export class InitiationController {

    private logger: Logger;

    constructor(
        private readonly npm: Npm,
        private readonly workspacesController: WorkspacesController
    ) { }

    public async start(config: CliConfig, logger: Logger): Promise<void> {

        this.logger = logger;

        const configExists = await this.checkConfigExists(config.rootDirectory);

        if (configExists) {
            this.logger.warn("Glue42 Core is already initialized in this directory. Skipping...");
            return;
        }

        const pJsonExists = await this.checkPJsonExists(config.rootDirectory);

        if (!pJsonExists) {
            this.logger.info(`Package JSON does not exist in root directory: ${config.rootDirectory}, initiating npm --yes`);
            await this.npm.init();
            this.logger.info("Npm initiated.");
        }

        this.logger.info(`Installing Glue42 Core deps: ${gCoreDeps.join(" ")}`);

        await this.npm.installDeps(gCoreDeps);

        await Promise.all([
            this.createFile(join(config.rootDirectory, glueDevConfigDefaults.name), JSON.stringify(glueDevConfigDefaults.data, null, 4)),
            this.createFile(join(config.rootDirectory, glueConfigDefaults.name), JSON.stringify(glueConfigDefaults.data, null, 4)),
            this.createFile(join(config.rootDirectory, layoutsDefaults.name), JSON.stringify(layoutsDefaults.data, null, 4)),
        ]);

        if (config.workspaces) {
            await this.workspacesController.start(config, logger);
        }

        this.logger.info("Glue42 Core development environment completed");
    }

    private checkPJsonExists(rootDirectory: string): Promise<boolean> {
        const location = join(rootDirectory, "package.json");
        return this.accessPromise(location);
    }

    private checkConfigExists(rootDirectory: string): Promise<boolean> {
        const configLocation = join(rootDirectory, glueDevConfigDefaults.name);
        return this.accessPromise(configLocation);
    }

    private accessPromise(location: string): Promise<boolean> {
        return new Promise((resolve) => {
            access(location, constants.F_OK, (err) => {
                if (err) {
                    return resolve(false);
                }
                resolve(true);
            });
        });
    }

    private createFile(location: string, contents: string): Promise<void> {
        this.logger.info(`Creating: ${location} with defaults`);
        return new Promise((resolve, reject) => {
            writeFile(location, contents, (err) => {

                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    }
}
