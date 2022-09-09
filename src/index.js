const { Server, Probot } = require("probot");
const app = require("./bot/index.js");
const fs = require('fs');

const privateKey = fs.readFileSync(__dirname + '/data/private-key.pem', 'utf8')
const config = require("./data/config.json");

async function startServer() {
    const server = new Server({
        Probot: Probot.defaults({
            appId: config.appId,
            privateKey: privateKey,
            secret: config.secret,
        }),
    });

    await server.load(app);

    server.start();
}

startServer();