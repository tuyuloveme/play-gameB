import React, { useEffect, useMemo, useState } from 'react';
import { useHistoryStore } from '../../store/historyStore';
import { usePsStore } from '../../store/psStore';
import { useFnbStore } from '../../store/fnbStore';
import { useFilterStore } from '../../store/filterStore';
import ShareSummaryButton from './components/ShareSummaryButton';
import AutoResetHistory from '../../components/AutoResetHistory';
import FilterBar from './components/FilterBar';
import { format } from 'date-fns';
import id from 'date-fns/locale/id';

export default function SummaryScreen() {
  const { historyList, fetchHistory } = useHistoryStore();
  const { psList, fetchPs } = usePsStore();
  const { fnbList, fetchFnbList } = useFnbStore();
  const selectedDate = useFilterStore(state => state.selectedDate);
  const filterMode = useFilterStore(state => state.filterMode);

  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    fetchHistory();
    fetchPs();
    fetchFnbList();

    const timeout = setTimeout(() => setShowContent(true), 1000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (psList.length && fnbList.length && historyList.length) {
      setShowContent(true);
    }
  }, [psList, fnbList, historyList]);

  const [startDate, endDate] = useMemo(() => {
    const selected = new Date(selectedDate || new Date());
    selected.setHours(0, 0, 0, 0);

    if (filterMode === 'mingguan') {
      const start = new Date(selected);
      start.setDate(start.getDate() - start.getDay() + 1);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      return [start, end];
    }

    if (filterMode === 'bulanan') {
      const start = new Date(selected.getFullYear(), selected.getMonth(), 1);
      const end = new Date(selected.getFullYear(), selected.getMonth() + 1, 1);
      return [start, end];
    }

    const start = new Date(selected);
    const end = new Date(selected);
    end.setDate(end.getDate() + 1);
    return [start, end];
  }, [filterMode, selectedDate]);

  const filtered = useMemo(() => {
    return historyList.filter(item => {
      const selesai = new Date(Number(item.selesai));
      return selesai >= startDate && selesai < endDate;
    });
  }, [historyList, startDate, endDate]);

  const hitungHarga = (menit) => {
    if (menit < 60) return Math.ceil(menit / 10) * 1000;
    const jam = Math.floor(menit / 60);
    const sisa = menit % 60;
    return jam * 5000 + (sisa === 0 ? 0 : Math.ceil(sisa / 10) * 1000);
  };

  const summaryPerPs = psList
    .slice()  // bikin salinan supaya gak ngubah state
    .sort((a, b) => a.nomor - b.nomor)  // urutkan dari nomor terkecil ke terbesar
    .map(ps => {
      const transaksiPs = filtered.filter(item => item.psId === ps.id);

      let durasiTotal = 0, sewaTotal = 0, fnbTotal = 0;
      const fnbItemsMap = {};

      transaksiPs.forEach(item => {
        const baseDurasi = Number(item.durasi || 0);
        const tambahDurasi = (item.tambahDurasiList || []).reduce((s, t) => s + (t.menit || 0), 0);
        const totalDurasi = baseDurasi + tambahDurasi;
        durasiTotal += totalDurasi;

        const hargaSewa = hitungHarga(totalDurasi);
        sewaTotal += hargaSewa;

        const fnbItems = Object.values(item.fnbItems || {});
        fnbItems.forEach(fnbItem => {
          const fnb = fnbList.find(f => f.id === fnbItem.id);
          const nama = fnb?.nama || 'Unknown';
          const harga = fnb?.harga || 0;
          const jumlah = fnbItem.jumlah || 0;
          const subtotal = harga * jumlah;
          fnbTotal += subtotal;

          if (fnbItemsMap[nama]) {
            fnbItemsMap[nama].jumlah += jumlah;
            fnbItemsMap[nama].subtotal += subtotal;
          } else {
            fnbItemsMap[nama] = { nama, jumlah, subtotal };
          }
        });
      });

      return {
        ps,
        durasiTotal,
        sewaTotal,
        fnbTotal,
        fnbItems: Object.values(fnbItemsMap),
      };
    })
    .filter(item => item.durasiTotal > 0 || item.fnbTotal > 0);

  const jajananOnly = filtered.filter(item => item.psId === null);
  let jajananFnbTotal = 0;
  const jajananFnbItemsMap = {};

  jajananOnly.forEach(item => {
    const fnbItems = Object.values(item.fnbItems || {});
    fnbItems.forEach(fnbItem => {
      const fnb = fnbList.find(f => f.id === fnbItem.id);
      const nama = fnb?.nama || 'Unknown';
      const harga = fnb?.harga || 0;
      const jumlah = fnbItem.jumlah || 0;
      const subtotal = harga * jumlah;
      jajananFnbTotal += subtotal;

      if (jajananFnbItemsMap[nama]) {
        jajananFnbItemsMap[nama].jumlah += jumlah;
        jajananFnbItemsMap[nama].subtotal += subtotal;
      } else {
        jajananFnbItemsMap[nama] = { nama, jumlah, subtotal };
      }
    });
  });

  const totalSewa = summaryPerPs.reduce((sum, s) => sum + s.sewaTotal, 0);
  const totalFnb = summaryPerPs.reduce((sum, s) => sum + s.fnbTotal, 0) + jajananFnbTotal;
  const totalAll = totalSewa + totalFnb;

  const renderDateRange = () => {
    if (filterMode === 'mingguan') {
      return `${format(startDate, 'dd MMM', { locale: id })} - ${format(new Date(endDate.getTime() - 1), 'dd MMM yyyy', { locale: id })}`;
    }
    if (filterMode === 'bulanan') {
      return format(startDate, 'MMMM yyyy', { locale: id });
    }
    return format(startDate, 'EEEE, dd MMMM yyyy', { locale: id });
  };

  if (!showContent) {
    return <div className="p-4 text-gray-600">⏳ Memuat data ringkasan...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <AutoResetHistory maxAgeInDays={90} />

      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-bold">Ringkasan Pendapatan</h2>
        <ShareSummaryButton />
      </div>

      <FilterBar />
      {/* <p className="text-gray-500 mb-4">{renderDateRange()}</p> */}

      {summaryPerPs.map(item => (
        <div key={item.ps.id} className="bg-white shadow p-4 mb-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">PS {item.ps.nomor}</h3>
          <p>Durasi Aktif: {item.durasiTotal} menit</p>
          <p>Sewa: Rp {item.sewaTotal.toLocaleString()}</p>

          <p className="mt-2 font-bold">Item FNB:</p>
          {item.fnbItems.length === 0 ? (
            <p className="text-gray-500">- Tidak ada</p>
          ) : (
            <ul className="list-disc ml-6">
              {item.fnbItems.map((fnb, idx) => (
                <li key={idx}>{fnb.nama} x{fnb.jumlah} - Rp {fnb.subtotal.toLocaleString()}</li>
              ))}
            </ul>
          )}
          <p className="mt-2">Total FNB: Rp {item.fnbTotal.toLocaleString()}</p>
        </div>
      ))}

      {jajananOnly.length > 0 && (
        <div className="bg-white shadow p-4 mb-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Transaksi Jajanan Saja</h3>
          <p className="font-bold">Item FNB:</p>
          {Object.keys(jajananFnbItemsMap).length === 0 ? (
            <p className="text-gray-500">- Tidak ada</p>
          ) : (
            <ul className="list-disc ml-6">
              {Object.values(jajananFnbItemsMap).map((fnb, idx) => (
                <li key={idx}>{fnb.nama} x{fnb.jumlah} - Rp {fnb.subtotal.toLocaleString()}</li>
              ))}
            </ul>
          )}
          <p className="mt-2">Total FNB: Rp {jajananFnbTotal.toLocaleString()}</p>
        </div>
      )}

      <div className="border-t pt-4 mt-4">
        <h3 className="text-lg font-semibold mb-2">Total {filterMode?.toUpperCase() || 'HARI INI'}</h3>
        <p>Total Sewa PS: Rp {totalSewa.toLocaleString()}</p>
        <p>Total FNB: Rp {totalFnb.toLocaleString()}</p>
        <p className="font-bold text-green-600 text-xl mt-2">Total Pendapatan: Rp {totalAll.toLocaleString()}</p>
      </div>
    </div>
  );
}
