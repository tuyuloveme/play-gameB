// src/screens/Setting/components/KelolaFnbModal.jsx
import React, { useEffect, useState } from 'react';
import { useFnbStore } from '../../../store/fnbStore';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import DeleteIcon from '../../../components/DeleteIcon';
import EditIcon from '../../../components/EditIcon';

export default function KelolaFnbModal({ onClose }) {
  const fnbList = useFnbStore((s) => s.fnbList);
  const fetchFnbList = useFnbStore((s) => s.fetchFnbList);
  const addFnb = useFnbStore((s) => s.addFnb);
  const deleteFnb = useFnbStore((s) => s.deleteFnb);
  const updateFnb = useFnbStore((s) => s.updateFnb);

  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchFnbList();
  }, [fetchFnbList]);

  const resetForm = () => {
    setNama('');
    setHarga('');
    setEditId(null);
  };

  const handleSave = () => {
    const namaTrimmed = nama.trim();
    if (!namaTrimmed) {
      alert('Nama FNB tidak boleh kosong');
      return;
    }

    const parsedHarga = parseInt(harga);
    if (isNaN(parsedHarga) || parsedHarga <= 0) {
      alert('Harga harus berupa angka lebih dari 0');
      return;
    }

    const namaLower = namaTrimmed.toLowerCase();

    const isDuplicate = fnbList.some(item =>
      item.nama?.toLowerCase() === namaLower && item.id !== editId
    );

    if (isDuplicate) {
      alert('Nama FNB sudah ada, gunakan nama lain.');
      return;
    }

    if (editId) {
      updateFnb(editId, { nama: namaTrimmed, harga: parsedHarga });
    } else {
      addFnb({ id: Date.now(), nama: namaTrimmed, harga: parsedHarga });
    }

    resetForm();
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setNama(item.nama);
    setHarga(item.harga?.toString() || '');
  };

  const handleDelete = (id) => {
    if (confirm('Yakin ingin menghapus item ini?')) {
      deleteFnb(id);
    }
  };

  const validFnbList = Array.isArray(fnbList)
    ? fnbList.filter(item => item.nama)
    : [];

  return (
    <Modal onClose={onClose}>
      <h2 className="text-lg font-bold mb-4">Kelola F&B</h2>

      <input
        type="text"
        placeholder="Nama FNB"
        className="w-full mb-2 p-2 border rounded"
        value={nama}
        onChange={(e) => setNama(e.target.value)}
      />
      <input
        type="number"
        placeholder="Harga"
        className="w-full mb-2 p-2 border rounded"
        value={harga}
        onChange={(e) => setHarga(e.target.value)}
      />

      <div className="flex gap-2 mb-4">
        <Button
          onClick={handleSave}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          {editId ? 'Simpan Perubahan' : 'Tambah FNB'}
        </Button>
        {editId && (
          <Button
            onClick={resetForm}
            className="bg-red-500 text-white px-4 py-2 rounded w-full"
          >
            Batal Edit
          </Button>
        )}
      </div>

      <ul className="divide-y max-h-60 overflow-y-auto">
        {validFnbList.map((item) => (
          <li key={item.id} className="flex justify-between items-center py-2">
            <div>
              <p className="font-medium">{item.nama}</p>
              <p className="text-sm text-gray-500">
                {typeof item.harga === 'number'
                  ? `Rp${item.harga.toLocaleString()}`
                  : 'Harga tidak tersedia'}
              </p>
            </div>
            <div className="flex gap-5">
              <button onClick={() => handleEdit(item)}>
                <EditIcon />
              </button>
              <button onClick={() => handleDelete(item.id)}>
                <DeleteIcon />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  );
}