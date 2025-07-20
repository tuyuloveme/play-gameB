// src/screens/Summary/components/FilterBar.jsx
import React, { useMemo } from 'react';
import { useFilterStore } from '../../../store/filterStore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const FilterBar = () => {
  const filterMode = useFilterStore(state => state.filterMode);
  const selectedDate = useFilterStore(state => state.selectedDate);
  const setFilterMode = useFilterStore(state => state.setFilterMode);

  const dateRangeLabel = useMemo(() => {
    const base = new Date(selectedDate || new Date());
    base.setHours(0, 0, 0, 0);

    if (filterMode === 'mingguan') {
      const start = new Date(base);
      start.setDate(start.getDate() - start.getDay() + 1); // Senin
      const end = new Date(start);
      end.setDate(start.getDate() + 6); // Minggu

      return `${format(start, 'd MMM', { locale: id })} – ${format(end, 'd MMM yyyy', { locale: id })}`;
    }

    if (filterMode === 'bulanan') {
      return format(base, 'MMMM yyyy', { locale: id });
    }

    // Default: Harian
    return format(base, 'EEEE, d MMMM yyyy', { locale: id });
  }, [filterMode, selectedDate]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
      <select
        value={filterMode}
        onChange={(e) => setFilterMode(e.target.value)}
        className="px-2 py-1 border rounded text-sm bg-white"
      >
        <option value="harian">Harian</option>
        <option value="mingguan">Mingguan</option>
        <option value="bulanan">Bulanan</option>
      </select>

      <span className="text-gray-600 text-sm">{dateRangeLabel}</span>
    </div>
  );
};

export default FilterBar;