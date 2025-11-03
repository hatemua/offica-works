import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export function Controls() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const user = useGameStore((state) => state.user);

  return (
    <div className="absolute bottom-4 right-4 bg-gray-900 text-white rounded-lg shadow-lg p-4">
      <div className="flex items-center gap-4">
        {/* User info */}
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{
              backgroundColor: `hsl(${
                user?.username.charCodeAt(0) || 0 * 137.5
              }, 70%, 50%)`,
            }}
          >
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-sm">{user?.username}</div>
            <div className="text-xs text-gray-400">Online</div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-gray-700" />

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-lg transition ${
              isMuted
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          <button
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-2 rounded-lg transition ${
              isVideoOff
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isVideoOff ? '📷' : '📹'}
          </button>

          <button
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
            title="Share screen"
          >
            🖥️
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
        Use <kbd className="px-1 bg-gray-800 rounded">WASD</kbd> or arrow keys to
        move
      </div>
    </div>
  );
}
