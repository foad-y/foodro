import { useState } from 'react';
import DateObject from 'react-date-object';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Plus, Edit, Trash2, Check, X, Search, User, Phone, MapPin, Calendar, VenusAndMars, Users } from 'lucide-react';
import { useCustomers, Customer } from '../../hooks/useCustomer';
import axiosInstance from '../../lib/axiosInstance';
import { toast } from 'react-toastify';
import Select from '../select';
import Pagination from '../ui/Pagination';

export default function CustomersTab() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    gender: '',
    birthday: ''
  });

  const { customers, pagination, isLoading, mutateCustomers } = useCustomers({
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
        ? axiosInstance.put(`/customers/${editingId}`, formData)
        : axiosInstance.post('/customers', formData);

      await toast.promise(request, {
        pending: editingId
          ? "در حال بروزرسانی مشتری..."
          : "در حال افزودن مشتری...",
        success: editingId
          ? "مشتری با موفقیت بروزرسانی شد ✅"
          : "مشتری با موفقیت افزوده شد ✅",
        error: editingId
          ? "ویرایش مشتری با خطا مواجه شد ❌"
          : "افزودن مشتری با خطا مواجه شد ❌",
      });
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', phone: '', address: '', birthday: '', gender: '' });
      mutateCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingId(customer._id);
    setFormData({
      name: customer.name,
      phone: customer.phone || '',
      address: customer.address || '',
      gender: customer.gender || '',
      birthday: customer.birthday || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await toast.promise(
        axiosInstance.delete(`/customers/${id}`),
        {
          pending: "در حال حذف مشتری...",
          success: "مشتری با موفقیت حذف شد ✅",
          error: "خطا در حذف مشتری ❌",
        }
      );
      mutateCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', phone: '', address: '', gender: '', birthday: '' });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-secondary">مشتریان</h2>
          <p className="text-secondarytext font-medium mt-1">مدیریت و ویرایش اطلاعات مشتریان</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex cursor-pointer items-center gap-2 bg-linear-to-r from-gradiantbtnfrom to-gradiantbtnto text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 font-bold"
        >
          <Plus className="w-5 h-5" />
          افزودن مشتری
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiarytext" />
          <input
            type="text"
            placeholder="جستجوی مشتری (نام یا شماره تماس)..."
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
                ویرایش مشتری
              </>
            ) : (
              <>
                <Plus className="w-6 h-6 text-primary" />
                افزودن مشتری جدید
              </>
            )}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-sm font-bold text-secondary mb-2">نام و نام خانوادگی</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiarytext group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pr-11 pl-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden"
                  placeholder="علی رضایی"
                  required
                />
              </div>
            </div>
            <div className="group">
              <label className="block text-sm font-bold text-secondary mb-2">شماره تماس</label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiarytext group-focus-within:text-primary transition-colors" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-right pr-11 pl-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden"
                  placeholder="09123456789"
                />
              </div>
            </div>

            <Select
              icon={VenusAndMars}
              value={formData.gender}
              placholder='انتخاب جنسیت'
              titel='جنسیت'
              options={[
                { value: "male", label: "مرد" },
                { value: "female", label: "زن" },
                { value: "", label: "سایر" },
              ]}
              onChange={(val) =>
                setFormData({ ...formData, gender: val })
              }
            />

            <div className="group">
              <label className="block text-sm font-bold text-secondary mb-2">
                تاریخ تولد
              </label>

              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiarytext z-10 group-focus-within:text-primary transition-colors" />

                <DatePicker
                  calendar={persian}
                  className="custom-calendar"
                  locale={persian_fa}
                  minDate="1300/01/01"
                  maxDate={new Date()}
                  value={formData.birthday ? new DateObject({ date: new Date(formData.birthday), calendar: persian, locale: persian_fa }) : null}
                  onChange={(date) => {
                    if (!date) return;
                    setFormData({ ...formData, birthday: date.toDate().toISOString() });
                  }}
                  inputClass="w-full pr-11 pl-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden"
                  containerClassName="w-full"
                  calendarPosition="bottom-right"
                  format="YYYY/MM/DD"
                  placeholder="انتخاب تاریخ تولد"
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 group">
              <label className="block text-sm font-bold text-secondary mb-2">آدرس</label>
              <div className="relative">
                <MapPin className="absolute right-3 top-3 w-5 h-5 text-tertiarytext group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-right pr-11 pl-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden"
                  placeholder="آدرس محل سکونت"
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 flex gap-3 pt-4">
              <button
                type="submit"
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

      {/* Customers Table */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-tertiary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-bold text-secondary">نام و نام خانوادگی</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-secondary">شماره تماس</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-secondary">آدرس</th>
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
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-secondarytext font-bold">
                    <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-secondarytext text-lg">
                      {searchTerm ? 'مشتری یافت نشد' : 'هنوز مشتری اضافه نشده است'}
                    </p>
                  </td>
                </tr>
              ) : (
                customers.map((customer: Customer, index: number) => (
                  <tr
                    key={customer._id}
                    className="hover:bg-tertiary transition-colors duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 text-sm font-bold text-primarytext flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-extrabold text-sm border border-primary/20">
                        {customer.name.charAt(0)}
                      </div>
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-secondarytext">
                      {customer.phone || <span className="text-tertiarytext italic">ثبت نشده</span>}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-secondarytext">
                      <div className="max-w-xs truncate" title={customer.address || ''}>
                        {customer.address || <span className="text-tertiarytext italic">ثبت نشده</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="p-2 cursor-pointer text-primary hover:bg-primary/10 rounded-lg transition-all hover:scale-110"
                          title="ویرایش"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer._id)}
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