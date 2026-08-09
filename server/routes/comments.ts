import { Router } from 'express';
import { getStore, updateStore } from '../db';
import { Comment } from '../../src/types';

const router = Router();

// GET all comments
router.get('/', (req, res) => {
  const store = getStore();
  res.json(store.comments);
});

// POST new comment
router.post('/', (req, res) => {
  const comment: Comment = req.body;
  if (!comment || !comment.content || !comment.bookId) {
    return res.status(400).json({ error: 'BookId and content are required' });
  }

  const newComment: Comment = {
    ...comment,
    id: comment.id || 'comment-' + Date.now(),
    createdAt: comment.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 16),
    likes: comment.likes || 0
  };

  updateStore(store => ({
    ...store,
    comments: [newComment, ...store.comments]
  }));

  res.json({ success: true, comment: newComment });
});

// DELETE comment
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  updateStore(store => ({
    ...store,
    comments: store.comments.filter(c => c.id !== id)
  }));
  res.json({ success: true });
});

// POST like comment
router.post('/:id/like', (req, res) => {
  const { id } = req.params;
  updateStore(store => ({
    ...store,
    comments: store.comments.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c)
  }));
  res.json({ success: true });
});

export default router;
