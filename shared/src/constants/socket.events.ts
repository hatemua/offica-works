export const SOCKET_EVENTS = {
  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  // Authentication
  AUTHENTICATE: 'authenticate',
  AUTHENTICATED: 'authenticated',
  AUTH_ERROR: 'auth_error',

  // Player Movement
  PLAYER_MOVE: 'player:move',
  PLAYER_POSITION: 'player:position',
  PLAYER_JOINED: 'player:joined',
  PLAYER_LEFT: 'player:left',
  PLAYERS_LIST: 'players:list',

  // Room Management
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_JOINED: 'room:joined',
  ROOM_LEFT: 'room:left',
  ROOM_USERS: 'room:users',
  ROOM_UPDATE: 'room:update',

  // Proximity
  PROXIMITY_ENTER: 'proximity:enter',
  PROXIMITY_LEAVE: 'proximity:leave',
  PROXIMITY_UPDATE: 'proximity:update',

  // Zones
  ZONE_ENTER: 'zone:enter',
  ZONE_LEAVE: 'zone:leave',
  ZONES_LIST: 'zones:list',

  // Chat
  CHAT_MESSAGE: 'chat:message',
  CHAT_HISTORY: 'chat:history',

  // Doors
  DOOR_INTERACT: 'door:interact',
  DOOR_UPDATE: 'door:update',
  DOOR_KNOCK: 'door:knock',
  DOORS_LIST: 'doors:list',

  // Game State
  GAME_STATE: 'game:state',
  GAME_STATE_UPDATE: 'game:state:update',
} as const;

export type SocketEvent = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
