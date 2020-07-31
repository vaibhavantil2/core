import { Npm } from "../initiate/npm";
import { join } from "path";
import { readFile, writeFile, constants, access, copyFile } from "fs";
import { workspacesDeps, workspacesDefaults, glueDevConfigDefaults } from "../defaults";
import { CliConfig } from "../config/cli.config";
import { Logger } from "log4js";
import open from "open";
import { GlueDevConfig } from "../config/user.config";
import { glueDevConfigDecoder } from "../config/config-decoders";

export class WorkspacesController {
    constructor(
        private readonly npm: Npm
    ) { }

    public async processWorkspacesCommand(config: CliConfig, logger: Logger, argv: string[]): Promise<void> {
        const workspacesCommand = argv[3];

        if (workspacesCommand === "init") {
            await this.start(config, logger);
            return;
        }

        if (workspacesCommand === "build") {
            await this.intercept(config, logger);
            await this.startBuilder(config, logger);
            return;
        }

        throw new Error(`Unrecognized workspaces command: ${workspacesCommand}`);
    }

    public async intercept(config: CliConfig, logger: Logger): Promise<void> {
        if (!config.workspaces) {
            return;
        }

        const workspacesConfig = config.glueAssets.workspaces;
        logger.info("Workspaces css interception activated.");

        const injectionPromises: Array<Promise<void>> = [];

        if (workspacesConfig.frameCss) {
            injectionPromises.push(this.injectFrameCss(config.rootDirectory, workspacesConfig.frameCss, workspacesConfig.appLocation, logger));
        }

        if (workspacesConfig.popupsCss) {
            injectionPromises.push(this.injectPopupsCss(config.rootDirectory, workspacesConfig.popupsCss, workspacesConfig.appLocation, logger));
        }

        await Promise.all(injectionPromises);
        logger.info("Workspaces interception completed.");
    }

    public async startBuilder(config: CliConfig, logger: Logger): Promise<void> {
        const port = config.server.settings.port;
        const baseRoute = config.glueAssets.route;
        const buildUrl = `http://localhost:${port}${baseRoute}/workspaces/?build=true`;

        logger.info(`Starting the workspaces builder at: ${buildUrl}`);

        await open(buildUrl);
    }

    public async start(config: CliConfig, logger: Logger): Promise<void> {
        const configExists = await this.checkConfigExists(config);

        if (!configExists) {
            throw new Error("Glue42 Core must be initiated before workspaces can be added. Please run gluec init and then try again");
        }

        logger.info(`Installing Glue42 Core Workspaces deps: ${workspacesDeps.join(" ")}`);
        await this.npm.installDeps(workspacesDeps);

        await this.copyManifest(config);
        logger.info(`Workspaces manifest ready at: ${join(config.rootDirectory, "workspaces.webmanifest")}`);

        await this.decorateDevConfig(config);
        logger.info("The Glue42 Core dev config was decorated, workspaces is initialized.");
    }

    private async decorateDevConfig(config: CliConfig): Promise<void> {
        const defaults = workspacesDefaults;
        const configLocation = join(config.rootDirectory, glueDevConfigDefaults.name);

        const devConfig = await this.readConfig(configLocation);
        devConfig.glueAssets.workspaces = defaults;

        await this.write(configLocation, devConfig);
    }

    private async readConfig(location: string): Promise<GlueDevConfig> {
        const fileContents = await this.readPromise(location);

        return glueDevConfigDecoder.runWithException(JSON.parse(fileContents));
    }

    private write(location: string, data: GlueDevConfig): Promise<void> {
        return this.writePromise(location, JSON.stringify(data));
    }

    private checkConfigExists(config: CliConfig): Promise<boolean> {
        return new Promise<boolean>((resolve) => {

            const configLocation = join(config.rootDirectory, glueDevConfigDefaults.name);

            access(configLocation, constants.F_OK, (err) => {
                if (err) {
                    return resolve(false);
                }
                resolve(true);
            });
        });
    }

    private async injectFrameCss(rootDirectory: string, cssSrc: string, workspacesRoot: string, logger: Logger): Promise<void> {
        const source = join(rootDirectory, cssSrc);
        logger.info(`Injecting user css from ${source} to the frame`);

        const destination = join(workspacesRoot, "assets", "css", "user.css");

        logger.trace(`Copying css ${source} -> ${destination}`);
        await this.copyPromise(source, destination);

        const workspacesIndexHtml = join(workspacesRoot, "index.html");

        logger.trace(`Reading workspaces index from: ${workspacesIndexHtml}`);
        const html = await this.readPromise(workspacesIndexHtml);

        const injectedHtml = html
            .replace("// InjectA", "const userCss = createLinkElement(`${path}assets/css/user.css`);")
            .replace("// InjectB", "document.head.appendChild(userCss);");

        logger.trace(`Workspace index modified, writing to ${workspacesIndexHtml}`);
        await this.writePromise(workspacesIndexHtml, injectedHtml);

        logger.info("Frame css injected");
    }

    private async injectPopupsCss(rootDirectory: string, cssSrc: string, workspacesRoot: string, logger: Logger): Promise<void> {
        const source = join(rootDirectory, cssSrc);
        logger.info(`Injecting user css from ${source} to the popups`);

        const destination = join(workspacesRoot, "popups", "styles", "user.css");

        logger.trace(`Copying css ${source} -> ${destination}`);
        await this.copyPromise(source, destination);

        const popupsIndexHtml = join(workspacesRoot, "popups", "index.html");

        logger.trace(`Reading popups index from: ${popupsIndexHtml}`);
        const html = await this.readPromise(popupsIndexHtml);

        const relType = "stylesheet";
        const injectedHtml = html
            .replace("<!-- Inject -->", `<link rel="${relType}" type="text/css" href="styles/user.css" />`);

        logger.trace(`Popups index modified, writing to ${popupsIndexHtml}`);
        await this.writePromise(popupsIndexHtml, injectedHtml);

        logger.info("Popups css injected");
    }

    private async copyManifest(config: CliConfig): Promise<void> {
        const source = join(config.rootDirectory, "node_modules", "@glue42", "workspaces-app", "manifest.webmanifest");
        const destination = join(config.rootDirectory, "workspaces.webmanifest");

        return this.copyPromise(source, destination);
    }

    private copyPromise(source: string, destination: string): Promise<void> {
        return new Promise((resolve, reject) => {
            copyFile(source, destination, (err) => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    }

    private readPromise(location: string): Promise<string> {
        return new Promise((resolve, reject) => {
            readFile(location, "utf8", (err, data) => {
                if (err) {
                    return reject(err);
                }

                resolve(data);
            });
        });
    }

    private async writePromise(location: string, data: string): Promise<void> {
        return new Promise((resolve, reject) => {
            writeFile(location, data, (err) => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    }
}
