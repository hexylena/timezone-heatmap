const moment = require("moment-timezone");

// https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color/58427960#58427960
export const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const workingHours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
export function getContrastColor(R, G, B, A) {
	const brightness = R * 0.299 + G * 0.587 + B * 0.114 + (1 - A) * 255;
	return brightness > 186 ? "#000000" : "#FFFFFF";
}

export function onlyUnique(value, index, self) {
	return self.indexOf(value) === index;
}

export function leftpad(str, len, ch) {
	str = String(str);
	var i = -1;
	if (!ch && ch !== 0) ch = " ";
	len = len - str.length;
	while (++i < len) {
		str = ch + str;
	}
	return str;
}

export function peopleWorkingThen(people) {
	/*
	 * [
	 *   {'name': 'Helena', // optional
	 *    'TZ': 'Europe/Amsterdam',
	 *    'Monday': [],
	 *    'Tuesday': [8, 9, 10, 11, 12],
	 *    'Wednesday': [13, 14, 15],
	 *    'Thursday': [],
	 *    'Friday': [],
	 *    }
	 * ]
	 **/
	var namesByClass = {};
	people.forEach(person => {
		daysOfWeek.forEach((day, index) => {
			if (person[day] === undefined) {
				return;
			}
			person[day].forEach(hour => {
				var lpH = leftpad(hour, 2, "0");
				// TODO: hardcoded time
				var hm = moment.tz(`2021-01-25T${lpH}:00:00`, person.TZ).add(index, "days");
				var cls = "c_" + hm.format("DD") + "_" + hm.tz("UTC").format("HH");

				if (namesByClass[cls] === undefined) {
					namesByClass[cls] = [];
				}
				if (person.Name) {
					namesByClass[cls].push(person.Name);
				} else {
					namesByClass[cls].push(true);
				}
			});
		});
	});
	return namesByClass;
}

export function relativeWorkingHours(participants) {
	var final = [];
	Object.keys(participants).forEach(tz => {
		var count = participants[tz];
		for (var i = 0; i < count; i++) {
			final.push({
				TZ: tz,
				Monday: workingHours,
				Tuesday: workingHours,
				Wednesday: workingHours,
				Thursday: workingHours,
				Friday: workingHours
			});
		}
	});
	return final;
}

export function tzTable(tzDisplay, workshopDays, magicHours, startTime) {
	return tzDisplay.map(tz => {
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
}

export function renderTable(tzMap, userTZ, startTime, endTime, now) {
	const tzhm = document.getElementById("tzhm");
	const tzhmtz = document.getElementById("tzhm-tz");

	tzMap.forEach(row => {
		// City
		var elrow2 = document.createElement("tr");
		elrow2.id = "r_" + row[0];
		tzhmtz.appendChild(elrow2);
		if (row[0] === userTZ) {
			elrow2.classList.add("viewer");
		}
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
		//console.log(row[0], row[1].format("DD"));

		// Timezones
		var elrow = document.createElement("tr");
		elrow.id = "tr_" + row[0];
		if (row[0] === userTZ) {
			elrow.classList.add("viewer");
		}
		tzhm.appendChild(elrow);
		var mutTime = moment(row[1]);

		var tzLocalStart = moment.tz(startTime, row[0]),
			tzLocalEnd = moment.tz(endTime, row[0]);

		// For each hour of the event.
		row.slice(2).forEach((timePoint, index) => {
			var elcell = document.createElement("td");

			var timeDay = mutTime.tz(row[0]);
			var isBefore = timeDay.isBefore(tzLocalStart),
				isAfter = timeDay.isAfter(tzLocalEnd),
				beforeNow = timeDay.isBefore(now);

			elcell.classList.add(`c_${mutTime.tz("UTC").format("DD_HH")}`);
			if (isBefore) {
				elcell.classList.add(`before_start`);
			} else if (isAfter) {
				elcell.classList.add(`after_end`);
			} else {
				elcell.classList.add(`during`);
			}
			if (beforeNow) {
				elcell.classList.add(`thepast`);
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
}

export function heatmapThings(participants, helpers) {
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
		document.querySelectorAll(`.${k}.work.during.thepast`).forEach(x => {
			x.style.background = `rgba(0, 0, 0, ${pct})`;
			x.setAttribute("title", `Ratio: ${hl}:${pl}, Instructors ${peeps}`);
		});
	});
}

export function combinationTimeZoneHeatMap(config, helpers, participants) {
	const userTZ = moment.tz.guess();
	const now = moment.tz(userTZ);
	const magicHours = 8;

	const startTime = config.start;
	const endTime = config.end;
	const workshopDays = moment(endTime).diff(moment(startTime), "days") + 1;
	const startMoment = moment(startTime);

	var newtitle = `Time Zone Heat Map: ${config.title}`;
	document.getElementById('title').textContent = newtitle;
	document.title = newtitle;

	// We'll calculate the time in each of these.
	var tzDisplay = [...Object.keys(participants), ...helpers.map(x => x.TZ), userTZ].filter(onlyUnique);
	tzDisplay.sort((a, b) => moment.tz.zone(a).utcOffset(startMoment) > moment.tz.zone(b).utcOffset(startMoment));

	// Table
	var tzMap = tzTable(tzDisplay, workshopDays, magicHours, startTime);

	// Create the table for every timezone.
	renderTable(tzMap, userTZ, startTime, endTime, now);

	// Heatmap things to make them pretty
	heatmapThings(participants, helpers);

	// Scroll to the right position
	var nowCls = `c_${now.tz("UTC").format("DD_HH")}`;
	document.querySelectorAll(`#tzhm tr.viewer .${nowCls}`)[0].scrollIntoView({ behavior: "smooth", block: "end", inline: "start" });
}
