import { useEffect, useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { useGameStore } from '../store/gameStore';
import { apiService } from '../services/api';

export function VideoPanel() {
  const [token, setToken] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const proximityPlayers = useGameStore((state) => state.proximityPlayers);
  const currentRoomId = useGameStore((state) => state.currentRoomId);

  useEffect(() => {
    // Get LiveKit token when proximity players change or room changes
    if (proximityPlayers.length > 0 || currentRoomId) {
      connectToLiveKit();
    }
  }, [proximityPlayers, currentRoomId]);

  const connectToLiveKit = async () => {
    setIsConnecting(true);
    try {
      const result = currentRoomId
        ? await apiService.getLiveKitRoomToken(currentRoomId)
        : await apiService.getLiveKitProximityToken();

      setToken(result.token);
    } catch (error) {
      console.error('Failed to get LiveKit token:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const wsUrl = import.meta.env.VITE_LIVEKIT_WS_URL;

  if (!token || !wsUrl) {
    return (
      <div className="absolute top-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg">
        {isConnecting ? (
          <p>Connecting to video...</p>
        ) : (
          <p className="text-sm text-gray-400">
            {proximityPlayers.length === 0 && !currentRoomId
              ? 'Move near other players for video chat'
              : 'Video unavailable'}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 w-96 bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={wsUrl}
        data-lk-theme="default"
        style={{ height: '300px' }}
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}
