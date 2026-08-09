import { Router } from 'express';
import { getStore, updateStore } from '../db';
import { MusicTrack } from '../../src/types';

const router = Router();

// GET all music tracks
router.get('/', (req, res) => {
  const store = getStore();
  res.json(store.musicTracks);
});

// POST add music track
router.post('/', (req, res) => {
  const track: MusicTrack = req.body;
  if (!track || !track.title) {
    return res.status(400).json({ error: 'Track title is required' });
  }

  const newTrack: MusicTrack = {
    ...track,
    id: track.id || 'track-' + Date.now()
  };

  updateStore(store => ({
    ...store,
    musicTracks: [...store.musicTracks, newTrack]
  }));

  res.json({ success: true, track: newTrack });
});

// DELETE music track
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  updateStore(store => ({
    ...store,
    musicTracks: store.musicTracks.filter(t => t.id !== id)
  }));
  res.json({ success: true });
});

export default router;
