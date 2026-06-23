import { useMemo, useState } from 'react';
import { Clock3, Users, Printer, RefreshCw } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import PrintReceipt from './PrintReceipt';
import DatePicker from 'react-multi-date-picker';
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from 'react-date-object';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from "recharts";
import { toast } from 'react-toastify';

const formatPrice = (value: number) => new Intl.NumberFormat('fa-IR').format(value) + ' تومان';

const formatDateTime = (value: number | null) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));
};

export default function DashboardTab() {
  const [activeFilter, setActiveFilter] = useState("امروز");
  const [types, setTypes] = useState<"delivery" | "hall" | "takeaway" | ''>('')
  const [from, setFrom] = useState(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  });

  const [to, setTo] = useState(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date.toISOString();
  });

  const fromTimestamp = from ? new Date(from).getTime() : undefined;
  const toTimestamp = to ? new Date(to).getTime() : undefined;

  const { stats, isLoading, refreshDashboard } = useDashboard({
    from: fromTimestamp,
    to: toTimestamp,
    types: types
  });

  const periodLabel = useMemo(() => {
    if (stats?.period?.from && stats?.period?.to) {
      return `${formatDateTime(stats.period.from)} تا ${formatDateTime(stats.period.to)}`;
    }
    return 'امروز';
  }, [stats]);

  const buttonTypes = [
    { lable: 'همه', value: '' },
    { lable: "سالن", value: 'hall' },
    { lable: "پیک موتوری", value: 'delivery' },
    { lable: "بیرون بر", value: 'takeaway' }
  ];

  const quickFilters = [
    // ... (توابع فیلترهای شما بدون تغییر در منطق باقی ماندند)
    {
      label: "امروز",
      action: () => {
        setActiveFilter("امروز");
        const start = new Date(); start.setHours(0, 0, 0, 0);
        const end = new Date(); end.setHours(23, 59, 59, 999);
        setFrom(start.toISOString()); setTo(end.toISOString());
      },
    },
    {
      label: "دیروز",
      action: () => {
        setActiveFilter("دیروز");
        const start = new Date(); start.setDate(start.getDate() - 1); start.setHours(0, 0, 0, 0);
        const end = new Date(); end.setDate(end.getDate() - 1); end.setHours(23, 59, 59, 999);
        setFrom(start.toISOString()); setTo(end.toISOString());
      },
    },
    {
      label: "این هفته",
      action: () => {
        setActiveFilter("این هفته");
        const now = new Date();
        const start = new Date(now);
        const day = start.getDay(); 
        const diffToSaturday = day === 6 ? 0 : day === 0 ? 1 : day + 1;
        start.setDate(start.getDate() - diffToSaturday); start.setHours(0, 0, 0, 0);
        setFrom(start.toISOString()); setTo(now.toISOString());
      },
    },
    {
      label: "هفته گذشته",
      action: () => {
        setActiveFilter("هفته گذشته");
        const now = new Date();
        const currentWeekStart = new Date(now);
        const day = currentWeekStart.getDay(); 
        const diffToSaturday = day === 6 ? 0 : day === 0 ? 1 : day + 1;
        currentWeekStart.setDate(currentWeekStart.getDate() - diffToSaturday);
        currentWeekStart.setHours(0, 0, 0, 0);
        const start = new Date(currentWeekStart); start.setDate(start.getDate() - 7);
        const end = new Date(currentWeekStart); end.setMilliseconds(-1);
        setFrom(start.toISOString()); setTo(end.toISOString());
      },
    },
    {
      label: "ماه گذشته",
      action: () => {
        setActiveFilter("ماه گذشته");
        const nowPersian = new DateObject({ date: new Date(), calendar: persian, locale: persian_fa });
        const prevMonth = nowPersian.month.number === 1 ? 12 : nowPersian.month.number - 1;
        const year = nowPersian.month.number === 1 ? nowPersian.year - 1 : nowPersian.year;
        const startPersian = new DateObject({ calendar: persian, locale: persian_fa, year, month: prevMonth, day: 1 });
        const endPersian = new DateObject({ calendar: persian, locale: persian_fa, year, month: prevMonth, day: 1 });
        endPersian.toLastOfMonth();
        endPersian.set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
        setFrom(startPersian.toDate().toISOString()); setTo(endPersian.toDate().toISOString());
      },
    },
    {
      label: "امسال",
      action: () => {
        setActiveFilter("امسال");
        const nowPersian = new DateObject({ date: new Date(), calendar: persian, locale: persian_fa });
        const startPersian = new DateObject({ calendar: persian, locale: persian_fa, year: nowPersian.year, month: 1, day: 1 });
        setFrom(startPersian.toDate().toISOString()); setTo(new Date().toISOString());
      },
    },
    {
      label: "سال گذشته",
      action: () => {
        setActiveFilter("سال گذشته");
        const nowPersian = new DateObject({ date: new Date(), calendar: persian, locale: persian_fa });
        const startPersian = new DateObject({ calendar: persian, locale: persian_fa, year: nowPersian.year - 1, month: 1, day: 1 });
        const endPersian = new DateObject({ calendar: persian, locale: persian_fa, year: nowPersian.year - 1, month: 12, day: 29 });
        endPersian.toLastOfMonth();
        setFrom(startPersian.toDate().toISOString()); setTo(endPersian.toDate().toISOString());
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-secondary">داشبورد مدیریت</h2>
          <p className="text-secondarytext font-medium mt-2">آمار فروش، مشتریان و محصولات پرفروش</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => refreshDashboard?.()}
            className="flex cursor-pointer items-center gap-2 bg-white border border-border text-primarytext px-6 py-3 rounded-xl hover:shadow-md hover:border-primary hover:text-primary transition-all font-bold"
          >
            <RefreshCw className="w-5 h-5" />
            تازه‌سازی آمار
          </button>
          {stats && <PrintReceipt stats={stats} periodLabel={periodLabel} />}
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-3xl border border-border shadow-sm p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Clock3 className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-secondary">بازه زمانی گزارش</h3>
        </div>
        <div className='flex flex-col lg:flex-row justify-between gap-4'>
          <div className="flex flex-wrap gap-2 mb-5">
            {quickFilters.map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={filter.action}
                className={`px-5 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-bold border ${
                  activeFilter === filter.label 
                    ? 'bg-linear-to-r from-gradiantbtnfrom to-gradiantbtnto text-white border-transparent shadow-md shadow-primary/30' 
                    : 'bg-tertiary text-secondarytext border-border hover:border-primary hover:text-primary hover:bg-primary/5'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className='flex flex-wrap gap-2 mb-5'>
            {buttonTypes.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setTypes(item.value as any)}
                className={`px-5 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-bold border ${
                  types === item.value 
                    ? 'bg-secondary text-white border-transparent shadow-md' 
                    : 'bg-tertiary text-secondarytext border-border hover:border-secondary hover:text-secondary'
                }`}
              >
                {item.lable}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="group">
            <label className="block text-sm font-bold text-secondary mb-2">از تاریخ</label>
            <DatePicker
              calendar={persian}
              locale={persian_fa}
              maxDate={to ? new Date(to) : undefined}
              value={from}
              onChange={(date) => {
                if (!date) return;
                const newDate = date.toDate();
                if (to && newDate > new Date(to)) {
                  toast.error("تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد");
                  return;
                }
                setFrom(date.toDate().toISOString());
              }}
              format="YYYY/MM/DD HH:mm"
              plugins={[<TimePicker position="bottom" hideSeconds />]}
              inputClass="w-full rounded-xl border-2 border-border px-4 py-3.5 bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 text-primarytext font-medium transition-all"
              containerClassName="w-full"
              calendarPosition="bottom-right"
              fixMainPosition
              placeholder="انتخاب تاریخ و ساعت شروع"
            />
          </div>

          <div className="group">
            <label className="block text-sm font-bold text-secondary mb-2">تا تاریخ</label>
            <DatePicker
              calendar={persian}
              locale={persian_fa}
              minDate={from ? new Date(from) : undefined}
              value={to}
              onChange={(date) => {
                if (!date) return;
                const newDate = date.toDate();
                if (from && newDate < new Date(from)) {
                  toast.error("تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد");
                  return;
                }
                setTo(date.toDate().toISOString());
              }}
              format="YYYY/MM/DD HH:mm"
              plugins={[<TimePicker position="bottom" hideSeconds />]}
              inputClass="w-full rounded-xl border-2 border-border px-4 py-3.5 bg-white focus:border-primary focus:ring-4 focus:ring-primary/20 text-primarytext font-medium transition-all"
              containerClassName="w-full"
              calendarPosition="bottom-right"
              fixMainPosition
              placeholder="انتخاب تاریخ و ساعت پایان"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-6 border-t border-border">
          <span className="text-sm font-medium text-tertiarytext">
            داده‌ها براساس بازه انتخابی بروزرسانی می‌شوند
          </span>
          <span className="bg-primary/10 text-primary border border-primary/20 px-5 py-2 rounded-xl text-sm font-bold">
            {periodLabel}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl border border-border shadow-sm p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
          <p className="text-sm font-bold text-secondarytext mb-3">تعداد سفارشات</p>
          <h3 className="text-4xl font-extrabold text-secondary">
            {stats ? new Intl.NumberFormat('fa-IR').format(stats.summary.totalOrders) : '—'}
          </h3>
        </div>

        <div className="bg-white rounded-3xl border border-border shadow-sm p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-300 relative overflow-hidden">
          <div className="absolute -left-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
          <p className="text-sm font-bold text-secondarytext mb-3 relative z-10">مجموع درآمد</p>
          <h3 className="text-4xl font-extrabold text-primary relative z-10">
            {stats ? formatPrice(stats.summary.totalRevenue) : '—'}
          </h3>
        </div>

        <div className="bg-white rounded-3xl border border-border shadow-sm p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
          <p className="text-sm font-bold text-secondarytext mb-3">مشتریان یکتا</p>
          <h3 className="text-4xl font-extrabold text-secondary">
            {stats ? new Intl.NumberFormat('fa-IR').format(stats.summary.uniqueCustomers) : '—'}
          </h3>
        </div>

        <div className="bg-white rounded-3xl border border-border shadow-sm p-6 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
          <p className="text-sm font-bold text-secondarytext mb-3">میانگین ارزش هر سفارش</p>
          <h3 className="text-4xl font-extrabold text-secondary">
            {stats ? new Intl.NumberFormat('fa-IR').format(stats.summary.avgOrderValue) : '—'}
          </h3>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white rounded-3xl border border-border shadow-sm p-6 lg:p-8">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-secondary">نمودار عملکرد روزانه</h3>
          <p className="text-sm font-medium text-secondarytext mt-2">روند درآمد و تعداد سفارشات در بازه انتخابی</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-tertiarytext">
             <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin mb-4"></div>
             <p className="font-bold">در حال بارگذاری نمودارها...</p>
          </div>
        ) : stats?.dailyStats?.length ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Revenue Chart */}
            <div className="bg-tertiary/30 rounded-2xl p-6 pb-10 h-96 border border-border">
              <h3 className="mb-6 text-lg font-bold text-secondary flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                گزارش فروش (تومان)
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailyStats}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-border)" />
                  <XAxis
                    dataKey="label"
                    tickFormatter={(value) => new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric" }).format(new Date(value))}
                    tickLine={false} tick={{ fill: 'var(--color-secondarytext)', fontSize: 12, fontWeight: 'bold' }} tickMargin={10}
                  />
                  <YAxis tickLine={false} tick={{ fill: 'var(--color-secondarytext)', fontSize: 12, fontWeight: 'bold' }} tickMargin={30} />
                  <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid var(--color-border)", boxShadow: "0 10px 30px rgba(0,0,0,.08)", fontWeight: 'bold' }} />
                  <Area
                    type="monotone" dataKey="revenue" name="فروش"
                    stroke="var(--color-primary)" strokeWidth={4} fill="url(#revenueGradient)"
                    dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "var(--color-primary)" }}
                    activeDot={{ r: 8, stroke: "var(--color-primary)", strokeWidth: 2, fill: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Orders Chart */}
            <div className="bg-tertiary/30 rounded-2xl p-6 pb-10 h-96 border border-border">
              <h3 className="mb-6 text-lg font-bold text-secondary flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-warning"></span>
                گزارش تعداد سفارش
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailyStats}>
                  <defs>
                    <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-warning)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--color-warning)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-border)" />
                  <XAxis
                    dataKey="label"
                    tickFormatter={(value) => new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric" }).format(new Date(value))}
                    tickLine={false} tick={{ fill: 'var(--color-secondarytext)', fontSize: 12, fontWeight: 'bold' }} tickMargin={10}
                  />
                  <YAxis tickLine={false} tick={{ fill: 'var(--color-secondarytext)', fontSize: 12, fontWeight: 'bold' }} tickMargin={20} />
                  <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid var(--color-border)", boxShadow: "0 10px 30px rgba(0,0,0,.08)", fontWeight: 'bold' }} />
                  <Area
                    type="monotone" dataKey="orders" name="سفارش"
                    stroke="var(--color-warning)" strokeWidth={4} fill="url(#ordersGradient)"
                    dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "var(--color-warning)" }}
                    activeDot={{ r: 8, stroke: "var(--color-warning)", strokeWidth: 2, fill: "#fff" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-tertiarytext font-bold">هیچ داده‌ای در این بازه زمانی وجود ندارد</div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-3xl border border-border shadow-sm p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary/10 p-2 rounded-xl">
              <Printer className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-secondary">پرفروش‌ترین محصولات</h3>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-tertiarytext font-bold">در حال بارگذاری...</div>
          ) : stats?.topProducts?.length ? (
            <div className="max-h-72 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {stats.topProducts.map((product, index) => (
                <div key={product.productId} className="rounded-2xl border border-border bg-tertiary/30 p-4 hover:bg-tertiary hover:border-primary/30 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center font-bold text-secondarytext group-hover:text-primary group-hover:border-primary transition-colors">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-secondary text-base">{product.name}</h4>
                      <p className="text-xs font-medium text-secondarytext mt-1">
                        فروش: {new Intl.NumberFormat('fa-IR').format(product.totalSold)} عدد
                      </p>
                    </div>
                  </div>
                  <span className="font-extrabold text-primary text-left bg-primary/5 px-3 py-1.5 rounded-lg">
                    {formatPrice(product.totalRevenue)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-tertiarytext font-bold">محصولی یافت نشد</div>
          )}
        </div>

        {/* Order Types */}
        <div className="bg-white rounded-3xl border border-border shadow-sm p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-secondary/10 p-2 rounded-xl">
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-secondary">تفکیک نوع سفارش</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {['hall', 'takeaway', 'delivery', 'dine_in'].map((type) => {
              const configMap: Record<string, { label: string, color: string }> = {
                'hall': { label: 'سالن', color: 'text-primary' },
                'takeaway': { label: 'بیرون‌بر', color: 'text-warning' },
                'delivery': { label: 'پیک موتوری', color: 'text-success' },
                'dine_in': { label: 'داخل سالن', color: 'text-secondary' },
              };
              
              const current = configMap[type];
              const count = stats ? stats.byType[type as keyof typeof stats.byType] ?? 0 : 0;

              return (
                <div key={type} className="rounded-2xl border border-border bg-tertiary/30 p-6 text-center hover:shadow-md transition-all">
                  <p className="text-sm font-bold text-secondarytext mb-2">{current.label}</p>
                  <p className={`text-4xl font-extrabold ${current.color}`}>
                    {new Intl.NumberFormat('fa-IR').format(count)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}