const fs = require('fs');
const path = require('path');

let validClassNames = [
	"apcs-mykolyk",
	"systems-dw",
	"graphics-dw",
	"softdev-mykolyk",
	"staging"
]

let urls = [
	"https://www.stuycs.org/apcs-mykolyk/feed.xml",
	"https://www.stuycs.org/systems-dw/feed.xml",
	"https://www.stuycs.org/graphics-dw/feed.xml",
	"https://www.stuycs.org/softdev-mykolyk/feed.xml",
	"https://stuycs-bot-test.thundrredstar.repl.co/feed.xml"
]

module.exports = (app) => {
	app.on("issues.opened", async (context) => {
		// Parse the issue body to check if the bot was mentioned and if the issue contains a valid class name.
		const issueBody = context.payload.issue.body;
		const issueBodyLines = issueBody.split(" ");
		const botMentioned = issueBodyLines[0] === "@stuycs-bot";
		const className = issueBodyLines[1];

		// If the bot was mentioned and the class name is valid, create a new issue.
		if (botMentioned && validClassNames.includes(className)) {
			// Get the object corresponding with all the repositories for the class.
			const data = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", `data.json`), { encoding: "utf8" }));
			// Create a new object to store the new repo info.
			let newRepoInfo = {};
			// Get the repo name and owner from the issue.
			const repoName = context.payload.repository.name;
			const repoOwner = context.payload.repository.owner.login;
			// Check if the repo is already in the data.
			let repoAlreadyInData = false;
			for (let repo of data[className]) {
				if (repo.repo === repoName && repo.owner === repoOwner) {
					repoAlreadyInData = true;
				}
			}
			// If the repo is not already in the data, add it.
			if (!repoAlreadyInData) {
				newRepoInfo.repo = repoName;
				newRepoInfo.owner = repoOwner;
				data[className].push(newRepoInfo);
				// Write the new data to the file.
				fs.writeFileSync(path.join(__dirname, "..", "data", `data.json`), JSON.stringify(data, null, 4), { encoding: "utf8" });
			}
			// If it was successfully added, add a comment to the issue.
			if (!repoAlreadyInData) {
				context.octokit.issues.createComment(context.issue({
					body: `Added ${repoOwner}/${repoName} to the list of repositories for ${className}.`
				}));
			}
		}
	});
};