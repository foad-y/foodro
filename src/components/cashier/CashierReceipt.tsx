// import { typeOrderNumber } from "./OrderSummary";
import config from "../../../site.config.json";
import type { Order, CartItem, CartIngredient } from "../../store/useProduct";
import { toast } from "react-toastify";
import { formatRial, tomanToRial } from "../../utils/price";

const storeName = (config)?.marketName || "کلیز برگر";

// const typeOrderNumber = (
//   orderType: "delivery" | "takeaway" | "hall",
// ) => {
//   const typeOrderNumber = {
//     hall: "H",
//     takeaway: "T",
//     delivery: "D",
//   };
//   return typeOrderNumber[orderType];
// };

export function getCashierReceiptHTML(order: Order): string {
  const now = new Date().toLocaleString("fa-IR");
  console.log(order, 'order');

  // const formatPrice = (n: number) =>
  //   new Intl.NumberFormat("fa-IR").format(n) + " تومان";

  const orderLabel = (t: string) => {
    const map: Record<string, string> = {
      hall: "سالن",
      dine_in: "سالن",
      takeaway: "بیرون‌بر",
      delivery: "پیک",
    };
    return map[t] || t;
  };

  const orderIdDisplay = order.order_number ? order.order_number : order.orderNumber;

  const cartRows = order.cart
    .map(
      (item: CartItem) => {
        const ingredients = item.ingredients;
        const ingredientDescs = ingredients?.length
          ? ingredients
            .map((ing: CartIngredient) =>
              `<div style="display : flex; gap : 5px" >
            <div style="font-size: 9px; color: #000000;">${ing.count || ""}</div>
            <div style="font-size: 9px; color: #000000;">${ing.desc || ""}</div>
              </div> 
             `)
            .join("")
          : "";
        return `<tr>
          <td>${item.product.name}${ingredientDescs ? `<br/>${ingredientDescs}` : ""}</td>
          <td style="text-align: center;">${new Intl.NumberFormat("fa-IR").format(item.quantity)}</td>
          <td style="text-align: left;">${formatRial(tomanToRial(item.product.price * item.quantity))} ریال</td>
        </tr>`;
      }
    )
    .join("");

  const cartTotal = order.cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const deliveryPrice = order.customer?.deliveryPrice || 0;
  const subtotal = cartTotal + deliveryPrice;
  const discountAmount = order.discount?.amount || 0;
  const finalTotal = subtotal - discountAmount;

  return `<!DOCTYPE html>
<html lang="fa">
<head>
  <meta charset="UTF-8">
  <title>فاکتور - ${storeName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Vazirmatn', Tahoma, sans-serif;
      font-size: 12px;
      width: 75mm !important;
      max-width: 75mm !important;
      min-width: 75mm !important;
      margin: 0 0 0 5px !important;   /* فاصله 5px از لبه چپ */
      padding: 3mm 4mm;
      color: #000;
      background: #fff;
      direction: rtl;
      text-align: center;
    }
    .center { text-align: center; }
    .right  { text-align: right; }
    .bold   { font-weight: 700; }
    .divider {
      border-top: 1px dashed #000;
      margin: 5px 0;
    }
    .thick-divider {
      border-top: 2px solid #000;
      margin: 5px 0;
    }
    h1 { font-size: 16px; margin-bottom: 2px; font-weight: 900; text-align: center; }
    .order-number {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: 2px;
      margin: 8px 0;
      padding: 6px 0;
      border-top: 2px dashed #000;
      border-bottom: 2px dashed #000;
      text-align: center;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin: 2px 0;
      font-size: 11px;
    }
    .info-row span:first-child { text-align: right; }
    .info-row span:last-child { text-align: left; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
    }
    th, td {
      font-size: 10px;
      padding: 3px 2px;
      border-bottom: 1px dotted #aaa;
    }
    th { font-weight: 700; background: #f0f0f0; text-align: center; }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      margin: 3px 0;
    }
    .total-row span:first-child { text-align: right; }
    .total-row span:last-child { text-align: left; }
    .grand-total {
      font-size: 14px;
      font-weight: 900;
      color: #000000;
    }
    .footer { margin-top: 8px; font-size: 10px; color: #000000; text-align: center; }
    .customer-name { font-size: 11px; margin: 3px 0; }
    @media print {
      body { 
        width: 75mm !important; 
        margin: 0 0 0 5px !important; 
        padding: 3mm 4mm !important; 
      }
      @page { size: 75mm auto; margin: 0; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="center">
    <h1>${storeName}</h1>
    <div>فاکتور فروش</div>
    <div class="divider"></div>
  </div>

  <div class="center order-number">${orderIdDisplay}</div>

  <div class="info-row">
    <span>نوع سفارش:</span>
    <span class="bold">${orderLabel(order.type)}</span>
  </div>
  <div class="info-row">
    <span>تاریخ:</span>
    <span>${now}</span>
  </div>
  ${order.customer?.name ? `<div class="info-row"><span>مشتری:</span><span class="bold">${order.customer.name}</span></div>` : ""}
  ${order.customer?.phone ? `<div class="info-row"><span>تماس:</span><span dir="ltr" class="bold">${order.customer.phone}</span></div>` : ""}

  ${order.type === 'delivery' ? `<div class="info-row"><span>آدرس:</span><span dir="ltr" class="bold">${order.customer?.address}</span></div>` : ""}

  <div class="thick-divider"></div>

  <table>
    <thead>
      <tr>
        <th>کالا</th>
        <th>تعداد</th>
        <th>قیمت</th>
      </tr>
    </thead>
    <tbody>${cartRows}</tbody>
  </table>

  <div class="thick-divider"></div>

  <div class="total-row">
    <span>جمع کل:</span>
    <span>${formatRial(tomanToRial(cartTotal))} ریال</span>
  </div>
  ${deliveryPrice > 0 ? `
  <div class="total-row">
    <span>هزینه پیک:</span>
    <span>${formatRial(tomanToRial(deliveryPrice))} ریال</span>
  </div>
  ` : ""}
  ${discountAmount > 0 ? `
  <div class="total-row" style="color: #000000;">
    <span>تخفیف (${order.discount?.code || ""}):</span>
    <span>-${formatRial(tomanToRial(discountAmount))} ریال</span>
  </div>
  ` : ""}
  <div class="thick-divider"></div>
  <div class="total-row grand-total">
    <span>مبلغ قابل پرداخت:</span>
    <span>${formatRial(tomanToRial(finalTotal))} ریال</span>
  </div>

  <div class="divider"></div>
  <div class="footer">
    <div>با تشکر از خرید شما</div>
  </div>
</body>
</html>`;
}

export function getKitchenReceiptHTML(order: Order): string {
  const now = new Date().toLocaleString("fa-IR");

  const orderLabel = (t: string) => {
    const map: Record<string, string> = {
      hall: "سالن",
      dine_in: "سالن",
      takeaway: "بیرون‌بر",
      delivery: "پیک",
    };
    return map[t] || t;
  };

  const orderIdDisplay = `${order.orderNumber}`;

  const cartRows = order.cart
    .map(
      (item: CartItem) => {
        const ingredients = item.ingredients;
        const ingredientDescs = ingredients?.length
          ? ingredients
            .map((ing: CartIngredient) => `<div style="font-size: 9px; color: #555;">${ing.desc || ""}</div>`)
            .join("")
          : "";
        return `<tr>
           <td style="text-align: right;">${item.product.name}${ingredientDescs ? `<br/>${ingredientDescs}` : ""}</td>
           <td style="text-align: center;">${new Intl.NumberFormat("fa-IR").format(item.quantity)}</td>
        </tr>`;
      }
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="fa">
<head>
  <meta charset="UTF-8">
  <title>سفارش - ${storeName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Vazirmatn', Tahoma, sans-serif;
      font-size: 13px;
      width: 75mm;
      margin: 0 0 0 5px;          /* فاصله 5px از لبه چپ */
      padding: 3mm 4mm;
      color: #000;
      background: #fff;
      direction: rtl;
      text-align: left;
    }
    .center { text-align: center; }
    .bold   { font-weight: 700; }
    .divider {
      border-top: 1px dashed #000;
      margin: 5px 0;
    }
    h1 { font-size: 16px; margin-bottom: 2px; font-weight: 900; text-align: center; }
    .order-number {
      font-size: 30px;
      font-weight: 900;
      letter-spacing: 2px;
      margin: 8px 0;
      padding: 6px 0;
      border-top: 2px dashed #000;
      border-bottom: 2px dashed #000;
      text-align: center;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin: 3px 0;
      font-size: 12px;
    }
    .info-row span:first-child { text-align: right; }
    .info-row span:last-child { text-align: left; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
    }
    th, td {
      font-size: 12px;
      padding: 4px 2px;
      border-bottom: 1px dotted #aaa;
    }
    th { font-weight: 700; background: #f0f0f0; text-align: center; }
    .footer { margin-top: 8px; font-size: 10px; color: #555; text-align: center; }
    @media print {
      body { width: 75mm; margin: 0 0 0 5px; padding: 3mm 4mm; }
      @page { size: 75mm auto; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="center">
    <h1>${storeName}</h1>
    <div>برگه سفارش</div>
    <div class="divider"></div>
  </div>

  <div class="center order-number">${orderIdDisplay}</div>

  <div class="info-row">
    <span>نوع:</span>
    <span class="bold">${orderLabel(order.type)}</span>
  </div>
  <div class="info-row">
    <span>زمان:</span>
    <span>${now}</span>
  </div>
  ${order.customer?.name ? `<div class="info-row"><span>مشتری:</span><span class="bold">${order.customer.name}</span></div>` : ""}

  <div class="divider"></div>

  <table>
    <thead>
      <tr>
        <th>کالا</th>
        <th>تعداد</th>
      </tr>
    </thead>
    <tbody>${cartRows}</tbody>
  </table>

  <div class="divider"></div>
  <div class="footer">
    <div>سیستم مدیریت ${storeName}</div>
  </div>
</body>
</html>`;
}

export async function printReceipt(html: string): Promise<void> {
  console.log('🖨️ [PRINT] Starting print process...');

  // If running inside Electron, use silent direct printing via IPC
  if (window.electronAPI) {
    try {
      console.log('🖨️ [PRINT] Using Electron printing...');
      // toast.info('در حال ارسال به چاپگر...', { autoClose: 2000 });

      const success = await window.electronAPI.printReceipt(html);

      if (success) {
        console.log('✅ [PRINT] Print successful!');
        toast.success('✅ چاپ با موفقیت انجام شد', { autoClose: 3000 });
      } else {
        console.error('❌ [PRINT] Print failed - printer not available or cancelled');
        toast.error('❌ خطا در چاپ - لطفا اتصال پرینتر را بررسی کنید', { autoClose: 5000 });
      }
      return;
    } catch (err) {
      console.error('❌ [PRINT] Electron print failed:', err);
      toast.error('❌ خطا در چاپ - لطفا اتصال پرینتر را بررسی کنید', { autoClose: 5000 });
      throw err;
    }
  }

  // Fallback: browser print dialog (iframe method)
  console.log('🖨️ [PRINT] Using browser print dialog...');
  // toast.info('در حال باز کردن پنجره چاپ...', { autoClose: 2000 });

  return new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "75mm";        /* تغییر به 75mm */
    iframe.style.height = "1px";
    iframe.style.border = "none";
    iframe.style.visibility = "hidden";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      console.error('❌ [PRINT] Could not create iframe document');
      toast.error('❌ خطا در ایجاد پنجره چاپ', { autoClose: 3000 });
      reject(new Error("Could not create iframe document"));
      return;
    }

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    const printTarget = iframe.contentWindow;
    if (!printTarget) {
      document.body.removeChild(iframe);
      console.error('❌ [PRINT] Could not get iframe contentWindow');
      toast.error('❌ خطا در باز کردن پنجره چاپ', { autoClose: 3000 });
      reject(new Error("Could not get iframe contentWindow"));
      return;
    }

    printTarget.focus();
    setTimeout(() => {
      printTarget.print();
      document.body.removeChild(iframe);
      console.log('✅ [PRINT] Browser print dialog opened');
      resolve();
    }, 100);
  });
}