import { Router } from 'express';
import { getStore, updateStore } from '../db';
import { Review } from '../../src/types';

const router = Router();

// GET all reviews
router.get('/', (req, res) => {
  const store = getStore();
  res.json(store.reviews);
});

// POST new review
router.post('/', (req, res) => {
  const review: Review = req.body;
  if (!review || !review.content) {
    return res.status(400).json({ error: 'Review content is required' });
  }

  const newReview: Review = {
    ...review,
    id: review.id || 'rev-' + Date.now(),
    createdAt: review.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 16),
    likes: review.likes || 0,
    replies: review.replies || []
  };

  updateStore(store => ({
    ...store,
    reviews: [newReview, ...store.reviews]
  }));

  res.json({ success: true, review: newReview });
});

// DELETE review
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  updateStore(store => ({
    ...store,
    reviews: store.reviews.filter(r => r.id !== id)
  }));
  res.json({ success: true });
});

// POST reply to review
router.post('/:id/reply', (req, res) => {
  const { id } = req.params;
  const { userName, content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Reply content is required' });
  }

  const reply = {
    id: 'rep-' + Date.now(),
    userName: userName || '热心读者',
    content,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  updateStore(store => ({
    ...store,
    reviews: store.reviews.map(r => {
      if (r.id === id) {
        return {
          ...r,
          replies: [...(r.replies || []), reply]
        };
      }
      return r;
    })
  }));

  res.json({ success: true, reply });
});

// POST like review
router.post('/:id/like', (req, res) => {
  const { id } = req.params;
  updateStore(store => ({
    ...store,
    reviews: store.reviews.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r)
  }));
  res.json({ success: true });
});

export default router;
