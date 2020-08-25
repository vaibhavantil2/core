import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ClientCardComponent } from "./client-card/client-card.component";
import { ClientSearchComponent } from "./client-search/client-search.component";
import { NewsCardComponent } from "./news-card/news-card.component";
import { StockCardComponent } from "./stocks-card/stock-card.component";
import { NgApexchartsModule } from "ng-apexcharts";
import { ClickOutsideModule } from "ng-click-outside";

@NgModule({
    imports: [CommonModule, NgApexchartsModule, ClickOutsideModule],
    declarations: [ClientCardComponent, ClientSearchComponent, NewsCardComponent, StockCardComponent],
    exports: [ClientCardComponent, ClientSearchComponent, NewsCardComponent, StockCardComponent, NgApexchartsModule]
})
export class ComponentsModule { }