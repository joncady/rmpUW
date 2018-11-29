/*
 * RateMyProfessor Chrome Extension
 * Not for public distribution
 * Dev: Jonathan Cady
 * Version: 1.1
 */

checkDivs();

/*
 * Checks the professor names and cleans them so they can be checked with
 * RateMyProfessor.com
 */
async function checkDivs() {
	let instructorNames = [];
	let divs = document.querySelectorAll(".course-section-instructor");
	while (divs.length == 0) {
		await sleep(200);
		divs = document.querySelectorAll(".course-section-instructor");
	}
	divs.forEach(function (el) {
		let instructorName = el.children[0];
		let insideText = instructorName.innerText;
		if (insideText.toLowerCase().includes("view syllabus")) {
			instructorName.innerText = insideText.substr(0, insideText.indexOf("View syllabus"));
			insideText = instructorName.innerText;
		}
		if (!insideText.includes("--")) {
			let splitIt = (insideText).split(" ");
			if (splitIt[1].includes(".") || splitIt[1].length == 1 | splitIt[2] != null) {
				let cleanName = splitIt[0] + " " + splitIt[2];
				instructorName.innerText = cleanName;
			}
			instructorNames.push(instructorName);

		}
	});
	for (let i = 0; i < instructorNames.length; i++) {
		getScores(instructorNames[i].innerText, instructorNames[i]);
	}
}

/*
 * Sleep function used to allow for the browser to load the course information
 */
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/*
 * Loads creates the HTML elements that will be inserted into the page based
 * on the returned content
 */
function createElements(message, originalEl) {
	if (message.status == "success") {
		let quality = message.overallQuality;
		let takeAgain = message.takeAgain;
		let difficulty = message.difficulty;
		let link = message.url;
		let qualityEl = $(`<p>Overall Quality: ${quality}</p>`);
		let takeAgainEl = $(`<p>Would Take Again: ${takeAgain}</p>`);
		let difficultyEl = $(`<p>Level of Difficulty: ${difficulty}</p>`);
		let linkEl = $(`<a href=${link} target='_blank'>Link</a>`);
		let overallDiv = $("<div></div>");
		$(originalEl).css('text-align', 'center');
		let upperEl = $(originalEl).parents('.course-section-instructor');
		overallDiv.append(qualityEl, takeAgainEl, difficultyEl, linkEl);
		overallDiv.addClass("rmp-info");
		$(originalEl).children('.loading').remove();
		upperEl.append(overallDiv);
	} else {
		$(originalEl).children('.loading').remove();
		let failedDiv = $('<p>No RMP data!</p>');
		let upperEl = $(originalEl).parents('.course-section-instructor');
		upperEl.append(failedDiv);
	}
}

/*
 * Sends the professor names to be checked and returns a response with content
 * that will be injected into the page
 */
function getScores(name, element) {
	$(element).append($("<p class='loading'>Loading!</p>"));
	let cleanedName = name.replace(" ", "+");
	let url = `https://students.washington.edu/joncady/projects/ratemyprofessor/rmp.php?name=${cleanedName}`;
	var el = element;
	fetch(url).then(function (reponse) {
		return reponse.json();
	}).then(function (myJson) {
		createElements(myJson, el);
	});
}
