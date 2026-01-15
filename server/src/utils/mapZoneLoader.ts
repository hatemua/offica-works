import fs from 'fs';
import { InteractionZone } from '@mini-gather/shared';

interface TiledObject {
  id: number;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  properties?: Array<{
    name: string;
    type: string;
    value: any;
  }>;
}

interface TiledObjectLayer {
  name: string;
  type: 'objectgroup';
  objects: TiledObject[];
}

interface TiledMap {
  layers: Array<TiledObjectLayer | any>;
}

/**
 * Load interaction zones from a Tiled map JSON file
 * Supports WorkAdventure-style zones with jitsiRoom and silent properties
 */
export function loadZonesFromMap(mapJsonPath: string): InteractionZone[] {
  try {
    console.log(`📍 Loading zones from map: ${mapJsonPath}`);

    const mapData = JSON.parse(fs.readFileSync(mapJsonPath, 'utf-8')) as TiledMap;
    const zones: InteractionZone[] = [];

    // Find all object layers in the map
    const objectLayers = mapData.layers.filter(
      (layer: any) => layer.type === 'objectgroup'
    ) as TiledObjectLayer[];

    console.log(`   Found ${objectLayers.length} object layer(s)`);

    // Process each object layer
    objectLayers.forEach((layer) => {
      console.log(`   Processing layer: ${layer.name} (${layer.objects?.length || 0} objects)`);

      layer.objects?.forEach((obj) => {
        // Convert Tiled object to InteractionZone if it's a zone object
        const zone = convertTiledObjectToZone(obj);
        if (zone) {
          zones.push(zone);
          console.log(`   ✓ Loaded zone: ${zone.name} (${zone.type}, isolate: ${zone.isolateAudio})`);
        }
      });
    });

    console.log(`✅ Successfully loaded ${zones.length} zones from map`);
    return zones;
  } catch (error) {
    console.error('❌ Failed to load zones from map:', error);
    return [];
  }
}

/**
 * Convert a Tiled object to an InteractionZone
 * Supports WorkAdventure properties: jitsiRoom, jitsiTrigger, silent
 */
function convertTiledObjectToZone(obj: TiledObject): InteractionZone | null {
  // Get properties from the Tiled object
  const props = obj.properties || [];
  const jitsiRoom = props.find((p) => p.name === 'jitsiRoom')?.value;
  const jitsiTrigger = props.find((p) => p.name === 'jitsiTrigger')?.value;
  const silent = props.find((p) => p.name === 'silent')?.value === true;

  // Skip if not a zone object (not jitsi, not silent, and name doesn't contain "zone")
  const nameContainsZone = obj.name.toLowerCase().includes('zone');
  if (!jitsiRoom && !silent && !nameContainsZone) {
    return null;
  }

  // Determine zone type and audio isolation based on properties and name
  let type: InteractionZone['type'] = 'open';
  let isolateAudio = false;
  let maxParticipants: number | undefined = undefined;

  if (silent) {
    // Silent zones - no audio at all, treated as private spaces
    type = 'private-space';
    isolateAudio = true;
    maxParticipants = 1;
  } else if (jitsiRoom) {
    // Zones with jitsiRoom property - auto-connect on entry (ignore jitsiTrigger)
    // Determine type based on zone name
    if (obj.name.toLowerCase().includes('meeting')) {
      type = 'meeting-area';
      maxParticipants = 20;
    } else if (obj.name.toLowerCase().includes('table')) {
      type = 'table';
      maxParticipants = 6;
    } else if (obj.name.toLowerCase().includes('chill') || obj.name.toLowerCase().includes('lounge')) {
      type = 'meeting-area';
      maxParticipants = 10;
    } else {
      type = 'meeting-area';
      maxParticipants = 15;
    }
    isolateAudio = true; // Always isolate zones with jitsiRoom
  } else if (obj.name.toLowerCase().includes('meeting')) {
    // Meeting rooms - isolated audio for meetings
    type = 'meeting-area';
    isolateAudio = true;
    maxParticipants = 20;
  } else if (obj.name.toLowerCase().includes('table') || obj.name.toLowerCase().includes('desk')) {
    // Tables/desks - small isolated audio zones
    type = 'table';
    isolateAudio = true;
    maxParticipants = 6;
  } else if (obj.name.toLowerCase().includes('chill') || obj.name.toLowerCase().includes('lounge')) {
    // Chill/lounge zones - isolated but larger
    type = 'meeting-area';
    isolateAudio = true;
    maxParticipants = 10;
  } else {
    // Default: open area with proximity-based audio
    type = 'open';
    isolateAudio = false;
  }

  // Generate unique ID from name (sanitize for use as identifier)
  const id = `zone-${obj.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;

  return {
    id,
    name: obj.name,
    bounds: {
      x: obj.x,
      y: obj.y,
      width: obj.width,
      height: obj.height,
    },
    type,
    isolateAudio,
    maxParticipants,
  };
}
