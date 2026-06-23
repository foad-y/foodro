import useSWR from "swr";
import { fetcher, Pagination } from "./useProduct";
import { CartItem, CustomerInfo } from "../store/useProduct";

export interface OrdersResponse {
  data: Orders[];
  page: number;
  pages: number;
  total: number;
}
export interface Custumer {
  name?: string;
  phone?: string;
  address?: string;
  gender?: string;
  birthday?: string;
  deliveryPrice?: number
  id?: string;
}

export interface Orders {
  cart: CartItem[];
  createdAt: string;
  customer: Custumer;
  customerDetails: CustomerInfo
  order_number: string;
  status: string;
  deliveryCost? : number
  discount?: {
    code: string;
    type: "percent" | "fixed";
    value: number;
    amount: number; // calculated amount applied to order
  } | null;
  id: string
  step: string;
  type: 'delivery' | 'hall' | 'takeaway'
  updatedAt: string;
  _id: string;
}

interface UseCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useOrders = ({
  page = 1,
  limit = 10,
  search = "",
}: UseCustomersParams = {}) => {
  const query = `/order/history?page=${page}&limit=${limit}&search=${search}`;

  const { data, error, isLoading, mutate } = useSWR<OrdersResponse>(
    query,
    fetcher
  );

  return {
    orders: data?.data ?? [],
    pagination: data,
    isLoading,
    isError: error,
    mutateOrders: mutate,
  };
};