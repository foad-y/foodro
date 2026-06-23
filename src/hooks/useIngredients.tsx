import useSWR from "swr";
import { fetcher } from "./useProduct";

export interface Ingredient {
  ingredients : ingredientItem[];
  message : string;
}

export interface ingredientItem {
  createdAt : string; 
  default : boolean;
  name : string;
  price : number;
  category : string | null;
  removable : boolean;
  updatedAt : string;
  _id: string;
  img : string
}

export const useIngredients = () => {
  const { data, error, isLoading, mutate } = useSWR<Ingredient>(
    "/product/ingredient",
    fetcher
  );

  return {
    ingredients: data?.ingredients,
    isLoading,
    isError: error,
    mutateIngredients: mutate,
  };
};
