import { Router } from 'express';
import { getStore, updateStore } from '../db';

const router = Router();

// GET site stats
router.get('/', (req, res) => {
  const store = getStore();
  const totalCommentsCount = store.comments.length + store.reviews.length + store.guestbook.length;
  const totalLikesCount = store.books.reduce((acc, b) => acc + (b.likes || 0), 0);

  res.json({
    views: store.totalViews,
    booksCount: store.books.length,
    commentsCount: totalCommentsCount,
    likesCount: totalLikesCount
  });
});

// POST increment total views
router.post('/view', (req, res) => {
  const store = updateStore(s => ({
    ...s,
    totalViews: s.totalViews + 1
  }));
  res.json({ success: true, views: store.totalViews });
});

export default router;
