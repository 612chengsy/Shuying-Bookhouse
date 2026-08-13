import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { fileURLToPath } from 'url';

// 导入我们刚刚改造好的 Hono 路由
import booksRouter from './routes/books';
import commentsRouter from './routes/comments';
import reviewsRouter from './routes/reviews';
import guestbookRouter from './routes/guestbook';
import logsRouter from './routes/logs';
import musicRouter from './routes/music';
import statsRouter from './routes/stats';
import uploadRouter from './routes/upload';

import { initStore } from './db';

// 创建 Hono 应用实例
const app = new Hono();

// --- 中间件 ---

// 1. 日志中间件：记录请求信息
app.use('*', logger());

// 2. CORS 中间件：处理跨域请求
app.use('*', cors({
  origin: '*', // 允许所有来源，生产环境建议设置为你的域名
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// 3. JSON Body 解析中间件 (Hono 默认支持，但可以增加限制)
app.use('*', async (c, next) => {
  if (c.req.header('content-type')?.startsWith('application/json')) {
    // Hono 会自动解析 JSON，这里可以添加额外的逻辑，比如限制 body 大小
    // 注意：Hono 本身没有内置 body size limit，需要在边缘平台层面配置
  }
  await next();
});

// --- 初始化 ---
// 在应用启动时初始化内存数据库
initStore();

// --- 路由挂载 ---

// API 路由
app.route('/api/books', booksRouter);
app.route('/api/comments', commentsRouter);
app.route('/api/reviews', reviewsRouter);
app.route('/api/guestbook', guestbookRouter);
app.route('/api/logs', logsRouter);
app.route('/api/music', musicRouter);
app.route('/api/stats', statsRouter);
app.route('/api/upload', uploadRouter);

// 根路径测试
app.get('/', (c) => {
  return c.json({ message: 'Shuying Server is running on EdgeOne!' });
});

// 404 处理
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// 错误处理
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

// 如果该文件作为主模块直接运行，则在本地启动一个 HTTP 服务器以便开发调试
// 本地开发：在非生产环境下启动监听，方便使用 `tsx server/index.ts` 或 `node` 直接运行
// 导出 Hono 实例作为 Edge 平台的入口（不要在 Edge 上启动本地 HTTP 服务器）
export default app;