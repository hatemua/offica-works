import { create } from 'zustand';
import { Player, User, InteractionZone } from '@mini-gather/shared';

interface GameStore {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;

  // Game state
  players: Record<string, Player>;
  currentPlayerId: string | null;
  currentRoomId: string | null;
  currentZoneId: string | null;
  currentZone: InteractionZone | null;

  // Actions
  setPlayers: (players: Record<string, Player>) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, player: Partial<Player>) => void;
  setCurrentPlayerId: (playerId: string) => void;
  setCurrentRoomId: (roomId: string | null) => void;
  setCurrentZone: (zoneId: string | null, zone: InteractionZone | null) => void;

  // UI state
  isChatOpen: boolean;
  isUserListOpen: boolean;
  toggleChat: () => void;
  toggleUserList: () => void;

  // Video state
  proximityPlayers: string[];
  setProximityPlayers: (playerIds: string[]) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  // Game state
  players: {},
  currentPlayerId: null,
  currentRoomId: null,
  currentZoneId: null,
  currentZone: null,

  // Actions
  setPlayers: (players) => set({ players }),
  addPlayer: (player) => set((state) => ({
    players: { ...state.players, [player.id]: player }
  })),
  removePlayer: (playerId) => set((state) => {
    const players = { ...state.players };
    delete players[playerId];
    return { players };
  }),
  updatePlayer: (playerId, playerData) => set((state) => ({
    players: {
      ...state.players,
      [playerId]: { ...state.players[playerId], ...playerData }
    }
  })),
  setCurrentPlayerId: (playerId) => set({ currentPlayerId: playerId }),
  setCurrentRoomId: (roomId) => set({ currentRoomId: roomId }),
  setCurrentZone: (zoneId, zone) => set({ currentZoneId: zoneId, currentZone: zone }),

  // UI state
  isChatOpen: false,
  isUserListOpen: true,
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  toggleUserList: () => set((state) => ({ isUserListOpen: !state.isUserListOpen })),

  // Video state
  proximityPlayers: [],
  setProximityPlayers: (playerIds) => set({ proximityPlayers: playerIds }),
}));
