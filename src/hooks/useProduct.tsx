import useSWR from "swr";
import axiosInstance from "../lib/axiosInstance";

export interface ProductsResponse {
  data: Product[];
  pagination: Pagination;
}

export interface Pagination {
  limit: number;
  page: number;
  total: number;
  totalPages: number; // اصلاح شد (جمع بسته)
}

export interface Product {
  _id: string;
  img : string
  name: string;
  price: number;
  category: Category;
  // product_ingredients: Ingredient[];
}

export interface Ingredient {
  price: number;
  name: string;
  amamount: number;
}

export interface Category {
  name: string;
  img: string;
  _id: string;
}

interface UseProductsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const fetcher = async (url: string) => {
  const token = localStorage.getItem("authToken");

  const res = await axiosInstance.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};

export const useProducts = ({
  page = 1,
  limit = 10,
  search = "",
}: UseProductsParams = {}) => {
  const query = `/product?page=${page}&limit=${limit}&search=${search}`;

  const { data, error, isLoading, mutate } = useSWR<ProductsResponse>(
    query,
    fetcher
  );

  return {
    products: data?.data ?? [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutateProducts: mutate,
  };
};