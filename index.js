try {
	const LESSONS = process.env.LESSONS ?? 1;
	const TIMER = process.env.TIMER ?? 1;
	const JWT = process.env.DUOLINGO_JWT;

	const headers = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${JWT}`,
		"user-agent":
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
	};

	const { sub } = JSON.parse(
		Buffer.from(JWT.split(".")[1], "base64").toString(),
	);

	const { fromLanguage, learningLanguage } = await fetch(
		`https://www.duolingo.com/2017-06-30/users/${sub}?fields=fromLanguage,learningLanguage`,
		{
			headers,
		},
	).then((response) => response.json());

	console.log(`🎉 Start! Lessons = ${LESSONS}, Timer = ${TIMER}`);

	await start(LESSONS, TIMER, 0, fromLanguage, learningLanguage, headers);

} catch (error) {
	console.log("❌ Something went wrong", error);

	for(let key of error){
		console.log(`${key}: ${error[key]}`);
	}
	
	if (error instanceof Error) {
		console.log(error.message);
	}
}

async function start(lessons, timer, xp, fromLanguage, learningLanguage, headers){
	const session = await fetch(
		"https://www.duolingo.com/2017-06-30/sessions",
		{
			body: JSON.stringify({
				challengeTypes: [
					"assist",
					"characterIntro",
					"characterMatch",
					"characterPuzzle",
					"characterSelect",
					"characterTrace",
					"characterWrite",
					"completeReverseTranslation",
					"definition",
					"dialogue",
					"extendedMatch",
					"extendedListenMatch",
					"form",
					"freeResponse",
					"gapFill",
					"judge",
					"listen",
					"listenComplete",
					"listenMatch",
					"match",
					"name",
					"listenComprehension",
					"listenIsolation",
					"listenSpeak",
					"listenTap",
					"orderTapComplete",
					"partialListen",
					"partialReverseTranslate",
					"patternTapComplete",
					"radioBinary",
					"radioImageSelect",
					"radioListenMatch",
					"radioListenRecognize",
					"radioSelect",
					"readComprehension",
					"reverseAssist",
					"sameDifferent",
					"select",
					"selectPronunciation",
					"selectTranscription",
					"svgPuzzle",
					"syllableTap",
					"syllableListenTap",
					"speak",
					"tapCloze",
					"tapClozeTable",
					"tapComplete",
					"tapCompleteTable",
					"tapDescribe",
					"translate",
					"transliterate",
					"transliterationAssist",
					"typeCloze",
					"typeClozeTable",
					"typeComplete",
					"typeCompleteTable",
					"writeComprehension",
				],
				fromLanguage,
				isFinalLevel: false,
				isV2: true,
				juicy: true,
				learningLanguage,
				smartTipsVersion: 2,
				type: "GLOBAL_PRACTICE",
			}),
			headers,
			method: "POST",
		},
	).then((response) => response.json());

	const response = await fetch(
		`https://www.duolingo.com/2017-06-30/sessions/${session.id}`,
		{
			body: JSON.stringify({
				...session,
				heartsLeft: 0,
				startTime: (+new Date() - 60000) / 1000,
				enableBonusPoints: false,
				endTime: +new Date() / 1000,
				failed: false,
				maxInLessonStreak: 9,
				shouldLearnThings: true,
			}),
			headers,
			method: "PUT",
		},
	).then((response) => response.json());

	xp += response.xpGain;

	console.log(`🎉 You won ${xp} XP`, new Date().toLocaleTimeString());

	lessons--;

	if(lessons !== 0){
		setTimeout(() => {
			start(lessons,timer, xp, fromLanguage, learningLanguage, headers);
		}, timer * 1000);
	}

	return xp;
} catch (error) {
	console.log("❌ Total ERROR: ", error);

	for(let key of error){
		console.log(`${key}: ${error[key]}`);
	}

	if (error instanceof Error) {
		console.log(error.message);
	}
}
