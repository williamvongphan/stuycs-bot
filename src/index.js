const checkForNewEntries = require('./utils/checkForNewEntries');
const parseEntryInformation = require('./utils/parseEntryInformation');
const fs = require('fs');
const path = require('path');

const bot = require('./bot/index');

// Every minute, check for new entries in the feeds.
setInterval(async () => {
	// Scrape the feeds for new entries.
	let targetRepos = [];
	let newEntries = {};
	newEntries["apcs-mykolyk"] = await checkForNewEntries("https://www.stuycs.org/apcs-mykolyk/feed.xml", "apcs-mykolyk.xml");
	newEntries["systems-dw"] = await checkForNewEntries("https://www.stuycs.org/systems-dw/feed.xml", "systems-dw.xml");
	newEntries["graphics-dw"] = await checkForNewEntries("https://www.stuycs.org/graphics-dw/feed.xml", "graphics-dw.xml");
	newEntries["softdev-mykolyk"] = await checkForNewEntries("https://www.stuycs.org/softdev-mykolyk/feed.xml", "softdev-mykolyk.xml");
	newEntries["staging"] = await checkForNewEntries("https://stuycs-bot-test.thundrredstar.repl.co/feed.xml", "staging.xml");

	// Now we'll fetch the data for each class and create an issue for each new entry.
	const data = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "data.json"), { encoding: "utf8" }));
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
					});
				}
			}
		}
	}

	// Now we'll create the issues.
	for (let repo of targetRepos) {

	}
});
