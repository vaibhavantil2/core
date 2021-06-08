import { Glue42Web } from "@glue42/web";
import { Glue42 } from "@glue42/desktop";
import { Client } from "shared/interfaces/ng-interfaces";
import { Glue42Workspaces } from "@glue42/workspaces-api";
import shortid from 'shortid';

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

export const handleTransactionOpen = async (glue: Glue42Web.API | Glue42.Glue, definition: Glue42Web.Notifications.NotificationDefinition) => {

    if (definition.data.type === "openClient") {
        return openWorkspace(glue, definition.data.client, true);
    }

    const client = definition.data.client as Client;
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

    await match.wsp.addGroup({ children: [{ type: "window", appName: "transactions", context: { contextId: match.ctxId } }] });
}

export const openWorkspace = async (glue: any, client: Client, newFrame: boolean, addTransactions?: boolean): Promise<void> => {
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
