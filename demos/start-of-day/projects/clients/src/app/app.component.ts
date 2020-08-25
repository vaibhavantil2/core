import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Client } from '../../../../shared/interfaces/ng-interfaces';
import { DataService } from '../../../../shared/data/data.service';
import { GlueService } from '../../../../shared/data/glue.service';
import shortid from 'shortid';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  public title = 'Clients';
  public clients: Client[];
  public selectedClient: Client;
  public hasSelectedClient = false;
  public inWorkspace: boolean = false;
  private globalUnsubscribe: () => void;
  private contextId: string;

  constructor(private readonly dataService: DataService, private readonly glueService: GlueService, private ref: ChangeDetectorRef) { }

  public async ngOnInit(): Promise<void> {

    this.clients = await this.dataService.getAllClients();
    this.inWorkspace = await this.glueService.isInWorkspace();

    this.glueService.setUpContextRetrieval((ctx) => {
      this.handleIncomingClient(ctx);
    })
      .then((setUpData) => {
        this.contextId = setUpData.contextId;
        this.globalUnsubscribe = setUpData.globalUnsubscribe;
      })


    await this.glueService.setMyWorkspaceId();
  }

  public async handleClientSelect(client: Client) {
    const inWsp = await this.glueService.isInWorkspace();

    if (!inWsp && !this.contextId) {
      await this.handleIncomingClient({ client });
    }

    if (!this.contextId) {
      this.contextId = shortid();
      await this.glueService.setWorkspaceContextId(this.contextId);
    }

    await this.glueService.updateContext(this.contextId, { client });

  }

  public async openClientTransactions() {

    const inWsp = await this.glueService.isInWorkspace();

    if (!inWsp) {
      await this.glueService.openWindow(`Transactions-${this.selectedClient}`, '/transactions/index.html', { contextId: this.contextId });
      return;
    }

    await this.glueService.addTransactionsToWorkspace(this.contextId);
  }

  public async bringBackToWorkspace() {
    const context = await this.glueService.getMyWindowContext();
    await this.glueService.bringBackToWorkspace(context.workspaceId);

    this.glueService.closeMe();
  }

  public ngOnDestroy(): void {
    this.hasSelectedClient = false;

    if (this.globalUnsubscribe) {
      this.globalUnsubscribe();
    }
  }

  public clientImageSrc(): string {
    return `/common/images/${this.selectedClient.image}`;
  }

  private async handleIncomingClient(context: { client?: Client }) {

    if (context?.client) {
      this.selectedClient = this.clients.find((cl) => cl.id === context.client.id);
      this.hasSelectedClient = true;
      await this.setTitles(`${this.selectedClient.firstName} ${this.selectedClient.lastName}`);
      this.ref.detectChanges();
      return;
    }
  }

  private async setTitles(clientFullName?: string): Promise<void> {

    const tabTitle = clientFullName ? `Client ${clientFullName}` : `All Clients`;
    await this.glueService.setMyTitle(tabTitle);

    const inWsp = await this.glueService.isInWorkspace();

    if (inWsp) {
      const myWsp = await this.glueService.getMyWorkspace();
      await myWsp.setTitle(clientFullName ? clientFullName : 'Clients')
    }

  }
}
