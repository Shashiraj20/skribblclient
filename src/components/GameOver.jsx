import { useGame } from '../contexts/GameContext';
import './GameOver.css';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function GameOver() {
  const { phase, winner, leaderboard, resetGame } = useGame();
  if (phase !== 'game_over') return null;

  return (
    <div className="gameover-overlay">
      <div className="gameover-modal pop-in">
        <div className="gameover-title">🎉 Game Over!</div>

        {winner && (
          <div className="winner-card">
            <span className="winner-avatar">{winner.avatar}</span>
            <div>
              <div className="winner-label">🏆 Winner</div>
              <div className="winner-name">{winner.name}</div>
              <div className="winner-score">{winner.score} points</div>
            </div>
          </div>
        )}

        <div className="leaderboard">
          <div className="lb-header">Final Leaderboard</div>
          {leaderboard.map((p, i) => (
            <div key={p.id} className={`lb-row ${i === 0 ? 'first' : ''}`}>
              <span className="lb-rank">{MEDALS[i] || `#${i + 1}`}</span>
              <span className="lb-avatar">{p.avatar}</span>
              <span className="lb-name">{p.name}</span>
              <span className="lb-score">{p.score} pts</span>
            </div>
          ))}
        </div>

        <div className="gameover-actions">
          <button className="btn-primary" style={{ width: '100%', padding: 14, fontSize: 16 }} onClick={resetGame}>
            🏠 Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
