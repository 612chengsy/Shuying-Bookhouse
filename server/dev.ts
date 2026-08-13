import http from 'node:http';
import app from './index';

// 本地开发使用的 Node HTTP 包装器
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const contentLength = Number(req.headers['content-length'] || 0);
    const hasTransferEncoding = !!req.headers['transfer-encoding'];
    const hasBody = !['GET', 'HEAD'].includes(req.method || '') && (contentLength > 0 || hasTransferEncoding);

    const init: any = {
      method: req.method,
      headers: req.headers as HeadersInit,
    };

    if (hasBody) {
      init.body = req;
      init.duplex = 'half';
    }

    const request = new Request(url.toString(), init);
    const resp = await app.fetch(request);

    res.writeHead(resp.status, Object.fromEntries(resp.headers.entries()));
    const buf = Buffer.from(await resp.arrayBuffer());
    res.end(buf);
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
});

server.listen(port, () => console.log(`Server listening on http://localhost:${port}`));

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection', reason);
});
