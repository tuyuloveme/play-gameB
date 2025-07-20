import { create } from 'zustand';

export const useEspConfigStore = create((set) => ({
  espHost: localStorage.getItem('espHost') || 'http://192.168.18.88',

  setEspHost: (host) => {
    localStorage.setItem('espHost', host);
    set({ espHost: host });
  },

  loadEspHost: () => {
    const saved = localStorage.getItem('espHost');
    if (saved) set({ espHost: saved });
  },
}));