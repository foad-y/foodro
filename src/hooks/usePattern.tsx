import useSWR from "swr";
import axiosInstance from "../lib/axiosInstance";
import { ingredientItem } from "./useIngredients";

export interface PatternResponse {
    message: string,
    ingredients: ingredientItem
    category_ingredients: Pattern[]
}

export interface Ingredient {
    _id: string,
    name: string,
    price: number,
    img: string
}

export interface Pattern {
    ingredient: Ingredient[]
    name: string;
    _id: string;
}

export interface Category {
    name: string;
    img: string;
    _id: string;
}

interface UsePatternParams {
    category: string;
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

export const usePattern = ({
    category,
}: UsePatternParams) => {
    const query = `/product/ingredient?category=${category}`;

    const { data, error, isLoading, mutate } = useSWR<PatternResponse>(
        query,
        fetcher
    );

    return {
        Pattern: data ?? {
            message: "",
            ingredients: {} as ingredientItem,
            category_ingredients: [],
        },
        isLoading,
        isError: error,
        mutatePattern: mutate,
    };
};