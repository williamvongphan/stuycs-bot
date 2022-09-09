const Axios = require('axios');
const xml2js = require('xml2js');

(async () => {
	const xml = await Axios.get('https://www.stuycs.org/apcs-mykolyk/feed.xml');
	let xmlString = xml.data;
	let json = await xml2js.parseStringPromise(xmlString);
	console.log(JSON.stringify(json, null, 2));
})();