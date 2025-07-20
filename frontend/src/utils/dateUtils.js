export const formatDateRange = (selectedDate, filterMode) => {
  if (!selectedDate) return 'Semua Waktu';

  const date = new Date(selectedDate);

  const formatTanggal = (tanggal) => {
    return tanggal.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (filterMode === 'harian') {
    return formatTanggal(date);
  }

  if (filterMode === 'mingguan') {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1); // Senin
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Minggu

    return `${formatTanggal(start)} - ${formatTanggal(end)}`;
  }

  if (filterMode === 'bulanan') {
    return date.toLocaleDateString('id-ID', {
      month: 'long',
      year: 'numeric',
    });
  }

  return formatTanggal(date);
};