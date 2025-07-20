// src/store/fnbStore.js
import { create } from 'zustand';

const BASE_URL = import.meta.env.VITE_API_URL;

export const useFnbStore = create((set) => ({
  fnbList: [],

  fetchFnbList: async () => {
    try {
      const res = await fetch(`${BASE_URL}/fnb`);
      const data = await res.json();
      set({ fnbList: data });
    } catch (err) {
      console.error('❌ Gagal fetch FNB:', err);
    }
  },

  addFnb: async (fnb) => {
    try {
      const res = await fetch(`${BASE_URL}/fnb`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fnb),
      });
      const data = await res.json();
      set((state) => ({ fnbList: [...state.fnbList, data] }));
    } catch (err) {
      console.error('❌ Gagal tambah FNB:', err);
    }
  },

  updateFnb: async (id, updated) => {
    try {
      await fetch(`${BASE_URL}/fnb/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      set((state) => ({
        fnbList: state.fnbList.map((fnb) =>
          fnb.id === id ? { ...fnb, ...updated } : fnb
        ),
      }));
    } catch (err) {
      console.error('❌ Gagal update FNB:', err);
    }
  },

  deleteFnb: async (id) => {
    try {
      await fetch(`${BASE_URL}/fnb/${id}`, {
        method: 'DELETE',
      });
      set((state) => ({
        fnbList: state.fnbList.filter((fnb) => fnb.id !== id),
      }));
    } catch (err) {
      console.error('❌ Gagal hapus FNB:', err);
    }
  },

  replaceAll: (newFnbList) => set({ fnbList: newFnbList }),
}));
