// src/App.jsx
import { useState, useEffect } from 'react';
import ConfigForm from './components/ConfigForm';
import Flashcard from './components/Flashcard';
import cardsData from './data/flashcards.json';
import { loadAllMeta } from './utils/storage';

export default function App() {
  // Load all cards and persisted metadata
  const allCards = cardsData;
  const meta     = loadAllMeta();
  const today    = new Date().toISOString().split('T')[0];

  // Filter only cards whose nextReview is today or earlier
  const dueCards = allCards.filter(card => {
    const next = meta[card.id]?.nextReview || card.nextReview;
    return next <= today;
  });

  // State to hold the deck we’ll practice
  const [deck, setDeck] = useState([]);
  // Index of the currently-viewed card, or null if not started
  const [viewing, setViewing] = useState(null);

  // When the user submits the ConfigForm, we initialize the deck
  const handleStart = (selectedCards) => {
    setDeck(selectedCards);
    setViewing(0);
  };

  // Once the user has selected how many cards/units/etc,
  // pass the dueCards into ConfigForm as the data source
  if (viewing === null) {
    return (
      <ConfigForm
        data={dueCards}
        onStart={handleStart}
      />
    );
  }

  // Otherwise show the Flashcard viewer for deck[viewing]
  return (
    <Flashcard
      card={deck[viewing]}
      index={viewing}
      total={deck.length}
      onNext={() => setViewing(v => Math.min(v + 1, deck.length - 1))}
      onPrev={() => setViewing(v => Math.max(v - 1, 0))}
    />
  );
}
