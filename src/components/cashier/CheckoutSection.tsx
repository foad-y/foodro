import { ShoppingCart } from "lucide-react";
import { usePosStore } from "../../store/useProduct";
import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";
import CartSection from "./CartSection";

const CheckoutSection = () => {
  const activeOrder = usePosStore((s) => s.getActiveOrder());

  const cart = activeOrder?.cart || [];
  const isCustomerStep = activeOrder?.step === "customer";

  return (
    <div className="flex w-85 lg:w-86 xl:w-100 2xl:w-110 py-2 px-2 flex-col">
      {/* Cart Container */}
      <div className="bg-white flex flex-col justify-between rounded-xl h-full shadow-sm border border-border">
        
        {/* Cart Items Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-2">
          {isCustomerStep ? (
            <CheckoutForm />
          ) : !activeOrder ? (
            <div className="text-center text-secondarytext mt-8 font-medium">
              ابتدا نوع سفارش را انتخاب کنید
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center text-tertiarytext mt-8">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">سبد خرید خالی است</p>
            </div>
          ) : (
            <CartSection />
          )}
        </div>

        {/* Cart Footer */}
        <OrderSummary />
      </div>
    </div>
  );
};

export default CheckoutSection;