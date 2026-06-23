import { useState } from "react";
import { toast } from "react-toastify";
import DateObject from "react-date-object";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import {
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Search,
  Lock,
  Phone,
  User,
  Calendar,
  UserKey,
  VenusAndMars,
  UserCog
} from "lucide-react";
import Select from "../select";
import axiosInstance from "../../lib/axiosInstance";
import { Employee, useEmployees } from "../../hooks/useEmployee";
import Pagination from "../ui/Pagination";

export default function EmployeesTab() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({
    birthday: "",
    password: "",
    name: "",
    role: "",
    gender: "male",
    phone: "",
  });

  const { employees, pagination, isLoading, mutateEmployees } = useEmployees({
    limit: 10,
    page,
    search: searchTerm,
  });

  const totalPages = pagination?.totalPages || 1;
  const currentPage = pagination?.page || page;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const request = editingId
        ? axiosInstance.put(`/employees/${editingId}`, formData)
        : axiosInstance.post("/employees", formData);

      await toast.promise(request, {
        pending: editingId
          ? "در حال بروزرسانی کارمند..."
          : "در حال افزودن کارمند...",
        success: editingId
          ? "کارمند با موفقیت بروزرسانی شد ✅"
          : "کارمند با موفقیت افزوده شد ✅",
        error: editingId
          ? "ویرایش کارمند با خطا مواجه شد ❌"
          : "افزودن کارمند با خطا مواجه شد ❌",
      });
      setShowForm(false);
      setEditingId(null);
      setFormData({
        birthday: "",
        password: "",
        name: "",
        role: "",
        gender: "male",
        phone: "",
      });
      mutateEmployees();
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee._id);
    setFormData({
      name: employee.name,
      phone: employee.phone || "",
      role: employee.role || "",
      gender: employee.gender || "male",
      password: "",
      birthday: employee.birthday || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await toast.promise(axiosInstance.delete(`/employees/${id}`), {
        pending: "در حال حذف کارمند...",
        success: "کارمند با موفقیت حذف شد ✅",
        error: "خطا در حذف کارمند ❌",
      });
      mutateEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      birthday: "",
      password: "",
      name: "",
      role: "",
      gender: "male",
      phone: "",
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-secondary">
            کارمندان
          </h2>
          <p className="text-secondarytext font-medium mt-1">مدیریت و ویرایش اطلاعات کارمندان</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex cursor-pointer items-center gap-2 bg-linear-to-r from-gradiantbtnfrom to-gradiantbtnto text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 font-bold"
        >
          <Plus className="w-5 h-5" />
          افزودن کارمند
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiarytext" />
          <input
            type="text"
            placeholder="جستجوی کارمند (نام یا شماره تماس)..."
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
                ویرایش کارمند
              </>
            ) : (
              <>
                <Plus className="w-6 h-6 text-primary" />
                افزودن کارمند جدید
              </>
            )}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-sm font-bold text-secondary mb-2">
                نام و نام خانوادگی
              </label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiarytext group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full pr-11 pl-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden"
                  placeholder="علی رضایی"
                  required
                />
              </div>
            </div>
            <div className="group">
              <label className="block text-sm font-bold text-secondary mb-2">
                شماره تماس
              </label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiarytext group-focus-within:text-primary transition-colors" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full text-right pr-11 pl-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden"
                  placeholder="09123456789"
                  required
                />
              </div>
            </div>

            <Select
              icon={VenusAndMars}
              value={formData.gender}
              placholder="انتخاب جنسیت"
              titel="جنسیت"
              options={[
                { value: "male", label: "مرد" },
                { value: "female", label: "زن" },
                { value: "other", label: "سایر" },
              ]}
              onChange={(val) => setFormData({ ...formData, gender: val })}
            />

            <Select
              icon={UserKey}
              value={formData.role}
              placholder="نقش کاربر"
              titel="نقش"
              options={[
                { value: "admin", label: "مدیر" },
                { value: "cashier", label: "صندوقدار" },
              ]}
              onChange={(val) => setFormData({ ...formData, role: val })}
            />

            {!editingId && (
              <div className="group">
                <label className="block text-sm font-bold text-secondary mb-2">
                  رمز عبور
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tertiarytext group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pr-11 pl-4 py-3 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all bg-white text-primarytext font-medium outline-hidden"
                    placeholder="رمز عبور"
                    required={!editingId}
                  />
                </div>
              </div>
            )}

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
                  value={
                    formData.birthday
                      ? new DateObject({ date: new Date(formData.birthday), calendar: persian, locale: persian_fa })
                      : null
                  }
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

      {/* Employees Table */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-tertiary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-bold text-secondary">
                  نام و نام خانوادگی
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-secondary">
                  نقش
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-secondary">
                  شماره تماس
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
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-secondarytext font-bold">
                    <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                      <UserCog className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-secondarytext text-lg">
                      {searchTerm
                        ? "کارمندی یافت نشد"
                        : "هنوز کارمندی اضافه نشده است"}
                    </p>
                  </td>
                </tr>
              ) : (
                employees?.map((employee: Employee, index: number) => (
                  <tr
                    key={employee._id}
                    className="hover:bg-tertiary transition-colors duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 text-sm font-bold text-primarytext flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-extrabold text-sm border border-primary/20">
                        {employee.name.charAt(0)}
                      </div>
                      {employee.name}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border ${employee.role === "admin"
                            ? "bg-secondary/10 text-secondary border-secondary/20"
                            : "bg-primary/10 text-primary border-primary/20"
                          }`}
                      >
                        {employee.role === "admin" ? "👑 مدیر" : "👤 صندوقدار"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-secondarytext">
                      {employee.phone || (
                        <span className="text-tertiarytext italic">ثبت نشده</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="p-2 cursor-pointer text-primary hover:bg-primary/10 rounded-lg transition-all hover:scale-110"
                          title="ویرایش"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee._id)}
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