
import manager from "./manager";
import facade from "./interop/facade";
import jquery = require("jquery");
import GlueWeb, { Glue42Web } from "@glue42/web";
import GlueWorkspaces from "@glue42/workspaces-api";

declare const window: Window & { glue: Glue42Web.API; $: JQueryStatic };

const config = {
    application: "Workspaces",
    appManager: true,
    libraries: [GlueWorkspaces]
};

window.$ = jquery;

// isInFrame prevents recursion if by accident an invalid url is entered for one of the application
const isInIframe = window.frameElement;
if (!isInIframe) {
    GlueWeb(config).then((glue) => {
        window.glue = glue;
        return manager.init(glue.agm.instance.peerId);
    }).then(() => {
        return facade.init(window.glue.agm.instance.peerId);
        // tslint:disable-next-line: no-console
    }).catch(console.warn);
}
