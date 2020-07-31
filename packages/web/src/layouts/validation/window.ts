import { Decoder, object, constant, optional, anyJson, boolean } from "decoder-validate";
import { Glue42Web } from "../../../web";
import { nonEmptyStringDecoder } from "./simple";

export const windowComponentDecoder: Decoder<Glue42Web.Layouts.WindowComponent> = object({
    type: constant("window"),
    componentType: constant("application"),
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
