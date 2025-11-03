import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { socketService } from './services/socket';
import { Auth } from './components/Auth';
import { GameCanvas } from './components/GameCanvas';
import { VideoPanel } from './components/VideoPanel';
import { ChatBox } from './components/ChatBox';
import { UserList } from './components/UserList';
import { Controls } from './components/Controls';

function App() {
  const isAuthenticated = useGameStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      // Connect to socket when authenticated
      socketService.connect();

      return () => {
        socketService.disconnect();
      };
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-900">
      {/* Game Canvas */}
      <GameCanvas />

      {/* UI Overlays */}
      <UserList />
      <VideoPanel />
      <ChatBox />
      <Controls />
    </div>
  );
}

export default App;
