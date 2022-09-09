const toXML = require("to-xml").toXML;

module.exports = function parseEntryInformation (entry) {
	// Entry is a JSON object coming directly from xml2js
	let formattedEntry = {};
	entry.content[0].p = entry.content[0]._;
	delete entry.content[0].$;
	delete entry.content[0]._;
	formattedEntry.title = entry.title[0]["_"];
	formattedEntry.link = entry.link[0]["$"].href;
	formattedEntry.content = toXML(entry.content[0]).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
	let temp = entry.summary[0]["_"].split("Estimated");
	formattedEntry.dueDate = temp[0].trim();
	if (temp.length > 1) {
		formattedEntry.estimatedTime = temp[1].trim();
	}

	console.log(formattedEntry);
	return formattedEntry;
}