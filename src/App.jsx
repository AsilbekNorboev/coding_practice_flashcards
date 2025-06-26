// src/App.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import ConfigForm from './components/ConfigForm';
import Flashcard from './components/Flashcard';
import Analytics from './components/Analytics.jsx';
import cardsData from './data/flashcards.json';
import { loadAllMeta } from './utils/storage';
import { loadGameMeta, saveGameMeta, LEVEL_THRESHOLDS } from './utils/game';
import toast from 'react-hot-toast';

export default function App() {
  // 1️⃣ AUTH GATE
  const { user, loading, signInWithGoogle, logout } = useAuth();

  if (loading) {
    return <div style={{ padding: 32 }}>Loading…</div>;
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: 64 }}>
        <h2>Please sign in to continue</h2>
        <button
          onClick={signInWithGoogle}
          style={{ padding: '12px 24px', fontSize: 18, borderRadius: 8 }}
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  // 2️⃣ STREAK UPDATE ONCE PER LOAD
  useEffect(() => {
    const gm = loadGameMeta();
    const today = new Date().toISOString().slice(0,10);
    if (gm.lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate()-1);
      const ystr = yesterday.toISOString().slice(0,10);
      gm.streak = gm.lastDate === ystr ? gm.streak + 1 : 1;
      gm.lastDate = today;
      if (gm.streak === 7 && !gm.badges.includes('streak-7')) {
        gm.badges.push('streak-7');
        toast('🏅 7-Day Streak Unlocked!', { icon: '🏆', duration: 4000 });
      }
      saveGameMeta(gm);
    }
  }, []);

  // 3️⃣ COMPUTE DUE CARDS
  const meta     = loadAllMeta();
  const todayStr = new Date().toISOString().slice(0,10);
  const dueCards = cardsData.filter(card => {
    const next = meta[card.id]?.nextReview || card.nextReview;
    return next <= todayStr;
  });

  // 4️⃣ APP VIEW STATE
  const [view, setView]       = useState('config'); // 'config' | 'study' | 'analytics'
  const [deck, setDeck]       = useState([]);
  const [viewing, setViewing] = useState(null);

  const handleStart = selected => {
    setDeck(selected);
    setViewing(0);
    setView('study');
  };
  const handleNext = () => setViewing(v => Math.min(v + 1, deck.length - 1));
  const handlePrev = () => setViewing(v => Math.max(v - 1, 0));

  // 5️⃣ ANALYTICS VIEW
  if (view === 'analytics') {
    return (
      <div style={{ padding: 16 }}>
        <button onClick={() => setView('config')} style={{ marginBottom: 16 }}>
          ← Back
        </button>
        <Analytics />
      </div>
    );
  }

  // 6️⃣ CONFIG VIEW
  if (view === 'config') {
    return (
      <div>
        <header style={{ display: 'flex', justifyContent: 'flex-end', padding: 16 }}>
          <span style={{ marginRight: 16 }}>Hello, {user.displayName}</span>
          <button onClick={logout}>Sign Out</button>
        </header>

        <button
          onClick={() => setView('analytics')}
          style={{ position: 'fixed', top: 16, right: 16 }}
        >
          View Analytics
        </button>

        <ConfigForm data={dueCards} onStart={handleStart} />
      </div>
    );
  }

  // 7️⃣ STUDY VIEW
  const gm = loadGameMeta();
  const minXP = LEVEL_THRESHOLDS[gm.level - 1] ?? 0;
  const maxXP = LEVEL_THRESHOLDS[gm.level]     ?? (minXP + 100);
  const pct   = Math.min(100, Math.floor(((gm.xp - minXP) / (maxXP - minXP)) * 100));

  return (
    <div style={{ paddingBottom: 80 }}>
      <header style={{ padding: '16px', background: '#fafafa', maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>Level {gm.level}</div>
          <div>XP: {gm.xp} / {maxXP}</div>
          <div>🔥 {gm.streak}-day streak</div>
          <span style={{ marginLeft: 16 }}>{user.displayName}</span>
          <button onClick={logout}>Sign Out</button>
        </div>
        <div style={{ marginTop: 8, height: 12, background: '#e5e7eb', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: '#10b981' }} />
        </div>
      </header>

      <button
        onClick={() => setView('analytics')}
        style={{ position: 'fixed', top: 16, right: 16, zIndex: 10 }}
      >
        View Analytics
      </button>

      {viewing !== null && (
        <Flashcard
          card={deck[viewing]}
          index={viewing}
          total={deck.length}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}
    </div>
  );
}
