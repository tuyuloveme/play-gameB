import React, { useEffect, useState } from 'react';
import { usePsStore } from '../../store/psStore';
import { useTransaksiStore } from '../../store/transaksiStore';
import { useFnbStore } from '../../store/fnbStore';
import PsSelector from './components/PsSelector';
import TransaksiCard from './components/TransaksiCard';
import { togglePower, isEspConnected } from '../../utils/espApi';

export default function HomeScreen() {
  const { psList, fetchPs } = usePsStore();
  const { fetchFnbList } = useFnbStore();
  const { transaksiList, addTransaksi, fetchTransaksiList } = useTransaksiStore();

  const [selectedPsId, setSelectedPsId] = useState(null);
  const [waktuMain, setWaktuMain] = useState('');

  // ✅ Fetch semua data awal saat halaman dimount
  useEffect(() => {
    fetchPs();
    fetchFnbList();
    fetchTransaksiList();
  }, []);

  // ✅ Handler untuk mulai transaksi baru
  const handleStart = async () => {
    if (!selectedPsId || !waktuMain) return;

    const ps = psList.find(p => p.id === selectedPsId);
    if (!ps) return;

    try {
      const connected = await isEspConnected();
      if (!connected) {
        alert('❌ ESP32 tidak terhubung');
      } else {
        await togglePower(ps.nomor);
      }
    } catch (e) {
      alert(`❌ Gagal kirim ke PS ${ps.nomor}:\n${e.message}`);
    }

    addTransaksi({
      id: Date.now().toString(),
      psId: selectedPsId,
      durasi: parseInt(waktuMain),
      fnbItems: {},
      mulai: Date.now(),
    });

    setSelectedPsId(null);
    setWaktuMain('');
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <PsSelector
        selectedPsId={selectedPsId}
        setSelectedPsId={setSelectedPsId}
        waktuMain={waktuMain}
        setWaktuMain={setWaktuMain}
        onStart={handleStart}
      />

      <div className="mt-6 space-y-4">
        {transaksiList.map((item) => (
          <TransaksiCard key={item.id} transaksi={item} />
        ))}
      </div>
    </div>
  );
}