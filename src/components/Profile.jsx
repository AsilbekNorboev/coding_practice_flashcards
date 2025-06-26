// src/components/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { loadReviewHistory, loadGameMeta } from '../utils/storage';
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid
} from 'recharts';

export default function Profile() {
  const { user, logout } = useAuth();
  const [meta, setMeta]      = useState(null);
  const [history, setHistory]= useState([]);

  useEffect(() => {
    loadGameMeta().then(setMeta);
    loadReviewHistory().then(setHistory);
  }, []);

  if (!meta) return <div style={{ padding: 32 }}>Loading profile…</div>;

  // total reviews
  const totalReviews = history.length;

  // quality distribution
  const QUALITY_LABELS = ['Again','Hard','Struggling','Easy','Very Easy','Mastered'];
  const qualityCounts = QUALITY_LABELS.map((label, q) => ({
    label,
    count: history.filter(ev => ev.quality === q).length
  }));

  // last 7 days data
  const past7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const day = d.toISOString().slice(0,10);
    return {
      date: day.slice(5),  // MM-DD
      reviews: history.filter(ev => ev.timestamp.startsWith(day)).length
    };
  });

  return (
    <div style={{
      maxWidth: 800,
      margin: '32px auto',
      fontFamily: 'sans-serif',
      color: '#333'
    }}>
      {/* Header Card */}
      <div style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        background: 'linear-gradient(135deg,#4f46e5,#3b82f6)',
        color: 'white',
        padding: '48px 24px 80px',
        textAlign: 'center'
      }}>
        <img
          src={user.photoURL}
          alt="avatar"
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            border: '4px solid white',
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        />
        <h1 style={{ marginTop: 144, fontSize: '2rem' }}>{user.displayName}</h1>
        <p style={{ opacity: 0.9, marginBottom: 24 }}>{user.email}</p>

        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          background: 'white',
          color: '#333',
          borderRadius: 12,
          margin: '0 24px',
          padding: '16px 0',
          position: 'relative',
          top: 40
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalReviews}</div>
            <div style={{ fontSize: '0.9rem' }}>Reviews</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{meta.xp}</div>
            <div style={{ fontSize: '0.9rem' }}>XP</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Lvl {meta.level}</div>
            <div style={{ fontSize: '0.9rem' }}>Level</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{meta.streak} Day 🔥</div>
            <div style={{ fontSize: '0.9rem' }}>Streak</div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:12, padding:'16px 24px' }}>
        {meta.badges.map(b => (
          <span key={b} style={{
            padding:'8px 12px',
            background:'#f3f4f6',
            borderRadius:8,
            fontSize:'0.85rem'
          }}>
            🏅 {b.replace(/-/g,' ')}
          </span>
        ))}
      </div>

      {/* Charts */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'1fr 1fr',
        gap:24,
        padding:'0 24px 24px'
      }}>
        {/* Quality Bar */}
        <div style={{
          background:'white',
          padding:16,
          borderRadius:12,
          boxShadow:'0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ marginBottom:12 }}>Quality Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={qualityCounts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize:12 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Last 7 Days Line */}
        <div style={{
          background:'white',
          padding:16,
          borderRadius:12,
          boxShadow:'0 2px 8px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ marginBottom:12 }}>Last 7 Days Reviews</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={past7}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="reviews" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ textAlign:'center', marginTop:24 }}>
        <button
          onClick={logout}
          style={{
            padding:'10px 20px',
            fontSize:16,
            borderRadius:8,
            border:'none',
            background:'#ef4444',
            color:'white',
            cursor:'pointer'
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
