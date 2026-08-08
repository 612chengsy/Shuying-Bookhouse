import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, BookOpen, Heart, MessageSquare, 
  Settings, List, Send, Sun, Moon, Scroll, Sparkles, Check, Share2, PlusCircle, Trash2, Image as ImageIcon, Upload
} from 'lucide-react';
import { Book, Comment } from '../types';
import { calculateBookWordCount } from '../utils/wordCount';

interface BookReaderProps {
  book: Book;
  onClose: () => void;
  onLike: (bookId: string) => void;
  isLiked?: boolean;
  comments: Comment[];
  onAddComment: (comment: Omit<Comment, 'id' | 'createdAt' | 'likes'>) => void;
  onOpenManageChapters?: (bookId: string) => void;
  onDeleteChapter?: (bookId: string, chapterId: string) => void;
  onUpdateCoverImage?: (bookId: string, coverImageUrl: string, backCoverImageUrl?: string) => void;
  isAdmin?: boolean;
  onRequireAdmin?: (promptMsg?: string) => void;
}

export const BookReader: React.FC<BookReaderProps> = ({
  book,
  onClose,
  onLike,
  isLiked = false,
  comments,
  onAddComment,
  onOpenManageChapters,
  onDeleteChapter,
  onUpdateCoverImage,
  isAdmin = false,
  onRequireAdmin
}) => {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('lg');
  const [readerTheme, setReaderTheme] = useState<'parchment' | 'dark' | 'green' | 'light'>('parchment');
  const [showSidebar, setShowSidebar] = useState(false);
  const [viewMode, setViewMode] = useState<'reader' | 'cover' | 'backCover'>('cover');
  const [newCommentUser, setNewCommentUser] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [uploadMsg, setUploadMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const coverFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCoverUploadButtonClick = () => {
    if (!isAdmin) {
      if (onRequireAdmin) {
        onRequireAdmin('导入或更换书籍封面需要管理员权限，请先登录管理员账号。');
      }
      return;
    }
    coverFileInputRef.current?.click();
  };

  // Reset to cover view when switching books
  useEffect(() => {
    setViewMode('cover');
    setCurrentChapterIndex(0);
  }, [book.id]);

  // Handle Cover / BackCover File Upload
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'cover' | 'backCover') => {
    if (!isAdmin) {
      if (onRequireAdmin) onRequireAdmin('导入或删除书籍封面需要管理员权限，请先登录管理员账号。');
      e.target.value = '';
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl && onUpdateCoverImage) {
        if (target === 'cover') {
          onUpdateCoverImage(book.id, dataUrl, book.backCoverImage);
          setUploadMsg('封面图片已成功更新并保存！');
        } else {
          onUpdateCoverImage(book.id, book.coverImage || '', dataUrl);
          setUploadMsg('封底图片已成功更新并保存！');
        }
        setTimeout(() => setUploadMsg(''), 3000);
      }
    };
    reader.readAsDataURL(file);
  };

  const chapters = book.chapters || [];
  const currentChapter = chapters[currentChapterIndex] || chapters[0] || null;

  // Scroll to top when switching chapter
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentChapterIndex]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    onAddComment({
      bookId: book.id,
      chapterId: currentChapter?.id,
      userName: newCommentUser.trim() || '书友访客',
      content: newCommentText.trim()
    });

    setNewCommentText('');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Font size mapping
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm': return 'text-sm leading-relaxed';
      case 'base': return 'text-base leading-relaxed';
      case 'lg': return 'text-lg leading-loose';
      case 'xl': return 'text-xl leading-loose';
      default: return 'text-lg leading-loose';
    }
  };

  // Reader Background Themes
  const getThemeClasses = () => {
    switch (readerTheme) {
      case 'parchment':
        return {
          bg: 'bg-[#f4efe6] text-[#2c221e]',
          header: 'bg-[#e8dfd1]/90 text-[#2c221e] border-[#d8cbb8]',
          card: 'bg-[#e8dfd1]/60 border-[#d5c7b3]',
          input: 'bg-[#f9f6f0] border-[#cfc0ab] text-[#2c221e]'
        };
      case 'dark':
        return {
          bg: 'bg-stone-950 text-stone-200',
          header: 'bg-stone-900/90 text-stone-100 border-stone-800',
          card: 'bg-stone-900/60 border-stone-800',
          input: 'bg-stone-900 border-stone-700 text-stone-100'
        };
      case 'green':
        return {
          bg: 'bg-[#eaf2e8] text-[#1b3322]',
          header: 'bg-[#d8e6d5]/90 text-[#1b3322] border-[#c0d6bc]',
          card: 'bg-[#d8e6d5]/60 border-[#c0d6bc]',
          input: 'bg-[#f3f8f2] border-[#b4ccb0] text-[#1b3322]'
        };
      case 'light':
        return {
          bg: 'bg-stone-50 text-stone-900',
          header: 'bg-white/90 text-stone-900 border-stone-200 shadow-sm',
          card: 'bg-white border-stone-200 shadow-sm',
          input: 'bg-white border-stone-300 text-stone-900'
        };
    }
  };

  const themeStyle = getThemeClasses();
  const bookComments = (comments || []).filter(c => c.bookId === book.id);

  return (
    <div className={`min-h-screen ${themeStyle.bg} transition-colors duration-200 font-serif relative`}>
      
      {/* Top Floating Control Bar */}
      <header className={`sticky top-0 z-30 backdrop-blur-md ${themeStyle.header} border-b px-4 py-3 shadow-sm`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-sans font-medium hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回书架</span>
          </button>

          {/* Title & Progress */}
          <div className="text-center font-sans max-w-xs truncate">
            <h2 className="text-sm font-bold truncate">《{book.title}》</h2>
            <p className="text-[11px] opacity-75">
              {currentChapter ? currentChapter.title : '全书阅览'} ({currentChapterIndex + 1}/{book.chapters.length})
            </p>
          </div>

          {/* Reader Tools */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle: 封面 | 正文 (and 封底 if exists) */}
            <div className="flex items-center bg-stone-900/80 p-0.5 rounded-xl border border-amber-900/40 text-xs font-sans shadow-sm">
              <button
                onClick={() => setViewMode('cover')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  viewMode === 'cover'
                    ? 'bg-amber-800 text-amber-50 font-bold shadow-sm'
                    : 'opacity-70 hover:opacity-100 hover:text-amber-300'
                }`}
                title="切换至封面视图"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>封面</span>
              </button>
              <button
                onClick={() => setViewMode('reader')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  viewMode === 'reader'
                    ? 'bg-amber-800 text-amber-50 font-bold shadow-sm'
                    : 'opacity-70 hover:opacity-100 hover:text-amber-300'
                }`}
                title="切换至正文阅读"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>正文</span>
              </button>
              {book.backCoverImage && book.title !== '诗画人间' && (
                <button
                  onClick={() => setViewMode('backCover')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    viewMode === 'backCover'
                      ? 'bg-amber-800 text-amber-50 font-bold shadow-sm'
                      : 'opacity-70 hover:opacity-100 hover:text-amber-300'
                  }`}
                  title="切换至封底视图"
                >
                  <span>封底</span>
                </button>
              )}
            </div>

            {/* Chapter List Drawer Toggle */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-1.5 rounded-lg border border-current/20 text-xs font-sans flex items-center gap-1 hover:opacity-80"
              title="章节目录"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">目录 ({chapters.length})</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg border border-current/20 text-xs hover:opacity-80 relative"
              title="复制书籍链接"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Chapter Sidebar Overlay */}
      {showSidebar && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className={`w-80 max-w-full h-full p-6 overflow-y-auto ${themeStyle.header} shadow-2xl animate-in slide-in-from-right flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-current/20 mb-4 font-sans">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  章节目录 ({chapters.length})
                </h3>
                <button onClick={() => setShowSidebar(false)} className="text-xs opacity-60 hover:opacity-100">
                  关闭
                </button>
              </div>

              {/* Add / Manage Chapters Button in Sidebar */}
              {onOpenManageChapters && (
                <button
                  onClick={() => {
                    if (!isAdmin) {
                      if (onRequireAdmin) onRequireAdmin('导入与管理书籍章节需要管理员权限，请先登录管理员账号。');
                      return;
                    }
                    setShowSidebar(false);
                    onOpenManageChapters(book.id);
                  }}
                  className="w-full mb-4 py-2 px-3 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-amber-50 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-1.5 shadow transition-all"
                >
                  <PlusCircle className="w-4 h-4 text-amber-300" />
                  导入或管理章节
                </button>
              )}

              <div className="space-y-2 font-sans">
                {chapters.length === 0 ? (
                  <div className="text-center py-8 text-xs opacity-60">
                    暂无章节，请点击上方按钮导入新章节。
                  </div>
                ) : (
                  chapters.map((ch, idx) => (
                    <div
                      key={ch.id}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center justify-between group ${
                        idx === currentChapterIndex && viewMode === 'reader'
                          ? 'bg-amber-800/20 font-bold text-amber-600 border border-amber-600/30'
                          : 'hover:bg-current/10 opacity-80'
                      }`}
                    >
                      <button
                        onClick={() => {
                          setCurrentChapterIndex(idx);
                          setViewMode('reader');
                          setShowSidebar(false);
                        }}
                        className="flex-1 text-left truncate flex items-center gap-2"
                      >
                        <span className="opacity-60 text-[10px] w-4">{idx + 1}.</span>
                        <span className="truncate">{ch.title}</span>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        {idx === currentChapterIndex && viewMode === 'reader' && (
                          <Check className="w-3.5 h-3.5 text-amber-600 mr-1" />
                        )}
                        {onDeleteChapter && chapters.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isAdmin) {
                                if (onRequireAdmin) onRequireAdmin('删除书籍章节需要管理员权限，请先登录管理员账号。');
                                return;
                              }
                              if (window.confirm(`确定要删除章节《${ch.title}》吗？`)) {
                                onDeleteChapter(book.id, ch.id);
                                if (currentChapterIndex >= chapters.length - 1) {
                                  setCurrentChapterIndex(Math.max(0, currentChapterIndex - 1));
                                }
                              }
                            }}
                            className="p-1 opacity-40 group-hover:opacity-100 hover:text-rose-500 rounded transition-opacity"
                            title="删除章节"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-current/20 font-sans text-center">
              <p className="text-[11px] opacity-60">《{book.title}》 · {book.author}</p>
            </div>
          </div>
        </div>
      )}

      {/* Reader Display Bar: Theme & Text Controls */}
      <div className="max-w-3xl mx-auto px-4 pt-6 flex flex-wrap items-center justify-between gap-4 font-sans text-xs opacity-90 border-b border-current/10 pb-4">
        {/* Themes */}
        <div className="flex items-center gap-1.5">
          <span className="opacity-70 mr-1">阅读背景:</span>
          {[
            { id: 'parchment', name: '羊皮纸', bg: 'bg-[#f4efe6]', text: 'text-[#2c221e]' },
            { id: 'dark', name: '夜读', bg: 'bg-stone-950', text: 'text-stone-200' },
            { id: 'green', name: '护眼', bg: 'bg-[#eaf2e8]', text: 'text-[#1b3322]' },
            { id: 'light', name: '纯白', bg: 'bg-white', text: 'text-stone-900' }
          ].map((th) => (
            <button
              key={th.id}
              onClick={() => setReaderTheme(th.id as any)}
              className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-transform ${th.bg} ${th.text} ${
                readerTheme === th.id ? 'ring-2 ring-amber-600 border-amber-600 font-bold scale-105' : 'border-stone-400/30'
              }`}
            >
              {th.name}
            </button>
          ))}
        </div>

        {/* Font Size Adjuster */}
        <div className="flex items-center gap-1">
          <span className="opacity-70 mr-1">字号:</span>
          {(['sm', 'base', 'lg', 'xl'] as const).map((sz) => (
            <button
              key={sz}
              onClick={() => setFontSize(sz)}
              className={`w-7 h-7 rounded-md border text-xs uppercase flex items-center justify-center transition-colors ${
                fontSize === sz ? 'bg-amber-800 text-amber-100 font-bold border-amber-700' : 'border-current/20 hover:bg-current/10'
              }`}
            >
              {sz === 'sm' ? '小' : sz === 'base' ? '中' : sz === 'lg' ? '大' : '特'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Reading Content Area */}
      <main className="max-w-3xl mx-auto px-6 py-10 min-h-[60vh]">
        {viewMode === 'cover' ? (
          <div className="text-center animate-in fade-in zoom-in-95">
            {/* Upload Notification Message */}
            {uploadMsg && (
              <div className="mb-6 max-w-md mx-auto p-3 bg-emerald-950/90 border border-emerald-600 text-emerald-200 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="font-sans font-medium">{uploadMsg}</span>
              </div>
            )}

            {book.coverImage ? (
              <div className="inline-block relative rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-900/40 max-w-md w-full">
                <img
                  src={book.coverImage}
                  alt={`${book.title} 封面`}
                  className="w-full object-cover max-h-[580px]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 flex flex-col justify-between p-6 text-left">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-900/80 text-amber-200 w-fit backdrop-blur-sm border border-amber-700/50">
                    {book.category} · 封面装帧
                  </span>
                  <div>
                    <h1 className="text-3xl font-bold text-stone-100 font-serif drop-shadow-lg">《{book.title}》</h1>
                    <p className="text-sm text-stone-300 font-serif mt-1">作者：{book.author}</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Default Book Cover Canvas when no image is uploaded */
              <div className={`inline-block relative rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-900/40 max-w-md w-full h-[500px] bg-gradient-to-br ${book.coverBg} p-8 text-left flex flex-col justify-between text-stone-100`}>
                <div className="flex justify-between items-start">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-black/40 text-amber-200 backdrop-blur-xs border border-white/10 font-sans">
                    {book.category} · 电子书封面
                  </span>
                  {book.isOriginal && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-700/40 font-sans">
                      原创手稿
                    </span>
                  )}
                </div>

                <div className="my-auto py-6">
                  <h1 className="text-3xl font-bold font-serif leading-tight text-amber-100 mb-2">《{book.title}》</h1>
                  <p className="text-sm opacity-90 font-serif mb-4">作者：{book.author}</p>
                  <p className="text-xs opacity-75 line-clamp-4 font-serif leading-relaxed border-l-2 border-amber-500/50 pl-3">
                    {book.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs opacity-60 font-sans border-t border-white/10 pt-3">
                  <span>字数：{calculateBookWordCount(book)}</span>
                  <span>关注：{book.likes}人</span>
                </div>
              </div>
            )}

            {/* Cover Action & Upload Controls */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 font-sans">
              <button
                type="button"
                onClick={handleCoverUploadButtonClick}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-amber-50 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center gap-2 active:scale-95"
              >
                <Upload className="w-4 h-4 text-amber-300" />
                <span>{book.coverImage ? '更换封面图片' : '上传自定义封面'}</span>
              </button>
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleCoverUpload(e, 'cover')}
                className="hidden"
              />

              <button
                onClick={() => setViewMode('reader')}
                className="px-5 py-2.5 bg-amber-900/40 text-amber-100 border border-amber-700/60 hover:bg-amber-800/60 rounded-xl text-xs font-bold transition-all flex items-center gap-2 active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>进入正文阅读</span>
              </button>
            </div>
          </div>
        ) : viewMode === 'backCover' ? (
          <div className="text-center animate-in fade-in zoom-in-95">
            {uploadMsg && (
              <div className="mb-6 max-w-md mx-auto p-3 bg-emerald-950/90 border border-emerald-600 text-emerald-200 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="font-sans font-medium">{uploadMsg}</span>
              </div>
            )}

            <div className="inline-block relative rounded-2xl overflow-hidden shadow-2xl border-4 border-amber-900/40 max-w-md w-full">
              {book.backCoverImage ? (
                <img
                  src={book.backCoverImage}
                  alt={`${book.title} 封底`}
                  className="w-full object-cover max-h-[580px]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="p-8 bg-stone-900 border border-stone-800 text-left rounded-2xl h-[450px] flex flex-col justify-between text-stone-200">
                  <div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800/50 font-sans">
                      封底简介
                    </span>
                    <p className="text-sm text-stone-200 leading-relaxed font-serif mt-6">{book.description}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 font-sans">
              <button
                onClick={() => setViewMode('cover')}
                className="px-5 py-2.5 bg-stone-800 text-stone-200 border border-stone-700 hover:bg-stone-700 rounded-xl text-xs font-bold transition-all"
              >
                查看封面
              </button>

              <button
                onClick={() => setViewMode('reader')}
                className="px-5 py-2.5 bg-amber-800 text-amber-50 rounded-xl text-xs font-bold shadow hover:bg-amber-700 transition-all"
              >
                进入正文阅读
              </button>
            </div>
          </div>
        ) : (
          <div>
            {currentChapter ? (
              <div>
                {/* Chapter Header Title */}
                <div className="text-center mb-10 pb-6 border-b border-current/15">
                  <span className="text-xs font-sans opacity-70 tracking-widest uppercase">
                    {book.category} · {book.author}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold mt-2 tracking-wide">
                    {currentChapter.title}
                  </h1>
                </div>

                {/* Content Text */}
                <div className={`space-y-6 ${getFontSizeClass()} text-justify font-serif tracking-wide whitespace-pre-line leading-relaxed`}>
                  {currentChapter.content}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-stone-500 font-sans">
                暂无章节内容
              </div>
            )}
          </div>
        )}

        {/* In-Reader Like & Chapter Navigation Toolbar */}
        <div className="mt-16 pt-8 border-t border-current/15 flex flex-col sm:flex-row items-center justify-between gap-6 font-sans">
          {/* Chapter Prev/Next */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              disabled={currentChapterIndex === 0}
              onClick={() => setCurrentChapterIndex(c => Math.max(0, c - 1))}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-current/20 text-xs flex items-center justify-center gap-1 disabled:opacity-30 hover:bg-current/10 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              上一章
            </button>

            <span className="text-xs opacity-75">
              {currentChapterIndex + 1} / {chapters.length || 1}
            </span>

            <button
              disabled={currentChapterIndex >= (chapters.length || 1) - 1}
              onClick={() => setCurrentChapterIndex(c => Math.min(Math.max(0, chapters.length - 1), c + 1))}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-current/20 text-xs flex items-center justify-center gap-1 disabled:opacity-30 hover:bg-current/10 transition-colors"
            >
              下一章
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Reader Like Button */}
          <button
            onClick={() => onLike(book.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold border flex items-center gap-2 shadow-sm transition-transform active:scale-95 ${
              isLiked
                ? 'bg-rose-600 text-white border-rose-600'
                : 'bg-amber-800/20 text-amber-700 border-amber-600/40 hover:bg-amber-800/30'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
            <span>点赞全书 ({book.likes})</span>
          </button>
        </div>

        {/* Reader Comments Section */}
        <section className="mt-16 pt-10 border-t border-current/20 font-sans">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg flex items-center gap-2 font-serif">
              <MessageSquare className="w-5 h-5 text-amber-600" />
              读者留言 ({bookComments.length})
            </h3>
            <span className="text-xs opacity-60">《{book.title}》章节随想</span>
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleCommentSubmit} className={`p-4 rounded-2xl ${themeStyle.card} border mb-8 shadow-sm`}>
            <div className="mb-3">
              <input
                type="text"
                placeholder="您的昵称 (选填，默认: 书友访客)"
                value={newCommentUser}
                onChange={(e) => setNewCommentUser(e.target.value)}
                className={`w-full sm:w-64 px-3 py-1.5 text-xs rounded-lg ${themeStyle.input} focus:outline-none focus:ring-1 focus:ring-amber-600`}
              />
            </div>
            <textarea
              required
              rows={3}
              placeholder="对本章或本书有什么心得体会？欢迎留下一笔..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              className={`w-full p-3 text-xs rounded-xl ${themeStyle.input} focus:outline-none focus:ring-1 focus:ring-amber-600 mb-3`}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-amber-800 hover:bg-amber-700 text-amber-50 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                发表评论
              </button>
            </div>
          </form>

          {/* Comments Feed */}
          <div className="space-y-3">
            {bookComments.length === 0 ? (
              <div className="text-center py-8 opacity-60 text-xs">
                尚无评论，快来留下第一条读后感吧！
              </div>
            ) : (
              bookComments.map((comment) => (
                <div key={comment.id} className={`p-4 rounded-xl ${themeStyle.card} border text-xs`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-800 text-amber-100 flex items-center justify-center font-bold text-[10px]">
                        {comment.userName.slice(0, 1)}
                      </div>
                      <span className="font-bold text-stone-800 dark:text-stone-200">{comment.userName}</span>
                    </div>
                    <span className="opacity-50 text-[10px]">{comment.createdAt}</span>
                  </div>
                  <p className="leading-relaxed opacity-90 pl-8">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
