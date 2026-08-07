import { Routes, Route } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import GamePage from './pages/GamePage';

export default function App() {
  return (
    <GameProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lobby/:roomId" element={<Lobby />} />
        <Route path="/game/:roomId" element={<GamePage />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </GameProvider>
  );
}
