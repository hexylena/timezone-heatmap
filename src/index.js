const moment = require("moment-timezone");
/*const helpers = require("./helpers.json");*/
/*const config = require("./config.json");*/
/*const participants = require("./participants.json");*/
// todo: this ensures we finish the last hours of the last tz. todo: calc.

// import things
import "./style.css";
import { combinationTimeZoneHeatMap } from "./lib.js";

// Fetch
const request = new Request("data.json");
fetch(request)
	.then(response => response.json())
	.then(data => {
		combinationTimeZoneHeatMap(data["src/config.json"], data["src/helpers.json"], data["src/participants.json"]);
	});
