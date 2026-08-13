import { Hono } from 'hono';
import { Review } from '../../src/types'; // 确保路径指向你的类型定义文件
import { db } from '../db'; // 引入我们创建的内存数据库实例

const app = new Hono();

// 1. 获取所有评论 (GET /api/reviews)
app.get('/', (c) => {
  // 直接从内存变量 db.reviews 中获取数据
  return c.json(db.reviews);
});

// 2. 新增评论 (POST /api/reviews)
app.post('/', async (c) => {
  try {
    // 解析请求体中的 JSON 数据
    const review = await c.req.json<Review>();

    // 简单校验
    if (!review || !review.content) {
      return c.json({ error: 'Review content is required' }, 400);
    }

    // 创建新的评论对象
    const newReview: Review = {
      ...review,
      id: review.id || 'rev-' + Date.now(),
      createdAt: review.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 16),
      likes: review.likes || 0,
      replies: review.replies || []
    };

    // 将新评论添加到内存数组的开头
    db.reviews.unshift(newReview);

    return c.json({
      success: true,
      review: newReview
    }, 201);

  } catch (error) {
    console.error('添加评论失败:', error);
    return c.json({ error: '服务器内部错误' }, 500);
  }
});

// 3. 删除评论 (DELETE /api/reviews/:id)
app.delete('/:id', (c) => {
  const id = c.req.param('id');
  
  // 在内存数组中过滤掉指定 ID 的评论
  db.reviews = db.reviews.filter(r => r.id !== id);

  return c.json({
    success: true
  });
});

// 4. 回复评论 (POST /api/reviews/:id/reply)
app.post('/:id/reply', async (c) => {
  const id = c.req.param('id');
  const { userName, content } = await c.req.json();

  if (!content) {
    return c.json({ error: 'Reply content is required' }, 400);
  }

  // 创建新的回复对象
  const reply = {
    id: 'rep-' + Date.now(),
    userName: userName || '热心读者',
    content,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
  };

  // 在内存数组中找到对应 ID 的评论并添加回复
  const reviewIndex = db.reviews.findIndex(r => r.id === id);
  if (reviewIndex !== -1) {
    db.reviews[reviewIndex] = {
      ...db.reviews[reviewIndex],
      replies: [...(db.reviews[reviewIndex].replies || []), reply]
    };
  }

  return c.json({
    success: true,
    reply
  });
});

// 5. 点赞评论 (POST /api/reviews/:id/like)
app.post('/:id/like', (c) => {
  const id = c.req.param('id');
  
  // 在内存数组中找到对应 ID 的评论并增加点赞数
  const reviewIndex = db.reviews.findIndex(r => r.id === id);
  if (reviewIndex !== -1) {
    db.reviews[reviewIndex] = {
      ...db.reviews[reviewIndex],
      likes: (db.reviews[reviewIndex].likes || 0) + 1
    };
  }

  return c.json({
    success: true
  });
});

export default app;