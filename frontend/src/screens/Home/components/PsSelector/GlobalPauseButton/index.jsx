// src/screens/Home/components/PsSelector/GlobalPauseButton.jsx
import React from 'react';
import { useTransaksiStore } from '../../../../../store/transaksiStore';
import { MdPauseCircleOutline, MdPlayCircleOutline } from 'react-icons/md';

export default function GlobalPauseButton() {
  const { transaksiList, globalPaused, setGlobalPaused } = useTransaksiStore();

  // Sembunyikan tombol kalau tidak ada transaksi
  if (transaksiList.length === 0) return null;

  const handleTogglePause = () => {
    if (!globalPaused) {
      const konfirmasi = window.confirm(
        'Pause semua PS?\nWaktu akan dihentikan sementara untuk semua transaksi. Lanjutkan?'
      );
      if (!konfirmasi) return;
    }

    setGlobalPaused(!globalPaused);
  };

  return (
    <button onClick={handleTogglePause} title={globalPaused ? 'Lanjutkan Semua PS' : 'Pause Semua PS'}>
      {globalPaused ? (
        <MdPlayCircleOutline size={28} className="text-green-500" />
      ) : (
        <MdPauseCircleOutline size={28} className="text-yellow-500" />
      )}
    </button>
  );
}