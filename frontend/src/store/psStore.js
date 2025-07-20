// src/store/modules/psStore.js
import { create } from 'zustand';

export const usePsStore = create((set, get) => ({
  psList: [],

  fetchPs: async () => {
    const res = await fetch('http://127.0.0.1:5000/ps');
    const data = await res.json();
    set({ psList: data });
  },

  addPs: async (ps) => {
    const res = await fetch('http://127.0.0.1:5000/ps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ps),
    });
    const newPs = await res.json();
    set((state) => ({
      psList: [...state.psList, newPs],
    }));
  },

  deletePs: async (id) => {
    await fetch(`http://127.0.0.1:5000/ps/${id}`, {
      method: 'DELETE',
    });
    set((state) => ({
      psList: state.psList.filter((ps) => ps.id !== id),
    }));
  },
}));