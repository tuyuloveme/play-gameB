// src/screens/Setting/components/KelolaPsModal.jsx
import React, { useEffect } from 'react';
import { usePsStore } from '../../../store/psStore';
import Button from '../../../components/Button';
import Modal from '../../../components/Modal';
import DeleteIcon from '../../../components/DeleteIcon';

export default function KelolaPsModal({ onClose }) {
  const psList = usePsStore((state) => state.psList);
  const fetchPs = usePsStore((state) => state.fetchPs);
  const addPs = usePsStore((state) => state.addPs);
  const deletePs = usePsStore((state) => state.deletePs);

  useEffect(() => {
    fetchPs(); // ✅ Fetch data saat modal dibuka
  }, [fetchPs]);

  const getNextAvailableNumber = () => {
    const existing = psList.map(ps => ps.nomor).sort((a, b) => a - b);
    for (let i = 1; i <= existing.length + 1; i++) {
      if (!existing.includes(i)) return i;
    }
  };

  const handleAdd = () => {
    const nextNomor = getNextAvailableNumber();
    addPs({ id: Date.now().toString(), nomor: nextNomor });
  };

  const handleDelete = (id) => {
    if (confirm("Yakin ingin menghapus PS ini?")) {
      deletePs(id);
    }
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-lg font-bold mb-4">Daftar PS</h2>

      <ul className="space-y-2 mb-4">
        {psList
          .slice()
          .sort((a, b) => a.nomor - b.nomor)
          .map((ps) => (
            <li
              key={ps.id}
              className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded"
            >
              <span>PS {ps.nomor}</span>
              <button
                onClick={() => handleDelete(ps.id)}><DeleteIcon /></button>
            </li>
          ))}
      </ul>

      <Button
        onClick={handleAdd}
        className="bg-blue-500 text-white px-4 py-2 rounded w-full"
      >
        Tambah PS
      </Button>
    </Modal>
  );
}