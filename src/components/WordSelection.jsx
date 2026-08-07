import { useGame } from '../contexts/GameContext';
import './WordSelection.css';

export default function WordSelection() {
  const { wordOptions, chooseWord, phase } = useGame();

  if (phase !== 'word_selection' || wordOptions.length === 0) return null;

  return (
    <div className="word-selection-overlay">
      <div className="word-selection-modal pop-in">
        <h3>Choose a word to draw!</h3>
        <p className="word-selection-sub">Pick wisely — you have 15 seconds</p>
        <div className="word-options">
          {wordOptions.map((w, i) => (
            <button key={i} className="word-option" onClick={() => chooseWord(w)}>
              {w}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
