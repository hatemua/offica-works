export const GAME_CONFIG = {
  // World settings
  TILE_SIZE: 32,
  MAP_WIDTH: 50,
  MAP_HEIGHT: 40,

  // Player settings
  PLAYER_SPEED: 160,
  PLAYER_SIZE: 32,
  PLAYER_COLLISION_RADIUS: 16,

  // Network settings
  POSITION_UPDATE_RATE: 15, // updates per second
  INTERPOLATION_DELAY: 100, // ms

  // Proximity settings
  PROXIMITY_THRESHOLD: 150, // pixels
  PROXIMITY_MAX_DISTANCE: 300, // max audio distance

  // Room settings
  MAX_ROOM_CAPACITY: 50,
  DEFAULT_ROOM_CAPACITY: 20,
} as const;

export const AVATAR_TYPES = [
  'avatar1',
  'avatar2',
  'avatar3',
  'avatar4',
  'avatar5',
  'avatar6',
] as const;

export const ROOM_TYPES = {
  SOCIAL: 'social', // proximity-based
  MEETING: 'meeting', // all connected
  PRESENTATION: 'presentation', // one-to-many
  PRIVATE: 'private', // password protected
} as const;

export type RoomType = typeof ROOM_TYPES[keyof typeof ROOM_TYPES];
export type AvatarType = typeof AVATAR_TYPES[number];
