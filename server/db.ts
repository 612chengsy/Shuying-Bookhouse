import { Book, Comment, Review, GuestbookMessage, MusicTrack, WritingStatusLog, UploadedFile } from '../src/types';
import { INITIAL_BOOKS, INITIAL_REVIEWS, INITIAL_COMMENTS, INITIAL_GUESTBOOK } from '../src/data/initialData';

// 定义数据结构
export interface AppStore {
  books: Book[];
  comments: Comment[];
  reviews: Review[];
  guestbook: GuestbookMessage[];
  musicTracks: MusicTrack[];
  statusLogs: WritingStatusLog[];
  statusQuote: string;
  totalViews: number;
  uploadedFiles: UploadedFile[]; // 新增：用于存储上传的文件信息
}

// 默认数据
const DEFAULT_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'default_1',
    title: '《微光》—— 小说《予梦沉沦》衍生吉他弹唱 Demo',
    duration: '03:45',
    durationSec: 225,
    mood: '温暖沉静'
  },
  {
    id: 'default_2',
    title: '《月下疏影》—— 诗歌朗诵与古风轻音乐',
    duration: '02:30',
    durationSec: 150,
    mood: '古典意境'
  },
  {
    id: 'default_3',
    title: '《社畜的周末清晨》—— 随性弹唱碎碎念',
    duration: '04:12',
    durationSec: 252,
    mood: '轻松治愈'
  }
];

const DEFAULT_STATUS_LOGS: WritingStatusLog[] = [
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

const DEFAULT_STATUS_QUOTE = '“生活万般皆苦，唯有文字与爱永恒。”';

// --- 核心修改：移除 fs 和 path 依赖，改为内存存储 ---

let currentStore: AppStore | null = null;

export function initStore(): AppStore {
  // 如果内存中已经有数据，直接返回
  if (currentStore) {
    return currentStore;
  }

  // 第一次初始化，使用默认数据
  currentStore = {
    books: INITIAL_BOOKS,
    comments: INITIAL_COMMENTS,
    reviews: INITIAL_REVIEWS,
    guestbook: INITIAL_GUESTBOOK,
    musicTracks: DEFAULT_MUSIC_TRACKS,
    statusLogs: DEFAULT_STATUS_LOGS,
    statusQuote: DEFAULT_STATUS_QUOTE,
    totalViews: 2000,
    uploadedFiles: [] // 新增：初始化上传文件数组
  };

  console.log('🟢 数据库已初始化 (内存模式)');
  return currentStore;
}

export function getStore(): AppStore {
  if (!currentStore) {
    return initStore();
  }
  return currentStore;
}

// --- 核心修改：saveStore 变为空函数，不再写入文件 ---
export function saveStore(): void {
  // 在边缘函数中，我们无法写入磁盘。
  // 数据仅在当前请求生命周期或实例生命周期内有效。
  // 如果需要持久化，请接入外部数据库（如 Supabase/Neon）。
  // console.log('⚠️ 边缘环境：数据未持久化 (内存模式)');
}

// --- 核心修改：updateStore 仅更新内存 ---
export function updateStore(fn: (store: AppStore) => AppStore): AppStore {
  const store = getStore();
  const nextStore = fn(store);
  currentStore = nextStore;
  // 不再调用 saveStore()
  return currentStore;
}

export function resetStoreToDefault(): AppStore {
  currentStore = {
    books: INITIAL_BOOKS,
    comments: INITIAL_COMMENTS,
    reviews: INITIAL_REVIEWS,
    guestbook: INITIAL_GUESTBOOK,
    musicTracks: DEFAULT_MUSIC_TRACKS,
    statusLogs: DEFAULT_STATUS_LOGS,
    statusQuote: DEFAULT_STATUS_QUOTE,
    totalViews: 2000,
    uploadedFiles: [] // 新增：重置时也初始化上传文件数组
  };
  return currentStore;
}

// 确保模块加载时初始化一次内存数据库，并导出可供路由直接使用的 `db` 对象
if (!currentStore) {
  initStore();
}

// 导出一个可直接被路由文件修改的对象，保持向后兼容（路由中常直接操作 `db.xxx`）
export const db: AppStore = currentStore as AppStore;