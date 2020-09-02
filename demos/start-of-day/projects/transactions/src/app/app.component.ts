import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { DataService } from '../../../../shared/data/data.service';
import { ClientBasicInfo, Client } from '../../../../shared/interfaces/ng-interfaces';
import { GlueService } from '../../../../shared/data/glue.service';
import { GridOptions } from 'ag-grid-community';
import { Row } from './interfaces/row';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public title = 'transactions';
  public clientBasicInfo: ClientBasicInfo;
  public rowData: Row[];
  public gridOptions: GridOptions;
  public columnDefs;
  public inWorkspace: boolean = false;
  private globalUnsubscribe: () => void;

  constructor(private readonly dataService: DataService, private readonly glueService: GlueService, private ref: ChangeDetectorRef) { }

  public async ngOnInit(): Promise<void> {
    this.inWorkspace = await this.glueService.isInWorkspace();

    this.glueService.setUpContextRetrieval((ctx) => {
      this.handleIncomingClient(ctx);
    })
      .then((setUpData) => {
        this.globalUnsubscribe = setUpData.globalUnsubscribe;
      })
    await this.glueService.setMyWorkspaceId();
  }

  public ngOnDestroy(): void {
    if (this.globalUnsubscribe) {
      this.globalUnsubscribe();
    }
  }

  public clientImageSrc(): string {
    if (this.clientBasicInfo) {
      return `/common/images/${this.clientBasicInfo.image}`;
    }

    return ``;
  }

  public async bringBackToWorkspace() {
    const context = await this.glueService.getMyWindowContext();
    await this.glueService.bringBackToWorkspace(context.workspaceId, context.grandParentId);

    this.glueService.closeMe();
  }

  private async handleIncomingClient(context: { client?: Client }) {
    if (context?.client) {
      const clientId = context.client.id;
      [this.clientBasicInfo, this.rowData] = await Promise.all([
        this.dataService.getClientBasicInfo(clientId),
        this.dataService.getClientTransactions(clientId)
          .then((transactions) => {
            return transactions.map<Row>((tr) => {
              const validDate = new Date(tr.date);
              return {
                symbol: tr.symbol,
                price: `$ ${tr.price}`,
                quantity: tr.quantity,
                amount: `$ ${(tr.quantity * tr.price).toFixed(2)}`,
                currency: tr.currency.toUpperCase(),
                date: validDate.toLocaleDateString('en-GB'),
                type: tr.type.charAt(0).toUpperCase() + tr.type.slice(1)
              };
            });
          })
      ]);
      this.ref.detectChanges();
      await this.glueService.setMyTitle(`Transactions - ${this.clientBasicInfo.firstName} ${this.clientBasicInfo.lastName}`);
    }
  }
}
