import { Logger } from "log4js";
import { CliConfig, CliCommand } from "./config/cli.config";
import { coreDevServer } from "./server";
import { buildController } from "./builder";
import { initController } from "./initiate";
import { serverDecoderDecorator } from "./config/config-decoders";
import { Decoder } from "@mojotech/json-type-validation";
import { versionController } from "./version";
import { workspacesController } from "./workspaces";

export interface CommandDefinition {
    name: CliCommand;
    action: (config: CliConfig, logger: Logger, argv?: string[]) => Promise<void>;
    requiredConfig: boolean;
    decoderDecorator?: Decoder<unknown>;
}

export const commands: CommandDefinition[] = [
    {
        name: "workspaces",
        action: async (config: CliConfig, logger: Logger, argv: string[]): Promise<void> => {
            await workspacesController.processWorkspacesCommand(config, logger, argv);
        },
        requiredConfig: true
    },
    {
        name: "serve",
        action: async (config: CliConfig, logger: Logger): Promise<void> => {
            await workspacesController.intercept(config, logger);
            await coreDevServer.setup(config, logger);
            await coreDevServer.start();
        },
        requiredConfig: true,
        decoderDecorator: serverDecoderDecorator
    },
    {
        name: "build",
        action: async (config: CliConfig, logger: Logger): Promise<void> => {
            await workspacesController.intercept(config, logger);     
            await buildController.build(config, logger);
        },
        requiredConfig: true
    },
    {
        name: "init",
        action: async (config: CliConfig, logger: Logger): Promise<void> => {
            await initController.start(config, logger);
        },
        requiredConfig: false
    },
    {
        name: "version",
        action: async (): Promise<void> => {
            const version = await versionController.getCurrentVersion();
            process.stdout.write(version + "\n");
        },
        requiredConfig: false
    }
];
