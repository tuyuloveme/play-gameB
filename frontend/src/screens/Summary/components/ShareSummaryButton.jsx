import React from 'react';
import { useHistoryStore } from '../../../store/historyStore';
import { usePsStore } from '../../../store/psStore';
import { useFnbStore } from '../../../store/fnbStore';
import { useFilterStore } from '../../../store/filterStore';
import { formatDateRange } from '../../../utils/dateUtils';
import { MdShare, MdContentCopy } from 'react-icons/md';

const ShareSummaryButton = () => {
  const historyList = useHistoryStore(state => state.historyList);
  const psList = usePsStore(state => state.psList);
  const fnbList = useFnbStore(state => state.fnbList);
  const selectedDate = useFilterStore(state => state.selectedDate);
  const filterMode = useFilterStore(state => state.filterMode);
  const setFilterMode = useFilterStore(state => state.setFilterMode);

  const hitungHarga = (menit) => {
    if (menit < 60) return Math.ceil(menit / 10) * 1000;
    const jam = Math.floor(menit / 60);
    const sisa = menit % 60;
    return jam * 5000 + (sisa === 0 ? 0 : Math.ceil(sisa / 10) * 1000);
  };

  const generateSummaryText = () => {
    const filtered = historyList.filter(item => {
      const date = new Date(Number(item.selesai));
      if (!selectedDate) return true;

      const sd = new Date(selectedDate);
      if (filterMode === 'harian') {
        return date.toDateString() === sd.toDateString();
      }
      if (filterMode === 'mingguan') {
        const start = new Date(sd);
        start.setDate(sd.getDate() - sd.getDay() + 1); // Senin
        const end = new Date(start);
        end.setDate(start.getDate() + 7); // Minggu berikutnya
        return date >= start && date < end;
      }
      if (filterMode === 'bulanan') {
        return date.getMonth() === sd.getMonth() && date.getFullYear() === sd.getFullYear();
      }
      return true;
    });

    if (filtered.length === 0) return '📊 Tidak ada data untuk dibagikan.';

    const psSummaryMap = {};
    const jajananMap = {};
    let totalSewa = 0;
    let totalFnb = 0;
    let jajananTotal = 0;

    for (const item of filtered) {
      const psId = item.psId;
      const fnbItems = Object.values(item.fnbItems || {});
      const detailFnb = fnbItems.map(fnbItem => {
        const f = fnbList.find(f => f.id === fnbItem.id);
        const nama = f?.nama || 'Unknown';
        const harga = f?.harga || 0;
        const jumlah = fnbItem.jumlah || 0;
        return {
          nama,
          jumlah,
          subtotal: jumlah * harga,
        };
      });

      const totalFnbThis = detailFnb.reduce((sum, i) => sum + i.subtotal, 0);

      if (psId === null) {
        totalFnb += totalFnbThis;
        jajananTotal += totalFnbThis;
        detailFnb.forEach(i => {
          jajananMap[i.nama] = (jajananMap[i.nama] || 0) + i.jumlah;
        });
        continue;
      }

      const ps = psList.find(p => p.id === psId);
      const psNomor = ps?.nomor ?? '-';
      const psNama = `PS ${psNomor}`;
      const durasi = Number(item.durasi);
      const tambahan = (item.tambahDurasiList || []).reduce((sum, d) => sum + (d.menit || 0), 0);
      const totalDurasi = durasi + tambahan;
      const hargaSewa = hitungHarga(totalDurasi);

      if (!psSummaryMap[psId]) {
        psSummaryMap[psId] = {
          nama: psNama,
          nomor: psNomor,
          durasi: 0,
          sewa: 0,
          fnb: 0,
          items: {},
        };
      }

      const psData = psSummaryMap[psId];
      psData.durasi += totalDurasi;
      psData.sewa += hargaSewa;
      psData.fnb += totalFnbThis;

      detailFnb.forEach(i => {
        psData.items[i.nama] = (psData.items[i.nama] || 0) + i.jumlah;
      });

      totalSewa += hargaSewa;
      totalFnb += totalFnbThis;
    }

    const dateLabel = formatDateRange(selectedDate, filterMode);
    let text = `📊 Ringkasan Pendapatan (${dateLabel})\n\n`;

    const psDataSorted = Object.values(psSummaryMap).sort((a, b) => Number(a.nomor) - Number(b.nomor));

    psDataSorted.forEach(ps => {
      text += `== ${ps.nama} ==\n`;
      text += `Durasi Aktif: ${ps.durasi} menit\n`;
      text += `Sewa: Rp ${ps.sewa.toLocaleString()}\n`;
      text += `Item FNB:\n`;
      if (Object.keys(ps.items).length === 0) {
        text += `- Tidak ada\n`;
      } else {
        Object.entries(ps.items).forEach(([nama, jumlah]) => {
          const fnbData = fnbList.find(f => f.nama === nama);
          const harga = fnbData?.harga || 0;
          const subtotal = harga * jumlah;
          text += `- ${nama} x${jumlah} - Rp ${subtotal.toLocaleString()}\n`;
        });
      }
      text += `Total FNB: Rp ${ps.fnb.toLocaleString()}\n\n`;
    });


    if (jajananTotal > 0) {
      text += `== Jajanan Saja ==\nItem FNB:\n`;
      Object.entries(jajananMap).forEach(([nama, jumlah]) => {
        text += `- ${nama} x${jumlah}\n`;
      });
      text += `Total FNB: Rp ${jajananTotal.toLocaleString()}\n\n`;
    }

    text += `== TOTAL ==\n`;
    text += `Sewa PS: Rp ${totalSewa.toLocaleString()}\n`;
    text += `FNB: Rp ${totalFnb.toLocaleString()}\n`;
    text += `Total Pendapatan: Rp ${(totalSewa + totalFnb).toLocaleString()}`;

    return text;
  };

  const handleShare = () => {
    const text = generateSummaryText();
    if (!text) return;

    if (navigator.share) {
      navigator.share({ text }).catch(err => {
        console.error('❌ Share gagal:', err.message);
        alert('❌ Gagal membagikan ringkasan');
      });
    } else {
      const encoded = encodeURIComponent(text);
      const waLink = `https://wa.me/?text=${encoded}`;
      window.open(waLink, '_blank');
    }
  };

  const handleCopy = () => {
    const text = generateSummaryText();
    navigator.clipboard.writeText(text)
      .then(() => alert('📋 Ringkasan berhasil disalin ke clipboard!'))
      .catch(err => alert('❌ Gagal menyalin ringkasan'));
  };

  return (
    <div className="flex items-center gap-2 mt-2">

      <button
        onClick={handleShare}
        title="Bagikan ke WhatsApp"
        className="p-2 rounded hover:bg-gray-100"
      >
        <MdShare size={22} />
      </button>
      <button
        onClick={handleCopy}
        title="Salin ke clipboard"
        className="p-2 rounded hover:bg-gray-100"
      >
        <MdContentCopy size={20} />
      </button>
    </div>
  );
};

export default ShareSummaryButton;