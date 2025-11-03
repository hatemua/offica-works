import { useGameStore } from '../store/gameStore';

export function UserList() {
  const players = useGameStore((state) => state.players);
  const currentPlayerId = useGameStore((state) => state.currentPlayerId);
  const isUserListOpen = useGameStore((state) => state.isUserListOpen);
  const toggleUserList = useGameStore((state) => state.toggleUserList);

  const playerList = Object.values(players);

  if (!isUserListOpen) {
    return (
      <button
        onClick={toggleUserList}
        className="absolute top-4 left-4 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg transition"
      >
        Players ({playerList.length})
      </button>
    );
  }

  return (
    <div className="absolute top-4 left-4 w-64 bg-gray-900 text-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="font-semibold">
          Players ({playerList.length})
        </h3>
        <button
          onClick={toggleUserList}
          className="text-gray-400 hover:text-white transition"
        >
          ✕
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {playerList.map((player) => (
          <div
            key={player.id}
            className={`p-3 border-b border-gray-800 flex items-center gap-3 ${
              player.id === currentPlayerId ? 'bg-primary-900/30' : ''
            }`}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
              style={{
                backgroundColor: `hsl(${
                  player.username.charCodeAt(0) * 137.5
                }, 70%, 50%)`,
              }}
            >
              {player.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-medium">
                {player.username}
                {player.id === currentPlayerId && (
                  <span className="text-xs text-primary-400 ml-2">(You)</span>
                )}
              </div>
              {player.currentRoom && (
                <div className="text-xs text-gray-400">In a room</div>
              )}
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full" />
          </div>
        ))}

        {playerList.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            No players online
          </div>
        )}
      </div>
    </div>
  );
}
