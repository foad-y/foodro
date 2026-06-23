import { useState } from 'react';
import { Plus, Edit, Trash2, Check, X, Search, MapPin, Map, DollarSign } from 'lucide-react';
import axiosInstance from '../../lib/axiosInstance';
import { toast } from 'react-toastify';
import { Address, useAddresses } from '../../hooks/useAddress';
import { formatPrice, formatPriceInput, parsePriceInput } from '../../utils/price';
import Pagination from '../ui/Pagination';

export default function AddressTab() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({
    region: '',
    neighborhood: '',
    price: '',
  });

  const { addresses, pagination, isLoading, mutateAddresses } = useAddresses({
    limit: 10,
    page,
    search: searchTerm
  });

  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || page;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const request = editingId
        ? axiosInstance.put(`/address/${editingId}`, formData)
        : axiosInstance.post('/address', formData);

      await toast.promise(request, {
        pending: editingId
          ? "در حال بروزرسانی آدرس..."
          : "در حال افزودن آدرس...",
        success: editingId
          ? "آدرس با موفقیت بروزرسانی شد ✅"
          : "آدرس با موفقیت افزوده شد ✅",
        error: editingId
          ? "ویرایش آدرس با خطا مواجه شد ❌"
          : "افزودن آدرس با خطا مواجه شد ❌",
      });
      setShowForm(false);
      setEditingId(null);
      setFormData({ region: '', neighborhood: '', price: '' });
      mutateAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingId(address._id);
    setFormData({
      region: address.region,
      neighborhood: address.neighborhood || '',
      price: address.price || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await toast.promise(
        axiosInstance.delete(`/address/${id}`),
        {
          pending: "در حال حذف آدرس...",
          success: "آدرس با موفقیت حذف شد ✅",
          error: "خطا در حذف آدرس ❌",
        }
      );
      mutateAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ region: '', neighborhood: '', price: '' });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-secondary">آدرس‌ها</h2>
          <p className="text-secondarytext font-medium mt-1">مدیریت و ویرایش مناطق و هزینه پیک</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex cursor-pointer items-center gap-2 bg-linear-to-r from-gradiantbtnfrom to-gradiantbtnto text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 font-bold"
        >
          <Plus className="w-5 h-5" />
          افزودن آدرس
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiarytext" />
          <input
            type="text"
            placeholder="جستجوی منطقه یا محله..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="w-full pr-12 pl-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden"
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
                ویرایش آدرس
              </>
            ) : (
              <>
                <Plus className="w-6 h-6 text-primary" />
                افزودن آدرس جدید
              </>
            )}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-sm font-bold text-secondary mb-2">نام منطقه</label>
              <div className="relative">
                <Map className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiarytext group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full pr-11 pl-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden"
                  placeholder="مثال: منطقه ۲"
                  required
                />
              </div>
            </div>
            <div className="group">
              <label className="block text-sm font-bold text-secondary mb-2">نام محله</label>
              <div className="relative">
                <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiarytext group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  className="w-full pr-11 pl-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden"
                  placeholder="مثال: پونک"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-bold text-secondary mb-2">هزینه پیک (تومان)</label>
              <div className="relative">
                <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiarytext group-focus-within:text-primary transition-colors" />
                <input
                  value={formatPriceInput(formData.price)}
                  onChange={(e) => setFormData({ ...formData, price: parsePriceInput(e.target.value) })}
                  className="w-full pr-11 pl-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden"
                  placeholder="20,000"
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 flex gap-3 pt-4">
              <button
                type="submit"
                className="flex cursor-pointer items-center gap-2 bg-success text-white px-8 py-3.5 rounded-xl hover:shadow-lg hover:shadow-success/30 hover:-translate-y-0.5 transition-all duration-300 font-bold"
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

      {/* Addresses Table */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-tertiary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-bold text-secondary">نام منطقه</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-secondary">نام محله</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-secondary">هزینه پیک</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-secondary">عملیات</th>
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
              ) : addresses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-secondarytext font-bold">
                    <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                      <MapPin className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-secondarytext text-lg">
                      {searchTerm ? 'آدرسی یافت نشد' : 'هنوز آدرسی اضافه نشده است'}
                    </p>
                  </td>
                </tr>
              ) : (
                addresses.map((address: Address, index: number) => (
                  <tr
                    key={address._id}
                    className="hover:bg-tertiary transition-colors duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 text-sm font-bold text-primarytext">
                      {address.region}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-secondarytext">
                      {address.neighborhood || <span className="text-tertiarytext italic">ثبت نشده</span>}
                    </td>
                    <td className="px-6 py-4 text-sm font-extrabold text-primary">
                      <div className="max-w-xs truncate" title={'هزینه پیک'}>
                        {formatPrice(address.price) ? `${formatPrice(address.price)} تومان` : <span className="text-tertiarytext font-medium italic">ثبت نشده</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(address)}
                          className="p-2 cursor-pointer text-primary hover:bg-primary/10 rounded-lg transition-all hover:scale-110"
                          title="ویرایش"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(address._id)}
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