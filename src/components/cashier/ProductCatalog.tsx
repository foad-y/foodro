import { useEffect, useState } from "react";
import { CartIngredient, Product, usePosStore } from "../../store/useProduct";
import { Trash2, Utensils } from "lucide-react";
import { Pattern } from "../../hooks/usePattern";
import { removeThreeZeros } from "../../utils/price";

const ProductCatalog = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | "all">(
    "all",
  );
  const [tempIngredientSelected, setTempIngredientSelected] = useState<string | null>(null);
  const [allNumberDisabled, setAllNumberDisabled] = useState(false);

  const {
    activeOrderId,
    toggleIngredient,
    showIngredients,
    updateIngredientOrder,
    getIngredientsOnProduct,
  } = usePosStore();
  const activeOrder = usePosStore((s) => s.getActiveOrder());
  const categories = usePosStore((state) => state.categories);
  const products = usePosStore((state) => state.products);
  const startOrder = usePosStore((s) => s.startOrder);
  const addToCart = usePosStore((s) => s.addToCart);

  const activeCartItem = activeOrder?.cart.find(
    (item) => item.product._id === showIngredients?.productId,
  );

  useEffect(() => {
    return () => {
      toggleIngredient();
      setAllNumberDisabled(false);
    };
  }, [toggleIngredient]);

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products?.filter((p) => p?.category?._id === selectedCategory);

  const handleAddToCart = (product: Product) => {
    if (!activeOrder) {
      startOrder("hall");
    }
    addToCart(product);
  };

  return (
    <div className="flex-1 w-75 p-2 rounded-lg flex flex-col relative">
      {activeOrder?.step === "selecting" &&
        activeOrder.cart.length > 0 &&
        showIngredients ? (
        <div className="flex flex-col justify-between h-full w-full">
          <div className=" w-full">
            <div className="flex flex-wrap gap-2 mb-4">
              {showIngredients?.patterns?.map((item: Pattern, i: number) => (
                <button
                  key={i}
                  onClick={() => {
                    if (
                      showIngredients.disabledCount ===
                      Number(activeOrder?.cart.map((p) => p.quantity))
                    )
                      return;
                    setTempIngredientSelected(item.name);
                    updateIngredientOrder(item.name);
                    setAllNumberDisabled(false);
                  }}
                  className={`cursor-pointer hover:bg-primary hover:text-white w-fit p-2 rounded-xl flex items-center transition-colors
                    ${tempIngredientSelected === item.name
                      ? "bg-primary text-white"
                      : "bg-white text-primarytext border border-border"
                    } 
                        `}
                >
                  <div className="px-4 rounded-full">
                    <h3 className="text-sm flex flex-nowrap">{item.name}</h3>
                  </div>
                </button>
              ))}
            </div>
            {activeOrderId &&
              (getIngredientsOnProduct(
                activeOrderId,
                showIngredients?.productId,
              ) as CartIngredient[]).length !== 0 && (
                <div className="flex flex-col gap-2 bg-white border border-border rounded-xl p-2 w-full">
                  {(getIngredientsOnProduct(
                    activeOrderId,
                    showIngredients?.productId,
                  ) as CartIngredient[]).map((ing: CartIngredient, idx: number) => (
                    <div key={idx} className="flex justify-between item-center w-full">
                      <div
                        className="flex gap-2 text-primarytext"
                        style={{ alignItems: "center" }}
                      >
                        <Utensils className="w-3 h-3 text-primarytext" />
                        {ing.desc}
                      </div>
                      <div className="flex gap-2 text-primarytext">
                        <h3>({ing.count})</h3>
                        <button>
                          <Trash2
                            onClick={() => updateIngredientOrder(ing.desc ?? '', 0)}
                            className="w-4 h-4 cursor-pointer text-error hover:scale-110 transition-transform"
                          />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
          <div className="w-full mb-4 bg-white p-2 rounded-xl max-h-60 overflow-y-auto">
            <ul className="grid gap-2 grid-cols-[repeat(auto-fill,minmax(70px,1fr))]">
              {Array.from({ length: activeCartItem?.quantity ?? 0 }, (_, i) => {
                const num = i + 1;
                const isSelected = false;
                if (
                  (activeCartItem?.quantity ?? 0) -
                  (showIngredients?.disabledCount ?? 0) ===
                  0 && !allNumberDisabled
                )
                  setAllNumberDisabled(true);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (!tempIngredientSelected) return;
                      updateIngredientOrder(tempIngredientSelected, num);
                      setTempIngredientSelected(null);
                    }}
                    disabled={
                      allNumberDisabled ||
                      (showIngredients?.disabledCount
                        ? (activeCartItem?.quantity ?? 0) -
                        showIngredients.disabledCount <
                        i
                        : false)
                    }
                    className={`disabled:text-tertiarytext min-w-12 h-10 rounded-lg font-bold text-sm transition-all
                                                  ${isSelected
                        ? "bg-success text-white shadow-md scale-105"
                        : "bg-tertiary text-secondarytext hover:bg-border"
                      }
                                                  `}
                  >
                    {num}
                  </button>
                );
              })}
            </ul>
          </div>
        </div>
      ) : (
        <>
          {/* Category Filter */}
          <div className="p-4 bg-white rounded-xl w-full border border-border">
            <div className="flex gap-4 justify-evenly overflow-x-auto pb-2 categories-scroll">
              <button
                className={`flex border-[0.1px] ${selectedCategory === "all" ? "border-primary bg-primary/10" : "border-transparent"} hover:border-primary hover:bg-primary/10  rounded-lg hover:cursor-pointer flex-col justify-center items-center shrink-0 min-w-20 px-2 py-2 transition-all`}
                onClick={() => setSelectedCategory("all")}
              >
                {/* <img
                  className="w-11 h-10 object-contain mb-2"
                  src=''
                  alt="all"
                /> */}
                <div className={`font-bold text-sm whitespace-nowrap ${selectedCategory === "all" ? "text-primary" : "text-secondarytext"}`}>همه</div>
              </button>
              {categories?.map((category, i) => (
                <button
                  key={i}
                  className={`flex border-[0.1px] ${selectedCategory === category?._id ? "border-primary bg-primary/10" : "border-transparent"} hover:border-primary hover:bg-primary/10  rounded-lg hover:cursor-pointer flex-col justify-between items-center shrink-0 min-w-20 px-2 py-2 transition-all`}
                  onClick={() => setSelectedCategory(category?._id)}
                >
                  <img
                    className="w-11 h-10 object-contain mb-2"
                    src={category.img}
                    alt={category.name}
                  />
                  <div className={`font-bold text-sm whitespace-nowrap ${selectedCategory === category?._id ? "text-primary" : "text-secondarytext"}`}>
                    {category.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1 mt-4 overflow-y-auto scrollbar-hide">
            {selectedCategory === "all" ? (
              <div className="flex flex-col gap-4">
                {categories?.map((category, index) => {
                  const categoryProducts = products?.filter(
                    (p) => p.category?._id === category?._id,
                  );
                  if (!categoryProducts || categoryProducts.length === 0)
                    return null;
                  return (
                    <div key={category._id}>
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2">
                        {categoryProducts.map((product) => (
                          <button
                            key={product._id}
                            onClick={() => handleAddToCart(product)}
                            className="relative group bg-white cursor-pointer rounded-2xl p-2 flex flex-col justify-center items-center shadow-sm hover:shadow-md border border-border hover:border-primary transition-all"
                          >
                            <h3 className="text-xs font-bold text-primarytext text-center">
                              {product.name}
                            </h3>
                            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-primary text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                              {product.price.toLocaleString()} تومان
                            </div>
                          </button>
                        ))}
                      </div>
                      {index < categories.length - 1 && (
                        <div className="border-b-2 border-primary/50 mt-4" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-2">
                {filteredProducts?.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => handleAddToCart(product)}
                    className="bg-white rounded-2xl cursor-pointer p-2 flex justify-between flex-col items-center shadow-sm hover:shadow-md border border-border hover:border-primary transition-all"
                  >
                    <img src={product?.img ? product?.img : product?.category?.img} className="w-10 h-10 mb-2" />
                    <h3 className="text-sm font-bold text-primarytext text-center">{product.name}</h3>
                    <p className="text-error flex text-sm font-bold mt-1">
                      {removeThreeZeros(product.price).toLocaleString("fa-IR")}
                      <img className="w-5 h-5 mr-1" src="/other/toman.png" />
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductCatalog;