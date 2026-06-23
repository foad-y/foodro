import * as yup from "yup";
import { usePosStore } from "../../store/useProduct";
import { tomanToRial } from "../../utils/price";
import { getCashierReceiptHTML, printReceipt } from "./CashierReceipt";
import { Check, Hamburger, HandPlatter, Motorbike, PrinterX } from "lucide-react";
import { toast } from "react-toastify";

const orderSchema = yup.object({
  name: yup.string().trim().required("اسم مشتری الزامی است"),

  phone: yup
    .string()
    .trim()
    .required("شماره همراه مشتری الزامی است"),

  address: yup.string().when("$isDelivery", {
    is: true,
    then: (schema) => schema.required("آدرس الزامی است"),
    otherwise: (schema) => schema.notRequired(),
  }),

  deliveryPrice: yup.mixed().when("$isDelivery", {
    is: true,
    then: (schema) => schema.required("لطفاً منطقه و محله را انتخاب کنید"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const OrderSummary = () => {
  const activeOrder = usePosStore((s) => s.getActiveOrder());
  const changeOrderType = usePosStore((s) => s.changeOrderType);
  const goToCustomerStep = usePosStore((s) => s.goToCustomerStep);
  const completeOrder = usePosStore((s) => s.completeOrder);
  const completeOrderNoPrint = usePosStore((s) => s.completeOrderNoPrint);
  const getOrderTotal = usePosStore((s) => s.getOrderTotal)
  const cart = activeOrder?.cart || [];
  const isCustomerStep = activeOrder?.step === "customer";
  const isSelectingStep = activeOrder?.step === "selecting";
  const activeOrderType = activeOrder?.type;

  const validateOrderInfo = async () => {
    try {
      await orderSchema.validate(
        {
          deliveryPrice: activeOrder?.customer?.deliveryPrice,
          address: activeOrder?.customer?.address,
          name: activeOrder?.customer?.name,
          phone: activeOrder?.customer?.phone,
        },
        {
          abortEarly: false,
          context: {
            isDelivery: activeOrder?.type === "delivery",
          },
        }
      );

      return true;
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errors = [...new Set(err.errors)];

        errors.forEach((message) => {
          toast.error(message);
        });
      }

      return false;
    }
  };

  const payableAmount = Math.max(0, (getOrderTotal(activeOrder?.id) || 0));

  const handlePayWithReceipt = async () => {
    if (!activeOrder || cart.length === 0) return;

    const isValid = await validateOrderInfo();

    if (!isValid) return;

    try {
      const orderSnapshot = JSON.parse(JSON.stringify(activeOrder));
      console.log('📋 [ORDER] Completing order with receipt print...');
      await completeOrder(orderSnapshot);

      const html = getCashierReceiptHTML(orderSnapshot);
      await printReceipt(html);
    } catch (err) {
      console.error('❌ [ORDER] Error in pay with receipt:', err);
    }
  };

  const handlePayNoPrint = async () => {
    if (!activeOrder || cart.length === 0) return;

    const isValid = await validateOrderInfo();

    if (!isValid) return;

    try {
      const orderSnapshot = JSON.parse(JSON.stringify(activeOrder));
      console.log('📋 [ORDER] Completing order without any print (no receipt, no kitchen)...');
      await completeOrderNoPrint(orderSnapshot);
    } catch (err) {
      console.error('❌ [ORDER] Error in pay without print:', err);
    }
  };

  const amount = tomanToRial(payableAmount ?? 0);
  const amountDiscount = tomanToRial(activeOrder?.discount ? activeOrder.discount.amount : 0)

  return (
    <div className="p-4">
      {isSelectingStep && (
        <>
          <div className="text-sm text-secondarytext font-bold">نوع سفارش</div>
          <div className="flex justify-between gap-2 items-center my-2 ">
            <div
              onClick={() => changeOrderType("hall")}
              className={`flex w-1/3 text-xs gap-2 font-bold justify-center items-center transition-colors border-[0.1px] px-1 xl:px-6 py-3 rounded-lg hover:cursor-pointer ${activeOrderType === "hall"
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-secondarytext border-border hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
                }`}
            >
              <HandPlatter className="w-4 h-4 hidden xl:flex" />
              سالن
            </div>
            <div
              onClick={() => changeOrderType("takeaway")}
              className={`flex w-1/3 text-xs gap-2 font-bold justify-center items-center transition-colors border-[0.1px] px-1 xl:px-4 py-3 rounded-lg hover:cursor-pointer ${activeOrderType === "takeaway"
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-secondarytext border-border hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
                }`}
            >
              <Hamburger className="w-4 h-4 hidden xl:flex" />
              بیرون بر
            </div>
            <div
              onClick={() => changeOrderType("delivery")}
              className={`w-1/3 flex text-xs font-bold gap-1 justify-center items-center transition-colors border-[0.1px] px-1 xl:px-2 py-3 rounded-lg hover:cursor-pointer ${activeOrderType === "delivery"
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-secondarytext border-border hover:bg-primary/10 hover:border-primary/50 hover:text-primary"
                }`}
            >
              <Motorbike className="w-4 h-4 hidden xl:flex" />
              پیک موتوری
            </div>
          </div>
        </>
      )}
      <div className="mb-4 flex border-[0.1px] border-border bg-white px-4 py-2 rounded-lg flex-col">
        <div className="flex flex-row justify-between">
          <span className="text-secondarytext text-sm">شماره سفارش</span>
          {activeOrder && (
            <span className="font-bold text-sm text-primarytext">
              {activeOrder?.orderNumber}
            </span>
          )}
        </div>
        <div className="flex flex-row justify-between mt-1">
          {activeOrder?.type === "delivery" && (
            <>
              <span className="text-secondarytext text-sm">هزینه پیک</span>
              <span className="font-bold text-sm text-primarytext">
                {activeOrder?.customer?.deliveryPrice ? tomanToRial(activeOrder?.customer?.deliveryPrice).toLocaleString("fa-IR") : 0}
                {" "}ریال
              </span>
            </>
          )}
        </div>
        <div className="border-[0.1px] border-border border-dashed w-full my-3 text-xs"></div>
        {activeOrder?.discount && (
          <div className="flex flex-row justify-between mb-1">
            <span className="text-secondarytext text-sm">تخفیف:</span>
            <span className="font-bold flex text-success text-sm">
              -{amountDiscount.toLocaleString("fa-IR")} ریال
            </span>
          </div>
        )}
        <div className="flex flex-row justify-between">
          <span className="text-secondarytext text-sm">مبلغ قابل پرداخت:</span>
          <span className="font-bold flex text-error text-sm">
            {amount.toLocaleString("fa-IR")} ریال
          </span>
        </div>
      </div>

      {isCustomerStep ? (
        <div className="flex gap-2 items-center">
          <button
            onClick={handlePayWithReceipt}
            disabled={!activeOrder || cart.length === 0}
            className="flex-1 bg-success text-white text-sm py-2.5 font-bold rounded-lg cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-md flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            پرداخت و چاپ فاکتور
          </button>
          <button
            onClick={handlePayNoPrint}
            disabled={!activeOrder || cart.length === 0}
            title="پرداخت بدون چاپ"
            className="bg-secondarytext hover:bg-primarytext text-white p-2.5 rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <PrinterX className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <button
          onClick={goToCustomerStep}
          disabled={!activeOrder || cart.length === 0}
          className="w-full bg-warning hover:opacity-90 text-primarytext text-sm py-2.5 font-bold rounded-lg cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 hover:shadow-md flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          تکمیل اطلاعات
        </button>
      )}
    </div>
  );
};

export default OrderSummary;