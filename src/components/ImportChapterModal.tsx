import React, { useState } from 'react';
import { BookOpen, Plus, Trash2, FileText, Upload, Check, AlertCircle, X, Sparkles } from 'lucide-react';
import { Book, Chapter } from '../types';

interface ImportChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  selectedBookId?: string;
  onAddChapter: (bookId: string, title: string, content: string) => void;
  onDeleteChapter: (bookId: string, chapterId: string) => void;
}

export const ImportChapterModal: React.FC<ImportChapterModalProps> = ({
  isOpen,
  onClose,
  books,
  selectedBookId: initialBookId,
  onAddChapter,
  onDeleteChapter
}) => {
  const [targetBookId, setTargetBookId] = useState<string>(initialBookId || books[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'add' | 'list'>('add');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [deletingChapterId, setDeletingChapterId] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentBook = books.find(b => b.id === targetBookId) || books[0];

  // Handle File Upload (.txt or .md)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setChapterContent(text);
        if (!chapterTitle) {
          // Auto fill title from filename
          const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
          setChapterTitle(nameWithoutExt);
        }
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  // Submit Single Chapter
  const handleSubmitChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBook) {
      setErrorMsg('请选择目标书籍');
      return;
    }
    if (!chapterTitle.trim()) {
      setErrorMsg('请输入章节标题');
      return;
    }
    if (!chapterContent.trim()) {
      setErrorMsg('请输入章节正文内容');
      return;
    }

    onAddChapter(currentBook.id, chapterTitle.trim(), chapterContent.trim());

    setSuccessMsg(`已成功为《${currentBook.title}》导入新章节：“${chapterTitle.trim()}”！`);
    setChapterTitle('');
    setChapterContent('');
    setErrorMsg('');

    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  const handleDeleteConfirm = (chapterId: string) => {
    if (!currentBook) return;
    onDeleteChapter(currentBook.id, chapterId);
    setDeletingChapterId(null);
    setSuccessMsg('已成功删除该章节');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-amber-900/60 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8 animate-in fade-in zoom-in-95">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-100 p-1 rounded-lg hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-xl bg-amber-950 border border-amber-800 text-amber-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-100">
              已上架书籍 - 章节导入与删除管理
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              为书架上的已有作品自由新增/导入新章节或下架弃用章节
            </p>
          </div>
        </div>

        {/* Success / Error Alerts */}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded-xl text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-950/80 border border-rose-800 text-rose-200 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Select Target Book */}
        <div className="mb-5 bg-stone-950/80 p-3.5 rounded-xl border border-stone-800">
          <label className="block text-xs font-medium text-amber-300 mb-1.5">
            选择要修改的目标书籍：
          </label>
          <select
            value={targetBookId}
            onChange={(e) => {
              setTargetBookId(e.target.value);
              setSuccessMsg('');
              setErrorMsg('');
            }}
            className="w-full px-3 py-2 bg-stone-900 border border-stone-700 text-stone-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-serif"
          >
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                《{b.title}》[{b.category}] - 共 {b.chapters.length} 章
              </option>
            ))}
          </select>
        </div>

        {/* Action Tabs */}
        <div className="flex border-b border-stone-800 mb-5">
          <button
            onClick={() => setActiveTab('add')}
            className={`pb-2.5 px-4 text-xs font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'add'
                ? 'border-amber-500 text-amber-300 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            导入/添加新章节
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-2.5 px-4 text-xs font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'border-amber-500 text-amber-300 font-bold'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            已上线章节列表 ({currentBook ? currentBook.chapters.length : 0})
          </button>
        </div>

        {/* TAB 1: ADD / IMPORT CHAPTER */}
        {activeTab === 'add' && (
          <form onSubmit={handleSubmitChapter} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-stone-300 font-medium">章节标题：</label>
                <span className="text-[11px] text-stone-500">例如：第四章：微光破晓</span>
              </div>
              <input
                type="text"
                required
                placeholder="请输入章节标题，如：第十章：归途"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 text-stone-100 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-serif"
              />
            </div>

            {/* Local File Import */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-stone-950/60 border border-dashed border-stone-700/80">
              <div className="flex items-center gap-2 text-xs text-stone-300">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>快速导入本地 txt / md 章节文本文件</span>
              </div>
              <label className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 rounded-lg text-xs cursor-pointer transition-colors">
                选择文件
                <input
                  type="file"
                  accept=".txt,.md,.text"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Chapter Content */}
            <div>
              <label className="block text-xs text-stone-300 font-medium mb-1">章节正文内容：</label>
              <textarea
                required
                rows={8}
                placeholder="在此粘贴或输入新章节正文内容..."
                value={chapterContent}
                onChange={(e) => setChapterContent(e.target.value)}
                className="w-full p-3 bg-stone-950 border border-stone-800 text-stone-100 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-serif leading-relaxed"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-medium transition-colors"
              >
                关闭
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-amber-50 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                确认保存并发布章节
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: CHAPTER LIST & DELETE */}
        {activeTab === 'list' && (
          <div className="space-y-3">
            {(!currentBook || currentBook.chapters.length === 0) ? (
              <div className="text-center py-10 text-stone-500 text-xs">
                该书籍暂无任何章节，请点击“导入/添加新章节”按钮增加章节。
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {currentBook.chapters.map((ch, idx) => (
                  <div
                    key={ch.id}
                    className="p-3 bg-stone-950/80 border border-stone-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3 truncate pr-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-950 text-amber-400 flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <p className="font-serif font-bold text-stone-200 truncate">{ch.title}</p>
                        <p className="text-[10px] text-stone-500 truncate">
                          字数约 {ch.content.length} 字
                        </p>
                      </div>
                    </div>

                    {deletingChapterId === ch.id ? (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] text-rose-400">确认删除？</span>
                        <button
                          onClick={() => handleDeleteConfirm(ch.id)}
                          className="px-2 py-1 bg-rose-800 text-white rounded text-[10px] hover:bg-rose-700"
                        >
                          确定
                        </button>
                        <button
                          onClick={() => setDeletingChapterId(null)}
                          className="px-2 py-1 bg-stone-800 text-stone-300 rounded text-[10px] hover:bg-stone-700"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingChapterId(ch.id)}
                        className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors shrink-0"
                        title="删除此章节"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs font-medium"
              >
                完成
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
