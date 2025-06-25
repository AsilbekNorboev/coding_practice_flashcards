// src/components/ConfigForm.jsx
import React, { useState } from 'react';
import { loadFavorites } from '../utils/storage';

export default function ConfigForm({ data, onStart }) {
  const unitsAll = [...new Set(data.map(c => c.unit))];

  const [onlyFavs, setOnlyFavs]       = useState(false);
  const [count, setCount]             = useState(5);
  const [selectedUnits, setUnits]     = useState(new Set());
  const [difficulty, setDiff]         = useState(new Set(['standard', 'advanced']));

  const toggle = (setter, item) =>
    setter(prev => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });

  // “Select All” / “Clear” for units
  const allSelected = selectedUnits.size === unitsAll.length;
  const handleSelectAll = () => {
    setUnits(allSelected ? new Set() : new Set(unitsAll));
  };

  // Build filtered list
  const favArr = loadFavorites();
  const favSet = new Set(favArr);

  let filtered = data;

  if (onlyFavs) {
    // ignore units/difficulty when filtering favorites
    filtered = filtered.filter(c => favSet.has(c.id));
  } else {
    // normal filtering by units & difficulty
    filtered = filtered.filter(
      c => selectedUnits.has(c.unit) && difficulty.has(c.difficulty)
    );
  }

  const handleSubmit = e => {
    e.preventDefault();
    if (filtered.length === 0) return;
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    onStart(shuffled.slice(0, count));
  };

  // Inline styles
  const container     = { backgroundColor: '#fff', padding: 32, borderRadius: 16, maxWidth: 640, width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: 24 };
  const title         = { fontSize: 24, fontWeight: 700, textAlign: 'center', color: '#1f2937' };
  const section       = { display: 'flex', flexDirection: 'column', gap: 8 };
  const labelStyle    = { marginBottom: 4, fontWeight: 600, color: '#374151' };
  const input         = { padding: '8px 12px', fontSize: 16, borderRadius: 8, border: '1px solid #d1d5db' };
  const checkboxLabel = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 };
  const selectAllBtn  = { marginBottom: 8, padding: '4px 8px', fontSize: 14, borderRadius: 4, border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', cursor: 'pointer' };
  const btn           = { padding: '12px 24px', fontSize: 18, borderRadius: 12, border: 'none', cursor: 'pointer', backgroundColor: '#4f46e5', color: '#fff', fontWeight: 600, marginTop: 16, alignSelf: 'center' };
  const warning       = { color: '#e53e3e', textAlign: 'center' };

  return (
    <form onSubmit={handleSubmit} style={container}>
      <h2 style={title}>Flashcard Settings</h2>

      {/* Number of cards */}
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

      {/* Units selection + Select All */}
      <div style={section}>
        <label style={labelStyle}>Units</label>
        <button
          type="button"
          onClick={handleSelectAll}
          style={selectAllBtn}
        >
          {allSelected ? 'Clear Selection' : 'Select All Units'}
        </button>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {unitsAll.map(u => (
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

      {/* Difficulty */}
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

      {/* Favorites filter */}
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

      {/* Inline warning if no cards */}
      {filtered.length === 0 && (
        <div style={warning}>⚠️ No cards match these settings.</div>
      )}

      {/* Start Practice */}
      <button
        type="submit"
        style={{ 
          ...btn,
          opacity: filtered.length === 0 ? 0.5 : 1,
          cursor: filtered.length === 0 ? 'not-allowed' : 'pointer'
        }}
        disabled={filtered.length === 0}
      >
        Start Practice
      </button>
    </form>
  );
}
