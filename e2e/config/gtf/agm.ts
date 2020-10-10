import { Glue42Web } from "../../../packages/web/web";

export class GtfAgm {
    private counter: number = 0;

    constructor(
        private readonly glue: Glue42Web.API
    ) {}

    public getMethodName(): string {
        this.counter++;
        return `agm.integration.tests.method.${Date.now()}.${this.counter}`;
    }

    public clearMethod(name: string, targetAgmInstance: Glue42Web.AppManager.Instance): Promise<void> {
        return new Promise((resolve, reject) => {
            const cancel = setTimeout(() => {
                reject("clearMethod timed out!");
            }, 5000);
            
            const un = this.glue.interop.serverMethodRemoved((data) => {
                const server = data.server || {} as Glue42Web.AppManager.Instance;
                const method = data.method || {} as Glue42Web.Interop.MethodDefinition;

                if (method.name !== name) {
                    return;
                }

                if (this.isValidServer(server, targetAgmInstance)) {
                    un();
                    clearTimeout(cancel);
                    resolve();
                }
            });

            const methodToRemove = this.glue.interop.methods().find((method) => method.name === name);
            if (methodToRemove === undefined) {
                throw new Error(`Method ${name} was not found`);
            }

            this.glue.interop.unregister(methodToRemove);
        });
    }

    public waitForMethod(glueToUse: Glue42Web.API, methodDefinition: string, targetAgmInstance?: any, timeout?: number): Promise<void> {
        if (glueToUse.agm) {
            targetAgmInstance = targetAgmInstance || glueToUse.agm.instance;
        } else {
            throw new Error("The agm of the passed glue is undefined");
        }

        return new Promise((resolve, reject) => {
            let un: any; // todo: add type to it
            const cancel = setTimeout(() => {
                if (un) {
                    un();
                }
                reject(`Timeout waiting for method: ${JSON.stringify(methodDefinition)} from glue version: ${glueToUse.version}`);
            }, timeout || 5000);
            if (glueToUse.agm) {
                un = glueToUse.agm.serverMethodAdded((data) => {

                    if (typeof methodDefinition === "object" &&
                        methodDefinition.name !== data.method.name) {
                        return;
                    }

                    if (typeof methodDefinition === "string" &&
                        data.method.name !== methodDefinition) {
                        return;
                    }

                    if (typeof methodDefinition === "string" &&
                        data.method.name !== methodDefinition) {
                        return;
                    }

                    if (targetAgmInstance && this.isValidServer(data.server, targetAgmInstance)) {
                        if (un) {
                            un();
                        }
                        clearTimeout(cancel);
                        resolve();
                    } else if (!targetAgmInstance) {
                        reject("The agm of the passed glue is undefined");
                    }
                });
            } else {
                reject("The agm of the passed glue is undefined");
            }
        });
    }

    public clearStream(stream: any, targetAgmInstance: any): Promise<void> {
        return new Promise((resolve, reject) => {

            const cancel = setTimeout(() => {
                reject("clearStream timed out!");
            }, 5000);

            const name = stream.name;

            const un = this.glue.agm.serverMethodRemoved((data) => {
                const server = data.server;
                const method = data.method;

                if (method.name !== name) {
                    return;
                }

                if (this.isValidServer(server, targetAgmInstance)) {
                    this.persistentMethodCheck(name)
                        .then(() => {
                            un();
                            clearTimeout(cancel);
                            resolve();
                        });
                }
            });
            stream.close();
        });
    }

    public isValidServer(actualServer: Glue42Web.AppManager.Instance, expectedServer: Glue42Web.AppManager.Instance): boolean {
        const expectedInstance = expectedServer.instance;
        const expectedApplication = expectedServer.application;

        if (!actualServer) {
            return false;
        }

        if (actualServer.instance && actualServer.instance === expectedInstance) {
            return true;
        }

        if (!actualServer.instance && actualServer.application === expectedApplication) {
            return true;
        }

        return false;
    }

    public persistentMethodCheck(name: string): Promise<void> {
        let method: any;

        const methodExists = () => {
            return typeof method !== "undefined";
        };

        return new Promise((resolve, reject) => {

            method = this.checkMethod(name);

            if (methodExists()) {

                const interval = setInterval(() => {
                    method = this.checkMethod(name);

                    if (!methodExists()) {
                        clearInterval(interval);
                        resolve();
                    }

                }, 100);

            } else {
                resolve();
            }
        });
    }

    public checkMethod(name: string): any {
        return this.glue.agm.methods().find((m) => m.name === name);
    }

}