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

export function peopleWorkingThen(people){
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
			if(person[day] === undefined){
				return;
			}
			person[day].forEach(hour =>  {
				var lpH = leftpad(hour, 2, "0");
				// TODO: hardcoded time
				var hm = moment.tz(`2021-01-25T${lpH}:00:00`, person.TZ).add(index, "days");
				var cls = "c_" + hm.format("DD") + "_" + hm.tz("UTC").format("HH");

					if(namesByClass[cls] === undefined){
						namesByClass[cls] = []
					}
				if(person.Name){
					namesByClass[cls].push(person.Name)
				}else{

					namesByClass[cls].push(true)
					}
			})
		})
	})
	return namesByClass
}

export function relativeWorkingHours(participants){
	var final = [];
	Object.keys(participants).forEach(tz => {
		var count = participants[tz];
		for(var i = 0; i < count; i++){
			final.push({
				'TZ': tz,
				'Monday': workingHours,
				'Tuesday': workingHours,
				'Wednesday':workingHours,
				'Thursday':workingHours,
				'Friday': workingHours,
			})
		}
	})
	return final;
}
