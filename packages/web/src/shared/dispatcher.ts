/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    default as CallbackRegistryFactory,
    CallbackRegistry,
    UnsubscribeFunction,
} from "callback-registry";
import { Glue42Web } from "../../web";

export class EventsDispatcher {
    private glue!: Glue42Web.API;
    private readonly registry: CallbackRegistry = CallbackRegistryFactory();
    private readonly glue42CoreEventName = "Glue42CoreRuntime";

    private readonly events: { [key in string]: { name: string; handle: (glue42coreData: any) => void | Promise<void> } } = {
        notifyStarted: { name: "notifyStarted", handle: this.handleNotifyStarted.bind(this) },
        contentInc: { name: "contentInc", handle: this.handleContentInc.bind(this) }
    }

    public start(glue: Glue42Web.API): void {
        this.glue = glue;

        this.wireCustomEventListener();

        this.announceStarted();
    }

    public sendContentMessage<T>(message: T): void {
        this.send("contentOut", message);
    }

    public onContentMessage(callback: (message: any) => void): UnsubscribeFunction {
        return this.registry.add("content-inc", callback);
    }

    private wireCustomEventListener(): void {
        window.addEventListener(this.glue42CoreEventName, (event) => {
            const data = (event as CustomEvent).detail;

            if (!data || !data.glue42core) {
                return;
            }

            const glue42Event: string = data.glue42core.event;

            const foundHandler = this.events[glue42Event];

            if (!foundHandler) {
                return;
            }

            foundHandler.handle(data.glue42core.message);

        });
    }

    private announceStarted(): void {
        this.send("start");
    }

    private handleNotifyStarted(): void {
        this.announceStarted();
    }

    private handleContentInc(message: any): void {
        this.registry.execute("content-inc", message);
    }

    private send(eventName: string, message?: any): void {
        const payload = { glue42core: { event: eventName, message } };

        const event = new CustomEvent(this.glue42CoreEventName, { detail: payload });

        window.dispatchEvent(event);
    }
}