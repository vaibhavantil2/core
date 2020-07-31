import { Glue42Web } from "../../web";

export type ControlDomain = "windows" | "layouts" | "appManager";
export type LayoutCommand = "saveLayoutAndClose";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface RemoteCommand<T = any> {
    domain: ControlDomain;
    command: string;
    args?: T;
    skipResult?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface LayoutRemoteCommand<T = any> extends RemoteCommand<T> {
    domain: "layouts";
    command: LayoutCommand; // add extra if needed
    args?: T;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SaveAutoLayoutCommand extends LayoutRemoteCommand<SaveAutoLayoutCommandArgs> {
}

export interface SaveAutoLayoutCommandArgs {
    layoutName: string;
    parentInfo: Glue42Web.Layouts.WindowComponent;
    childWindows: string[];
    closeEveryone: boolean;
    context: object;
    metadata: object;
}
