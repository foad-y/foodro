import { useState, useEffect } from "react";
import { Printer, RefreshCw, Check, XCircle, X } from "lucide-react";
import { toast } from "react-toastify";

interface PrinterOption {
    name: string;
    displayName: string;
    isDefault: boolean;
}

interface PropsType {
    open: boolean;
    onClose: () => void;
}

export default function PrinterSettingsModal({ open, onClose }: PropsType) {
    const [printers, setPrinters] = useState<PrinterOption[]>([]);
    const [selectedPrinter, setSelectedPrinter] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [connected, setConnected] = useState(false);

    // Load printers on mount and get current selection
    useEffect(() => {
        if (open) {
            loadPrinters();
            loadSelectedPrinter();
        }
    }, [open]);

    const loadPrinters = async () => {
        if (!window.electronAPI) {
            setConnected(false);
            setPrinters([]);
            return;
        }
        setIsLoading(true);
        setConnected(true);
        try {
            if (!window.electronAPI) {
                setPrinters([]);
                setIsLoading(false);
                return;
            }

            const list = await window.electronAPI.getPrinters();
            setPrinters(list);
            console.log(`🖨️ [SETTINGS] Loaded ${list.length} printers`);
        } catch (err) {
            console.error("❌ [SETTINGS] Error loading printers:", err);
            toast.error("خطا در دریافت لیست پرینترها");
        } finally {
            setIsLoading(false);
        }
    };

    const loadSelectedPrinter = async () => {
        try {
            if (!window.electronAPI) return;

            const name = await window.electronAPI.getPrinter();
            if (name) {
                setSelectedPrinter(name);
            }
        } catch (err) {
            console.error("❌ [SETTINGS] Error loading selected printer:", err);
        }
    };

    const handleSelectPrinter = async (printerName: string) => {
        try {
            if (!window.electronAPI) {
                toast.error("فقط در نسخه Electron قابل استفاده است")
                return;
            }

            setSelectedPrinter(printerName);
            await window.electronAPI.setPrinter(printerName);
            toast.success(`✅ پرینتر "${printerName}" انتخاب شد`);
            console.log(`🖨️ [SETTINGS] Printer set to: "${printerName}"`);
        } catch (err) {
            console.error("❌ [SETTINGS] Error setting printer:", err);
            toast.error("خطا در تنظیم پرینتر");
        }
    };

    useEffect(() => {
        if (selectedPrinter) {
            localStorage.setItem("kaliz-selected-printer", selectedPrinter);
        }
    }, [selectedPrinter]);

    if (!open) return null;

    if (!connected) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <Printer className="w-6 h-6 text-primary" />
                            <h3 className="text-lg font-semibold">تنظیمات پرینتر</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 py-4">
                        <XCircle className="w-5 h-5 text-red-400" />
                        <span>سیستم در حالت Electron اجرا نشده است</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <Printer className="w-6 h-6 text-orange-500" />
                        <h3 className="text-lg font-semibold">تنظیمات پرینتر</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="border-2 border-gray-100 rounded-xl p-4">
                    {isLoading ? (
                        <div className="text-center py-4 text-gray-500">
                            در حال دریافت لیست پرینترها...
                        </div>
                    ) : printers.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">
                            هیچ پرینتری یافت نشد. لطفا از نصب بودن پرینتر اطمینان حاصل کنید.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {printers.map((printer) => (
                                <div
                                    key={printer.name}
                                    onClick={() => handleSelectPrinter(printer.name)}
                                    className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between ${selectedPrinter === printer.name
                                        ? "bg-orange-100 border-2 border-orange-500"
                                        : "bg-gray-50 border-2 border-gray-200 hover:border-orange-300"
                                        }`}
                                >
                                    <div>
                                        <p className="font-semibold text-sm text-gray-800">
                                            {printer.displayName}
                                        </p>
                                        {printer.isDefault && (
                                            <p className="text-xs text-gray-500">
                                                (پرینتر پیش‌فرض)
                                            </p>
                                        )}
                                    </div>
                                    {selectedPrinter === printer.name && (
                                        <Check className="w-5 h-5 text-orange-500" />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Refresh Button */}
                <button
                    onClick={loadPrinters}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg transition-colors"
                    title="بروزرسانی لیست پرینترها"
                >
                    <RefreshCw className="w-4 h-4" />
                    بروزرسانی لیست
                </button>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-colors"
                >
                    بستن
                </button>
            </div>
        </div>
    );
}
