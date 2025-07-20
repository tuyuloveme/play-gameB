// src/screens/Home/components/RemoteModal.jsx
import React, { useState } from 'react';
import { usePsStore } from '../../../../../store/psStore';
import { useTransaksiStore } from '../../../../../store/transaksiStore';
import { togglePower, isEspConnected } from '../../../../../utils/espApi';

export default function RemoteModal({ onClose }) {
  const { psList } = usePsStore();
  const { transaksiList } = useTransaksiStore(); // ✅ ambil transaksi aktif
  const [loading, setLoading] = useState(false);

  const isPsSedangDipakai = (psId) => {
    return transaksiList.some((trx) => trx.psId === psId);
  };

  const handleToggle = async (ps) => {
    if (loading) return;
    setLoading(true);
    try {
      const connected = await isEspConnected();
      if (!connected) {
        alert('ESP32 tidak terhubung');
        return;
      }

      await togglePower(ps.nomor);
      alert(`✅ Perintah ke PS ${ps.nomor} berhasil`);
    } catch (err) {
      alert(`❌ Gagal kirim ke PS ${ps.nomor}:\n${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Remote Kendali PS</h2>

        <div className="grid grid-cols-2 gap-3">
          {psList.map((ps) => {
            const sedangDipakai = isPsSedangDipakai(ps.id);
            return (
              <button
                key={ps.id}
                disabled={loading || sedangDipakai}
                onClick={() => handleToggle(ps)}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded disabled:opacity-50"
              >
                {sedangDipakai ? `PS ${ps.nomor} (Aktif)` : `Toggle PS ${ps.nomor}`}
              </button>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
        >
          ✕
        </button>
      </div>
    </div>
  );
}