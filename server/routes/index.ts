import { Hono } from 'hono';
import booksRouter from './books';
import commentsRouter from './comments';
import reviewsRouter from './reviews';
import guestbookRouter from './guestbook';
import logsRouter from './logs';
import musicRouter from './music';
import statsRouter from './stats';
import uploadRouter from './upload';

const app = new Hono();

app.route('/books', booksRouter);
app.route('/comments', commentsRouter);
app.route('/reviews', reviewsRouter);
app.route('/guestbook', guestbookRouter);
app.route('/logs', logsRouter);
app.route('/music', musicRouter);
app.route('/stats', statsRouter);
app.route('/upload', uploadRouter);

export default app;
