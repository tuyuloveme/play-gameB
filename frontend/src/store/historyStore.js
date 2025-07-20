// src/store/historyStore.js
import { create } from 'zustand';

const BASE_URL = import.meta.env.VITE_API_URL;

export const useHistoryStore = create((set) => ({
  historyList: [],

  fetchHistory: async () => {
    try {
      const res = await fetch(`${BASE_URL}/riwayat`);
      const data = await res.json();
      set({ historyList: data });
    } catch (err) {
      console.error('❌ Gagal fetch riwayat:', err);
    }
  },

  addHistory: async (data) => {
    try {
      const res = await fetch(`${BASE_URL}/riwayat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      set((state) => ({
        historyList: [...state.historyList, result],
      }));
    } catch (err) {
      console.error('❌ Gagal tambah riwayat:', err);
    }
  },

  removeHistory: async (id) => {
    try {
      await fetch(`${BASE_URL}/riwayat/${id}`, {
        method: 'DELETE',
      });
      set((state) => ({
        historyList: state.historyList.filter((item) => item.id !== id),
      }));
    } catch (err) {
      console.error('❌ Gagal hapus riwayat:', err);
    }
  },

  resetHistory: () => set({ historyList: [] }),

  replaceAll: (newHistory) => set({ historyList: newHistory }),

  setHistoryList: (newList) => set({ historyList: newList }),
}));
