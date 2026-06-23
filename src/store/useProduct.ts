/* eslint-disable @typescript-eslint/ban-ts-comment */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uuidv4 } from "../utils/uuidv4.ts";
import axiosInstance from "../lib/axiosInstance.ts";
/* =========================
   Types
========================= */

export type OrderType = "hall" | "takeaway" | "delivery";
export type OrderStatus = "beginning" | "pending" | "completed" | "delivered";
export type OrderStep = "beginning" | "selecting" | "customer";
export type IngredientMode = "removed" | "default" | "extra";

export interface Ingredient {
  _id: string;
  ingredient: {
    name: string;
    price?: number;
    removable?: boolean;
    default?: boolean;
    img: string;
  };
}

export interface CartIngredient extends Ingredient {
  mode: string;
  count: number;
  price: number;
  desc?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  ingredients: CartIngredient[];
  _id: string;
}

export interface Product {
  _id: string;
  img: string;
  name: string;
  price: number;
  category: Category;
  created_at: string;
  is_available: boolean;
  // product_ingredients?: Ingredient[]
}

export interface Category {
  _id: string;
  name: string;
  img: string;
  category_ingredients: [];
}

export interface CustomerInfo {
  name?: string;
  phone?: string;
  address?: string;
  addressId?: string;
  gender?: string;
  birthday?: string;
  deliveryPrice?: number
  id?: string;
  // note?: string
}

export interface Order {
  id: string;
  type: OrderType;
  status: OrderStatus;
  step: OrderStep;
  cart: CartItem[];
  customer: CustomerInfo | null;
  createdAt: number;
  orderNumber: number;
  order_number: number;
  deliveryCost?: number
  discount?: {
    code: string;
    type: "percent" | "fixed";
    value: number;
    amount: number; // calculated amount applied to order
  } | null;
}

/* =========================
   Store Interface
========================= */

interface PosState {
  orders: Order[];
  cachedOrders: string[];
  cachedDeleveryOrders: string[];
  activeOrderId: string | null;
  products: Product[];
  categories: Category[];
  showIngredients: {
    productId: string;
    patterns: [];
    disabledCount?: number;
  } | null;
  lastOrderNumber: number;
  isLoading: boolean;
  /* getters */
  getActiveOrder: () => Order | null;

  /* actions */
  startOrder: (type: OrderType) => void;
  openOrder: (id: string) => void;
  changeOrderType: (type: OrderType) => void;

  addToCart: (product: Product) => void;
  addToCartWithCount: (
    product: Product,
    customIngredients: CartIngredient[],
    count: number,
  ) => void;
  updateQty: (productId: string, delta: number) => void;
  removeItem: (productId: string) => void;
  getOrderTotal: (orderId?: string) => number;

  toggleIngredient: (productId?: string, categoryId?: string) => void;
  getPatterns: (categoryId: string) => [];
  getIngredientsOnProduct: (
    orderId: string,
    productId?: string | undefined,
  ) => CartIngredient[] | { productId: string; ingredients: CartIngredient[] }[];
  updateIngredientOrder: (ingredientId: string, count?: number) => void;
  updateIngredientMode: (
    productId: string,
    ingredientId: string,
    mode: "removed" | "default" | "extra",
  ) => void;
  removeIngredient: (productId: string, ingredientId: string) => void;

  setOrderStatus: (status: OrderStatus) => void;

  goToCustomerStep: () => void;
  goToSelectingStep: () => void;
  setCustomerInfo: (data: Partial<CustomerInfo>) => void;
  setOrderDiscount: (discount: { code: string; type: "percent" | "fixed"; value: number; amount: number } | null) => void;

  deleteOrder: (orderId: string) => void
  completeOrder: (order: Order) => void;
  completeOrderNoPrint: (order: Order) => void;
  deliveredOrder: (orderId: string) => void;
  clearAll: () => void;

  setProducts: (products: Product[]) => void;
  fetchOrders: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
}

/* =========================
   Store
========================= */

export const usePosStore = create<PosState>()(
  persist(
    (set, get) => ({
      orders: [],
      cachedOrders: [],
      cachedDeleveryOrders: [],
      activeOrderId: null,
      products: [],
      categories: [],
      lastOrderNumber: 100,
      showIngredients: null,
      isLoading: false,
      /* ---------- getters ---------- */
      getActiveOrder: () =>
        get().orders.find((o) => o.id === get().activeOrderId) || null,

      /* ---------- start order ---------- */
      startOrder: (type) => {
        set((state) => {
          let orders = [...state.orders];

          // اگر سفارش فعال وجود دارد → بفرستش در انتظار
          if (state.activeOrderId) {
            orders = orders.map((o) =>
              o.id === state.activeOrderId && o.status !== "completed"
                ? { ...o, status: "pending" }
                : o,
            );
          }
          const nextNumber = state.lastOrderNumber + 1;

          const newOrder: Order = {
            id: uuidv4(),
            type,
            status: "beginning",
            step: "beginning",
            cart: [],
            customer: null,
            orderNumber: nextNumber,
            order_number: nextNumber,
            createdAt: Date.now(),
            discount: null,
          };

          return {
            orders: [newOrder, ...orders],
            activeOrderId: newOrder.id,
            lastOrderNumber: nextNumber,
          };
        });
      },

      changeOrderType: (type) => {
        const activeId = get().activeOrderId;
        if (!activeId) return;

        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === activeId ? { ...o, type } : o,
          ),
        }));
      },

      /* ---------- open pending order ---------- */
      openOrder: (id) => set({ activeOrderId: id }),

      /* ---------- cart actions ---------- */
      addToCart: (product, customIngredients?: CartIngredient) => {
        const order = get().getActiveOrder();
        if (!order) return;

        if (customIngredients) {
          // @ts-ignore
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === state.activeOrderId
                ? {
                  ...o,
                  cart: [
                    ...o.cart,
                    {
                      product,
                      quantity: 1,
                      ingredients: customIngredients,
                    },
                  ],
                  step: o.step === "beginning" ? "selecting" : o.step,
                }
                : o,
            ),
          }));
          return;
        }

        const existedProductOnOrder = order.cart.find(
          (p) => p.product._id === product._id,
        );
        if (existedProductOnOrder) {
          return get().updateQty(existedProductOnOrder.product._id, 1);
        }

        // const ingredients: CartIngredient[] =
        //     product.product_ingredients?.map(ing => ({
        //         ...ing,
        //         count: 1,
        //     })) || []
        // @ts-ignore
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === state.activeOrderId
              ? {
                ...o,
                cart: [
                  ...o.cart,
                  {
                    product,
                    quantity: 1,
                    ingredients: [],
                  },
                ],
                step: o.step === "beginning" ? "selecting" : o.step,
              }
              : o,
          ),
        }));
      },

      addToCartWithCount: (
        product: Product,
        customIngredients: CartIngredient[],
        count: number,
      ) => {
        //@ts-ignore
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === state.activeOrderId
              ? {
                ...o,
                cart: [
                  ...o.cart,
                  {
                    product,
                    quantity: count,
                    ingredients: customIngredients,
                  },
                ],
                step: o.step === "beginning" ? "selecting" : o.step,
              }
              : o,
          ),
        }));
      },

      updateQty: (productId, delta) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === state.activeOrderId
              ? {
                ...o,
                cart: o.cart
                  .map((i) =>
                    i.product._id === productId
                      ? { ...i, quantity: i.quantity + delta }
                      : i,
                  )
                  .filter((i) => i.quantity > 0),
              }
              : o,
          ),
        }));
      },

      removeItem: (productId) => {
        get().toggleIngredient();

        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === state.activeOrderId
              ? {
                ...o,
                cart: o.cart.filter((i) => i.product._id !== productId),
              }
              : o,
          ),
        }));
      },

      /* ---------- Ingredient ---------- */
      toggleIngredient: (productId, categoryId) => {
        const { categories, showIngredients, orders, activeOrderId } = get();
        if (showIngredients || !productId || !categoryId)
          return set({ showIngredients: null });

        const patterns =
          categories.find((f) => f._id === categoryId)?.category_ingredients ||
          [];
        // const productIngredients = products.find((f) => f._id === productId)?.product_ingredients || []

        // توضیحات محصول در سفارش
        // console.log('p on o>>', orders.find(o => o.id === activeOrderId)?.cart)
        // const ingredients = orders.find(o => o.id === activeOrderId)?.cart.find(p => p.product._id === productId).ingredients || [];
        // console.log('ingredients',ingredients)
        // if(ingredients.length){
        //     console.log('productIngredients',productIngredients)
        //     productIngredients.map((prod) => ingredients.find(i => i._id === prod.ingredient._id))
        //     console.log('p on o>>', orders.find(o => o.id === activeOrderId)?.cart)
        // }

        return set({
          showIngredients: {
            productId,
            patterns,
            disabledCount: Number(
              orders
                .find((o) => o.id === activeOrderId)
                ?.cart.map((p) =>
                  p.ingredients.reduce((sum, ing) => sum + (ing.count || 0), 0),
                ),
            ),
          },
        });
        // return set({ showIngredients: { productId, patterns, productIngredients } })
      },

      getPatterns: (categoryId) => {
        const { categories } = get();
        return (
          categories.find((f) => f._id === categoryId)?.category_ingredients ||
          []
        );
      },

      getIngredientsOnProduct: (orderId, productId) => {
        const { orders } = get();
        const order = orders.find((o) => o.id === orderId)?.cart;
        // console.log('orders>>>', orders.find(o => o.id === orderId)?.cart)
        // console.log('products>>>', order?.find(p => p.product._id === productId)?.ingredients )
        if (productId)
          return (
            order?.find((p) => p.product._id === productId)?.ingredients || []
          );

        return (
          order?.map((o) => ({
            productId: o.product._id,
            ingredients: o.ingredients,
          })) || []
        );
      },

      updateIngredientOrder: (ingredient, count = 1) => {
        // mode[1]: pattern
        // updateIngredientOrder: (selectedPattern) => {
        const { showIngredients } = get();
        if (!showIngredients) return;

        // TODO: باید یه محاسبه گر بنویسیم که وقتی ارایه خالی بود همه چی تعدادش صفر بشه.

        // @ts-ignore
        set((state) => {
          const targetItem = state.orders
            .find((o) => o.id === state.activeOrderId)
            ?.cart.find(
              (item) => item.product._id === showIngredients.productId,
            );

          // count فعلی
          const oldCount =
            targetItem?.ingredients.reduce(
              (sum, ing) => sum + (ing.count || 0),
              0,
            ) || 0;

          // آپدیت کردن
          const updatedOrders = state.orders.map((o) =>
            o.id === state.activeOrderId
              ? {
                ...o,
                cart: o.cart.map((item) =>
                  item.product._id === showIngredients.productId
                    ? {
                      ...item,
                      ingredients:
                        count === 0
                          ? item.ingredients.filter(
                            (ing) => ing.desc !== ingredient,
                          )
                          : [
                            ...item.ingredients.filter(
                              (ing) => ing.desc !== ingredient,
                            ),
                            { desc: ingredient, count },
                          ],
                    }
                    : item,
                ),
              }
              : o,
          );

          // محاسبه count جدید بعد از آپدیت
          const updatedItem = updatedOrders
            .find((o) => o.id === state.activeOrderId)
            ?.cart.find(
              (item) => item.product._id === showIngredients.productId,
            );

          const newCount =
            updatedItem?.ingredients.reduce(
              (sum, ing) => sum + (ing.count || 0),
              0,
            ) || 0;

          return {
            orders: updatedOrders,
            showIngredients: {
              ...showIngredients,
              disabledCount: showIngredients.disabledCount
                ? showIngredients.disabledCount + (newCount - oldCount)
                : newCount,
            },
          };
        });
        // set((state) => ({
        //   orders: state.orders.map((o) =>
        //     o.id === state.activeOrderId
        //       ? {
        //           ...o,
        //           cart: o.cart.map((item) =>
        //             item.product._id === showIngredients.productId
        //               ? {
        //                   ...item,
        //                   ingredients:
        //                     count === 0
        //                       ? [
        //                           ...item.ingredients.filter(
        //                             (ing) => ing.desc !== ingredient,
        //                           ),
        //                         ]
        //                       : [
        //                           ...item.ingredients.filter(
        //                             (ing) => ing.desc !== ingredient,
        //                           ),
        //                           { desc: ingredient, count },
        //                         ],
        //                 }
        //               : item,
        //           ),
        //         }
        //       : o,
        //   ),
        //   showIngredients: {
        //     ...showIngredients,
        //     disabledCount: showIngredients.disabledCount
        //       ? showIngredients.disabledCount + count
        //       : count,
        //   },
        // }));

        // set(state => ({
        //     orders: state.orders.map(o =>
        //         o.id === state.activeOrderId
        //             ? {
        //                 ...o,
        //                 cart: o.cart
        //                     .map(i =>
        //                         i.product._id === showIngredients.productId
        //                             ? {
        //                                 ...i,
        //                                 ingredients: []
        //                                 // ingredients: selectedPattern.ingredient
        //                                 // ingredients: selectedPattern.ingredient.map((ing:string) => ({
        //                                 //     id: ing,
        //                                 //     count: 1
        //                                 // }))
        //                              }
        //                             : i
        //                     ),
        //             }
        //             : o
        //     ),
        // }))
      },

      updateIngredientMode: (productId, ingredientId, mode) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === state.activeOrderId
              ? {
                ...o,
                cart: o.cart.map((item) =>
                  item.product._id === productId
                    ? {
                      ...item,
                      ingredients: item.ingredients.map((ing) =>
                        ing._id === ingredientId
                          ? { ...ing, count: mode === "extra" ? 2 : 0 }
                          : ing,
                      ),
                    }
                    : item,
                ),
              }
              : o,
          ),
        }));
      },

      removeIngredient: (productId, ingredientId) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === state.activeOrderId
              ? {
                ...o,
                cart: o.cart.map((item) =>
                  item.product._id === productId
                    ? {
                      ...item,
                      ingredients: item.ingredients.filter(
                        (ing) => ing._id !== ingredientId,
                      ),
                    }
                    : item,
                ),
              }
              : o,
          ),
        }));
      },

      getOrderTotal: (orderId) => {
        const order = orderId
          ? get().orders.find((o) => o.id === orderId)
          : get().getActiveOrder();
        if (!order) return 0;

        const deliveryPrice = order.customer?.deliveryPrice || 0;

        const cartTotal = order.cart.reduce((sum, item) => {
          const extraPrice = item.ingredients.reduce(
            (s, ing) =>
              ing.mode === "extra" ? s + (ing.ingredient.price || 0) : s,
            0,
          );
          return sum + (item?.product?.price + extraPrice) * item.quantity;
        }, 0);

        const total = cartTotal + deliveryPrice;

        // Apply discount if present
        if (order.discount) {
          const discounted = total - order.discount.amount;
          return discounted < 0 ? 0 : discounted;
        }

        return total;
      },

      /* ---------- order status ---------- */
      setOrderStatus: (status) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === state.activeOrderId ? { ...o, status } : o,
          ),
        }));
      },

      /* ---------- customer info ---------- */
      goToCustomerStep: () => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === state.activeOrderId ? { ...o, step: "customer" } : o,
          ),
        }));
      },

      goToSelectingStep: () => {
        const activeId = get().activeOrderId;
        if (!activeId) return;

        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === activeId ? { ...o, step: "selecting" } : o,
          ),
        }));
      },

      setCustomerInfo: (data) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === state.activeOrderId
              ? {
                ...o,
                customer: {
                  ...o.customer,
                  ...data,
                },
              }
              : o,
          ),
        }));
      },

      setOrderDiscount: (discount) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === state.activeOrderId ? { ...o, discount } : o,
          ),
        }));
      },

      /* -------------  delete order ------------*/
      deleteOrder: (orderId) => {
        const { activeOrderId } = get();

        const newActiveId = activeOrderId === orderId ? null : activeOrderId;

        set((state) => ({
          orders: state.orders.filter((o) => o.id !== orderId),
          activeOrderId: newActiveId,
          cachedOrders: state.cachedOrders.filter((id) => id !== orderId),
          cachedDeleveryOrders: state.cachedDeleveryOrders.filter((id) => id !== orderId),
        }));

        const cached = localStorage.getItem("orders_cache");
        if (cached) {
          const cachedOrdersList: Order[] = JSON.parse(cached);
          const filtered = cachedOrdersList.filter((o) => o.id !== orderId);
          localStorage.setItem("orders_cache", JSON.stringify(filtered));
        }
      },

      /* ---------- complete order ---------- */
      completeOrder: async (order?: Order) => {
        const { cachedOrders, activeOrderId, orders } = get();
        const currentOrder: Order | undefined = order
          ? orders.find((o) => o.id === order.id)
          : orders.find((o) => o.id === activeOrderId);

        if (!currentOrder) return;

        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === currentOrder.id ? { ...o, status: "completed" } : o,
          ),
          activeOrderId: null,
          showIngredients: null,
        }));

        // prepare order data with discount
        const orderData = {
          ...currentOrder,
          discount: currentOrder.discount || undefined,
          deliveryCost: currentOrder?.customer?.deliveryPrice || undefined
        };

        // send to server
        axiosInstance
          .post("order", orderData)
          .then(() => {
            if (cachedOrders.length)
              axiosInstance
                .post("order/batch", {
                  orders: orders.filter((o) => cachedOrders.includes(o.id)),
                })
                .then(() => set({ cachedOrders: [] }));
          })
          .catch((err) => {
            console.error("err", err);
            set((state) => ({
              cachedOrders: [...state.cachedOrders, currentOrder.id],
            }));
          });
      },
      /* ---------- complete order without printing (kitchen) ---------- */
      completeOrderNoPrint: async (order?: Order) => {
        const { cachedOrders, activeOrderId, orders } = get();
        const currentOrder: Order | undefined = order
          ? orders.find((o) => o.id === order.id)
          : orders.find((o) => o.id === activeOrderId);

        if (!currentOrder) return;

        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === currentOrder.id ? { ...o, status: "completed" } : o,
          ),
          activeOrderId: null,
          showIngredients: null,
        }));

        // prepare order data with discount
        const orderData = {
          ...currentOrder,
          discount: currentOrder.discount || undefined,
          deliveryCost: currentOrder?.customer?.deliveryPrice || undefined
        };

        // send to server
        axiosInstance
          .post("order", orderData)
          .then(() => {
            if (cachedOrders.length)
              axiosInstance
                .post("order/batch", {
                  orders: orders.filter((o) => cachedOrders.includes(o.id)),
                })
                .then(() => set({ cachedOrders: [] }));
          })
          .catch((err) => {
            console.error("err", err);
            set((state) => ({
              cachedOrders: [...state.cachedOrders, currentOrder.id],
            }));
          });
      },

      //   deliveredOrder: async (orderId) => {
      //     const { cachedDeleveryOrders } = get();

      //     // آپدیت استیت محلی
      //     set((state) => ({
      //       orders: state.orders.map((o) =>
      //         o.id === orderId ? { ...o, status: "delivered" } : o,
      //       ),
      //       activeOrderId: null,
      //     }));

      //     try {
      //       // آپدیت تکی
      //       await axiosInstance.put(`order/${orderId}`, { status: "delivered" });

      //       // آپدیت بچ اگه کش داری
      //       if (cachedDeleveryOrders.length > 0) {
      //         const { orders } = get();
      //         const ordersToUpdate = orders.filter((o) =>
      //           cachedDeleveryOrders.includes(o.id),
      //         );

      //         // آپدیت وضعیت همه به delivered
      //         const updatedOrders = ordersToUpdate.map((o) => ({
      //           ...o,
      //           status: "delivered",
      //         }));

      //         await axiosInstance.put("order/batch", {
      //           ids: cachedDeleveryOrders,
      //           updates: { status: "delivered" },
      //         });

      //         // آپدیت استیت محلی
      //         set((state) => ({
      //           orders: state.orders.map((o) =>
      //             cachedDeleveryOrders.includes(o.id)
      //               ? { ...o, status: "delivered" }
      //               : o,
      //           ),
      //           cachedDeleveryOrders: [],
      //         }));
      //       }
      //     } catch (err) {
      //       console.error("err", err);
      //       set((state) => ({
      //         cachedDeleveryOrders: [...state.cachedDeleveryOrders, orderId],
      //       }));
      //     }
      //   },
      deliveredOrder: async (orderId) => {
        const { cachedDeleveryOrders } = get();
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: "delivered" } : o,
          ),
          activeOrderId: null,
        }));

        axiosInstance
          .put(`order/${orderId}`, { status: "delivered" })
          .then(() => {
            if (cachedDeleveryOrders.length)
              axiosInstance
                .put(`order/update/batch`, {
                  ids: cachedDeleveryOrders,
                  updates: { status: "delivered" },
                })
                .then(() => set({ cachedDeleveryOrders: [] }));
          })
          .catch(() => {
            set({ cachedDeleveryOrders: [...cachedDeleveryOrders, orderId] });
          });
      },

      clearAll: async () => {
        const { fetchCategories, fetchOrders, fetchProducts } = get();
        set({ isLoading: true });

        await Promise.all([fetchCategories(), fetchOrders(), fetchProducts()]);

        set({ activeOrderId: null, isLoading: false });
      },

      setProducts: (products) => set({ products }),

      fetchProducts: async () => {
        try {
          // همیشه اول سرور
          const response = await axiosInstance.get("/product");

          const products: Product[] = response.data.data;

          if (products.length > 0) {
            localStorage.setItem("products_cache", JSON.stringify(products));
            set({ products });
          }
        } catch (err) {
          console.warn("API failed, falling back to cache:", err);

          // فال‌بک به کش
          const cached = localStorage.getItem("products_cache");
          if (cached) {
            set({ products: JSON.parse(cached) });
          } else {
            // آخرین چاره: فایل استاتیک
            try {
              const res = await fetch("/products.json");
              const products = await res.json();
              set({ products });
            } catch (e) {
              console.error("All sources failed:", e);
            }
          }
        }
      },

      fetchCategories: async () => {
        try {
          // همیشه اول سرور
          const response = await axiosInstance.get("/product/category");
          const categories: Category[] = response.data.categories;

          if (categories?.length > 0) {
            localStorage.setItem(
              "categories_cache",
              JSON.stringify(categories),
            );
            set({ categories });
          }
        } catch (err) {
          console.warn("API failed, falling back to cache:", err);

          const cached = localStorage.getItem("categories_cache");
          if (cached) {
            set({ categories: JSON.parse(cached) });
          } else {
            try {
              const res = await fetch("/data/categories.json");
              const categories = await res.json();
              set({ categories });
            } catch (e) {
              console.error("All sources failed:", e);
            }
          }
        }
      },

      fetchOrders: async () => {
        try {
          // همیشه اول سرور
          const response = await axiosInstance.get("/order");

          const orders: Order[] = response.data;

          console.log("orders on store:::", orders);
          set({ orders });
          if (orders.length > 0) {
            localStorage.setItem("orders_cache", JSON.stringify(orders));
            set({ orders });
          }
        } catch (err) {
          console.warn("API failed, falling back to cache:", err);

          // فال‌بک به کش
          const cached = localStorage.getItem("orders_cache");
          if (cached) {
            set({ orders: JSON.parse(cached) });
          }
          // آخرین چاره: فایل استاتیک
          // try {
          //     const res = await fetch('/orders.json')
          //     const orders = await res.json()
          //     set({ orders })
          // } catch (e) {
          //     console.error('All sources failed:', e)
          // }
          // }
        }
      },
    }),
    {
      name: "pos-store",
    },
  ),
);
