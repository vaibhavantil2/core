/* eslint-disable @typescript-eslint/no-explicit-any */
import { Glue42Web } from "@glue42/web";
import { Glue42Workspaces } from "@glue42/workspaces-api";
import { anyJson, array, boolean, constant, Decoder, fail, lazy, number, object, oneOf, optional, string } from "decoder-validate";
import { Glue42WebPlatform } from "../../platform";
import { LibDomains, SystemOperationTypes } from "../common/types";

export const nonNegativeNumberDecoder: Decoder<number> = number().where((num) => num >= 0, "Expected a non-negative number");
export const nonEmptyStringDecoder: Decoder<string> = string().where((s) => s.length > 0, "Expected a non-empty string");
export const anyDecoder: Decoder<unknown> = anyJson();

export const windowRelativeDirectionDecoder: Decoder<Glue42Web.Windows.RelativeDirection> = oneOf<"top" | "left" | "right" | "bottom">(
    constant("top"),
    constant("left"),
    constant("right"),
    constant("bottom")
);

const logLevelDecoder: Decoder<Glue42WebPlatform.Gateway.LogLevel> = oneOf<"trace" | "debug" | "info" | "warn" | "error">(
    constant("trace"),
    constant("debug"),
    constant("info"),
    constant("warn"),
    constant("error")
);

const channelMetaDecoder: Decoder<Glue42WebPlatform.Channels.ChannelMeta> = anyJson().where(
    (meta: Glue42WebPlatform.Channels.ChannelMeta) => typeof meta["color"] === "string" && meta["color"].length > 0,
    "Expected color to be a non-empty string"
);

const layoutTypeDecoder: Decoder<Glue42Web.Layouts.LayoutType> = oneOf<"Global" | "Activity" | "ApplicationDefault" | "Swimlane" | "Workspace">(
    constant("Global"),
    constant("Activity"),
    constant("ApplicationDefault"),
    constant("Swimlane"),
    constant("Workspace")
);

const componentTypeDecoder: Decoder<Glue42Web.Layouts.ComponentType> = oneOf<"application" | "activity">(
    constant("application"),
    constant("activity")
);

const functionCheck = (input: any, propDescription: string): Decoder<any> => {
    const providedType = typeof input;

    return providedType === "function" ?
        anyJson() :
        fail(`The provided argument as ${propDescription} should be of type function, provided: ${typeof providedType}`);
};

export const layoutSummaryDecoder: Decoder<Glue42Web.Layouts.LayoutSummary> = object({
    name: nonEmptyStringDecoder,
    type: layoutTypeDecoder,
    context: optional(anyJson()),
    metadata: optional(anyJson())
});

export const windowLayoutComponentDecoder: Decoder<Glue42Web.Layouts.WindowComponent> = object({
    type: constant("window"),
    componentType: componentTypeDecoder,
    state: object({
        name: anyJson(),
        context: anyJson(),
        url: nonEmptyStringDecoder,
        bounds: anyJson(),
        id: nonEmptyStringDecoder,
        parentId: optional(nonEmptyStringDecoder),
        main: boolean()
    })
});

export const libDomainDecoder: Decoder<LibDomains> = oneOf<"system" | "windows" | "appManager" | "layouts" | "workspaces" | "intents" | "notifications" | "extension">(
    constant("system"),
    constant("windows"),
    constant("appManager"),
    constant("layouts"),
    constant("workspaces"),
    constant("intents"),
    constant("notifications"),
    constant("extension")
);

export const systemOperationTypesDecoder: Decoder<SystemOperationTypes> = oneOf<"getEnvironment" | "getBase">(
    constant("getEnvironment"),
    constant("getBase")
);

export const windowLayoutItemDecoder: Decoder<Glue42Workspaces.WindowLayoutItem> = object({
    type: constant("window"),
    config: object({
        appName: nonEmptyStringDecoder,
        url: optional(nonEmptyStringDecoder),
        title: optional(string()),
        showCloseButton: optional(boolean()),
        allowExtract: optional(boolean())
    })
});

export const groupLayoutItemDecoder: Decoder<Glue42Workspaces.GroupLayoutItem> = object({
    type: constant("group"),
    config: anyJson(),
    children: array(oneOf<Glue42Workspaces.WindowLayoutItem>(
        windowLayoutItemDecoder
    ))
});

export const columnLayoutItemDecoder: Decoder<Glue42Workspaces.ColumnLayoutItem> = object({
    type: constant("column"),
    config: anyJson(),
    children: array(oneOf<Glue42Workspaces.RowLayoutItem | Glue42Workspaces.ColumnLayoutItem | Glue42Workspaces.GroupLayoutItem | Glue42Workspaces.WindowLayoutItem>(
        groupLayoutItemDecoder,
        windowLayoutItemDecoder,
        lazy(() => columnLayoutItemDecoder),
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        lazy(() => rowLayoutItemDecoder)
    ))
});

export const rowLayoutItemDecoder: Decoder<Glue42Workspaces.RowLayoutItem> = object({
    type: constant("row"),
    config: anyJson(),
    children: array(oneOf<Glue42Workspaces.RowLayoutItem | Glue42Workspaces.ColumnLayoutItem | Glue42Workspaces.GroupLayoutItem | Glue42Workspaces.WindowLayoutItem>(
        columnLayoutItemDecoder,
        groupLayoutItemDecoder,
        windowLayoutItemDecoder,
        lazy(() => rowLayoutItemDecoder)
    ))
});

export const workspaceLayoutComponentDecoder: Decoder<Glue42Workspaces.WorkspaceComponent> = object({
    type: constant("Workspace"),
    state: object({
        config: anyJson(),
        context: anyJson(),
        children: array(oneOf<Glue42Workspaces.RowLayoutItem | Glue42Workspaces.ColumnLayoutItem | Glue42Workspaces.GroupLayoutItem | Glue42Workspaces.WindowLayoutItem>(
            rowLayoutItemDecoder,
            columnLayoutItemDecoder,
            groupLayoutItemDecoder,
            windowLayoutItemDecoder
        ))
    })
});

export const glueLayoutDecoder: Decoder<Glue42Web.Layouts.Layout> = object({
    name: nonEmptyStringDecoder,
    type: layoutTypeDecoder,
    components: array(oneOf<Glue42Web.Layouts.WindowComponent | Glue42Workspaces.WorkspaceComponent>(
        windowLayoutComponentDecoder,
        workspaceLayoutComponentDecoder
    )),
    context: optional(anyJson()),
    metadata: optional(anyJson())
});

export const applicationDetailsDecoder: Decoder<Glue42Web.AppManager.DefinitionDetails> = object({
    url: nonEmptyStringDecoder,
    top: optional(number()),
    left: optional(number()),
    width: optional(nonNegativeNumberDecoder),
    height: optional(nonNegativeNumberDecoder)
});

export const intentDefinitionDecoder: Decoder<Glue42Web.AppManager.Intent> = object({
    name: nonEmptyStringDecoder,
    displayName: optional(string()),
    contexts: optional(array(string())),
    customConfig: optional(object())
});

export const glueCoreAppDefinitionDecoder: Decoder<Glue42Web.AppManager.Definition> = object({
    name: nonEmptyStringDecoder,
    type: nonEmptyStringDecoder.where((s) => s === "window", "Expected a value of window"),
    title: optional(nonEmptyStringDecoder),
    version: optional(nonEmptyStringDecoder),
    customProperties: optional(anyJson()),
    icon: optional(nonEmptyStringDecoder),
    caption: optional(nonEmptyStringDecoder),
    details: applicationDetailsDecoder,
    intents: optional(array(intentDefinitionDecoder)),
    hidden: optional(boolean())
});

// todo: remove this dirty fix once the remote app services are updated
export const fdc3AppDefinitionDecoder: Decoder<Glue42WebPlatform.Applications.FDC3Definition> = object({
    name: nonEmptyStringDecoder,
    title: optional(nonEmptyStringDecoder),
    version: optional(nonEmptyStringDecoder),
    appId: optional(nonEmptyStringDecoder),
    manifest: nonEmptyStringDecoder,
    manifestType: nonEmptyStringDecoder,
    tooltip: optional(nonEmptyStringDecoder),
    description: optional(nonEmptyStringDecoder),
    contactEmail: optional(nonEmptyStringDecoder),
    supportEmail: optional(nonEmptyStringDecoder),
    publisher: optional(nonEmptyStringDecoder),
    images: optional(array(object({ url: optional(nonEmptyStringDecoder) }))),
    icons: optional(array(object({ icon: optional(nonEmptyStringDecoder) }))),
    customConfig: anyJson(),
    intents: optional(array(intentDefinitionDecoder))
}) as Decoder<Glue42WebPlatform.Applications.FDC3Definition>;

export const remoteStoreDecoder: Decoder<Glue42WebPlatform.RemoteStore> = object({
    url: nonEmptyStringDecoder,
    pollingInterval: optional(nonNegativeNumberDecoder),
    requestTimeout: optional(nonNegativeNumberDecoder),
    customHeaders: optional(anyJson())
});

export const supplierDecoder: Decoder<Glue42WebPlatform.Supplier<any>> = object({
    fetch: anyJson().andThen((result) => functionCheck(result, "supplier fetch")),
    timeout: optional(nonNegativeNumberDecoder),
    pollingInterval: optional(nonNegativeNumberDecoder),
    save: optional(anyJson().andThen((result) => functionCheck(result, "supplier save"))),
    delete: optional(anyJson().andThen((result) => functionCheck(result, "supplier delete")))
});

export const channelDefinitionDecoder: Decoder<Glue42WebPlatform.Channels.ChannelDefinition> = object({
    name: nonEmptyStringDecoder,
    meta: channelMetaDecoder,
    data: optional(anyJson())
});

export const pluginDefinitionDecoder: Decoder<Glue42WebPlatform.Plugins.PluginDefinition> = object({
    name: nonEmptyStringDecoder,
    start: anyJson(),
    config: optional(anyJson()),
    critical: optional(boolean())
});

export const allApplicationDefinitionsDecoder: Decoder<Glue42Web.AppManager.Definition | Glue42WebPlatform.Applications.FDC3Definition> = oneOf<Glue42Web.AppManager.Definition | Glue42WebPlatform.Applications.FDC3Definition>(
    glueCoreAppDefinitionDecoder,
    fdc3AppDefinitionDecoder
);

export const appsCollectionDecoder: Decoder<Array<Glue42Web.AppManager.Definition | Glue42WebPlatform.Applications.FDC3Definition>> = array(allApplicationDefinitionsDecoder);

export const applicationsConfigDecoder: Decoder<Glue42WebPlatform.Applications.Config> = object({
    local: optional(array(allApplicationDefinitionsDecoder)),
    remote: optional(remoteStoreDecoder)
});

export const layoutsConfigDecoder: Decoder<Glue42WebPlatform.Layouts.Config> = object({
    mode: optional(oneOf<"idb" | "session">(
        constant("idb"),
        constant("session")
    )),
    local: optional(array(glueLayoutDecoder))
});

export const channelsConfigDecoder: Decoder<Glue42WebPlatform.Channels.Config> = object({
    definitions: array(channelDefinitionDecoder)
});

export const pluginsConfigDecoder: Decoder<Glue42WebPlatform.Plugins.Config> = object({
    definitions: array(pluginDefinitionDecoder)
});

export const gatewayConfigDecoder: Decoder<Glue42WebPlatform.Gateway.Config> = object({
    logging: optional(object({
        level: optional(logLevelDecoder),
        appender: optional(anyJson().andThen((result) => functionCheck(result, "gateway log appender")))
    }))
});

// todo: proper implement when the config has been finalized
export const glueConfigDecoder: Decoder<Glue42Web.Config> = anyJson();

export const maximumActiveWorkspacesDecoder: Decoder<Glue42WebPlatform.Workspaces.MaximumActiveWorkspacesRule> = object({
    threshold: number().where((num) => num > 1, "Expected a number larger than 1")
});

export const idleWorkspacesDecoder: Decoder<Glue42WebPlatform.Workspaces.IdleWorkspacesRule> = object({
    idleMSThreshold: number().where((num) => num > 100, "Expected a number larger than 100")
});

export const hibernationConfigDecoder: Decoder<Glue42WebPlatform.Workspaces.HibernationConfig> = object({
    maximumActiveWorkspaces: optional(maximumActiveWorkspacesDecoder),
    idleWorkspaces: optional(idleWorkspacesDecoder)
});

export const loadingConfigDecoder: Decoder<Glue42WebPlatform.Workspaces.LoadingConfig> = object({
    delayed: optional(object({
        batch: optional(number()),
        initialOffsetInterval: optional(number()),
        interval: optional(number())
    })),
    defaultStrategy: optional(oneOf(constant("direct"), constant("delayed"), constant("lazy"))),
    showDelayedIndicator: optional(boolean())
});

export const workspacesConfigDecoder: Decoder<Glue42WebPlatform.Workspaces.Config> = object({
    src: nonEmptyStringDecoder,
    hibernation: optional(hibernationConfigDecoder),
    loadingStrategy: optional(loadingConfigDecoder),
    isFrame: optional(boolean()),
    frameCache: optional(boolean())
});

export const windowsConfigDecoder: Decoder<Glue42WebPlatform.Windows.Config> = object({
    windowResponseTimeoutMs: optional(nonNegativeNumberDecoder),
    defaultWindowOpenBounds: optional(object({
        top: number(),
        left: number(),
        width: nonNegativeNumberDecoder,
        height: nonNegativeNumberDecoder
    }))
});

export const serviceWorkerConfigDecoder: Decoder<Glue42WebPlatform.ServiceWorker.Config> = object({
    url: optional(nonEmptyStringDecoder),
    registrationPromise: optional(anyJson())
});

export const platformConfigDecoder: Decoder<Glue42WebPlatform.Config> = object({
    windows: optional(windowsConfigDecoder),
    applications: optional(applicationsConfigDecoder),
    layouts: optional(layoutsConfigDecoder),
    channels: optional(channelsConfigDecoder),
    plugins: optional(pluginsConfigDecoder),
    serviceWorker: optional(serviceWorkerConfigDecoder),
    gateway: optional(gatewayConfigDecoder),
    glue: optional(glueConfigDecoder),
    workspaces: optional(workspacesConfigDecoder),
    environment: optional(anyJson()),
    glueFactory: optional(anyJson().andThen((result) => functionCheck(result, "glueFactory")))
});

export const windowOpenSettingsDecoder: Decoder<Glue42Web.Windows.Settings> = object({
    top: optional(number()),
    left: optional(number()),
    width: optional(nonNegativeNumberDecoder),
    height: optional(nonNegativeNumberDecoder),
    context: optional(anyJson()),
    relativeTo: optional(nonEmptyStringDecoder),
    relativeDirection: optional(windowRelativeDirectionDecoder)
});
