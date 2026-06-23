import { Edit, Minus, Plus, Trash2, Utensils } from "lucide-react";
import { usePosStore } from "../../store/useProduct";

const CartSection = () => {
  const { getIngredientsOnProduct } = usePosStore();
  const activeOrder = usePosStore((s) => s.getActiveOrder());
  const getPatterns = usePosStore((s) => s.getPatterns);
  const updateQty = usePosStore((s) => s.updateQty);
  const removeItem = usePosStore((s) => s.removeItem);
  const toggleIngredient = usePosStore((s) => s.toggleIngredient);
  const cart = activeOrder?.cart || [];

  const handleUpdateQty = (productId: string, delta: number) => {
    updateQty(productId, delta);
  };

  return (
    <div className="space-y-3">
      {cart.map((item) => (
        <div
          key={item.product._id}
          className="bg-white rounded-lg p-3 border border-border"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex justify-center gap-4 items-center">
              <img
                onClick={() => toggleIngredient(item.product._id, item.product.category._id)}
                src={item.product.img}
                className="w-8 cursor-pointer"
              />
              <div className="flex flex-col">
                <h3 className="font-bold text-primarytext text-xs">
                  {item.product.name}
                </h3>
                <p className="text-xs text-error font-bold mt-1 flex">
                  {item.product.price.toLocaleString("fa-IR")}
                  <img className="w-5 h-5" src="/other/toman.png" />
                </p>
              </div>
            </div>
            <div className="flex flex-row gap-4">
              <div className="flex items-center gap-1 bg-white rounded">
                <button
                  onClick={() => handleUpdateQty(item.product._id, -1)}
                  className="p-2 hover:bg-tertiary border-[0.1px] hover:cursor-pointer border-border rounded-md transition-colors"
                >
                  <Minus className="w-2 h-2 text-primarytext" />
                </button>
                <span className="w-6 text-center font-bold text-xs text-primarytext">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleUpdateQty(item.product._id, 1)}
                  className="p-2 hover:bg-tertiary border-[0.1px] hover:cursor-pointer border-border rounded-md transition-colors"
                >
                  <Plus className="w-2 h-2 text-primarytext" />
                </button>
              </div>
              <button
                onClick={() => removeItem(item.product._id)}
                className="flex hover:bg-error/10 text-error hover:border-[0.1px] border-[0.1px] hover:cursor-pointer border-transparent rounded-lg p-1 hover:border-error ml-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {getPatterns(item.product.category._id).length ? (
            <div
              onClick={() =>
                toggleIngredient(item.product._id, item.product.category._id)
              }
              className="cursor-pointer flex justify-between items-center bg-tertiary text-secondarytext rounded-lg border-2 border-border p-2 hover:border-primary/50 transition-colors"
            >
              <div className="text-xs flex flex-wrap items-center gap-3">
                {getIngredientsOnProduct(activeOrder?.id, item.product._id)
                  .length !== 0 ? (
                  getIngredientsOnProduct(
                    activeOrder?.id,
                    item.product._id,
                  ).map((ing, i) => (
                    <div
                      className="flex gap-1 flex-nowrap items-center"
                      key={i}
                    >
                      <span className="w-3 h-3 rounded-full bg-secondarytext flex justify-center items-center text-[10px] text-white">
                        {ing.count}
                      </span>
                      <div className="flex flex-nowrap text-primarytext font-medium">{ing.desc}</div>
                    </div>
                  ))
                ) : (
                  <>
                    <Utensils className="w-3 h-3" />
                    <h3>توضیحات سفارش</h3>
                  </>
                )}
              </div>
              <button>
                <Edit className="w-3 h-3" />
              </button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default CartSection;