import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Plus, Trash2, LucideIcon } from "lucide-react";
import axiosInstance from "../lib/axiosInstance";
import { useIngredients } from "../hooks/useIngredients";
import { toast } from "react-toastify";
import ImageSelect from "./ImageSelect";
import imageIngredient from "../../ingredients.config.json";

interface Option {
  _id: string;
  name: string;
  img: string;
  price?: number;
}

export interface SelectedIngredient {
  ingredient: Option;
  amount: number;
}

interface MultiSelectProps {
  options: Option[];
  value: SelectedIngredient[];
  onChange: (value: SelectedIngredient[]) => void;
  placeholder?: string;
  icon: LucideIcon;
  showAdd?: boolean;
  showDelete?: boolean;
}

export default function IngredientsSelect({
  options,
  value,
  onChange,
  placeholder = "انتخاب کنید",
  icon: Icon,
  showAdd = true,
  showDelete = true,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [localOptions, setLocalOptions] = useState<Option[]>(options);
  const [addingNew, setAddingNew] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [newIngredient, setNewIngredient] = useState({
    name: "",
    price: "",
    amount: "",
    img: "",
  });

  const { mutateIngredients } = useIngredients();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
        setAddingNew(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option: Option) => {
    const existing = value.find((v) => v.ingredient._id === option._id);
    if (existing) {
      onChange(value.filter((v) => v.ingredient._id !== option._id));
    } else {
      onChange([...value, { ingredient: option, amount: 1 }]);
    }
  };

  const removeItem = (id: string) => {
    onChange(value.filter((v) => v.ingredient._id !== id));
  };

  const addNewIngredient = () => {
    if (!newIngredient.name || !newIngredient.amount) return;

    const id = Date.now().toString(); // تولید آی‌دی موقت
    const ingredient: Option = {
      _id: id,
      img: newIngredient.img,
      name: newIngredient.name,
      price: newIngredient.price ? parseFloat(newIngredient.price) : undefined,
    };

    setLocalOptions([...localOptions, ingredient]);

    onChange([
      ...value,
      { ingredient, amount: parseFloat(newIngredient.amount) },
    ]);

    // ریست کردن فرم
    setNewIngredient({ name: "", price: "", amount: "", img: "" });
    setAddingNew(false);
  };

  const handeldeleteItem = async (id: string) => {
    try {
      await toast.promise(axiosInstance.delete(`/product/ingredient/${id}`), {
        pending: "در حال حذف مواد اولیه...",
        success: "مواد اولیه  با موفقیت حذف شد ✅",
        error: "خطا در حذف مواد اولیه ❌",
      });
      mutateIngredients();
    } catch (err) {
      console.error(err, "err");
    }
  };

  return (
    <div className="relative w-full" ref={ref}>
      <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      {/* Input */}
      <div
        onClick={() => setOpen(!open)}
        className="min-h-12.5 pr-11 w-full border-2 border-border rounded-xl px-3 py-2 bg-white flex flex-wrap items-center gap-2 cursor-pointer focus-within:ring-2 focus-within:ring-primary transition"
      >
        {value.length === 0 && (
          <span className="text-gray-400 text-sm">{placeholder}</span>
        )}

        {value.map((v) => (
          <div
            key={v.ingredient._id}
            className="flex items-center gap-2 bg-gradiantbtnto/15 text-primary px-3 py-1 rounded-full text-sm"
          >
            <span>{v.ingredient.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeItem(v.ingredient._id);
              }}
            >
              <X size={14} />
            </button>
          </div>
        ))}

        <ChevronDown
          className={`mr-auto transition-transform ${open ? "rotate-180" : ""}`}
          size={18}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border rounded-xl shadow-lg max-h-80 overflow-auto animate-in fade-in slide-in-from-top-2 p-2">
          {localOptions.map((item) => {
            const selected = value.some((v) => v.ingredient._id === item._id);

            return (
              <div
                key={item._id}
                onClick={() => toggleOption(item)}
                onMouseEnter={() => setHoveredId(item._id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`flex justify-between items-center px-4 py-2 cursor-pointer hover:bg-gradiantbtnto/15 transition ${
                  selected ? "bg-gradiantbtnto/40" : ""
                }`}
              >
                <span>{item.name}</span>

                <span className="flex items-center gap-2">
                  {item.price && (
                    <span className="text-sm text-gray-500">
                      {item.price} تومان
                    </span>
                  )}

                  {hoveredId === item._id && (
                    <Trash2
                      size={18}
                      className={`${showDelete === false ? "hidden" : "block"} text-red-500 hover:scale-110 transition-transform`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handeldeleteItem(item._id);
                      }}
                    />
                  )}
                </span>
              </div>
            );
          })}

          {/* افزودن جدید */}
          {addingNew ? (
            <div className="flex flex-col gap-2 p-2 border-t mt-2">
              <input
                type="text"
                placeholder="نام"
                className="border border-border rounded px-2 py-1"
                value={newIngredient.name}
                onChange={(e) =>
                  setNewIngredient({ ...newIngredient, name: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="قیمت"
                className="border border-border rounded px-2 py-1"
                value={newIngredient.price}
                onChange={(e) =>
                  setNewIngredient({ ...newIngredient, price: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="تعداد"
                className="border border-border rounded px-2 py-1"
                value={newIngredient.amount}
                onChange={(e) =>
                  setNewIngredient({ ...newIngredient, amount: e.target.value })
                }
              />

              <ImageSelect
                images={imageIngredient ?? []}
                onChange={(val) =>
                  setNewIngredient({ ...newIngredient, img: val })
                }
                value={newIngredient.img}
                placeholder="انتخاب عکس"
              />
              <div className="flex gap-2">
                <button
                  className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                  onClick={addNewIngredient}
                >
                  افزودن
                </button>
                <button
                  className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
                  onClick={() => setAddingNew(false)}
                >
                  انصراف
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingNew(true)}
              className={`${showAdd === false ? "hidden" : "flex"} items-center gap-2 w-full px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg cursor-pointer`}
            >
              <Plus size={14} /> افزودن مواد اولیه جدید
            </button>
          )}
        </div>
      )}
    </div>
  );
}
