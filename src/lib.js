const moment = require("moment-timezone");

// https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color/58427960#58427960
export const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const workingHours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const arraySum = (accumulator, currentValue) => accumulator + currentValue;
export function getContrastColor(R, G, B, A) {
	const brightness = R * 0.299 + G * 0.587 + B * 0.114 + (1 - A) * 255;
	return brightness > 186 ? "#000000" : "#FFFFFF";
}

const DEFAULT_TZs = [
	"Africa/Abidjan", "Africa/Accra", "Africa/Algiers", "Africa/Cairo",
	"Africa/Johannesburg", "Africa/Khartoum", "Africa/Lagos", "Africa/Nairobi",
	"Africa/Windhoek", "America/Argentina/Cordoba", "America/Bogota",
	"America/Chicago", "America/Denver", "America/Edmonton", "America/Lima",
	"America/Los_Angeles", "America/Mexico_City", "America/New_York",
	"America/Santiago", "America/Sao_Paulo", "America/Toronto", "America/Winnipeg",
	"Asia/Baghdad", "Asia/Bangkok", "Asia/Damascus", "Asia/Dhaka",
	"Asia/Ho_Chi_Minh", "Asia/Hong_Kong", "Asia/Jakarta", "Asia/Jerusalem",
	"Asia/Karachi", "Asia/Kathmandu", "Asia/Kolkata", "Asia/Kuala_Lumpur",
	"Asia/Manila", "Asia/Qatar", "Asia/Riyadh", "Asia/Seoul", "Asia/Shanghai",
	"Asia/Singapore", "Asia/Tehran", "Asia/Tokyo", "Australia/Melbourne",
	"Australia/Sydney", "Europe/Amsterdam", "Europe/Athens", "Europe/Belgrade",
	"Europe/Berlin", "Europe/Bucharest", "Europe/Budapest", "Europe/Copenhagen",
	"Europe/Dublin", "Europe/Istanbul", "Europe/Kiev", "Europe/Lisbon",
	"Europe/London", "Europe/Madrid", "Europe/Malta", "Europe/Moscow",
	"Europe/Oslo", "Europe/Paris", "Europe/Prague", "Europe/Riga", "Europe/Rome",
	"Europe/Sofia", "Europe/Tallinn", "Europe/Warsaw",
	"Pacific/Auckland"
];

export function onlyUnique(value, index, self) {
	return self.indexOf(value) === index;
}

var memo = {};

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

export function memoPersonWorking(fmtStart, hour, tz, index){
	var k = `${fmtStart}/${hour}/${tz}/${index}`;
	if(!(k in memo)){
		var hm = moment.tz(`${fmtStart}T${leftpad(hour, 2, "0")}:00:00`, tz).add(index, "days");
		var cls = "c_" + hm.format("DD") + "_" + hm.tz("UTC").format("HH");
		memo[k] = cls;
	}
	return memo[k];
}

export function peopleWorkingThen(people, startTime) {
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
	const fmtStart = moment(startTime).format('YYYY-MM-DD');

	var namesByClass = {};
	people.forEach(person => {
		if(person.TZ == 'Pacific/Auckland') {
			console.log(person)
		}
		daysOfWeek.forEach((day, index) => {
			if(person.TZ == 'Pacific/Auckland') {
				console.log('  ', day, index)
			}
			if (person[day] === undefined) {
				return;
			}
			person[day].forEach(hour => {
				var cls = memoPersonWorking(fmtStart, hour, person.TZ, index);
				if(person.TZ == 'Pacific/Auckland') {
					console.log('    ', cls);
				}

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

export function tzTable(tzDisplay, tzReduced, workshopDays, magicHours, startTime) {
	var k = Object.keys(tzReduced)
	k.sort(function( a , b ){
		return parseInt(a) < parseInt(b) ? -1 : 1;
	});
	var earliest = tzReduced[Math.min(...k)][0];
	return k.map(utcOff => {
		var repTz = tzReduced[utcOff][0];
		var inconvtime = moment
			.tz(startTime, tzDisplay[0])
			.tz(repTz);

		var converted = [...Array(24 * workshopDays + magicHours).keys()].map(hourN => {
			var convertedTime = moment(inconvtime).add(hourN, "hours"),
				h = parseInt(convertedTime.format("H"));

			if (h === 0) {
				return convertedTime.format("MMM D YYYY").split(" ");
			} else {
				return convertedTime.format("HH mm").split(" ");
			}
		});
		return [tzReduced[utcOff], moment.tz(startTime, earliest).tz(repTz), ...converted];
	})
}

export function getTzClasses(time, count){
	var mutTime = moment(time);
	return Array.from(Array(count).keys()).map((x) => {
		var m = moment(mutTime).add(x, 'hours');
		return `c_${m.tz("UTC").format("DD_HH")}`
	})
}

export function renderTable(tzMap, userTZ, startTime, endTime, now, enableTotals) {
	const tzhm = document.getElementById("tzhm");
	const tzhmtz = document.getElementById("tzhm-tz");
	const tzClasses = getTzClasses(tzMap[0][1], tzMap[0].slice(2).length);
	console.log(tzMap[0])

	var elrows = tzMap.forEach(row => {
		// Representative TZ
		var repTz = row[0][0];
		// City
		var elrow2 = document.createElement("tr");
		if (row[0][0] === userTZ) {
			elrow2.classList.add("viewer");
		}
		row[0].slice(1).forEach((tz) => { elrow2.classList.add(tz) });
		// The cell
		var elcell = document.createElement("td");
		elcell.innerHTML = `<div class="city" title="This includes ${row[0].join(', ')}">${repTz}</div><div class="offset">${row[1].format()}</div>`;
		elrow2.append(elcell);
		if(enableTotals){
			// Helpers
			var el_helpers = document.createElement("td");
			el_helpers.id = `h_${repTz}`;
			el_helpers.innerHTML = `0`;
			el_helpers.classList.add("tzt");
			elrow2.append(el_helpers);
			// Participants
			var el_participants = document.createElement("td");
			el_participants.id = `p_${repTz}`;
			el_participants.innerHTML = `0`;
			el_participants.classList.add("tzt");
			elrow2.append(el_participants);
		}
		tzhmtz.appendChild(elrow2);

		// Timezones
		var elrow = document.createElement("tr");
		elrow.id = "tr_" + repTz;
		if (row[0][0] === userTZ) {
			elrow.classList.add("viewer");
		}
		tzhm.appendChild(elrow);
		var mutTime = moment(row[1]);

		var tzLocalStart = moment.tz(startTime, repTz),
			tzLocalEnd = moment.tz(endTime, repTz);

		// For each hour of the event.
		var cells = row.slice(2).map((timePoint, index) => {

			var timeDay = mutTime.tz(repTz);
			var isBefore = timeDay.isBefore(tzLocalStart),
				isAfter = timeDay.isAfter(tzLocalEnd),
				beforeNow = timeDay.isBefore(now);

			var classes = ['tzt', tzClasses[index]];
			if (isBefore) {
				classes.push(`before_start`);
			} else if (isAfter) {
				classes.push(`after_end`);
			} else {
				classes.push(`during`);
			}
			if (beforeNow) {
				classes.push(`thepast`);
			}
			var cH = parseInt(timePoint[0]);
			if (cH >= 8 && cH < 20) {
				classes.push("work");
			} else {
				classes.push("sleep");
			}
			var elcell = `<td class="${classes.join(" ")}">`;

			// Increase hours, unfortunately modifies own object.
			mutTime.add(1, "hours");

			if (timePoint[1] === "00") {
				elcell += `<span class="h">${timePoint[0]}</span>`;
			} else if (timePoint.length === 3) {
				elcell += `<div class="mon">${timePoint[0]}</div><div class="day">${timePoint[1]}</div>`;
			} else {
				elcell += `<span class="h">${timePoint[0]}</span><span class="m">${timePoint[1]}</span>`;
			}
			return elcell + '</td>'
		});
		elrow.innerHTML = cells.join('')
	});

	if(enableTotals){
		var elrow3 = document.createElement("tr");
		tzhmtz.appendChild(elrow3);
		elrow3.innerHTML = `<td><div class="city">Totals</div></td><td id="t_h"/><td id="t_p" />`;

		var elrow4 = document.createElement("tr");
		elrow4.id = "tr_totals";
		tzhm.appendChild(elrow4);

		elrow4.innerHTML = tzClasses.map((x) => {
			return `<td class="${x}"></td>`
		}).join('')
	}

}

export function heatmapThings(participants, helpers, startTime) {
	var collectedHelpers = peopleWorkingThen(helpers, startTime);
	var maxHelpers = Math.max(...Object.keys(collectedHelpers).map(x => collectedHelpers[x].length));

	var collectedParticipants = peopleWorkingThen(relativeWorkingHours(participants), startTime);
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
	var p_sum = Object.keys(participants).map(tz => participants[tz]).reduce(arraySum);
	document.getElementById('t_p').innerHTML = p_sum

	// Heatmap helpers
	helpers.forEach(helper => {
		// Count our helpers
		var h = document.getElementById(`h_${helper.TZ}`);
		if(h === null) {
			console.log(`Could not find TZ ${helper.TZ}`)
			return;
		}
		var h_count = parseInt(h.innerHTML) + 1;
		h.innerHTML = h_count;
		h.setAttribute("title", `${h_count} Helpers`);
		var pct = h_count / maxHelpers;
		h.style.background = `rgba(0, 255, 0, ${pct})`;
		h.style.color = getContrastColor(0, 255, 0, pct);
	});
	var h_sum = helpers.length;
	document.getElementById('t_h').innerHTML = h_sum

	var colHelpersKeys = Object.keys(collectedHelpers);
	var colParticipantsKeys = Object.keys(collectedParticipants);

	var tmp = colParticipantsKeys.filter(onlyUnique).map(k => {
		return (k in collectedParticipants) ? collectedParticipants[k].length : 0;
	})
	var maxParticipantsTime = Math.max(...tmp);
	var zk = [...colParticipantsKeys].filter(onlyUnique);
	//zk.sort();
	//zk.forEach(k => { console.log(k) });

	[...colHelpersKeys, ...colParticipantsKeys].filter(onlyUnique).forEach(k => {
		// var pct = collectedHelpers[k].length / maxHelpers;
		var hl = k in collectedHelpers ? collectedHelpers[k].length : 0,
			pl = k in collectedParticipants ? collectedParticipants[k].length : 0;
		var pct = pl > 0 ? hl / pl : 0;
		var peeps = k in collectedHelpers ? collectedHelpers[k].filter(onlyUnique).join(", ") : "NONE";

		document.querySelectorAll(`.${k}.work.during`).forEach(x => {
			x.style.background = `rgba(0, 255, 0, ${pct * 10})`;
			x.setAttribute("title", `Ratio: ${hl}:${pl}, Instructors ${peeps}`);
		});
		document.querySelectorAll(`#tr_totals .${k}`).forEach(x => {
			x.style.background = `rgba(0, 0, 255, ${pl / maxParticipantsTime})`;
			x.style.color = getContrastColor(0, 0, 255, pl / maxParticipantsTime);
			x.innerHTML = pl;
		});
		document.querySelectorAll(`.${k}.work.during.thepast`).forEach(x => {
			x.style.background = `rgba(0, 0, 0, ${pct})`;
			x.setAttribute("title", `Ratio: ${hl}:${pl}, Instructors ${peeps}`);
		});
	});
}

export function coerceTimezones(folks, repTzLookup){
	if(Array.isArray(folks)){
		return folks.map((x) => {
			x.TZ = repTzLookup[x.TZ];
			return x;
		})
		console.log(folks)
		return folks;
	} else {
		var fixedParticipants = {};
		Object.keys(folks).forEach(x => {
			var k = repTzLookup[x];
			if(k in fixedParticipants){
				fixedParticipants[k] += folks[x];
			} else {
				fixedParticipants[k] = folks[x];
			}
		})
		return fixedParticipants
	}
}

export function tzhmTimepointView(date, time, tz, name){
	setTitle(`In my time: ${name}`);
	const userTZ = moment.tz.guess();
	const startTime = moment.tz(`${date}T${time}`, tz)
	const endTime = moment.tz(`${date}T${time}`, tz).add(30, 'minutes');
	const startMoment = moment(startTime);
	var [tzDisplay, tzReduced, repTzLookup] = reduceTimezones([...DEFAULT_TZs, tz, userTZ], startMoment)
	// Table
	var tzMap = tzTable(tzDisplay, tzReduced, 1, 0, moment(startTime).subtract(10, 'hours'));
	// Create the table for every timezone.
	renderTable(tzMap, repTzLookup[userTZ], startTime, endTime, tzMap[0][1], false);
}


export function reduceTimezones(inputs, startMoment){
	var tzDisplay = [...inputs].filter(onlyUnique);
	// Remove invalid timezones.
	tzDisplay = tzDisplay.filter((x) => { return moment.tz.zone(x); })
	// Sort by their utcOffset
	tzDisplay.sort((a, b) => {
		return moment.tz.zone(a).utcOffset(startMoment) > moment.tz.zone(b).utcOffset(startMoment) ? -1 : 1;
	});

	// Reduce by their TZ offset, don't need 50 european states all reducing to Europe/Paris
	var tzReduced = {};
	tzDisplay.forEach((tz) => {
		var k = moment.tz.zone(tz).utcOffset(startMoment);
		if(k in tzReduced){
			tzReduced[k].push(tz)
		}else{
			tzReduced[k] = [tz];
		}
	})
	var repTzLookup = {};
	tzDisplay.forEach((tz) => {
		var k = moment.tz.zone(tz).utcOffset(startMoment);
		repTzLookup[tz] = tzReduced[k][0];
	})

	return [tzDisplay, tzReduced, repTzLookup]
}

export function setTitle(title){
	document.getElementById('title').textContent = title;
	document.title = title;
}

export function combinationTimeZoneHeatMap(config, helpers, participants, isLive) {
	const userTZ = moment.tz.guess();
	const magicHours = 9;

	const startTime = config.start;
	const endTime = config.end;
	const workshopDays = moment(endTime).diff(moment(startTime), "days") + 1;
	const startMoment = moment(startTime);

	setTitle(`Time Zone Heat Map: ${config.title}`);

	// We'll calculate the time in each of these.
	var [tzDisplay, tzReduced, repTzLookup] = reduceTimezones([...Object.keys(participants), ...helpers.map(x => x.TZ), userTZ], startMoment)

	participants = coerceTimezones(participants, repTzLookup);
	helpers = coerceTimezones(helpers, repTzLookup);

	// Table
	var tzMap = tzTable(tzDisplay, tzReduced, workshopDays, magicHours, startTime);

	const now = ( isLive ? moment.tz(userTZ) : tzMap[0][1]);

	// Create the table for every timezone.
	renderTable(tzMap, repTzLookup[userTZ], startTime, endTime, now, true);

	// Heatmap things to make them pretty
	heatmapThings(participants, helpers, startTime);

	// Scroll to the right position
	if(isLive && now.isAfter(moment(startTime)) && now.isBefore(moment(endTime))){
		var nowCls = `c_${now.tz("UTC").format("DD_HH")}`;
		document.querySelectorAll(`#tzhm tr.viewer .${nowCls}`)[0].scrollIntoView({ behavior: "smooth", block: "end", inline: "start" });
	}
}
