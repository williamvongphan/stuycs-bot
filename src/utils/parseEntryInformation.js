module.exports = function parseEntryInformation (entry) {
	// Entry is a JSON object coming directly from xml2js
	let formattedEntry = {};
	formattedEntry.title = entry.title[0]["_"];
	formattedEntry.link = entry.link[0]["$"].href;
	formattedEntry.content = entry.content[0]["_"];
	let temp = entry.summary[0]["_"].split("Estimated");
	formattedEntry.dueDate = temp[0].trim();
	if (temp.length > 1) {
		formattedEntry.estimatedTime = temp[1].trim();
	}
	return formattedEntry;
}