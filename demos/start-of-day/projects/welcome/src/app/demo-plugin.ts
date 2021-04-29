import { Glue42Web } from "@glue42/web";
import { Glue42 } from "@glue42/desktop";
import shortid from 'shortid';
import { Glue42Workspaces } from "@glue42/workspaces-api";
import { Client } from "shared/interfaces/ng-interfaces";

const getWorkspaceWithClient = async (glue: Glue42Web.API | Glue42.Glue, client: Client): Promise<{ wsp: Glue42Workspaces.Workspace, ctxId: string } | undefined> => {
    const clientApps = glue.appManager.application("clients").instances;

    if (!clientApps.length) {
        return;
    }

    for (const app of clientApps) {
        const ctx = await app.getContext();
        const ctxId = (ctx as any).contextId;

        const ctxClientName = (await glue.contexts.get(ctxId)).client.firstName;

        if (ctxClientName.toLowerCase() !== client.firstName.toLowerCase()) {
            return;
        }

        const wsp = await glue.workspaces.getWorkspace((wsp) => !!wsp.getWindow((w) => w.id === app.id));

        return { wsp, ctxId };
    }
};

const openWorkspace = async (glue: any, client: Client, newFrame: boolean, addTransactions?: boolean): Promise<void> => {
    let contextId = shortid();
    await glue.contexts.set(contextId, { client, contextId, selectedStockSymbol: null });

    const frames = await glue.workspaces.getAllFrames();
    const frame = newFrame ? { newFrame: true } : { reuseFrameId: frames.length ? frames[0].id : undefined }

    const builderConfig: Glue42Workspaces.BuilderConfig = {
        type: "workspace",
        definition: { frame }
    };

    const builder = glue.workspaces.getBuilder(builderConfig) as Glue42Workspaces.WorkspaceBuilder;

    const topRow = builder.addRow();
    topRow.addGroup().addWindow({ appName: "clients", context: { contextId } });

    const innerColumn = topRow.addColumn();

    innerColumn.addGroup().addWindow({ appName: "portfolio", context: { contextId } });
    innerColumn.addGroup().addWindow({ appName: "news", context: { contextId } });

    if (addTransactions) {
        topRow.addGroup().addWindow({ appName: "transactions", context: { contextId } });
    }

    await builder.create();
}

export const start = async (glue: Glue42Web.API | Glue42.Glue): Promise<void> => {
    const sw = await navigator.serviceWorker.register('/service-worker.js');

    const permission = await window.Notification.requestPermission();

    if (permission !== 'granted') {
        console.error('Permission not granted for Notifications');
    }

    const channel = new BroadcastChannel('sw-messages');
    channel.addEventListener('message', async (event) => {

        if (event.data.type === "transactionsOpen") {
            const client = event.data.client as Client;
            const match = await getWorkspaceWithClient(glue, client);

            if (!match) {
                await openWorkspace(glue, client, true, true);
                return;
            }

            await match.wsp.frame.focus();
            await match.wsp.focus();

            const transactionsExist = match.wsp.getWindow((w) => w.appName === "transactions");

            if (transactionsExist) {
                return;
            }

            await match.wsp.addGroup({children: [{ type: "window", appName: "transactions", context: { contextId: match.ctxId } }]});
        }

        if (event.data.type === "newWsp") {
            const client = event.data.client as Client;
            await openWorkspace(glue, client, true);
        }

        if (event.data.type === "existingWsp") {
            const client = event.data.client as Client;
            await openWorkspace(glue, client, false);
        }

    });

    await glue.interop.register("T42.GNS.Publish.RaiseNotification", async (args: any) => {

        const notificationData = args.notification;

        const frames = await glue.workspaces.getAllFrames();
        const actions = frames.length ?
            [
                {
                    action: 'newWsp',
                    title: 'New Frame'
                },
                {
                    action: 'existingWsp',
                    title: 'Reuse Frame'
                }
            ] :
            [
                {
                    action: 'newWsp',
                    title: 'Open Client'
                }
            ];

        const title = notificationData.title;
        const options = {
            body: notificationData.description,
            data: notificationData.data,
            icon: notificationData.image ? `/common/images/${notificationData.image}` : '/common/icons/192x192.png',
            badge: notificationData.image ? `/common/images/${notificationData.image}` : '/common/icons/192x192.png',
            image: '/common/images/glue42-logo-light.png',
            actions: notificationData.type === "openClient" ? actions : undefined
        };

        sw.showNotification(title, options);

    });

    glue.appManager.application('trigger').start(undefined, { top: 100, left: 100, width: 700, height: 400 });

}