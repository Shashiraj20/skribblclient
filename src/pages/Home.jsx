import { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import './Home.css';

const AVATARS = ['🎨', '🦊', '🐼', '🦁', '🐸', '🦄', '🐙', '🦋', '🐺', '🦅', '🐬', '🦖'];

const DEFAULT_SETTINGS = {
  maxPlayers: 8,
  rounds: 3,
  drawTime: 80,
  wordCount: 3,
  hints: 2,
  wordMode: 'normal',
  isPrivate: false,
  customWords: [],
};

export default function Home() {
  const { createRoom, joinRoom, error, clearError } = useGame();
  const [tab, setTab] = useState('create');
  const [name, setName] = useState(() => sessionStorage.getItem('playerName') || '');
  const [avatar, setAvatar] = useState(() => sessionStorage.getItem('avatar') || AVATARS[0]);
  const [roomCode, setRoomCode] = useState('');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [publicRooms, setPublicRooms] = useState([]);
  const [customWordsText, setCustomWordsText] = useState('');

  useEffect(() => {
    clearError();
    if (tab === 'browse') fetchPublicRooms();
  }, [tab]);

  const fetchPublicRooms = async () => {
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setPublicRooms(data);
    } catch { /* ignore */ }
  };

  const saveName = (v) => {
    setName(v);
    sessionStorage.setItem('playerName', v);
  };

  const saveAvatar = (v) => {
    setAvatar(v);
    sessionStorage.setItem('avatar', v);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    const custom = customWordsText.split(',').map(w => w.trim()).filter(Boolean);
    createRoom(name.trim(), avatar, { ...settings, customWords: custom });
  };

  const handleJoin = () => {
    if (!name.trim() || !roomCode.trim()) return;
    joinRoom(roomCode.trim(), name.trim(), avatar);
  };

  const setSetting = (key, val) => setSettings(s => ({ ...s, [key]: val }));

  return (
    <div className="home">
      <header className="home-header">
        <div className="home-logo">
          <span className="logo-icon">✏️</span>
          <h1>Skribbl</h1>
        </div>
        <p className="home-subtitle">Draw, guess, and have fun!</p>
      </header>

      <div className="home-content">
        <div className="player-setup card">
          <label className="label">Your Name</label>
          <input
            maxLength={20}
            placeholder="Enter your name..."
            value={name}
            onChange={e => saveName(e.target.value)}
          />
          <label className="label" style={{ marginTop: 16 }}>Avatar</label>
          <div className="avatar-grid">
            {AVATARS.map(a => (
              <button
                key={a}
                className={`avatar-btn ${avatar === a ? 'selected' : ''}`}
                onClick={() => saveAvatar(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="tabs card">
          <div className="tab-bar">
            {['create', 'join', 'browse'].map(t => (
              <button
                key={t}
                className={`tab-btn ${tab === t ? 'active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'create' ? '🎮 Create Room' : t === 'join' ? '🚪 Join Room' : '🌐 Browse'}
              </button>
            ))}
          </div>

          {error && <div className="error-msg" style={{ marginBottom: 12 }}>{error}</div>}

          {tab === 'create' && (
            <div className="tab-panel fade-in">
              <div className="settings-grid">
                <div className="setting-row">
                  <label className="label">Max Players</label>
                  <input type="number" min="2" max="20" value={settings.maxPlayers}
                    onChange={e => setSetting('maxPlayers', +e.target.value)} />
                </div>
                <div className="setting-row">
                  <label className="label">Rounds</label>
                  <input type="number" min="1" max="10" value={settings.rounds}
                    onChange={e => setSetting('rounds', +e.target.value)} />
                </div>
                <div className="setting-row">
                  <label className="label">Draw Time (sec)</label>
                  <input type="number" min="15" max="240" value={settings.drawTime}
                    onChange={e => setSetting('drawTime', +e.target.value)} />
                </div>
                <div className="setting-row">
                  <label className="label">Word Choices</label>
                  <input type="number" min="1" max="5" value={settings.wordCount}
                    onChange={e => setSetting('wordCount', +e.target.value)} />
                </div>
                <div className="setting-row">
                  <label className="label">Hints</label>
                  <input type="number" min="0" max="5" value={settings.hints}
                    onChange={e => setSetting('hints', +e.target.value)} />
                </div>
                <div className="setting-row">
                  <label className="label">Word Mode</label>
                  <select value={settings.wordMode} onChange={e => setSetting('wordMode', e.target.value)}>
                    <option value="normal">Normal</option>
                    <option value="hidden">Hidden</option>
                    <option value="combination">Combination</option>
                  </select>
                </div>
              </div>

              <div className="setting-row" style={{ marginTop: 8 }}>
                <label className="label">Custom Words (comma-separated, optional)</label>
                <textarea
                  placeholder="apple, banana, rocket..."
                  value={customWordsText}
                  onChange={e => setCustomWordsText(e.target.value)}
                  style={{ height: 60, resize: 'vertical' }}
                />
              </div>

              <label className="private-toggle">
                <input type="checkbox" checked={settings.isPrivate}
                  onChange={e => setSetting('isPrivate', e.target.checked)} />
                <span>🔒 Private Room (invite-only)</span>
              </label>

              <button className="btn-primary" style={{ width: '100%', marginTop: 16, padding: 14 }}
                onClick={handleCreate} disabled={!name.trim()}>
                Create Room
              </button>
            </div>
          )}

          {tab === 'join' && (
            <div className="tab-panel fade-in">
              <label className="label">Room Code</label>
              <input
                placeholder="Enter room code (e.g. AB3F1C2D)"
                value={roomCode}
                onChange={e => setRoomCode(e.target.value.toUpperCase())}
                maxLength={8}
                style={{ letterSpacing: '0.2em', textAlign: 'center', fontSize: 18 }}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
              />
              <button className="btn-primary" style={{ width: '100%', marginTop: 16, padding: 14 }}
                onClick={handleJoin} disabled={!name.trim() || !roomCode.trim()}>
                Join Room
              </button>
            </div>
          )}

          {tab === 'browse' && (
            <div className="tab-panel fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="label" style={{ margin: 0 }}>Open Rooms ({publicRooms.length})</span>
                <button className="btn-secondary" style={{ padding: '6px 12px' }} onClick={fetchPublicRooms}>🔄 Refresh</button>
              </div>
              {publicRooms.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text2)', padding: 24 }}>
                  No public rooms available. Create one!
                </div>
              ) : (
                <div className="rooms-list">
                  {publicRooms.map(r => (
                    <div key={r.roomId} className="room-card">
                      <div>
                        <div className="room-code">{r.roomId}</div>
                        <div className="room-info">
                          {r.playerCount}/{r.settings.maxPlayers} players · {r.settings.rounds} rounds
                        </div>
                      </div>
                      <button className="btn-primary" style={{ padding: '8px 16px' }}
                        onClick={() => { setRoomCode(r.roomId); setTab('join'); }}
                        disabled={!name.trim()}>
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
