// src/components/Flashcard.jsx
import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { applySM2 } from '../utils/sm2';
import { loadCardMeta, saveCardMeta } from '../utils/storage';
import { logReviewEvent } from '../utils/storage';


export default function Flashcard({ card, index, total, onNext, onPrev }) {
  if (!card) {
    return <div style={{ textAlign: 'center', padding: 32 }}>No card available.</div>;
  }

  const stored = loadCardMeta(card.id);
  const [reps, setReps]           = useState(stored.repetitions ?? card.repetitions);
  const [interval, setInterval]   = useState(stored.interval    ?? card.interval);
  const [easy, setEasy]           = useState(stored.easiness    ?? card.easiness);
  const [nextReview, setNextReview] = useState(stored.nextReview ?? card.nextReview);
  const [notes, setNotes]         = useState(stored.notes ?? card.notes ?? '');

  const [showSol, setShowSol]     = useState(false);
  const [userCode, setUserCode]   = useState(card.initialCode || '# Write your Python code here');

  const defaultBtn = { padding: '12px 24px', fontSize: 18, borderRadius: 12, border: 'none', cursor: 'pointer', margin: '0 8px' };
  const solBtn     = { ...defaultBtn, backgroundColor: '#16a34a', color: '#fff' };
  const navBtn     = { ...defaultBtn, backgroundColor: '#6366f1', color: '#fff' };
  const container  = { backgroundColor: '#fff', padding: 32, borderRadius: 16, maxWidth: 800, width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };

  // Strip code-fence markers
  const solutionText = String((card.solutionCode || '').split('```').join(''));

  const rateRecall = quality => {
    logReviewEvent(card.id, quality);
    const updated = applySM2({ repetitions: reps, interval, easiness: easy, nextReview }, quality);
    setReps(updated.repetitions);
    setInterval(updated.interval);
    setEasy(updated.easiness);
    setNextReview(updated.nextReview);
    saveCardMeta(card.id, { ...updated, notes });
    onNext();
  };

  const onChangeNotes = text => {
    setNotes(text);
    saveCardMeta(card.id, { notes: text });
  };

  return (
    <div style={container}>
      {/* Question (including embedded hints in HTML) */}
      <div 
        style={{ marginBottom: 24 }} 
        dangerouslySetInnerHTML={{ __html: String(card.questionHTML) }} 
      />

      {/* Code Editor */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontSize: 18, fontWeight: 600 }}>
          Your Code
        </label>
        <CodeMirror
          value={userCode}
          height="200px"
          extensions={[python()]}
          onChange={setUserCode}
          theme="light"
          basicSetup={{ lineNumbers: true, highlightActiveLine: true, indentOnInput: true }}
          style={{ borderRadius: 8, backgroundColor: '#f9fafb' }}
        />
      </div>

      {/* Solution Toggle */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <button onClick={() => setShowSol(s => !s)} style={solBtn}>
          {showSol ? 'Hide Solution' : 'Show Solution'}
        </button>
      </div>

      {/* Read-Only Solution */}
      {showSol && (
        <CodeMirror
          value={solutionText}
          readOnly
          height="auto"
          extensions={[python()]}
          theme="light"
          basicSetup={{ lineNumbers: true, highlightActiveLine: false }}
          style={{ borderRadius: 8, backgroundColor: '#f3f4f6', marginBottom: 24 }}
        />
      )}

      {/* SM-2 Rating Buttons */}
      {showSol && (
  <div style={{ textAlign: 'center', marginBottom: 24 }}>
    {['Again', 'Hard', 'Still Struggling', 'Easy', 'Very Easy', 'Mastered'].map((label, idx) => (
      <button key={idx} onClick={() => rateRecall(idx)} style={defaultBtn}>
        {label}
      </button>
    ))}
  </div>
)}

      {/* Notes Section */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8, fontSize: 18, fontWeight: 600, color: '#374151' }}>
          Notes
        </label>
        <textarea
          value={notes}
          onChange={e => onChangeNotes(e.target.value)}
          rows={4}
          style={{
            width: '100%',
            padding: 12,
            fontSize: 16,
            borderRadius: 8,
            border: '1px solid #d1d5db',
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
      </div>

      {/* Navigation */}
      <div style={{ textAlign: 'center' }}>
        <button onClick={onPrev} disabled={index === 0} style={navBtn}>Prev</button>
        <span style={{ margin: '0 12px', fontSize: 18, color: '#4b5563' }}>
          {index + 1} / {total}
        </span>
        <button onClick={onNext} disabled={index + 1 === total} style={navBtn}>Next</button>
      </div>
    </div>
  );
}
