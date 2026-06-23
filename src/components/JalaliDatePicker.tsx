import { useState, useEffect } from "react";
import moment from "jalali-moment";

interface Props {
  value?: string; // ISO string (Gregorian)
  onChange: (dateIso: string) => void;
}

const JalaliDatePicker: React.FC<Props> = ({ value, onChange }) => {
  const today = moment();

  // مقداردهی اولیه: internalDate is a moment instance (Gregorian) but jalali methods accessible
  const [internalDate, setInternalDate] = useState(() => {
    if (value) {
      const m = moment(value);
      return m.isValid() ? m : today;
    }
    return today;
  });

  // همگام‌سازی با تغییر value از بیرون (value is ISO)
  useEffect(() => {
    if (value) {
      const newDate = moment(value);
      if (newDate.isValid() && !newDate.isSame(internalDate, "day")) {
        setInternalDate(newDate);
      }
    }
  }, [value]);

  const year = internalDate.jYear();
  const month = internalDate.jMonth() + 1;
  const day = internalDate.jDate();

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value, 10);
    updateDate(newYear, month, day);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value, 10);
    updateDate(year, newMonth, day);
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDay = parseInt(e.target.value, 10);
    updateDate(year, month, newDay);
  };

  const updateDate = (newYear: number, newMonth: number, newDay: number) => {
    // اعتبارسنجی و محدود کردن روز
    const daysInMonth = moment.jDaysInMonth(newYear, newMonth - 1);
    const finalDay = Math.min(newDay, daysInMonth);

    const jalaliStr = `${newYear}/${newMonth}/${finalDay}`;
    // parse jalali and convert to gregorian moment
    const newDate = moment.from(jalaliStr, "fa", "jYYYY/jMM/jDD");

    if (newDate.isValid()) {
      setInternalDate(newDate);
      // emit ISO (gregorian)
      onChange(newDate.toDate().toISOString());
    }
  };

  // تعداد روزهای ماه جاری
  const maxDay = moment.jDaysInMonth(year, month - 1);

  // تولید لیست سال‌ها (از 20 سال قبل تا 20 سال بعد)
  const currentYear = today.jYear();
  const years = Array.from({ length: 71 }, (_, i) => currentYear - 70 + i);

  return (
    <div className="flex gap-2">
      {/* year */}
      <select
        className="bg-gray-200 text-xs px-2 py-1 rounded-lg"
        value={year}
        onChange={handleYearChange}
      >
        {years.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      {/* month */}
      <select
        className="bg-gray-200 text-xs px-2 py-1 rounded-lg"
        value={month}
        onChange={handleMonthChange}
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      {/* day */}
      <select
        className="bg-gray-200 text-xs px-2 py-1 rounded-lg"
        value={day}
        onChange={handleDayChange}
      >
        {Array.from({ length: maxDay }, (_, i) => i + 1).map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
    </div>
  );
};

export default JalaliDatePicker;