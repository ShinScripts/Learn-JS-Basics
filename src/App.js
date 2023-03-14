import { useEffect, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { sublimeInit } from '@uiw/codemirror-theme-sublime';
import questions from './questions.json';
import './App.css';

export default function App() {
	const count = useRef(0);
	const [infoCode, setInfoCode] = useState({ lines: 0, code: '' });
	const [infoScreen, setInfoScreen] = useState();
	const [keywords, setKeywords] = useState([]);
	const [code, setCode] = useState('');
	const [userCode, setUserCode] = useState('');

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

		try {
			output.innerHTML = eval(`${content}\n${assert}`)
				? 'Correct!'
				: new EvalError(errorMessage);
		} catch (err) {
			console.error(err);
			output.innerHTML = err;
		}
	}

	useEffect(() => {
		updateValues();
	}, []);

	return (
		<div id='container'>
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
				<button
					id='next'
					disabled={count.current === questions.length - 1}
					onClick={nextQuestion}
				>
					Next
				</button>
			</div>

			<h2>Output:</h2>
			<pre id='output'></pre>
		</div>
	);
}
