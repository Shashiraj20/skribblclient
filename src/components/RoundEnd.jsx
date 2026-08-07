import { useGame } from '../contexts/GameContext';
import './RoundEnd.css';

export default function RoundEnd() {
  const { phase, roundWord, players, round, totalRounds } = useGame();
  if (phase !== 'round_end') return null;

  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="round-end-overlay">
      <div className="round-end-modal pop-in">
        <div className="round-end-word">
          <span className="rw-label">The word was</span>
          <span className="rw-word">"{roundWord}"</span>
        </div>
        <div className="round-end-scores">
          <div className="scores-header">Round {round}/{totalRounds} Scores</div>
          {sorted.map((p, i) => (
            <div key={p.id} className="score-row">
              <span className="sr-rank">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
              <span className="sr-avatar">{p.avatar}</span>
              <span className="sr-name">{p.name}</span>
              <span className="sr-score">{p.score} pts</span>
            </div>
          ))}
        </div>
        <p className="round-end-next">Next round starting soon...</p>
      </div>
    </div>
  );
}
