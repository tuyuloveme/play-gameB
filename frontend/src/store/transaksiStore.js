import { create } from 'zustand';
import { useHistoryStore } from './historyStore';
import { useFnbStore } from './fnbStore';

export const useTransaksiStore = create((set, get) => ({
  transaksiList: [],
  globalPaused: false,
  pauseTimestamp: null,

  // ✅ Hanya fetch data dari backend
  fetchTransaksiList: async () => {
    try {
      const res = await fetch('http://localhost:5000/transaksi');
      const data = await res.json();
      set({ transaksiList: data });
    } catch (err) {
      console.error('❌ Gagal fetch transaksi:', err);
    }
  },

  // ✅ Global pause untuk semua transaksi
  setGlobalPaused: (value) => {
    if (value) {
      set({ globalPaused: true, pauseTimestamp: Date.now() });
    } else {
      const now = Date.now();
      const pauseTime = get().pauseTimestamp || now;
      const durasiPause = now - pauseTime;

      set((state) => ({
        globalPaused: false,
        pauseTimestamp: null,
        transaksiList: state.transaksiList.map((trx) => ({
          ...trx,
          mulai: trx.mulai + durasiPause,
        })),
      }));
    }
  },

  // ✅ Tambah transaksi baru
  addTransaksi: async (trx) => {
    try {
      const trxWithStart = { ...trx, mulai: trx.mulai || Date.now() };
      await fetch('http://localhost:5000/transaksi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trxWithStart),
      });

      await get().fetchTransaksiList();
      set({ globalPaused: false, pauseTimestamp: null });
    } catch (err) {
      console.error('❌ Gagal tambah transaksi:', err);
    }
  },

  // ✅ Update transaksi
  updateTransaksi: async (id, updated) => {
    try {
      const existing = get().transaksiList.find((trx) => trx.id === id);
      if (!existing) return;

      const updatedTrx = { ...existing, ...updated };

      await fetch(`http://localhost:5000/transaksi/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTrx),
      });

      await get().fetchTransaksiList();
    } catch (err) {
      console.error('❌ Gagal update transaksi:', err);
    }
  },

  // ✅ Hapus transaksi
  removeTransaksi: async (id) => {
    try {
      await fetch(`http://localhost:5000/transaksi/${id}`, { method: 'DELETE' });

      await get().fetchTransaksiList();
      const afterList = get().transaksiList;

      if (afterList.length === 0) {
        set({ globalPaused: false, pauseTimestamp: null });
      }
    } catch (err) {
      console.error('❌ Gagal hapus transaksi:', err);
    }
  },

  // ✅ Tambah durasi (lokal)
  addDurasi: async (id, tambahanMenit) => {
    const state = get();
    const transaksi = state.transaksiList.find(trx => trx.id === id);
    if (!transaksi) return;

    const now = Date.now();
    const listBaru = transaksi.tambahDurasiList ? [...transaksi.tambahDurasiList] : [];
    listBaru.push({ menit: tambahanMenit, waktu: now });

    const updatedTrx = { ...transaksi, tambahDurasiList: listBaru };

    try {
      await fetch(`http://localhost:5000/transaksi/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTrx),
      });

      await get().fetchTransaksiList(); // Refetch biar state sinkron
    } catch (err) {
      console.error('❌ Gagal update tambah durasi:', err);
    }
  },

  // ✅ Selesaikan transaksi: simpan ke riwayat dan hapus
  finishTransaksi: async (id) => {
    const state = get();
    const transaksi = state.transaksiList.find((trx) => trx.id === id);
    if (!transaksi || transaksi.selesai) return;

    const { addHistory } = useHistoryStore.getState();
    const { fnbList } = useFnbStore.getState();

    const snapshotFnbItems = Object.entries(transaksi.fnbItems || {}).reduce(
      (acc, [fnbId, item]) => {
        const fnbMaster = fnbList.find((f) => f.id == fnbId);
        acc[fnbId] = {
          id: parseInt(fnbId, 10),
          nama: fnbMaster?.nama || 'Unknown',
          harga: Number(fnbMaster?.harga || 0),
          jumlah: Number(item.jumlah),
        };
        return acc;
      },
      {}
    );

    const selesai = Date.now();
    const riwayat = {
      ...transaksi,
      fnbItems: snapshotFnbItems,
      selesai,
    };

    try {
      await fetch('http://localhost:5000/riwayat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(riwayat),
      });
      addHistory(riwayat);
    } catch (err) {
      console.error('❌ Gagal simpan riwayat ke server:', err);
    }

    try {
      await fetch(`http://localhost:5000/transaksi/${id}`, { method: 'DELETE' });

      set((state) => {
        const transaksiBaru = state.transaksiList.filter((trx) => trx.id !== id);
        const shouldClearPause = transaksiBaru.length === 0;

        return {
          transaksiList: transaksiBaru,
          globalPaused: shouldClearPause ? false : state.globalPaused,
          pauseTimestamp: shouldClearPause ? null : state.pauseTimestamp,
        };
      });
    } catch (err) {
      console.error('❌ Gagal hapus transaksi:', err);
    }
  },
}));