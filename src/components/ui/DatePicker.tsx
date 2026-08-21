/**
 * QA-037 / QA-039: Year/Month/Day dropdown picker so the user can NEVER see or
 * select a date outside [minDate, maxDate]. Year list is hard-capped; months
 * and days are filtered per year/month. Same logic as cms_front QA-020
 * (commit e71fd54, AuditLogs.tsx) — only the design tokens differ.
 *
 * - minDate / maxDate are YYYY-MM-DD strings (inclusive bounds).
 * - When `minDate` is `null` (e.g. account creation date unknown), the lower
 *   bound defaults to `maxDate` (today) — never silently widens to a year.
 * - onOutOfRange fires when a clamp pushes the value back into range; useful
 *   for surfacing "Start date cannot be before account creation" toasts.
 */

const MONTHS = [
  { v: '01', l: 'January' },
  { v: '02', l: 'February' },
  { v: '03', l: 'March' },
  { v: '04', l: 'April' },
  { v: '05', l: 'May' },
  { v: '06', l: 'June' },
  { v: '07', l: 'July' },
  { v: '08', l: 'August' },
  { v: '09', l: 'September' },
  { v: '10', l: 'October' },
  { v: '11', l: 'November' },
  { v: '12', l: 'December' },
];

function daysInMonth(year: number, month1to12: number): number {
  // month is 1..12
  return new Date(year, month1to12, 0).getDate();
}

function rangeForDate(
  ymd: string | null,
): { year?: number; minMonth?: number; maxMonth?: number; minDay?: number; maxDay?: number } {
  if (!ymd) return {};
  const [y, m, d] = ymd.split('-').map((s) => parseInt(s, 10));
  return { year: y, minMonth: m, maxMonth: m, minDay: d, maxDay: d };
}

function clampYmd(value: string, minDate: string | null, maxDate: string): string {
  if (!value) return value;
  if (minDate && value < minDate) return minDate;
  if (value > maxDate) return maxDate;
  return value;
}

export interface DatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD or ''
  onChange: (next: string) => void;
  minDate: string | null;
  maxDate: string;
  onOutOfRange?: (kind: 'min' | 'max') => void;
  className?: string;
}

export function DatePicker({ label, value, onChange, minDate, maxDate, onOutOfRange, className }: DatePickerProps) {
  const minInfo = minDate ? rangeForDate(minDate) : {};
  const maxInfo = rangeForDate(maxDate);
  const minYear = minInfo.year ?? maxInfo.year! - 100;
  const maxYear = maxInfo.year!;

  const safeValue = clampYmd(value, minDate, maxDate);
  const hasValue = !!safeValue;
  const selYear = hasValue ? parseInt(safeValue.slice(0, 4), 10) : minYear;
  const selMonth = hasValue ? parseInt(safeValue.slice(5, 7), 10) : (minInfo.minMonth ?? 1);
  const selDay = hasValue ? parseInt(safeValue.slice(8, 10), 10) : 1;

  const yearOptions: number[] = [];
  for (let y = minYear; y <= maxYear; y++) yearOptions.push(y);

  const monthMinForYear = selYear === minInfo.year ? (minInfo.minMonth ?? 1) : 1;
  const monthMaxForYear = selYear === maxInfo.year ? (maxInfo.maxMonth ?? 12) : 12;
  const monthOptions = MONTHS.filter((m) => {
    const mv = parseInt(m.v, 10);
    return mv >= monthMinForYear && mv <= monthMaxForYear;
  });

  const dayMin = selYear === minInfo.year && selMonth === minInfo.minMonth ? (minInfo.minDay ?? 1) : 1;
  const dayMax = selYear === maxInfo.year && selMonth === maxInfo.maxMonth ? (maxInfo.maxDay ?? daysInMonth(selYear, selMonth)) : daysInMonth(selYear, selMonth);
  const dayOptions: number[] = [];
  for (let d = dayMin; d <= dayMax; d++) dayOptions.push(d);

  const setYmd = (y: number, m: number, d: number) => {
    const ymd = `${y.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    onChange(ymd);
  };

  const onYearChange = (raw: string) => {
    const newYear = parseInt(raw, 10);
    const newMonthMin = newYear === minInfo.year ? (minInfo.minMonth ?? 1) : 1;
    const newMonthMax = newYear === maxInfo.year ? (maxInfo.maxMonth ?? 12) : 12;
    const m = Math.min(Math.max(selMonth, newMonthMin), newMonthMax);
    const dim = daysInMonth(newYear, m);
    const newDayMin = newYear === minInfo.year && m === minInfo.minMonth ? (minInfo.minDay ?? 1) : 1;
    const newDayMax = newYear === maxInfo.year && m === maxInfo.maxMonth ? (maxInfo.maxDay ?? dim) : dim;
    const d = Math.min(Math.max(selDay, newDayMin), newDayMax);
    const candidate = `${newYear.toString().padStart(4, '0')}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    const finalValue = clampYmd(candidate, minDate, maxDate);
    if (finalValue !== candidate && onOutOfRange) {
      onOutOfRange(finalValue < (minDate || '') ? 'min' : 'max');
    }
    onChange(finalValue);
  };

  const onMonthChange = (raw: string) => {
    const newMonth = parseInt(raw, 10);
    const dim = daysInMonth(selYear, newMonth);
    const newDayMin = selYear === minInfo.year && newMonth === minInfo.minMonth ? (minInfo.minDay ?? 1) : 1;
    const newDayMax = selYear === maxInfo.year && newMonth === maxInfo.maxMonth ? (maxInfo.maxDay ?? dim) : dim;
    const d = Math.min(Math.max(selDay, newDayMin), newDayMax);
    setYmd(selYear, newMonth, d);
  };

  const onDayChange = (raw: string) => {
    setYmd(selYear, selMonth, parseInt(raw, 10));
  };

  const selectClass =
    'px-3 py-2 bg-white border border-[#e2e8f0] rounded-[8px] text-sm text-[#0f172a] focus:outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/20 transition-all';

  return (
    <div className={`flex-1 space-y-1.5 min-w-0 ${className ?? ''}`}>
      {label && (
        <div className="flex items-center pl-1">
          <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">{label}</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <select className={selectClass + ' flex-1 min-w-0'} value={selYear} onChange={(e) => onYearChange(e.target.value)} aria-label={`${label ?? 'date'} year`}>
          {yearOptions.map((y) => (<option key={y} value={y}>{y}</option>))}
        </select>
        <select className={selectClass + ' flex-1 min-w-0'} value={selMonth.toString().padStart(2, '0')} onChange={(e) => onMonthChange(e.target.value)} aria-label={`${label ?? 'date'} month`} disabled={monthOptions.length === 0}>
          {monthOptions.length === 0 ? (<option value="">-</option>) : (monthOptions.map((m) => (<option key={m.v} value={m.v}>{m.l}</option>)))}
        </select>
        <select className={selectClass + ' flex-1 min-w-0'} value={selDay.toString().padStart(2, '0')} onChange={(e) => onDayChange(e.target.value)} aria-label={`${label ?? 'date'} day`} disabled={dayOptions.length === 0}>
          {dayOptions.length === 0 ? (<option value="">-</option>) : (dayOptions.map((d) => (<option key={d} value={d.toString().padStart(2, '0')}>{d}</option>)))}
        </select>
      </div>
    </div>
  );
}