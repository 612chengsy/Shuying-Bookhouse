import { Router } from 'express';
import { getStore, updateStore, resetStoreToDefault } from '../db';
import { Book } from '../../src/types';

const router = Router();

// GET all books
router.get('/', (req, res) => {
  const store = getStore();
  res.json(store.books);
});

// POST new book
router.post('/', (req, res) => {
  const newBook: Book = req.body;
  if (!newBook || !newBook.title) {
    return res.status(400).json({ error: 'Book title is required' });
  }

  updateStore(store => {
    return {
      ...store,
      books: [newBook, ...store.books]
    };
  });

  res.json({ success: true, book: newBook });
});

// PUT update existing book by ID
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updatedBookData: Partial<Book> = req.body;

  let found = false;
  let updatedBook: Book | null = null;

  updateStore(store => {
    const nextBooks = store.books.map(b => {
      if (b.id === id) {
        found = true;
        updatedBook = { ...b, ...updatedBookData };
        return updatedBook;
      }
      return b;
    });

    return {
      ...store,
      books: nextBooks
    };
  });

  if (!found) {
    return res.status(404).json({ error: 'Book not found' });
  }

  res.json({ success: true, book: updatedBook });
});

// DELETE book by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  updateStore(store => {
    return {
      ...store,
      books: store.books.filter(b => b.id !== id)
    };
  });

  res.json({ success: true, message: 'Book deleted' });
});

// POST reset books to default
router.post('/reset', (req, res) => {
  const store = resetStoreToDefault();
  res.json({ success: true, books: store.books });
});

export default router;
