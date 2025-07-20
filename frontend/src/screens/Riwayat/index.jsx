// src/screens/Riwayat/index.jsx
import React, { useEffect, useCallback, useState } from 'react';
import { useHistoryStore } from '../../store/historyStore';
import { usePsStore } from '../../store/psStore';
import { useFnbStore } from '../../store/fnbStore';
import AutoResetHistory from '../../components/AutoResetHistory';
import { MdDelete, MdCalendarToday } from 'react-icons/md';

export default function RiwayatScreen() {
  const { historyList, removeHistory, fetchHistory } = useHistoryStore();
  const { psList, fetchPs } = usePsStore();
  const { fnbList, fetchFnbList } = useFnbStore();

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  useEffect(() => {
    fetchHistory();
    fetchPs();
    fetchFnbList();
  }, []);

  const handleDeleteOne = useCallback((id) => {
    if (confirm('Yakin ingin menghapus transaksi ini?')) {
      removeHistory(id);
    }
  }, [removeHistory]);

  const hitungHargaSewa = (menit) => {
    if (menit < 60) return Math.ceil(menit / 10) * 1000;
    const jamPenuh = Math.floor(menit / 60);
    const sisa = menit % 60;
    return jamPenuh * 5000 + (sisa === 0 ? 0 : Math.ceil(sisa / 10) * 1000);
  };

  const filteredHistory = selectedDate
    ? historyList.filter(item => {
        const selesaiDate = new Date(Number(item.selesai));
        const yyyy = selesaiDate.getFullYear();
        const mm = String(selesaiDate.getMonth() + 1).padStart(2, '0');
        const dd = String(selesaiDate.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}` === selectedDate;
      })
    : historyList;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <AutoResetHistory maxAgeInDays={90} />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Riwayat Transaksi</h2>
        <div className="relative w-6 h-6">
          <MdCalendarToday className="text-xl text-gray-600 absolute top-0 left-0 cursor-pointer" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="absolute top-0 left-0 opacity-0 w-6 h-6 cursor-pointer"
          />
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <p className="text-gray-500 text-sm">Belum ada transaksi.</p>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => {
            const selesaiDate = new Date(Number(item.selesai));
            const mulaiDate = new Date(Number(item.mulai));
            const ps = psList.find((ps) => ps.id === item.psId);
            const fnbItems = Object.values(item.fnbItems || {});
            const isJajananOnly = item.psId === null;

            const detailedFnb = fnbItems.map((fnbItem) => {
              const fnb = fnbList.find((f) => f.id === fnbItem.id);
              return {
                nama: fnb?.nama || 'Unknown',
                jumlah: fnbItem.jumlah || 0,
                harga: fnb?.harga || 0,
                subtotal: (fnbItem.jumlah || 0) * (fnb?.harga || 0),
              };
            });

            const totalFnb = detailedFnb.reduce((sum, i) => sum + i.subtotal, 0);
            const durasi = Number(item.durasi || 0);
            const tambahDurasi = (item.tambahDurasiList || []).reduce((sum, d) => sum + (d.menit || 0), 0);
            const totalDurasi = durasi + tambahDurasi;
            const hargaSewa = hitungHargaSewa(totalDurasi);
            const totalBayar = hargaSewa + totalFnb;

            return (
              <div key={item.id} className="bg-white shadow rounded-lg p-4 relative border border-gray-200">
                <button
                  onClick={() => handleDeleteOne(item.id)}
                  className="absolute top-2 right-4 mt-2 text-xl text-red-500 hover:text-red-700"
                >
                  <MdDelete />
                </button>

                <h3 className="text-base font-bold mb-2">
                  {isJajananOnly ? 'Transaksi Jajanan' : `PS ${ps?.nomor || '-'}`}
                </h3>

                <div className="text-sm text-gray-700 space-y-1">
                  {!isJajananOnly && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tanggal:</span>
                        <span>{mulaiDate.toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mulai:</span>
                        <span>{mulaiDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Selesai:</span>
                        <span>{selesaiDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Durasi Awal:</span>
                        <span>{durasi} menit</span>
                      </div>
                      {tambahDurasi > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">+ Tambahan Durasi:</span>
                          <span>{tambahDurasi} menit</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Durasi:</span>
                        <span>{totalDurasi} menit</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Sewa PS:</span>
                        <span>Rp {hargaSewa.toLocaleString()}</span>
                      </div>
                    </>
                  )}

                  {isJajananOnly && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tanggal:</span>
                        <span>{mulaiDate.toLocaleDateString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Jam:</span>
                        <span>{mulaiDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':')}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between mt-2">
                    <span className="text-gray-600">FNB:</span>
                    <span>
                      {detailedFnb.length === 0
                        ? <span className="text-gray-500">Tidak ada</span>
                        : `(${detailedFnb.length} item)`}
                    </span>
                  </div>

                  {detailedFnb.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm ml-4">
                      <span className="text-gray-600">• {item.nama} x{item.jumlah}</span>
                      <span>Rp {item.subtotal.toLocaleString()}</span>
                    </div>
                  ))}

                  {!isJajananOnly && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total FNB:</span>
                      <span>Rp {totalFnb.toLocaleString()}</span>
                    </div>
                  )}

                  <hr className="my-2" />

                  <div className="flex justify-between font-semibold text-black">
                    <span>Total Bayar:</span>
                    <span>Rp {totalBayar.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
