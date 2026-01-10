'use client';

export default function YearSelector({ currentYear, availableYears }: { currentYear: number; availableYears: number[] }) {
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = parseInt(e.target.value, 10);
    window.location.href = `/?year=${year}`;
  };

  if (availableYears.length <= 1) return null;

  return (
    <div className="flex gap-2 items-center">
      <label className="text-sm font-medium">Year:</label>
      <select
        value={currentYear}
        onChange={handleYearChange}
        className="rounded-md border px-3 py-1 text-sm"
      >
        {availableYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}

