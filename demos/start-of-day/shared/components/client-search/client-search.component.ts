import { Component, Input, OnInit, OnChanges, SimpleChanges, EventEmitter, Output } from "@angular/core";
import { Client } from "../../interfaces/ng-interfaces";

@Component({
    selector: "client-search",
    templateUrl: "./client-search.component.html",
    styleUrls: ["./client-search.component.scss"]
})
export class ClientSearchComponent implements OnChanges {

    @Input() clients: Client[];
    @Output() public onClientSelected = new EventEmitter<Client>();
    public displayClients: Client[] = [];
    public searchSelected = false;

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes.clients && changes.clients.currentValue) {
            this.displayClients = this.clients.slice(0);
        }
    }

    public onKey($event: any): void {
        const inputValue: string = $event.target.value.toLowerCase();

        this.searchSelected = inputValue.length >= 2;

        this.displayClients = this.clients.filter((client) => {
            return `${client.firstName}${client.lastName}`.toLowerCase().includes(inputValue);
        });
    }

    public handleClientSelect(client: Client): void {
        this.searchSelected = false;
        this.onClientSelected.emit(client);
    }

    public clientImageSrc(client: Client): string {
        return `/common/images/${client.image}`;
    }
}