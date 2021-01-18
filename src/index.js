const tzhm = document.getElementById("tzhm");
const tzhmtz = document.getElementById("tzhm-tz");
const moment = require("moment-timezone");
const helpers = require("./helpers.json");
const participants = require("./participants.json");
const startTime = "2021-01-25T08:00:00";
const endTime = "2021-01-29T18:00:00";
const workshopDays = moment(endTime).diff(moment(startTime), "days") + 1;
const startMoment = moment(startTime);
// todo: this ensures we finish the last hours of the last tz. todo: calc.
const magicHours = 8;

// import things
import "./style.css";
import { peopleWorkingThen, relativeWorkingHours, leftpad, onlyUnique, getContrastColor, daysOfWeek } from "./lib.js";

// We'll calculate the time in each of these.
var tzExtra = [...Object.keys(participants), ...helpers.map(x => x.TZ)].filter(onlyUnique);
tzExtra.sort((a, b) => moment.tz.zone(a).utcOffset(startMoment) > moment.tz.zone(b).utcOffset(startMoment));
const tzDisplay = tzExtra;

var tzMap = tzDisplay.map(tz => {
	var converted = [...Array(24 * workshopDays + magicHours).keys()].map(hourN => {
		var hour = leftpad("" + hourN, 2, "0"),
			convertedTime = moment
				.tz(startTime, tzDisplay[0])
				.tz(tz)
				.add(hourN, "hours"),
			h = parseInt(convertedTime.format("H"));

		if (h === 0) {
			return convertedTime.format("MMM D YYYY").split(" ");
		} else {
			return convertedTime.format("HH mm").split(" ");
		}
	});
	return [tz, moment.tz(startTime, tzDisplay[0]).tz(tz), ...converted];
});

// Create the table for every timezone.
tzMap.forEach(row => {
	// City
	var elrow2 = document.createElement("tr");
	elrow2.id = "r_" + row[0];
	tzhmtz.appendChild(elrow2);
	// The cell
	var elcell = document.createElement("td");
	elcell.innerHTML = `<div class="city">${row[0]}</div><div class="offset">${row[1].format()}</div>`;
	elrow2.append(elcell);
	// Helpers
	var el_helpers = document.createElement("td");
	el_helpers.id = `h_${row[0]}`;
	el_helpers.innerHTML = `0`;
	el_helpers.classList.add("tzt");
	elrow2.append(el_helpers);
	// Participants
	var el_participants = document.createElement("td");
	el_participants.id = `p_${row[0]}`;
	el_participants.innerHTML = `0`;
	el_participants.classList.add("tzt");
	elrow2.append(el_participants);
	console.log(row[0], row[1].format("DD"));

	// Timezones
	var elrow = document.createElement("tr");
	elrow.id = "r_" + row[0];
	tzhm.appendChild(elrow);
	var mutTime = moment(row[1]);

	var tzLocalStart = moment.tz(startTime, row[0]),
		tzLocalEnd = moment.tz(endTime, row[0]);

	// For each hour of the event.
	row.slice(2).forEach((timePoint, index) => {
		var elcell = document.createElement("td");

		var timeDay = mutTime.tz(row[0]);
		var isBefore = mutTime.tz(row[0]).isBefore(tzLocalStart),
			isAfter = mutTime.tz(row[0]).isAfter(tzLocalEnd);

		elcell.classList.add(`c_${mutTime.tz("UTC").format("DD_HH")}`);
		if (isBefore) {
			elcell.classList.add(`before_start`);
		} else if (isAfter) {
			elcell.classList.add(`after_end`);
		} else {
			elcell.classList.add(`during`);
		}

		// Increase hours, unfortunately modifies own object.
		mutTime.add(1, "hours");

		if (timePoint[1] === "00") {
			elcell.innerHTML = `<span class="h">${timePoint[0]}</span>`;
		} else if (timePoint.length === 3) {
			elcell.innerHTML = `<div class="mon">${timePoint[0]}</div><div class="day">${timePoint[1]}</div>`;
		} else {
			elcell.innerHTML = `<span class="h">${timePoint[0]}</span><span class="m">${timePoint[1]}</span>`;
		}
		elrow.append(elcell);

		var cH = parseInt(timePoint[0]);
		elcell.classList.add("tzt");
		if (cH >= 8 && cH < 20) {
			elcell.classList.add("work");
		} else {
			elcell.classList.add("sleep");
		}
	});
});

var collectedHelpers = peopleWorkingThen(helpers);
var maxHelpers = Math.max(...Object.keys(collectedHelpers).map(x => collectedHelpers[x].length));

var collectedParticipants = peopleWorkingThen(relativeWorkingHours(participants));
var maxParticipants = Math.max(...Object.keys(participants).map(k => participants[k]));
var maxParticipantsTZ = Math.max(...Object.keys(collectedParticipants).map(x => collectedParticipants[x].length));

// Heatmap participants
Object.keys(participants).forEach(tz => {
	var p = document.getElementById(`p_${tz}`);
	var p_count = participants[tz];
	p.innerHTML = p_count;
	p.setAttribute("title", `${p_count} Participants`);
	var pct = p_count / maxParticipants;
	p.style.background = `rgba(0, 0, 255, ${pct})`;
	p.style.color = getContrastColor(0, 0, 255, pct);
});

// Heatmap helpers
helpers.forEach(helper => {
	// Count our helpers
	var h = document.getElementById(`h_${helper.TZ}`);
	var h_count = parseInt(h.innerHTML) + 1;
	h.innerHTML = h_count;
	h.setAttribute("title", `${h_count} Helpers`);
	var pct = h_count / maxHelpers;
	h.style.background = `rgba(0, 255, 0, ${pct})`;
	h.style.color = getContrastColor(0, 255, 0, pct);
});

var colHelpersKeys = Object.keys(collectedHelpers);
var colParticipantsKeys = Object.keys(collectedParticipants);

[...colHelpersKeys, ...colParticipantsKeys].filter(onlyUnique).forEach(k => {
	// var pct = collectedHelpers[k].length / maxHelpers;
	var hl = collectedHelpers[k].length,
		pl = collectedParticipants[k].length;
	var pct = hl / pl;
	var peeps = collectedHelpers[k].filter(onlyUnique).join(", ");

	document.querySelectorAll(`.${k}.work.during`).forEach(x => {
		x.style.background = `rgba(0, 255, 0, ${pct})`;
		x.setAttribute("title", `Ratio: ${hl}:${pl}, Instructors ${peeps}`);
	});
});

window.moment = moment;
