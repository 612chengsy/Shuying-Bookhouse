import fs from 'fs';
import path from 'path';
import { Book, Comment, Review, GuestbookMessage, MusicTrack, WritingStatusLog } from '../src/types';
import { INITIAL_BOOKS, INITIAL_REVIEWS, INITIAL_COMMENTS, INITIAL_GUESTBOOK } from '../src/data/initialData';

export interface AppStore {
  books: Book[];
  comments: Comment[];
  reviews: Review[];
  guestbook: GuestbookMessage[];
  musicTracks: MusicTrack[];
  statusLogs: WritingStatusLog[];
  statusQuote: string;
  totalViews: number;
}

const DEFAULT_MUSIC_TRACKS: MusicTrack[] = [
  { id: 'default_1', title: '《微光》—— 小说《予梦沉沦》衍生吉他弹唱 Demo', duration: '03:45', durationSec: 225, mood: '温暖沉静' },
  { id: 'default_2', title: '《月下疏影》—— 诗歌朗诵与古风轻音乐', duration: '02:30', durationSec: 150, mood: '古典意境' },
  { id: 'default_3', title: '《社畜的周末清晨》—— 随性弹唱碎碎念', duration: '04:12', durationSec: 252, mood: '轻松治愈' }
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

const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

let currentStore: AppStore | null = null;

export function initStore(): AppStore {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  if (fs.existsSync(STORE_FILE)) {
    try {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      currentStore = JSON.parse(raw);
    } catch (err) {
      console.error('Error reading store.json, reinitializing default:', err);
    }
  }

  if (!currentStore) {
    currentStore = {
      books: INITIAL_BOOKS,
      comments: INITIAL_COMMENTS,
      reviews: INITIAL_REVIEWS,
      guestbook: INITIAL_GUESTBOOK,
      musicTracks: DEFAULT_MUSIC_TRACKS,
      statusLogs: DEFAULT_STATUS_LOGS,
      statusQuote: DEFAULT_STATUS_QUOTE,
      totalViews: 2000,
    };
    saveStore();
  }

  return currentStore;
}

export function getStore(): AppStore {
  if (!currentStore) {
    return initStore();
  }
  return currentStore;
}

export function saveStore(): void {
  if (!currentStore) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(currentStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save store.json:', err);
  }
}

export function updateStore(fn: (store: AppStore) => AppStore): AppStore {
  const store = getStore();
  const nextStore = fn(store);
  currentStore = nextStore;
  saveStore();
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
  };
  saveStore();
  return currentStore;
}
