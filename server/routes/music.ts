import { Hono } from 'hono';
import { MusicTrack } from '../../src/types'; // 确保路径指向你的类型定义文件
import { db } from '../db'; // 引入我们创建的内存数据库实例

const app = new Hono();

// 1. 获取所有音乐 (GET /api/music)
app.get('/', (c) => {
  // 直接从内存变量 db.musicTracks 中获取数据
  return c.json(db.musicTracks);
});

// 2. 新增音乐 (POST /api/music)
app.post('/', async (c) => {
  try {
    // 解析请求体中的 JSON 数据
    const body = await c.req.json<MusicTrack>();

    // 简单校验
    if (!body || !body.title) {
      return c.json({ error: 'Track title is required' }, 400);
    }

    // 创建新的音乐对象
    const newTrack: MusicTrack = {
      ...body,
      id: body.id || 'track-' + Date.now()
    };

    // 将新音乐添加到内存数组的末尾
    db.musicTracks.push(newTrack);

    return c.json({
      success: true,
      track: newTrack
    }, 201);

  } catch (error) {
    console.error('添加音乐失败:', error);
    return c.json({ error: '服务器内部错误' }, 500);
  }
});

// 3. 删除音乐 (DELETE /api/music/:id)
app.delete('/:id', (c) => {
  const id = c.req.param('id');
  
  // 在内存数组中过滤掉指定 ID 的音乐
  db.musicTracks = db.musicTracks.filter(t => t.id !== id);

  return c.json({
    success: true
  });
});

export default app;