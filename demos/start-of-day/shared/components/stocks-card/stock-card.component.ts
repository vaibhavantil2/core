import { Component, Input, ViewChild, OnInit, Output, EventEmitter } from "@angular/core";
import { Stock } from "../../interfaces/ng-interfaces";
import {
    ChartComponent,
    ApexChart,
    ApexAnnotations,
    ApexTooltip,
    ApexMarkers,
    ApexStroke,
    ApexFill,
    ApexGrid,
    ApexAxisChartSeries,
    ApexDataLabels,
    ApexYAxis,
    ApexXAxis
} from "ng-apexcharts";

export type ChartOptions = {
    chart: ApexChart;
    series: ApexAxisChartSeries;
    annotations: ApexAnnotations;
    tooltip: ApexTooltip;
    markers: ApexMarkers;
    stroke: ApexStroke;
    fill: ApexFill;
    grid: ApexGrid;
    dataLabels: ApexDataLabels;
    yaxis: ApexYAxis;
    xaxis: ApexXAxis;
};

@Component({
    selector: "stock-card",
    templateUrl: "./stock-card.component.html",
    styleUrls: ["./stock-card.component.scss"]
})
export class StockCardComponent implements OnInit {
    @Input() public stock: Stock;
    @Output() public emitStockSelect = new EventEmitter();
    @Input() public quantity: number;
    @ViewChild("chart", { static: false }) chart: ChartComponent;
    public currentPrice: number;
    public percentageChange: string;
    public isPriceRising = false;
    public chartOptions: Partial<ChartOptions>;
    public chartOptions2: Partial<any>;

    public ngOnInit(): void {
        this.isPriceRising = this.stock.lastPrices[this.stock.lastPrices.length - 1] >= this.stock.lastClosePrice;
        this.currentPrice = this.stock.lastPrices[this.stock.lastPrices.length - 1];
        this.percentageChange = ((this.currentPrice - this.stock.lastClosePrice) / this.stock.lastClosePrice * 100).toFixed(2);
        this.chartOptions = {
            chart: {
                height: "100px",
                width: "100%",
                type: "area",
                toolbar: {
                    show: false
                },
                dropShadow: {
                    enabled: true,
                    top: 10,
                    left: 0,
                    blur: 15,
                    color: this.isPriceRising ? "#0CA2E9" : "#FA6D67",
                    opacity: 0.25
                },
                sparkline: {
                    enabled: false
                }
            },
            annotations: {
                position: "back",
                yaxis: [
                    {
                        y: this.stock.lastPrices.reduce((a, b) => a + b, 0) / this.stock.lastPrices.length,
                        strokeDashArray: 10,
                        borderColor: "rgba(255, 255, 255, 0.1)",
                        opacity: 1,
                        offsetX: 0,
                        offsetY: 0
                    }
                ]
            },
            tooltip: {
                enabled: false
            },
            markers: {
                size: 0
            },
            stroke: {
                show: true,
                curve: "smooth",
                colors: [this.isPriceRising ? "#0CA2E9" : "#FA6D67"],
                width: 3,
            },
            fill: {
                type: "solid",
                opacity: 0
            },
            grid: {
                show: false,
                xaxis: {
                    lines: {
                        show: false
                    }
                },
                yaxis: {
                    lines: {
                        show: false
                    }
                }
            },
            series: [
                {
                    name: this.stock.name,
                    data: this.stock.lastPrices
                }
            ],
            dataLabels: {
                enabled: false
            },
            yaxis: {
                show: false
            },
            xaxis: {
                categories: [
                    "23/10/2019",
                    " 06/11/2019",
                    " 06/11/2019",
                    " 07/11/2019",
                    " 07/11/2019",
                    " 07/11/2019"
                ],
                labels: {
                    show: false
                },
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                },
                tooltip: {
                    enabled: false
                }
            }
        };
    }

    public handleStockSelect(): void {
        this.emitStockSelect.emit(this.stock);
    }

    public getIconClasses(): any {
        return this.isPriceRising ?
            ["demo-icon", "icon-up-open"] :
            ["demo-icon", "icon-down-open"];
    }
}
