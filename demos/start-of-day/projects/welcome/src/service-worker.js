importScripts("/web.worker.umd.js");

/* eslint-disable no-restricted-globals */
self.addEventListener('activate', async () => {
    self.clients.claim();
    console.log('service worker activate');
});

self.addEventListener("fetch", function (event) {
    //console.log("??", "fetch", event);
    // event.respondWith(fetch(event.request));
});

self.addEventListener('push', function (event) {

    const notificationData = event.data.json().notification;

    const options = {
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
    };

    const promiseChain = self.raiseGlueNotification(options);

    event.waitUntil(promiseChain);
});

self.GlueWebWorker({
    platform: {
        url: "http://localhost:8080/",
        openIfMissing: true
    }
});
