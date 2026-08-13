// edge-functions/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';

// ⚠️ 注意：这里需要引入你 server/routes 里的逻辑
// 假设你把路由逻辑抽离到了 server/routes/index.ts
// 如果还没抽离，你需要把 app.route('/api', ...) 的逻辑搬到这里
import apiRoutes from '../server/routes'; 

const app = new Hono();

// 1. 开启跨域 (前端调用必须)
app.use('/*', cors());

// 2. 挂载你的 API 路由
app.route('/api', apiRoutes);

// 3. 全局兜底逻辑 (关键！)
app.notFound(async (c) => {
  const url = new URL(c.req.url);
  
  // 如果是 API 请求但没找到，返回 404 JSON
  if (url.pathname.startsWith('/api')) {
    return c.json({ message: 'API Not Found' }, 404);
  }

  // 如果是普通页面请求，去拿前端的 index.html
  // 这样 React/Vue 的 History 路由才不会报 404
  try {
    const response = await fetch(new URL('/index.html', url.origin));
    return new Response(response.body, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (e) {
    return c.text('Page Not Found', 404);
  }
});

export default app;

// 兼容一些 Edge 平台导出 fetch 入口的期望
export const fetch = app.fetch.bind(app);