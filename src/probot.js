const { Server, Probot } = require("probot");
const app = require("./index.js");

async function startServer() {
	const server = new Server({
		Probot: Probot.defaults({
			appId: 236373,
			privateKey: "soon",
			secret: "soon",
		}),
	});

	await server.load(app);

	server.start();
}