import { Decoder, oneOf, constant, object, boolean } from "decoder-validate";
import { ExtensionConfig, ExtensionOperationTypes } from "./protocol";

export const extensionOperationTypesDecoder: Decoder<ExtensionOperationTypes> = oneOf<"clientHello">(
    constant("clientHello")
);

export const extensionConfigDecoder: Decoder<ExtensionConfig> = object({
    widget: object({
        inject: boolean()
    })
});
