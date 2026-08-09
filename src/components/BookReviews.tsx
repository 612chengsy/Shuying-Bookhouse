import React, { useState } from 'react';
import { MessageSquare, Star, Heart, Send, Filter, ThumbsUp, Sparkles, BookOpen, User } from 'lucide-react';
import { Review, Book } from '../types';

interface BookReviewsProps {
  reviews: Review[];
  books: Book[];
  onAddReview: (review: Omit<Review, 'id' | 'createdAt' | 'likes'>) => void;
  onLikeReview: (reviewId: string) => void;
  onAddReply: (reviewId: string, reply: { userName: string; content: string }) => void;
}

export const BookReviews: React.FC<BookReviewsProps> = ({
  reviews,
  books,
  onAddReview,
  onLikeReview,
  onAddReply
}) => {
  const [selectedBookId, setSelectedBookId] = useState<string>('all');
  const [rating, setRating] = useState(5);
  const [userName, setUserName] = useState('');
  const [targetBookId, setTargetBookId] = useState<string>('');
  const [content, setContent] = useState('');
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: { name: string; text: string } }>({});
  const [showReplyFormId, setShowReplyFormId] = useState<string | null>(null);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const book = books.find(b => b.id === targetBookId);

    onAddReview({
      bookId: targetBookId || undefined,
      bookTitle: book ? book.title : undefined,
      userName: userName.trim() || '书香访客',
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80`,
      rating,
      content: content.trim()
    });

    setContent('');
  };

  const handleSendReply = (reviewId: string) => {
    const replyData = replyInputs[reviewId];
    if (!replyData || !replyData.text.trim()) return;

    onAddReply(reviewId, {
      userName: replyData.name.trim() || '书友',
      content: replyData.text.trim()
    });

    setReplyInputs(prev => ({ ...prev, [reviewId]: { name: '', text: '' } }));
    setShowReplyFormId(null);
  };

  const filteredReviews = selectedBookId === 'all'
    ? reviews
    : selectedBookId === 'general'
    ? reviews.filter(r => !r.bookId)
    : reviews.filter(r => r.bookId === selectedBookId);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950 border border-amber-900/40 rounded-3xl p-6 sm:p-8 mb-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-300 text-xs font-serif mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            以文会友 · 畅所欲言
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-amber-100">
            疏影书评广场
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm mt-2 max-w-2xl font-sans leading-relaxed">
            无论您是对《予梦沉沦》、《诗画人间》等书籍有深刻感悟，还是对本站有宝贵建议，都欢迎在此留下您的真知灼见。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Post a Review Form */}
        <div className="lg:col-span-1">
          <div className="bg-stone-900/90 border border-amber-900/40 rounded-2xl p-6 shadow-lg sticky top-24">
            <h3 className="font-serif text-lg font-bold text-amber-100 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              撰写书评 / 留言
            </h3>

            <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
              {/* Select Target Book */}
              <div>
                <label className="block text-stone-300 mb-1 font-medium">点评书籍</label>
                <select
                  value={targetBookId}
                  onChange={(e) => setTargetBookId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 focus:outline-none focus:border-amber-600"
                >
                  <option value="">书屋全站通用留言</option>
                  {books.map(b => (
                    <option key={b.id} value={b.id}>《{b.title}》 ({b.category})</option>
                  ))}
                </select>
              </div>

              {/* User Name */}
              <div>
                <label className="block text-stone-300 mb-1 font-medium">您的大名 / 昵称</label>
                <input
                  type="text"
                  placeholder="例：墨香客 (默认: 书香访客)"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 focus:outline-none focus:border-amber-600"
                />
              </div>

              {/* Star Rating */}
              <div>
                <label className="block text-stone-300 mb-1.5 font-medium">推荐星级</label>
                <div className="flex items-center gap-1.5 bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-125 transition-transform"
                    >
                      <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400' : 'text-stone-600'}`} />
                    </button>
                  ))}
                  <span className="ml-2 text-stone-400 text-xs font-bold">{rating} 星</span>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-stone-300 mb-1 font-medium">评论内容 *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="写下您的阅读感悟、对人物设定的看法或对作者的建议..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 focus:outline-none focus:border-amber-600 font-serif"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-amber-50 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow transition-all"
              >
                <Send className="w-4 h-4" />
                发布书评交流
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Reviews List & Filters */}
        <div className="lg:col-span-2">
          
          {/* Category Filters */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs text-stone-400 flex items-center gap-1 shrink-0 font-medium mr-1">
              <Filter className="w-3.5 h-3.5" /> 筛选书评:
            </span>
            <button
              onClick={() => setSelectedBookId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 ${
                selectedBookId === 'all'
                  ? 'bg-amber-800 text-amber-100 font-bold border border-amber-600'
                  : 'bg-stone-900 text-stone-400 border border-stone-800 hover:text-stone-200'
              }`}
            >
              全部书评 ({reviews.length})
            </button>
            <button
              onClick={() => setSelectedBookId('general')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 ${
                selectedBookId === 'general'
                  ? 'bg-amber-800 text-amber-100 font-bold border border-amber-600'
                  : 'bg-stone-900 text-stone-400 border border-stone-800 hover:text-stone-200'
              }`}
            >
              全站通用留言
            </button>
            {books.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBookId(b.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 ${
                  selectedBookId === b.id
                    ? 'bg-amber-800 text-amber-100 font-bold border border-amber-600'
                    : 'bg-stone-900 text-stone-400 border border-stone-800 hover:text-stone-200'
                }`}
              >
                《{b.title}》
              </button>
            ))}
          </div>

          {/* Reviews Stream */}
          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-12 text-center text-stone-500 text-xs">
                暂无相关书评，欢迎在左侧表单发表您的第一篇心得！
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <div key={rev.id} className="bg-stone-900/90 border border-stone-800 hover:border-amber-900/50 rounded-2xl p-5 transition-all shadow-md">
                  
                  {/* Top Metadata */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-800 to-emerald-900 p-0.5 shadow-sm">
                        <div className="w-full h-full bg-stone-950 rounded-full flex items-center justify-center font-serif text-amber-300 font-bold text-xs">
                          {rev.userName.slice(0, 1)}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-200 text-sm">{rev.userName}</span>
                          {rev.bookTitle && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-950 text-amber-300 border border-amber-800/50">
                              点评《{rev.bookTitle === '默读' ? '予梦沉沦' : rev.bookTitle}》
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-700'}`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-stone-500">{rev.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Like Button */}
                    <button
                      onClick={() => onLikeReview(rev.id)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-stone-800/80 hover:bg-rose-950/40 border border-stone-700/60 hover:border-rose-900/50 text-stone-400 hover:text-rose-400 text-xs transition-colors"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{rev.likes}</span>
                    </button>
                  </div>

                  {/* Review Text */}
                  <p className="text-stone-300 text-xs sm:text-sm font-serif leading-relaxed pl-12">
                    {rev.content.replaceAll('默读', '予梦沉沦')}
                  </p>

                  {/* Replies List */}
                  {rev.replies && rev.replies.length > 0 && (
                    <div className="ml-12 mt-4 space-y-2 bg-stone-950/60 border border-stone-800/80 rounded-xl p-3 text-xs">
                      {rev.replies.map((reply) => (
                        <div key={reply.id} className="text-stone-300 border-b border-stone-800/50 last:border-0 pb-2 last:pb-0">
                          <span className="font-bold text-amber-400">{reply.userName}：</span>
                          <span>{reply.content}</span>
                          <span className="text-[10px] text-stone-500 ml-2">({reply.createdAt})</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Action Toggle */}
                  <div className="ml-12 mt-3 flex justify-end">
                    <button
                      onClick={() => setShowReplyFormId(showReplyFormId === rev.id ? null : rev.id)}
                      className="text-[11px] text-amber-400/80 hover:text-amber-300 hover:underline flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      回复此条
                    </button>
                  </div>

                  {/* Reply Input Box */}
                  {showReplyFormId === rev.id && (
                    <div className="ml-12 mt-3 p-3 rounded-xl bg-stone-950 border border-amber-900/40 text-xs space-y-2 animate-in fade-in">
                      <input
                        type="text"
                        placeholder="您的昵称"
                        value={replyInputs[rev.id]?.name || ''}
                        onChange={(e) => setReplyInputs(prev => ({
                          ...prev,
                          [rev.id]: { ...(prev[rev.id] || { text: '' }), name: e.target.value }
                        }))}
                        className="w-48 px-2 py-1 bg-stone-900 border border-stone-800 rounded text-stone-200 text-xs"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="写下回复内容..."
                          value={replyInputs[rev.id]?.text || ''}
                          onChange={(e) => setReplyInputs(prev => ({
                            ...prev,
                            [rev.id]: { ...(prev[rev.id] || { name: '' }), text: e.target.value }
                          }))}
                          className="flex-1 px-3 py-1.5 bg-stone-900 border border-stone-800 rounded text-stone-200 text-xs"
                        />
                        <button
                          onClick={() => handleSendReply(rev.id)}
                          className="px-3 py-1 bg-amber-800 hover:bg-amber-700 text-amber-100 rounded text-xs font-bold"
                        >
                          发送
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
