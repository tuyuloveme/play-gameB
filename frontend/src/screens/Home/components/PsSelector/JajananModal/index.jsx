// src/screens/Home/components/PsSelector/JajananModal.jsx
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useFnbStore } from '../../../../../store/fnbStore';
import { useHistoryStore } from '../../../../../store/historyStore';
import Modal from '../../../../../components/Modal';
import { v4 as uuidv4 } from 'uuid';

export default function JajananModal({ visible, onClose }) {
  const { fnbList } = useFnbStore();
  const { addHistory } = useHistoryStore();

  const [selectedItems, setSelectedItems] = useState({});
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      setSearch('');
      setSelectedItems({});
    }
  }, [visible]);

  const filteredData = useMemo(() => {
    return fnbList
      .filter(item =>
        item.nama.toLowerCase().includes(search.trim().toLowerCase())
      )
      .sort((a, b) => {
        const aSelected = selectedItems[a.id];
        const bSelected = selectedItems[b.id];
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return a.nama.localeCompare(b.nama);
      });
  }, [fnbList, selectedItems, search]);

  const totalBayar = useMemo(() => {
    return Object.values(selectedItems).reduce((total, item) => {
      const fnb = fnbList.find(f => f.id === item.id);
      return total + ((fnb?.harga || 0) * item.jumlah);
    }, 0);
  }, [selectedItems]);

  const handleTambah = (id) => {
    const jumlah = selectedItems[id]?.jumlah || 0;
    setSelectedItems(prev => ({
      ...prev,
      [id]: { id, jumlah: jumlah + 1 },
    }));
  };

  const handleKurang = (id) => {
    const jumlah = selectedItems[id]?.jumlah || 0;
    if (jumlah <= 1) {
      const updated = { ...selectedItems };
      delete updated[id];
      setSelectedItems(updated);
    } else {
      setSelectedItems(prev => ({
        ...prev,
        [id]: { id, jumlah: jumlah - 1 },
      }));
    }
  };

  const handleBayar = () => {
    if (Object.keys(selectedItems).length === 0) return;

    const konfirmasi = window.confirm(
      `Bayar total Rp ${totalBayar.toLocaleString()} untuk jajanan ini?`
    );
    if (!konfirmasi) return;

    const now = Date.now();
    addHistory({
      id: uuidv4(),
      psId: null,
      mulai: now,
      selesai: now,
      durasi: 0,
      tambahDurasiList: [],
      fnbItems: selectedItems,
    });

    onClose();
    setSelectedItems({});
  };

  if (!visible) return null;

  return (
    <Modal onClose={onClose}>
      <div>
        <h2 className="text-lg font-semibold mb-3">Jajanan</h2>

        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari jajanan..."
          className="w-full border rounded px-3 py-2 mb-3"
        />

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredData.map(item => {
            const jumlah = selectedItems[item.id]?.jumlah || 0;
            return (
              <div
                key={item.id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="font-medium">{item.nama}</p>
                  <p className="text-sm text-gray-500">
                    Rp {item.harga.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleKurang(item.id)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    -
                  </button>
                  <span>{jumlah}</span>
                  <button
                    onClick={() => handleTambah(item.id)}
                    className="px-2 py-1 bg-gray-200 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {totalBayar > 0 && (
          <div className="mt-4 flex justify-between items-center">
            <span className="font-semibold">Total: Rp {totalBayar.toLocaleString()}</span>
            <button
              onClick={handleBayar}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Bayar
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}