import useSWR from 'swr';
import { fetcher } from './useProduct';

export interface DashboardSummary {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  uniqueCustomers: number;
}

export interface ByType {
  hall: number;
  takeaway: number;
  delivery: number;
  dine_in: number;
}

export interface DailyStatItem {
  date: string;
  orders: number;
  revenue: number;
  label: string;
}

export interface TopProduct {
  productId: string;
  name: string;
  price: number;
  img: string;
  totalSold: number;
  totalRevenue: number;
}

export interface HourlyStat {
  hour: number;
  count: number;
}

export interface DashboardStats {
  period: { from: number | null; to: number | null };
  summary: DashboardSummary;
  byType: ByType;
  dailyStats: DailyStatItem[];
  topProducts: TopProduct[];
  hourlyStats: HourlyStat[];
}

interface UseDashboardParams {
  from?: number | null;
  to?: number | null;
  types?: Array<'hall' | 'takeaway' | 'delivery'> | null | undefined;
}

export const useDashboard = ({ from, to, types }: UseDashboardParams = {}) => {
  let query = '/dashboard/stats';
  const params: string[] = [];
  if (from) params.push(`from=${from}`);
  if (to) params.push(`to=${to}`);
  if (types && types.length > 0) params.push(`types=${types.join(',')}`);
  if (params.length > 0) query += `?${params.join('&')}`;

  const { data, error, isLoading, mutate } = useSWR<DashboardStats>(query, fetcher);

  return {
    stats: data,
    isLoading,
    isError: error,
    refreshDashboard: mutate,
  };
};
