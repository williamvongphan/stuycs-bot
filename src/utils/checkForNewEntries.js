const Axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');

function cleanXml(xml) {
	// Replace weird HTML notations with actual characters
	let thingsToReplace = {
		"&amp;": "&",
		"&lt;": "<",
		"&gt;": ">",
		"&quot;": "\"",
		"&apos;": "'",
	};

	for (let key in thingsToReplace) {
		xml = xml.replace(new RegExp(key, "g"), thingsToReplace[key]);
	}

	return xml;
}

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
	let oldJson;
	let newJson;
	try {
		oldJson = await parseXml(oldXml);
		newJson = await parseXml(xml.data);
	} catch (e) {
		console.log("There's something wrong with the XML. Not saving.");
		console.log(e);
	}

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
			console.log(newEntries[i]);
		}
	}

	// Write the new XML to the file
	fs.writeFileSync(path.join(__dirname, "..", "feeds", xmlPath), xml.data, { encoding: "utf8" });
	return newEntriesArray;
}

module.exports = getNewEntries;