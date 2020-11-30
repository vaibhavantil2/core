import { mkdir, copyFile, existsSync, readdir, lstatSync } from "fs";
import { join } from "path";
import { CliConfig } from "../config/cli.config";
import rimraf from "rimraf";
import { Logger } from "log4js";

export class BuildController {

    private logger: Logger;

    public async build(config: CliConfig, logger: Logger): Promise<void> {
        this.logger = logger;

        const targetDir = join(config.rootDirectory, "glue");

        await this.deleteExistingGlueDir(targetDir);

        await this.createGlueDir(targetDir);
        this.logger.info(`Target directory created at: ${targetDir}`);

        const copyDefinitions = [
            { from: config.glueAssets.gateway.location, to: join(targetDir, "gateway.js") },
            { from: config.glueAssets.worker, to: join(targetDir, "worker.js") },
            { from: config.glueAssets.config, to: join(targetDir, "glue.config.json") },
            { from: config.glueAssets.layouts, to: join(targetDir, "glue.layouts.json") }
        ];

        if (config.glueAssets.gateway.gwLogAppender) {
            copyDefinitions.push({
                from: config.glueAssets.gateway.gwLogAppender,
                to: join(targetDir, "gwLogAppender.js")
            });
        }

        await Promise.all(copyDefinitions.map((definition) => this.copyFile(definition.from, definition.to)));

        if (config.workspaces) {
            await this.copyDirectory(config.glueAssets.workspaces.appLocation, join(targetDir, "workspaces"));
            await this.copyFile(config.glueAssets.workspaces.manifestLocation, join(targetDir, "workspaces", "workspaces.webmanifest"));
        }

        this.logger.info(`Glue42 Core build is completed at: ${targetDir}`);
    }

    private copyFile(from: string, to: string): Promise<void> {
        this.logger.info(`Copying ${from} to ${to}`);
        return new Promise((resolve, reject) => {
            copyFile(from, to, (err) => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    }

    private createGlueDir(glueDir: string): Promise<void> {
        return new Promise((resolve, reject) => {
            mkdir(glueDir, (err) => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    }

    private deleteExistingGlueDir(glob: string): Promise<void> {
        return new Promise((resolve, reject) => {
            rimraf(glob, (err) => {
                if (err) {
                    return reject(err);
                }

                resolve();
            });
        });
    }

    private makeDir(location: string): Promise<void> {
        return new Promise((resolve, reject) => {
            mkdir(location, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }

    private async copyDirectory(entryPoint: string, outputLocation: string): Promise<void> {
        if (!existsSync(outputLocation)) {
            await this.makeDir(outputLocation);
        }
        const traverseDirs = async (currLocation: string, outputLocationFull: string): Promise<void> => {

            await readdir(currLocation, async (err, data) => {
                if (err) {
                    throw new Error(err.message);
                }
                await data.forEach(async (dir) => {

                    if (dir.includes(".webmanifest")) {
                        return;
                    }

                    const currLocationFull = join(currLocation, dir);
                    const currLocationDist = join(outputLocationFull, dir);
                    if (lstatSync(currLocationFull).isDirectory()) {
                        if (!existsSync(currLocationDist)) {
                            await this.makeDir(currLocationDist);
                        }
                        await traverseDirs(currLocationFull, currLocationDist);
                    } else {
                        await this.copyFile(currLocationFull, currLocationDist);
                    }
                });
            });

        };

        await traverseDirs(entryPoint, outputLocation);
    }

}
