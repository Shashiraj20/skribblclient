import { useRef, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../contexts/GameContext';
import Canvas from '../components/Canvas';
import DrawingTools from '../components/DrawingTools';
import Chat from '../components/Chat';
import WordSelection from '../components/WordSelection';
import PlayerList from '../components/PlayerList';
import HintDisplay from '../components/HintDisplay';
import Timer from '../components/Timer';
import RoundEnd from '../components/RoundEnd';
import GameOver from '../components/GameOver';
import './GamePage.css';

const DEFAULT_COLOR = '#000000';
const DEFAULT_SIZE = 8;

export default function GamePage() {
  const navigate = useNavigate();
  const {
    currentPlayer, phase, isDrawer, drawerId, drawerName, round, totalRounds,
    emitDrawStart, emitDrawMove, emitDrawEnd, emitCanvasClear, emitDrawUndo,
    registerCanvasHandler, resetGame,
  } = useGame();

  const canvasRef = useRef(null);
  const localStrokes = useRef([]);
  const localCurrentStroke = useRef(null);

  const [color, setColor] = useState(DEFAULT_COLOR);
  const [brushSize, setBrushSize] = useState(DEFAULT_SIZE);
  const [tool, setTool] = useState('brush');

  useEffect(() => {
    if (!currentPlayer) navigate('/');
  }, [currentPlayer, navigate]);

  useEffect(() => {
    registerCanvasHandler((data) => {
      canvasRef.current?.applyRemoteStroke(data);
    });
  }, [registerCanvasHandler]);

  useEffect(() => {
    if (phase === 'round_start' || phase === 'word_selection' || phase === 'drawing') {
      localStrokes.current = [];
      localCurrentStroke.current = null;
      canvasRef.current?.clearCanvas();
    }
  }, [phase, drawerId]);

  const handleDrawStart = useCallback((data) => {
    localCurrentStroke.current = {
      points: [{ x: data.x, y: data.y }],
      color: data.color,
      size: data.size,
      tool: data.tool,
    };
    emitDrawStart(data);
  }, [emitDrawStart]);

  const handleDrawMove = useCallback((data) => {
    if (localCurrentStroke.current) {
      localCurrentStroke.current.points.push({ x: data.x, y: data.y });
    }
    emitDrawMove(data);
  }, [emitDrawMove]);

  const handleDrawEnd = useCallback(() => {
    if (localCurrentStroke.current) {
      localStrokes.current.push(localCurrentStroke.current);
      localCurrentStroke.current = null;
    }
    emitDrawEnd();
  }, [emitDrawEnd]);

  const handleUndo = useCallback(() => {
    localStrokes.current.pop();
    localCurrentStroke.current = null;
    canvasRef.current?.redrawFromStrokes(localStrokes.current);
    emitDrawUndo();
  }, [emitDrawUndo]);

  const handleClear = useCallback(() => {
    localStrokes.current = [];
    localCurrentStroke.current = null;
    canvasRef.current?.clearCanvas();
    emitCanvasClear();
  }, [emitCanvasClear]);

  useEffect(() => {
    const onKey = (e) => {
      if (!isDrawer) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDrawer, handleUndo]);

  return (
    <div className="game-page">
      <div className="game-topbar">
        <div className="game-round-info">
          <span className="round-badge">Round {round}/{totalRounds}</span>
          {isDrawer
            ? <span className="drawer-tag">✏️ You're drawing!</span>
            : <span className="guesser-tag">🎯 {drawerName} is drawing</span>
          }
        </div>
        <HintDisplay />
        <Timer />
        <button className="btn-secondary leave-btn" onClick={resetGame}>🚪 Leave</button>
      </div>

      <div className="game-body">
        <PlayerList />

        <div className="canvas-section">
          <div className="canvas-wrapper">
            <Canvas
              ref={canvasRef}
              isDrawer={isDrawer}
              color={color}
              brushSize={brushSize}
              tool={tool}
              onDrawStart={handleDrawStart}
              onDrawMove={handleDrawMove}
              onDrawEnd={handleDrawEnd}
            />
            <WordSelection />
            <RoundEnd />
          </div>

          {isDrawer && (
            <DrawingTools
              color={color}
              setColor={setColor}
              brushSize={brushSize}
              setBrushSize={setBrushSize}
              tool={tool}
              setTool={setTool}
              onUndo={handleUndo}
              onClear={handleClear}
            />
          )}
        </div>

        <Chat />
      </div>

      <GameOver />
    </div>
  );
}
