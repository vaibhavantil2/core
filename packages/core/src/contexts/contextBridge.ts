import { ContextName, ContextSubscriptionKey } from "./bridges/types";

export interface ContextBridge {
    all(): ContextName[];

    update(name: ContextName, delta: any): Promise<void>;

    set(name: ContextName, data: any): Promise<void>;

    setPath(name: ContextName, path: string, data: any): Promise<void>;

    get(name: ContextName, returnImmediately: boolean): Promise<any>;

    subscribe(name: ContextName,
              callback: (data: any, delta: any, removed: string[], key: ContextSubscriptionKey, extraData?: any) => void): Promise<ContextSubscriptionKey>;

    unsubscribe(key: ContextSubscriptionKey): void;
}
