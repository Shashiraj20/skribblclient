import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socket from '../socket';

const GameContext = createContext(null);

const initialState = {
  phase: 'home',
  roomId: null,
  room: null,
  currentPlayer: null,
  players: [],
  round: 0,
  totalRounds: 3,
  drawerId: null,
  drawerName: '',
  word: null,
  hint: '',
  wordLength: 0,
  timeLeft: 0,
  messages: [],
  isDrawer: false,
  wordOptions: [],
  roundWord: null,
  winner: null,
  leaderboard: [],
  strokes: [],
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'ROOM_CREATED':
    case 'ROOM_JOINED':
      return {
        ...state,
        phase: 'lobby',
        roomId: action.payload.roomId,
        room: action.payload.room,
        currentPlayer: action.payload.player,
        players: action.payload.room.players,
        error: null,
      };
    case 'PLAYER_JOINED':
      return { ...state, players: action.payload.players };
    case 'PLAYER_LEFT':
      return { ...state, players: action.payload.players };
    case 'ROUND_START':
      return {
        ...state,
        phase: 'round_start',
        round: action.payload.round,
        totalRounds: action.payload.totalRounds,
        drawerId: action.payload.drawerId,
        drawerName: action.payload.drawerName,
        players: action.payload.players,
        isDrawer: action.payload.drawerId === state.currentPlayer?.id,
        word: null,
        hint: '',
        wordOptions: [],
        roundWord: null,
        strokes: [],
        messages: [...state.messages, {
          id: Date.now(),
          type: 'system',
          text: `Round ${action.payload.round}/${action.payload.totalRounds} — ${action.payload.drawerName} is drawing!`,
        }],
      };
    case 'WORD_OPTIONS':
      return { ...state, phase: 'word_selection', wordOptions: action.payload.words };
    case 'GAME_STATE':
      return {
        ...state,
        phase: action.payload.phase,
        round: action.payload.round,
        totalRounds: action.payload.totalRounds,
        drawerId: action.payload.drawerId,
        wordLength: action.payload.wordLength,
        hint: action.payload.hint,
        timeLeft: action.payload.timeLeft,
        isDrawer: action.payload.drawerId === state.currentPlayer?.id,
      };
    case 'DRAWER_WORD':
      return { ...state, word: action.payload.word, phase: 'drawing' };
    case 'DRAW_DATA':
      return { ...state };
    case 'CANVAS_CLEARED':
      return { ...state, strokes: [] };
    case 'CANVAS_UNDO':
      return { ...state, strokes: action.payload.strokes };
    case 'GUESS_RESULT':
      return {
        ...state,
        players: action.payload.players,
        messages: [...state.messages, {
          id: Date.now(),
          type: 'correct',
          text: `🎉 ${action.payload.playerName} guessed the word! (+${action.payload.points} pts)`,
        }],
      };
    case 'CHAT_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, {
          id: Date.now(),
          ...action.payload,
        }],
      };
    case 'HINT_UPDATE':
      return { ...state, hint: action.payload.hint };
    case 'TIMER_UPDATE':
      return { ...state, timeLeft: action.payload.timeLeft };
    case 'ROUND_END':
      return {
        ...state,
        phase: 'round_end',
        roundWord: action.payload.word,
        players: action.payload.players,
        messages: [...state.messages, {
          id: Date.now(),
          type: 'system',
          text: `⏱ Round over! The word was "${action.payload.word}"`,
        }],
      };
    case 'GAME_OVER':
      return {
        ...state,
        phase: 'game_over',
        winner: action.payload.winner,
        leaderboard: action.payload.leaderboard,
      };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();

  const canvasHandlers = { onDrawData: null };

  const registerCanvasHandler = useCallback((fn) => {
    canvasHandlers.onDrawData = fn;
  }, []);

  useEffect(() => {
    socket.connect();

    socket.on('room_created', (data) => {
      dispatch({ type: 'ROOM_CREATED', payload: data });
      navigate(`/lobby/${data.roomId}`);
    });

    socket.on('room_joined', (data) => {
      dispatch({ type: 'ROOM_JOINED', payload: data });
      navigate(`/lobby/${data.roomId}`);
    });

    socket.on('error', (data) => {
      dispatch({ type: 'SET_ERROR', payload: data.message });
    });

    socket.on('player_joined', (data) => {
      dispatch({ type: 'PLAYER_JOINED', payload: data });
    });

    socket.on('player_left', (data) => {
      dispatch({ type: 'PLAYER_LEFT', payload: data });
    });

    socket.on('round_start', (data) => {
      dispatch({ type: 'ROUND_START', payload: data });
      navigate(`/game/${data.drawerId}`);
    });

    socket.on('word_options', (data) => {
      dispatch({ type: 'WORD_OPTIONS', payload: data });
    });

    socket.on('game_state', (data) => {
      dispatch({ type: 'GAME_STATE', payload: data });
    });

    socket.on('drawer_word', (data) => {
      dispatch({ type: 'DRAWER_WORD', payload: data });
    });

    socket.on('draw_data', (data) => {
      if (canvasHandlers.onDrawData) canvasHandlers.onDrawData(data);
    });

    socket.on('canvas_cleared', () => {
      dispatch({ type: 'CANVAS_CLEARED' });
      if (canvasHandlers.onDrawData) canvasHandlers.onDrawData({ type: 'clear' });
    });

    socket.on('canvas_undo', (data) => {
      dispatch({ type: 'CANVAS_UNDO', payload: data });
      if (canvasHandlers.onDrawData) canvasHandlers.onDrawData({ type: 'undo', strokes: data.strokes });
    });

    socket.on('guess_result', (data) => {
      dispatch({ type: 'GUESS_RESULT', payload: data });
    });

    socket.on('chat_message', (data) => {
      dispatch({ type: 'CHAT_MESSAGE', payload: data });
    });

    socket.on('hint_update', (data) => {
      dispatch({ type: 'HINT_UPDATE', payload: data });
    });

    socket.on('timer_update', (data) => {
      dispatch({ type: 'TIMER_UPDATE', payload: data });
    });

    socket.on('round_end', (data) => {
      dispatch({ type: 'ROUND_END', payload: data });
    });

    socket.on('game_over', (data) => {
      dispatch({ type: 'GAME_OVER', payload: data });
    });

    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('error');
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('round_start');
      socket.off('word_options');
      socket.off('game_state');
      socket.off('drawer_word');
      socket.off('draw_data');
      socket.off('canvas_cleared');
      socket.off('canvas_undo');
      socket.off('guess_result');
      socket.off('chat_message');
      socket.off('hint_update');
      socket.off('timer_update');
      socket.off('round_end');
      socket.off('game_over');
    };
  }, [navigate]);

  const createRoom = useCallback((playerName, avatar, settings) => {
    dispatch({ type: 'CLEAR_ERROR' });
    socket.emit('create_room', { playerName, avatar, settings });
  }, []);

  const joinRoom = useCallback((roomId, playerName, avatar) => {
    dispatch({ type: 'CLEAR_ERROR' });
    socket.emit('join_room', { roomId: roomId.toUpperCase(), playerName, avatar });
  }, []);

  const startGame = useCallback(() => {
    socket.emit('start_game');
  }, []);

  const chooseWord = useCallback((word) => {
    socket.emit('word_chosen', { word });
  }, []);

  const sendGuess = useCallback((text) => {
    socket.emit('guess', { text });
  }, []);

  const sendChat = useCallback((text) => {
    socket.emit('chat', { text });
  }, []);

  const emitDrawStart = useCallback((data) => socket.emit('draw_start', data), []);
  const emitDrawMove = useCallback((data) => socket.emit('draw_move', data), []);
  const emitDrawEnd = useCallback(() => socket.emit('draw_end'), []);
  const emitCanvasClear = useCallback(() => socket.emit('canvas_clear'), []);
  const emitDrawUndo = useCallback(() => socket.emit('draw_undo'), []);

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), []);
  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET' });
    navigate('/');
  }, [navigate]);

  return (
    <GameContext.Provider value={{
      ...state,
      createRoom,
      joinRoom,
      startGame,
      chooseWord,
      sendGuess,
      sendChat,
      emitDrawStart,
      emitDrawMove,
      emitDrawEnd,
      emitCanvasClear,
      emitDrawUndo,
      clearError,
      resetGame,
      registerCanvasHandler,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
