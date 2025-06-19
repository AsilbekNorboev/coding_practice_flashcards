import { useState } from 'react';

export default function ConfigForm({ data, onStart }) {
  const units = [...new Set(data.map(c => c.unit))];
  const [count, setCount] = useState(5);
  const [selectedUnits, setUnits] = useState(new Set(units));
  const [difficulty, setDiff] = useState(new Set(['standard', 'advanced']));

  const toggle = (setter, item) => {
    setter(prev => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const filtered = data.filter(
      c => selectedUnits.has(c.unit) && difficulty.has(c.difficulty)
    );
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    onStart(shuffled.slice(0, count));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 text-center">
        Flashcard Settings
      </h2>

      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Number of cards
        </label>
        <input
          type="number"
          min="1"
          max={data.length}
          value={count}
          onChange={e => setCount(+e.target.value)}
          className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div>
        <p className="font-medium text-gray-700 mb-2">Units</p>
        <div className="grid grid-cols-2 gap-2">
          {units.map(u => (
            <label key={u} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedUnits.has(u)}
                onChange={() => toggle(setUnits, u)}
                className="h-5 w-5"
              />
              <span>{u}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="font-medium text-gray-700 mb-2">Difficulty</p>
        <div className="flex space-x-4">
          {['standard', 'advanced'].map(d => (
            <label key={d} className="inline-flex items-center space-x-2">
              <input
                type="checkbox"
                checked={difficulty.has(d)}
                onChange={() => toggle(setDiff, d)}
                className="h-5 w-5"
              />
              <span className="capitalize">{d}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Start Practice
      </button>
    </form>
  );
}