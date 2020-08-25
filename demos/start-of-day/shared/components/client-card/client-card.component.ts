import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Client } from "../../interfaces/ng-interfaces";

@Component({
    selector: "client-card",
    templateUrl: "./client-card.component.html",
    styleUrls: ["./client-card.component.scss"]
})
export class ClientCardComponent {
    @Input() public client: Client;
    @Output() public emitClientSelect = new EventEmitter();

    public clientImageSrc(): string {
        return `/common/images/${this.client.image}`;
    }

    public handleClientSelect(): void {
        this.emitClientSelect.emit(this.client);
    }
}
