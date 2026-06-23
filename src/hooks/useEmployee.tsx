import useSWR from "swr";
import { fetcher, Pagination } from "./useProduct";

export interface EmployeesResponse {
  data: Employee[];
  pagination: Pagination;
}

export interface Employee {
  createdAt: string;
  password: string;
  birthday: string;
  gender: string;
  name: string;
  phone: string;
  role: string;
  updatedAt: string;
  _id: string;
}

interface UseEmployeesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const useEmployees = ({
  page = 1,
  limit = 10,
  search = "",
}: UseEmployeesParams) => {
  const query = `/employees?page=${page}&limit=${limit}&search=${search}`;

  const { data, error, isLoading, mutate } = useSWR<EmployeesResponse>(
    query,
    fetcher
  );

  return {
    employees: data?.data ?? [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutateEmployees: mutate,
  };
};