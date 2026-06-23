import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, Users, UserCog, CreditCard, MapPin, ListOrderedIcon, BarChart3, BadgePercent, Settings } from 'lucide-react';
import ProductsTab from '../components/admin/ProductsTab';
import EmployeesTab from '../components/admin/EmployeesTab';
import CustomersTab from '../components/admin/CustomersTab';
import DashboardTab from '../components/admin/DashboardTab';
import PrinterSettingsModal from '../components/PrinterSettingsModal';
import { useAuthStore } from '../store/useAuthStore';
import AddressTab from '../components/admin/AddressTab';
import OrdersTab from '../components/admin/OrdersTab';
import { Orders } from '../hooks/useOrders';
import InfoOrderModal from '../components/admin/InfoOrderModal';
import DiscountsTab from '../components/admin/DiscountsTab';
import AppLogo from '../components/AppLogo';

type Tab = 'dashboard' | 'products' | 'employees' | 'customers' | 'address' | 'orders' | 'discounts';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [openInfoModal, setOpenInfoModal] = useState<Orders | null>(null);
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    logout(); // Clear auth store state
    navigate('/login');
  };

  const handleGoToCashier = () => {
    navigate('/cashier');
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-tertiary flex items-center justify-center relative overflow-hidden font-sans" dir="rtl">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-error/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-warning/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>

        <div className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl text-center border border-border max-w-md w-full mx-4 relative z-10">
          <div className="bg-error/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-error/20">
            <span className="text-5xl">⛔</span>
          </div>
          <h2 className="text-3xl font-extrabold text-secondary mb-3">دسترسی محدود</h2>
          <p className="text-lg text-secondarytext font-medium mb-8">شما دسترسی به این بخش را ندارید</p>
          <button
            onClick={handleSignOut}
            className="w-full bg-error text-white px-8 py-3.5 rounded-xl hover:shadow-lg hover:shadow-error/30 hover:scale-[1.02] transition-all duration-300 font-bold flex items-center justify-center gap-2 mx-auto"
          >
            <LogOut className="w-5 h-5" />
            خروج از حساب
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tertiary relative overflow-hidden font-sans" dir="rtl">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-warning/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-secondary/5 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <AppLogo className="w-16 h-16 drop-shadow-sm" />
              <div>
                <h1 className="text-2xl font-extrabold bg-linear-to-r from-gradiantbtnfrom to-gradiantbtnto bg-clip-text text-transparent">پنل مدیریت</h1>
                <p className="text-sm text-secondarytext font-medium flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_5px_currentColor]"></span>
                  {user.name}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPrinterModal(true)}
                className="flex items-center cursor-pointer gap-2 bg-white border border-border text-primarytext px-4 py-2.5 rounded-xl hover:shadow-md hover:border-primary hover:text-primary transition-all duration-300 font-bold"
              >
                <Settings className="w-5 h-5" />
                <span className="hidden sm:inline">تنظیمات</span>
              </button>
              <button
                onClick={handleGoToCashier}
                className="flex items-center cursor-pointer gap-2 bg-success text-white px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-success/30 hover:scale-105 transition-all duration-300 font-bold"
              >
                <CreditCard className="w-5 h-5" />
                <span className="hidden sm:inline">صفحه صندوق</span>
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 cursor-pointer bg-error text-white px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-error/30 hover:scale-105 transition-all duration-300 font-bold"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-border">
          {/* Tabs Navigation */}
          <div className="border-b border-border bg-tertiary/50 overflow-x-auto overflow-y-hidden scrollbar-hide">
            <nav className="flex -mb-px">
              {[
                { id: 'dashboard', label: 'داشبورد', icon: BarChart3 },
                { id: 'products', label: 'محصولات', icon: Package },
                { id: 'employees', label: 'کارکنان', icon: UserCog },
                { id: 'customers', label: 'مشتریان', icon: Users },
                { id: 'discounts', label: 'تخفیف‌ها', icon: BadgePercent },
                { id: 'address', label: 'آدرس‌ها', icon: MapPin },
                { id: 'orders', label: 'سفارشات', icon: ListOrderedIcon },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-2.5 px-8 py-5 cursor-pointer border-b-4 font-bold transition-all duration-300 shrink-0 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary bg-white shadow-[inset_0_-4px_0_0_var(--color-primary)]'
                      : 'border-transparent text-secondarytext hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full border border-primary/20">فعال</span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8 bg-white">
            {activeTab === 'dashboard' && <DashboardTab />}
            {activeTab === 'products' && <ProductsTab />}
            {activeTab === 'employees' && <EmployeesTab />}
            {activeTab === 'customers' && <CustomersTab />}
            {activeTab === 'address' && <AddressTab />}
            {activeTab === 'orders' && <OrdersTab setOpenInfoModal={setOpenInfoModal} />}
            {activeTab === 'discounts' && <DiscountsTab />}
          </div>
        </div>
      </div>

      {openInfoModal && (
        <InfoOrderModal
          close={() => setOpenInfoModal(null)}
          dataProduct={openInfoModal || []}
        />
      )}

      <PrinterSettingsModal
        open={showPrinterModal}
        onClose={() => setShowPrinterModal(false)}
      />

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}