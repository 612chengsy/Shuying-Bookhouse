import React from 'react';
import { BookOpen, Feather, Sparkles, MessageSquare, User, Search, PlusCircle, Sun, Moon, Scroll, ShieldCheck, LogOut, UserCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenImportModal: () => void;
  theme: 'light' | 'dark' | 'parchment';
  setTheme: (theme: 'light' | 'dark' | 'parchment') => void;
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  onAdminLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenImportModal,
  theme,
  setTheme,
  isAdmin,
  onOpenAdminModal,
  onAdminLogout
}) => {
  const navItems = [
    { id: 'home', label: '首页', icon: Sparkles },
    { id: 'poetry', label: '文学诗词', icon: Scroll },
    { id: 'novels', label: '小说', icon: BookOpen },
    { id: 'reviews', label: '书评社区', icon: MessageSquare },
    { id: 'author', label: '作者简介', icon: User },
  ];

  const cycleTheme = () => {
    if (theme === 'light') setTheme('parchment');
    else if (theme === 'parchment') setTheme('dark');
    else setTheme('light');
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon className="w-4 h-4 text-amber-300" />;
    if (theme === 'parchment') return <Scroll className="w-4 h-4 text-amber-700" />;
    return <Sun className="w-4 h-4 text-amber-500" />;
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-stone-900/90 text-stone-100 border-b border-amber-900/30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* Logo Brand */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-700 via-emerald-800 to-teal-900 p-0.5 shadow-inner flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-stone-950/80 rounded-[10px] flex items-center justify-center">
                <Feather className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-amber-100 group-hover:text-amber-300 transition-colors">
                  疏影书屋
                </span>
                <span className="text-[10px] bg-amber-950/80 text-amber-400 border border-amber-800/50 px-1.5 py-0.5 rounded font-mono hidden md:inline">
                  公益原创
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block font-serif">舟渡星港的个人电子书屋</p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-amber-900/40 text-amber-200 border border-amber-700/50 shadow-sm'
                      : 'text-stone-300 hover:text-amber-200 hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative hidden md:block w-40 lg:w-48">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜索书籍或词条..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-stone-950/60 border border-stone-800 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 transition-colors"
              />
            </div>

            {/* Import Book Button */}
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-700 to-emerald-800 hover:from-amber-600 hover:to-emerald-700 text-stone-100 rounded-lg text-xs font-medium shadow transition-all transform active:scale-95 shrink-0"
              title="导入电子书籍"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">导入书籍</span>
            </button>

            {/* Theme switcher */}
            <button
              onClick={cycleTheme}
              className="p-2 rounded-lg bg-stone-800/80 hover:bg-stone-800 border border-stone-700/60 text-stone-300 transition-colors shrink-0"
              title={`当前模式: ${theme === 'light' ? '日间' : theme === 'parchment' ? '羊皮纸' : '夜间'}`}
            >
              {getThemeIcon()}
            </button>

            {/* Admin Login / Status */}
            {isAdmin ? (
              <div className="flex items-center gap-1 bg-amber-950/80 border border-amber-800/60 rounded-lg p-1 text-xs font-sans">
                <span className="px-2 py-0.5 text-amber-300 font-bold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Admin</span>
                </span>
                <button
                  onClick={onAdminLogout}
                  className="p-1 text-amber-400/80 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                  title="退出管理员登录"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-800/60 rounded-lg text-xs font-bold transition-all shadow-sm shrink-0"
                title="管理员登录"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>管理员登录</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Nav Tabs Bar */}
      <div className="lg:hidden flex items-center justify-around bg-stone-950/95 border-t border-stone-800/80 px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-md text-xs transition-colors ${
                isActive ? 'text-amber-400 font-bold bg-amber-950/40' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
