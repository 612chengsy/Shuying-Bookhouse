import React, { useState } from 'react';
import { X, Upload, BookOpen, Scroll, FileText, CheckCircle } from 'lucide-react';
import { Book, BookCategory } from '../types';
import { formatWordCount } from '../utils/wordCount';

interface ImportBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (book: Omit<Book, 'id' | 'likes' | 'views' | 'createdAt'>) => void;
}

export const ImportBookModal: React.FC<ImportBookModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BookCategory>('小说');
  const [author, setAuthor] = useState('舟渡星港');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('原创, 精选');
  const [coverBg, setCoverBg] = useState('from-emerald-800 to-teal-900');
  const [chapterTitle, setChapterTitle] = useState('第一章：序幕');
  const [chapterContent, setChapterContent] = useState('');
  const [fileName, setFileName] = useState('');

  if (!isOpen) return null;

  // Handle TXT or JSON file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const titleWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    if (!title) setTitle(titleWithoutExt);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setChapterContent(text);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !chapterContent.trim()) return;

    const tags = tagsInput
      .split(/[,，]/)
      .map(t => t.trim())
      .filter(Boolean);

    const wordCountNum = chapterContent.length;
    const wordCountStr = formatWordCount(wordCountNum);

    onImport({
      title: title.trim(),
      category,
      author: author.trim() || '舟渡星港',
      description: description.trim() || '一本精彩的电子书，欢迎在线阅读。',
      tags: tags.length > 0 ? tags : ['手稿', '导入'],
      coverBg,
      wordCount: wordCountStr,
      isOriginal: true,
      chapters: [
        {
          id: `c-1-${Date.now()}`,
          title: chapterTitle.trim() || '第一篇',
          content: chapterContent.trim()
        }
      ]
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setChapterContent('');
    setFileName('');
    onClose();
  };

  const coverOptions = [
    { label: '墨色竹翠', value: 'from-emerald-800 to-teal-900' },
    { label: '玄青深海', value: 'from-slate-800 to-indigo-950' },
    { label: '紫霞流梦', value: 'from-purple-900 to-slate-900' },
    { label: '暖琥秋枫', value: 'from-amber-800 to-orange-950' },
    { label: '胭脂微醺', value: 'from-rose-800 to-amber-900' },
    { label: '古木陈香', value: 'from-amber-900 to-stone-950' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-amber-900/50 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8 animate-in fade-in zoom-in-95 text-stone-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-950 border border-amber-800 text-amber-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-amber-100">导入电子书籍至书架</h3>
              <p className="text-xs text-stone-400">支持上传TXT本地手稿或手动录入全本内容</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">

          {/* TXT File Quick Upload Box */}
          <div className="p-4 rounded-xl bg-stone-950/70 border border-dashed border-stone-700 hover:border-amber-600 transition-colors text-center">
            <input
              type="file"
              accept=".txt,.md,.json"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload-input"
            />
            <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center gap-1.5">
              <FileText className="w-6 h-6 text-amber-500" />
              <span className="font-medium text-amber-200">
                {fileName ? `已加载文件: ${fileName}` : '点击选择本地 TXT / MD 文件自动载入'}
              </span>
              <span className="text-[10px] text-stone-500">（支持包含万字故事或诗词合集）</span>
            </label>
          </div>

          {/* Book Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-300 mb-1 font-medium">书籍名称 *</label>
              <input
                required
                type="text"
                placeholder="例如：《墨读新篇》"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-stone-300 mb-1 font-medium">所属模块 / 分类 *</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('文学诗词')}
                  className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1 font-medium transition-colors ${
                    category === '文学诗词'
                      ? 'bg-amber-950 border-amber-600 text-amber-300'
                      : 'bg-stone-950 border-stone-800 text-stone-400'
                  }`}
                >
                  <Scroll className="w-3.5 h-3.5" />
                  文学诗词
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('小说')}
                  className={`flex-1 py-2 rounded-xl border flex items-center justify-center gap-1 font-medium transition-colors ${
                    category === '小说'
                      ? 'bg-amber-950 border-amber-600 text-amber-300'
                      : 'bg-stone-950 border-stone-800 text-stone-400'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  小说
                </button>
              </div>
            </div>
          </div>

          {/* Author & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-300 mb-1 font-medium">作者署名</label>
              <input
                type="text"
                placeholder="默认：舟渡星港"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label className="block text-stone-300 mb-1 font-medium">标签 (以逗号分隔)</label>
              <input
                type="text"
                placeholder="例如：原创, 古风诗词, 治愈"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-stone-300 mb-1 font-medium">书籍简介</label>
            <textarea
              rows={2}
              placeholder="简要描述本书的核心主题与主要情节..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-600"
            />
          </div>

          {/* Cover Theme Picker */}
          <div>
            <label className="block text-stone-300 mb-1.5 font-medium">封面色彩风格</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {coverOptions.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCoverBg(c.value)}
                  className={`h-9 rounded-lg bg-gradient-to-br ${c.value} border transition-all flex items-center justify-center text-[10px] text-white font-medium ${
                    coverBg === c.value ? 'ring-2 ring-amber-400 border-white scale-105' : 'border-stone-700/50 opacity-80'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chapter Content */}
          <div className="pt-2 border-t border-stone-800">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-amber-200 font-medium">章节正文内容 *</label>
              <span className="text-[10px] text-stone-500">全文字数: {chapterContent.length} 字</span>
            </div>
            <input
              type="text"
              placeholder="章节标题，例如：第一章：重逢"
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              className="w-full px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 mb-2 focus:outline-none focus:border-amber-600"
            />
            <textarea
              required
              rows={6}
              placeholder="在此粘贴或输入书籍章节正文内容..."
              value={chapterContent}
              onChange={(e) => setChapterContent(e.target.value)}
              className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-600 font-serif leading-relaxed"
            />
          </div>

          {/* Submit Action */}
          <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-700 to-amber-800 text-amber-50 font-bold shadow hover:from-amber-600 hover:to-amber-700 flex items-center gap-1.5 transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              立即入库导入
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
