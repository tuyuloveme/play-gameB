import { create } from 'zustand';

export const useFilterStore = create((set) => ({
  selectedDate: new Date(),
  filterMode: 'harian',

  setSelectedDate: (date) => set({ selectedDate: date }),
  setFilterMode: (mode) => set({ filterMode: mode }),
  clearDate: () => set({ selectedDate: null }),
}));