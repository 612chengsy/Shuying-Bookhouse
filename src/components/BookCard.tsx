import React, { useState } from 'react';
import { BookOpen, Heart, Trash2, Eye, Tag, AlertTriangle, Scroll, FileText, Image as ImageIcon } from 'lucide-react';
import { Book } from '../types';
import { calculateBookWordCount } from '../utils/wordCount';

interface BookCardProps {
  book: Book;
  onRead: (book: Book) => void;
  onLike: (bookId: string) => void;
  onDelete: (bookId: string) => void;
  onManageChapters?: (bookId: string) => void;
  isLiked?: boolean;
  isAdmin?: boolean;
  onRequireAdmin?: (promptMsg?: string) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onRead,
  onLike,
  onDelete,
  onManageChapters,
  isLiked = false,
  isAdmin = false,
  onRequireAdmin
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const confirmDelete = () => {
    onDelete(book.id);
    setShowDeleteModal(false);
  };

  const handleDeleteClick = () => {
    if (!isAdmin) {
      if (onRequireAdmin) onRequireAdmin('删除书籍需要管理员权限，请先登录管理员账号。');
      return;
    }
    setShowDeleteModal(true);
  };

  const handleManageChaptersClick = () => {
    if (!isAdmin) {
      if (onRequireAdmin) onRequireAdmin('导入与管理书籍章节需要管理员权限，请先登录管理员账号。');
      return;
    }
    if (onManageChapters) onManageChapters(book.id);
  };

  return (
    <div className="group relative bg-stone-900/90 border border-stone-800 hover:border-amber-700/60 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col h-full">
      {/* Cover Header */}
      <div className={`relative h-44 bg-gradient-to-br ${book.coverBg} p-5 flex flex-col justify-between overflow-hidden`}>
        {/* Optional background image overlay if coverImage exists */}
        {book.coverImage && (
          <div className="absolute inset-0 z-0">
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-black/40 to-black/20" />
          </div>
        )}

        {/* Subtle decorative pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        
        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/40 text-amber-200 border border-amber-400/20 backdrop-blur-sm flex items-center gap-1">
            {book.category === '文学诗词' ? <Scroll className="w-3 h-3 text-amber-400" /> : <BookOpen className="w-3 h-3 text-emerald-400" />}
            {book.category}
          </span>
          <div className="flex items-center gap-1">
            {book.coverImage && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/90 text-emerald-300 border border-emerald-700/50 flex items-center gap-0.5" title="附装帧封面/封底">
                <ImageIcon className="w-3 h-3" />
                图文装帧
              </span>
            )}
            {book.isOriginal && (
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950/80 text-amber-300 border border-amber-800/40">
                原创手稿
              </span>
            )}
          </div>
        </div>

        {/* Title & Author on Cover */}
        <div className="relative z-10">
          <h3 className="font-serif text-2xl font-bold text-stone-100 drop-shadow-md tracking-wider line-clamp-1">
            《{book.title}》
          </h3>
          <p className="text-xs text-stone-300 font-serif mt-1 flex items-center gap-1 opacity-90">
            <span>作者：{book.author}</span>
          </p>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {book.tags.map((tag, idx) => (
              <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-400 border border-stone-700/50">
                #{tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-xs text-stone-300 line-clamp-3 leading-relaxed font-sans mb-4">
            {book.description}
          </p>
        </div>

        {/* Stats & Action Toolbar */}
        <div className="pt-3 border-t border-stone-800/80">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-3">
            <span className="flex items-center gap-1" title="全站浏览量">
              <Eye className="w-3.5 h-3.5 text-stone-500" />
              {book.views} 次阅读
            </span>
            <span className="flex items-center gap-1" title="正文总字数">
              <Tag className="w-3.5 h-3.5 text-stone-500" />
              {calculateBookWordCount(book)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Read Button */}
            <button
              onClick={() => onRead(book)}
              className="flex-1 py-2 px-2.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-stone-100 rounded-xl text-xs font-medium shadow flex items-center justify-center gap-1 transition-all active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              在线阅读
            </button>

            {/* Manage Chapters Button */}
            {onManageChapters && (
              <button
                onClick={handleManageChaptersClick}
                className="py-2 px-2 rounded-xl bg-stone-800/80 border border-stone-700/60 text-stone-300 hover:text-amber-300 hover:bg-amber-950/40 hover:border-amber-800 transition-colors flex items-center gap-1 text-[11px]"
                title="章节管理/导入新章节"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">章节</span>
              </button>
            )}

            {/* Like Button */}
            <button
              onClick={() => onLike(book.id)}
              className={`py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center gap-1 transition-all ${
                isLiked
                  ? 'bg-rose-950/60 border-rose-700/60 text-rose-300'
                  : 'bg-stone-800/80 border-stone-700/60 text-stone-300 hover:text-rose-400 hover:border-rose-900'
              }`}
              title="赞一下"
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
              <span>{book.likes}</span>
            </button>

            {/* Delete Button */}
            <button
              onClick={handleDeleteClick}
              className="p-2 rounded-xl bg-stone-800/80 border border-stone-700/60 text-stone-400 hover:text-rose-400 hover:bg-rose-950/30 hover:border-rose-900/50 transition-colors"
              title="从书架删除"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-amber-900/60 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400 mb-4 mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-center font-serif text-lg font-bold text-stone-100">
              确认从书架下架？
            </h4>
            <p className="text-center text-xs text-stone-400 mt-2 mb-6">
              确定要删除书籍《<span className="text-amber-300">{book.title}</span>》吗？下架后该书籍将无法在此页面阅读。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 rounded-xl text-xs font-medium bg-stone-800 text-stone-300 border border-stone-700 hover:bg-stone-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 rounded-xl text-xs font-medium bg-rose-700 text-stone-100 hover:bg-rose-600 transition-colors shadow"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
