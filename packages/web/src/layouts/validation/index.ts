import { Decoder, oneOf, constant, object, optional, anyJson, boolean, array } from "decoder-validate";
import { Glue42Web } from "../../../web";
import { Glue42Workspaces } from "@glue42/workspaces-api";
import { workspaceComponentDecoder } from "./workspace";
import { windowComponentDecoder } from "./window";
import { nonEmptyStringDecoder } from "./simple";

export const layoutTypeDecoder: Decoder<Glue42Web.Layouts.LayoutType> = oneOf<Glue42Web.Layouts.LayoutType>(
    constant("Global"),
    constant("Workspace"),
);

export const newLayoutOptionsDecoder: Decoder<Glue42Web.Layouts.NewLayoutOptions> = object({
    name: nonEmptyStringDecoder,
    context: optional(anyJson()),
    metadata: optional(anyJson())
});

export const restoreOptionsDecoder: Decoder<Glue42Web.Layouts.RestoreOptions> = object({
    name: nonEmptyStringDecoder,
    context: optional(anyJson()),
    closeRunningInstance: optional(boolean())
});

export const layoutDecoder: Decoder<Glue42Web.Layouts.Layout> = object({
    name: nonEmptyStringDecoder,
    type: layoutTypeDecoder,
    context: optional(anyJson()),
    metadata: optional(anyJson()),
    components: array(oneOf<Glue42Workspaces.WorkspaceComponent | Glue42Web.Layouts.WindowComponent>(
        workspaceComponentDecoder,
        windowComponentDecoder
    ))
});
