// src/components/Flashcard.jsx
import React, { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import toast from 'react-hot-toast';

import { applySM2 } from '../utils/sm2';
import {
  loadCardMeta,
  saveCardMeta,
  logReviewEvent,
  loadFavorites,
  toggleFavorite,
  loadGameMeta,
  saveGameMeta
} from '../utils/storage';
import { LEVEL_THRESHOLDS } from '../utils/game';

export default function Flashcard({
  card,
  index,
  total,
  onNext,
  onPrev,
  onUpdateGameMeta
}) {
  // 0) Guard
  if (!card) {
    return <div style={{ textAlign: 'center', padding: 32 }}>No card available.</div>;
  }

  // 1) State hooks
  const [stored, setStored]         = useState(null);
  const [isFav, setIsFav]           = useState(false);
  const [reps, setReps]             = useState(card.repetitions);
  const [interval, setInterval]     = useState(card.interval);
  const [easy, setEasy]             = useState(card.easiness);
  const [nextReview, setNextReview] = useState(card.nextReview);
  const [notes, setNotes]           = useState(card.notes || '');
  const [userCode, setUserCode]     = useState(card.initialCode || '# Write your Python code here');
  const [showSol, setShowSol]       = useState(false);

  // 2) Load stored card meta once
  useEffect(() => {
    let cancelled = false;
    loadCardMeta(card.id)
      .then(data => {
        if (cancelled) return;
        setStored(data);
        setReps(data.repetitions   ?? card.repetitions);
        setInterval(data.interval   ?? card.interval);
        setEasy(data.easiness       ?? card.easiness);
        setNextReview(data.nextReview ?? card.nextReview);
        setNotes(data.notes         ?? card.notes     ?? '');
      })
      .catch(err => {
        console.error('loadCardMeta error', err);
        if (!cancelled) setStored({});
      });
    return () => { cancelled = true; };
  }, [card.id]);

  // 3) Load favorite status once
  useEffect(() => {
    let cancelled = false;
    loadFavorites()
      .then(arr => {
        if (!cancelled) setIsFav(arr.includes(String(card.id)));
      })
      .catch(console.error);
    return () => { cancelled = true; };
  }, [card.id]);

  // 4) Show loading until stored meta arrives
  if (stored === null) {
    return <div style={{ textAlign: 'center', padding: 32 }}>Loading card…</div>;
  }

  // 5) Styles
  const defaultBtn = {
    padding: '12px 24px',
    fontSize: 18,
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    margin: '0 8px'
  };
  const solBtn = { ...defaultBtn, backgroundColor: '#16a34a', color: '#fff' };
  const navBtn = { ...defaultBtn, backgroundColor: '#6366f1', color: '#fff' };
  const container = {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    maxWidth: 800,
    width: '100%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    position: 'relative'
  };
  const solutionText = String((card.solutionCode || '').split('```').join(''));

  // 6) Toggle favorite
  const handleToggleFav = async () => {
    try {
      const updatedIds = await toggleFavorite(card.id);
      setIsFav(updatedIds.includes(String(card.id)));
    } catch (err) {
      console.error('toggleFavorite error', err);
      toast.error('Could not update favorite.');
    }
  };

  // 7) Rate & persist
  const rateRecall = async quality => {
    // SM-2 scheduling
    const updated = applySM2({ repetitions: reps, interval, easiness: easy, nextReview }, quality);
    setReps(updated.repetitions);
    setInterval(updated.interval);
    setEasy(updated.easiness);
    setNextReview(updated.nextReview);
    await saveCardMeta(card.id, { ...updated, notes });

    // log event
    await logReviewEvent(card.id, quality);

    // load, update, and save GameMeta
    const gm = await loadGameMeta();
    let earned = 10 + (quality >= 4 ? 5 : 0);
    gm.xp += earned;
    toast.success(`+${earned} XP!`);

    const nextThr = LEVEL_THRESHOLDS[gm.level] ?? Infinity;
    if (gm.xp >= nextThr) {
      gm.level += 1;
      gm.badges.push(`level-${gm.level}`);
      toast(`🎉 Reached Level ${gm.level}!`, { icon: '🚀' });
    }
    await saveGameMeta({
      xp:     gm.xp,
      level:  gm.level,
      badges: gm.badges,
      streak: gm.streak,
      lastDate: gm.lastDate
    });

    onUpdateGameMeta(gm);

    // close solution and advance
    setShowSol(false);
    onNext();
  };

  const onChangeNotes = text => {
    setNotes(text);
    saveCardMeta(card.id, { notes: text });
  };

  // 8) Render
  return (
    <div style={container}>
      {/* Question + Favorite Star */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <button
          onClick={handleToggleFav}
          aria-label={isFav ? 'Unmark favorite' : 'Mark favorite'}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            padding: 8,
            fontSize: 24,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            lineHeight: 1
          }}
        >
          {isFav ? '★' : '☆'}
        </button>
        <div
          style={{ paddingTop: 8 }}
          dangerouslySetInnerHTML={{ __html: String(card.questionHTML) }}
        />
      </div>

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

      {/* Show/Hide Solution */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <button onClick={() => setShowSol(s => !s)} style={solBtn}>
          {showSol ? 'Hide Solution' : 'Show Solution'}
        </button>
      </div>

      {/* Solution + Rating Guide + Buttons */}
      {showSol && (
        <>
          <CodeMirror
            value={solutionText}
            readOnly
            height="auto"
            extensions={[python()]}
            theme="light"
            basicSetup={{ lineNumbers: true, highlightActiveLine: false }}
            style={{ borderRadius: 8, backgroundColor: '#f3f4f6', marginBottom: 24 }}
          />

          <details style={{ marginBottom: 16, fontSize: 14, color: '#4b5563' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
              How to choose your rating
            </summary>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              <li><strong>Again</strong>: I couldn’t recall at all.</li>
              <li><strong>Hard</strong>: I remembered parts but struggled.</li>
              <li><strong>Still Struggling</strong>: Needed hints.</li>
              <li><strong>Easy</strong>: Recalled with little effort.</li>
              <li><strong>Very Easy</strong>: Instantly and confidently.</li>
              <li><strong>Mastered</strong>: Explained and applied perfectly.</li>
            </ul>
          </details>

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            {['Again','Hard','Still Struggling','Easy','Very Easy','Mastered'].map((lbl, i) => (
              <button key={i} onClick={() => rateRecall(i)} style={defaultBtn}>
                {lbl}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Notes */}
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
            resize: 'vertical'
          }}
        />
      </div>

      {/* Navigation */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => { setShowSol(false); onPrev(); }}
          disabled={index === 0}
          style={navBtn}
        >
          Prev
        </button>
        <span style={{ margin: '0 12px', fontSize: 18, color: '#4b5563' }}>
          {index + 1} / {total}
        </span>
        <button
          onClick={() => { setShowSol(false); onNext(); }}
          disabled={index + 1 === total}
          style={navBtn}
        >
          Next
        </button>
      </div>
    </div>
  );
}
