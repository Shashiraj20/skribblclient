import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import './Lobby.css';

export default function Lobby() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { room, currentPlayer, players, startGame, error, phase, resetGame } = useGame();

  useEffect(() => {
    if (!currentPlayer) navigate('/');
  }, [currentPlayer, navigate]);

  useEffect(() => {
    if (phase === 'drawing' || phase === 'round_start') {
      navigate(`/game/${roomId}`);
    }
  }, [phase, roomId, navigate]);

  if (!room) return null;

  const isHost = currentPlayer?.isHost;
  const inviteUrl = `${window.location.origin}/?join=${room.roomId}`;
  const copyLink = () => navigator.clipboard.writeText(inviteUrl);
  const copyCode = () => navigator.clipboard.writeText(room.roomId);

  return (
    <div className="lobby">
      <div className="lobby-header">
        <button className="btn-secondary back-btn" onClick={resetGame}>← Leave</button>
        <div className="lobby-title">
          <h2>Lobby</h2>
          <div className="room-code-display">
            Room: <strong>{room.roomId}</strong>
            <button className="btn-icon" onClick={copyCode} title="Copy Code" style={{ fontSize: 14 }}>📋</button>
          </div>
        </div>
        <button className="btn-secondary invite-btn" onClick={copyLink}>🔗 Copy Invite Link</button>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 12 }}>{error}</div>}

      <div className="lobby-body">
        <div className="players-panel card">
          <h3>Players ({players.length}/{room.settings.maxPlayers})</h3>
          <div className="players-list">
            {players.map(p => (
              <div key={p.id} className={`lobby-player ${p.id === currentPlayer?.id ? 'me' : ''}`}>
                <span className="player-avatar">{p.avatar}</span>
                <span className="player-name">{p.name}</span>
                <div className="player-badges">
                  {p.isHost && <span className="tag tag-accent">👑 Host</span>}
                  {p.id === currentPlayer?.id && <span className="tag tag-info">You</span>}
                </div>
              </div>
            ))}
          </div>
          {players.length < 2 && (
            <p className="waiting-msg">⏳ Waiting for more players...</p>
          )}
        </div>

        <div className="settings-panel card">
          <h3>Game Settings</h3>
          <div className="settings-display">
            <SettingRow icon="🔄" label="Rounds" value={room.settings.rounds} />
            <SettingRow icon="⏱" label="Draw Time" value={`${room.settings.drawTime}s`} />
            <SettingRow icon="👥" label="Max Players" value={room.settings.maxPlayers} />
            <SettingRow icon="📝" label="Word Choices" value={room.settings.wordCount} />
            <SettingRow icon="💡" label="Hints" value={room.settings.hints} />
            <SettingRow icon="🔤" label="Word Mode" value={room.settings.wordMode} />
            <SettingRow icon={room.settings.isPrivate ? '🔒' : '🌐'} label="Room Type"
              value={room.settings.isPrivate ? 'Private' : 'Public'} />
            {room.settings.customWords?.length > 0 && (
              <SettingRow icon="✏️" label="Custom Words" value={`${room.settings.customWords.length} words`} />
            )}
          </div>

          <div className="lobby-actions">
            {isHost ? (
              <button
                className="btn-success start-btn"
                onClick={startGame}
                disabled={players.length < 2}
              >
                🎮 Start Game
              </button>
            ) : (
              <div className="waiting-host">Waiting for host to start...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ icon, label, value }) {
  return (
    <div className="setting-display-row">
      <span>{icon} {label}</span>
      <strong>{value}</strong>
    </div>
  );
}
