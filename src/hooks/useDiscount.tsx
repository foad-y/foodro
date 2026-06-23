import useSWR from "swr";
import { fetcher, Pagination } from "./useProduct";
import axiosInstance from "../lib/axiosInstance";

/* =========================
   Types
========================= */

export interface Discount {
  _id: string;
  code: string;
  name: string;
  description?: string;
  type: "percent" | "fixed";
  value: number;
  maxAmount?: number;
  minOrderAmount?: number;
  totalAmount: number;
  usedAmount: number;
  allowedUsers: string[];
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountsResponse {
  data: Discount[];
  pagination: Pagination;
}

export interface VerifyDiscountResponse {
  valid: boolean;
  discount: {
    code: string;
    name: string;
    type: "percent" | "fixed";
    value: number;
    maxAmount?: number;
    minOrderAmount?: number;
    discountAmount: number;
    finalAmount: number;
  };
}

export interface CreateDiscountInput {
  code: string;
  name: string;
  description?: string;
  type: "percent" | "fixed";
  value: number;
  maxAmount?: number;
  minOrderAmount?: number;
  totalAmount?: number;
  expiresAt: string;
  isActive?: boolean;
  allowedUsers?: string[];
}

export interface UpdateDiscountInput {
  code?: string;
  name?: string;
  description?: string;
  type?: "percent" | "fixed";
  value?: number;
  maxAmount?: number;
  minOrderAmount?: number;
  totalAmount?: number;
  expiresAt?: string;
  isActive?: boolean;
  allowedUsers?: string[];
}

/* =========================
   Hook
========================= */

interface UseDiscountsParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
}

export const useDiscounts = ({
  page = 1,
  limit = 10,
  search = "",
  isActive,
}: UseDiscountsParams = {}) => {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search) params.set("search", search);
  if (isActive !== undefined && isActive !== "") params.set("isActive", isActive);

  const query = `/discounts?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<DiscountsResponse>(
    query,
    fetcher
  );

  return {
    discounts: data?.data ?? [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutateDiscounts: mutate,
  };
};

/* =========================
   CRUD Helpers
========================= */

export const createDiscount = async (input: CreateDiscountInput) => {
  const token = localStorage.getItem("authToken");
  const res = await axiosInstance.post("/discounts", input, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateDiscount = async (id: string, input: UpdateDiscountInput) => {
  const token = localStorage.getItem("authToken");
  const res = await axiosInstance.put(`/discounts/${id}`, input, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteDiscount = async (id: string) => {
  const token = localStorage.getItem("authToken");
  const res = await axiosInstance.delete(`/discounts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getDiscountById = async (id: string) => {
  const token = localStorage.getItem("authToken");
  const res = await axiosInstance.get(`/discounts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const verifyDiscount = async (
  code: string,
  orderAmount?: number
): Promise<VerifyDiscountResponse> => {
  const token = localStorage.getItem("authToken");
  const res = await axiosInstance.post(
    "/discounts/verify",
    { code, orderAmount },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};