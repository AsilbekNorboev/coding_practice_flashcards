// src/components/ConfigForm.jsx
import React, { useState } from 'react';
import { loadFavorites } from '../utils/storage';

export default function ConfigForm({ data, onStart }) {
  const [onlyFavs, setOnlyFavs]           = useState(false);
  const units                             = [...new Set(data.map(c => c.unit))];
  const [count, setCount]                 = useState(5);
  const [selectedUnits, setUnits]         = useState(new Set(units));
  const [difficulty, setDiff]             = useState(new Set(['standard', 'advanced']));

  const toggle = (setter, item) =>
    setter(prev => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });

  // Build the filtered list early
  const favSet    = new Set(loadFavorites());
  const initial   = onlyFavs ? data.filter(c => favSet.has(c.id)) : data;
  const filtered  = initial.filter(
    c => selectedUnits.has(c.unit) && difficulty.has(c.difficulty)
  );

  const handleSubmit = e => {
    e.preventDefault();
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    onStart(shuffled.slice(0, count));
  };

  // Inline style objects…
  const container     = { backgroundColor: '#fff', padding: 32, borderRadius: 16, maxWidth: 640, width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: 24 };
  const title         = { fontSize: 24, fontWeight: 700, textAlign: 'center', color: '#1f2937' };
  const section       = { display: 'flex', flexDirection: 'column', gap: 8 };
  const labelStyle    = { marginBottom: 4, fontWeight: 600, color: '#374151' };
  const input         = { padding: '8px 12px', fontSize: 16, borderRadius: 8, border: '1px solid #d1d5db' };
  const checkboxLabel = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 };
  const btn           = { padding: '12px 24px', fontSize: 18, borderRadius: 12, border: 'none', cursor: 'pointer', backgroundColor: '#4f46e5', color: '#fff', fontWeight: 600, marginTop: 16, alignSelf: 'center' };
  const msg           = { textAlign: 'center', color: '#e53e3e', fontSize: 18, padding: 32 };

  // If no cards after filtering, show message
  if (filtered.length === 0) {
    return <div style={msg}>No cards available in this deck. Try adjusting your filters.</div>;
  }

  return (
    <form onSubmit={handleSubmit} style={container}>
      <h2 style={title}>Flashcard Settings</h2>

      <div style={section}>
        <label style={labelStyle}>Number of cards</label>
        <input
          type="number"
          min="1"
          max={filtered.length}
          value={count}
          onChange={e => setCount(+e.target.value)}
          style={input}
        />
        <small>{filtered.length} cards match your filters</small>
      </div>

      <div style={section}>
        <label style={labelStyle}>Units</label>
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
        <label style={labelStyle}>Difficulty</label>
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

      <div style={section}>
        <label style={checkboxLabel}>
          <input
            type="checkbox"
            checked={onlyFavs}
            onChange={e => setOnlyFavs(e.target.checked)}
          />
          <span>Only study my ★ favorites</span>
        </label>
      </div>

      <button type="submit" style={btn}>
        Start Practice
      </button>
    </form>
  );
}
