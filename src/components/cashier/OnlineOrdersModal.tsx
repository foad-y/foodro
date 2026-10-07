import React, { useEffect, useMemo, useState } from "react";
import moment from "jalali-moment";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  Bike,
  Calendar,
  Check,
  ChefHat,
  Clock,
  Globe,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  Power,
  RefreshCw,
  ShoppingBag,
  StickyNote,
  Store,
  User,
  X,
} from "lucide-react";
import {
  OnlineOrder,
  OnlineStatus,
  getApiError,
  setStoreOpen,
  updateOnlineOrderStatus,
  useOnlineHistory,
  useOnlineQueue,
  useStoreStatus,
} from "../../hooks/useOnlineOrders";
import { tomanToRial } from "../../utils/price";

interface PropsType {
  close: () => void;
}

type Tab = "new" | "progress" | "ready" | "history";

interface OrderAction {
  label: string;
  to: OnlineStatus;
  tone: "success" | "primary" | "danger";
  needNote?: boolean;
  icon?: React.ReactNode;
}

const STATUS_STYLE: Record<string, string> = {
  paid: "bg-amber-100 text-amber-700",
  accepted: "bg-blue-100 text-blue-700",
  preparing: "bg-indigo-100 text-indigo-700",
  ready: "bg-emerald-100 text-emerald-700",
  out_for_delivery: "bg-cyan-100 text-cyan-700",
  delivered: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
  expired: "bg-tertiary text-secondarytext",
  payment_failed: "bg-tertiary text-secondarytext",
};

const TONE_STYLE: Record<OrderAction["tone"], string> = {
  success: "bg-success text-white hover:brightness-95",
  primary: "bg-primary text-white hover:brightness-95",
  danger: "bg-white text-error border border-error hover:bg-error hover:text-white",
};

const QUICK_REASONS = ["مواد اولیه تمام شده", "خارج از محدوده ارسال", "درخواست مشتری", "مشکل در آماده‌سازی"];

// دکمه‌های مجاز برای هر وضعیت (مطابق ماشین حالت بک)
const actionsFor = (order: OnlineOrder): OrderAction[] => {
  const cancel: OrderAction = { label: "لغو سفارش", to: "cancelled", tone: "danger", needNote: true };
  switch (order.onlineStatus) {
    case "paid":
      return [
        { label: "پذیرش سفارش", to: "accepted", tone: "success", icon: <Check className="w-4 h-4" /> },
        { label: "رد سفارش", to: "rejected", tone: "danger", needNote: true },
      ];
    case "accepted":
      return [
        { label: "شروع آماده‌سازی", to: "preparing", tone: "primary", icon: <ChefHat className="w-4 h-4" /> },
        cancel,
      ];
    case "preparing":
      return [
        { label: "آماده شد", to: "ready", tone: "success", icon: <PackageCheck className="w-4 h-4" /> },
        cancel,
      ];
    case "ready":
      return [
        order.type === "delivery"
          ? { label: "تحویل به پیک", to: "out_for_delivery", tone: "primary", icon: <Bike className="w-4 h-4" /> }
          : { label: "تحویل به مشتری", to: "delivered", tone: "success", icon: <Check className="w-4 h-4" /> },
        cancel,
      ];
    case "out_for_delivery":
      return [{ label: "تحویل شد", to: "delivered", tone: "success", icon: <Check className="w-4 h-4" /> }];
    default:
      return [];
  }
};

const rial = (toman = 0) => `${tomanToRial(toman).toLocaleString("fa-IR")} ریال`;
const formatTime = (d: string) => moment(d).locale("fa").format("HH:mm");
const formatDate = (d: string) => moment(d).locale("fa").format("jYYYY jMMMM jDD");

const OnlineOrdersModal: React.FC<PropsType> = ({ close }) => {
  const [tab, setTab] = useState<Tab>("new");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [noteFor, setNoteFor] = useState<OrderAction | null>(null);
  const [note, setNote] = useState("");
  const [closing, setClosing] = useState(false);
  const [closeMessage, setCloseMessage] = useState("");

  const { orders, counts, refundPending, isLoading, error, mutateQueue } = useOnlineQueue();
  const { orders: history, isLoading: historyLoading, mutateHistory } = useOnlineHistory(tab === "history");
  const { store, mutateStore } = useStoreStatus();

  const grouped = useMemo(
    () => ({
      new: orders.filter((o) => o.onlineStatus === "paid"),
      progress: orders.filter((o) => ["accepted", "preparing"].includes(o.onlineStatus)),
      ready: orders.filter((o) => ["ready", "out_for_delivery"].includes(o.onlineStatus)),
    }),
    [orders],
  );

  const list = tab === "history" ? history : grouped[tab];
  const loadingList = tab === "history" ? historyLoading : isLoading;

  // سفارش انتخاب‌شده از آخرین داده‌ی سرور خوانده می‌شود تا بعد از هر poll به‌روز بماند
  const selected = useMemo(
    () => [...orders, ...history].find((o) => o.id === selectedId) ?? null,
    [orders, history, selectedId],
  );

  // اگر سفارش انتخاب‌شده در تب فعلی نیست (مثلاً بعد از تغییر وضعیت)، اولین سفارش تب انتخاب شود
  useEffect(() => {
    if (!list.some((o) => o.id === selectedId)) {
      setSelectedId(list[0]?.id ?? null);
      setNoteFor(null);
      setNote("");
    }
  }, [list, selectedId]);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "new", label: "جدید", count: counts.paid ?? 0 },
    { id: "progress", label: "در حال آماده‌سازی", count: (counts.accepted ?? 0) + (counts.preparing ?? 0) },
    { id: "ready", label: "آماده و ارسال", count: (counts.ready ?? 0) + (counts.out_for_delivery ?? 0) },
    { id: "history", label: "تاریخچه امروز" },
  ];

  const refresh = () => {
    mutateQueue();
    if (tab === "history") mutateHistory();
  };

  const runAction = async (order: OnlineOrder, to: OnlineStatus, reason?: string) => {
    setBusy(true);
    try {
      await updateOnlineOrderStatus(order.id, to, reason);
      toast.success(`سفارش ${order.trackingCode}: وضعیت به‌روز شد ✅`);
      setNoteFor(null);
      setNote("");
    } catch (err) {
      toast.error(`تغییر وضعیت انجام نشد ❌ ${getApiError(err)}`);
    } finally {
      setBusy(false);
      refresh(); // در هر حال از سرور بخوان (مثلاً اگر وضعیت هم‌زمان عوض شده باشد)
    }
  };

  const onAction = (order: OnlineOrder, action: OrderAction) => {
    if (action.needNote) {
      setNoteFor(action);
      setNote("");
      return;
    }
    runAction(order, action.to);
  };

  const toggleStore = async (open: boolean, message?: string) => {
    try {
      await toast.promise(setStoreOpen(open, message), {
        pending: open ? "در حال باز کردن فروشگاه..." : "در حال بستن فروشگاه...",
        success: open ? "فروشگاه باز شد ✅" : "فروشگاه بسته شد ✅",
        error: {
          render({ data }) {
            return `تغییر وضعیت فروشگاه انجام نشد ❌ ${getApiError(data)}`;
          },
        },
      });
      setClosing(false);
      setCloseMessage("");
      mutateStore();
    } catch {
      /* نوتیف خطا بالا نمایش داده شد */
    }
  };

  const itemsCount = (o: OnlineOrder) => o.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div dir="rtl" className="bg-white w-[95%] max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-6">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-primarytext" />
            <div>
              <h2 className="font-bold text-lg">سفارشات آنلاین</h2>
              <p className="text-sm text-secondarytext mt-1">هر ۵ ثانیه خودکار به‌روز می‌شود</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {closing ? (
              <div className="flex items-center gap-2 border border-error rounded-lg px-2 py-1">
                <input
                  autoFocus
                  value={closeMessage}
                  onChange={(e) => setCloseMessage(e.target.value)}
                  placeholder="پیام برای مشتری (اختیاری)"
                  className="text-xs outline-none w-48 px-1"
                />
                <button
                  onClick={() => toggleStore(false, closeMessage)}
                  className="text-xs bg-error text-white px-3 py-1 rounded-md cursor-pointer"
                >
                  بستن
                </button>
                <button onClick={() => setClosing(false)} className="text-xs text-secondarytext cursor-pointer">
                  انصراف
                </button>
              </div>
            ) : (
              <button
                onClick={() => (store?.isOpen ? setClosing(true) : toggleStore(true))}
                disabled={!store}
                className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg text-white transition cursor-pointer disabled:opacity-50 ${
                  store?.isOpen ? "bg-success" : "bg-error"
                }`}
                title={store?.isOpen ? "کلیک برای بستن فروشگاه" : "کلیک برای باز کردن فروشگاه"}
              >
                <Power className="w-4 h-4" />
                {store ? (store.isOpen ? "فروشگاه باز است" : "فروشگاه بسته است") : "..."}
              </button>
            )}
            <button
              onClick={refresh}
              className="text-secondarytext cursor-pointer hover:text-primarytext p-2 hover:bg-tertiary rounded-lg transition"
              title="به‌روزرسانی"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={close}
              className="text-secondarytext cursor-pointer hover:text-error text-xl p-2 hover:bg-tertiary rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap items-center gap-2 px-6 pb-3">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition cursor-pointer ${
                tab === t.id ? "bg-primary/10 text-primary font-bold border border-primary/20" : "bg-tertiary text-secondarytext border border-transparent hover:bg-primary/10"
              }`}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span
                  className={`text-[11px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center ${
                    t.id === "new" ? "bg-error text-white animate-pulse" : "bg-tertiary text-primarytext"
                  }`}
                >
                  {t.count.toLocaleString("fa-IR")}
                </span>
              )}
            </button>
          ))}
          {refundPending > 0 && (
            <span className="mr-auto flex items-center gap-1 text-xs text-error bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              {refundPending.toLocaleString("fa-IR")} سفارش نیازمند بازپرداخت دستی
            </span>
          )}
        </div>

        {error && (
          <div className="mx-6 mb-3 flex items-center gap-2 text-sm text-error bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <AlertTriangle className="w-4 h-4" />
            دریافت سفارش‌های آنلاین انجام نشد: {getApiError(error)}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden border-t border-border">
          {/* Sidebar - لیست سفارشات */}
          <div className="w-1/3 border-l border-border overflow-y-auto">
            {loadingList && list.length === 0 ? (
              <div className="p-8 text-center text-secondarytext">در حال بارگذاری...</div>
            ) : list.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-16 h-16 text-tertiarytext mx-auto mb-4" />
                <p className="text-secondarytext">
                  {tab === "new" ? "سفارش جدیدی وجود ندارد" : "سفارشی در این بخش نیست"}
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {list.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => {
                      setSelectedId(order.id);
                      setNoteFor(null);
                      setNote("");
                    }}
                    className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                      selectedId === order.id
                        ? "border-border bg-secondary/10"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    <div className="flex mb-2">
                      <div className="flex w-full justify-between">
                        <div className="flex flex-col gap-2 mb-1">
                          <span className="font-bold text-sm">شماره سفارش : {order.trackingCode}</span>
                          {order.customer?.name && (
                            <span className="text-xs text-secondarytext">
                              <User className="w-3 h-3 inline ml-1" />
                              {order.customer.name}
                            </span>
                          )}
                          <span className={`text-xs w-fit px-2 py-0.5 rounded-full ${STATUS_STYLE[order.onlineStatus] ?? ""}`}>
                            {order.statusText}
                          </span>
                        </div>
                        <div className="flex flex-col gap-3 text-xs text-secondarytext">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 ml-1" />
                            {formatDate(order.createdAt)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 ml-1" />
                            {formatTime(order.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-border border-t">
                      <div className="text-xs text-secondarytext flex items-center gap-2">
                        <span>
                          <ShoppingBag className="w-3 h-3 inline ml-1" />
                          {itemsCount(order).toLocaleString("fa-IR")} قلم
                        </span>
                        <span className="flex items-center">
                          {order.type === "delivery" ? <Bike className="w-3 h-3 ml-1" /> : <Store className="w-3 h-3 ml-1" />}
                          {order.type === "delivery" ? "پیک" : "بیرون‌بر"}
                        </span>
                      </div>
                      <span className="font-bold flex text-error">{rial(order.totals.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main Content - جزئیات سفارش انتخابی */}
          <div className="w-2/3 p-6 overflow-y-auto">
            {selected ? (
              <div className="space-y-6 bg-white rounded-lg">
                {/* هدر جزئیات */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">سفارش #{selected.trackingCode}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLE[selected.onlineStatus] ?? ""}`}>
                        {selected.statusText}
                      </span>
                      <span className="text-xs bg-tertiary text-secondarytext border border-border px-2 py-1 rounded-full flex items-center gap-1">
                        {selected.type === "delivery" ? <Bike className="w-3 h-3" /> : <Store className="w-3 h-3" />}
                        {selected.type === "delivery" ? "ارسال با پیک" : "بیرون‌بر"}
                      </span>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-secondarytext">تاریخ سفارش :</div>
                      <div className="font-bold text-primarytext">{formatDate(selected.createdAt)}</div>
                    </div>
                    <div className="text-sm text-secondarytext">{formatTime(selected.createdAt)}</div>
                  </div>
                </div>

                {/* اطلاعات مشتری */}
                <div className="bg-white p-4 border border-border rounded-xl">
                  <h4 className="font-bold mb-3 flex items-center">
                    <User className="w-4 h-4 ml-2" />
                    اطلاعات مشتری
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-secondarytext mb-1">نام مشتری</div>
                      <div className="font-bold text-primarytext">{selected.customer?.name ?? "-"}</div>
                    </div>
                    <div>
                      <div className="text-secondarytext mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        تلفن
                      </div>
                      <div className="font-bold text-primarytext" dir="ltr" style={{ textAlign: "right" }}>
                        {selected.customer?.phone ?? "-"}
                      </div>
                    </div>
                    {selected.type === "delivery" && selected.deliveryAddress?.address && (
                      <div className="col-span-2">
                        <div className="text-secondarytext mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          آدرس {selected.deliveryAddress.title && `(${selected.deliveryAddress.title})`}
                        </div>
                        <div className="text-primarytext font-bold">{selected.deliveryAddress.address}</div>
                      </div>
                    )}
                    {selected.note && (
                      <div className="col-span-2">
                        <div className="text-secondarytext mb-1 flex items-center gap-1">
                          <StickyNote className="w-3 h-3" />
                          توضیحات مشتری
                        </div>
                        <div className="text-primarytext font-bold bg-amber-50 rounded-lg px-3 py-2">{selected.note}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* لیست محصولات */}
                <div>
                  <h4 className="font-bold mb-3 flex items-center">
                    <ShoppingBag className="w-4 h-4 ml-2" />
                    محصولات سفارش ({selected.items.length.toLocaleString("fa-IR")} قلم)
                  </h4>
                  <div className="space-y-3">
                    {selected.items.map((item, index) => (
                      <div key={index} className="p-3 border border-border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-tertiary rounded-lg flex items-center justify-center">
                              <ShoppingBag className="w-5 h-5 text-tertiarytext" />
                            </div>
                            <div>
                              <div className="font-bold text-primarytext">{item.name}</div>
                              <div className="text-sm text-secondarytext flex gap-2">
                                قیمت واحد:
                                <span className="text-error flex font-bold">{rial(item.unitPrice)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-error flex">{rial(item.unitPrice * item.quantity)}</div>
                            <div className="text-sm text-secondarytext">
                              {item.quantity.toLocaleString("fa-IR")} × {tomanToRial(item.unitPrice).toLocaleString("fa-IR")}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* خلاصه پرداخت */}
                <div className="bg-white border border-border p-4 rounded-xl">
                  <h4 className="font-bold mb-3">خلاصه پرداخت</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-primarytext">مجموع اقلام:</span>
                      <span className="text-primarytext">{itemsCount(selected).toLocaleString("fa-IR")} عدد</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primarytext">جمع کل:</span>
                      <span className="flex text-error font-bold">{rial(selected.totals.subtotal)}</span>
                    </div>
                    {selected.totals.deliveryCost > 0 && (
                      <div className="flex justify-between">
                        <span className="text-primarytext">هزینه پیک موتوری:</span>
                        <span className="flex text-error font-bold">{rial(selected.totals.deliveryCost)}</span>
                      </div>
                    )}
                    {selected.totals.discountAmount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-primarytext">تخفیف{selected.discount?.code && ` (${selected.discount.code})`}:</span>
                        <span className="flex text-error font-bold">{rial(selected.totals.discountAmount)}</span>
                      </div>
                    )}
                    <div className="pt-2 border-border border-t">
                      <div className="flex justify-between font-bold text-lg">
                        <span className="text-primarytext">مبلغ پرداخت‌شده:</span>
                        <span className="text-error flex">{rial(selected.totals.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* هشدارها */}
                {selected.payment?.refundRequired && (
                  <div className="flex items-start gap-2 text-sm bg-red-50 text-error border border-red-200 rounded-xl px-4 py-3">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>مبلغ این سفارش پرداخت شده و باید دستی به مشتری بازگردانده شود.</span>
                  </div>
                )}
                {selected.cancelReason && ["rejected", "cancelled"].includes(selected.onlineStatus) && (
                  <div className="text-sm text-error">دلیل: {selected.cancelReason}</div>
                )}

                {/* دلیل رد/لغو */}
                {noteFor && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                    <div className="text-sm font-bold text-error">دلیل «{noteFor.label}» را بنویسید (الزامی)</div>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_REASONS.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setNote(r)}
                          className="text-xs px-3 py-1 rounded-full bg-white border border-red-200 text-secondarytext hover:bg-red-100 cursor-pointer"
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    <input
                      autoFocus
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="دلیل..."
                      className="w-full text-sm border border-red-200 rounded-lg px-3 py-2 outline-none focus:border-error bg-white"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busy || note.trim().length < 3}
                        onClick={() => runAction(selected, noteFor.to, note)}
                        className="flex-1 bg-error text-white text-sm py-2 rounded-lg disabled:opacity-40 cursor-pointer"
                      >
                        تأیید {noteFor.label}
                      </button>
                      <button
                        type="button"
                        onClick={() => setNoteFor(null)}
                        className="px-5 text-sm py-2 rounded-lg bg-white border border-border cursor-pointer"
                      >
                        انصراف
                      </button>
                    </div>
                  </div>
                )}

                {/* اکشن‌های وضعیت */}
                {!noteFor && actionsFor(selected).length > 0 && (
                  <div className="flex gap-2">
                    {actionsFor(selected).map((a) => (
                      <button
                        key={a.to}
                        type="button"
                        disabled={busy}
                        onClick={() => onAction(selected, a)}
                        className={`${a.tone === "danger" ? "px-5" : "flex-1"} flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition disabled:opacity-50 cursor-pointer ${TONE_STYLE[a.tone]}`}
                      >
                        {a.icon}
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* تاریخچه وضعیت */}
                {selected.statusHistory?.length > 0 && (
                  <div className="bg-white border border-border p-4 rounded-xl">
                    <h4 className="font-bold mb-3">روند سفارش</h4>
                    <ul className="space-y-2 text-sm">
                      {selected.statusHistory.map((h, i) => (
                        <li key={i} className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-primarytext">
                            <span className="w-2 h-2 rounded-full bg-secondarytext" />
                            {h.statusText}
                            {h.note && <span className="text-xs text-secondarytext">({h.note})</span>}
                          </span>
                          <span className="text-xs text-secondarytext">{formatTime(h.at)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-tertiarytext">
                <Package className="w-16 h-16 mb-4" />
                <p className="text-lg mb-2">سفارشی انتخاب نشده</p>
                <p className="text-sm">برای مشاهده جزئیات، یک سفارش از لیست سمت راست انتخاب کنید</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4">
          <button
            onClick={close}
            className="w-full py-3 bg-error text-white rounded-xl hover:bg-red-700 transition font-medium cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnlineOrdersModal;
