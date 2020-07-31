/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subscription } from "./glue";

export type StreamType = "frame" | "workspace" | "container" | "window";
export type StreamLevel = "global" | "frame" | "workspace" | "window";
export type StreamAction = "opened" | "closing" | "closed" | "focus" | "added" | "loaded" | "removed" | "childrenUpdate" | "containerChange";

export interface SubscriptionConfig {
    streamType: StreamType;
    level: StreamLevel;
    action: StreamAction;
    callback: (args?: any) => void;
    levelId?: string;
}

export interface ActiveSubscription {
    streamType: StreamType;
    level: StreamLevel;
    levelId?: string;
    callbacksCount: number;
    gdSub: Subscription;
}
