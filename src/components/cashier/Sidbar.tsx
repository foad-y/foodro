import {
  CircleCheck,
  Hamburger,
  HandPlatter,
  Loader,
  Maximize2,
  Motorbike,
  ScrollText,
  Timer,
  Trash2,
  User2,
  Utensils,
  X,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { OrderType, usePosStore } from "../../store/useProduct";
import { tomanToRial } from "../../utils/price";
import OrderItemsModal from "./OrderItemModal";

interface PropsType {
  sidebarOpen: boolean;
  closeSidebar: () => void;
}

const getTypeOrder = (type: "takeaway" | "hall" | "delivery") =>
  ({ takeaway: "بیرون‌ بر", hall: "سالن", delivery: "پیک موتوری" })[type];

const Sidebar: React.FC<PropsType> = ({ sidebarOpen, closeSidebar }) => {
  const [tabOrder, setTabOrder] = useState<"pending" | "hall" | "takeaway">(
    "pending",
  );
  const [modalOrder, setModalOrder] = useState<typeof orders[0] | null>(null);
  const triggerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const { deliveredOrder } = usePosStore();
  const activeOrder = usePosStore((s) => s.getActiveOrder());
  const changeOrderType = usePosStore((s) => s.changeOrderType);
  const openOrder = usePosStore((s) => s.openOrder);
  const setOrderStatus = usePosStore((s) => s.setOrderStatus);
  const startOrder = usePosStore((s) => s.startOrder);
  const deleteOrder = usePosStore((s) => s.deleteOrder);
  const activeOrderType = activeOrder?.type;
  const orders = usePosStore((s) => s.orders);
  const { getOrderTotal } = usePosStore();

  const getFilteredOrders = () => {
    if (tabOrder === "pending") {
      return orders.filter((o) => o.status === "pending");
    }
    if (tabOrder === "hall") {
      return orders.filter(
        (o) =>
          o.status === "completed" &&
          (o.type === "hall" || o.type === "takeaway"),
      );
    }
    if (tabOrder === "takeaway") {
      return orders.filter(
        (o) => o.status === "completed" && o.type === "delivery",
      );
    }
    return [];
  };

  const ORDER_TYPE_ICON: Record<OrderType, JSX.Element> = {
    takeaway: <Motorbike className="w-4 h-4" />,
    hall: <Hamburger className="w-4 h-4" />,
    delivery: <Hamburger className="w-4 h-4" />,
  };

  const timeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "چند لحظه پیش";
    if (minutes < 60) return `${minutes} دقیقه قبل`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ساعت قبل`;
    const days = Math.floor(hours / 24);
    return `${days} روز قبل`;
  };

  const filteredOrders = getFilteredOrders();

  const handelStartOrder = (typeOrder: OrderType) => {
    if (activeOrder?.step === "beginning") {
      changeOrderType(typeOrder);
    } else {
      startOrder(typeOrder);
    }
  };

  const handelPendingOrder = (orderId: string) => {
    if (activeOrder?.status === 'beginning') {
      setOrderStatus("pending");
      openOrder(orderId);
    } else {
      openOrder(orderId);
    }
  };

  return (
    <div
      className={`fixed lg:static z-10 top-0 right-0 h-[95%] lg:h-full lg:w-90 xl:w-100 2xl:w-110 md:w-86 w-85 bg-white border border-border shadow-sm transition-transform rounded-2xl duration-300 ${sidebarOpen ? "translate-x-0" : "translate-x-full"} lg:translate-x-0 flex flex-col`}
    >
      <div
        className="flex justify-end py-3 px-4 lg:hidden cursor-pointer"
        onClick={closeSidebar}
      >
        <X className="h-5 w-5 text-secondarytext hover:text-error transition-colors" />
      </div>

      {/* دکمه‌های نوع سفارش جدید */}
      <div className="grid grid-rows-1 grid-cols-3 px-3 pt-3 pb-2 gap-2">
        <div
          onClick={() => { handelStartOrder("hall"); }}
          className={`rounded-xl p-2.5 border-2 transition-all cursor-pointer group ${
            activeOrderType === "hall"
              ? "bg-primary border-primary shadow-md shadow-primary/20"
              : "bg-white border-border hover:border-primary/40 hover:bg-primary/5"
          }`}
        >
          <div className={`flex flex-col items-center justify-center gap-1.5 ${activeOrderType === "hall" ? "text-white" : "text-secondarytext"} group-hover:text-primary transition-colors`}>
            <div className="flex flex-col xl:flex-row items-center gap-1.5">
              <HandPlatter className={`w-4 h-4 ${activeOrderType === "hall" ? "text-white" : "text-primary"}`} />
              <div className={`text-xs xl:text-sm font-bold ${activeOrderType === "hall" ? "text-white" : "text-primarytext"}`}>سالن</div>
            </div>
            <span className={`text-sm font-extrabold ${activeOrderType === "hall" ? "text-white" : "text-primarytext"}`}>
              {orders.filter((o) => o.status === "delivered" && o.type === "hall").length}
            </span>
          </div>
        </div>
        <div
          onClick={() => { handelStartOrder("takeaway"); }}
          className={`rounded-xl p-2.5 border-2 transition-all cursor-pointer group ${
            activeOrderType === "takeaway"
              ? "bg-primary border-primary shadow-md shadow-primary/20"
              : "bg-white border-border hover:border-primary/40 hover:bg-primary/5"
          }`}
        >
          <div className={`flex flex-col items-center justify-center gap-1.5 ${activeOrderType === "takeaway" ? "text-white" : "text-secondarytext"} group-hover:text-primary transition-colors`}>
            <div className="flex flex-col xl:flex-row items-center gap-1.5">
              <Hamburger className={`w-4 h-4 ${activeOrderType === "takeaway" ? "text-white" : "text-primary"}`} />
              <div className={`text-xs xl:text-sm font-bold ${activeOrderType === "takeaway" ? "text-white" : "text-primarytext"}`}>بیرون بر</div>
            </div>
            <span className={`text-sm font-extrabold ${activeOrderType === "takeaway" ? "text-white" : "text-primarytext"}`}>
              {orders.filter((o) => o.status === "delivered" && o.type === "takeaway").length}
            </span>
          </div>
        </div>
        <div
          onClick={() => { handelStartOrder("delivery"); }}
          className={`rounded-xl p-2.5 border-2 transition-all cursor-pointer group ${
            activeOrderType === "delivery"
              ? "bg-primary border-primary shadow-md shadow-primary/20"
              : "bg-white border-border hover:border-primary/40 hover:bg-primary/5"
          }`}
        >
          <div className={`flex flex-col items-center justify-center gap-1.5 ${activeOrderType === "delivery" ? "text-white" : "text-secondarytext"} group-hover:text-primary transition-colors`}>
            <div className="flex flex-col xl:flex-row items-center gap-1.5">
              <Motorbike className={`w-4 h-4 ${activeOrderType === "delivery" ? "text-white" : "text-primary"}`} />
              <div className={`text-xs xl:text-sm font-bold ${activeOrderType === "delivery" ? "text-white" : "text-primarytext"}`}>پیک</div>
            </div>
            <span className={`text-sm font-extrabold ${activeOrderType === "delivery" ? "text-white" : "text-primarytext"}`}>
              {orders.filter((o) => o.status === "delivered" && o.type === "delivery").length}
            </span>
          </div>
        </div>
      </div>

      {/* تب‌های وضعیت سفارشات */}
      <div className="px-3 py-2 border-b border-border">
        <div className="flex justify-between px-1.5 py-1.5 rounded-xl bg-tertiary border border-border">
          <div
            onClick={() => setTabOrder("pending")}
            className={`relative flex flex-1 items-center justify-center flex-col lg:flex-row xl:gap-2 gap-1 transition-all ${
              tabOrder === "pending"
                ? "bg-white shadow-sm border border-border text-primarytext"
                : "bg-transparent border border-transparent text-secondarytext hover:text-primarytext"
            } px-2 py-1.5 rounded-lg hover:cursor-pointer text-sm font-bold`}
          >
            <Loader className="w-4 h-4" />
            <div className="hidden lg:flex">در انتظار</div>
            {orders.filter((o) => o.status === "pending").length !== 0 && (
              <div className="absolute rounded-full w-5 h-5 bg-warning text-white -top-2.5 -right-2 shadow-sm flex items-center justify-center border-2 border-white">
                <span className="text-[10px]">{orders.filter((o) => o.status === "pending").length}</span>
              </div>
            )}
          </div>
          <div
            onClick={() => setTabOrder("hall")}
            className={`relative flex flex-1 items-center justify-center flex-col lg:flex-row xl:gap-2 gap-1 transition-all ${
              tabOrder === "hall"
                ? "bg-white shadow-sm border border-border text-primarytext"
                : "bg-transparent border border-transparent text-secondarytext hover:text-primarytext"
            } px-2 py-1.5 rounded-lg hover:cursor-pointer text-sm font-bold`}
          >
            <Hamburger className="w-4 h-4" />
            <div className="hidden lg:flex">سالن</div>
            {orders.filter((o) => o.status === "completed" && (o.type === "hall" || o.type === "takeaway")).length !== 0 && (
              <div className="absolute rounded-full w-5 h-5 bg-success text-white -top-2.5 -right-2 shadow-sm flex items-center justify-center border-2 border-white">
                <span className="text-[10px]">{orders.filter((o) => o.status === "completed" && (o.type === "hall" || o.type === "takeaway")).length}</span>
              </div>
            )}
          </div>
          <div
            onClick={() => setTabOrder("takeaway")}
            className={`relative flex flex-1 items-center justify-center flex-col lg:flex-row xl:gap-2 gap-1 transition-all ${
              tabOrder === "takeaway"
                ? "bg-white shadow-sm border border-border text-primarytext"
                : "bg-transparent border border-transparent text-secondarytext hover:text-primarytext"
            } px-2 py-1.5 rounded-lg hover:cursor-pointer text-sm font-bold`}
          >
            <Motorbike className="w-4 h-4" />
            <div className="hidden lg:flex">بیرون بر</div>
            {orders.filter((o) => o.status === "completed" && o.type === "delivery").length !== 0 && (
              <div className="absolute rounded-full w-5 h-5 bg-success text-white -top-2.5 -right-2 shadow-sm flex items-center justify-center border-2 border-white">
                <span className="text-[10px]">{orders.filter((o) => o.status === "completed" && o.type === "delivery").length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* لیست سفارشات */}
      <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-hide">
        {filteredOrders.length === 0 ? (
          <div className="text-center text-tertiarytext mt-12 flex flex-col items-center justify-center">
            <span className="bg-tertiary p-4 rounded-full border border-border mb-3">
              <ScrollText className="w-8 h-8 opacity-40" />
            </span>
            <p className="text-sm font-medium">هیچ سفارشی در این وضعیت نیست</p>
          </div>
        ) : (
          <div className="space-y-3 pb-20">
            {filteredOrders.map((order, index) => (
              <div key={index} className="bg-white border-2 border-border rounded-xl p-3 relative hover:border-primary/30 transition-colors shadow-sm">
                <div className="w-full text-xs text-right transition-colors">
                  
                  {/* هدر کارت سفارش */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-extrabold text-sm text-secondary bg-tertiary px-2.5 py-1 rounded-md border border-border">
                      سفارش: <span className="text-primary text-base ml-1">{order.orderNumber}</span>
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <div
                        className={`flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-md border text-xs font-bold ${
                          order.status === "completed"
                            ? "text-success bg-success/10 border-success/20"
                            : "bg-warning/10 text-warning border-warning/20"
                        }`}
                      >
                        {order.status === "completed" ? (
                          <CircleCheck className="w-3.5 h-3.5" />
                        ) : (
                          <Loader className="w-3.5 h-3.5 animate-spin-slow" />
                        )}
                        <span>
                          {order.status === "completed" ? "تکمیل شده" : "در انتظار"}
                        </span>
                      </div>
                      {order.status === 'pending' && (
                        <button onClick={() => deleteOrder(order.id)} className="text-error bg-error/10 border border-error/20 p-1.5 rounded-md hover:cursor-pointer hover:bg-error hover:text-white transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* اطلاعات متا */}
                  <div className="flex justify-between items-center bg-tertiary p-2 rounded-lg text-secondarytext font-bold mb-3">
                    <div className="flex items-center gap-1.5 truncate max-w-22.5" title={order.customer?.name}>
                      <User2 className="w-3.5 h-3.5 text-primary" />
                      <span className="truncate">{order.customer?.name || "ثبت نشده"}</span>
                    </div>
                    <span className="text-border">|</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-primary">{ORDER_TYPE_ICON[order.type]}</span>
                      {getTypeOrder(order.type)}
                    </div>
                    <span className="text-border">|</span>
                    <div className="flex items-center gap-1.5">
                      <Timer className="w-3.5 h-3.5" />
                      <span dir="ltr">{timeAgo(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* دکمه مشاهده اقلام */}
                  <div className="bg-white">
                    <div
                      ref={(el) => (triggerRefs.current[order.id] = el)}
                      onClick={() => setModalOrder(order)}
                      className="flex border border-border justify-between items-center py-2 px-3 rounded-lg bg-tertiary text-secondarytext cursor-pointer hover:border-primary/40 hover:text-primary transition-all font-bold"
                    >
                      <div className="flex items-center gap-2">
                        <Utensils className="w-4 h-4" />
                        {order.cart.length} مورد لیست شده است
                      </div>
                      <Maximize2 className="w-4 h-4" />
                    </div>
                    {modalOrder?.id === order.id && (
                      <OrderItemsModal
                        cart={order?.cart ? order.cart : []}
                        isOpen={modalOrder?.id === order.id}
                        onClose={() => setModalOrder(null)}
                        triggerRef={{ current: triggerRefs.current[order.id] }}
                      />
                    )}
                  </div>

                  <div className="border-t border-dashed border-border w-full my-3"></div>
                  
                  {/* قیمت نهایی */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-secondarytext font-bold text-sm">مبلغ پرداختی:</div>
                    <div className="flex font-extrabold text-primarytext gap-1 text-base">
                      {order.status === "completed" ? (
                        <span>{tomanToRial(getOrderTotal(order.id)).toLocaleString("fa-IR")} ریال</span>
                      ) : (
                        <span className="text-warning text-xs bg-warning/10 px-2 py-1 rounded border border-warning/20">پرداخت نشده</span>
                      )}
                    </div>
                  </div>

                  {/* دکمه اکشن */}
                  <div className="w-full flex">
                    <button
                      onClick={() =>
                        order.status === "completed"
                          ? deliveredOrder(order.id)
                          : handelPendingOrder(order.id)
                      }
                      className={`flex justify-center items-center gap-2 font-bold rounded-lg cursor-pointer py-2.5 transition-all w-full hover:-translate-y-0.5 hover:shadow-md ${
                        order.status === "completed" 
                          ? "bg-primary text-white shadow-primary/20" 
                          : "bg-warning text-white shadow-warning/20"
                      }`}
                    >
                      <ScrollText className="w-4 h-4" />
                      {order.status === "completed" ? "تحویل به مشتری" : "مشاهده جزییات"}
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;