import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useTracks,
  useParticipants,
  ParticipantTile,
  VideoTrack,
  TrackLoop,
  useLocalParticipant,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { useGameStore } from '../store/gameStore';
import { apiService } from '../services/api';
import { socketService } from '../services/socket';
import { SOCKET_EVENTS } from '@mini-gather/shared';

// Media controls component for camera, mic, and screenshare
function MediaControls() {
  const { localParticipant } = useLocalParticipant();
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const toggleCamera = async () => {
    if (localParticipant) {
      const enabled = !isCameraEnabled;
      await localParticipant.setCameraEnabled(enabled);
      setIsCameraEnabled(enabled);
    }
  };

  const toggleMicrophone = async () => {
    if (localParticipant) {
      const enabled = !isMicEnabled;
      await localParticipant.setMicrophoneEnabled(enabled);
      setIsMicEnabled(enabled);
    }
  };

  const toggleScreenShare = async () => {
    if (localParticipant) {
      const enabled = !isScreenSharing;
      await localParticipant.setScreenShareEnabled(enabled);
      setIsScreenSharing(enabled);
    }
  };

  return (
    <div className="flex gap-2 bg-gray-800/90 p-3 rounded-lg shadow-lg backdrop-blur">
      {/* Camera Toggle */}
      <button
        onClick={toggleCamera}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          isCameraEnabled
            ? 'bg-blue-600 hover:bg-blue-700 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
        }`}
        title={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
      >
        {isCameraEnabled ? '📹 Camera On' : '📹 Camera Off'}
      </button>

      {/* Microphone Toggle */}
      <button
        onClick={toggleMicrophone}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          isMicEnabled
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
        }`}
        title={isMicEnabled ? 'Mute microphone' : 'Unmute microphone'}
      >
        {isMicEnabled ? '🎤 Mic On' : '🎤 Mic Off'}
      </button>

      {/* Screen Share Toggle */}
      <button
        onClick={toggleScreenShare}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          isScreenSharing
            ? 'bg-purple-600 hover:bg-purple-700 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
        }`}
        title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
      >
        {isScreenSharing ? '🖥️ Sharing' : '🖥️ Share Screen'}
      </button>
    </div>
  );
}

// Custom layout component that handles screenshare fullscreen display
function CustomVideoLayout() {
  const screenShareTracks = useTracks([Track.Source.ScreenShare]);
  const cameraTracks = useTracks([Track.Source.Camera]);
  const participants = useParticipants();

  console.log('🎥 CustomVideoLayout rendering, camera tracks:', cameraTracks.length);

  // If screenshare is active, show it fullscreen
  if (screenShareTracks.length > 0) {
    const screenshareUI = (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center" style={{ pointerEvents: 'auto' }}>
        {/* Main screenshare video - centered and large */}
        <div className="relative w-full h-full flex items-center justify-center p-8">
          <VideoTrack
            trackRef={screenShareTracks[0]}
            className="w-full h-full object-contain"
          />

          {/* Close button / info */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              // User can't close screenshare - only presenter can stop sharing
            }}
            className="absolute top-4 right-4 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-lg cursor-default z-[10000]"
            title="Screenshare will close when presenter stops sharing"
          >
            🖥️ Screenshare Active
          </button>

          {/* Media controls at top center */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[10000]" style={{ pointerEvents: 'auto' }}>
            <MediaControls />
          </div>
        </div>

        {/* Participant thumbnails at bottom */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-gray-900/80 p-2 rounded-lg backdrop-blur z-[10000]">
          <TrackLoop tracks={cameraTracks.slice(0, 6)}>
            <div className="w-24 h-24">
              <ParticipantTile />
            </div>
          </TrackLoop>
          {participants.length > 6 && (
            <div className="w-24 h-24 bg-gray-800 rounded flex items-center justify-center text-white text-sm">
              +{participants.length - 6}
            </div>
          )}
        </div>
      </div>
    );

    // Render screenshare UI via portal to escape LiveKitRoom container
    return createPortal(screenshareUI, document.body);
  }

  // No screenshare - show normal video grid and controls
  const normalUI = (
    <>
      {/* Media controls - positioned at bottom center with high z-index */}
      <div
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[9999]"
        style={{ pointerEvents: 'auto' }}
      >
        <MediaControls />
      </div>

      {/* Video grid panel with high z-index */}
      <div
        className="fixed top-16 right-4 w-96 max-h-[600px] bg-gray-900 rounded-lg shadow-lg overflow-auto z-[9998]"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="p-2 border-b border-gray-700">
          <h3 className="text-white text-sm font-medium">
            Video Call ({cameraTracks.length} {cameraTracks.length === 1 ? 'participant' : 'participants'})
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2 p-2">
          <TrackLoop tracks={cameraTracks}>
            <ParticipantTile />
          </TrackLoop>
          {cameraTracks.length === 0 && (
            <div className="col-span-2 text-center text-gray-400 py-8">
              <p className="mb-2">No video yet</p>
              <p className="text-xs">Turn on camera to start</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // Render normal UI via portal to escape LiveKitRoom container
  return createPortal(normalUI, document.body);
}

export function VideoPanel() {
  const [token, setToken] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionKey, setConnectionKey] = useState(0); // Force reconnect

  const proximityPlayers = useGameStore((state) => state.proximityPlayers);
  const currentRoomId = useGameStore((state) => state.currentRoomId);
  const currentZoneId = useGameStore((state) => state.currentZoneId);
  const currentZone = useGameStore((state) => state.currentZone);
  const setCurrentZone = useGameStore((state) => state.setCurrentZone);

  const prevZoneRef = useRef<string | null>(null);

  // Listen for zone changes from server
  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    const handleZoneEnter = (data: any) => {
      console.log('🚪 Entered zone:', data.zoneId, data.zone);
      setCurrentZone(data.zoneId, data.zone);
    };

    const handleZoneLeave = (data: any) => {
      console.log('🚪 Left zone:', data.zoneId);
      setCurrentZone(null, null);
    };

    socket.on(SOCKET_EVENTS.ZONE_ENTER, handleZoneEnter);
    socket.on(SOCKET_EVENTS.ZONE_LEAVE, handleZoneLeave);

    return () => {
      socket.off(SOCKET_EVENTS.ZONE_ENTER, handleZoneEnter);
      socket.off(SOCKET_EVENTS.ZONE_LEAVE, handleZoneLeave);
    };
  }, [setCurrentZone]);

  // Connect to appropriate LiveKit room based on zone/room/proximity
  useEffect(() => {
    // Detect zone change
    if (prevZoneRef.current !== currentZoneId) {
      console.log('Zone changed from', prevZoneRef.current, 'to', currentZoneId);
      prevZoneRef.current = currentZoneId;

      // Force reconnect when zone changes
      setToken('');
      setConnectionKey(prev => prev + 1);
    }

    // Determine which LiveKit room to connect to
    // Only connect if: in isolated zone OR in room OR has nearby players
    const shouldConnect =
      (currentZoneId && currentZone?.isolateAudio) || // In isolated zone
      currentRoomId || // In room
      proximityPlayers.length > 0; // Has nearby players

    if (shouldConnect) {
      connectToLiveKit();
    } else {
      // Disconnect if no valid connection reason
      console.log('📴 Disconnecting: no zone, room, or nearby players');
      setToken('');
    }
  }, [proximityPlayers, currentRoomId, currentZoneId, currentZone]);

  const connectToLiveKit = async () => {
    setIsConnecting(true);
    try {
      let result;

      // Priority: Zone > Room > Proximity
      if (currentZoneId && currentZone?.isolateAudio) {
        // Zone-based audio (isolated zones like tables, bureaux)
        console.log('🔊 Connecting to zone audio:', currentZoneId);
        result = await apiService.getLiveKitZoneToken(currentZoneId);
      } else if (currentRoomId) {
        // Room-based audio
        console.log('🔊 Connecting to room audio:', currentRoomId);
        result = await apiService.getLiveKitRoomToken(currentRoomId);
      } else {
        // Proximity-based audio (open areas)
        console.log('🔊 Connecting to proximity audio');
        result = await apiService.getLiveKitProximityToken();
      }

      setToken(result.token);
    } catch (error) {
      console.error('Failed to get LiveKit token:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const wsUrl = import.meta.env.VITE_LIVEKIT_WS_URL;

  // Determine display message
  const getStatusMessage = () => {
    if (currentZone?.isolateAudio) {
      return `🎤 ${currentZone.name}`;
    }
    if (currentRoomId) {
      return `🎤 Room Audio`;
    }
    if (proximityPlayers.length > 0) {
      return `🎤 ${proximityPlayers.length} nearby`;
    }
    return 'Move near others or enter a zone to talk';
  };

  if (!token || !wsUrl) {
    return (
      <div className="absolute top-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm">
        {isConnecting ? (
          <p>🔄 Connecting to audio...</p>
        ) : (
          <p className="text-sm text-gray-400">{getStatusMessage()}</p>
        )}
      </div>
    );
  }

  return (
    <>
      <LiveKitRoom
        key={connectionKey} // Force new connection on zone change
        video={true}
        audio={true}
        token={token}
        serverUrl={wsUrl}
        data-lk-theme="default"
      >
        <CustomVideoLayout />
        <RoomAudioRenderer />
      </LiveKitRoom>

      {/* Status indicator when connected */}
      <div className="absolute top-4 right-4 bg-gray-900/90 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur z-40">
        <span className="text-sm font-medium">{getStatusMessage()}</span>
      </div>
    </>
  );
}
