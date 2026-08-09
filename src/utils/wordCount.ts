import { Book } from '../types';

/**
 * Formats a character count number into a friendly Chinese word count string.
 * e.g. 1250 -> "1,250字", 15000 -> "1.5万字", 20000 -> "2万字"
 */
export function formatWordCount(count: number): string {
  if (count <= 0) return '0字';
  if (count >= 10000) {
    const wan = count / 10000;
    const formatted = wan % 1 === 0 ? wan.toFixed(0) : wan.toFixed(1);
    return `${formatted}万字`;
  }
  return `${count.toLocaleString('zh-CN')}字`;
}

/**
 * Dynamically computes the total word count from all chapters' content in a book.
 * If chapters exist and have content, returns the actual formatted character count of the正文 text.
 * Otherwise, falls back to book.wordCount or '0字'.
 */
export function calculateBookWordCount(book: Book): string {
  if (book.chapters && book.chapters.length > 0) {
    const totalChars = book.chapters.reduce((sum, ch) => sum + (ch.content ? ch.content.length : 0), 0);
    if (totalChars > 0) {
      return formatWordCount(totalChars);
    }
  }
  return book.wordCount || '0字';
}
