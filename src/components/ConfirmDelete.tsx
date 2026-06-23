import { Info, Trash2 } from "lucide-react";
import React from "react";

interface props {
  open: () => void;
  title: string;
  description: string;
  onConfirm: () => void;
  actions?: string[];
  icon?: any;
  color?: string;
}

const ConfirmDelete: React.FC<props> = ({
  open,
  title,
  description,
  onConfirm,
  actions = ["انصراف", "حذف"],
  icon,
  color = "error",
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        dir="rtl"
        className="bg-white w-[90%] max-w-sm rounded-xl shadow-xl p-4 animate-scaleIn"
      >
        {/* Header */}
        <div className="flex items-center gap-2 text-error font-bold text-md mb-3">
          {icon || <Trash2 className="w-5 h-5" />}
          {title || "حذف"}
        </div>

        {/* Body */}
        <p className="text-sm text-gray-600 leading-6 mb-1">
          {description || "آیا مطمئن هستید؟"}
        </p>
        <div className="flex flex-col text-white gap-1 text-sm mb-5 bg-error rounded-xl p-2" >
          <h3>
            هشدار !! :
          </h3>
          <div className="flex gap-2 items-center">
            <Info className="h-4 w-4" />
            <p>
              با انجام بروزرسانی سفارش های در انتظار پاک می شوند.
            </p>
          </div>
        </div>
        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={open}
            className="flex-1 cursor-pointer border border-gray-300 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-100 transition"
          >
            {actions[0]}
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 cursor-pointer bg-error text-white text-sm py-2 rounded-lg hover:bg-red-700 transition"
          >
            {actions[1]}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDelete;
