const Axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');

function parseXml(xml) {
	return new Promise((resolve, reject) => {
		xml2js.parseString(xml, (err, result) => {
			if (err) {
				reject(err);
			} else {
				resolve(result);
			}
		});
	});
}

const getNewEntries = async (url, xmlPath) => {
	const xml = await Axios.get(url);
	let oldXml;
	try {
		oldXml = fs.readFileSync(path.join(__dirname, "../feeds", xmlPath), { encoding: "utf8" });
	} catch (e) {
		oldXml = "";
	}
	// Convert both XMLs to JSON
	const oldJson = await parseXml(oldXml);
	const newJson = await parseXml(xml.data);

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