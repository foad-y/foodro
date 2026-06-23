import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Printer, RefreshCw, Check, XCircle } from "lucide-react";

interface PrinterOption {
  name: string;
  displayName: string;
  status: string;
  isDefault: boolean;
}

export default function PrinterSettings() {
  const [printers, setPrinters] = useState<PrinterOption[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  // Load printers on mount and get current selection
  useEffect(() => {
    loadPrinters();
    loadSelectedPrinter();
  }, []);

  const loadPrinters = async () => {
    if (!window.electronAPI) {
      setConnected(false);
      setPrinters([]);
      return;
    }
    setConnected(true);
    setLoading(true);
    try {
      const list = await window.electronAPI.getPrinters();
      setPrinters(list);
      console.log(`🖨️ [SETTINGS] Loaded ${list.length} printers`);
    } catch (err) {
      console.error("❌ [SETTINGS] Error loading printers:", err);
      toast.error("خطا در دریافت لیست پرینترها");
    } finally {
      setLoading(false);
    }
  };

  const loadSelectedPrinter = async () => {
    if (!window.electronAPI) return;
    try {
      const name = await window.electronAPI.getPrinter();
      if (name) {
        setSelectedPrinter(name);
      }
    } catch (err) {
      console.error("❌ [SETTINGS] Error loading selected printer:", err);
    }
  };

  const handleSelectPrinter = async (printerName: string) => {
    if (!window.electronAPI) {
      toast.error("فقط در نسخه Electron قابل استفاده است");
      return;
    }
    try {
      setSelectedPrinter(printerName);
      await window.electronAPI.setPrinter(printerName);
      toast.success(`✅ پرینتر "${printerName}" انتخاب شد`);
      console.log(`🖨️ [SETTINGS] Printer set to: "${printerName}"`);
    } catch (err) {
      console.error("❌ [SETTINGS] Error setting printer:", err);
      toast.error("خطا در تنظیم پرینتر");
    }
  };

  // ذخیره در localStorage هم به عنوان backup
  const saveToLocalStorage = () => {
    if (selectedPrinter) {
      localStorage.setItem("kaliz-selected-printer", selectedPrinter);
      toast.success("تنظیمات ذخیره شد");
    }
  };

  if (!connected) {
    return (
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-border">
        <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Printer className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-secondary">تنظیمات پرینتر</h3>
        </div>
        <div className="flex items-center gap-3 text-error font-bold py-4 bg-error/10 p-5 rounded-2xl border border-error/20">
          <XCircle className="w-6 h-6" />
          <span>سیستم در حالت نرم‌افزار دسکتاپ (Electron) اجرا نشده است. امکان دسترسی به پرینترها وجود ندارد.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-border">
      <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <Printer className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-secondary">تنظیمات پرینتر</h3>
        </div>
        <button
          onClick={loadPrinters}
          className="p-2 text-secondarytext hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer"
          title="بروزرسانی لیست پرینترها"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-secondarytext font-bold flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin"></div>
          در حال دریافت لیست پرینترها...
        </div>
      ) : printers.length === 0 ? (
        <div className="text-center py-8 text-secondarytext font-bold bg-tertiary/50 rounded-2xl border border-border">
          هیچ پرینتری یافت نشد. لطفا از نصب بودن پرینتر در ویندوز/سیستم‌عامل خود اطمینان حاصل کنید.
        </div>
      ) : (
        <div className="space-y-3">
          {printers.map((printer) => (
            <label
              key={printer.name}
              className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2 ${selectedPrinter === printer.name
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                  : "border-border hover:border-primary/50 hover:bg-tertiary"
                }`}
            >
              <input
                type="radio"
                name="printer"
                checked={selectedPrinter === printer.name}
                onChange={() => handleSelectPrinter(printer.name)}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
              <div className="flex-1">
                <div className="font-bold text-primarytext">{printer.displayName || printer.name}</div>
                <div className="text-sm font-medium text-secondarytext mt-1.5 flex items-center gap-2">
                  {printer.isDefault && (
                    <span className="bg-secondary/10 text-secondary px-2.5 py-0.5 rounded-md text-xs font-bold border border-secondary/20">
                      پیش‌فرض سیستم
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 bg-tertiary px-2.5 py-0.5 rounded-md border border-border text-xs">
                    <span className={`w-2 h-2 rounded-full ${printer.status === 'idle' ? 'bg-success shadow-[0_0_5px_var(--color-success)]' : 'bg-warning'}`}></span>
                    {printer.status === "idle" ? "آماده" : printer.status}
                  </span>
                </div>
              </div>
              {selectedPrinter === printer.name && (
                <Check className="w-6 h-6 text-primary" />
              )}
            </label>
          ))}
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={saveToLocalStorage}
          disabled={!selectedPrinter || loading}
          className="flex-1 bg-success text-white py-3.5 rounded-xl text-base font-bold transition-all hover:shadow-lg hover:shadow-success/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" />
          ذخیره تنظیمات
        </button>
      </div>

      {selectedPrinter && (
        <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-xl text-sm text-success font-medium flex items-center gap-2">
          <Check className="w-5 h-5" />
          <span>پرینتر فعال: <span className="font-bold">{selectedPrinter}</span></span>
        </div>
      )}
    </div>
  );
}