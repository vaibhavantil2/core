import { Glue42Web } from "@glue42/web";
import { Glue42 } from "@glue42/desktop";
import { handleTransactionOpen, openWorkspace } from "./notification.handlers";
import { Client } from "shared/interfaces/ng-interfaces";

export const start = async (glue: Glue42Web.API | Glue42.Glue, config: any): Promise<void> => {
    const mOnePr = glue.interop.register("handleDefault", (args) => {
        handleTransactionOpen(glue, args);
    });

    const mTwoPr = glue.interop.register("handleNewWsp", (args) => {
        openWorkspace(glue, (args.data.client as Client), true);
    });

    const mThreePr = glue.interop.register("handleExistingWsp", (args) => {
        openWorkspace(glue, (args.data.client as Client), false);
    });

    const ws = new WebSocket('ws://localhost:4224');

    ws.onmessage = async (data) => {
        const notificationData = JSON.parse(data.data).notification;

        const frames = await glue.workspaces.getAllFrames();
        const actions = frames.length ?
            [
                {
                    action: 'newWsp',
                    title: 'New Frame',
                    interop: {
                        method: "handleNewWsp",
                        arguments: notificationData
                    }
                },
                {
                    action: 'existingWsp',
                    title: 'Reuse Frame',
                    interop: {
                        method: "handleExistingWsp",
                        arguments: notificationData
                    }
                }
            ] :
            [];

        const options: Glue42Web.Notifications.RaiseOptions = {
            title: notificationData.title,
            clickInterop: {
                method: "handleDefault",
                arguments: notificationData
            },
            body: notificationData.description,
            data: notificationData.data,
            icon: notificationData.image ? `/common/images/${notificationData.image}` : '/common/icons/192x192.png',
            badge: notificationData.image ? `/common/images/${notificationData.image}` : '/common/icons/192x192.png',
            image: '/common/images/glue42-logo-light.png',
            actions: notificationData.data.type === "openClient" ? actions : undefined
        };

        await glue.notifications.raise(options as any);
    };

    await Promise.all([mOnePr, mTwoPr, mThreePr]);

    if ((window as any).glue42gd) {
        return;
    }

    const sw = await config.sw;

    const subOptions = {
        userVisibleOnly: true,
        applicationServerKey: 'BBSl8XfJ0039yNWr8VgOBjCgiGlM512hj6-8sTdISKguwoLZf3EKoLojoi8j5NSHtMVdMm0EAXZ_tj_F9qBIpcg'
    };

    const pushSub = await sw.pushManager.subscribe(subOptions);

    await fetch('http://localhost:4224/api/push-sub', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(pushSub.toJSON())
    });

    console.log("all configured, with interop");
}