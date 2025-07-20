// src/components/AutoResetHistory.jsx
import { useEffect } from 'react';
import { useHistoryStore } from '../store/historyStore';

export default function AutoResetHistory({ maxAgeInDays = 90 }) {
  const historyList = useHistoryStore((s) => s.historyList);
  const setHistoryList = useHistoryStore((s) => s.setHistoryList);

  useEffect(() => {
    const now = Date.now();
    const batasWaktu = now - maxAgeInDays * 24 * 60 * 60 * 1000;

    const filtered = historyList.filter((item) => Number(item.selesai) > batasWaktu);
    if (filtered.length !== historyList.length) {
      setHistoryList(filtered);
    }
  }, [historyList, maxAgeInDays, setHistoryList]);

  return null; // Tidak menampilkan apa-apa
}