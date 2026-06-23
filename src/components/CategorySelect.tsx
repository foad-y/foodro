import { useState, useRef, useEffect } from "react";
import { ChevronDown, LucideIcon, Plus, Trash2 } from "lucide-react";
import ImageSelect from "./ImageSelect";
import axiosInstance from "../lib/axiosInstance";
import { useCategories } from "../hooks/useCategory";
import { toast } from "react-toastify";
import imageCategory from "../../category.config.json";

interface Option {
  _id: string;
  name: string;
  img?: string;
}

interface SingleSelectProps {
  options: Option[];
  value: string | { name: string; img: string } | "";
  onChange: (value: any) => void;
  placeholder: string;
  icon: LucideIcon;
  showAdd?: boolean;
  showDelete?: boolean;
}

export default function CategorySelect({
  options,
  value,
  onChange,
  placeholder,
  icon: Icon,
  showAdd = true,
  showDelete = true,
}: SingleSelectProps) {
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    img: "",
  });

  const { mutateCategories } = useCategories();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
        setAdding(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedItem =
    typeof value === "string" ? options.find((o) => o._id === value) : null;

  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.img) return;

    onChange(newCategory);
    setOpen(false);
    setAdding(false);
  };

  const handeldeleteItem = async (id: string) => {
    try {
      await toast.promise(axiosInstance.delete(`/product/category/${id}`), {
        pending: "در حال حذف دسته بندی...",
        success: "دسته بندی  با موفقیت حذف شد ✅",
        error: "خطا در حذف دسته بندی ❌",
      });
      mutateCategories();
    } catch (err) {
      console.error(err, "err");
    }
  };
  return (
    <div className="relative w-full" ref={ref}>
      <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      {/* Trigger */}
      <div
        onClick={() => setOpen(!open)}
        className="min-h-12.5 pr-11 w-full border-2 bg-white border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer"
      >
        <span className={!value ? "text-gray-400" : ""}>
          {selectedItem
            ? selectedItem.name
            : typeof value === "object"
              ? value.name
              : placeholder}
        </span>

        <ChevronDown
          className={`transition-transform text-gray-400 ${open ? "rotate-180" : ""}`}
          size={18}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border rounded-xl shadow-lg p-2 space-y-2">
          {/* لیست دسته‌بندی‌ها */}
          {!adding &&
            options.map((item) => (
              <div
                key={item._id}
                onClick={() => {
                  onChange(item._id);
                  setOpen(false);
                }}
                onMouseEnter={() => setHoveredId(item._id)}
                onMouseLeave={() => setHoveredId(null)}
                className="px-4 py-2 flex justify-between hover:bg-gradiantbtnto/30 rounded-lg cursor-pointer"
              >
                {item.name}
                {hoveredId === item._id && (
                  <Trash2
                    size={18}
                    className={`${showDelete === false ? "hidden" : "block"} text-orange-600 hover:scale-110 transition-transform`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handeldeleteItem(item._id);
                    }}
                  />
                )}
              </div>
            ))}

          {/* افزودن */}
          {!adding && (
            <div
              onClick={() => setAdding(true)}
              className={`${showAdd === false ? "hidden" : "flex"} items-center gap-2 px-4 py-2 text-primary hover:bg-gradiantbtnto/40 rounded-lg cursor-pointer`}
            >
              <Plus size={16} />
              افزودن دسته‌بندی
            </div>
          )}

          {/* فرم افزودن */}
          {adding && (
            <div className="space-y-2 p-2 border-t">
              <input
                type="text"
                placeholder="نام دسته‌بندی"
                className="w-full border border-border rounded-lg px-3 py-2"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
              />

              <ImageSelect
                images={imageCategory ?? []}
                value={newCategory.img}
                onChange={(val) => setNewCategory({ ...newCategory, img: val })}
              />

              <div className="flex gap-2">
                <button
                  onClick={handleAddCategory}
                  className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
                >
                  ثبت دسته‌بندی
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  انصراف
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
