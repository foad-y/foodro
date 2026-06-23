import React, { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Search,
  Tag,
  DollarSign,
  ChartColumnStacked,
  Hamburger,
  Printer,
} from "lucide-react";
import ImageSelect from "../ImageSelect";
import CategorySelect from "../CategorySelect";
import axiosInstance from "../../lib/axiosInstance";
import { Product, useProducts } from "../../hooks/useProduct";
import { useCategories } from "../../hooks/useCategory";
import { useIngredients } from "../../hooks/useIngredients";
import { getImageList } from '../../utils/imageList';
import { Pattern, usePattern } from "../../hooks/usePattern";
import { formatPriceInput, parsePriceInput } from "../../utils/price";
import { printReceipt } from "../cashier/CashierReceipt";
import config from "../../../site.config.json";
import Pagination from "../ui/Pagination";

export interface Ingredient {
  ingredient: ingredientItem;
  amount: number;
}

export interface ingredientItem {
  createdAt: string;
  default: boolean;
  name: string;
  price: number;
  category: string | null;
  removable: boolean;
  updatedAt: string;
  _id: string;
  img: string;
}

export default function ProductsTab() {
  const [showForm, setShowForm] = useState(false);
  const [productDetails, setProductDetails] = useState(false);
  const [showAddPattern, setShowAddPattern] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [imageList, setImageList] = useState<any>([]);

  useEffect(() => {
    getImageList().then(setImageList);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    img: "",
  });
  
  const [detailsForm, setDetailsForm] = useState({
    name: "",
    ingredients: [],
    category: "",
  });

  const [page, setPage] = useState(1);

  const { products, pagination, isLoading, mutateProducts } = useProducts({
    limit: 10,
    page,
    search: searchTerm,
  });

  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || page;

  const { categories, mutateCategories } = useCategories();
  const { mutateIngredients } = useIngredients();
  const { Pattern, mutatePattern } = usePattern({
    category: detailsForm.category,
  });

  const storeName = (config)?.marketName || "کلیز برگر";

  const handlePrintAllProducts = useCallback(async () => {
    try {
      const productRows = products
        .map(
          (product) => `
        <tr>
          <td style="text-align: right; padding: 4px 8px; border-bottom: 1px dotted #ccc;">${product.name}</td>
          <td style="text-align: center; padding: 4px 8px; border-bottom: 1px dotted #ccc;">${categories?.find((c) => c._id === product?.category?._id)?.name || "-"}</td>
          <td style="text-align: left; padding: 4px 8px; border-bottom: 1px dotted #ccc; font-weight: bold;">${product.price.toLocaleString("fa-IR")} تومان</td>
        </tr>`
        )
        .join("");

      const html = `<!DOCTYPE html>
<html lang="fa">
<head>
  <meta charset="UTF-8">
  <title>لیست قیمت محصولات - ${storeName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Vazirmatn', Tahoma, sans-serif;
      font-size: 12px;
      width: 80mm;
      margin: 0 auto;
      padding: 5mm;
      color: #000;
      background: #fff;
      direction: rtl;
      text-align: right;
    }
    .center { text-align: center; }
    .bold { font-weight: 700; }
    h1 { font-size: 16px; margin-bottom: 4px; font-weight: 900; text-align: center; }
    .subtitle { font-size: 11px; color: #000000; margin-bottom: 8px; text-align: center; }
    .divider { border-top: 2px dashed #000; margin: 6px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 4px; }
    th { font-size: 11px; padding: 6px 8px; background: #f0f0f0; font-weight: 700; text-align: center; }
    td { font-size: 11px; }
    .footer { margin-top: 10px; font-size: 10px; color: #000000; text-align: center; }
    @media print {
      @page { size: 80mm auto; margin: 0; }
      body { width: 80mm; padding: 3mm; }
    }
  </style>
</head>
<body>
  <div class="center">
    <h1>${storeName}</h1>
    <div class="subtitle">لیست قیمت محصولات</div>
    <div class="subtitle">تاریخ: ${new Date().toLocaleDateString("fa-IR")}</div>
    <div class="divider"></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>نام محصول</th>
        <th>دسته‌بندی</th>
        <th>قیمت</th>
      </tr>
    </thead>
    <tbody>${productRows}</tbody>
  </table>
  <div class="divider"></div>
  <div class="footer">
    <div>سیستم مدیریت ${storeName}</div>
  </div>
</body>
</html>`;

      await printReceipt(html);
    } catch (err) {
      console.error("❌ [PRINT] Error printing product list:", err);
      toast.error("خطا در چاپ لیست محصولات");
    }
  }, [products, categories, storeName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const finalPayload = {
        name: formData.name,
        price: parseFloat(formData.price),
        category: formData.category,
        img: formData.img,
      };

      const request = editingId
        ? axiosInstance.put(`/product/${editingId}`, finalPayload)
        : axiosInstance.post("/product", finalPayload);

      await toast.promise(request, {
        pending: editingId
          ? "در حال بروزرسانی محصول..."
          : "در حال افزودن محصول...",
        success: editingId
          ? "محصول با موفقیت بروزرسانی شد ✅"
          : "محصول با موفقیت افزوده شد ✅",
        error: editingId
          ? "ویرایش محصول با خطا مواجه شد ❌"
          : "افزودن محصول با خطا مواجه شد ❌",
      });

      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: "",
        category: "",
        price: "",
        img: "",
      });

      mutateProducts();
      mutateCategories();
      mutateIngredients();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleSubmitDetails = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const filterIngredients = detailsForm.ingredients.map(
        (item: Ingredient) => item?.ingredient?._id,
      );

      const finalPayload = {
        name: detailsForm.name,
        ingredients: filterIngredients,
      };

      const res = axiosInstance.post(
        `/product/category/${detailsForm.category}/pattern`,
        finalPayload,
      );
      await toast.promise(res, {
        success: "الگو با موفقیت اضافه شد",
        pending: "در حال افزودن الگو ...",
        error: "افزودن الگو با خطا مواجه شد",
      });
      setProductDetails(false);
      setDetailsForm({
        name: "",
        category: "",
        ingredients: [],
      });
    } catch (err) {
      console.error('"Error saving pattern', err);
    }

    setShowAddPattern(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await toast.promise(axiosInstance.delete(`/product/${id}`), {
        pending: "در حال حذف محصول...",
        success: "محصول با موفقیت حذف شد ✅",
        error: "خطا در حذف محصول ❌",
      });
      mutateProducts();
    } catch (err) {
      console.error(err, "err");
    }
  };

  const handelDeletePattern = async (id: string) => {
    try {
      await toast.promise(
        axiosInstance.post(
          `/product/category/${detailsForm.category}/pattern/${id}`,
        ),
        {
          pending: "در حال حذف الگو...",
          success: "الگو با موفقیت حذف شد ✅",
          error: "خطا در حذف الگو ❌",
        },
      );
      mutatePattern();
    } catch (err) {
      console.error(err, "err");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product._id);

    setFormData({
      name: product.name || "",
      category: product.category?._id || "",
      img: product.img || "",
      price: product.price?.toString() || "",
    });

    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      img: "",
      category: "",
      price: "",
    });
  };

  const cancelDetails = () => {
    setDetailsForm({
      name: "",
      ingredients: [],
      category: "",
    });
    setShowAddPattern(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-secondary">
            محصولات
          </h2>
          <p className="text-secondarytext font-medium mt-1">مدیریت و ویرایش محصولات فروشگاه</p>
        </div>
        {!editingId && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handlePrintAllProducts}
              className="flex cursor-pointer items-center gap-2 bg-white border border-border text-secondarytext px-6 py-3 rounded-xl hover:shadow-md hover:text-primary transition-all duration-300 font-bold"
              title="چاپ لیست محصولات با قیمت"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={() => setProductDetails(!productDetails)}
              className="flex cursor-pointer items-center gap-2 bg-secondary text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-secondary/30 transition-all duration-300 font-bold"
            >
              <Tag className="w-5 h-5" />
              توضیحات دسته بندی
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex cursor-pointer items-center gap-2 bg-linear-to-r from-gradiantbtnfrom to-gradiantbtnto text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 font-bold"
            >
              <Plus className="w-5 h-5" />
              افزودن محصول
            </button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiarytext" />
          <input
            type="text"
            placeholder="جستجوی محصول..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pr-12 pl-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden"
          />
        </div>
      </div>

      {/* Product Form */}
      {showForm && (
        <div className="bg-white p-8 rounded-3xl mb-8 border border-border shadow-xl">
          <h3 className="text-2xl font-bold text-secondary mb-6 flex items-center gap-2">
            {editingId ? (
              <>
                <Edit className="w-6 h-6 text-primary" />
                ویرایش محصول
              </>
            ) : (
              <>
                <Plus className="w-6 h-6 text-primary" />
                افزودن محصول جدید
              </>
            )}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="group">
              <label className="block text-sm font-bold text-secondary mb-2">
                نام محصول
              </label>
              <div className="relative">
                <Hamburger className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiarytext group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pr-11 px-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white font-medium outline-hidden"
                  placeholder="همبرگر"
                  required
                />
              </div>
            </div>
            <div className="group">
              <label className="block text-sm font-bold text-secondary mb-2">
                دسته‌بندی
              </label>
              <div className="relative">
                <CategorySelect
                  icon={ChartColumnStacked}
                  options={categories ?? []}
                  value={formData.category}
                  onChange={(val) =>
                    setFormData({ ...formData, category: val })
                  }
                  placeholder="دسته‌بندی را انتخاب کنید"
                />
              </div>
            </div>
            
            <div className="group">
              <label className="block text-sm font-bold text-secondary mb-2">
                قیمت (تومان)
              </label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiarytext group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={formatPriceInput(formData.price)}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parsePriceInput(e.target.value) })
                  }
                  className="w-full pr-11 px-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white font-medium outline-hidden"
                  placeholder="15000"
                  required
                />
              </div>
            </div>
            <div className="group">
              <label className="block text-sm font-bold text-secondary mb-2">
                انتخاب عکس
              </label>
              <div className="relative">
                <ImageSelect
                  images={imageList}
                  value={formData.img}
                  onChange={(e) => setFormData({ ...formData, img: e })}
                  placeholder="انتخاب عکس"
                />
              </div>
            </div>
            
            <div className="col-span-1 md:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                className="flex cursor-pointer items-center gap-2 bg-success text-white px-8 py-3.5 rounded-xl hover:shadow-lg hover:shadow-success/30 hover:-translate-y-0.5 transition-all duration-300 font-bold"
              >
                <Check className="w-5 h-5" />
                ذخیره
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

      {/* Pattern Details (توضیحات دسته بندی) */}
      {productDetails && (
        <div className="bg-tertiary/30 p-8 rounded-3xl mb-8 border border-border shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-secondary flex items-center gap-2">
              مدیریت دسته‌بندی الگوها
            </h3>
            <button
              className="flex cursor-pointer items-center gap-2 bg-linear-to-r from-gradiantbtnfrom to-gradiantbtnto text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 font-bold"
              onClick={() => setShowAddPattern(!showAddPattern)}
            >
              <Plus className="w-5 h-5" />
              افزودن الگو
            </button>
          </div>

          <form
            onSubmit={handleSubmitDetails}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="group">
              <label className="block text-sm font-bold text-secondary mb-2">
                دسته‌بندی الگو
              </label>
              <div className="relative">
                <CategorySelect
                  showAdd={false}
                  showDelete={false}
                  icon={ChartColumnStacked}
                  options={categories ?? []}
                  value={detailsForm.category}
                  onChange={(val) =>
                    setDetailsForm({ ...detailsForm, category: val })
                  }
                  placeholder="دسته‌بندی را انتخاب کنید"
                />
              </div>
            </div>
            
            {showAddPattern && (
              <>
                <div className="group">
                  <label className="block text-sm font-bold text-secondary mb-2">
                    نام الگو
                  </label>
                  <div className="relative">
                    <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiarytext group-focus-within:text-primary transition-colors" />
                    <input
                      type="text"
                      value={detailsForm.name}
                      onChange={(e) =>
                        setDetailsForm({ ...detailsForm, name: e.target.value })
                      }
                      className="w-full pr-11 px-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white font-medium outline-hidden"
                      placeholder="مثلا: بدون گوجه"
                      required
                    />
                  </div>
                </div>
                
                <div className="col-span-1 md:col-span-2 flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex cursor-pointer items-center gap-2 bg-success text-white px-8 py-3.5 rounded-xl hover:shadow-lg hover:shadow-success/30 hover:-translate-y-0.5 transition-all duration-300 font-bold"
                  >
                    <Check className="w-5 h-5" />
                    ذخیره الگو
                  </button>
                  <button
                    type="button"
                    onClick={cancelDetails}
                    className="flex cursor-pointer items-center gap-2 bg-white border border-border text-secondarytext px-8 py-3.5 rounded-xl hover:bg-tertiary transition-all duration-300 font-bold"
                  >
                    <X className="w-5 h-5" />
                    انصراف
                  </button>
                </div>
              </>
            )}
          </form>

          {/* List of Patterns */}
          <div className="flex flex-wrap gap-3 py-6">
            {Pattern?.category_ingredients?.map((item: Pattern, i: number) => (
              <div
                key={i}
                className="bg-white border border-border w-fit px-4 py-3 rounded-2xl flex items-center gap-4 shadow-sm"
              >
                <div>
                  <h3 className="font-bold text-primarytext">{item.name}</h3>
                  <div className="flex flex-wrap gap-1 text-secondarytext text-xs mt-1 font-medium">
                    {item.ingredient.map((ing, i: number) => (
                      <span className="bg-tertiary px-2 py-0.5 rounded-md border border-border" key={i}>
                        {ing.name}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handelDeletePattern(item._id)}
                  className="text-error hover:bg-error/10 p-2 rounded-lg cursor-pointer transition-colors"
                  title="حذف الگو"
                >
                  <Trash2 className="w-5 h-5 hover:scale-110 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-tertiary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-bold text-secondary">
                  نام محصول
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-secondary">
                  دسته‌بندی
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-secondary">
                  قیمت
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-secondary">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <div className="inline-block w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin"></div>
                    <p className="text-secondarytext font-bold mt-3">در حال بارگذاری...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-secondarytext font-bold">
                    <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                      <Hamburger className="w-8 h-8 text-primary" />
                    </div>
                    {searchTerm
                      ? "محصولی یافت نشد"
                      : "هنوز محصولی اضافه نشده است"}
                  </td>
                </tr>
              ) : (
                products?.map((product, index) => (
                  <tr
                    key={product._id}
                    className="hover:bg-tertiary transition-colors duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 text-sm font-bold text-primarytext">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-secondarytext">
                      {categories?.find((c) => c._id === product?.category?._id)
                        ?.name || (
                        <span className="text-tertiarytext italic">بدون دسته</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-extrabold text-primary">
                      {product.price.toLocaleString("fa-IR")} تومان
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 cursor-pointer text-primary hover:bg-primary/10 rounded-lg transition-all hover:scale-110"
                          title="ویرایش"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
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