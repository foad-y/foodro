import useSWR from "swr";
import { fetcher } from "./useProduct";

export interface Category {
  categories: CategoryItem[]
  message?: string;
}

export interface CategoryItem {
  createdAt: string
  created_at: string
  img: string
  name: string
  updatedAt: string
  _id: string
}

export const useCategories = () => {
  const { data, error, isLoading, mutate } = useSWR<Category>(
    "/product/category",
    fetcher
  );

  return {
    categories: data?.categories,
    isLoading,
    isError: error,
    mutateCategories: mutate,
  };
};
