export class GtfPuppet {
    private readonly puppetWsBridgeUrl = "ws://localhost:9997";
    private readonly puppetHttpBridgeUrl = "http://localhost:9997/command";
    private socket!: WebSocket;

    public start(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket = new WebSocket(this.puppetWsBridgeUrl);

            this.socket.addEventListener("message", (event) => {
                const parsedMessage = JSON.parse(event.data);

                this.handleBridgeMessage(parsedMessage);
            });

            this.socket.onopen = () => {
                this.sendWS({ gtf: true });
                resolve();
            };

            setTimeout(() => reject("GTF Puppet could not start."), 5000);
        })
    }

    public tryServer() {
        //
    }

    private handleBridgeMessage(message: any): void {
        //
    }

    private async sendHttp(message: any): Promise<any> {

        const rawResponse = await fetch(this.puppetHttpBridgeUrl, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            mode: "cors",
            cache: "no-cache",
            body: JSON.stringify(message)
        });

        const content = await rawResponse.json();

        return content;
    }

    private sendWS(message: any): void {
        this.socket.send(JSON.stringify(message));
    }
}
