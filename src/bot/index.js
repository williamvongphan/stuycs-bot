const fs = require('fs');
const path = require('path');
const checkForNewEntries = require("../utils/checkForNewEntries");
const parseEntryInformation = require("../utils/parseEntryInformation");

const createIssue = async function(issue, app) {
	const github = await app.auth({ type: "installation", installationId: issue.installationId });
	const owner = issue.owner; const repo = issue.repo; const title = issue.title; const body = issue.body; const assignees = issue.assignees; const labels = issue.labels
	return github.issues.create({ owner, repo, title, body, labels, assignees })
}

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
		console.log("Opened issue");
		const issueBody = context.payload.issue.body;
		const issueBodyLines = issueBody.split(" ");
		const botMentioned = issueBodyLines[0] === "@stuycs-bot";
		const className = issueBodyLines[1];

		// If the bot was mentioned and the class name is valid, create a new issue.
		if (botMentioned && validClassNames.includes(className)) {
			console.log("Bot mentioned, adding issue");
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
				newRepoInfo.installationId = context.payload.installation.id;
				data[className].push(newRepoInfo);
				// Write the new data to the file.
				fs.writeFileSync(path.join(__dirname, "..", "data", `data.json`), JSON.stringify(data, null, 4), { encoding: "utf8" });
			}
			// If it was successfully added, add a comment to the issue.
			if (!repoAlreadyInData) {
				context.octokit.issues.createComment(context.issue({
					body: `Added ${repoOwner}/${repoName} to the list of repositories for ${className}.`
				}));
			} else {
				context.octokit.issues.createComment(context.issue({
					body: `${repoOwner}/${repoName} is already in the list of repositories for ${className}.`
				}));
			}
		}

		// If the bot was mentioned and the class name is not valid, add a comment to the issue.
		if (botMentioned && !validClassNames.includes(className)) {
			context.octokit.issues.createComment(context.issue({
				body: `Invalid class name. Valid class names are: ${validClassNames.join(", ")}.`
			}));
		}
	});

	setInterval(async () => {
		console.log("Checking for new entries...");
		// Scrape the feeds for new entries.
		let targetRepos = [];
		let newEntries = {};
		newEntries["apcs-mykolyk"] = await checkForNewEntries("https://www.stuycs.org/apcs-mykolyk/feed.xml", "apcs-mykolyk.xml");
		newEntries["systems-dw"] = await checkForNewEntries("https://www.stuycs.org/systems-dw/feed.xml", "systems-dw.xml");
		newEntries["graphics-dw"] = await checkForNewEntries("https://www.stuycs.org/graphics-dw/feed.xml", "graphics-dw.xml");
		newEntries["softdev-mykolyk"] = await checkForNewEntries("https://www.stuycs.org/softdev-mykolyk/feed.xml", "softdev-mykolyk.xml");
		newEntries["staging"] = await checkForNewEntries("https://stuycs-bot-test.thundrredstar.repl.co/feed.xml", "staging.xml");

		// Now we'll fetch the data for each class and create an issue for each new entry.
		const data = JSON.parse(fs.readFileSync(path.join(__dirname, "../data", "data.json"), { encoding: "utf8" }));
		for (let className in newEntries) {
			if (newEntries[className].length > 0) {
				const repos = data[className];
				for (let entry of newEntries[className]) {
					const entryInfo = parseEntryInformation(entry);
					for (let repo of repos) {
						targetRepos.push({
							repo: repo.repo,
							owner: repo.owner,
							title: entryInfo.title,
							body: entryInfo.content,
							installationId: repo.installationId
						});
					}
				}
			}
		}

		console.log("There were a total of " + newEntries["apcs-mykolyk"].length + " new entries for APCS.");
		console.log("There were a total of " + newEntries["systems-dw"].length + " new entries for Systems.");
		console.log("There were a total of " + newEntries["graphics-dw"].length + " new entries for Graphics.");
		console.log("There were a total of " + newEntries["softdev-mykolyk"].length + " new entries for SoftDev.");
		console.log("There were a total of " + newEntries["staging"].length + " new entries for Staging.");

		console.log("There were a total of " + targetRepos.length + " new issues to create.");

		// Now we'll create the issues.
		for (let repo of targetRepos) {
			await createIssue(repo, app);
		}

		console.log("Done!");
	}, 10_000);
};