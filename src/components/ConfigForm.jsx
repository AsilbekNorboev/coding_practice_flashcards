// src/components/ConfigForm.jsx
import { useState } from 'react';

export default function ConfigForm({ data, onStart }) {
  const units = [...new Set(data.map(c => c.unit))];
  const [count, setCount] = useState(5);
  const [selectedUnits, setUnits] = useState(new Set(units));
  const [difficulty, setDiff] = useState(new Set(['standard', 'advanced']));

  const toggle = (setter, item) =>
    setter(prev => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });

  const handleSubmit = e => {
    e.preventDefault();
    const filtered = data.filter(
      c => selectedUnits.has(c.unit) && difficulty.has(c.difficulty)
    );
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    onStart(shuffled.slice(0, count));
  };

  // Inline style objects
  const container = {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    maxWidth: 640,
    width: '100%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: 24
  };
  const title = {
    fontSize: 24,
    fontWeight: 700,
    textAlign: 'center',
    color: '#1f2937'
  };
  const section = { display: 'flex', flexDirection: 'column', gap: 8 };
  const label = { marginBottom: 4, fontWeight: 600, color: '#374151' };
  const input = {
    padding: '8px 12px',
    fontSize: 16,
    borderRadius: 8,
    border: '1px solid #d1d5db'
  };
  const checkboxLabel = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 16
  };
  const btn = {
    padding: '12px 24px',
    fontSize: 18,
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    backgroundColor: '#4f46e5', // indigo
    color: '#fff',
    fontWeight: 600,
    marginTop: 16,
    alignSelf: 'center'
  };

  return (
    <form onSubmit={handleSubmit} style={container}>
      <h2 style={title}>Flashcard Settings</h2>

      <div style={section}>
        <label style={label}>Number of cards</label>
        <input
          type="number"
          min="1"
          max={data.length}
          value={count}
          onChange={e => setCount(+e.target.value)}
          style={input}
        />
      </div>

      <div style={section}>
        <label style={label}>Units</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {units.map(u => (
            <label key={u} style={checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedUnits.has(u)}
                onChange={() => toggle(setUnits, u)}
              />
              <span>{u}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={section}>
        <label style={label}>Difficulty</label>
        <div style={{ display: 'flex', gap: 12 }}>
          {['standard', 'advanced'].map(d => (
            <label key={d} style={checkboxLabel}>
              <input
                type="checkbox"
                checked={difficulty.has(d)}
                onChange={() => toggle(setDiff, d)}
              />
              <span style={{ textTransform: 'capitalize' }}>{d}</span>
            </label>
          ))}
        </div>
      </div>

      <button type="submit" style={btn}>
        Start Practice
      </button>
    </form>
  );
}
