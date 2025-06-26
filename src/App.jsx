// src/App.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import ConfigForm from './components/ConfigForm';
import Flashcard   from './components/Flashcard';
import Profile     from './components/Profile';
import Analytics   from './components/Analytics.jsx';
import cardsData   from './data/flashcards.json';
import toast       from 'react-hot-toast';

import settingIcon from './assets/images/setting_icon.png';

import { loadAllMeta, loadReviewHistory, loadGameMeta, saveGameMeta } from './utils/storage';
import { LEVEL_THRESHOLDS }                                         from './utils/game';

export default function App() {
  // 1) Auth
  const { user, loading, signInWithGoogle, logout } = useAuth();

  // 2) State
  const [gameMeta, setGameMeta] = useState(null);
  const [dueCards, setDueCards] = useState(null);
  const [view, setView]         = useState('config'); // 'config'|'study'|'analytics'|'profile'
  const [deck, setDeck]         = useState([]);
  const [viewing, setViewing]   = useState(null);

  // 3) Load & bump streak ONLY (no xp/level writes here)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function initGame() {
      // a) load from Firestore
      const gm    = await loadGameMeta();
      const today = new Date().toISOString().slice(0,10);

      // b) if not updated today, bump streak only
      if (gm.lastDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const ystr = yesterday.toISOString().slice(0,10);
        const newStreak = gm.lastDate === ystr ? gm.streak + 1 : 1;

        if (newStreak === 7 && !gm.badges.includes('streak-7')) {
          toast('🏅 7-Day Streak Unlocked!', { icon: '🏆', duration: 4000 });
        }

        // merge only streak & lastDate
        await saveGameMeta({
          streak:   newStreak,
          lastDate: today
        });

        gm.streak   = newStreak;
        gm.lastDate = today;
      }

      if (!cancelled) {
        setGameMeta(gm);
      }
    }

    initGame();
    return () => { cancelled = true; };
  }, [user]);

  // 4) Compute due cards
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function computeDue() {
      const meta = await loadAllMeta();
      const today = new Date().toISOString().slice(0,10);
      const due = cardsData.filter(card => {
        const next = meta[card.id]?.nextReview || card.nextReview;
        return next <= today;
      });
      if (!cancelled) setDueCards(due);
    }

    computeDue();
    return () => { cancelled = true; };
  }, [user]);

  // 5) Handlers
  const handleStart = selected => {
    setDeck(selected);
    setViewing(0);
    setView('study');
  };
  const handleNext = () => setViewing(v => Math.min(v + 1, deck.length - 1));
  const handlePrev = () => setViewing(v => Math.max(v - 1, 0));

  // 5.1) Whenever we enter Study mode, refresh gameMeta from Firestore
 useEffect(() => {
   if (view === 'study') {
     loadGameMeta().then(fresh => setGameMeta(fresh));
   }
 }, [view]);

  // 6) Loading/auth guards
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

  // 7) Wait for data
  if (gameMeta === null || dueCards === null) {
    return <div style={{ padding: 32 }}>Loading your progress…</div>;
  }
  // 8) Shared Nav

  const Nav = () => (
    <nav className="app-nav">
      <div className="nav-left">
        <button onClick={() => setView('config')} className="nav-btn">
          <img
            src={settingIcon}
            alt="Settings"
            style={{ width: 20, height: 20, marginRight: 8 }}
          />
          Settings
        </button>
      </div>

      <div className="nav-right">
        <button onClick={() => setView('profile')} className="nav-btn">
          <img
            src={user.photoURL}
            alt={user.displayName}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              objectFit: 'cover',
              marginRight: 8
            }}
          />
          Profile
        </button>
        <button onClick={() => setView('analytics')} className="nav-btn">
          Analytics
        </button>
        <button onClick={logout} className="nav-btn">
          Sign Out
        </button>
      </div>
    </nav>
  );
  // 9) Views
  if (view === 'profile') {
    return <>
      <Nav/>
      <Profile/>
    </>;
  }
  if (view === 'analytics') {
    return <>
      <Nav/>
      <div style={{ padding: 16 }}><Analytics/></div>
    </>;
  }
  if (view === 'config') {
    return <>
      <Nav/>
      <div className="app-container" style={{ paddingBottom: 80 }}>
      <ConfigForm dueData={dueCards} allData={cardsData} onStart={handleStart}/>
      </div>
    </>;
  }

  // 10) Study view
  const minXP = LEVEL_THRESHOLDS[gameMeta.level - 1] ?? 0;
  const maxXP = LEVEL_THRESHOLDS[gameMeta.level]     ?? (minXP + 100);
  const pct   = Math.min(100, Math.floor(((gameMeta.xp - minXP) / (maxXP - minXP)) * 100));

  return (
    <>
      <Nav/>
      {/* Full-bleed, sticky level bar */}
      <div className="app-header">
        <div className="header-inner">
          <div>Level {gameMeta.level}</div>
          <div>XP: {gameMeta.xp} / {maxXP}</div>
          <div>🔥 {gameMeta.streak}-day streak</div>
          <span>{user.displayName}</span>
        </div>
        <div className="header-inner progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="app-container" style={{ paddingBottom: 80 }}>
      <div style={{ paddingBottom:80 }}>

        <Flashcard
          card={deck[viewing]}
          index={viewing}
          total={deck.length}
          onNext={handleNext}
          onPrev={handlePrev}
          onUpdateGameMeta={setGameMeta}
        />
      </div>
      </div>
    </>
  );
}