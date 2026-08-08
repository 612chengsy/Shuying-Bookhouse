import React, { useState } from 'react';
import { X, Lock, User, ShieldCheck, AlertCircle, KeyRound } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  promptMsg?: string;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  promptMsg
}) => {
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setErrorMsg('请输入管理员账号');
      return;
    }

    if (!cleanPassword) {
      setErrorMsg('请输入管理员密码');
      return;
    }

    // Credentials check: Username = Admin (case-insensitive), Password = 612612
    if (cleanUsername.toLowerCase() === 'admin' && cleanPassword === '612612') {
      onLoginSuccess();
      setPassword('');
      setErrorMsg('');
      onClose();
    } else {
      setErrorMsg('管理员账号或密码错误！');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-amber-900/60 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 text-stone-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-100 p-1.5 rounded-xl hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-800 to-amber-900 border border-amber-700/60 flex items-center justify-center text-amber-300 mx-auto mb-3 shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-amber-100">
            管理员登录
          </h3>
          <p className="text-xs text-stone-400 mt-1 font-sans">
            输入凭据以解锁图书与音乐管理等高级权限
          </p>
        </div>

        {/* Action Prompt Banner if redirected from protected action */}
        {promptMsg && (
          <div className="mb-5 p-3 rounded-xl bg-amber-950/60 border border-amber-800/50 text-amber-200 text-xs flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{promptMsg}</span>
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              管理员账号
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              密码
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 text-sm focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 font-sans"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-medium bg-stone-800 text-stone-300 border border-stone-700 hover:bg-stone-700 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-amber-50 shadow-md transition-all active:scale-95"
            >
              立即登录
            </button>
          </div>
        </form>

        <div className="mt-5 text-center text-[11px] text-stone-500 font-mono">
          提示: 管理员账号为 <span className="text-amber-400">Admin</span>
        </div>
      </div>
    </div>
  );
};
