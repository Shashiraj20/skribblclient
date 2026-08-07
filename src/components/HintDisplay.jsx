import { useGame } from '../contexts/GameContext';
import './HintDisplay.css';

export default function HintDisplay() {
  const { hint, word, wordLength, isDrawer, phase } = useGame();

  if (phase !== 'drawing' && phase !== 'round_start') return null;

  const display = isDrawer ? word : hint;
  if (!display && !wordLength) return null;

  return (
    <div className="hint-display">
      {isDrawer ? (
        <div className="drawer-word">
          <span className="drawer-label">Your word:</span>
          <span className="word-reveal">{word}</span>
        </div>
      ) : (
        <div className="hint-chars">
          {display ? (
            display.split('').map((char, i) => (
              <span key={i} className={char !== '_' ? 'hint-char revealed' : 'hint-char blank'}>
                {char === ' ' ? <span className="hint-space" /> : char !== '_' ? char : ''}
              </span>
            ))
          ) : (
            <span className="hint-length">{wordLength} letters</span>
          )}
        </div>
      )}
    </div>
  );
}
