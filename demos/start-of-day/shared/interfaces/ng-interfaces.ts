// tslint:disable:interface-name
export interface News {
    id: string;
    source: string;
    relatedTo: { clientIds: string[], stockSymbols: string[] };
    elapsedTime: { value: number, period: "h" | "d" | "w" };
    title: string;
    content: string;
    image: string;
}

export interface Stock {
    id: string;
    name: string;
    symbol: string;
    lastClosePrice: number;
    lastPrices: number[];
    about: string;
}

export interface Transaction {
    id: string;
    symbol: string;
    price: number;
    quantity: number;
    currency: string;
    date: Date;
    type: "buy" | "sell";
}

export interface ClientBasicInfo {
    firstName: string;
    lastName: string;
    image: string;
    portfolioValue: number;
}

export interface Client extends ClientBasicInfo {
    id: string;
    email: string;
    phone: number;
    about: string;
    image: string;
    portfolio: Array<{
        stockId: string;
        quantity: number;
    }>;
    transactions: Transaction[];
}

export interface AllData {
    news: News[];
    clients: Client[];
    stocks: Stock[];
}