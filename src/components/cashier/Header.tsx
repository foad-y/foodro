import React, { useState } from "react";
import PersianClock from "../PersianClock";
import { useNavigate } from "react-router-dom";
import { Home, LogOut, Printer, RotateCcw, User2, Settings } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { toast } from "react-toastify";
import { usePosStore } from "../../store/useProduct";
import PrinterSettingsModal from "../PrinterSettingsModal";

interface PropsType {
  SidbarOpen: () => void;
  ConfirmDelete: () => void;
  openModalOrderDelivered: () => void;
}

const Header: React.FC<PropsType> = ({
  SidbarOpen,
  ConfirmDelete,
  openModalOrderDelivered,
}) => {
  const { user, logout } = useAuthStore();
  const { orders } = usePosStore();
  const navigate = useNavigate();
  const [showPrinterModal, setShowPrinterModal] = useState(false);

  const handleSignOut = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="px-4 pt-3 pb-1">
      <div className="flex bg-white/80 backdrop-blur-md border border-border shadow-sm py-3 px-5 rounded-2xl justify-between items-center">
        <div className="flex gap-2 items-center xl:gap-4">
          <button className="lg:hidden cursor-pointer text-secondarytext hover:text-primary" onClick={SidbarOpen}>
            ☰
          </button>
          <span className="flex items-center text-secondarytext text-xs lg:text-sm px-3 py-1.5 rounded-lg bg-tertiary border border-border">
            <span className="ml-2 text-primary">
              <User2 className="w-4 h-4" />
            </span>
            <span className="font-medium ml-1">نام کاربری:</span>
            <span className="text-primarytext font-bold lg:text-sm text-xs">{user?.name}</span>
          </span>
          <div className="border-border h-6 hidden lg:block border-l"></div>
          <div className="flex gap-4 items-center">
            <PersianClock className="text-xs lg:text-sm font-bold text-secondarytext" />
          </div>
        </div>

        <div className="flex gap-2.5 items-center">
          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center text-xs xl:text-sm font-bold gap-2 cursor-pointer h-9 bg-primary/10 text-primary border border-primary/20 px-4 py-1 rounded-xl hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
            >
              <Home className="w-4 h-4" />
              مدیریت
            </button>
          )}
          <button
            onClick={() => setShowPrinterModal(true)}
            className="flex items-center justify-center text-xs xl:text-sm gap-2 h-9 w-9 bg-tertiary text-secondarytext border border-border rounded-xl hover:text-primary hover:border-primary/50 transition-all"
            title="تنظیمات پرینتر"
          >
            <Settings className="w-4 h-4" />
          </button>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => {
                if (orders.filter((o) => o.status === "pending").length)
                  return toast.warning("لطفا در ابتدا تکلیف سفارشات در انتظار را معلوم کنید");
                ConfirmDelete();
              }}
              className="flex items-center font-bold text-xs cursor-pointer xl:text-sm h-9 gap-2 bg-tertiary text-secondarytext border border-border px-4 py-1 rounded-xl hover:bg-warning hover:text-white hover:border-transparent transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              بروزرسانی
            </button>

            <button
              onClick={openModalOrderDelivered}
              className="flex items-center font-bold cursor-pointer text-xs xl:text-sm h-9 gap-2 bg-tertiary text-secondarytext border border-border px-4 py-1 rounded-xl hover:bg-primary hover:text-white hover:border-transparent transition-all"
            >
              <Printer className="w-4 h-4" />
              تاریخچه سفارشات
            </button>
          </div>
          <div className="border-border border-l h-6 mx-1"></div>
          <button
            onClick={handleSignOut}
            className="flex items-center cursor-pointer h-9 font-bold text-xs xl:text-sm justify-center gap-2 bg-error/10 text-error border border-error/20 px-4 py-1 rounded-xl hover:bg-error hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>

      </div>
      <PrinterSettingsModal
        open={showPrinterModal}
        onClose={() => setShowPrinterModal(false)}
      />
    </div>
  );
};

export default Header;