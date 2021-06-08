const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');

const webpush = require('web-push');

const API_URL_PREFIX = '/api';

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const subs = [];

const vapidKeys = {
    publicKey: 'BBSl8XfJ0039yNWr8VgOBjCgiGlM512hj6-8sTdISKguwoLZf3EKoLojoi8j5NSHtMVdMm0EAXZ_tj_F9qBIpcg',
    privateKey: 'N7Eq3Ebohzdn2Eqtv6J2rcHpkd2w9XT1cpwsKj42EJE'
};

webpush.setVapidDetails(
    'mailto:k.kostov.eu@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

const pushMessage = async (payload) => {

    if (wss.clients.size) {
        wss.clients.forEach((client) => client.send(JSON.stringify(payload)));
        return;
    }

    for (const sub of subs) {
        try {
            await webpush.sendNotification(sub, JSON.stringify(payload));
        } catch (error) {
            console.log('ERROR in push');
            console.log(error);
        }

        console.log(`Success push for ${sub.endpoint}`)
    }
}

app.post(`${API_URL_PREFIX}/client-call`, async (req, res) => {

    const config = req.body;

    pushMessage(config);

    res.json(JSON.stringify({ data: { success: true } }));
});

app.post(`${API_URL_PREFIX}/client-transaction`, async (req, res) => {

    const config = req.body;

    pushMessage(config);

    res.json(JSON.stringify({ data: { success: true } }));
});

app.post(`${API_URL_PREFIX}/push-sub`, (req, res) => {
    if (!subs.some((sub) => sub.keys.auth === req.body.keys.auth)) {
        subs.push(req.body);
    }
    res.json(JSON.stringify({ data: { success: true } }));
});

const port = process.env.PORT || 4224;

server.listen(port, function (error) {
    if (error) {
        throw error;
    }
    console.log(`Server listens at: ${port}`);
});
