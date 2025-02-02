/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   logtimes.js                                        :+:    :+:            */
/*                                                     +:+                    */
/*   By: fbes <fbes@student.codam.nl>                 +#+                     */
/*                                                   +#+                      */
/*   Created: 2022/04/05 22:04:27 by fbes          #+#    #+#                 */
/*   Updated: 2022/05/31 16:57:49 by fbes          ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

function getLogTimes(settings) {
	return new Promise(function(resolve, reject) {
		const httpReq = new XMLHttpRequest();
		httpReq.addEventListener("load", function() {
			try {
				resolve(JSON.parse(this.responseText));
			}
			catch (err) {
				reject(err);
			}
		});
		httpReq.addEventListener("error", function(err) {
			reject(err);
		});
		httpReq.withCredentials = true;
		httpReq.open("GET", window.location.origin.replace("profile", "translate") + "/users/" + getProfileUserName() + "/locations_stats.json");
		httpReq.send();
	});
}

// month logtime has to be calculated from the web since some days may be missing from the logtimes chart
function sumMonthLogTime(ltMonths, settings) {
	ltMonths = Array.from(ltMonths).reverse();
	getLogTimes(settings)
		.then(function(stats) {
			const dates = Object.keys(stats);
			const monthNames = [];
			const monthSums = [];
			for (let i = 0; i < ltMonths.length; i++) {
				monthNames.push(ltMonths[i].textContent);
				monthSums.push(0);
			}
			for (const date of dates) {
				const jsDate = new Date(date);
				const mIndex = monthNames.indexOf(jsDate.toDateString().split(" ")[1]);
				if (mIndex > -1) {
					monthSums[mIndex] += parseLogTime(stats[date]);
				}
			}
			const monthSumsUpdated = monthSums.map((val, idx)=>{
				if (idx >= (monthSums.length / 2)) {
					return (monthSums[idx - monthSums.length / 2]);
				}
				return (val);
			})
			for (let i = 0; i < ltMonths.length; i++) {
				const oldX = parseInt(ltMonths[i].getAttribute("x"));
				ltMonths[i].textContent = ltMonths[i].textContent + " (" + logTimeToString(monthSumsUpdated[i]) + ")";
				const newBbox = ltMonths[i].getBBox();
				// move element's x coordinate to the left to account for the width of the text added
				ltMonths[i].setAttribute("x", Math.round(oldX - newBbox.width * 0.5));
			}
		})
		.catch(function(err) {
			iConsole.error(err);
		});
}

function cumWeekLogTime(ltDays, settings) {
	let ltDay = ltDays[ltDays.length - 1];
	let daysInWeek = dayOfWeek + 1;
	const remainingWeeks = Math.floor(ltDays.length / 7) + (dayOfWeek != 6 ? 1 : 0);
	let r = 0;
	for (let i = 0; i < remainingWeeks; i++) {
		let j;

		if (i == 1) {
			daysInWeek = 7;
		}
		const tempLogTimes = [];

		// parse individual logtimes
		for (j = 0; j < daysInWeek; j++) {
			ltDay = ltDays[ltDays.length - r - 1];
			if (!ltDay) {
				return;
			}
			tempLogTimes.push(parseLogTime(ltDay.getAttribute("data-original-title")));
			if (tempLogTimes[j] == 0) {
				ltDay.setAttribute("data-nolog", "");
			}
			r++;
		}

		// calculate cumulative logtime
		for (j = daysInWeek - 2; j > -1; j--) {
			tempLogTimes[j] = tempLogTimes[j] + tempLogTimes[j + 1];
		}

		// add cumulative logtime to tooltips (and percentage if Codam Monit System enabled)
		for (j = daysInWeek - 1; j > -1; j--) {
			ltDay = ltDays[ltDays.length - r + j];
			if (!ltDay) {
				return;
			}
			ltDay.setAttribute("data-original-title", ltDay.getAttribute("data-original-title") + " (" + logTimeToString(tempLogTimes[daysInWeek - 1 - j]) + ")");
		}
	}
}

function notDublicates(ltMonths) {
	if (ltMonths.length > 1)
	{
		arr = Array.from(ltMonths).map(val=>val.textContent).sort();
		return (arr[0] !== arr[1]);
	}
	return (false);
}

function waitForLogTimesChartToLoad(ltSvg, settings) {
	const ltDays = ltSvg.getElementsByTagName("g");
	const ltMonths = ltSvg.querySelectorAll("svg > text");
	if (ltDays.length == 0 || ltMonths.length == 0 || notDublicates(ltMonths)) {
		// logtimes chart hasn't finished loading yet, try again in 100ms
		setTimeout(function() {
			waitForLogTimesChartToLoad(ltSvg, settings);
		}, 100);
		return false;
	}

	// fix first month sometimes outside container
	let viewBox = ltSvg.getAttribute("viewBox");
	if (viewBox) {
		const firstText = ltSvg.querySelector("text");
		viewBox = viewBox.split(" ").map(function(item) {
			return parseInt(item);
		});
		const monthsAmount = ltSvg.querySelectorAll("svg > text").length;
		const firstX = (firstText ? parseInt(firstText.getAttribute("x")) : 0);
		if (viewBox[0] > 0 && firstX < 150 && monthsAmount <= 4) {
			// Intra intents to shift months to the left when there's 5 months being displayed
			// however, the code that does that seems to contain some bugs, as sometimes it's also done when there's still only 4.
			// shift them back here, but only if the first month is displayed correctly (less than 150 pixels from the left side of the SVG)
			// and if there's 4 months being displayed instead of 5.
			iConsole.log("Logtimes chart viewBox seems off, first month might be hidden. Unhiding it by setting the first value to 0 (was "+viewBox[0]+", x="+firstX+").");
			viewBox[0] = 0;
			ltSvg.setAttribute("viewBox", viewBox.join(" "));
		}
	}

	// add date attribute to all days in svg
	// useful for Improved Intra but also other extensions!
	const days = ltSvg.getElementsByTagName("g");
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	let month = 0;
	let date = 0;
	let year = 0;
	for (const day of days) {
		if (day.previousElementSibling.nodeName.toUpperCase() == "TEXT") {
			month = months.indexOf(day.previousElementSibling.textContent.substring(0, 3)) + 1;
			if (today.getMonth() == 0 && (month == 10 || month == 11 || month == 12)) {
				year = today.getFullYear() - 1;
			}
			else {
				year = today.getFullYear();
			}
			date = 1;
		}
		day.setAttribute("data-iidate", year.toString()+'-'+month.toString().padStart(2, '0')+'-'+date.toString().padStart(2, '0'));
		date++;
	}

	if (optionIsActive(settings, "logsum-month")) {
		sumMonthLogTime(ltMonths, settings);
	}
	if (optionIsActive(settings, "logsum-week")) {
		cumWeekLogTime(ltDays, settings);
	}
}

if (window.location.pathname == "/" || window.location.pathname.indexOf("/users/") == 0) {
	const ltSvg = document.getElementById("user-locations");
	if (ltSvg) { // check if logtimes chart is on page
		improvedStorage.get(["logsum-month", "logsum-week", "codam-monit"]).then(function(settings) {
			waitForLogTimesChartToLoad(ltSvg, settings);
		});
	}
}
