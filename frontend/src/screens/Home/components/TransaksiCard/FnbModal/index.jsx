import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useFnbStore } from '../../../../../store/fnbStore';
import { useTransaksiStore } from '../../../../../store/transaksiStore';
import Modal from '../../../../../components/Modal';

export default function FnbModal({ visible, onClose, transaksiId }) {
  const { fnbList } = useFnbStore();
  const { transaksiList, updateTransaksi } = useTransaksiStore();

  const [search, setSearch] = useState('');
  const inputRef = useRef(null);

  const transaksi = transaksiList.find((trx) => trx.id === transaksiId);
  const fnbItems = transaksi?.fnbItems || {};

  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
    }
    if (!visible) setSearch('');
  }, [visible]);

  const filteredList = useMemo(() => {
    return fnbList
      .filter((item) =>
        item.nama.toLowerCase().includes(search.trim().toLowerCase())
      )
      .sort((a, b) => {
        const aSelected = fnbItems[String(a.id)];
        const bSelected = fnbItems[String(b.id)];
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return a.nama.localeCompare(b.nama);
      });
  }, [fnbList, search, fnbItems]);

  const handleTambahFnb = async (fnbId) => {
    const key = String(fnbId);
    const current = fnbItems[key] || { id: fnbId, jumlah: 0 };
    const updatedItems = {
      ...fnbItems,
      [key]: { ...current, jumlah: current.jumlah + 1 },
    };
    await updateTransaksi(transaksiId, { fnbItems: updatedItems });
  };

  const handleKurangFnb = async (fnbId) => {
    const key = String(fnbId);
    const current = fnbItems[key];
    if (!current) return;

    const newJumlah = current.jumlah - 1;
    const updatedItems = { ...fnbItems };

    if (newJumlah <= 0) {
      delete updatedItems[key];
    } else {
      updatedItems[key] = { ...current, jumlah: newJumlah };
    }

    await updateTransaksi(transaksiId, { fnbItems: updatedItems });
  };

  if (!transaksi) return null;

  return (
    visible ? (
      <Modal onClose={onClose}>
        <div>
          <h2 className="text-lg font-semibold mb-3">Tambah FNB</h2>

          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari jajanan..."
            className="w-full border rounded px-3 py-2 mb-3"
          />

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredList.length === 0 ? (
              <p className="text-sm text-gray-500">Tidak ada FNB yang cocok.</p>
            ) : (
              filteredList.map((item) => {
                const jumlah = fnbItems[String(item.id)]?.jumlah || 0;
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
                        onClick={() => handleKurangFnb(item.id)}
                        className="px-2 py-1 bg-gray-200 rounded"
                      >
                        -
                      </button>
                      <span>{jumlah}</span>
                      <button
                        onClick={() => handleTambahFnb(item.id)}
                        className="px-2 py-1 bg-gray-200 rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>
    ) : null
  );
}