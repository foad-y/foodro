import React from "react";
import moment from "jalali-moment";
import {
  User,
  ShoppingBag,
  X,
  Hamburger,
  Printer,
} from "lucide-react";
import { CartItem, usePosStore, } from "../../store/useProduct";
import { Orders } from "../../hooks/useOrders";
import { getCashierReceiptHTML, printReceipt } from "../cashier/CashierReceipt";
import { tomanToRial } from "../../utils/price";

interface PropsType {
  close: () => void;
  dataProduct: Orders;
}

const InfoOrderModal: React.FC<PropsType> = ({ close, dataProduct }) => {

  const getOrderTotal = usePosStore((s) => s.getOrderTotal)

  console.log(getOrderTotal(dataProduct._id));

  const calculateTotal = (order: Orders) => {
    return order.cart.reduce(
      (sum: number, item: CartItem) => sum + item?.product?.price * item?.quantity,
      0,
    );
  };

  const calculateItemPrice = (item: CartItem): number => {
    const productPrice = item?.product?.price * item?.quantity;
    const ingredientsPrice = item.ingredients?.reduce(
      (sum, ing) => (ing.mode === "extra" ? sum + (ing.ingredient.price || 0) : sum),
      0,
    ) || 0;
    return productPrice + ingredientsPrice;
  };
  
  const formatTime = (date: string | number) => {
    return moment(date).format("HH:mm");
  };

  const formatDate = (date: string | number) => {
    return moment(date).locale("fa").format("jYYYY jMMMM jDD");
  };

  const formatDatePersian = (dateStr: string): string => {
    const m = moment(dateStr);
    return m.isValid() ? m.locale("fa").format("jYYYY jMMMM jDD") : dateStr;
  };

  const deliveryCost = dataProduct?.deliveryCost ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        dir="rtl"
        className="bg-white w-[95%] max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <Hamburger className="w-8 h-8 text-primarytext" />
            <div>
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      const html = getCashierReceiptHTML({ ...dataProduct, orderNumber: dataProduct.order_number } as never);
                      await printReceipt(html);
                    } catch (err) {
                      console.error('❌ [PRINT] Error printing order:', err);
                    }
                  }}
                  className="flex justify-center gap-2 font-bold flex-1 rounded-lg cursor-pointer bg-secondarytext hover:bg-primary text-white p-2 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <h2 className="font-bold text-lg text-primarytext">جزییات سفارش</h2>
              </div>
            </div>
          </div>
          <button
            onClick={close}
            className="text-secondarytext cursor-pointer hover:text-error text-xl p-2 hover:bg-error/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Content - جزئیات سفارش انتخابی */}
          <div className="w-full p-6 overflow-y-auto">
            <div className="space-y-6 bg-white rounded-lg">
              {/* هدر جزئیات */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-primarytext">
                    سفارش #{dataProduct.order_number}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-secondarytext">
                    {dataProduct.customerDetails?.name && (
                      <div className="flex items-center">
                        <User className="w-4 h-4 ml-1" />
                        <span>مشتری: {dataProduct.customerDetails.name}</span>
                        {dataProduct.customerDetails?.phone && (
                          <span className="mr-4">
                            ({dataProduct.customerDetails?.phone})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-secondarytext">تاریخ سفارش:</div>
                    <div className="font-bold text-primarytext">
                      {formatDate(dataProduct?.createdAt)}
                    </div>
                  </div>
                  <div className="text-sm text-secondarytext">
                    {formatTime(dataProduct?.createdAt)}
                  </div>
                </div>
              </div>

              {/* اطلاعات مشتری */}
              <div className="bg-white p-4 border border-border rounded-xl">
                <h4 className="font-bold mb-3 flex items-center text-primarytext">
                  <User className="w-4 h-4 ml-2" />
                  اطلاعات مشتری
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {dataProduct.customer?.name && (
                    <div>
                      <div className="text-secondarytext mb-1">نام مشتری</div>
                      <div className="font-bold text-primarytext">
                        {dataProduct.customer.name}
                      </div>
                    </div>
                  )}
                  {dataProduct.customer?.phone && (
                    <div>
                      <div className="text-secondarytext mb-1">تلفن</div>
                      <div className="font-bold text-primarytext">
                        {dataProduct.customer.phone}
                      </div>
                    </div>
                  )}
                  {dataProduct.customer?.birthday && (
                    <div className="col-span-2">
                      <div className="text-secondarytext mb-1">تاریخ تولد</div>
                      <div className="text-primarytext font-bold">
                        {formatDatePersian(dataProduct.customer.birthday)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* لیست محصولات با مواد اولیه */}
              <div>
                <h4 className="font-bold mb-3 flex items-center text-primarytext">
                  <ShoppingBag className="w-4 h-4 ml-2" />
                  محصولات سفارش ({dataProduct?.cart.length} قلم)
                </h4>
                <div className="space-y-4">
                  <div className="space-y-3">
                    {dataProduct.cart.map((item: CartItem, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-tertiary rounded-lg flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-tertiarytext" />
                          </div>
                          <div>
                            <div className="font-bold text-primarytext">
                              {item?.product?.name}
                            </div>
                            {item.ingredients?.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3 mb-2">
                                {item.ingredients.map((ing, i: number) => (
                                  <span
                                    key={i}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-tertiary text-secondarytext rounded-lg text-xs"
                                  >
                                    <span className="w-2 h-2 rounded-full bg-tertiarytext" />
                                    {ing.desc || ""}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="text-sm text-secondarytext flex gap-2">
                              قیمت واحد:
                              <span className="text-error flex font-bold">
                                {item?.product?.price?.toLocaleString("fa-IR")}
                                <img
                                  className="w-5 h-5"
                                  src="/other/toman.png"
                                  alt="toman"
                                />
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-error flex">
                            {calculateItemPrice(item).toLocaleString("fa-IR")}
                            <img className="w-5 h-5" src="/other/toman.png" alt="toman" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* خلاصه پرداخت */}
              <div className="bg-white border border-border p-4 rounded-xl">
                <h4 className="font-bold mb-3 text-primarytext">خلاصه پرداخت</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-primarytext">مجموع اقلام:</span>
                    <span className="text-primarytext font-medium">
                      {dataProduct.cart.length} قلم
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primarytext">جمع کل:</span>
                    <span className="flex text-error font-bold">
                      {tomanToRial(calculateTotal(dataProduct)).toLocaleString("fa-IR")} ریال
                    </span>
                  </div>

                  {deliveryCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-primarytext">هزینه پیک موتوری:</span>
                      <span className="flex text-error font-bold">
                        {tomanToRial(deliveryCost)?.toLocaleString('fa-IR')} ریال
                      </span>
                    </div>
                  )}

                  {dataProduct.discount && (
                    <div className="flex justify-between">
                      <span className="text-primarytext">تخفیف:</span>
                      <span className="flex text-error font-bold">
                        {tomanToRial(dataProduct?.discount?.amount)?.toLocaleString("fa-IR")} ریال
                      </span>
                    </div>
                  )}

                  <div className="pt-2 border-border border-t">
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-primarytext">
                        مبلغ قابل پرداخت:
                      </span>
                      <span className="text-primarytext">
                        {tomanToRial(getOrderTotal(dataProduct.id)).toLocaleString("fa-IR")} ریال
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <button
            onClick={close}
            className="w-full py-3 bg-error text-white rounded-xl hover:opacity-90 transition font-medium cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoOrderModal;