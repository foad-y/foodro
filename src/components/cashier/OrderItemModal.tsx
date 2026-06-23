// OrderItemsModal.tsx
import React, { useEffect, useRef, useState } from "react";
import { X, Utensils } from "lucide-react";
import { CartItem } from "../../store/useProduct";

interface OrderItemsModalProps {
    cart: CartItem[];
    isOpen: boolean;
    onClose: () => void;
    triggerRef: React.RefObject<HTMLDivElement>;
}

const OrderItemsModal: React.FC<OrderItemsModalProps> = ({
    cart,
    isOpen,
    onClose,
    triggerRef,
}) => {
    const [animating, setAnimating] = useState(false);
    const [visible, setVisible] = useState(false);
    const [origin, setOrigin] = useState("50% 50%");
    const modalRef = useRef<HTMLDivElement>(null);
    console.log(cart, 'cart');

    useEffect(() => {
        if (isOpen) {
            // محاسبه transform-origin بر اساس موقعیت المان trigger
            if (triggerRef?.current && modalRef?.current) {
                const triggerRect = triggerRef.current.getBoundingClientRect();
                const modalRect = modalRef.current.getBoundingClientRect();

                const originX = ((triggerRect.left + triggerRect.width / 2 - modalRect.left) / modalRect.width) * 100;
                const originY = ((triggerRect.top + triggerRect.height / 2 - modalRect.top) / modalRect.height) * 100;

                setOrigin(`${originX}% ${originY}%`);
            }
            setVisible(true);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setAnimating(true));
            });
        } else {
            setAnimating(false);
            const timer = setTimeout(() => setVisible(false), 350);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!visible) return null;

    return (
        <div
            className="absolute inset-0 z-50"
            dir="rtl"
        >
            {/* Backdrop */}
            {/* <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          animating ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      /> */}

            {/* Modal */}
            <div
                ref={modalRef}
                style={{
                    transformOrigin: origin,
                    transform: animating ? "scale(1)" : "scale(0.9)",
                    opacity: animating ? 1 : 0,
                    transition: animating
                        ? "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease"
                        : "transform 0.28s cubic-bezier(0.4, 0, 1, 1), opacity 0.2s ease",
                }}
                className=" absolute left-2 right-2 top-2 bottom-2 bg-white rounded-2xl shadow-2xl overflow-hidden  flex flex-col border border-border"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-tertiary/30">
                    <div className="flex items-center gap-2 text-secondary">
                        <Utensils className="w-4 h-4" />
                        <span className="font-bold text-sm">اقلام سفارش</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-tertiary hover:bg-border active:scale-95 transition-all"
                    >
                        <X className="w-4 h-4 text-secondarytext" />
                    </button>
                </div>

                {/* Items */}
                <div className="divide-y divide-border flex-1 overflow-y-auto scrollbar-hide">
                    {cart.map((item, i) => (
                        <div key={i} className="flex border border-border m-2 rounded-2xl items-center gap-3 px-4 py-3 hover:bg-tertiary/30 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-tertiary flex items-center justify-center shrink-0 overflow-hidden border border-border">
                                <img
                                    src={item.product.img}
                                    alt={item.product.name}
                                    className="w-7 h-7 object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-primarytext truncate">
                                    {item.product.name}
                                </p>
                                {
                                    item?.ingredients?.length > 0 &&
                                    <div className="flex gap-2 bg-tertiary rounded-lg my-1 flex-wrap p-1 border border-border" >
                                        {item?.ingredients?.map((ing, i) => (
                                            <div
                                                className="flex gap-1 items-center"
                                                key={i}
                                            >
                                                <span className="w-3 h-3 rounded-full bg-secondarytext flex justify-center items-center text-[10px] text-white">
                                                    {ing.count}
                                                </span>
                                                <div className="flex text-secondarytext text-xs font-medium flex-nowrap">{ing.desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                }
                                <p className="text-xs text-tertiarytext mt-0.5 font-medium">
                                    {item.product.price.toLocaleString("fa-IR")} تومان
                                </p>
                            </div>
                            <div className="shrink-0">
                                <span className="text-xs font-bold text-white bg-primary px-2 py-1 rounded-full shadow-sm">
                                    ×{item.quantity}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer total */}
                <div className="px-4 py-3 bg-tertiary/50 border-t border-border flex justify-between items-center">
                    <span className="text-xs font-bold text-secondarytext">
                        {cart.reduce((sum, i) => sum + i.quantity, 0)} مورد
                    </span>
                    <span className="text-sm font-bold text-error">
                        {cart
                            .reduce((sum, i) => sum + i.product.price * i.quantity, 0)
                            .toLocaleString("fa-IR")}{" "}
                        تومان
                    </span>
                </div>
            </div>
        </div>
    );
};

export default OrderItemsModal;