export type BookCategory = '文学诗词' | '小说';

export interface Chapter {
  id: string;
  title: string;
  content: string;
  updatedAt?: string;
}

export interface Comment {
  id: string;
  bookId: string;
  chapterId?: string;
  userName: string;
  avatar?: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface Review {
  id: string;
  bookId?: string; // empty means general site review
  bookTitle?: string;
  userName: string;
  avatar?: string;
  rating: number; // 1-5
  content: string;
  createdAt: string;
  likes: number;
  replies?: {
    id: string;
    userName: string;
    content: string;
    createdAt: string;
  }[];
}

export interface Book {
  id: string;
  title: string;
  category: BookCategory;
  author: string;
  coverBg: string; // TailWind color gradient or hex
  coverIcon?: string;
  coverImage?: string; // Optional custom cover image URL or SVG
  backCoverImage?: string; // Optional custom back cover image URL or SVG
  description: string;
  tags: string[];
  wordCount: string;
  chapters: Chapter[];
  likes: number;
  views: number;
  createdAt: string;
  isOriginal: boolean;
}

export interface SiteStats {
  views: number;
  booksCount: number;
  commentsCount: number;
  likesCount: number;
}

export interface GuestbookMessage {
  id: string;
  userName: string;
  content: string;
  createdAt: string;
  authorReply?: string;
  likes: number;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist?: string;
  duration: string;
  durationSec?: number;
  mood?: string;
  url?: string;
  isLocal?: boolean;
  addedAt?: string;
}

export interface WritingStatusLog {
  id: string;
  tag: string;
  tagColor?: string;
  date: string;
  content: string;
}
export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  data: string; // Base64 data URL
  uploadedAt: string;
}