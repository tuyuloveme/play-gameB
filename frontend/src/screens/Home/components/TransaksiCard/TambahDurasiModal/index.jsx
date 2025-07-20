// src/screens/Home/TransaksiCard/TambahDurasiModal.jsx
import React, { useMemo, useState } from 'react';
import { useTransaksiStore } from '../../../../../store/transaksiStore';
import Modal from '../../../../../components/Modal';

const hitungHarga = (menit) => {
  if (menit < 60) return Math.ceil(menit / 10) * 1000;
  const jamPenuh = Math.floor(menit / 60);
  const sisa = menit % 60;
  return jamPenuh * 5000 + (sisa === 0 ? 0 : Math.ceil(sisa / 10) * 1000);
};

const TambahDurasiModal = ({ visible, onClose, transaksiId }) => {
  const [menit, setMenit] = useState('');
  const { transaksiList, addDurasi } = useTransaksiStore();

  const transaksi = transaksiList.find(t => t.id === transaksiId);
  const jumlahMenit = parseInt(menit || '0', 10);
  const harga = useMemo(() => hitungHarga(jumlahMenit), [jumlahMenit]);

  const handleSimpan = () => {
    if (jumlahMenit <= 0) return alert('Masukkan durasi yang valid');

    const konfirmasi = window.confirm(`Tambah ${jumlahMenit} menit dengan biaya Rp ${harga.toLocaleString()}?`);
    if (!konfirmasi) return;

    addDurasi(transaksiId, jumlahMenit);
    setMenit('');
    onClose();
  };

  const riwayat = transaksi?.tambahDurasiList || [];

  if (!visible) return null;

  return (
    <Modal onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">+ Tambah Durasi</h2>

      <input
        type="number"
        placeholder="Contoh: 30 (maks 720)"
        className="w-full border rounded p-2 mb-3"
        value={menit}
        onChange={(e) => {
          const val = parseInt(e.target.value.replace(/[^0-9]/g, '') || '0', 10);
          const valid = Math.min(val, 720);
          setMenit(valid === 0 ? '' : String(valid));
        }}
        maxLength={4}
        min={1}
      />

      {jumlahMenit > 0 && (
        <div className="flex justify-between items-center bg-gray-100 rounded p-2 mb-3">
          <span>+ {jumlahMenit} menit</span>
          <span className="font-semibold">Rp {harga.toLocaleString()}</span>
        </div>
      )}

      <div className="flex justify-end gap-2 mb-4">
        <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Batal</button>
        <button onClick={handleSimpan} className="px-4 py-2 bg-blue-500 text-white rounded">Simpan</button>
      </div>

      {riwayat.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">Riwayat Tambahan</h3>
          <ul className="space-y-1 text-sm">
            {riwayat.map((item, i) => (
              <li key={i} className="flex justify-between border-b py-1">
                <span>+ {item.menit} menit</span>
                <span>Rp {hitungHarga(item.menit).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
};

export default TambahDurasiModal;