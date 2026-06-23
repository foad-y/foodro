import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { usePosStore } from '../store/useProduct';

const LAST_CLEANUP_KEY = 'last_cleanup_date';

export function useAutoCleanup() {
  useEffect(() => {
    const runCleanup = () => {
      const state = useAuthStore.getState();
      const user = state.user;

      if (!user || user.role !== 'cashier') return;

      const today = new Date().toDateString();
      const lastCleanup = localStorage.getItem(LAST_CLEANUP_KEY);

      if (lastCleanup === today) return;

      // پاکسازی سفارشات از زوستند
      usePosStore.setState({
        orders: [],
        activeOrderId: null,
        cachedOrders: [],
        cachedDeleveryOrders: [],
      });

      // پاکسازی کش localStorage مربوط به سفارشات
      localStorage.removeItem('orders_cache');
      localStorage.removeItem('pos-store');

      // تاریخ پاکسازی را ذخیره کن
      localStorage.setItem(LAST_CLEANUP_KEY, today);

      // لاگ اوت کاربر
      state.logout();
    };

    // اجرا هنگام mount شدن
    runCleanup();

    // هر ۶۰ ثانیه یکبار چک کن
    const interval = setInterval(runCleanup, 60_000);

    return () => clearInterval(interval);
  }, []); // dependency array خالی - فقط یکبار mount اجرا می‌شود
}