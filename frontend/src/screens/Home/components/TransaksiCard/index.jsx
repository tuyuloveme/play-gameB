// src/screens/TransaksiCard.jsx
import React, { useEffect, useRef, useState } from 'react';
import { usePsStore } from '../../../../store/psStore';
import { useTransaksiStore } from '../../../../store/transaksiStore';
import { useFnbStore } from '../../../../store/fnbStore';
import { MdAddCircleOutline, MdShoppingCart } from 'react-icons/md';
import Button from '../../../../components/Button';
import { isEspConnected, togglePower } from '../../../../utils/espApi';
import FnbModal from './FnbModal';
import TambahDurasiModal from './TambahDurasiModal';

const hitungHarga = (menit) => {
  if (menit < 60) return Math.ceil(menit / 10) * 1000;
  const jamPenuh = Math.floor(menit / 60);
  const sisa = menit % 60;
  return jamPenuh * 5000 + (sisa === 0 ? 0 : Math.ceil(sisa / 10) * 1000);
};

export default function TransaksiCard({ transaksi }) {
  const { psList } = usePsStore();
  const { finishTransaksi, removeTransaksi, globalPaused } = useTransaksiStore();
  const { fnbList } = useFnbStore();

  const [showFnbModal, setShowFnbModal] = useState(false);
  const [showTambahDurasi, setShowTambahDurasi] = useState(false);

  const ps = psList.find((ps) => ps.id === transaksi.psId);
  const psNama = ps ? `PS ${ps.nomor}` : 'Unknown PS';

  const durasi = Number(transaksi.durasi || 0);
  const durasiTambahan = (transaksi.tambahDurasiList || []).reduce((sum, item) => sum + (item.menit || 0), 0);
  const totalDurasi = durasi + durasiTambahan;
  const hargaSewa = hitungHarga(totalDurasi);

  const totalFnb = Object.values(transaksi.fnbItems || {}).reduce((sum, item) => {
    const fnb = fnbList.find((f) => f.id === item.id);
    return sum + (fnb?.harga || 0) * item.jumlah;
  }, 0);

  const totalItemFnb = Object.values(transaksi.fnbItems || {}).reduce((sum, item) => sum + item.jumlah, 0);
  const totalBayar = hargaSewa + totalFnb;

  const [sisaMs, setSisaMs] = useState(0);
  const finishCalled = useRef(false);

  useEffect(() => {
    const updateSisa = () => {
      const mulaiTimestamp = transaksi.mulai || Date.now();
      const waktuSelesai = mulaiTimestamp + totalDurasi * 60 * 1000;
      const now = Date.now();
      const sisa = waktuSelesai - now;
      setSisaMs(sisa);
    };

    updateSisa();
    const interval = setInterval(() => {
      if (!globalPaused) updateSisa();
    }, 1000);

    return () => clearInterval(interval);
  }, [globalPaused, transaksi.mulai, totalDurasi]);

  const formatMsToTime = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const jam = Math.floor(totalSeconds / 3600);
    const menit = Math.floor((totalSeconds % 3600) / 60);
    const detik = totalSeconds % 60;
    return `${jam > 0 ? `${jam}j ` : ''}${menit}m ${detik}s`;
  };

  const handleFinished = async () => {
    if (!confirm('Yakin ingin menyelesaikan transaksi ini?')) return;
    if (finishCalled.current) return;

    finishCalled.current = true;
    await finishTransaksi(transaksi.id);

    const connected = await isEspConnected();
    if (connected && ps?.nomor) {
      await togglePower(ps.nomor);
    }
  };

  const handleBatalkan = async () => {
    if (!confirm('Yakin ingin membatalkan transaksi ini?')) return;

    await removeTransaksi(transaksi.id);

    const connected = await isEspConnected();
    if (connected && ps?.nomor) {
      await togglePower(ps.nomor);
    }
  };

  return (
    <>
      <div className="bg-white shadow-md rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">{psNama}</h2>
          <div className="flex gap-3">
            <button onClick={() => setShowTambahDurasi(true)} title="Tambah Durasi">
              <MdAddCircleOutline size={24} className="text-blue-500" />
            </button>
            <button onClick={() => setShowFnbModal(true)} className="relative" title="FNB / Jajanan">
              <MdShoppingCart size={24} className="text-gray-700" />
              {totalItemFnb > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full px-2 text-xs">
                  {totalItemFnb}
                </span>
              )}
            </button>
          </div>
        </div>

        <hr className="my-2" />

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Tanggal:</span>
            <span>{new Date(transaksi.mulai).toLocaleDateString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Mulai Jam:</span>
            <span>{new Date(transaksi.mulai).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(/\./g, ':')}</span>
          </div>
          <div className="flex justify-between">
            <span>Durasi Awal:</span><span>{durasi} menit</span>
          </div>
          {durasiTambahan > 0 && (
            <div className="flex justify-between">
              <span>+ Tambahan Durasi:</span><span>{durasiTambahan} menit</span>
            </div>
          )}
          <div className="flex justify-between"><span>Total Durasi:</span><span>{totalDurasi} menit</span></div>
          <div className="flex justify-between"><span>Sisa Waktu:</span><span>{formatMsToTime(sisaMs)}</span></div>
          <div className="flex justify-between"><span>Harga Sewa:</span><span>Rp {hargaSewa.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Total FNB:</span><span>Rp {totalFnb.toLocaleString()}</span></div>
          <div className="flex justify-between font-semibold text-black border-t pt-1 mt-1">
            <span>Total Bayar:</span>
            <span>Rp {totalBayar.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={handleFinished} className="w-full bg-green-500">Selesai</Button>
          <Button onClick={handleBatalkan} className="w-full bg-red-500">Batal</Button>
        </div>
      </div>

      <FnbModal
        visible={showFnbModal}
        onClose={() => setShowFnbModal(false)}
        transaksiId={transaksi.id}
      />

      <TambahDurasiModal
        visible={showTambahDurasi}
        onClose={() => setShowTambahDurasi(false)}
        transaksiId={transaksi.id}
      />
    </>
  );
}
