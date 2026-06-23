import { useState, useEffect } from "react";
import moment from "jalali-moment";
import { Calendar, Clock } from "lucide-react";

interface PersianClockProps {
  className?: string;
}

const PersianClock: React.FC<PersianClockProps> = ({ className }) => {
  const [now, setNow] = useState(moment());

  useEffect(() => {
    const interval = setInterval(() => setNow(moment()), 1000);
    return () => clearInterval(interval);
  }, []);

  const persianDate = now.format("jYYYY/jMM/jDD");
  const persianTime = now.format("HH:mm:ss");

  return (
    <div className={`flex gap-3 items-center ${className || ""}`}>
      {/* باکس تاریخ */}
      <span className="hidden lg:flex items-center text-secondarytext px-3 py-1.5 rounded-lg bg-tertiary border border-border text-xs lg:text-sm transition-all hover:border-primary/30 hover:shadow-sm">
        <span className="ml-2 text-primary">
          <Calendar className="w-4 h-4" />
        </span>
        <span className="font-medium ml-1">تاریخ:</span>
        <span className="text-primarytext font-bold" dir="ltr">
          {persianDate}
        </span>
      </span>

      {/* باکس ساعت */}
      <span className="hidden lg:flex items-center text-secondarytext px-3 py-1.5 rounded-lg bg-tertiary border border-border text-xs lg:text-sm transition-all hover:border-primary/30 hover:shadow-sm">
        <span className="ml-2 text-primary">
          <Clock className="w-4 h-4" />
        </span>
        <span className="font-medium ml-1">ساعت:</span>
        {/* استفاده از min-w برای جلوگیری از پرش هدر هنگام تغییر ثانیه‌ها */}
        <span className="text-primarytext font-bold min-w-16.25 text-center inline-block" dir="ltr">
          {persianTime}
        </span>
      </span>
    </div>
  );
};

export default PersianClock;