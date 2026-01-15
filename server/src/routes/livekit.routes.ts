import { Router } from 'express';
import { liveKitService } from '../services/livekit.service.js';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { authService } from '../services/auth.service.js';

const router = Router();

router.post('/token/proximity', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await authService.getUserById(req.userId!);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = await liveKitService.createProximityToken(user.id, user.username);
    res.json({ token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/token/room', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { roomId } = req.body;
    if (!roomId) {
      return res.status(400).json({ error: 'Room ID required' });
    }

    const user = await authService.getUserById(req.userId!);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = await liveKitService.createRoomToken(roomId, user.id, user.username);
    res.json({ token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/token/zone', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { zoneId } = req.body;
    if (!zoneId) {
      return res.status(400).json({ error: 'Zone ID required' });
    }

    const user = await authService.getUserById(req.userId!);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = await liveKitService.createZoneToken(zoneId, user.id, user.username);
    res.json({ token });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
