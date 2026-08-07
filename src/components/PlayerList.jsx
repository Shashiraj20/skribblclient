import { useGame } from '../contexts/GameContext';
import './PlayerList.css';

export default function PlayerList() {
  const { players, drawerId, currentPlayer } = useGame();

  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="player-list-panel">
      <div className="panel-header">👥 Players</div>
      <div className="players-scroll">
        {sorted.map((p, i) => (
          <div
            key={p.id}
            className={[
              'score-player',
              p.isDrawing ? 'drawing' : '',
              p.hasGuessed ? 'guessed' : '',
              p.id === currentPlayer?.id ? 'me' : '',
            ].filter(Boolean).join(' ')}
          >
            <span className="rank">#{i + 1}</span>
            <span className="p-avatar">{p.avatar}</span>
            <div className="p-info">
              <span className="p-name">
                {p.name}
                {p.id === currentPlayer?.id && <span className="you-tag">you</span>}
              </span>
              <span className="p-score">{p.score} pts</span>
            </div>
            <div className="p-status">
              {p.isDrawing && <span className="status-icon" title="Drawing">✏️</span>}
              {p.hasGuessed && !p.isDrawing && <span className="status-icon" title="Guessed">✅</span>}
              {p.isHost && <span className="status-icon" title="Host">👑</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
