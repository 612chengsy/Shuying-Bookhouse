import { Hono } from 'hono';
import { db } from '../db'; // 引入我们创建的内存数据库实例

const app = new Hono();

// 1. 获取网站统计数据 (GET /api/stats)
app.get('/', (c) => {
  // 直接从内存变量 db 中获取并计算数据
  const totalCommentsCount = db.comments.length + db.reviews.length + db.guestbook.length;
  const totalLikesCount = db.books.reduce((acc, b) => acc + (b.likes || 0), 0);

  return c.json({
    views: db.totalViews,
    booksCount: db.books.length,
    commentsCount: totalCommentsCount,
    likesCount: totalLikesCount
  });
});

// 2. 增加总访问量 (POST /api/stats/view)
app.post('/view', (c) => {
  // 直接在内存变量上增加访问量
  db.totalViews += 1;

  return c.json({
    success: true,
    views: db.totalViews
  });
});

export default app;