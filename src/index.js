const moment = require("moment-timezone");
/*const helpers = require("./helpers.json");*/
/*const config = require("./config.json");*/
/*const participants = require("./participants.json");*/
// todo: this ensures we finish the last hours of the last tz. todo: calc.

// import things
import "./style.css";
import { combinationTimeZoneHeatMap } from "./lib.js";


const params = (new URL(document.location)).searchParams;
const dataLocation = params.get('data')
const isLive = params.get('live') !== 'false';

// Fetch
const request = new Request(dataLocation || "gat.json");
fetch(request)
	.then(response => response.json())
	.then(data => {
		combinationTimeZoneHeatMap(data["src/config.json"], data["src/helpers.json"], data["src/participants.json"], isLive);
	})
	.catch((error) => {
		console.log(error);
		document.getElementById('messages').innerHTML = `Error: Could not access ${dataLocation}`
		combinationTimeZoneHeatMap(data["src/config.json"], data["src/helpers.json"], data["src/participants.json"], isLive);
	})
