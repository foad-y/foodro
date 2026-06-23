// store/ingredientSelectionStore.ts
import { create } from "zustand";
import { Pattern } from "../hooks/usePattern";
import { Ingredient } from "./useProduct";

export type IngredientMode = "removed" | "default" | "extra";

export interface SelectableIngredient {
  _id: string;
  ingredient: {
    name: string;
    price?: number;
    removable?: boolean;
    default?: boolean;
    img: string;
  };
  mode: IngredientMode;
  count: number;
}

export interface IngredientSelection {
  productId: string;
  mode: "pattern" | "custom";
  patternId?: string;
  patternName?: string;
  ingredients: SelectableIngredient[];
  totalCount: number;
}

interface IngredientSelectionState {
  // انتخاب فعلی
  selection: IngredientSelection | null;
  patterns: [];

  // باز کردن مودال انتخاب
  openSelection: (
    productId: string,
    patterns: Pattern[],
    productIngredients: Ingredient[],
  ) => void;

  // بستن مودال
  closeSelection: () => void;

  // انتخاب الگو
  selectPattern: (pattern: Pattern) => void;

  // تغییر mode یک ماده اولیه
  updateIngredientMode: (ingredientId: string, mode: IngredientMode) => void;

  // تغییر تعداد یک ماده اولیه
  updateIngredientCount: (ingredientId: string, count: number) => void;

  // رفتن به حالت سفارشی
  goToCustomMode: () => void;

  // اضافه کردن یکی
  incrementCount: () => void;

  setQuantity: (count: number) => void;

  // کم کردن یکی
  decrementCount: () => void;

  // ریست
  resetCount: () => void;

  // گرفتن تعداد کل
  getTotalCount: () => number;
}

export const useIngredientSelectionStore = create<IngredientSelectionState>(
  (set, get) => ({
    selection: null,
    patterns: [],

    openSelection: (productId, productIngredients) => {
      // اگر الگو پیش‌فرضی داریم، اولینش رو انتخاب کن
      // const defaultPattern = patterns[0]

      const initialIngredients: SelectableIngredient[] = productIngredients.map(
        (ing) => ({
          _id: ing._id,
          ingredient: ing.ingredient,
          mode: ing.ingredient.price ? "removed" : "default",
          count: 1,
        }),
      );

      set({
        selection: {
          productId,
          // mode: defaultPattern ? 'pattern' : 'custom',
          // patternId: defaultPattern?._id,
          // patternName: defaultPattern?.name,
          ingredients: productIngredients,
          // ingredients: defaultPattern
          //     ? initialIngredients.map(ing => {
          //         const isInPattern = defaultPattern.ingredient.some(
          //             (pIng: any) =>
          //                 (typeof pIng === 'string' ? pIng : pIng._id) === ing._id
          //         )
          //         return {
          //             ...ing,
          //             mode: isInPattern ? 'default' : 'removed',
          //             count: 1,
          //         }
          //     })
          //     : initialIngredients,
          totalCount: 1,
        },
      });
    },

    closeSelection: () => set({ selection: null }),

    selectPattern: (pattern) => {
      const { selection } = get();
      if (!selection) return;

      set({
        selection: {
          ...selection,
          mode: "pattern",
          patternId: pattern._id,
          patternName: pattern.name,
          ingredients: selection.ingredients.map((ing) => {
            const isInPattern = pattern.ingredient.some(
              (pIng: any) =>
                (typeof pIng === "string" ? pIng : pIng._id) === ing._id,
            );
            return {
              ...ing,
              mode: isInPattern ? "default" : "removed",
            };
          }),
        },
      });
    },

    updateIngredientMode: (ingredientId, mode) => {
      set((state) => ({
        selection: state.selection
          ? {
              ...state.selection,
              mode: "custom",
              patternId: undefined,
              patternName: undefined,
              ingredients: state.selection.ingredients.map((ing) =>
                ing._id === ingredientId ? { ...ing, mode } : ing,
              ),
            }
          : null,
      }));
    },

    updateIngredientCount: (ingredientId, count) => {
      set((state) => ({
        selection: state.selection
          ? {
              ...state.selection,
              ingredients: state.selection.ingredients.map((ing) =>
                ing._id === ingredientId
                  ? { ...ing, count: Math.max(0, count) }
                  : ing,
              ),
            }
          : null,
      }));
    },

    goToCustomMode: () => {
      set((state) => ({
        selection: state.selection
          ? {
              ...state.selection,
              mode: "custom",
              patternId: undefined,
              patternName: undefined,
            }
          : null,
      }));
    },

    incrementCount: () => {
      set((state) => ({
        selection: state.selection
          ? { ...state.selection, totalCount: state.selection.totalCount + 1 }
          : null,
      }));
    },

    decrementCount: () => {
      set((state) => ({
        selection: state.selection
          ? {
              ...state.selection,
              totalCount: Math.max(1, state.selection.totalCount - 1),
            }
          : null,
      }));
    },

    setQuantity: (count: number) => {
      set((state) => ({
        selection: state.selection
          ? { ...state.selection, totalCount: Math.max(1, count) }
          : null,
      }));
    },

    resetCount: () => {
      set((state) => ({
        selection: state.selection
          ? { ...state.selection, totalCount: 1 }
          : null,
      }));
    },

    getTotalCount: () => get().selection?.totalCount ?? 1,
  }),
);
