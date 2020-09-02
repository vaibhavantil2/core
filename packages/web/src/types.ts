
import { Glue42 } from "@glue42/desktop";
import { Glue42Web } from "../web";

/** Optional context passed to new windows */
export interface StartingContext {
    context: object;
    name: string;
    parent: string; // id of the parent window
}

interface Glue42Config extends Glue42.Config {
    libraries?: Array<(glue: Glue42Web.API, config?: Glue42Web.Config) => Promise<void>>;
}

/** Extra objects available in the global window object when your app is running in Glue42 Enterprise  */
export interface Glue42DesktopWindowContext {
    glue42gd: Glue42.GDObject;
    Glue: (config?: Glue42Config) => Promise<Glue42.Glue>;
}
