import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Client, AllData, ClientBasicInfo, Stock, Transaction, News } from "../../shared/interfaces/ng-interfaces";

@Injectable()
export class DataService {

    private readonly localUrl: string = "/common/data.json";

    constructor(private http: HttpClient) { }

    public async getAllClients(): Promise<Client[]> {
        return (await this.getAllData()).clients;
    }

    public async getAllNews(): Promise<News[]> {
        return (await this.getAllData()).news;
    }

    public async getAllStocks(): Promise<Stock[]> {
        return (await this.getAllData()).stocks;
    }

    public async getClientBasicInfo(clientId: string): Promise<ClientBasicInfo> {
        const clients: Client[] = await this.getAllClients();
        const foundClient: Client = clients.find((client) => client.id === clientId);

        return {
            firstName: foundClient.firstName,
            lastName: foundClient.lastName,
            image: foundClient.image,
            portfolioValue: foundClient.portfolioValue
        };
    }

    public async getClientPortfolio(clientId: string): Promise<Array<{ stock: Stock, quantity: number }>> {
        const { clients, stocks } = await this.getAllData();
        const foundClient: Client = clients.find((client) => client.id === clientId);

        return foundClient.portfolio.reduce<Array<{ stock: Stock, quantity: number }>>((fullPortfolio, portFolioEntry) => {
            const foundStock: Stock = stocks.find((stock) => stock.id === portFolioEntry.stockId);
            fullPortfolio.push({
                stock: foundStock,
                quantity: portFolioEntry.quantity
            });
            return fullPortfolio;
        }, []);
    }

    public async getClientRelatedNews(clientId: string): Promise<News[]> {
        const { news } = await this.getAllData();

        return news.filter((n) => n.relatedTo.clientIds.some((id) => id === clientId));
    }

    public async getStockRelatedNews(symbol: string): Promise<any> {
        const { news } = await this.getAllData();

        return news.filter((n) => n.relatedTo.stockSymbols.some((s) => s === symbol));
    }

    public async getClientTransactions(clientId: string): Promise<Transaction[]> {
        const { clients } = await this.getAllData();
        return clients.find((client) => client.id === clientId).transactions;
    }

    public async getAllData(): Promise<AllData> {
        return await this.http.get<AllData>(this.localUrl).toPromise();
    }
}
