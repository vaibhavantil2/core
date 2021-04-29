/* eslint-disable no-restricted-globals */
self.addEventListener('activate', async () => {
  self.clients.claim();
  console.log('service worker activate');
});

self.addEventListener("fetch", function (event) {
  //console.log("??", "fetch", event);
  // event.respondWith(fetch(event.request));
});

self.addEventListener('notificationclick', function (event) {
  const action = event.action;

  if (!action) {
    const client = event.notification.data.client;
    const channel = new BroadcastChannel('sw-messages');
    channel.postMessage({ type: "transactionsOpen", client });
    return;
  }

  if (action === 'newWsp') {
    const client = event.notification.data.client;
    const channel = new BroadcastChannel('sw-messages');
    channel.postMessage({ type: "newWsp", client });
  }

  if (action === 'existingWsp') {
    const client = event.notification.data.client;
    const channel = new BroadcastChannel('sw-messages');
    channel.postMessage({ type: "existingWsp", client });
  }
});