/** Context delta when updating or replacing a context. */
export interface ContextDelta {

    /** Context properties that were added. */
    added: ContextEntries;

    /** Context properties that were updated. */
    updated: ContextEntries;

    /** Context properties that were removed. */
    removed: string[];

    /** Context properties that were reset. */
    reset?: ContextEntries;

    commands?: ContextDeltaCommand[];
}

export interface ContextDeltaCommand {
    type: "set" | "remove";
    path: string;
    value?: any;
}

/** Context entries. Key/value pairs holding context data. */
export interface ContextEntries { [index: string]: any; }

export type ContextSubscriptionKey = number;

export type ContextName = string;
