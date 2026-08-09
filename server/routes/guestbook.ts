import { Router } from 'express';
import { getStore, updateStore } from '../db';
import { GuestbookMessage } from '../../src/types';

const router = Router();

// GET guestbook
router.get('/', (req, res) => {
  const store = getStore();
  res.json(store.guestbook);
});

// POST message
router.post('/', (req, res) => {
  const msg: GuestbookMessage = req.body;
  if (!msg || !msg.content) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  const newMsg: GuestbookMessage = {
    ...msg,
    id: msg.id || 'gb-' + Date.now(),
    createdAt: msg.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 16),
    likes: msg.likes || 0
  };

  updateStore(store => ({
    ...store,
    guestbook: [newMsg, ...store.guestbook]
  }));

  res.json({ success: true, message: newMsg });
});

// DELETE message
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  updateStore(store => ({
    ...store,
    guestbook: store.guestbook.filter(m => m.id !== id)
  }));
  res.json({ success: true });
});

// POST author reply
router.post('/:id/reply', (req, res) => {
  const { id } = req.params;
  const { authorReply } = req.body;

  updateStore(store => ({
    ...store,
    guestbook: store.guestbook.map(m => m.id === id ? { ...m, authorReply } : m)
  }));

  res.json({ success: true });
});

// POST like message
router.post('/:id/like', (req, res) => {
  const { id } = req.params;
  updateStore(store => ({
    ...store,
    guestbook: store.guestbook.map(m => m.id === id ? { ...m, likes: m.likes + 1 } : m)
  }));
  res.json({ success: true });
});

export default router;
