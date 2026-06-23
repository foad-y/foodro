import { DashboardStats } from '../../hooks/useDashboard';
import { toast } from 'react-toastify';
import config from '../../../site.config.json';
interface PrintReceiptProps {
  stats: DashboardStats;
  periodLabel: string;
  storeName?: string;
}

function getPrintReceiptHTML(
  stats: DashboardStats,
  periodLabel: string,
  storeName = config.marketName
): string {
  const now = new Date().toLocaleString('fa-IR');
  const { summary, byType, topProducts } = stats;

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('fa-IR').format(n) + ' تومان';

  const typeLabel = (t: string) => {
    const map: Record<string, string> = {
      hall: 'سالن',
      dine_in: 'سالن',
      takeaway: 'بیرون‌بر',
      delivery: 'پیک',
    };
    return map[t] || t;
  };

  const topRows = topProducts
    .map(
      (p, i) =>
        `<tr>
           <td style="text-align: center;">${i + 1}</td>
           <td style="text-align: right;">${p.name}</td>
           <td style="text-align: center;">${new Intl.NumberFormat('fa-IR').format(p.totalSold)} عدد</td>
           <td style="text-align: left;">${new Intl.NumberFormat('fa-IR').format(p.totalRevenue)}</td>
        </tr>`
    )
    .join('');

  const orderTypeRows = Object.entries(byType)
    .filter(([, v]) => v > 0)
    .map(
      ([k, v]) =>
        `<tr>
           <td style="text-align: right;">${typeLabel(k)}</td>
           <td style="text-align: center;">${new Intl.NumberFormat('fa-IR').format(v)}</td>
        </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="fa">
<head>
  <meta charset="UTF-8">
  <title>گزارش فروش - ${storeName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Vazirmatn', Tahoma, sans-serif;
      font-size: 12px;
      width: 75mm;
      margin: 0 0 0 5px;
      padding: 2mm 3mm;
      background: #fff;
      color: #000;
      direction: rtl;
      text-align: right;
    }
    .center {
      text-align: center;
    }
    .bold {
      font-weight: bold;
    }
    .divider {
      border-top: 1px dashed #000;
      margin: 4px 0;
    }
    h1 {
      font-size: 18px;
      margin-bottom: 2px;
      text-align: center;
    }
    h2 {
      font-size: 13px;
      margin: 6px 0 3px;
      border-bottom: 1px solid #000;
      padding-bottom: 2px;
      text-align: right;
    }
    .kpi-row {
      display: flex;
      justify-content: space-between;
      margin: 3px 0;
    }
    .kpi-row span:first-child {
      text-align: right;
    }
    .kpi-row span:last-child {
      text-align: left;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
    }
    th, td {
      font-size: 10px;
      padding: 2px 3px;
      border-bottom: 1px dotted #aaa;
    }
    th {
      font-weight: bold;
      background: #f0f0f0;
      text-align: center;
    }
    .footer {
      margin-top: 8px;
      font-size: 10px;
      color: #000000;
      text-align: center;
    }
    @media print {
      body {
        width: 75mm;
        margin: 0 0 0 5px;
        padding: 2mm 3mm;
      }
      @page {
        size: 75mm auto;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="center">
    <h1>${storeName}</h1>
    <div>گزارش فروش</div>
    <div class="divider"></div>
    <div>${periodLabel}</div>
    <div>چاپ: ${now}</div>
    <div class="divider"></div>
  </div>

  <h2>خلاصه فروش</h2>
  <div class="kpi-row"><span>تعداد سفارشات:</span><span class="bold">${new Intl.NumberFormat('fa-IR').format(summary.totalOrders)}</span></div>
  <div class="kpi-row"><span>مجموع درآمد:</span><span class="bold">${formatPrice(summary.totalRevenue)}</span></div>
  <div class="kpi-row"><span>مشتریان یکتا:</span><span class="bold">${new Intl.NumberFormat('fa-IR').format(summary.uniqueCustomers)}</span></div>

  <div class="divider"></div>

  <h2>لیست سفارشات</h2>
  <table>
    <thead>
      <tr>
        <th>نوع سفارش</th>
        <th>تعداد</th>
      </tr>
    </thead>
    <tbody>${orderTypeRows}</tbody>
  </table>

  ${topProducts.length > 0 ? `
  <div class="divider"></div>
  <h2>پرفروش‌ترین محصولات</h2>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>نام</th>
        <th>تعداد</th>
        <th>درآمد (ت)</th>
      </tr>
    </thead>
    <tbody>${topRows}</tbody>
  </table>
  ` : ''}

  <div class="divider"></div>
  <div class="center footer">
    <div>سیستم مدیریت ${storeName}</div>
  </div>
</body>
</html>`;
}

export default function PrintReceipt({ stats, periodLabel, storeName }: PrintReceiptProps) {
  const handlePrint = async () => {
    console.log('🖨️ [PRINT] Starting dashboard report print...');
    const html = getPrintReceiptHTML(stats, periodLabel, storeName);

    if (window.electronAPI) {
      try {
        console.log('🖨️ [PRINT] Using Electron printing...');
        // toast.info('در حال ارسال گزارش به چاپگر...', { autoClose: 2000 });

        const success = await window.electronAPI.printReceipt(html);

        if (success) {
          console.log('✅ [PRINT] Dashboard report printed successfully!');
          toast.success('✅ گزارش با موفقیت چاپ شد', { autoClose: 3000 });
        } else {
          console.error('❌ [PRINT] Print failed - printer not available');
          toast.error('❌ خطا در چاپ - لطفا اتصال پرینتر را بررسی کنید', { autoClose: 5000 });
        }
        return;
      } catch (err) {
        console.error('❌ [PRINT] Electron print failed:', err);
        toast.error('❌ خطا در چاپ گزارش', { autoClose: 5000 });
      }
    }

    // Fallback: browser print dialog
    console.log('🖨️ [PRINT] Using browser print dialog...');
    // toast.info('در حال باز کردن پنجره چاپ...', { autoClose: 2000 });

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '2';
    iframe.style.bottom = '0';
    iframe.style.width = '75mm';
    iframe.style.height = '1px';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      console.error('❌ [PRINT] Could not create iframe document');
      toast.error('❌ خطا در ایجاد پنجره چاپ', { autoClose: 3000 });
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
      return;
    }

    printTarget.focus();
    setTimeout(() => {
      printTarget.print();
      document.body.removeChild(iframe);
      console.log('✅ [PRINT] Browser print dialog opened');
    }, 500);
  };

  return (
    <button
      onClick={handlePrint}
      className="flex cursor-pointer items-center gap-2 bg-linear-to-r from-blue-500 to-blue-400 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
    >
      🖨️ <span>چاپ فیش</span>
    </button>
  );
}