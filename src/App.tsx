import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Feather, Sparkles, Scroll, Heart, Eye, MessageSquare, 
  PlusCircle, RefreshCw, Search, ArrowRight, ShieldCheck, CheckCircle2, Bookmark
} from 'lucide-react';

import { Book, Comment, Review, GuestbookMessage, SiteStats, BookCategory } from './types';
import { INITIAL_BOOKS, INITIAL_REVIEWS, INITIAL_GUESTBOOK } from './data/initialData';
import { 
  fetchBooks, createBook, updateBook, deleteBook, resetBooks,
  fetchComments, createComment,
  fetchReviews, createReview, likeReview, replyReview,
  fetchGuestbook, createGuestbookMessage, likeGuestbookMessage,
  recordSiteView
} from './api';
import { Navbar } from './components/Navbar';
import { FooterStats } from './components/FooterStats';
import { BookCard } from './components/BookCard';
import { BookReader } from './components/BookReader';
import { ImportBookModal } from './components/ImportBookModal';
import { ImportChapterModal } from './components/ImportChapterModal';
import { BookReviews } from './components/BookReviews';
import { AuthorProfile } from './components/AuthorProfile';
import { AdminLoginModal } from './components/AdminLoginModal';
import { formatWordCount } from './utils/wordCount';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark' | 'parchment'>('dark');
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [targetBookForChapterManage, setTargetBookForChapterManage] = useState<string | undefined>(undefined);

  // Admin Authentication State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem('shuying_admin_logged') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminPromptMsg, setAdminPromptMsg] = useState<string | undefined>(undefined);

  // Books State with LocalStorage
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem('shuying_books');
      if (saved) {
        const parsed: Book[] = JSON.parse(saved);
        // Auto-migrate cached titles and data from INITIAL_BOOKS
        return parsed.map(b => {
          if (b.id === 'novel-1' || b.title === '默读') {
            const freshDefault = INITIAL_BOOKS.find(ib => ib.id === 'novel-1');
            return freshDefault || { ...b, title: '予梦沉沦' };
          }
          if (b.id === 'novel-2' || b.title === '错眠') {
            const freshDefault = INITIAL_BOOKS.find(ib => ib.id === 'novel-2');
            return freshDefault || { ...b, title: '假寐' };
          }
          if (b.id === 'novel-3' || b.title === '时光逝缘未绝') {
            const freshDefault = INITIAL_BOOKS.find(ib => ib.id === 'novel-3');
            return freshDefault || { ...b, title: '缘续流年' };
          }
          if (b.id === 'poetry-2') {
            const freshDefault = INITIAL_BOOKS.find(ib => ib.id === 'poetry-2');
            return freshDefault || b;
          }
          if (b.id === 'poetry-1' && !b.coverImage) {
            const freshPoetry = INITIAL_BOOKS.find(ib => ib.id === 'poetry-1');
            return freshPoetry || b;
          }
          return b;
        });
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BOOKS;
  });

  // Derive active book for reader directly from books list
  const selectedBookForReading = useMemo(() => {
    return books.find(b => b.id === selectedBookId) || null;
  }, [books, selectedBookId]);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const saved = localStorage.getItem('shuying_reviews');
      if (saved) {
        const parsed: Review[] = JSON.parse(saved);
        return parsed.map(r => {
          let bookTitle = r.bookTitle;
          if (r.bookId === 'novel-1' || bookTitle === '默读') {
            bookTitle = '予梦沉沦';
          }
          let content = r.content;
          if (content && content.includes('默读')) {
            content = content.replaceAll('默读', '予梦沉沦');
          }
          return {
            ...r,
            bookTitle,
            content
          };
        });
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_REVIEWS;
  });

  // Book Comments State
  const [comments, setComments] = useState<Comment[]>(() => {
    try {
      const saved = localStorage.getItem('shuying_comments');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'c-101',
        bookId: 'novel-1',
        userName: '云游诗人',
        content: '第一章的雨夜气氛渲染太到位了，读起来非常有代入感！',
        createdAt: '2026-08-01 14:20',
        likes: 12
      },
      {
        id: 'c-102',
        bookId: 'poetry-1',
        userName: '竹林清风',
        content: '“疏影横斜水清浅”写得很灵动，有古风雅韵。',
        createdAt: '2026-08-03 10:15',
        likes: 8
      }
    ];
  });

  // Guestbook Messages
  const [guestbook, setGuestbook] = useState<GuestbookMessage[]>(() => {
    try {
      const saved = localStorage.getItem('shuying_guestbook');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_GUESTBOOK;
  });

  // User Liked Book IDs
  const [likedBookIds, setLikedBookIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('shuying_user_likes');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // Total Views Tracker (Base 2000, +1 per visit/reading)
  const [totalViews, setTotalViews] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('shuying_total_views');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 2000) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return 2000;
  });

  // Load initial data from backend API
  useEffect(() => {
    fetchBooks().then(data => {
      if (data && data.length > 0) setBooks(data);
    }).catch(err => console.error('Failed to fetch books:', err));

    fetchReviews().then(data => {
      if (data && data.length > 0) setReviews(data);
    }).catch(err => console.error('Failed to fetch reviews:', err));

    fetchComments().then(data => {
      if (data && data.length > 0) setComments(data);
    }).catch(err => console.error('Failed to fetch comments:', err));

    fetchGuestbook().then(data => {
      if (data && data.length > 0) setGuestbook(data);
    }).catch(err => console.error('Failed to fetch guestbook:', err));

    recordSiteView().then(v => {
      if (v) setTotalViews(v);
    }).catch(err => console.error('Failed to record site view:', err));
  }, []);

  // Persist Data
  useEffect(() => {
    localStorage.setItem('shuying_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('shuying_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('shuying_comments', JSON.stringify(comments));
  }, [comments]);

  useEffect(() => {
    localStorage.setItem('shuying_guestbook', JSON.stringify(guestbook));
  }, [guestbook]);

  useEffect(() => {
    localStorage.setItem('shuying_user_likes', JSON.stringify(likedBookIds));
  }, [likedBookIds]);

  useEffect(() => {
    localStorage.setItem('shuying_total_views', totalViews.toString());
  }, [totalViews]);

  // Compute stats dynamically for home footer
  const siteStats: SiteStats = useMemo(() => {
    const totalLikesCount = books.reduce((acc, b) => acc + b.likes, 0);
    const totalCommentsCount = comments.length + reviews.length + guestbook.length;
    return {
      booksCount: books.length,
      commentsCount: totalCommentsCount,
      views: totalViews,
      likesCount: totalLikesCount
    };
  }, [books, comments, reviews, guestbook, totalViews]);

  // Admin Login / Logout Handlers
  const handleRequireAdmin = (promptMsg?: string) => {
    if (isAdmin) return true;
    setAdminPromptMsg(promptMsg || '此功能需要管理员权限，请先登录管理员账号（Admin）。');
    setIsAdminModalOpen(true);
    return false;
  };

  const handleLoginAdminSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem('shuying_admin_logged', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('shuying_admin_logged');
  };

  const handleOpenImportBookModal = () => {
    if (!isAdmin) {
      handleRequireAdmin('导入书籍需要管理员权限，请先登录管理员账号。');
      return;
    }
    setIsImportModalOpen(true);
  };

  // Handle Book Reading
  const handleOpenReader = (book: Book) => {
    // Increment book view & total site views
    const newViews = book.views + 1;
    setBooks(prev => prev.map(b => b.id === book.id ? { ...b, views: newViews } : b));
    updateBook(book.id, { views: newViews }).catch(err => console.error(err));
    setTotalViews(v => v + 1);
    setSelectedBookId(book.id);
  };

  // Handle Book Like
  const handleToggleLikeBook = (bookId: string) => {
    const isLiked = likedBookIds.includes(bookId);
    let newLikes = 0;
    if (isLiked) {
      setLikedBookIds(prev => prev.filter(id => id !== bookId));
      setBooks(prev => prev.map(b => {
        if (b.id === bookId) {
          newLikes = Math.max(0, b.likes - 1);
          return { ...b, likes: newLikes };
        }
        return b;
      }));
    } else {
      setLikedBookIds(prev => [...prev, bookId]);
      setBooks(prev => prev.map(b => {
        if (b.id === bookId) {
          newLikes = b.likes + 1;
          return { ...b, likes: newLikes };
        }
        return b;
      }));
    }
    updateBook(bookId, { likes: newLikes }).catch(err => console.error(err));
  };

  // Handle Open Manage Chapters Modal
  const handleOpenManageChaptersModal = (bookId?: string) => {
    if (!isAdmin) {
      handleRequireAdmin('导入与管理书籍章节需要管理员权限，请先登录管理员账号。');
      return;
    }
    setTargetBookForChapterManage(bookId || books[0]?.id);
    setIsChapterModalOpen(true);
  };

  // Handle Add / Import Chapter to Book
  const handleAddChapter = (bookId: string, chapterTitle: string, chapterContent: string) => {
    if (!isAdmin) {
      handleRequireAdmin('导入书籍章节需要管理员权限，请先登录管理员账号。');
      return;
    }
    const newChapter = {
      id: `ch-${Date.now()}`,
      title: chapterTitle,
      content: chapterContent,
      updatedAt: new Date().toISOString()
    };

    let updatedChaptersList: any[] = [];
    let wordCountStr = '';

    setBooks(prev => prev.map(b => {
      if (b.id === bookId) {
        updatedChaptersList = [...(b.chapters || []), newChapter];
        const totalChars = updatedChaptersList.reduce((acc, c) => acc + (c.content?.length || 0), 0);
        wordCountStr = formatWordCount(totalChars);
        return {
          ...b,
          chapters: updatedChaptersList,
          wordCount: wordCountStr
        };
      }
      return b;
    }));

    updateBook(bookId, { chapters: updatedChaptersList, wordCount: wordCountStr }).catch(err => console.error(err));
  };

  // Handle Delete Chapter from Book
  const handleDeleteChapter = (bookId: string, chapterId: string) => {
    if (!isAdmin) {
      handleRequireAdmin('删除书籍章节需要管理员权限，请先登录管理员账号。');
      return;
    }

    let updatedChaptersList: any[] = [];
    let wordCountStr = '';

    setBooks(prev => prev.map(b => {
      if (b.id === bookId) {
        updatedChaptersList = (b.chapters || []).filter(c => c.id !== chapterId);
        const totalChars = updatedChaptersList.reduce((acc, c) => acc + (c.content?.length || 0), 0);
        wordCountStr = formatWordCount(totalChars);
        return {
          ...b,
          chapters: updatedChaptersList,
          wordCount: wordCountStr
        };
      }
      return b;
    }));

    updateBook(bookId, { chapters: updatedChaptersList, wordCount: wordCountStr }).catch(err => console.error(err));
  };

  // Handle Delete Book from shelf
  const handleDeleteBook = (bookId: string) => {
    if (!isAdmin) {
      handleRequireAdmin('删除书籍需要管理员权限，请先登录管理员账号。');
      return;
    }
    setBooks(prev => prev.filter(b => b.id !== bookId));
    deleteBook(bookId).catch(err => console.error(err));
    if (selectedBookId === bookId) {
      setSelectedBookId(null);
    }
  };

  // Handle Import New Book
  const handleImportBook = (newBookData: Omit<Book, 'id' | 'likes' | 'views' | 'createdAt'>) => {
    if (!isAdmin) {
      handleRequireAdmin('导入书籍需要管理员权限，请先登录管理员账号。');
      return;
    }
    const newBook: Book = {
      ...newBookData,
      id: `custom-book-${Date.now()}`,
      likes: 1,
      views: 1,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setBooks(prev => [newBook, ...prev]);
    createBook(newBook).catch(err => console.error(err));

    // Navigate directly to category
    if (newBook.category === '文学诗词') {
      setActiveTab('poetry');
    } else {
      setActiveTab('novels');
    }
  };

  // Handle Restore Default Bookshelf
  const handleRestoreDefaults = () => {
    setBooks(INITIAL_BOOKS);
    resetBooks().catch(err => console.error(err));
  };

  // Handle Add Reader Comment
  const handleAddComment = (commentData: Omit<Comment, 'id' | 'createdAt' | 'likes'>) => {
    const newComment: Comment = {
      ...commentData,
      id: `c-${Date.now()}`,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      likes: 0
    };
    setComments(prev => [newComment, ...prev]);
    createComment(newComment).catch(err => console.error(err));
  };

  // Handle Add Review
  const handleAddReview = (reviewData: Omit<Review, 'id' | 'createdAt' | 'likes'>) => {
    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      likes: 0
    };
    setReviews(prev => [newRev, ...prev]);
    createReview(newRev).catch(err => console.error(err));
  };

  // Handle Like Review
  const handleLikeReview = (reviewId: string) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, likes: r.likes + 1 } : r));
    likeReview(reviewId).catch(err => console.error(err));
  };

  // Handle Reply Review
  const handleAddReply = (reviewId: string, reply: { userName: string; content: string }) => {
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        const newReplies = r.replies || [];
        return {
          ...r,
          replies: [
            ...newReplies,
            {
              id: `rep-${Date.now()}`,
              userName: reply.userName,
              content: reply.content,
              createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
            }
          ]
        };
      }
      return r;
    }));
    replyReview(reviewId, reply.userName, reply.content).catch(err => console.error(err));
  };

  // Handle Guestbook Message
  const handleAddGuestbook = (msg: { userName: string; content: string }) => {
    const newMsg: GuestbookMessage = {
      id: `g-${Date.now()}`,
      userName: msg.userName,
      content: msg.content,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      likes: 0,
      authorReply: '非常感谢你的留言！祝阅读愉快～'
    };
    setGuestbook(prev => [newMsg, ...prev]);
    createGuestbookMessage(newMsg).catch(err => console.error(err));
  };

  const handleLikeGuestbook = (msgId: string) => {
    setGuestbook(prev => prev.map(g => g.id === msgId ? { ...g, likes: g.likes + 1 } : g));
    likeGuestbookMessage(msgId).catch(err => console.error(err));
  };

  // Handle Update Cover Image for a book
  const handleUpdateCoverImage = (bookId: string, coverImageUrl: string, backCoverImageUrl?: string) => {
    setBooks(prev => prev.map(b => {
      if (b.id === bookId) {
        return {
          ...b,
          coverImage: coverImageUrl,
          ...(backCoverImageUrl !== undefined ? { backCoverImage: backCoverImageUrl } : {})
        };
      }
      return b;
    }));
    updateBook(bookId, {
      coverImage: coverImageUrl,
      ...(backCoverImageUrl !== undefined ? { backCoverImage: backCoverImageUrl } : {})
    }).catch(err => console.error(err));
  };

  // Filtered books
  const literatureBooks = books.filter(b => b.category === '文学诗词');
  const novelBooks = books.filter(b => b.category === '小说');

  // Search filter
  const searchFilteredBooks = searchQuery.trim()
    ? books.filter(b => 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.tags && b.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
      )
    : books;

  // Render Full Screen Reader Overlay if active
  if (selectedBookForReading) {
    return (
      <>
        <BookReader
          book={selectedBookForReading}
          onClose={() => setSelectedBookId(null)}
          onLike={handleToggleLikeBook}
          isLiked={likedBookIds.includes(selectedBookForReading.id)}
          comments={comments}
          onAddComment={handleAddComment}
          onOpenManageChapters={handleOpenManageChaptersModal}
          onDeleteChapter={handleDeleteChapter}
          onUpdateCoverImage={handleUpdateCoverImage}
          isAdmin={isAdmin}
          onRequireAdmin={handleRequireAdmin}
        />
        <ImportChapterModal
          isOpen={isChapterModalOpen}
          onClose={() => setIsChapterModalOpen(false)}
          books={books}
          selectedBookId={targetBookForChapterManage}
          onAddChapter={handleAddChapter}
          onDeleteChapter={handleDeleteChapter}
        />
        <AdminLoginModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
          onLoginSuccess={handleLoginAdminSuccess}
          promptMsg={adminPromptMsg}
        />
      </>
    );
  }

  // Determine site theme class
  const getAppThemeClass = () => {
    if (theme === 'parchment') return 'bg-[#f4efe6] text-[#2c221e]';
    if (theme === 'light') return 'bg-stone-100 text-stone-900';
    return 'bg-stone-950 text-stone-100';
  };

  return (
    <div className={`min-h-screen ${getAppThemeClass()} transition-colors duration-300 flex flex-col font-sans selection:bg-amber-900 selection:text-amber-100`}>
      
      {/* Top Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenImportModal={handleOpenImportBookModal}
        theme={theme}
        setTheme={setTheme}
        isAdmin={isAdmin}
        onOpenAdminModal={() => {
          setAdminPromptMsg('登录管理员账号以进行导入与删除图书、章节、封面和音乐等高级操作');
          setIsAdminModalOpen(true);
        }}
        onAdminLogout={handleAdminLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">

        {/* Global Search Results View when user types query */}
        {searchQuery.trim() !== '' ? (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-bold text-amber-100">
                搜索结果：“<span className="text-amber-400">{searchQuery}</span>” ({searchFilteredBooks.length})
              </h2>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-stone-400 hover:text-stone-200"
              >
                清除搜索
              </button>
            </div>

            {searchFilteredBooks.length === 0 ? (
              <div className="text-center py-16 bg-stone-900/60 rounded-2xl border border-stone-800">
                <p className="text-stone-400 text-xs">未找到符合条件的书籍，换个词试试？</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchFilteredBooks.map(b => (
                  <BookCard
                    key={b.id}
                    book={b}
                    onRead={handleOpenReader}
                    onLike={handleToggleLikeBook}
                    onDelete={handleDeleteBook}
                    onManageChapters={handleOpenManageChaptersModal}
                    isLiked={likedBookIds.includes(b.id)}
                    isAdmin={isAdmin}
                    onRequireAdmin={handleRequireAdmin}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* MODULE 1: 首页 (Home) */}
            {activeTab === 'home' && (
              <div>
                {/* Hero Welcome Banner */}
                <section className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-900 to-amber-950/40 border-b border-amber-900/30 py-12 sm:py-20 px-4">
                  <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="max-w-5xl mx-auto text-center relative z-10">
                    
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-300 text-xs font-serif mb-6 shadow-inner">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      舟渡星港 · 个人作品集中营
                    </div>

                    <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-wider text-amber-100 leading-tight">
                      疏影横斜水清浅 <br />
                      <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent">
                        疏影书屋
                      </span>
                    </h1>

                    {/* Prompt specified welcome banner message */}
                    <p className="font-serif text-stone-200 text-base sm:text-lg max-w-3xl mx-auto mt-6 leading-relaxed bg-stone-900/80 p-5 rounded-2xl border border-amber-900/40 shadow-xl">
                      “欢迎来到我的小书屋，本网站为纯公益网站，上架书籍基本都是本人原创。欢迎在线阅读，并留下宝贵意见。”
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                      <button
                        onClick={() => setActiveTab('novels')}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-amber-50 font-bold text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95"
                      >
                        <BookOpen className="w-4 h-4" />
                        浏览原创小说
                      </button>
                      <button
                        onClick={() => setActiveTab('poetry')}
                        className="px-6 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-medium text-sm flex items-center gap-2 transition-colors"
                      >
                        <Scroll className="w-4 h-4 text-amber-400" />
                        欣赏文学诗词
                      </button>
                    </div>

                  </div>
                </section>

                {/* Featured Books Section on Home */}
                <section className="max-w-7xl mx-auto px-4 py-12">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-amber-100 flex items-center gap-2">
                        <Bookmark className="w-5 h-5 text-amber-500" />
                        书架精选推荐
                      </h2>
                      <p className="text-xs text-stone-400 mt-1">点击任意书籍即可进入沉浸式电子书阅读界面</p>
                    </div>

                    {books.length < INITIAL_BOOKS.length && (
                      <button
                        onClick={handleRestoreDefaults}
                        className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> 重置恢复默认书架
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.slice(0, 6).map((b) => (
                      <BookCard
                        key={b.id}
                        book={b}
                        onRead={handleOpenReader}
                        onLike={handleToggleLikeBook}
                        onDelete={handleDeleteBook}
                        onManageChapters={handleOpenManageChaptersModal}
                        isLiked={likedBookIds.includes(b.id)}
                        isAdmin={isAdmin}
                        onRequireAdmin={handleRequireAdmin}
                      />
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* MODULE 2: 文学诗词 (Literature & Poetry) */}
            {activeTab === 'poetry' && (
              <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-stone-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <Scroll className="w-6 h-6 text-amber-500" />
                      <h2 className="font-serif text-2xl font-bold text-amber-100">
                        文学诗词
                      </h2>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800/50">
                        {literatureBooks.length} 本
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-1 font-sans">
                      抒情短诗、古风散文诗与小说衍生诗合集。支持在线阅读、导入手稿及书架与章节管理。
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleOpenImportBookModal}
                      className="px-4 py-2 bg-gradient-to-r from-amber-700 to-emerald-800 text-stone-100 rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4 text-amber-300" />
                      导入诗词手稿
                    </button>
                  </div>
                </div>

                {/* Poetry Bookshelf Grid */}
                {literatureBooks.length === 0 ? (
                  <div className="text-center py-16 bg-stone-900/60 rounded-2xl border border-stone-800">
                    <p className="text-stone-400 text-xs mb-3">文学诗词分类下暂无书籍</p>
                    <button
                      onClick={handleRestoreDefaults}
                      className="px-4 py-2 bg-amber-800 text-amber-100 rounded-xl text-xs font-bold"
                    >
                      恢复默认初始书籍
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {literatureBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onRead={handleOpenReader}
                        onLike={handleToggleLikeBook}
                        onDelete={handleDeleteBook}
                        onManageChapters={handleOpenManageChaptersModal}
                        isLiked={likedBookIds.includes(book.id)}
                        isAdmin={isAdmin}
                        onRequireAdmin={handleRequireAdmin}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MODULE 3: 小说 (Novels) */}
            {activeTab === 'novels' && (
              <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-stone-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-amber-500" />
                      <h2 className="font-serif text-2xl font-bold text-amber-100">
                        小说书架
                      </h2>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800/50">
                        {novelBooks.length} 本
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-1 font-sans">
                      包含《予梦沉沦》、《假寐》、《缘续流年》、《一个小段子》等原创小说，点击可在线阅读或导入/管理章节。
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleOpenImportBookModal}
                      className="px-4 py-2 bg-gradient-to-r from-amber-700 to-emerald-800 text-stone-100 rounded-xl text-xs font-bold shadow flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4 text-amber-300" />
                      导入小说书籍
                    </button>
                  </div>
                </div>

                {/* Novel Bookshelf Grid */}
                {novelBooks.length === 0 ? (
                  <div className="text-center py-16 bg-stone-900/60 rounded-2xl border border-stone-800">
                    <p className="text-stone-400 text-xs mb-3">小说书架目前空空如也</p>
                    <button
                      onClick={handleRestoreDefaults}
                      className="px-4 py-2 bg-amber-800 text-amber-100 rounded-xl text-xs font-bold"
                    >
                      恢复默认初始小说
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {novelBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onRead={handleOpenReader}
                        onLike={handleToggleLikeBook}
                        onDelete={handleDeleteBook}
                        onManageChapters={handleOpenManageChaptersModal}
                        isLiked={likedBookIds.includes(book.id)}
                        isAdmin={isAdmin}
                        onRequireAdmin={handleRequireAdmin}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MODULE 4: 书评 (Book Reviews) */}
            {activeTab === 'reviews' && (
              <BookReviews
                reviews={reviews}
                books={books}
                onAddReview={handleAddReview}
                onLikeReview={handleLikeReview}
                onAddReply={handleAddReply}
              />
            )}

            {/* MODULE 5: 作者简介 (Author Profile) */}
            {activeTab === 'author' && (
              <AuthorProfile
                guestbook={guestbook}
                onAddGuestbook={handleAddGuestbook}
                onLikeGuestbook={handleLikeGuestbook}
                isAdmin={isAdmin}
                onRequireAdmin={handleRequireAdmin}
              />
            )}

            {/* Data Statistics Panel Footer */}
            <FooterStats stats={siteStats} />
          </>
        )}

      </main>

      {/* Import Electronic Book Modal */}
      <ImportBookModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportBook}
      />

      {/* Import & Delete Chapters Modal */}
      <ImportChapterModal
        isOpen={isChapterModalOpen}
        onClose={() => setIsChapterModalOpen(false)}
        books={books}
        selectedBookId={targetBookForChapterManage}
        onAddChapter={handleAddChapter}
        onDeleteChapter={handleDeleteChapter}
      />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onLoginSuccess={handleLoginAdminSuccess}
        promptMsg={adminPromptMsg}
      />

    </div>
  );
}
