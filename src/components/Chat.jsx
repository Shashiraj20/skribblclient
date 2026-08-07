import { useState, useRef, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import './Chat.css';

export default function Chat() {
  const { messages, sendGuess, sendChat, isDrawer, phase, currentPlayer } = useGame();
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (phase === 'drawing' && !isDrawer) {
      sendGuess(trimmed);
    } else if (!isDrawer) {
      sendChat(trimmed);
    }
    setText('');
    inputRef.current?.focus();
  };

  const canType = !isDrawer || phase !== 'drawing';
  const placeholder = isDrawer
    ? "You're drawing – can't chat!"
    : phase === 'drawing'
    ? 'Type your guess...'
    : 'Chat...';

  return (
    <div className="chat-panel">
      <div className="chat-header">💬 Chat & Guesses</div>
      <div className="chat-messages">
        {messages.map(msg => (
          <ChatMessage key={msg.id} msg={msg} myId={currentPlayer?.id} />
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input">
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && canType && handleSend()}
          placeholder={placeholder}
          disabled={!canType}
          maxLength={100}
        />
        <button className="btn-primary send-btn" onClick={handleSend} disabled={!canType || !text.trim()}>
          ➤
        </button>
      </div>
    </div>
  );
}

function ChatMessage({ msg, myId }) {
  if (msg.type === 'system') {
    return <div className="msg-system">{msg.text}</div>;
  }
  if (msg.type === 'correct') {
    return <div className="msg-correct pop-in">{msg.text}</div>;
  }

  const isMe = msg.playerId === myId;
  return (
    <div className={`msg-chat ${isMe ? 'me' : ''}`}>
      <span className="msg-avatar">{msg.avatar}</span>
      <div className="msg-body">
        <span className="msg-name">{msg.playerName}</span>
        <span className="msg-text">{msg.text}</span>
      </div>
    </div>
  );
}
