import { Hono } from 'hono';
import { UploadedFile } from '../../src/types'; // 确保路径指向你的类型定义文件
import { db } from '../db'; // 引入我们创建的内存数据库实例

const app = new Hono();

// 辅助函数：从文件名获取扩展名
const getExt = (filename: string) => {
  const parts = filename.split('.');
  return parts.length > 1 ? '.' + parts.pop() : '';
};

// 辅助函数：清理文件名
const sanitizeFilename = (name: string) => {
  return name.replace(/[^a-zA-Z0-9_\-]/g, '_');
};

// 1. 文件上传接口 (POST /api/upload/file)
// 注意：在边缘函数中，我们无法使用 multer 保存到磁盘。
// 这里我们将文件内容读取为 base64 并存储在内存中。
app.post('/file', async (c) => {
  try {
    // 兼容不同环境：优先使用标准 Request.formData()
    let formData: FormData | null = null;
    try {
      // Hono 在不同运行时下暴露的 API 可能不同
      const rawReq: any = (c.req as any).raw || c.req;
      if (rawReq && typeof rawReq.formData === 'function') {
        formData = await rawReq.formData();
      } else if (typeof (c.req as any).parseBody === 'function') {
        formData = await (c.req as any).parseBody();
      }
    } catch (e) {
      console.warn('formData parse warning', e);
    }

    const file: any = formData ? (formData.get ? formData.get('file') : formData['file']) : null;

    if (!file || typeof file.arrayBuffer !== 'function') {
      return c.json({ error: 'No file uploaded' }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();

    let base64Data: string;
    if (typeof btoa === 'function') {
      base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    } else if (typeof Buffer !== 'undefined') {
      base64Data = Buffer.from(arrayBuffer).toString('base64');
    } else {
      // 最后回退：手动编码（较慢）
      const u8 = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < u8.length; i++) binary += String.fromCharCode(u8[i]);
      base64Data = (typeof btoa === 'function') ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
    }

    const name = file.name || 'upload.bin';
    const type = file.type || 'application/octet-stream';
    const size = file.size || arrayBuffer.byteLength;

    const ext = getExt(name);
    const basename = sanitizeFilename(name.replace(ext, ''));
    const uniqueName = `${Date.now()}-${basename}${ext}`;

    const uploadedFile: UploadedFile = {
      id: 'file-' + Date.now(),
      filename: uniqueName,
      originalName: name,
      mimeType: type,
      size,
      data: `data:${type};base64,${base64Data}`,
      uploadedAt: new Date().toISOString()
    };

    db.uploadedFiles.push(uploadedFile);

    const fileUrl = `/api/upload/file/${uploadedFile.id}`;

    return c.json({
      success: true,
      url: fileUrl,
      filename: uniqueName,
      originalName: name,
      size
    });

  } catch (error) {
    console.error('文件上传失败:', error);
    return c.json({ error: '服务器内部错误' }, 500);
  }
});

// 2. 获取已上传的文件 (GET /api/upload/file/:id)
// 这个接口用于从内存中读取并返回文件内容
app.get('/file/:id', (c) => {
  const id = c.req.param('id');
  const file = db.uploadedFiles.find(f => f.id === id);

  if (!file) {
    return c.json({ error: 'File not found' }, 404);
  }

  // 从 data URL 中提取 base64 数据和 mime type
  const [header, base64Data] = file.data.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
  const buffer = Buffer.from(base64Data, 'base64');

  return c.body(buffer, 200, {
    'Content-Type': mimeType,
    'Content-Disposition': `inline; filename="${file.originalName}"`
  });
});

// 3. Base64 上传接口 (POST /api/upload/base64)
app.post('/base64', async (c) => {
  try {
    const { data, filename, type } = await c.req.json();

    if (!data) {
      return c.json({ error: 'No base64 data provided' }, 400);
    }

    // 提取 base64 数据部分
    const base64Data = data.replace(/^data:[^;]+;base64,/, '');
    const mimeType = data.match(/^data:([^;]+);base64,/)?.[1] || type || 'application/octet-stream';

    const ext = filename ? getExt(filename) : (type === 'audio' ? '.mp3' : '.jpg');
    const nameWithoutExt = filename ? sanitizeFilename(filename.replace(ext, '')) : 'upload';
    const safeFilename = `${Date.now()}-${nameWithoutExt}${ext}`;

    // 构造文件信息对象
    const uploadedFile: UploadedFile = {
      id: 'file-' + Date.now(),
      filename: safeFilename,
      originalName: filename || 'upload' + ext,
      mimeType,
      size: Buffer.from(base64Data, 'base64').length,
      data: `data:${mimeType};base64,${base64Data}`,
      uploadedAt: new Date().toISOString()
    };

    // 保存到内存数据库
    db.uploadedFiles.push(uploadedFile);

    const fileUrl = `/api/upload/file/${uploadedFile.id}`;

    return c.json({
      success: true,
      url: fileUrl,
      filename: safeFilename
    });

  } catch (error) {
    console.error('Base64 上传失败:', error);
    return c.json({ error: '服务器内部错误' }, 500);
  }
});

export default app;