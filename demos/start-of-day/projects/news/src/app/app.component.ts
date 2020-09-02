import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { News, ClientBasicInfo, Client } from '../../../../shared/interfaces/ng-interfaces';
import { GlueService } from '../../../../shared/data/glue.service';
import { DataService } from '../../../../shared/data/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  public title = 'news';
  public news: News[] = [];
  public relevantTo: string;
  public relevantClientBasic: ClientBasicInfo;
  public fullNameRelevance: string;
  public inWorkspace: boolean = false;
  private globalUnsubscribe: () => void;

  constructor(private readonly dataService: DataService, private readonly glueService: GlueService, private ref: ChangeDetectorRef) { }

  public async ngOnInit(): Promise<void> {
    this.inWorkspace = await this.glueService.isInWorkspace();
    this.news = await this.dataService.getAllNews();

    this.glueService.setUpContextRetrieval((ctx) => {
      this.handleIncomingContext(ctx);
    }).then((setUpData) => {
      this.globalUnsubscribe = setUpData.globalUnsubscribe;
    });


    await this.glueService.setMyWorkspaceId();
  }

  public async bringBackToWorkspace() {
    const context = await this.glueService.getMyWindowContext();
    await this.glueService.bringBackToWorkspace(context.workspaceId);

    this.glueService.closeMe();
  }

  public ngOnDestroy(): void {
    if (this.globalUnsubscribe) {
      this.globalUnsubscribe();
    }
  }

  private async handleIncomingContext(context: { client?: Client, selectedStockSymbol?: string }): Promise<void> {

    if (context?.selectedStockSymbol) {
      this.news = await this.dataService.getStockRelatedNews(context.selectedStockSymbol);
      this.relevantTo = context.selectedStockSymbol;
      this.fullNameRelevance = (await this.dataService.getAllStocks()).find((stock) => stock.symbol === context.selectedStockSymbol).name;
      this.ref.detectChanges();
      await this.glueService.setMyTitle(`News - ${this.relevantTo}`);
      return;
    }

    if (context?.client) {
      this.news = await this.dataService.getClientRelatedNews(context.client.id);
      this.relevantTo = context.client.id;
      this.relevantClientBasic = await this.dataService.getClientBasicInfo(this.relevantTo);
      this.fullNameRelevance = `${this.relevantClientBasic.firstName} ${this.relevantClientBasic.lastName}`;
      this.ref.detectChanges();
      await this.glueService.setMyTitle(`News - ${this.fullNameRelevance}`);
      return;
    }
  }
}
