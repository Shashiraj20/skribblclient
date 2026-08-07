import { useGame } from '../contexts/GameContext';
import './Timer.css';

export default function Timer() {
  const { timeLeft, room, phase } = useGame();
  if (phase !== 'drawing') return null;

  const maxTime = room?.settings?.drawTime || 80;
  const pct = Math.max(0, (timeLeft / maxTime) * 100);
  const isUrgent = timeLeft <= 10;

  return (
    <div className={`timer ${isUrgent ? 'urgent' : ''}`}>
      <div className="timer-bar-bg">
        <div
          className="timer-bar-fill"
          style={{
            width: `${pct}%`,
            background: isUrgent ? 'var(--accent)' : timeLeft <= 30 ? 'var(--warning)' : 'var(--success)',
          }}
        />
      </div>
      <span className="timer-count">{timeLeft}s</span>
    </div>
  );
}
