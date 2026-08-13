import { Hono } from 'hono';
import { GuestbookMessage } from '../../src/types'; // 确保路径指向你的类型定义文件
import { db } from '../db'; // 引入我们创建的内存数据库实例

const app = new Hono();

// 1. 获取所有留言 (GET /api/guestbook)
app.get('/', (c) => {
  // 直接从内存变量 db.guestbook 中获取数据
  return c.json(db.guestbook);
});

// 2. 新增留言 (POST /api/guestbook)
app.post('/', async (c) => {
  try {
    // 解析请求体中的 JSON 数据
    const body = await c.req.json<GuestbookMessage>();

    // 简单校验
    if (!body.content) {
      return c.json({ error: 'Message content is required' }, 400);
    }

    // 创建新的留言对象
    const newMsg: GuestbookMessage = {
      ...body,
      id: body.id || 'gb-' + Date.now(),
      createdAt: body.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 16),
      likes: body.likes || 0
    };

    // 将新留言添加到内存数组的开头
    db.guestbook.unshift(newMsg);

    return c.json({
      success: true,
      message: newMsg
    }, 201);

  } catch (error) {
    console.error('添加留言失败:', error);
    return c.json({ error: '服务器内部错误' }, 500);
  }
});

// 3. 删除留言 (DELETE /api/guestbook/:id)
app.delete('/:id', (c) => {
  const id = c.req.param('id');
  
  // 在内存数组中过滤掉指定 ID 的留言
  db.guestbook = db.guestbook.filter(m => m.id !== id);

  return c.json({
    success: true
  });
});

// 4. 作者回复 (POST /api/guestbook/:id/reply)
app.post('/:id/reply', async (c) => {
  const id = c.req.param('id');
  const { authorReply } = await c.req.json();

  // 在内存数组中找到对应 ID 的留言并添加回复
  const msgIndex = db.guestbook.findIndex(m => m.id === id);
  if (msgIndex !== -1) {
    db.guestbook[msgIndex] = {
      ...db.guestbook[msgIndex],
      authorReply
    };
  }

  return c.json({
    success: true
  });
});

// 5. 点赞留言 (POST /api/guestbook/:id/like)
app.post('/:id/like', (c) => {
  const id = c.req.param('id');
  
  // 在内存数组中找到对应 ID 的留言并增加点赞数
  const msgIndex = db.guestbook.findIndex(m => m.id === id);
  if (msgIndex !== -1) {
    db.guestbook[msgIndex] = {
      ...db.guestbook[msgIndex],
      likes: (db.guestbook[msgIndex].likes || 0) + 1
    };
  }

  return c.json({
    success: true
  });
});

export default app;