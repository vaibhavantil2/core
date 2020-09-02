import { Glue42Web } from "../../../packages/web/web.d";
import { GtfApp } from "./аpp";

export class GtfCore {
    private readonly controlMethodName = "G42Core.E2E.Control";
    private windowNameCounter: number = 0;

    constructor(private readonly glue: Glue42Web.API) {
        console.log("GTF CREATED");
    }

    public waitFor(invocations: number, callback: () => any): () => void {
        let left = invocations;
        return () => {
            left--;

            if (left === 0) {
                callback();
            }
        };
    }

    public getWindowName(prefix = "windows"): string {
        this.windowNameCounter++;
        return `${prefix}.${Date.now()}.${this.windowNameCounter}`;
    }

    public async getGlueConfigJson(url = "/glue/glue.config.json"): Promise<any> {
        const data = await (await fetch(url)).json();

        return data;
    }

    public async getChannelNames(): Promise<string[]> {
        const channelContexts = (await this.getGlueConfigJson()).channels as any[];

        return channelContexts.map<string>((channelContext) => channelContext.name);
    }

    public async createApp(appName = "coreSupport"): Promise<GtfApp> {
        const foundApp = this.glue.appManager.application(appName);

        if (!foundApp) {
            throw new Error(`Support application: ${appName} was not found!`);
        }

        const supportInstance = await foundApp.start();

        await this.waitForControlInstance(supportInstance.agm.instance);

        return new GtfApp(this.glue, supportInstance, this.controlMethodName);

    }

    private waitForControlInstance(instanceId: string): Promise<void> {
        return new Promise((resolve) => {
            const unsubscribe = this.glue.interop.serverMethodAdded(({ server, method }) => {

                if (method.name !== this.controlMethodName) {
                    return;
                }

                if (server.instance !== instanceId) {
                    return;
                }

                if (unsubscribe) {
                    unsubscribe();
                }

                resolve();

            });
        });
    }
}
