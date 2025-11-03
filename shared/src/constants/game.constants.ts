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
  PROXIMITY_THRESHOLD: 150, // pixels (for corridors)
  PROXIMITY_DISCONNECT_THRESHOLD: 200, // pixels - disconnect when further
  PROXIMITY_MAX_DISTANCE: 300, // max audio distance
  PROXIMITY_AUDIO_FADE_START: 100, // start fading audio
  PROXIMITY_AUDIO_FADE_END: 200, // audio fully faded

  // Room settings
  MAX_ROOM_CAPACITY: 50,
  DEFAULT_ROOM_CAPACITY: 20,
  MEETING_ROOM_CAPACITY: 20, // Large meeting rooms
  SMALL_ROOM_CAPACITY: 3, // Small offices/bureaus
  BUREAU_CAPACITY: 3, // Personal offices

  // Door settings
  DOOR_AUTO_CLOSE_DELAY: 3000, // ms - auto close after 3 seconds
  DOOR_INTERACTION_DISTANCE: 48, // pixels - how close to interact
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
  CORRIDOR: 'corridor', // Open area - proximity-based video/audio
  MEETING: 'meeting', // 10-20 users - all connected when inside
  SMALL_OFFICE: 'small_office', // 2-3 users - requires door entry
  BUREAU: 'bureau', // 2-3 users - private office with door
  SOCIAL: 'social', // Open social area - proximity-based
  PRESENTATION: 'presentation', // Large presentation - one-to-many
  PRIVATE: 'private', // Password protected
} as const;

export const DOOR_STATES = {
  CLOSED: 'closed',
  OPEN: 'open',
  LOCKED: 'locked',
} as const;

export const COLLISION_LAYERS = {
  NONE: 0,
  WALLS: 1,
  FURNITURE: 2,
  DOORS: 4,
  PLAYERS: 8,
} as const;

export type RoomType = typeof ROOM_TYPES[keyof typeof ROOM_TYPES];
export type AvatarType = typeof AVATAR_TYPES[number];
export type DoorState = typeof DOOR_STATES[keyof typeof DOOR_STATES];
export type CollisionLayer = typeof COLLISION_LAYERS[keyof typeof COLLISION_LAYERS];
