import { Book, Comment, Review, GuestbookMessage, MusicTrack, WritingStatusLog, SiteStats } from './types';

// Books API
export async function fetchBooks(): Promise<Book[]> {
  try {
    const res = await fetch('/api/books');
    if (!res.ok) throw new Error('Failed to fetch books');
    return await res.json();
  } catch (err) {
    console.error(err);
    const saved = localStorage.getItem('shuying_books');
    return saved ? JSON.parse(saved) : [];
  }
}

export async function createBook(book: Book): Promise<Book> {
  const res = await fetch('/api/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(book)
  });
  const data = await res.json();
  return data.book;
}

export async function updateBook(id: string, bookData: Partial<Book>): Promise<Book> {
  const res = await fetch(`/api/books/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookData)
  });
  const data = await res.json();
  return data.book;
}

export async function deleteBook(id: string): Promise<void> {
  await fetch(`/api/books/${id}`, { method: 'DELETE' });
}

export async function resetBooks(): Promise<Book[]> {
  const res = await fetch('/api/books/reset', { method: 'POST' });
  const data = await res.json();
  return data.books;
}

// Comments API
export async function fetchComments(): Promise<Comment[]> {
  try {
    const res = await fetch('/api/comments');
    if (!res.ok) throw new Error('Failed to fetch comments');
    return await res.json();
  } catch (err) {
    console.error(err);
    const saved = localStorage.getItem('shuying_comments');
    return saved ? JSON.parse(saved) : [];
  }
}

export async function createComment(comment: Partial<Comment>): Promise<Comment> {
  const res = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comment)
  });
  const data = await res.json();
  return data.comment;
}

export async function deleteComment(id: string): Promise<void> {
  await fetch(`/api/comments/${id}`, { method: 'DELETE' });
}

export async function likeComment(id: string): Promise<void> {
  await fetch(`/api/comments/${id}/like`, { method: 'POST' });
}

// Reviews API
export async function fetchReviews(): Promise<Review[]> {
  try {
    const res = await fetch('/api/reviews');
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return await res.json();
  } catch (err) {
    console.error(err);
    const saved = localStorage.getItem('shuying_reviews');
    return saved ? JSON.parse(saved) : [];
  }
}

export async function createReview(review: Partial<Review>): Promise<Review> {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review)
  });
  const data = await res.json();
  return data.review;
}

export async function deleteReview(id: string): Promise<void> {
  await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
}

export async function replyReview(id: string, userName: string, content: string): Promise<any> {
  const res = await fetch(`/api/reviews/${id}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userName, content })
  });
  return await res.json();
}

export async function likeReview(id: string): Promise<void> {
  await fetch(`/api/reviews/${id}/like`, { method: 'POST' });
}

// Guestbook API
export async function fetchGuestbook(): Promise<GuestbookMessage[]> {
  try {
    const res = await fetch('/api/guestbook');
    if (!res.ok) throw new Error('Failed to fetch guestbook');
    return await res.json();
  } catch (err) {
    console.error(err);
    const saved = localStorage.getItem('shuying_guestbook');
    return saved ? JSON.parse(saved) : [];
  }
}

export async function createGuestbookMessage(msg: Partial<GuestbookMessage>): Promise<GuestbookMessage> {
  const res = await fetch('/api/guestbook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(msg)
  });
  const data = await res.json();
  return data.message;
}

export async function deleteGuestbookMessage(id: string): Promise<void> {
  await fetch(`/api/guestbook/${id}`, { method: 'DELETE' });
}

export async function replyGuestbookMessage(id: string, authorReply: string): Promise<void> {
  await fetch(`/api/guestbook/${id}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authorReply })
  });
}

export async function likeGuestbookMessage(id: string): Promise<void> {
  await fetch(`/api/guestbook/${id}/like`, { method: 'POST' });
}

// Status Logs API
export async function fetchStatusLogs(): Promise<{ logs: WritingStatusLog[]; quote: string }> {
  try {
    const res = await fetch('/api/logs');
    if (!res.ok) throw new Error('Failed to fetch status logs');
    return await res.json();
  } catch (err) {
    console.error(err);
    return { logs: [], quote: '' };
  }
}

export async function createStatusLog(log: Partial<WritingStatusLog>): Promise<WritingStatusLog> {
  const res = await fetch('/api/logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log)
  });
  const data = await res.json();
  return data.log;
}

export async function updateStatusLog(id: string, logData: Partial<WritingStatusLog>): Promise<void> {
  await fetch(`/api/logs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logData)
  });
}

export async function deleteStatusLog(id: string): Promise<void> {
  await fetch(`/api/logs/${id}`, { method: 'DELETE' });
}

export async function updateStatusQuote(quote: string): Promise<void> {
  await fetch('/api/logs/quote/update', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quote })
  });
}

// Music API
export async function fetchMusicTracks(): Promise<MusicTrack[]> {
  try {
    const res = await fetch('/api/music');
    if (!res.ok) throw new Error('Failed to fetch music tracks');
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function createMusicTrack(track: MusicTrack): Promise<MusicTrack> {
  const res = await fetch('/api/music', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(track)
  });
  const data = await res.json();
  return data.track;
}

export async function deleteMusicTrack(id: string): Promise<void> {
  await fetch(`/api/music/${id}`, { method: 'DELETE' });
}

// Stats API
export async function fetchSiteStats(): Promise<SiteStats> {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('Failed to fetch site stats');
    return await res.json();
  } catch (err) {
    console.error(err);
    return { views: 2000, booksCount: 0, commentsCount: 0, likesCount: 0 };
  }
}

export async function recordSiteView(): Promise<number> {
  try {
    const res = await fetch('/api/stats/view', { method: 'POST' });
    const data = await res.json();
    return data.views;
  } catch (err) {
    console.error(err);
    return 2000;
  }
}

// File Upload API
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload/file', {
    method: 'POST',
    body: formData
  });

  if (!res.ok) throw new Error('File upload failed');
  const data = await res.json();
  return data.url;
}

export async function uploadBase64(data: string, filename?: string, type?: string): Promise<string> {
  const res = await fetch('/api/upload/base64', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, filename, type })
  });

  if (!res.ok) throw new Error('Base64 upload failed');
  const resData = await res.json();
  return resData.url;
}
