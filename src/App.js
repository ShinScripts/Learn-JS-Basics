// Diar Ahmed diah5999
// Shahin Mohseni shmo6177
import { useEffect, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { sublimeInit } from '@uiw/codemirror-theme-sublime';
import questions from './questions.json';
import './App.css';

export default function App() {
	const count = useRef(0); // creating a reference point so we can keep track of the count

	const [points, setPoints] = useState(0); // create a state of points (the page re-renders everytime "points" changes)
	const [completedQuestions, setCompletedQuestions] = useState([0]); // create a state
	const [skippedQuestions, setSkippedQuestions] = useState([0]); // create a state

	const [infoCode, setInfoCode] = useState({ lines: 0, code: '' }); // create a state
	const [infoScreenVisibility, setInfoScreenVisibility] = useState(false); // create a state
	const [keywords, setKeywords] = useState([]); // create a state
	const [code, setCode] = useState(''); // create a state
	const [userCode, setUserCode] = useState(''); // create a state

	// the restart function to set the game to its initial stage
	function restart() {
		count.current = 0; // set question number to 0
		setPoints(0); // set points to 0

		updateValues(); 

		setInfoScreenVisibility(true); // set the info screen to show 
		setCompletedQuestions([]); // remove all completed questions
		setSkippedQuestions([]); // remove all skipped questions

		// set the finish screens back to their initial state, hidden
		document.getElementById('finish').style.visibility = 'hidden';
		document.getElementById('finish').style.opacity = '0%';
		document.getElementById('intro').style.visibility = 'visible'; // show the intro screen
	}

	// toggles the info screen
	function toggleInfoScreen() {
		setInfoScreenVisibility((prev) => !prev); // set the value to its inverse

		const infoHolder = document.getElementById('infoHolder');

		// toggle the visibility
		if (!infoScreenVisibility) {
			infoHolder.style.visibility = 'visible';
		} else {
			infoHolder.style.visibility = 'hidden';
		}
	}

	// responsible for incrementing the questions number
	function nextQuestion() {
		// runs if we're on the last question
		if (document.getElementById('next').innerHTML === 'Finish') {
			document.getElementById('finish').style.visibility = 'visible';
			document.getElementById('text').innerHTML = '';

			// set a delay before the text is shown
			setTimeout(() => {
				let text;

				if (points === questions.length * 100) {
					text =
						"WOAH, you're born to be a programmer! Nice job on completing all questions!";
				} else if (points === (questions.length - 1) * 100) {
					text =
						'So close, yet so far! Would you like to try again and see if you can answer all the questions?';
				} else {
					text =
						"Not quite there yet, however if you just keep trying I have no doubts you'll make it!";
				}

				let interval = 0;
				for (const char of text) {
					setTimeout(() => {
						document.getElementById('text').innerHTML += char;
					}, interval);
					interval += 50; // add extra time for each character so they dont all render in together
				}
			}, 1000);

			let i = 0;

			// slowly fade in the finish screen
			const i1 = setInterval(() => {
				if (i > 99) clearInterval(i1);

				document.getElementById('finish').style.opacity = `${i}%`; // set the opacity
				i++;
			}, 10);

			return;
		}

		// makes the points text flash red
		if (document.getElementById('next').innerHTML === 'Skip') {
			document.getElementById('points').classList.toggle('alt2');

			setTimeout(() => {
				document.getElementById('points').classList.toggle('alt2');
			}, 2000);
		}

		// increments the count
		updateValues('+');
	}

	// responsible for decrementing the questions number
	function previousQuestion() {
		updateValues('-');
	}

	// updates all the things you see on the main page
	function updateValues(type) {
		switch (type) {
			case '+':
				count.current++;
				break;
			case '-':
				count.current--;
				break;
			default:
		}

		// destructure and take out from the JSON file
		const {
			question,
			code,
			keywords,
			title,
			infoBeforeCode,
			infoAfterCode,
			infoCode,
		} = questions[count.current];

		document.getElementById('question').innerHTML = question; //set the questions 
		document.getElementById('output').innerHTML = ''; // remove the previous output

		// is current questions contains a info "title", display the info box
		if (title) {
			document.getElementById('title').innerHTML = title;
			document.getElementById('beforeCode').innerHTML = infoBeforeCode;
			document.getElementById('afterCode').innerHTML = infoAfterCode;
			setInfoCode({ lines: infoCode.length, code: infoCode.join('\n') });
			toggleInfoScreen();
		}

		// set all values to current question
		setCode(code);
		setUserCode(code);

		// used to randomize the keywords
		setKeywords(
			keywords
				.map((value) => ({ value, sort: Math.random() }))
				.sort((a, b) => a.sort - b.sort)
				.map(({ value }) => value)
		);
	}

	function compile() {
		const content = userCode;
		const output = document.getElementById('output');
		const { assert, errorMessage } = questions[count.current];

		const correctMessage =
			'Correct! Press the "Next" button to proceed to the next question!';

		try {
			const res = eval(`${content}\n${assert}`); // put our logic at the end of the users input to "eval" can return true or false

			if (res) {
				// if its true
				output.style.color = '#00ff00';
				output.innerHTML = correctMessage;
			} else {
				// if its false
				throw new EvalError(errorMessage);
			}
		} catch (err) {
			// if its false
			output.style.color = '#ff0000';
			console.error(err);
			output.innerHTML = err;
		}

		// if the eval returned true and the users hasn't already answered the question successfully, give them points and flash the points text green
		if (
			output.innerHTML === correctMessage &&
			!completedQuestions.includes(count.current)
		) {
			setPoints((prev) => prev + 100); // add 100 points

			// make the text flash green
			document.getElementById('points').classList.toggle('alt');

			setTimeout(() => {
				document.getElementById('points').classList.toggle('alt');
			}, 2000);

			setCompletedQuestions((prev) => [...prev, count.current]); // add it to completed questions so the player cant get points multiple times
		}
	}

	// runs upon the first visit, sets initial values 
	useEffect(() => {
		updateValues();

		setInfoScreenVisibility(true);
		setCompletedQuestions([]);
		setSkippedQuestions([]);
	}, []);

	// what will be rendered
	return (
		<div id='container'>
			<div id='intro'>
				<h1>
					Learn <mark>JavaScript</mark> Basics
				</h1>
				<p>A learning game built by Diar Ahmed and Shahin Mohseni</p>
				<br />
				<p>
					Try to complete all questions (
					{questions.length * 100 + ' points'})
				</p>
				<button
					onClick={() =>
						(document.getElementById('intro').style.visibility =
							'hidden')
					}
				>
					Start!
				</button>
			</div>

			<div id='finish'>
				<h1>Well done!</h1>
				<p>{'Points: ' + points + '/' + questions.length * 100}</p>
				<p id='text'></p>
				<button onClick={restart}>Restart</button>
			</div>

			<div id='infoHolder'>
				<button onClick={toggleInfoScreen}>Close</button>
				<h1 id='title'>placeholder</h1>
				<p id='beforeCode'></p>
				<CodeMirror
					id='codeExample'
					theme={sublimeInit({
						settings: {
							caret: '#c6c6c6',
							fontFamily: 'monospace',
						},
					})}
					value={infoCode.code}
					height={22 * infoCode.lines + 'px'}
					width='600px'
					readOnly={true}
					tabIndex={4}
					extensions={[javascript()]}
				/>
				<p id='afterCode'></p>
			</div>

			<p id='points'>Points: {points}</p>

			<button id='infoBtn' onClick={toggleInfoScreen}>
				Info
			</button>

			<section id='questionSection'>
				<h1 id='question'>Placeholder</h1>
			</section>

			<div id='keywords'>
				<p>Keywords:</p>
				<ul>
					{keywords.map((q, i) => (
						<li key={i}>{q}</li>
					))}
				</ul>
			</div>

			<hr />
			<h1>Compiler</h1>

			<CodeMirror
				id='code-input'
				theme={sublimeInit({
					settings: {
						caret: '#c6c6c6',
						fontFamily: 'monospace',
					},
				})}
				value={code}
				height='200px'
				width='400px'
				tabIndex={4}
				extensions={[javascript()]}
				onChange={(e) => setUserCode(e)}
			/>

			<div id='buttons'>
				<button
					id='previous'
					disabled={count.current === 0}
					onClick={previousQuestion}
				>
					Previous
				</button>
				<button id='compile-btn' onClick={compile}>
					Compile
				</button>
				<button id='next' onClick={nextQuestion}>
					{count.current === questions.length - 1
						? 'Finish'
						: completedQuestions.includes(count.current)
						? 'Next'
						: 'Skip'}
				</button>
			</div>

			<hr />
			<h2>Output:</h2>
			<pre id='output'></pre>
		</div>
	);
}
