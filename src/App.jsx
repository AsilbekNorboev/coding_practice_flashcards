// src/App.jsx
import { useState } from 'react';
import ConfigForm from './components/ConfigForm';
import Flashcard from './components/Flashcard';
import Analytics from './components/Analytics.jsx'
import cardsData from './data/flashcards.json';
import { loadAllMeta } from './utils/storage';

export default function App() {
// Persistent metadata and card data
const meta = loadAllMeta();
const today = new Date().toISOString().split('T')[0];

// Only cards due for review
const dueCards = cardsData.filter(card => {
const next = meta[card.id]?.nextReview || card.nextReview;
return next <= today;
});

// App views: 'config' | 'study' | 'analytics'
const [view, setView] = useState('config');
const [deck, setDeck] = useState([]);
const [viewing, setViewing] = useState(null);

// Initialize deck when starting practice
const handleStart = selectedCards => {
setDeck(selectedCards);
setViewing(0);
setView('study');
};

// Navigate cards
const handleNext = () => setViewing(v => Math.min(v + 1, deck.length - 1));
const handlePrev = () => setViewing(v => Math.max(v - 1, 0));

// Render analytics view
if (view === 'analytics') {
return (
<div style={{ padding: 16 }}>
<button onClick={() => setView('config')} style={{ marginBottom: 16 }}>
← Back </button> <Analytics /> </div>
);
}

// Show config form
if (view === 'config') {
return ( <div>
<button
onClick={() => setView('analytics')}
style={{ position: 'fixed', top: 16, right: 16 }}>
View Analytics </button> <ConfigForm data={dueCards} onStart={handleStart} /> </div>
);
}

// Study view: show flashcards
return ( <div>
<button
onClick={() => setView('analytics')}
style={{ position: 'fixed', top: 16, right: 16 }}>
View Analytics </button> <Flashcard
     card={deck[viewing]}
     index={viewing}
     total={deck.length}
     onNext={handleNext}
     onPrev={handlePrev}
   /> </div>
);
}

