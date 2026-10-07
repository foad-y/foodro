import { useEffect, useRef } from "react";
import useSWR from "swr";
import { isAxiosError } from "axios";
import { toast } from "react-toastify";
import axiosInstance from "../lib/axiosInstance";
import { fetcher } from "./useProduct";

/* =========================
   Types
========================= */

export type OnlineStatus =
  | "pending_payment"
  | "payment_failed"
  | "expired"
  | "paid"
  | "accepted"
  | "rejected"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export interface OnlineOrderItem {
  product: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface OnlineOrder {
  _id: string;
  id: string;
  trackingCode: string;
  type: "delivery" | "takeaway";
  onlineStatus: OnlineStatus;
  statusText: string;
  items: OnlineOrderItem[];
  totals: {
    subtotal: number;
    discountAmount: number;
    deliveryCost: number;
    total: number;
  };
  discount?: { code: string; amount: number };
  deliveryAddress?: { title?: string; address?: string };
  note?: string;
  cancelReason?: string;
  createdAt: string;
  customer?: { _id: string; name: string; phone: string };
  payment?: {
    status: "pending" | "success" | "failed" | "refunded";
    amount: number;
    refundRequired?: boolean;
  };
  statusHistory: { status: OnlineStatus; statusText: string; at: string; note?: string }[];
}

export interface OnlineOrdersResponse {
  data: OnlineOrder[];
  counts: Record<string, number>;
  refundPending: number;
  serverTime: number;
}

export interface StoreStatus {
  isOpen: boolean;
  message: string;
  deliveryFee: number;
  minOrderAmount: number;
}

/* =========================
   Constants
========================= */

export const ACTIVE_STATUSES: OnlineStatus[] = [
  "paid",
  "accepted",
  "preparing",
  "ready",
  "out_for_delivery",
];

export const HISTORY_STATUSES: OnlineStatus[] = [
  "delivered",
  "rejected",
  "cancelled",
  "expired",
  "payment_failed",
];

// مدت بین دو بار خواندن صف سفارش‌ها (polling)
export const ONLINE_ORDERS_POLL_MS = 5000;

export const queueKey = `/order/online?status=${ACTIVE_STATUSES.join(",")}`;

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/* =========================
   Helpers
========================= */

// پیام خطای سرور (message + code) برای نمایش در نوتیف
export const getApiError = (err: unknown): string => {
  if (isAxiosError(err)) {
    const data = err.response?.data as { message?: string; error?: string } | undefined;
    if (data?.message) return data.message;
    if (err.response?.status === 404)
      return "سرویس سفارش آنلاین روی سرور فعال نیست (۴۰۴)";
    return err.message;
  }
  return err instanceof Error ? err.message : "خطای نامشخص";
};

let audioCtx: AudioContext | null = null;

// صدای کوتاه برای سفارش جدید
export const playNewOrderSound = () => {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = audioCtx ?? new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume();
    [880, 1175, 880].forEach((freq, i) => {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      const t = audioCtx!.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      osc.start(t);
      osc.stop(t + 0.17);
    });
  } catch {
    /* صدا اختیاری است */
  }
};

/* =========================
   Hooks
========================= */

// صف سفارش‌های آنلاین فعال؛ هر ۵ ثانیه به‌روز می‌شود
export const useOnlineQueue = (enabled = true) => {
  const { data, error, isLoading, mutate } = useSWR<OnlineOrdersResponse>(
    enabled ? queueKey : null,
    fetcher,
    {
      refreshInterval: ONLINE_ORDERS_POLL_MS,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    },
  );

  return {
    orders: data?.data ?? [],
    counts: data?.counts ?? {},
    refundPending: data?.refundPending ?? 0,
    isLoading,
    error,
    mutateQueue: mutate,
  };
};

// سفارش‌های امروزِ تمام‌شده/ردشده/لغوشده (فقط وقتی تب تاریخچه باز است)
export const useOnlineHistory = (enabled: boolean) => {
  const { data, error, isLoading, mutate } = useSWR<OnlineOrdersResponse>(
    enabled
      ? `/order/online?status=${HISTORY_STATUSES.join(",")}&from=${startOfToday()}`
      : null,
    fetcher,
    { refreshInterval: ONLINE_ORDERS_POLL_MS * 3 },
  );

  return {
    orders: [...(data?.data ?? [])].reverse(),
    isLoading,
    error,
    mutateHistory: mutate,
  };
};

export const useStoreStatus = () => {
  const { data, error, isLoading, mutate } = useSWR<StoreStatus>(
    "/store/status",
    fetcher,
    { refreshInterval: 15000 },
  );
  return { store: data, isLoading, error, mutateStore: mutate };
};

// اعلان سفارش جدید (نوتیف + صدا). یک بار در Header صندوق mount می‌شود.
export const useOnlineOrderAlerts = () => {
  const { orders, counts, error, mutateQueue } = useOnlineQueue();
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    const paidIds = orders.filter((o) => o.onlineStatus === "paid").map((o) => o.id);

    // اولین بار فقط لیست را به خاطر می‌سپاریم تا برای سفارش‌های قدیمی اعلان نیاید
    if (seen.current === null) {
      if (orders.length || !error) seen.current = new Set(paidIds);
      return;
    }

    const fresh = paidIds.filter((id) => !seen.current!.has(id));
    if (fresh.length) {
      playNewOrderSound();
      toast.info(
        fresh.length === 1
          ? "یک سفارش آنلاین جدید رسید 🔔"
          : `${fresh.length.toLocaleString("fa-IR")} سفارش آنلاین جدید رسید 🔔`,
      );
    }
    seen.current = new Set(paidIds);
  }, [orders, error]);

  return { newCount: counts.paid ?? 0, activeCount: orders.length, error, mutateQueue };
};

/* =========================
   Actions
========================= */

export const updateOnlineOrderStatus = async (
  id: string,
  status: OnlineStatus,
  note?: string,
) => {
  const res = await axiosInstance.patch<OnlineOrder>(`/order/${id}/status`, {
    status,
    note: note?.trim() || undefined,
  });
  return res.data;
};

export const setStoreOpen = async (isOpen: boolean, message?: string) => {
  const res = await axiosInstance.put<StoreStatus>("/store/status", {
    isOpen,
    ...(message !== undefined ? { message } : {}),
  });
  return res.data;
};
