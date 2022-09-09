const Axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');

const getNewEntries = async (url, xmlPath) => {
	const xml = await Axios.get(url);
	let oldXml;
	try {
		oldXml = fs.readFileSync(path.join(__dirname, xmlPath), { encoding: "utf8" });
	} catch (e) {
		oldXml = "";
	}
	// Convert both XMLs to JSON
	const oldJson = xml2js.parseStringSync(oldXml);
	const newJson = xml2js.parseStringSync(xml.data);

	console.log(oldJson);

	// Homework entries are in the feed.entry array
	const oldEntries = oldJson.feed.entry;
	const newEntries = newJson.feed.entry;

	// Compare the two arrays
	const newEntriesArray = [];
	for (let i = 0; i < newEntries.length; i++) {
		let isNew = true;
		for (let j = 0; j < oldEntries.length; j++) {
			if (newEntries[i].id[0] === oldEntries[j].id[0]) {
				isNew = false;
				break;
			}
		}
		if (isNew) {
			newEntriesArray.push(newEntries[i]);
		}
	}

	// Write the new XML to the file
	fs.writeFileSync(path.join(__dirname, "..", "feeds", xmlPath), xml.data, { encoding: "utf8" });
	return newEntriesArray;
}

module.exports = getNewEntries;