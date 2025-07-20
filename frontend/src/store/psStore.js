// src/store/modules/psStore.js
import { create } from 'zustand';

const BASE_URL = import.meta.env.VITE_API_URL;

export const usePsStore = create((set, get) => ({
  psList: [],

  fetchPs: async () => {
    try {
      const res = await fetch(`${BASE_URL}/ps`);
      const data = await res.json();
      set({ psList: data });
    } catch (err) {
      console.error('❌ Gagal fetch PS:', err);
    }
  },

  addPs: async (ps) => {
    try {
      const res = await fetch(`${BASE_URL}/ps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ps),
      });
      const newPs = await res.json();
      set((state) => ({
        psList: [...state.psList, newPs],
      }));
    } catch (err) {
      console.error('❌ Gagal tambah PS:', err);
    }
  },

  deletePs: async (id) => {
    try {
      await fetch(`${BASE_URL}/ps/${id}`, {
        method: 'DELETE',
      });
      set((state) => ({
        psList: state.psList.filter((ps) => ps.id !== id),
      }));
    } catch (err) {
      console.error('❌ Gagal hapus PS:', err);
    }
  },
}));
