import { Hono } from 'hono';
import { WritingStatusLog } from '../../src/types'; // 确保路径指向你的类型定义文件
import { db } from '../db'; // 引入我们创建的内存数据库实例

const app = new Hono();

// 1. 获取所有日志和名言 (GET /api/logs)
app.get('/', (c) => {
  // 直接从内存变量 db.statusLogs 和 db.statusQuote 中获取数据
  return c.json({
    logs: db.statusLogs,
    quote: db.statusQuote
  });
});

// 2. 新增日志 (POST /api/logs)
app.post('/', async (c) => {
  try {
    // 解析请求体中的 JSON 数据
    const log = await c.req.json<WritingStatusLog>();

    // 简单校验
    if (!log || !log.content) {
      return c.json({ error: 'Log content is required' }, 400);
    }

    // 创建新的日志对象
    const newLog: WritingStatusLog = {
      ...log,
      id: log.id || 'log-' + Date.now(),
      date: log.date || new Date().toISOString().split('T')[0]
    };

    // 将新日志添加到内存数组的开头
    db.statusLogs.unshift(newLog);

    return c.json({
      success: true,
      log: newLog
    }, 201);

  } catch (error) {
    console.error('添加日志失败:', error);
    return c.json({ error: '服务器内部错误' }, 500);
  }
});

// 3. 更新日志 (PUT /api/logs/:id)
app.put('/:id', async (c) => {
  const id = c.req.param('id');
  const logData = await c.req.json<Partial<WritingStatusLog>>();

  // 在内存数组中找到对应 ID 的日志并更新
  const logIndex = db.statusLogs.findIndex(l => l.id === id);
  if (logIndex !== -1) {
    db.statusLogs[logIndex] = { ...db.statusLogs[logIndex], ...logData };
  }

  return c.json({
    success: true
  });
});

// 4. 删除日志 (DELETE /api/logs/:id)
app.delete('/:id', (c) => {
  const id = c.req.param('id');
  
  // 在内存数组中过滤掉指定 ID 的日志
  db.statusLogs = db.statusLogs.filter(l => l.id !== id);

  return c.json({
    success: true
  });
});

// 5. 更新名言 (PUT /api/logs/quote/update)
app.put('/quote/update', async (c) => {
  const { quote } = await c.req.json();

  if (!quote) {
    return c.json({ error: 'Quote is required' }, 400);
  }

  // 直接更新内存中的名言变量
  db.statusQuote = quote;

  return c.json({
    success: true,
    quote
  });
});

export default app;