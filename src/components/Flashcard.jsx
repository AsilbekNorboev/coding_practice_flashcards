import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';

export default function Flashcard({ card, index, total, onNext, onPrev }) {
  const [showSol, setShowSol] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [userCode, setUserCode] = useState('# Write your Python code here');

  // Inline style objects for buttons
  const defaultBtnStyle = {
    padding: '12px 24px',
    fontSize: '18px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    margin: '0 8px',
  };
  const solutionBtnStyle = {
    ...defaultBtnStyle,
    backgroundColor: '#16a34a', // green-600
    color: '#ffffff',
  };
  const navBtnStyle = {
    ...defaultBtnStyle,
    backgroundColor: '#6366f1', // indigo-500
    color: '#ffffff',
  };

  return (
    <div style={{backgroundColor: '#ffffff', padding: 32, borderRadius: 16, maxWidth: 800, width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}>
      {/* Question */}
      <div style={{ marginBottom: 24 }}>
        <ReactMarkdown>{card.questionText}</ReactMarkdown>
      </div>

      {/* Hints Toggle */}
      {card.hints && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <button
            onClick={() => setShowHints(h => !h)}
            style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '18px', cursor: 'pointer' }}
          >
            {showHints ? 'Hide Hints' : 'Show Hints'}
          </button>
          {showHints && (
            <ul style={{ textAlign: 'left', paddingLeft: 20, color: '#374151' }}>
              {card.hints.map((hint, i) => <li key={i}>{hint}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* Code Editor */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8 }}>Your Code</label>
        <CodeMirror
          value={userCode}
          height="200px"
          extensions={[python()]}
          onChange={(value) => setUserCode(value)}
          theme="light"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            indentOnInput: true,
          }}
          style={{ borderRadius: 8, backgroundColor: '#f9fafb' }}
        />
      </div>

      {/* Solution Toggle */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <button
          onClick={() => setShowSol(s => !s)}
          style={solutionBtnStyle}
        >
          {showSol ? 'Hide Solution' : 'Show Solution'}
        </button>
      </div>

      {/* Solution Code */}
      {showSol && (
        <div style={{ backgroundColor: '#f3f4f6', padding: 16, borderRadius: 8, marginBottom: 24 }}>
          <ReactMarkdown>{card.solutionCode}</ReactMarkdown>
        </div>
      )}

      {/* Navigation */}
      <div style={{ textAlign: 'center' }}>
        <button onClick={onPrev} disabled={index === 0} style={navBtnStyle}>Prev</button>
        <span style={{ margin: '0 12px', fontSize: '18px', color: '#4b5563' }}>{index + 1} / {total}</span>
        <button onClick={onNext} disabled={index + 1 === total} style={navBtnStyle}>Next</button>
      </div>
    </div>
  );
}