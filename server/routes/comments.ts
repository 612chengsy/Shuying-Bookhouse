import { Hono } from 'hono';
import { Comment } from '../../src/types'; // 确保路径指向你的类型定义文件
import { db } from '../db'; // 引入我们创建的内存数据库实例

const app = new Hono();

// 1. 获取所有评论 (GET /api/comments)
app.get('/', (c) => {
  // 直接从内存变量 db.comments 中获取数据
  return c.json(db.comments);
});

// 2. 新增评论 (POST /api/comments)
app.post('/', async (c) => {
  try {
    // 解析请求体中的 JSON 数据
    const body = await c.req.json<Comment>();

    // 简单校验
    if (!body.content || !body.bookId) {
      return c.json({ error: 'BookId and content are required' }, 400);
    }

    // 创建新的评论对象
    const newComment: Comment = {
      ...body,
      id: body.id || 'comment-' + Date.now(),
      createdAt: body.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 16),
      likes: body.likes || 0
    };

    // 将新评论添加到内存数组的开头
    db.comments.unshift(newComment);

    return c.json({
      success: true,
      comment: newComment
    }, 201);

  } catch (error) {
    console.error('添加评论失败:', error);
    return c.json({ error: '服务器内部错误' }, 500);
  }
});

// 3. 删除评论 (DELETE /api/comments/:id)
app.delete('/:id', (c) => {
  const id = c.req.param('id');
  
  // 在内存数组中过滤掉指定 ID 的评论
  db.comments = db.comments.filter(comment => comment.id !== id);

  return c.json({
    success: true
  });
});

// 4. 点赞评论 (POST /api/comments/:id/like)
app.post('/:id/like', (c) => {
  const id = c.req.param('id');
  
  // 在内存数组中找到对应 ID 的评论并增加点赞数
  const commentIndex = db.comments.findIndex(comment => comment.id === id);
  if (commentIndex !== -1) {
    db.comments[commentIndex] = {
      ...db.comments[commentIndex],
      likes: (db.comments[commentIndex].likes || 0) + 1
    };
  }

  return c.json({
    success: true
  });
});

export default app;