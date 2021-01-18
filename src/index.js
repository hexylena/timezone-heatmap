import "./style.css";

const tzhm = document.getElementById("tzhm");
const moment = require("moment-timezone");
const helpers = require("./helpers.json");


function onlyUnique(value, index, self) {
	return self.indexOf(value) === index;
}

function leftpad(str, len, ch) {
	str = String(str);
	var i = -1;
	if (!ch && ch !== 0) ch = " ";
	len = len - str.length;
	while (++i < len) {
		str = ch + str;
	}
	return str;
}

// We'll calculate the time in each of these.
var tzDisplay = [
	"Pacific/Auckland",
	"Australia/Melbourne",
	"Australia/Perth",
	"Asia/Hong_Kong",
	"Asia/Kolkata",
	"Asia/Karachi",
	"Europe/Istanbul",
	"Africa/Cairo",
	"Europe/Vilnius",
	"Europe/Paris",
	"Atlantic/Reykjavik",
	"America/Sao_Paulo",
	"America/Caracas",
	"America/New_York",
	"America/Chicago",
	"America/Denver",
	"America/Los_Angeles",
	"America/Anchorage",
	"Pacific/Midway"
];

var tzMap = tzDisplay.map(tz => {
	var converted = [...Array(24 * 5).keys()].map(hourN => {
		var hour = leftpad("" + hourN, 2, "0"),
			convertedTime = moment(`2021-01-25T08:00:00+11:00`)
				.tz(tz)
				.add(hourN, "hours"),
			h = parseInt(convertedTime.format("H"));

		if (h === 0) {
			return convertedTime.format("MMM D YYYY").split(" ");
		} else {
			return convertedTime.format("HH mm").split(" ");
		}
	});
	return [tz, moment(`2021-01-25T08:00:00+11:00`).tz(tz), ...converted];
});

tzMap.forEach(row => {
	var elrow = document.createElement("tr");
	elrow.id = "r_" + row[0];
	// append the row
	tzhm.appendChild(elrow);
	// for each hour, append an element

	// City
	var elcell = document.createElement("td");
	elcell.innerHTML = `<div class="city">${row[0]}</div><div class="offset">${row[1].format()}</div>`;
	elrow.append(elcell);
	console.log(row[0], row[1].format("DD"));

	var mutTime = moment(row[1]);
	row.slice(2).forEach((timePoint, index) => {
		var elcell = document.createElement("td");

		elcell.id = `${mutTime.format()}q${row[1].format()}q${mutTime.tz(row[0]).format("DD")}`;
		var day = mutTime.tz(row[0]).format("DD"),
			utc_hour = mutTime.tz("UTC").format("HH");
		elcell.classList.add(`c_${day}_${utc_hour}`);

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
		if (cH >= 8 && cH <= 17) {
			elcell.classList.add("work");
		} else if (cH > 17 && cH < 20) {
			elcell.classList.add("work-late");
		} else {
			elcell.classList.add("sleep");
		}
	});
});

var helperCountByClass = {};
var maxHelpers = 0;

var daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

helpers.forEach(helper => {
	console.log(helper.Name, helper.TZ);
	daysOfWeek.forEach((day, index) => {
		console.log("   ", day);
		for (var hour = 7; hour < 20; hour++) {
			var k = "" + hour;

			if (helper[k] && helper[k].indexOf(day) >= 0) {
				var lpH = leftpad(hour, 2, "0");
				var hm = moment.tz(`2021-01-25T${lpH}:00:00`, helper.TZ).add(index, "days");
				var hmTomorrow = moment(hm).add(1, 'days');

				var cls1 = "c_" + hm.format("DD") + "_" + hm.tz("UTC").format("HH");
				var cls2 = "c_" + hmTomorrow.format("DD") + "_" + hm.tz("UTC").format("HH");

				/*console.log("     ", hm.format(), hm.format("DD_HH"), hm.tz("UTC").format("DD_HH"));*/

				if (helperCountByClass[cls1] === undefined) {
					helperCountByClass[cls1] = {'i': 0, 'h': []};
				}
				// Count the helpers in that slot.
				helperCountByClass[cls1].i = helperCountByClass[cls1].i + 1;

				if (helperCountByClass[cls1].i > maxHelpers) {
					maxHelpers = helperCountByClass[cls1].i
				}


				if (helperCountByClass[cls2] === undefined) {
					helperCountByClass[cls2] = {'i': 0, 'h': []};
				}
				// Count the helpers in that slot.
				helperCountByClass[cls2].i = helperCountByClass[cls2].i + 1;

				if (helperCountByClass[cls2].i > maxHelpers) {
					maxHelpers = helperCountByClass[cls2].i;
				}

				helperCountByClass[cls1].h.push(helper.Name);
				helperCountByClass[cls2].h.push(helper.Name);

			}
		}
	});
});

Object.keys(helperCountByClass).forEach(k => {
	var pct = helperCountByClass[k].i / maxHelpers;
	var peeps = helperCountByClass[k].h.filter(onlyUnique).join(', ')

	document.querySelectorAll(`.${k}.work`).forEach(x => {
		x.style.background = `rgba(0, 255, 0, ${pct})`;
		x.setAttribute('title', peeps);
	});
	document.querySelectorAll(`.${k}.work-late`).forEach(x => {
		x.style.background = `rgba(0, 255, 0, ${pct})`;
		x.setAttribute('title', peeps);
	});
});
/*console.log(maxHelpers)*/
/*console.log(helperCountByClass)*/

window.moment = moment;
