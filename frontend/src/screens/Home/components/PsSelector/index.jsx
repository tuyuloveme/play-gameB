import React, { useMemo, useState } from 'react';
import { usePsStore } from '../../../../store/psStore';
import { useTransaksiStore } from '../../../../store/transaksiStore';
import Button from '../../../../components/Button';
import GlobalPauseButton from './GlobalPauseButton';
import RemoteModal from './RemoteModal';
import JajananModal from './JajananModal';

export default function PsSelector({
  selectedPsId,
  setSelectedPsId,
  waktuMain,
  setWaktuMain,
  onStart,
}) {
  const { psList } = usePsStore();
  const { transaksiList, globalPaused } = useTransaksiStore();

  const [showRemote, setShowRemote] = useState(false);
  const [showJajananModal, setShowJajananModal] = useState(false);

  const sortedPsList = useMemo(() => {
    return [...psList].sort((a, b) => a.nomor - b.nomor);
  }, [psList]);

  const sedangDipakai = transaksiList.map((t) => t.psId);

  const handleWaktuChange = (e) => {
    const angkaOnly = e.target.value.replace(/[^0-9]/g, '');
    let menit = parseInt(angkaOnly || '0', 10);
    if (menit > 720) menit = 720;
    setWaktuMain(menit === 0 ? '' : String(menit));
  };

  const hargaSewa = useMemo(() => {
    const menit = parseInt(waktuMain || '0', 10);
    if (!menit) return 0;

    if (menit < 60) {
      return Math.ceil(menit / 10) * 1000;
    }

    const jamPenuh = Math.floor(menit / 60);
    const sisaMenit = menit % 60;
    const tambahan = sisaMenit === 0 ? 0 : Math.ceil(sisaMenit / 10) * 1000;

    return jamPenuh * 5000 + tambahan;
  }, [waktuMain]);

  return (
    <div className="bg-white shadow-md rounded-md p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Pilih PS</h2>
        <div className="flex gap-4 items-center">
          <GlobalPauseButton />
          <button
            onClick={() => setShowRemote(true)}
            title="Remote TV"
            className="hover:scale-105 transition-transform"
          >
            📺
          </button>
          <button
            onClick={() => setShowJajananModal(true)}
            title="Jajanan / FNB"
            className="hover:scale-105 transition-transform"
          >
            🛒
          </button>
        </div>
      </div>

      <hr className="mb-4" />

      <div className="flex overflow-x-auto gap-2 mb-4">
        {sortedPsList.map((ps) => {
          const disabled = sedangDipakai.includes(ps.id) || globalPaused;
          const isSelected = selectedPsId === ps.id;

          return (
            <button
              key={ps.id}
              onClick={() => setSelectedPsId(ps.id)}
              disabled={disabled}
              className={`min-w-[64px] px-3 py-2 rounded text-sm font-medium 
                ${
                  disabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isSelected
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
            >
              PS {ps.nomor}
            </button>
          );
        })}
      </div>

      <input
        type="number"
        placeholder="Waktu Main (menit)"
        maxLength={4}
        value={waktuMain}
        onChange={handleWaktuChange}
        disabled={globalPaused}
        className={`w-full px-3 py-2 border rounded mb-2 ${
          globalPaused ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
      />

      <p className="mb-2 text-sm">
        Harga Sewa: <strong>Rp {hargaSewa.toLocaleString()}</strong>
      </p>

      <Button
        onClick={onStart}
        disabled={!selectedPsId || !waktuMain || globalPaused}
      >
        Mulai Sewa
      </Button>

      {/* Modals */}
      {showRemote && (
        <RemoteModal
          onClose={() => setShowRemote(false)}
          onPowerToggle={() => {}} // Bisa disambungkan dari luar jika perlu
        />
      )}

      {showJajananModal && (
        <JajananModal
          visible={showJajananModal}
          onClose={() => setShowJajananModal(false)}
        />
      )}
    </div>
  );
}