import { useEffect, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { sublimeInit } from '@uiw/codemirror-theme-sublime';
import questions from './questions.json';
import './App.css';

export default function App() {
	const count = useRef(0);

	const [points, setPoints] = useState(0);
	const [completedQuestions, setCompletedQuestions] = useState([0]);
	const [skippedQuestions, setSkippedQuestions] = useState([0]);

	const [infoCode, setInfoCode] = useState({ lines: 0, code: '' });
	const [infoScreen, setInfoScreen] = useState(false);
	const [keywords, setKeywords] = useState([]);
	const [code, setCode] = useState('');
	const [userCode, setUserCode] = useState('');

	function restart() {
		count.current = 0;

		setPoints(0);
		setCompletedQuestions([]);
		setSkippedQuestions([]);
		setInfoScreen(true);

		document.getElementById('finish').style.visibility = 'hidden';
		document.getElementById('finish').style.opacity = '0%';
		document.getElementById('intro').style.visibility = 'visible';
	}

	function toggleInfoScreen() {
		setInfoScreen((prev) => !prev);

		const infoHolder = document.getElementById('infoHolder');

		if (!infoScreen) {
			infoHolder.style.visibility = 'visible';
		} else {
			infoHolder.style.visibility = 'hidden';
		}
	}

	function nextQuestion() {
		if (document.getElementById('next').innerHTML === 'Finish') {
			document.getElementById('finish').style.visibility = 'visible';

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
					interval += 50;
				}
			}, 1000);

			let i = 0;

			const i1 = setInterval(() => {
				if (i > 99) clearInterval(i1);

				document.getElementById('finish').style.opacity = `${i}%`;
				i++;
			}, 10);

			return;
		}

		if (document.getElementById('next').innerHTML === 'Skip') {
			document.getElementById('points').classList.toggle('alt2');

			setTimeout(() => {
				document.getElementById('points').classList.toggle('alt2');
			}, 2000);
		}

		updateValues('+');
	}

	function previousQuestion() {
		updateValues('-');
	}

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

		const {
			question,
			code,
			keywords,
			title,
			infoBeforeCode,
			infoAfterCode,
			infoCode,
		} = questions[count.current];

		document.getElementById('question').innerHTML = question;
		document.getElementById('output').innerHTML = '';

		if (title) {
			document.getElementById('title').innerHTML = title;
			document.getElementById('beforeCode').innerHTML = infoBeforeCode;
			document.getElementById('afterCode').innerHTML = infoAfterCode;
			setInfoCode({ lines: infoCode.length, code: infoCode.join('\n') });
			toggleInfoScreen();
		}

		setCode(code);
		setUserCode(code);
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
			const res = eval(`${content}\n${assert}`);

			if (res) {
				output.style.color = '#00ff00';
				output.innerHTML = correctMessage;
			} else {
				throw new EvalError(errorMessage);
			}
		} catch (err) {
			output.style.color = '#ff0000';
			console.error(err);
			output.innerHTML = err;
		}

		if (
			output.innerHTML === correctMessage &&
			!completedQuestions.includes(count.current)
		) {
			console.log(count.current, skippedQuestions);

			setPoints((prev) => prev + 100);

			document.getElementById('points').classList.toggle('alt');

			setTimeout(() => {
				document.getElementById('points').classList.toggle('alt');
			}, 2000);

			setCompletedQuestions((prev) => [...prev, count.current]);
		}
	}

	useEffect(() => {
		updateValues();

		setInfoScreen(true);
		setCompletedQuestions([]);
		setSkippedQuestions([]);
	}, []);

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
