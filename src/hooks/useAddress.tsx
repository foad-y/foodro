import useSWR from "swr";
import { fetcher, Pagination } from "./useProduct";

export interface Address {
  _id: string;
  region: string;
  neighborhood: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  addressId?: string
}

export interface AddressesResponse {
  data: Address[];
  pagination: Pagination;
}

interface UseAddressesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useAddresses = ({
  page = 1,
  limit = 10,
  search = "",
}: UseAddressesParams = {}) => {
  const query = `/address?page=${page}&limit=${limit}&search=${search}`;

  const { data, error, isLoading, mutate } = useSWR<AddressesResponse>(
    query,
    fetcher,
    {
      keepPreviousData: true,
    }
  );

  return {
    addresses: data?.data ?? [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutateAddresses: mutate,
  };
};