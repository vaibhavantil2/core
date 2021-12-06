import { Decoder, oneOf, constant, object, boolean } from "decoder-validate";
import { nonEmptyStringDecoder } from "../../shared/decoders";
import { ClientHello, ClientHelloResponse, ExtensionOperationTypes } from "./types";

export const extensionOperationTypesDecoder: Decoder<ExtensionOperationTypes> = oneOf<"clientHello">(
    constant("clientHello")
);

export const clientHelloResponseDecoder: Decoder<ClientHelloResponse> = object({
    widget: object({
        inject: boolean()
    })
});

export const clientHelloDecoder: Decoder<ClientHello> = object({
    windowId: nonEmptyStringDecoder
});
