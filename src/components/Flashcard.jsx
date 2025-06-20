import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';

export default function Flashcard({ card, index, total, onNext, onPrev }) {
  const [showSol, setShowSol] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [userCode, setUserCode] = useState(card.initialCode || '# Write your Python code here');

  // Inline style objects
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
    backgroundColor: '#16a34a',
    color: '#fff',
  };
  const navBtnStyle = {
    ...defaultBtnStyle,
    backgroundColor: '#6366f1',
    color: '#fff',
  };
  const containerStyle = {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    maxWidth: 800,
    width: '100%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  };

  // Helper to strip backticks if needed:
  const solutionText = card.solutionCode
    ? card.solutionCode.replace(/```(?:python)?\n?|```/g, '')
    : '';

  return (
    <div style={containerStyle}>
      {/* Question HTML */}
      <div
        style={{ marginBottom: 24 }}
        dangerouslySetInnerHTML={{ __html: card.questionHTML }}
      />

      {/* Hints */}
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
              {card.hints.map((hint, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: hint }} />
              ))}
            </ul>
          )}
        </div>
      )}

      {/* User Code Editor */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8 }}>Your Code</label>
        <CodeMirror
          value={userCode}
          height="200px"
          extensions={[python()]}
          onChange={value => setUserCode(value)}
          theme="light"
          basicSetup={{ lineNumbers: true, highlightActiveLine: true, indentOnInput: true }}
          style={{ borderRadius: 8, backgroundColor: '#f9fafb' }}
        />
      </div>

      {/* Show/Hide Solution */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <button onClick={() => setShowSol(s => !s)} style={solutionBtnStyle}>
          {showSol ? 'Hide Solution' : 'Show Solution'}
        </button>
      </div>

      {/* Read-Only Solution Editor */}
      {showSol && (
        <CodeMirror
          value={solutionText}
          readOnly={true}
          height="auto"
          extensions={[python()]}
          theme="light"
          basicSetup={{ lineNumbers: true, highlightActiveLine: false }}
          style={{ borderRadius: 8, backgroundColor: '#f3f4f6', marginBottom: 24 }}
        />
      )}

      {/* Navigation */}
      <div style={{ textAlign: 'center' }}>
        <button onClick={onPrev} disabled={index === 0} style={navBtnStyle}>
          Prev
        </button>
        <span style={{ margin: '0 12px', fontSize: '18px', color: '#4b5563' }}>
          {index + 1} / {total}
        </span>
        <button onClick={onNext} disabled={index + 1 === total} style={navBtnStyle}>
          Next
        </button>
      </div>
    </div>
  );
}
