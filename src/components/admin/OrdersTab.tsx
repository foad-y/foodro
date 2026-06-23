import { useState } from "react";
import { Trash2, Search, Info, Package } from "lucide-react";
import axiosInstance from "../../lib/axiosInstance";
import { toast } from "react-toastify";
import { Orders, useOrders } from "../../hooks/useOrders";
import Pagination from "../ui/Pagination";
// import { Order } from '../../store/useProduct';
// import InfoOrderModal from './InfoOrderModal';

interface Props {
  setOpenInfoModal: (value: Orders | null) => void;
}

const getTypeOrder = (type: "takeaway" | "hall" | "delivery") =>
  ({ takeaway: "بیرون‌ بر", hall: "سالن", delivery: "پیک موتوری" })[type];

export default function OrdersTab({ setOpenInfoModal }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const { orders, pagination, isLoading, mutateOrders } = useOrders({
    limit: 10,
    page,
    search: searchTerm,
  });

  const totalPages = pagination?.pages || 1;
  const currentPage = pagination?.page || page;

  // const handlePageChange = (newPage: number) => {
  //   if (newPage < 1 || newPage > totalPages) return;
  //   setPage(newPage);
  // };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   try {
  //     const request = editingId
  //       ? axiosInstance.put(`/address/${editingId}`, formData)
  //       : axiosInstance.post('/address', formData);

  //     await toast.promise(request, {
  //       pending: editingId
  //         ? "در حال بروزرسانی آدرس..."
  //         : "در حال افزودن آدرس...",
  //       success: editingId
  //         ? "آدرس با موفقیت بروزرسانی شد ✅"
  //         : "آدرس با موفقیت افزوده شد ✅",
  //       error: editingId
  //         ? "ویرایش آدرس با خطا مواجه شد ❌"
  //         : "افزودن آدرس با خطا مواجه شد ❌",
  //     });
  //     setShowForm(false);
  //     setEditingId(null);
  //     setFormData({ region: '', neighborhood: '', price: '' });
  //     mutateOrders()
  //   } catch (error) {
  //     console.error('Error saving address:', error);
  //   }
  // };

  // const handleEdit = (address: Address) => {
  //   setEditingId(address._id);
  //   setFormData({
  //     region: address.region,
  //     neighborhood: address.neighborhood || '',
  //     price: address.price || "",
  //   });
  //   setShowForm(true);
  // };

  const handleDelete = async (id: string) => {
    try {
      await toast.promise(axiosInstance.delete(`/order/${id}`), {
        pending: "در حال حذف سفارش...",
        success: "سفارش با موفقیت حذف شد ✅",
        error: "خطا در حذف سفارش ❌",
      });
      mutateOrders();
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  // const cancelForm = () => {
  //   setShowForm(false);
  //   setEditingId(null);
  //   setFormData({ region: '', neighborhood: '', price: '' });
  // };

  // const filteredaddresss = addresses?.filter((address: address) =>
  //   address?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   (address.phone && address.phone.includes(searchTerm))
  // );

  // if (isLoading) {
  //   return (
  //     <div className="text-center py-16">
  //       <div className="inline-block w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
  //       <p className="text-gray-600 mt-4">در حال بارگذاری...</p>
  //     </div>
  //   );
  // }

  return (
    <>
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-secondary">
              سفارشات
            </h2>
            <p className="text-secondarytext font-medium mt-1">مدیریت و ویرایش سفارشات</p>
          </div>
          {/* <button
          onClick={() => setShowForm(true)}
          className="flex cursor-pointer items-center gap-2 bg-linear-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
        >
          <Plus className="w-5 h-5" />
          افزودن سفارش
        </button> */}
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiarytext" />
            <input
              type="text"
              placeholder="جستجوی سفارش ..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pr-12 pl-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden"
            />
          </div>
        </div>

        {/* order Table */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-tertiary/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-secondary">
                    نام و نام خانوادگی
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-secondary">
                    شماره
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-secondary">
                    نوع سفارش
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-secondary">
                    شماره سفارش
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-secondary">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="inline-block w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin"></div>
                      <p className="text-secondarytext font-bold mt-3">در حال بارگذاری...</p>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-secondarytext font-bold">
                      <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                        <Package className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-secondarytext text-lg">
                        {searchTerm
                          ? "سفارشی یافت نشد"
                          : "هنوز سفارشی ثبت نشده است"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  orders?.map((order: Orders, index: number) => (
                    <tr
                      key={order?._id}
                      className="hover:bg-tertiary transition-colors duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 text-sm font-bold text-primarytext">
                        {order?.customer?.name || (
                          <span className="text-tertiarytext italic">بدون نام</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-secondarytext">
                        {order?.customer?.phone || (
                          <span className="text-tertiarytext italic">ثبت نشده</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-secondarytext">
                        <div className="max-w-xs truncate" title={"نوع سفارش"}>
                          {getTypeOrder(order?.type) || (
                            <span className="text-tertiarytext italic">
                              ثبت نشده
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-secondarytext">
                        <div className="max-w-xs truncate" title={"شماره سفارش"}>
                          {order.order_number || (
                            <span className="text-tertiarytext italic">
                              ثبت نشده
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setOpenInfoModal(order)}
                            className="p-2 cursor-pointer text-primary hover:bg-primary/10 rounded-lg transition-all hover:scale-110"
                            title="جزئیات سفارش"
                          >
                            <Info className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(order?._id)}
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
    </>
  );
}