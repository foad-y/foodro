import React from "react";
import moment from "jalali-moment";
import {
  Package,
  User,
  ShoppingBag,
  Calendar,
  Clock,
  X,
  Hamburger,
  Printer,
} from "lucide-react";
import { CartItem, CartIngredient, Order, usePosStore } from "../store/useProduct";
import { tomanToRial } from "../utils/price";
import { getCashierReceiptHTML, printReceipt } from "./cashier/CashierReceipt";

interface PropsType {
  close: () => void;
}

const DeliveredOrdersModal: React.FC<PropsType> = ({ close }) => {
  const orders = usePosStore((s) => s.orders);
  const deliveredOrders = orders.filter((o) => o.status === "delivered");
  const getOrderTotal = usePosStore((s) => s.getOrderTotal)
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  console.log(selectedOrder, 'order');

  const calculateTotal = (order: Order) => {
    return order.cart.reduce(
      (sum: number, item: CartItem) => sum + item?.product?.price * item?.quantity,
      0,
    );
  };

  const formatTime = (date: number) => {
    return moment(date).format("HH:mm");
  };

  const formatDate = (date: number) => {
    return moment(date).locale("fa").format("jYYYY jMMMM jDD");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        dir="rtl"
        className="bg-white w-[95%] max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 ">
          <div className="flex items-center gap-3">
            <Hamburger className="w-8 h-8 text-primarytext" />
            <div>
              <h2 className="font-bold text-lg text-primarytext">سفارشات تحویل‌شده</h2>
              <p className="text-sm text-secondarytext mt-1">
                {deliveredOrders.length} سفارش تحویل داده شده
              </p>
            </div>
          </div>
          <button
            onClick={close}
            className="text-secondarytext cursor-pointer hover:text-error text-xl p-2 hover:bg-tertiary rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - لیست سفارشات */}
          <div className="w-1/3 border-l border-border overflow-y-auto">
            {deliveredOrders?.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-16 h-16 text-tertiarytext mx-auto mb-4" />
                <p className="text-secondarytext">
                  هیچ سفارش تحویل‌شده‌ای وجود ندارد
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {deliveredOrders?.map((order, i: number) => (
                  <div
                    key={i}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all hover:shadow-md ${selectedOrder?.id === order.id
                      ? "border-border bg-secondary/10"
                      : "border-border hover:border-primary"
                      }`}
                  >
                    <div className="flex mb-2">
                      <div className="flex w-full justify-between">
                        <div className="flex flex-col gap-2 mb-1">
                          <span className="font-bold text-sm text-primarytext">
                            شماره سفارش :{order.orderNumber}
                          </span>
                          {order.customer?.name && (
                            <span className="text-xs text-secondarytext">
                              <User className="w-3 h-3 inline ml-1" />
                              {order.customer?.name}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-3 text-xs text-secondarytext">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 ml-1" />
                            {formatDate(order.createdAt)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 ml-1" />
                            {formatTime(order.createdAt)}
                          </span>
                        </div>
                      </div>
                      {/* <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                                                تحویل شده
                                            </span> */}
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-border border-t">
                      <div className="text-xs text-secondarytext">
                        <ShoppingBag className="w-3 h-3 inline ml-1" />
                        {order.cart.length} قلم
                      </div>
                      <span className="font-bold flex text-error">
                        {tomanToRial(getOrderTotal(order?.id)).toLocaleString("fa-IR")} ریال
                        {/* <img className="w-5 h-5" src="/other/toman.png" /> */}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Main Content - جزئیات سفارش انتخابی */}
          <div className="w-2/3 p-6 overflow-y-auto">
            {selectedOrder ? (
              <div className="space-y-6 bg-white rounded-lg ">
                {/* هدر جزئیات */}
                <div className="flex justify-between  items-start">
                  <div>
                    <div className="flex gap-2" >
                      <button
                        onClick={async () => {
                          try {
                            const html = getCashierReceiptHTML(selectedOrder);
                            await printReceipt(html);
                          } catch (err) {
                            console.error('❌ [PRINT] Error printing order:', err);
                          }
                        }}
                        className="flex justify-center gap-2 font-bold flex-1 rounded-lg cursor-pointer bg-secondarytext hover:bg-primary text-white p-2 transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <h3 className="font-bold text-lg text-primarytext">
                        سفارش #{selectedOrder.orderNumber}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-secondarytext">
                      {/* {selectedOrder.customer?.fullName && (
                                                <div className="flex items-center">
                                                    <User className="w-4 h-4 ml-1" />
                                                    <span>مشتری: {selectedOrder.customer?.fullName}</span>
                                                    {selectedOrder.customer?.phone && (
                                                        <span className="mr-4">({selectedOrder.customer?.phone})</span>
                                                    )}
                                                </div>
                                            )} */}
                    </div>
                  </div>
                  <div className="text-left ">
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-secondarytext">تاریخ سفارش :</div>
                      <div className="font-bold text-primarytext">
                        {formatDate(selectedOrder.createdAt)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-secondarytext">
                        {formatTime(selectedOrder.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* اطلاعات مشتری */}
                {(selectedOrder.customer?.name ||
                  selectedOrder.customer?.phone ||
                  selectedOrder.customer?.address) && (
                    <div className="bg-white p-4 border border-border rounded-xl">
                      <h4 className="font-bold mb-3 flex items-center text-primarytext">
                        <User className="w-4 h-4 ml-2" />
                        اطلاعات مشتری
                      </h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {selectedOrder.customer?.name && (
                          <div>
                            <div className="text-secondarytext mb-1">نام مشتری</div>
                            <div className="font-bold text-primarytext">
                              {selectedOrder.customer?.name}
                            </div>
                          </div>
                        )}
                        {selectedOrder.customer?.phone && (
                          <div>
                            <div className="text-secondarytext mb-1">تلفن</div>
                            <div className="font-bold text-primarytext ">
                              {selectedOrder.customer?.phone}
                            </div>
                          </div>
                        )}
                        {selectedOrder.customer?.address && (
                          <div className="col-span-2">
                            <div className="text-secondarytext mb-1">آدرس</div>
                            <div className="text-primarytext font-bold">
                              {selectedOrder.customer?.address}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* لیست محصولات */}
                <div>
                  <h4 className="font-bold mb-3 flex items-center text-primarytext">
                    <ShoppingBag className="w-4 h-4 ml-2" />
                    محصولات سفارش ({selectedOrder.cart.length} قلم)
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.cart.map((item: CartItem, index: number) => (
                      <div
                        key={index}
                        className="p-3 border border-border rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-tertiary rounded-lg flex items-center justify-center">
                              <ShoppingBag className="w-5 h-5 text-tertiarytext" />
                            </div>
                            <div>
                              <div className="font-bold text-primarytext">
                                {item?.product?.name}
                              </div>
                              {/* مواد اولیه / توضیحات */}
                              {item.ingredients?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3 mb-1">
                                  {item.ingredients.map((ing: CartIngredient, i: number) => (
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
                                  {tomanToRial(item?.product?.price).toLocaleString("fa-IR")} ریال
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-error flex">
                              {(
                                tomanToRial(item?.product?.price * item?.quantity)
                              ).toLocaleString("fa-IR")} ریال
                            </div>
                            <div className="text-sm text-secondarytext">
                              {item?.quantity?.toLocaleString("fa-IR")} ×{" "}
                              {tomanToRial(item?.product?.price)?.toLocaleString("fa-IR")}
                            </div>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

                {/* خلاصه پرداخت */}
                <div className="bg-white border border-border p-4 rounded-xl">
                  <h4 className="font-bold mb-3 text-primarytext">خلاصه پرداخت</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-primarytext">مجموع اقلام:</span>
                      <span className="text-primarytext font-bold">
                        {selectedOrder.cart.length} قلم
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-primarytext">جمع کل:</span>
                      <span className="flex text-error font-bold">
                        {tomanToRial(calculateTotal(selectedOrder)).toLocaleString("fa-IR")}
                        {/* <img className="w-5 h-5" src="/other/toman.png" /> */} ریال
                      </span>
                    </div>
                    {
                      selectedOrder.customer?.deliveryPrice &&
                      <div className="flex justify-between">
                        <span className="text-primarytext"> هزینه پیک موتوری:</span>
                        <span className="flex text-error font-bold">
                          {tomanToRial(selectedOrder?.customer?.deliveryPrice)?.toLocaleString("fa-IR")}
                          {/* <img className="w-5 h-5" src="/other/toman.png" /> */} ریال
                        </span>
                      </div>
                    }
                    {
                      selectedOrder.discount &&
                      <div className="flex justify-between">
                        <span className="text-primarytext"> تخفیف:</span>
                        <span className="flex text-error font-bold">
                          {tomanToRial(selectedOrder?.discount?.amount)?.toLocaleString("fa-IR")}
                          {/* <img className="w-5 h-5" src="/other/toman.png" /> */} ریال
                        </span>
                      </div>
                    }


                    {/* {selectedOrder.discount && (
                                            <div className="flex justify-between text-green-600">
                                                <span>تخفیف:</span>
                                                <span className="flex">-{selectedOrder.discount.toLocaleString("fa-IR")}
                                                    <img className="w-5 h-5" src="/other/toman.png" />
                                                </span>
                                            </div>
                                        )} */}
                    {/* {selectedOrder.tax && (
                                            <div className="flex justify-between">
                                                <span>مالیات:</span>
                                                <span>+{selectedOrder.tax.toLocaleString("fa-IR")}
                                                    <img className="w-5 h-5" src="/other/toman.png" />
                                                </span>
                                            </div>
                                        )} */}
                    <div className="pt-2 border-border border-t">
                      <div className="flex justify-between font-bold text-lg">
                        <span className="text-primarytext">
                          مبلغ قابل پرداخت:
                        </span>
                        <span className="text-error flex">
                          {tomanToRial(getOrderTotal(selectedOrder.id)).toLocaleString(
                            "fa-IR",
                          )} ریال
                          {/* <img className="w-5 h-5" src="/other/toman.png" /> */}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* وضعیت سفارش */}
                {/* <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <Package className="w-5 h-5 text-green-600" />
                                        <span className="font-bold">وضعیت سفارش</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="font-bold text-green-700">تحویل شده</span>
                                    </div>
                                </div> */}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-tertiarytext">
                <Package className="w-16 h-16 mb-4" />
                <p className="text-lg mb-2 text-secondarytext">سفارشی انتخاب نشده</p>
                <p className="text-sm">
                  برای مشاهده جزئیات، یک سفارش از لیست سمت راست انتخاب کنید
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
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

export default DeliveredOrdersModal;