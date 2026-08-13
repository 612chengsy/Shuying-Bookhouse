import { Hono } from 'hono';
import { Book } from '../../src/types'; // 确保路径指向你的类型定义文件
import { db } from '../db'; // 引入我们刚才创建的内存数据库实例

const app = new Hono();

// 1. 获取所有书籍 (GET /api/books)
app.get('/', (c) => {
  // 直接从内存变量 db.books 中获取数据
  return c.json({
    success: true,
    data: db.books,
    total: db.books.length
  });
});

// 2. 获取单本书籍详情 (GET /api/books/:id)
app.get('/:id', (c) => {
  const id = c.req.param('id');
  
  // 在内存数组中查找对应 ID 的书籍
  const book = db.books.find((b) => b.id === id);

  if (!book) {
    return c.json({ success: false, message: '书籍未找到' }, 404);
  }

  return c.json({
    success: true,
    data: book
  });
});

// 3. 新增书籍 (POST /api/books)
// 注意：EdgeOne 环境重启后数据会丢失，但这符合目前的“内存模式”方案
app.post('/', async (c) => {
  try {
    // 解析请求体中的 JSON 数据
    const body = await c.req.json<Book>();

    // 简单校验（可选）
    if (!body.title || !body.author) {
      return c.json({ success: false, message: '标题和作者不能为空' }, 400);
    }

    // 生成一个简单的 ID (实际项目中建议使用 uuid 库)
    const newId = Date.now().toString();
    
    const newBook: Book = {
      ...body,
      id: newId,
      createdAt: new Date().toISOString() // 添加创建时间
    };

    // 将新书籍推入内存数组
    db.books.unshift(newBook); // unshift 放在最前面，或者用 push 放在最后

    return c.json({
      success: true,
      message: '添加成功',
      data: newBook
    }, 201);

  } catch (error) {
    console.error('添加书籍失败:', error);
    return c.json({ success: false, message: '服务器内部错误' }, 500);
  }
});

// 4. 更新书籍 (PUT /api/books/:id)
app.put('/:id', async (c) => {
  const id = c.req.param('id');
  const index = db.books.findIndex((b) => b.id === id);

  if (index === -1) {
    return c.json({ success: false, message: '书籍未找到' }, 404);
  }

  try {
    const body = await c.req.json<Partial<Book>>();
    
    // 更新内存中的数据
    db.books[index] = { ...db.books[index], ...body };

    return c.json({
      success: true,
      message: '更新成功',
      data: db.books[index]
    });
  } catch (error) {
    return c.json({ success: false, message: '更新失败' }, 500);
  }
});

// 5. 删除书籍 (DELETE /api/books/:id)
app.delete('/:id', (c) => {
  const id = c.req.param('id');
  const index = db.books.findIndex((b) => b.id === id);

  if (index === -1) {
    return c.json({ success: false, message: '书籍未找到' }, 404);
  }

  // 从数组中移除该项
  db.books.splice(index, 1);

  return c.json({
    success: true,
    message: '删除成功'
  });
});

export default app;