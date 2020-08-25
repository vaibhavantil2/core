import { Component, Input, OnChanges, SimpleChanges, OnInit } from "@angular/core";
import { News } from "../../../shared/interfaces/ng-interfaces";

@Component({
    selector: "news-card",
    templateUrl: "./news-card.component.html",
    styleUrls: ["./news-card.component.scss"]
})
export class NewsCardComponent {
    @Input() public news: News;
    public isNewsExpanded = false;

    public getImageSrc(): string {
        return `/common/images/${this.news.image}`;
    }
}