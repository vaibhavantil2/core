const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const webpush = require('web-push');

const API_URL_PREFIX = '/api';

const app = express();

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

const transporter = nodemailer.createTransport({
    port: 465,               // true for 465, false for other ports
    host: "smtp.gmail.com",
    auth: {
        user: 'tick42.email.test@gmail.com',
        pass: 't!Ck4224',
    },
    secure: true,
});

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

const queueEmailProc = (payload) => {

    const clientFirstName = payload.notification.data.client.firstName;
    const type = payload.notification.data.type;

    const message = type === "openClient" ?
        `was calling` : `made a new transaction`;

    const mailData = {
        from: 'tick42.email.test@gmail.com',
        to: 'tick42.email.test@gmail.com',
        subject: 'Client Notification',
        html: `<b>Hey there!</b> <p>${clientFirstName} ${message}. <a href="http://localhost:8080/?client=${clientFirstName.toLowerCase()}&type=${type}">Click HERE</a> to check it out.</p>`
    };

    transporter.sendMail(mailData, (err) => {
        if (err) {
            console.log("error sending mail");
            console.log(err);
            return;
        }

        console.log("successful email send");
    });

};

const pushMessage = async (payload) => {

    console.log(payload);
    if (payload.email) {
        return queueEmailProc(payload);
    }

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
    console.log("CLIENT CALL");
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

app.post(`${API_URL_PREFIX}/notification-delivered`, (req, res) => {

    const config = req.body;

    console.log(`got push response`);
    console.log(config);

    if (emailTriggers[config.id]) {
        console.log("removing the timoeut");
        clearInterval(emailTriggers[config.id]);
        delete emailTriggers[config.id];
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
