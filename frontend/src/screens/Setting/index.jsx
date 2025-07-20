import React, { useState } from 'react';
import KelolaPsModal from './components/KelolaPsModal';
import KelolaFnbModal from './components/KelolaFnbModal';
import Logout from './components/Logout';
import Button from '../../components/Button';

export default function Setting() {
  const [modalPs, setModalPs] = useState(false);
  const [modalFnb, setModalFnb] = useState(false);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Pengaturan</h1>

      <div className='space-y-4'>
        <Button
          onClick={() => setModalPs(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Kelola PS
        </Button>

        <Button
          onClick={() => setModalFnb(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Kelola F&B
        </Button>

        <Logout />
      </div>

      {modalPs && <KelolaPsModal onClose={() => setModalPs(false)} />}
      {modalFnb && <KelolaFnbModal onClose={() => setModalFnb(false)} />}
    </div>
  );
}