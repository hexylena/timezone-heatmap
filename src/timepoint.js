const moment = require("moment-timezone");

// import things
import "./style.css";
import { tzhmTimepointView } from "./lib.js";


const params = (new URL(document.location)).searchParams;
var date = params.get('date');
var time = params.get('time');
var name = params.get('name');
var tz = params.get('tz');
const userTZ = moment.tz.guess();

const url = new URL(window.location);
if(tz === null || tz === undefined){
	tz = userTZ;
	url.searchParams.set('tz', tz);
}
if(date === null || date === undefined){
	date = moment().format('YYYY-MM-DD');
	url.searchParams.set('date', date);
}
if(time === null || time === undefined){
	time = moment().format('HH');
	url.searchParams.set('time', time);
}
if(name === null || name === undefined){
	name = 'My Event';
	url.searchParams.set('name', name);
}
window.history.pushState({}, '', url);

tzhmTimepointView(date, time, tz, name);
