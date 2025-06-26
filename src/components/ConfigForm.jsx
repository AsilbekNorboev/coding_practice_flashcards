// src/components/ConfigForm.jsx
import React, { useState, useEffect } from 'react';
import { loadFavorites } from '../utils/storage';
import { resetUnitSM2 } from '../utils/storage';


export default function ConfigForm({ dueData = [], allData = [], onStart }) {
  // Load favorites
  const [favArr, setFavArr] = useState(null);
  useEffect(() => {
    loadFavorites()
      .then(arr => setFavArr(arr))
      .catch(() => setFavArr([]));
  }, []);

  // State
  const [onlyFavs, setOnlyFavs]       = useState(false);
  const [count, setCount]             = useState(5);
  const [difficulty, setDiff]         = useState(new Set(['standard','advanced']));

  // We’ll build units from **dueData** by default
  const unitsAll = [...new Set(dueData.map(c => c.unit))];
  const [selectedUnits, setUnits]     = useState(new Set(unitsAll));

  const toggle = (setter, item) =>
    setter(prev => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });

  // Favorites set
  const favSet = favArr ? new Set(favArr.map(String)) : new Set();
  const hasFavs = Array.isArray(favArr) && favArr.length > 0;

  // Decide which base list to filter
  const baseList = onlyFavs && hasFavs
    ? allData
    : dueData;

  // If favoriting, unitsAll should come from allData


  // Apply filters
  let filtered = baseList;
  if (onlyFavs && hasFavs) {
    filtered = allData.filter(c => favSet.has(String(c.id)));
  } else {
    filtered = dueData.filter(
      c => selectedUnits.has(c.unit) && difficulty.has(c.difficulty)
    );
  }

  // Handlers
  const handleSubmit = e => {
    e.preventDefault();
    if (filtered.length === 0) return;
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    onStart(shuffled.slice(0, count));
  };

  const allSelected = selectedUnits.size === unitsAll.length;
  const handleSelectAll = () => {
    setUnits(prev => 
      prev.size === unitsAll.length
        ? new Set()
        : new Set(unitsAll)
    );
  };

  const container     = { backgroundColor: '#fff', padding: 32, borderRadius: 16, maxWidth: 640, width: '100%', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: 24 };
  const title         = { fontSize: 24, fontWeight: 700, textAlign: 'center', color: '#1f2937' };
  const section       = { display: 'flex', flexDirection: 'column', gap: 8 };
  const labelStyle    = { marginBottom: 4, fontWeight: 600, color: '#374151' };
  const input         = { padding: '8px 12px', fontSize: 16, borderRadius: 8, border: '1px solid #d1d5db' };
  const checkboxLabel = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 16 };
  const selectAllBtn  = { marginBottom: 8, padding: '4px 8px', fontSize: 14, borderRadius: 4, border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', cursor: 'pointer' };
  const btn           = { padding: '12px 24px', fontSize: 18, borderRadius: 12, border: 'none', cursor: 'pointer', backgroundColor: '#4f46e5', color: '#fff', fontWeight: 600, marginTop: 16, alignSelf: 'center' };
  const warning       = { color: '#e53e3e', textAlign: 'center' };
  // Styles (same as before
  const loadingFavs   = { fontSize: 14, color: '#6b7280' };

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

{/* Units + Select All */}
<div style={section}>
  <label style={labelStyle}>Units</label>
  <button type="button" onClick={handleSelectAll} style={selectAllBtn}>
    {allSelected ? 'Clear Selection' : 'Select All Units'}
  </button>

  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 8 }}>
    {unitsAll.map(u => (
      <div
        key={u}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',    // center children horizontally
          width: 180,               // adjust as needed
        }}
      >
        {/* checkbox + unit name */}
        <label style={checkboxLabel}>
          <input
            type="checkbox"
            checked={selectedUnits.has(u)}
            onChange={() => toggle(setUnits, u)}
          />
          <span style={{ marginLeft: 4 }}>{u}</span>
        </label>

        {/* reset button below the text, centered */}
        <button
          type="button"
          onClick={async () => {
            if (!window.confirm(`Reset SM-2 progress for “${u}”?`)) return;
            await resetUnitSM2(u);
            alert(`Unit “${u}” reset to default SM-2 values.`);
            window.location.reload();
          }}
          style={{
            marginTop: 6,
            padding: '4px 8px',
            fontSize: 12,
            background: 'none',
            border: '1px solid #e5e7eb',
            borderRadius: 4,
            color: '#b91c1c',
            cursor: 'pointer',
            alignSelf: 'center'      // center the button under the label
          }}
        >
          Reset
        </button>
      </div>
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

      {/* Favorites */}
      <div style={section}>
        {favArr === null ? (
          <div style={loadingFavs}>Loading favorites…</div>
        ) : (
          <label style={checkboxLabel}>
            <input
              type="checkbox"
              checked={onlyFavs}
              disabled={!hasFavs}
              onChange={e => setOnlyFavs(e.target.checked)}
            />
            <span>
              Only study my ★ favorites
              {!hasFavs && (
                <em style={{ marginLeft: 8, color: '#9ca3af' }}>
                  (no favorites yet)
                </em>
              )}
            </span>
          </label>
        )}
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
