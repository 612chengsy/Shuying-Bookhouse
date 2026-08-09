import { Router } from 'express';
import { getStore, updateStore } from '../db';
import { WritingStatusLog } from '../../src/types';

const router = Router();

// GET all status logs and quote
router.get('/', (req, res) => {
  const store = getStore();
  res.json({
    logs: store.statusLogs,
    quote: store.statusQuote
  });
});

// POST new log
router.post('/', (req, res) => {
  const log: WritingStatusLog = req.body;
  if (!log || !log.content) {
    return res.status(400).json({ error: 'Log content is required' });
  }

  const newLog: WritingStatusLog = {
    ...log,
    id: log.id || 'log-' + Date.now(),
    date: log.date || new Date().toISOString().split('T')[0]
  };

  updateStore(store => ({
    ...store,
    statusLogs: [newLog, ...store.statusLogs]
  }));

  res.json({ success: true, log: newLog });
});

// PUT update log
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const logData: Partial<WritingStatusLog> = req.body;

  updateStore(store => ({
    ...store,
    statusLogs: store.statusLogs.map(l => l.id === id ? { ...l, ...logData } : l)
  }));

  res.json({ success: true });
});

// DELETE log
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  updateStore(store => ({
    ...store,
    statusLogs: store.statusLogs.filter(l => l.id !== id)
  }));
  res.json({ success: true });
});

// PUT update author quote
router.put('/quote/update', (req, res) => {
  const { quote } = req.body;
  if (!quote) {
    return res.status(400).json({ error: 'Quote is required' });
  }

  updateStore(store => ({
    ...store,
    statusQuote: quote
  }));

  res.json({ success: true, quote });
});

export default router;
