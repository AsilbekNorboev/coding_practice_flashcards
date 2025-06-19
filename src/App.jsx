import { useState } from 'react';
import ConfigForm from './components/ConfigForm';
import Flashcard from './components/Flashcard';
import cardsData from './data/flashcards.json';

export default function App() {
  const [selected, setSelected] = useState([]);
  const [viewing, setViewing] = useState(null);

  const handleStart = cards => { setSelected(cards); setViewing(0); };

  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      {viewing === null ? (
        <ConfigForm data={cardsData} onStart={handleStart} />
      ) : (
        <Flashcard
          card={selected[viewing]}
          index={viewing}
          total={selected.length}
          onNext={() => setViewing(v => Math.min(v + 1, selected.length - 1))}
          onPrev={() => setViewing(v => Math.max(v - 1, 0))}
        />
      )}
    </div>
  );
}