import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import booksRouter from './routes/books';
import commentsRouter from './routes/comments';
import reviewsRouter from './routes/reviews';
import guestbookRouter from './routes/guestbook';
import logsRouter from './routes/logs';
import musicRouter from './routes/music';
import statsRouter from './routes/stats';
import uploadRouter from './routes/upload';
import { initStore, UPLOADS_DIR } from './db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize DB store
  initStore();

  // Middleware
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Serve uploaded files statically
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Mount API endpoints
  app.use('/api/books', booksRouter);
  app.use('/api/comments', commentsRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/guestbook', guestbookRouter);
  app.use('/api/logs', logsRouter);
  app.use('/api/music', musicRouter);
  app.use('/api/stats', statsRouter);
  app.use('/api/upload', uploadRouter);

  // Development vs Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Shuying Server] Express + Vite backend listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
