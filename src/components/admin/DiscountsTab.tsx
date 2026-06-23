import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Search,
  BadgePercent,
  User,
} from "lucide-react";
import {
  useDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  Discount,
  CreateDiscountInput,
} from "../../hooks/useDiscount";
import { useCustomers } from "../../hooks/useCustomer";
import { toast } from "react-toastify";
import Select from "../select";
import IngredientsSelect, { SelectedIngredient } from "../IngredientsSelect";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import DateObject from 'react-date-object';
import moment from "jalali-moment";
import { formatPriceInput, parsePriceInput } from "../../utils/price";
import axios from "axios";
import Pagination from "../ui/Pagination";

const typeOptions = [
  { value: "percent", label: "درصدی" },
  { value: "fixed", label: "مبلغ ثابت" },
];

const emptyForm: CreateDiscountInput = {
  code: "",
  name: "",
  description: "",
  type: "percent",
  value: 0,
  maxAmount: undefined,
  minOrderAmount: undefined,
  totalAmount: undefined,
  expiresAt: "",
  isActive: true,
  allowedUsers: [],
};

export default function DiscountsTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreateDiscountInput>({ ...emptyForm });
  const [selectedUsers, setSelectedUsers] = useState<SelectedIngredient[]>([]);

  const { discounts, pagination, isLoading, mutateDiscounts } = useDiscounts({
    page,
    limit: 10,
    search,
    isActive: isActiveFilter,
  });

  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || page;

  const { customers } = useCustomers({ limit: 100, page: 1, search: "" });

  const customerOptions = (customers || []).map((c) => ({
    _id: c._id,
    name: c.name || c.phone || "مشتری",
    img: "",
    price: undefined,
  }));

  const isAxiosError = (error: unknown): error is axios.AxiosError => {
    return axios.isAxiosError(error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || formData.value <= 0) {
      toast.error("کد و مقدار تخفیف را وارد کنید");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        allowedUsers: selectedUsers.map((s) => s.ingredient._id),
      };
      if (editingId) {
        await updateDiscount(editingId, payload);
        toast.success("کد تخفیف با موفقیت ویرایش شد ✅");
      } else {
        await createDiscount(payload);
        toast.success("کد تخفیف با موفقیت ایجاد شد ✅");
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ ...emptyForm });
      setSelectedUsers([]);
      mutateDiscounts();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const msg =
          err?.response?.data?.message || "خطا در ذخیره کد تخفیف";
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingId(discount._id);
    setFormData({
      code: discount.code,
      name: discount.name,
      description: discount.description || "",
      type: discount.type,
      value: discount.value,
      maxAmount: discount.maxAmount,
      minOrderAmount: discount.minOrderAmount,
      totalAmount: discount.totalAmount,
      expiresAt: discount.expiresAt || "",
      isActive: discount.isActive,
      allowedUsers: discount.allowedUsers || [],
    });
    setSelectedUsers(
      (discount.allowedUsers || [])
        .map((uid) => {
          const c = customers?.find((c) => c._id === uid);
          return c
            ? { ingredient: { _id: c._id, name: c.name || c.phone || "", img: "" }, amount: 1 }
            : null;
        })
        .filter(Boolean) as SelectedIngredient[]
    );
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDiscount(id);
      toast.success("کد تخفیف حذف شد ✅");
      mutateDiscounts();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const msg =
          err?.response?.data?.message || "خطا در حذف کد تخفیف";
        toast.error(msg);
      }
    }
  };

  const handelChangeStatus = async (status: object, id: string) => {
    try {
      await updateDiscount(id, status);
      toast.success('وضعیت کد تخفیف با موفقیت تغییر کرد');
      mutateDiscounts();
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const msg =
          err?.response?.data?.message || "خطا در تغییر وضعیت کد تخفیف";
        toast.error(msg);
      }
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ ...emptyForm });
    setSelectedUsers([]);
  };

  const getTypeLabel = (type: string) =>
    type === "percent" ? "درصدی" : "مبلغ ثابت";

  const getStatusBadge = (isActive: boolean, expiresAt: string) => {
    const expired = expiresAt && new Date(expiresAt) < new Date();
    if (expired)
      return (
        <span className="px-3 py-1 text-xs rounded-full bg-tertiary text-secondarytext border border-border font-bold">
          منقضی
        </span>
      );
    return isActive ? (
      <span className="px-3 py-1 text-xs rounded-full bg-success/10 text-success border border-success/20 font-bold">
        فعال
      </span>
    ) : (
      <span className="px-3 py-1 text-xs rounded-full bg-error/10 text-error border border-error/20 font-bold">
        غیرفعال
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-secondary">
            کدهای تخفیف
          </h2>
          <p className="text-secondarytext font-medium mt-1">مدیریت کدهای تخفیف فروشگاه</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ ...emptyForm });
            setSelectedUsers([]);
          }}
          className="flex cursor-pointer items-center gap-2 bg-linear-to-r from-gradiantbtnfrom to-gradiantbtnto text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 font-bold"
        >
          <Plus className="w-5 h-5" />
          ایجاد کد تخفیف
        </button>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 flex gap-3 flex-col h-15 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiarytext" />
          <input
            type="text"
            placeholder="جستجوی کد تخفیف..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pr-12 pl-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden"
          />
        </div>

        <div className="w-30">
          <Select
            value={isActiveFilter}
            options={[
              { value: "true", label: "فعال" },
              { value: "false", label: "غیر فعال" }
            ]}
            onChange={(val) => {
              setIsActiveFilter(val);
              setPage(1);
            }}
            placholder="همه"
          />
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white p-8 rounded-3xl mb-8 border border-border shadow-xl">
          <h3 className="text-2xl font-bold text-secondary mb-6 flex items-center gap-2">
            {editingId ? (
              <>
                <Edit className="w-6 h-6 text-primary" />
                ویرایش کد تخفیف
              </>
            ) : (
              <>
                <BadgePercent className="w-6 h-6 text-primary" />
                ایجاد کد تخفیف جدید
              </>
            )}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* کد تخفیف */}
              <div className="group">
                <label className="block text-sm font-bold text-secondary mb-2">
                  کد تخفیف *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden direction-ltr"
                  placeholder="مثال: WELCOME10"
                  required
                />
              </div>
              {/* نام */}
              <div className="group">
                <label className="block text-sm font-bold text-secondary mb-2">
                  نام تخفیف
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden"
                  placeholder="مثال: تخفیف ۱۰ درصدی تابستانه"
                />
              </div>
              {/* نوع */}
              <Select
                icon={BadgePercent}
                value={formData.type}
                titel="نوع تخفیف"
                options={typeOptions}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    type: val as "percent" | "fixed",
                  })
                }
              />
              {/* مقدار */}
              <div className="group">
                <label className="block text-sm font-bold text-secondary mb-2">
                  مقدار تخفیف
                </label>
                {formData.type === 'fixed' ? (
                  <input
                    type="text"
                    value={formatPriceInput(formData.value)}
                    onChange={(e) =>
                      setFormData({ ...formData, value: Number(parsePriceInput(e.target.value)) })
                    }
                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden"
                    placeholder="مثال: 100,000"
                    required
                    min={1}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: Number(e.target.value) })
                    }
                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden"
                    placeholder="مثال: 10"
                    required
                    min={1}
                  />
                )}
              </div>
              {/* حداکثر مبلغ (برای درصدی) */}
              {formData.type === "percent" && (
                <div className="group">
                  <label className="block text-sm font-bold text-secondary mb-2">
                    حداکثر مبلغ تخفیف (تومان)
                  </label>
                  <input
                    type="text"
                    min={0}
                    value={formatPriceInput(formData.maxAmount || "")}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxAmount: parsePriceInput(e.target.value)
                          ? Number(parsePriceInput(e.target.value))
                          : undefined,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden"
                    placeholder="مثال: 50,000"
                  />
                </div>
              )}
              {/* حداقل مبلغ سفارش */}
              <div className="group">
                <label className="block text-sm font-bold text-secondary mb-2">
                  حداقل مبلغ سفارش (تومان)
                </label>
                <input
                  type="text"
                  min={0}
                  value={formatPriceInput(formData.minOrderAmount || "")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minOrderAmount: e.target.value
                        ? Number(parsePriceInput(e.target.value))
                        : undefined,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden"
                  placeholder="مثال: 100,000"
                />
              </div>
              {/* تعداد کل */}
              <div className="group">
                <label className="block text-sm font-bold text-secondary mb-2">
                  تعداد کل دفعات استفاده
                </label>
                <input
                  type="number"
                  value={formData.totalAmount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalAmount: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden"
                  placeholder="مثال: 100"
                />
              </div>
              {/* تاریخ انقضا */}
              <div className="group">
                <label className="block text-sm font-bold text-secondary mb-2">
                  تاریخ انقضا
                </label>
                <div className="relative">
                  <DatePicker
                    calendar={persian}
                    locale={persian_fa}
                    className="custom-calendar"
                    value={formData.expiresAt ? new DateObject({ date: new Date(formData.expiresAt), calendar: persian, locale: persian_fa }) : null}
                    onChange={(date) => {
                      if (!date) return;
                      setFormData({ ...formData, expiresAt: date.toDate().toISOString() });
                    }}
                    format="YYYY/MM/DD"
                    inputClass="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden"
                    containerClassName="w-full"
                    calendarPosition="bottom-right"
                    fixMainPosition
                    placeholder="انتخاب تاریخ"
                  />
                </div>
              </div>
            </div>

            {/* توضیحات */}
            <div className="group pt-2">
              <label className="block text-sm font-bold text-secondary mb-2">
                توضیحات
              </label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden"
                rows={3}
                placeholder="توضیحات تکمیلی درباره کد تخفیف..."
              />
            </div>

            {/* اختصاص به کاربران */}
            <div className="group">
              <label className="block text-sm font-bold text-secondary mb-2">
                اختصاص به کاربران (اختیاری)
              </label>
              <IngredientsSelect
                options={customerOptions}
                value={selectedUsers}
                onChange={setSelectedUsers}
                placeholder="انتخاب کاربران (خالی = همه کاربران)"
                icon={User}
                showAdd={false}
                showDelete={false}
              />
              <p className="text-xs text-secondarytext font-medium mt-1.5">
                اگر کاربری انتخاب نشود، کد تخفیف برای همه کاربران معتبر خواهد بود.
              </p>
            </div>

            {/* وضعیت فعال/غیرفعال */}
            <div className="flex items-center gap-3 pt-2">
              <label className="text-sm font-bold text-secondary">وضعیت کد تخفیف:</label>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, isActive: !formData.isActive })
                }
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  formData.isActive
                    ? "bg-success/10 text-success border-2 border-success/30 hover:bg-success/20"
                    : "bg-error/10 text-error border-2 border-error/30 hover:bg-error/20"
                }`}
              >
                {formData.isActive ? "فعال" : "غیرفعال"}
              </button>
            </div>

            {/* دکمه‌ها */}
            <div className="flex gap-3 pt-6 border-t border-border">
              <button
                type="submit"
                disabled={saving}
                className="flex cursor-pointer items-center gap-2 bg-success text-white px-8 py-3.5 rounded-xl hover:shadow-lg hover:shadow-success/30 hover:-translate-y-0.5 transition-all duration-300 font-bold disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
                {editingId ? "ویرایش" : "ایجاد"}
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="flex cursor-pointer items-center gap-2 bg-white border border-border text-secondarytext px-8 py-3.5 rounded-xl hover:bg-tertiary transition-all duration-300 font-bold"
              >
                <X className="w-5 h-5" />
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discounts Table */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-tertiary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-bold text-secondary">کد</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-secondary">نام</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-secondary">نوع</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-secondary">مقدار</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-secondary">استفاده</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-secondary">وضعیت</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-secondary">انقضا</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-secondary">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="inline-block w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin"></div>
                    <p className="text-secondarytext font-bold mt-3">در حال بارگذاری...</p>
                  </td>
                </tr>
              ) : discounts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-secondarytext font-bold">
                    <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                      <BadgePercent className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-secondarytext text-lg">
                      {search
                        ? "کد تخفیفی یافت نشد"
                        : "هنوز کد تخفیفی ایجاد نشده است"}
                    </p>
                  </td>
                </tr>
              ) : (
                discounts.map((discount: Discount, index: number) => (
                  <tr
                    key={discount._id}
                    className="hover:bg-tertiary transition-colors duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 text-sm font-extrabold text-primarytext">
                      <span className="bg-secondary/5 px-3 py-1 rounded-lg border border-border">
                        {discount.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-secondarytext">
                      {discount.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-secondarytext">
                      {getTypeLabel(discount.type)}
                    </td>
                    <td className="px-6 py-4 text-sm font-extrabold text-primary">
                      {discount.type === "percent"
                        ? `${discount.value}٪`
                        : `${discount.value.toLocaleString("fa-IR")} تومان`}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-secondarytext">
                      {discount.usedAmount ?? 0} / {discount.totalAmount ?? "∞"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="cursor-pointer hover:scale-105 transition-transform" onClick={() => handelChangeStatus({ isActive: !discount.isActive }, discount._id)}>
                        {getStatusBadge(discount.isActive, discount.expiresAt)}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-secondarytext">
                      {discount.expiresAt
                        ? moment(discount.expiresAt).format("jYYYY/jMM/jDD")
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(discount)}
                          className="p-2 cursor-pointer text-primary hover:bg-primary/10 rounded-lg transition-all hover:scale-110"
                          title="ویرایش"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(discount._id)}
                          className="p-2 cursor-pointer text-error hover:bg-error/10 rounded-lg transition-all hover:scale-110"
                          title="حذف"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}