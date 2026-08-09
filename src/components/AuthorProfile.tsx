import React, { useState, useRef, useEffect } from 'react';
import { User, Music, Feather, Briefcase, Heart, MessageSquare, Send, Volume2, VolumeX, Play, Pause, RefreshCw, Upload, Trash2, SkipBack, SkipForward, Disc, Plus, Pencil, X, Sparkles } from 'lucide-react';
import { GuestbookMessage, MusicTrack, WritingStatusLog } from '../types';
import { 
  fetchStatusLogs, createStatusLog, updateStatusLog, deleteStatusLog, updateStatusQuote,
  fetchMusicTracks, createMusicTrack, deleteMusicTrack, uploadFile
} from '../api';

interface AuthorProfileProps {
  guestbook: GuestbookMessage[];
  onAddGuestbook: (msg: { userName: string; content: string }) => void;
  onLikeGuestbook: (msgId: string) => void;
  isAdmin?: boolean;
  onRequireAdmin?: (promptMsg?: string) => void;
}

const DEFAULT_TRACKS: MusicTrack[] = [
  { id: 'default_1', title: '《微光》—— 小说《予梦沉沦》衍生吉他弹唱 Demo', duration: '03:45', durationSec: 225, mood: '温暖沉静' },
  { id: 'default_2', title: '《月下疏影》—— 诗歌朗诵与古风轻音乐', duration: '02:30', durationSec: 150, mood: '古典意境' },
  { id: 'default_3', title: '《社畜的周末清晨》—— 随性弹唱碎碎念', duration: '04:12', durationSec: 252, mood: '轻松治愈' }
];

const DEFAULT_LOGS: WritingStatusLog[] = [
  {
    id: 'log-1',
    tag: '📖 近期更新动态',
    tagColor: 'amber',
    date: '2026-08-05',
    content: '《予梦沉沦》后续大纲已完成复审，周末打算抽空整理《诗画人间》新增的几首夏末抒情诗。'
  },
  {
    id: 'log-2',
    tag: '☕ 打工人日常',
    tagColor: 'emerald',
    date: '2026-08-01',
    content: '今天下班后喝到了极为清甜的冻顶乌龙，灵感爆发写下了《一个小段子》里的摸鱼心得！'
  },
  {
    id: 'log-3',
    tag: '💌 创作寄语',
    tagColor: 'rose',
    date: '致所有读者',
    content: '文字是穿透冷漠都市的微光。无论生活多忙碌，希望疏影书屋能为您带来一丝慰藉。'
  }
];

export const AuthorProfile: React.FC<AuthorProfileProps> = ({
  guestbook,
  onAddGuestbook,
  onLikeGuestbook,
  isAdmin = false,
  onRequireAdmin
}) => {
  const [tracks, setTracks] = useState<MusicTrack[]>(DEFAULT_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  
  const [userName, setUserName] = useState('');
  const [messageContent, setMessageContent] = useState('');

  // Status logs state with persistence
  const [statusLogs, setStatusLogs] = useState<WritingStatusLog[]>(() => {
    try {
      const saved = localStorage.getItem('shuying_writing_logs');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_LOGS;
  });

  const [statusQuote, setStatusQuote] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('shuying_writing_quote');
      if (saved) return saved;
    } catch (e) {
      console.error(e);
    }
    return '“生活万般皆苦，唯有文字与爱永恒。”';
  });

  useEffect(() => {
    try {
      localStorage.setItem('shuying_writing_logs', JSON.stringify(statusLogs));
    } catch (e) {
      console.error(e);
    }
  }, [statusLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('shuying_writing_quote', statusQuote);
    } catch (e) {
      console.error(e);
    }
  }, [statusQuote]);

  // Modal & form states
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<WritingStatusLog | null>(null);

  const [logTag, setLogTag] = useState('📖 近期更新动态');
  const [logTagColor, setLogTagColor] = useState('amber');
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [logContent, setLogContent] = useState('');

  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [tempQuote, setTempQuote] = useState('');

  const getTagColorClass = (color?: string) => {
    switch (color) {
      case 'emerald': return 'text-emerald-400';
      case 'rose': return 'text-rose-400';
      case 'sky': return 'text-sky-400';
      case 'purple': return 'text-purple-400';
      case 'amber':
      default: return 'text-amber-400';
    }
  };

  const handleOpenAddLog = () => {
    if (!isAdmin) {
      if (onRequireAdmin) {
        onRequireAdmin('更新社畜写作状态日志需要管理员权限，请先登录管理员账号。');
      }
      return;
    }
    setEditingLog(null);
    setLogTag('📖 近期更新动态');
    setLogTagColor('amber');
    setLogDate(new Date().toISOString().split('T')[0]);
    setLogContent('');
    setIsLogModalOpen(true);
  };

  const handleOpenEditLog = (log: WritingStatusLog) => {
    if (!isAdmin) {
      if (onRequireAdmin) {
        onRequireAdmin('编辑日志需要管理员权限，请先登录管理员账号。');
      }
      return;
    }
    setEditingLog(log);
    setLogTag(log.tag);
    setLogTagColor(log.tagColor || 'amber');
    setLogDate(log.date);
    setLogContent(log.content);
    setIsLogModalOpen(true);
  };

  // Load status logs, quote, and music tracks from backend API
  useEffect(() => {
    fetchStatusLogs().then(data => {
      if (data && data.logs && data.logs.length > 0) {
        setStatusLogs(data.logs);
      }
      if (data && data.quote) {
        setStatusQuote(data.quote);
      }
    }).catch(err => console.error('Error fetching logs:', err));

    fetchMusicTracks().then(data => {
      if (data && data.length > 0) {
        setTracks(data);
      }
    }).catch(err => console.error('Error fetching music:', err));
  }, []);

  const handleDeleteLog = (id: string) => {
    if (!isAdmin) {
      if (onRequireAdmin) {
        onRequireAdmin('删除日志需要管理员权限，请先登录管理员账号。');
      }
      return;
    }
    if (confirm('确定要删除这条写作状态日志吗？')) {
      setStatusLogs(prev => prev.filter(item => item.id !== id));
      deleteStatusLog(id).catch(err => console.error(err));
    }
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logContent.trim()) return;

    if (editingLog) {
      const updatedLogData = {
        tag: logTag.trim() || '📖 近期更新动态',
        tagColor: logTagColor,
        date: logDate.trim() || new Date().toISOString().split('T')[0],
        content: logContent.trim()
      };
      setStatusLogs(prev => prev.map(item => item.id === editingLog.id ? { ...item, ...updatedLogData } : item));
      updateStatusLog(editingLog.id, updatedLogData).catch(err => console.error(err));
    } else {
      const newLog: WritingStatusLog = {
        id: 'log-' + Date.now(),
        tag: logTag.trim() || '📖 近期更新动态',
        tagColor: logTagColor,
        date: logDate.trim() || new Date().toISOString().split('T')[0],
        content: logContent.trim()
      };
      setStatusLogs(prev => [newLog, ...prev]);
      createStatusLog(newLog).catch(err => console.error(err));
    }

    setIsLogModalOpen(false);
  };


  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImportButtonClick = () => {
    if (!isAdmin) {
      if (onRequireAdmin) {
        onRequireAdmin('导入音乐需要管理员权限，请先登录管理员账号。');
      }
      return;
    }
    musicFileInputRef.current?.click();
  };

  const currentTrack = tracks[currentTrackIndex] || null;

  // Format time in seconds to mm:ss
  const formatTime = (sec: number) => {
    if (isNaN(sec) || sec < 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Play / Pause audio handling
  useEffect(() => {
    if (!audioRef.current) return;

    if (currentTrack?.url) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.warn('Audio playback error:', err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex, tracks]);

  // Web Audio Synth Fallback for Default Tracks without explicit Audio URL
  useEffect(() => {
    if (!isPlaying) return;
    if (currentTrack && currentTrack.url) return; // Real HTML5 audio handles this

    let audioCtx: AudioContext | null = null;
    let timer: number | null = null;

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
        const notes = [261.63, 329.63, 392.00, 493.88, 523.25, 659.25]; // C4, E4, G4, B4, C5, E5
        let noteIdx = 0;
        let elapsed = 0;
        
        const totalDur = currentTrack?.durationSec || 180;
        
        timer = window.setInterval(() => {
          if (!audioCtx || audioCtx.state === 'closed') return;
          
          elapsed += 0.5;
          setCurrentTime(prev => (prev + 0.5 >= totalDur ? 0 : prev + 0.5));

          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.value = notes[noteIdx % notes.length];
          gain.gain.setValueAtTime(0.06 * (isMuted ? 0 : volume), audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.8);
          
          noteIdx++;

          if (elapsed >= totalDur) {
            elapsed = 0;
            // Auto advance
            handleNextTrack();
          }
        }, 500);
      }
    } catch (e) {
      console.warn('Web audio context warning:', e);
    }

    return () => {
      if (timer) clearInterval(timer);
      if (audioCtx) audioCtx.close().catch(() => {});
    };
  }, [isPlaying, currentTrackIndex, currentTrack, volume, isMuted]);

  // Sync volume with <audio>
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle time update from real audio element
  const handleTimeUpdate = () => {
    if (audioRef.current && currentTrack?.url) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && currentTrack?.url) {
      setDuration(audioRef.current.duration);
    }
  };

  // Track ended -> auto play next
  const handleTrackEnded = () => {
    handleNextTrack();
  };

  const handleNextTrack = () => {
    if (tracks.length === 0) return;
    const nextIdx = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextIdx);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    if (tracks.length === 0) return;
    const prevIdx = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    setCurrentTrackIndex(prevIdx);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  // Seek progress
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current && currentTrack?.url) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Import local music & upload to server
  const handleImportMusic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) {
      if (onRequireAdmin) onRequireAdmin('导入音乐需要管理员权限，请先登录管理员账号。');
      e.target.value = '';
      return;
    }

    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files) as File[];
    e.target.value = '';

    for (const file of fileList) {
      try {
        const audioUrl = await uploadFile(file);
        const nameParts = file.name.split('.');
        const titleWithoutExt = nameParts.length > 1 ? nameParts.slice(0, -1).join('.') : file.name;

        const newTrack: MusicTrack = {
          id: 'track_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          title: titleWithoutExt || '本地弹唱/音频',
          artist: '管理员导入',
          duration: '03:30',
          durationSec: 210,
          mood: '音乐短篇',
          url: audioUrl,
          isLocal: true,
          addedAt: new Date().toLocaleDateString()
        };

        // Probe real duration if possible
        const tempAudio = new Audio(audioUrl);
        tempAudio.onloadedmetadata = () => {
          const sec = Math.floor(tempAudio.duration);
          if (!isNaN(sec) && sec > 0) {
            const mins = Math.floor(sec / 60);
            const remSec = sec % 60;
            const durStr = `${mins.toString().padStart(2, '0')}:${remSec.toString().padStart(2, '0')}`;
            newTrack.duration = durStr;
            newTrack.durationSec = sec;
            setTracks(prev => prev.map(t => t.id === newTrack.id ? { ...t, duration: durStr, durationSec: sec } : t));
          }
        };

        setTracks(prev => [newTrack, ...prev]);
        createMusicTrack(newTrack).catch(err => console.error(err));
      } catch (err) {
        console.error('Failed to upload music track:', err);
      }
    }

    setCurrentTrackIndex(0);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  // Delete music track
  const handleDeleteTrack = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAdmin) {
      if (onRequireAdmin) onRequireAdmin('删除音乐需要管理员权限，请先登录管理员账号。');
      return;
    }

    deleteMusicTrack(id).catch(err => console.error(err));
    
    setTracks(prev => {
      const indexToDelete = prev.findIndex(t => t.id === id);
      if (indexToDelete === -1) return prev;

      const updated = prev.filter(t => t.id !== id);

      if (updated.length === 0) {
        setIsPlaying(false);
        setCurrentTrackIndex(0);
        setCurrentTime(0);
      } else if (indexToDelete === currentTrackIndex) {
        setIsPlaying(false);
        const nextIdx = Math.min(indexToDelete, updated.length - 1);
        setCurrentTrackIndex(nextIdx);
        setCurrentTime(0);
      } else if (indexToDelete < currentTrackIndex) {
        setCurrentTrackIndex(currentTrackIndex - 1);
      }

      return updated;
    });
  };

  // Restore Default Tracks
  const handleRestoreDefaults = () => {
    setTracks(DEFAULT_TRACKS);
    setCurrentTrackIndex(0);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handlePostMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) return;

    onAddGuestbook({
      userName: userName.trim() || '热心书友',
      content: messageContent.trim()
    });

    setMessageContent('');
  };

  const currentDurationSec = currentTrack?.url ? (duration || 0) : (currentTrack?.durationSec || 180);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Real HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack?.url || undefined}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleTrackEnded}
      />

      {/* Author Card Banner */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-amber-950 border border-amber-900/50 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden mb-10">
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
          
          {/* Author Avatar Seal */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-amber-700 via-emerald-800 to-teal-900 p-1 shadow-2xl">
              <div className="w-full h-full rounded-full bg-stone-950 flex flex-col items-center justify-center p-2 text-amber-200 border border-amber-800/40">
                <Feather className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 mb-1" />
                <span className="font-serif font-bold text-xs tracking-widest text-amber-100">舟渡星港</span>
              </div>
            </div>
            <div className="absolute -bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px] font-bold shadow">
              更新中...
            </div>
          </div>

          {/* Author Details */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs bg-amber-950/90 text-amber-300 border border-amber-800/60 font-serif">
                疏影书屋创办人
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-stone-800 text-stone-300 border border-stone-700 flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-emerald-400" /> 社畜打工人
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-stone-800 text-stone-300 border border-stone-700 flex items-center gap-1">
                <Music className="w-3 h-3 text-rose-400" /> 随心弹唱
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-amber-100 tracking-wider">
              舟渡星港
            </h1>

            <p className="font-serif text-amber-200/90 text-sm sm:text-base mt-3 bg-amber-950/40 p-3 rounded-xl border border-amber-800/30 leading-relaxed italic">
              “一个业余爱好看小说、写小说和唱歌的社畜，不定时更新中。”
            </p>

            <p className="text-xs text-stone-400 mt-4 leading-relaxed font-sans max-w-2xl">
              欢迎来到我的私家小书屋！这里是我在忙碌的本职工作之外，用文字和音符为自己与朋友们搭建的一处平静港湾。所有的作品均为个人原创公益分享，感谢大家的陪伴与温暖支持。
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Music Corner & Writing Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        
        {/* Module A: Author's Music Corner (舟渡的音乐角落) */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h3 className="font-serif text-lg font-bold text-amber-100 flex items-center gap-2">
                <Music className="w-5 h-5 text-rose-400" />
                舟渡的音乐角落
              </h3>
              
              {/* Import Music Button */}
              <button
                type="button"
                onClick={handleImportButtonClick}
                className="cursor-pointer px-3 py-1.5 bg-gradient-to-r from-amber-800 to-rose-800 hover:from-amber-700 hover:to-rose-700 text-amber-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow active:scale-95"
              >
                <Upload className="w-3.5 h-3.5 text-amber-300" />
                <span>导入本地音乐</span>
              </button>
              <input
                ref={musicFileInputRef}
                type="file"
                accept="audio/*"
                multiple
                onChange={handleImportMusic}
                className="hidden"
              />
            </div>

            <p className="text-xs text-stone-400 mb-4 leading-relaxed font-sans">
              除了敲字写故事，下班后的深夜我也常拿起吉他随手弹唱。支持导入本地音乐播放与自由管理：
            </p>

            {/* Audio Player Box */}
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-4 mb-4 shadow-inner">
              {currentTrack ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="truncate pr-2 flex-1">
                      <div className="text-xs font-bold text-amber-200 truncate flex items-center gap-1.5">
                        <Disc className={`w-3.5 h-3.5 text-rose-400 shrink-0 ${isPlaying ? 'animate-spin' : ''}`} />
                        <span>{currentTrack.title}</span>
                      </div>
                      <div className="text-[10px] text-stone-500 mt-1 flex items-center gap-2">
                        <span>{currentTrack.mood || '个人演练'}</span>
                        {currentTrack.isLocal && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-400 border border-amber-800/40 text-[9px]">
                            本地导入
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Mute toggle */}
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-1.5 text-stone-400 hover:text-amber-300 transition-colors"
                      title={isMuted ? '取消静音' : '静音'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Player controls & Progress bar */}
                  <div className="space-y-2 mt-3">
                    {/* Progress Slider */}
                    <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                      <span>{formatTime(currentTime)}</span>
                      <input
                        type="range"
                        min={0}
                        max={currentDurationSec || 100}
                        step={0.5}
                        value={currentTime}
                        onChange={handleSeek}
                        className="flex-1 h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                      <span>{formatTime(currentDurationSec)}</span>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={handlePrevTrack}
                          className="p-1.5 text-stone-400 hover:text-amber-200 transition-colors rounded-lg hover:bg-stone-900"
                          title="上一首"
                        >
                          <SkipBack className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-700 to-rose-700 hover:scale-105 text-white flex items-center justify-center shadow transition-all shrink-0"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>

                        <button
                          onClick={handleNextTrack}
                          className="p-1.5 text-stone-400 hover:text-amber-200 transition-colors rounded-lg hover:bg-stone-900"
                          title="下一首"
                        >
                          <SkipForward className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Waveform graphic */}
                      <div className="flex items-center gap-1 h-5 w-28">
                        {[40, 65, 30, 85, 95, 45, 70, 60, 90, 35, 80, 50, 75, 40].map((h, i) => (
                          <div
                            key={i}
                            style={{ height: `${isPlaying ? Math.max(20, (h + (i % 3) * 15) % 100) : 25}%` }}
                            className={`flex-1 rounded-full transition-all duration-300 ${
                              isPlaying ? 'bg-gradient-to-t from-amber-600 to-rose-500' : 'bg-stone-800'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-xs text-stone-500">
                  当前无播放曲目，请点击上方“导入本地音乐”或“恢复默认”。
                </div>
              )}
            </div>

            {/* Playlist Header & Controls */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-300 flex items-center gap-1">
                音乐播放列表 ({tracks.length})
              </span>
              {tracks.length < DEFAULT_TRACKS.length && (
                <button
                  onClick={handleRestoreDefaults}
                  className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> 恢复默认示范曲目
                </button>
              )}
            </div>

            {/* Track List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {tracks.length === 0 ? (
                <div className="text-center py-4 text-xs text-stone-500 bg-stone-950/40 rounded-xl">
                  播放列表为空，支持导入本地 MP3/WAV/AAC 音乐文件。
                </div>
              ) : (
                tracks.map((tr, idx) => (
                  <div
                    key={tr.id}
                    onClick={() => {
                      setCurrentTrackIndex(idx);
                      setCurrentTime(0);
                      setIsPlaying(true);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all group cursor-pointer ${
                      idx === currentTrackIndex
                        ? 'bg-amber-950/70 text-amber-200 border border-amber-800/50 shadow'
                        : 'hover:bg-stone-800/60 text-stone-400 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="text-[10px] w-4 text-stone-500 font-mono">{idx + 1}</span>
                      <span className="truncate">{tr.title}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] opacity-60 font-mono">{tr.duration}</span>
                      <button
                        onClick={(e) => handleDeleteTrack(tr.id, e)}
                        className="p-1 text-stone-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-stone-800"
                        title="删除该音乐"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Module B: Author's Writing Log & Status */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-amber-100 flex items-center gap-2">
                <Feather className="w-5 h-5 text-emerald-400" />
                社畜写作状态日志
              </h3>
              <button
                onClick={handleOpenAddLog}
                className="px-2.5 py-1 bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700/50 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow hover:scale-105 active:scale-95 cursor-pointer"
                title={isAdmin ? "发布新日志" : "需要管理员权限"}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>发布动态</span>
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans max-h-[380px] overflow-y-auto pr-1">
              {statusLogs.length === 0 ? (
                <div className="p-4 text-center text-stone-500 bg-stone-950/40 rounded-xl border border-stone-800">
                  暂无写作状态日志，点击上方的“发布动态”按钮添加吧～
                </div>
              ) : (
                statusLogs.map((log) => (
                  <div key={log.id} className="group relative p-3 bg-stone-950/80 rounded-xl border border-stone-800 hover:border-amber-900/40 transition-all">
                    <div className="flex items-center justify-between text-stone-400 text-[10px] mb-1">
                      <span className={`font-bold ${getTagColorClass(log.tagColor)}`}>
                        {log.tag}
                      </span>
                      <div className="flex items-center gap-2">
                        <span>{log.date}</span>
                        {isAdmin && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-1">
                            <button
                              onClick={() => handleOpenEditLog(log)}
                              className="p-1 text-stone-400 hover:text-amber-300 rounded hover:bg-stone-800 transition-colors"
                              title="编辑日志"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteLog(log.id)}
                              className="p-1 text-stone-400 hover:text-rose-400 rounded hover:bg-stone-800 transition-colors"
                              title="删除日志"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-stone-300 whitespace-pre-wrap leading-relaxed">
                      {log.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-stone-800 text-[11px] text-stone-500 font-serif">
            {isEditingQuote ? (
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  value={tempQuote}
                  onChange={(e) => setTempQuote(e.target.value)}
                  className="flex-1 px-2 py-1 bg-stone-950 border border-amber-800 rounded text-amber-200 text-xs font-serif focus:outline-none"
                  placeholder="输入作者寄语..."
                />
                <button
                  onClick={() => {
                    if (tempQuote.trim()) setStatusQuote(tempQuote.trim());
                    setIsEditingQuote(false);
                  }}
                  className="px-2.5 py-1 bg-amber-800 text-amber-100 rounded text-xs font-sans font-bold hover:bg-amber-700"
                >
                  保存
                </button>
                <button
                  onClick={() => setIsEditingQuote(false)}
                  className="px-2.5 py-1 bg-stone-800 text-stone-300 rounded text-xs font-sans hover:bg-stone-700"
                >
                  取消
                </button>
              </div>
            ) : (
              <div className="w-full text-center group relative flex items-center justify-center gap-1">
                <span>{statusQuote}</span>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setTempQuote(statusQuote);
                      setIsEditingQuote(true);
                    }}
                    className="p-0.5 text-stone-500 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="修改作者寄语"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Module C: Guestbook / Message Wall for Author */}
      <div className="bg-stone-900/90 border border-amber-900/40 rounded-2xl p-6 sm:p-8 shadow-xl">
        <h3 className="font-serif text-xl font-bold text-amber-100 mb-2 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-500" />
          给舟渡星港留言
        </h3>
        <p className="text-xs text-stone-400 mb-6 font-sans">
          有什么想对作者说的、催更建议或听歌感想？在此留言，作者不定时亲笔回复哦～
        </p>

        {/* Post Message Form */}
        <form onSubmit={handlePostMessage} className="mb-8 space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="您的昵称 / 书友称呼"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="sm:w-64 px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 focus:outline-none focus:border-amber-600"
            />
          </div>
          <div className="flex gap-3">
            <textarea
              required
              rows={2}
              placeholder="向舟渡星港发送留言..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="flex-1 p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 focus:outline-none focus:border-amber-600 font-serif"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-b from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-amber-50 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow shrink-0 self-end"
            >
              <Send className="w-4 h-4" />
              发送留言
            </button>
          </div>
        </form>

        {/* Guestbook Feed */}
        <div className="space-y-4">
          {guestbook.map((msg) => (
            <div key={msg.id} className="p-4 rounded-xl bg-stone-950/80 border border-stone-800 text-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-amber-900 text-amber-200 flex items-center justify-center font-bold text-[10px]">
                    {msg.userName.slice(0, 1)}
                  </div>
                  <span className="font-bold text-amber-200">{msg.userName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-stone-500">{msg.createdAt}</span>
                  <button
                    onClick={() => onLikeGuestbook(msg.id)}
                    className="flex items-center gap-1 text-[11px] text-stone-400 hover:text-rose-400"
                  >
                    <Heart className="w-3 h-3" />
                    <span>{msg.likes}</span>
                  </button>
                </div>
              </div>
              
              <p className="text-stone-300 font-serif leading-relaxed pl-8 mb-2">
                {msg.content}
              </p>

              {/* Author Reply */}
              {msg.authorReply && (
                <div className="ml-8 mt-2 p-3 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-200/90 text-xs">
                  <div className="font-bold text-amber-400 flex items-center gap-1 mb-1">
                    <Feather className="w-3 h-3" /> 舟渡星港 回复：
                  </div>
                  <p className="font-serif">{msg.authorReply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Dialog for Publishing or Editing Writing Status Log */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-amber-100 flex items-center gap-2">
                <Feather className="w-5 h-5 text-emerald-400" />
                {editingLog ? '编辑写作状态日志' : '发布社畜写作状态日志'}
              </h3>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="space-y-4 font-sans text-xs">
              {/* Preset tags */}
              <div>
                <label className="block text-stone-300 mb-1.5 font-bold">选择或填写状态标签</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    { tag: '📖 近期更新动态', color: 'amber' },
                    { tag: '☕ 打工人日常', color: 'emerald' },
                    { tag: '💌 创作寄语', color: 'rose' },
                    { tag: '📝 写作心得', color: 'sky' },
                    { tag: '⚡ 摸鱼灵感', color: 'purple' },
                  ].map((preset) => (
                    <button
                      key={preset.tag}
                      type="button"
                      onClick={() => {
                        setLogTag(preset.tag);
                        setLogTagColor(preset.color);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs transition-all border cursor-pointer ${
                        logTag === preset.tag
                          ? 'bg-amber-900/60 border-amber-600 text-amber-200 font-bold shadow-sm'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {preset.tag}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={logTag}
                  onChange={(e) => setLogTag(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 focus:outline-none focus:border-amber-600"
                  placeholder="自定义标签（例如：📖 某某作品进度）"
                  required
                />
              </div>

              {/* Tag Color picker */}
              <div>
                <label className="block text-stone-300 mb-1.5 font-bold">标签颜色</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { name: 'amber', bg: 'bg-amber-500', label: '琥珀金' },
                    { name: 'emerald', bg: 'bg-emerald-500', label: '翠绿' },
                    { name: 'rose', bg: 'bg-rose-500', label: '玫瑰红' },
                    { name: 'sky', bg: 'bg-sky-500', label: '晴空蓝' },
                    { name: 'purple', bg: 'bg-purple-500', label: '紫罗兰' },
                  ].map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setLogTagColor(c.name)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                        logTagColor === c.name
                          ? 'bg-stone-800 border-amber-500 text-stone-100 font-bold shadow-sm'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date / Subtitle */}
              <div>
                <label className="block text-stone-300 mb-1.5 font-bold">日期 / 状态副标题</label>
                <input
                  type="text"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 focus:outline-none focus:border-amber-600 font-mono"
                  placeholder="例如：2026-08-07 或 致所有读者"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-stone-300 mb-1.5 font-bold">日志正文内容</label>
                <textarea
                  value={logContent}
                  onChange={(e) => setLogContent(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 focus:outline-none focus:border-amber-600 leading-relaxed"
                  placeholder="请输入今天或近期想分享的写作动态、心情体会或打工感受..."
                  required
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-bold transition-all cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-amber-100 rounded-xl font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>保存更新</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>

  );
};
