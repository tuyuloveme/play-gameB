import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BottomTab from './navigation/BottomTab';
import Home from './screens/Home';
import Riwayat from './screens/Riwayat';
import Summary from './screens/Summary';
import Setting from './screens/Setting';
import Login from './auth/login';
import ProtectedRoute from './auth/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { useTransaksiStore } from './store/transaksiStore';
import { usePsStore } from './store/psStore';
import { togglePower, isEspConnected } from './utils/espApi';

export default function App() {
  const user = useAuthStore((state) => state.user);
  const { transaksiList, fetchTransaksiList, finishTransaksi } = useTransaksiStore();
  const { psList, fetchPs } = usePsStore();

  // ✅ Jalankan sekali saat app load
  useEffect(() => {
    fetchTransaksiList();
    fetchPs();
  }, []);

  // ✅ Timer global jalan terus, walau bukan di Home
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = Date.now();

      for (const transaksi of transaksiList) {
        const mulai = transaksi.mulai || now;
        const durasiAwal = Number(transaksi.durasi || 0);
        const tambahan = (transaksi.tambahDurasiList || []).reduce((sum, t) => sum + (t.menit || 0), 0);
        const totalDurasi = durasiAwal + tambahan;
        const selesaiAt = mulai + totalDurasi * 60 * 1000;

        if (now >= selesaiAt) {
          await finishTransaksi(transaksi.id);

          const ps = psList.find(p => p.id === transaksi.psId);
          const connected = await isEspConnected();
          if (connected && ps?.nomor) {
            await togglePower(ps.nomor);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [transaksiList, psList, finishTransaksi]);

  return (
    <Router>
      <div className="pb-14">
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/riwayat"
            element={
              <ProtectedRoute>
                <Riwayat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/summary"
            element={
              <ProtectedRoute>
                <Summary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/setting"
            element={
              <ProtectedRoute>
                <Setting />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      {user && <BottomTab />}
    </Router>
  );
}