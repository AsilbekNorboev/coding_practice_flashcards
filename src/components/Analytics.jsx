import React from 'react';
import cardsData from '../data/flashcards.json';
import { loadReviewHistory } from '../utils/storage';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';

// Custom labels for quality 0→5
const QUALITY_LABELS = [
  'Again',
  'Hard',
  'Still Struggling',
  'Easy',
  'Very Easy',
  'Mastered',
];

export default function Analytics() {
  const history = loadReviewHistory();
  const attemptedIds = new Set(history.map(ev => ev.cardId));

  // Build per-unit stats
  const unitMap = {};
  cardsData.forEach(card => {
    if (!unitMap[card.unit]) {
      unitMap[card.unit] = { unit: card.unit, total: 0, attempted: 0 };
    }
    unitMap[card.unit].total += 1;
    if (attemptedIds.has(card.id)) {
      unitMap[card.unit].attempted += 1;
    }
  });
  const perUnit = Object.values(unitMap).map(u => ({
    unit: u.unit,
    attempted: u.attempted,
    unattempted: u.total - u.attempted,
  }));

  // Quality distribution
  const qualityCounts = QUALITY_LABELS.map((label, q) => ({
    label,
    count: history.filter(ev => ev.quality === q).length,
  }));

  // Last 7 days history
  const today = new Date();
  const past7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const day = d.toISOString().slice(0, 10);
    return {
      date: day,
      reviews: history.filter(ev => ev.timestamp.startsWith(day)).length,
    };
  }).reverse();

  return (
    <div style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      <h2>Your Review Quality Distribution</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={qualityCounts}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>

      <h2 style={{ marginTop: 48 }}>Reviews in the Last 7 Days</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={past7}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="reviews" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>

      <h2 style={{ marginTop: 48 }}>Per-Unit Progress</h2>
      <div style={{ width: '90%', margin: '0 auto' }}>
        <ResponsiveContainer width="100%" height={perUnit.length * 50 + 60}>
          <BarChart
            layout="vertical"
            data={perUnit}
            margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              dataKey="unit"
              type="category"
              width={140}
              style={{ fontSize: 14 }}
            />
            <Tooltip />
            <Bar
              dataKey="unattempted"
              stackId="a"
              fill="#ef4444"
              name="Not Attempted"
              barSize={20}
            />
            <Bar
              dataKey="attempted"
              stackId="a"
              fill="#10b981"
              name="Attempted"
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
