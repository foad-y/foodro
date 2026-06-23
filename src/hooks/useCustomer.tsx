import useSWR from "swr";
import { fetcher, Pagination } from "./useProduct";

export interface CustomersResponse {
  data: Customer[];
  pagination: Pagination;
}

export interface Customer {
  createdAt: string;
  birthday: string;
  gender: string;
  name: string;
  phone: string;
  address: string;
  updatedAt: string;
  _id: string;
}

interface UseCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useCustomers = ({
  page = 1,
  limit = 10,
  search = "",
}: UseCustomersParams = {}) => {
  const query = `/customers?page=${page}&limit=${limit}&search=${search}`;

  const { data, error, isLoading, mutate } = useSWR<CustomersResponse>(
    query,
    fetcher
  );

  return {
    customers: data?.data ?? [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutateCustomers: mutate,
  };
};