import React from 'react';
import { BookOpen, MessageSquare, Eye, Heart, Sparkles, Feather } from 'lucide-react';
import { SiteStats } from '../types';

interface FooterStatsProps {
  stats: SiteStats;
}

export const FooterStats: React.FC<FooterStatsProps> = ({ stats }) => {
  return (
    <footer className="mt-16 bg-gradient-to-b from-stone-900 via-stone-950 to-black text-stone-300 border-t border-amber-900/30">
      {/* Dynamic Data Statistics Panel */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-2 rounded-full bg-amber-950/60 border border-amber-800/40 text-amber-400 mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-amber-100 tracking-wider">
            疏影书屋 · 本站实时数据统计
          </h3>
          <p className="text-stone-400 text-xs mt-1.5 max-w-lg mx-auto font-sans">
            感谢每一位来访读者的支持与陪伴。公益原创，墨香永存。
          </p>
        </div>

        {/* 3 Core Stats Metrics requested by prompt + total likes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* 1. 本站书籍数 */}
          <div className="relative overflow-hidden group bg-stone-900/80 border border-amber-900/40 rounded-2xl p-6 text-center shadow-lg hover:border-amber-700/60 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/5 rounded-full blur-2xl group-hover:bg-amber-600/10 transition-colors" />
            <div className="w-12 h-12 mx-auto rounded-xl bg-amber-950/80 border border-amber-800/50 flex items-center justify-center text-amber-400 mb-4 shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="text-3xl font-serif font-bold text-amber-100 tracking-tight">
              {stats.booksCount} <span className="text-xs font-sans text-stone-400 font-normal">本</span>
            </div>
            <div className="text-sm font-medium text-amber-300/90 mt-1">本站书籍数</div>
            <p className="text-[11px] text-stone-500 mt-2 font-serif">包含原创小说与文学诗词手稿</p>
          </div>

          {/* 2. 评论数 */}
          <div className="relative overflow-hidden group bg-stone-900/80 border border-amber-900/40 rounded-2xl p-6 text-center shadow-lg hover:border-amber-700/60 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 rounded-full blur-2xl group-hover:bg-emerald-600/10 transition-colors" />
            <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="text-3xl font-serif font-bold text-emerald-100 tracking-tight">
              {stats.commentsCount} <span className="text-xs font-sans text-stone-400 font-normal">条</span>
            </div>
            <div className="text-sm font-medium text-emerald-300/90 mt-1">读者评论数</div>
            <p className="text-[11px] text-stone-500 mt-2 font-serif">记录读者们的宝贵意见与真挚交流</p>
          </div>

          {/* 3. 浏览量 */}
          <div className="relative overflow-hidden group bg-stone-900/80 border border-amber-900/40 rounded-2xl p-6 text-center shadow-lg hover:border-amber-700/60 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-600/5 rounded-full blur-2xl group-hover:bg-teal-600/10 transition-colors" />
            <div className="w-12 h-12 mx-auto rounded-xl bg-teal-950/80 border border-teal-800/50 flex items-center justify-center text-teal-400 mb-4 shadow-inner">
              <Eye className="w-6 h-6" />
            </div>
            <div className="text-3xl font-serif font-bold text-teal-100 tracking-tight">
              {stats.views.toLocaleString()} <span className="text-xs font-sans text-stone-400 font-normal">次</span>
            </div>
            <div className="text-sm font-medium text-teal-300/90 mt-1">全站浏览量</div>
            <p className="text-[11px] text-stone-500 mt-2 font-serif">累计在线翻阅与访客足迹</p>
          </div>
        </div>

        {/* Sub-footer Message */}
        <div className="mt-12 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <div className="flex items-center gap-2">
            <Feather className="w-4 h-4 text-amber-500/70" />
            <span className="font-serif">疏影书屋 · 舟渡星港 原创公益作品</span>
          </div>
          <div className="flex items-center gap-4">
            <span>支持正版原创</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              以文会友 <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
