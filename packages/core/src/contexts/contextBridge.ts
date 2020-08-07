import { Glue42Core} from "../../glue";

export interface ContextBridge {
    all(): Glue42Core.Contexts.ContextName[];

    update(name: Glue42Core.Contexts.ContextName, delta: any): Promise<void>;

    set(name: Glue42Core.Contexts.ContextName, data: any): Promise<void>;

    get(name: Glue42Core.Contexts.ContextName): Promise<any>;

    subscribe(name: Glue42Core.Contexts.ContextName,
              callback: (data: any, delta: any, removed: string[], key: Glue42Core.Contexts.ContextSubscriptionKey, extraData?: any) => void): Promise<Glue42Core.Contexts.ContextSubscriptionKey>;

    unsubscribe(key: Glue42Core.Contexts.ContextSubscriptionKey): void;
}
