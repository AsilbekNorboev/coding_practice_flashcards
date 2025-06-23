// src/components/Badges.jsx
import React from 'react';
import { loadGameMeta } from '../utils/game';

function Badges() {
  const { badges } = loadGameMeta();
  return (
    <div style={{ padding: 32 }}>
      <h3>Your Badges</h3>
      <ul>
        {badges.map(id => (
          <li key={id}>{id.replace(/-/g, ' ').toUpperCase()}</li>
        ))}
      </ul>
    </div>
  );
}

export default Badges;
