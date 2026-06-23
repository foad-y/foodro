import { useNavigate } from 'react-router-dom';
import { Store, ShoppingCart, Users, TrendingUp, BarChart3, Zap } from 'lucide-react';
import config from '../../site.config.json';
import AppLogo from '../components/AppLogo';

export default function Landing() {
  const navigate = useNavigate();

  return (

    <div className="min-h-screen bg-tertiary relative overflow-hidden font-sans" dir="rtl">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-warning/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>

      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div>
                <AppLogo className="w-18 h-18" />
              </div>
              {/* استفاده از گرادیانت داینامیک برای لوگوتایپ */}
              <h1 className="text-2xl font-bold bg-linear-to-r from-gradiantbtnfrom to-gradiantbtnto bg-clip-text text-transparent">
                {config.marketName}
              </h1>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="bg-linear-to-r from-gradiantbtnfrom to-gradiantbtnto text-white px-8 py-2.5 rounded-xl hover:shadow-lg hover:shadow-primary/30 hover:scale-105 transition-all duration-300 font-semibold"
            >
              ورود
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block mb-4">
            {/* استفاده از رنگ primary با شفافیت برای تگ بالای تیتر */}
            <span className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-full text-sm font-bold">
              سیستم نوین مدیریت
            </span>
          </div>
          {/* تیتر اصلی با رنگ تیره secondary برای بیشترین خوانایی و اقتدار */}
          <h2 className="text-5xl md:text-6xl font-extrabold text-secondary mb-6 leading-tight">
            {config.landingTitle}
          </h2>
          {/* توضیحات با رنگ secondarytext */}
          <p className="text-xl text-secondarytext max-w-2xl mx-auto leading-relaxed">
            سیستم جامع مدیریت فروش، محصولات، کارکنان و مشتریان با رابط کاربری مدرن و کارآمد
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 border border-border group">
            <div className="bg-linear-to-br from-gradiantbtnfrom to-gradiantbtnto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/30">
              <ShoppingCart className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-primarytext mb-4">صندوق فروش</h3>
            <p className="text-secondarytext leading-relaxed mb-4">
              رابط کاربری ساده و سریع برای ثبت سفارشات و فروش محصولات با قابلیت‌های پیشرفته
            </p>
            <div className="flex items-center text-primary font-bold group-hover:gap-2 transition-all">
              <span>بیشتر بدانید</span>
              <span className="group-hover:translate-x-1 transition-transform">←</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 border border-border group">
            <div className="bg-linear-to-br from-gradiantbtnfrom to-gradiantbtnto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/30">
              <Store className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-primarytext mb-4">مدیریت محصولات</h3>
            <p className="text-secondarytext leading-relaxed mb-4">
              افزودن، ویرایش و مدیریت کامل محصولات و دسته‌بندی‌ها با امکانات حرفه‌ای
            </p>
            <div className="flex items-center text-primary font-bold group-hover:gap-2 transition-all">
              <span>بیشتر بدانید</span>
              <span className="group-hover:translate-x-1 transition-transform">←</span>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-2 border border-border group">
            <div className="bg-linear-to-br from-gradiantbtnfrom to-gradiantbtnto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/30">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-primarytext mb-4">مدیریت کارکنان</h3>
            <p className="text-secondarytext leading-relaxed mb-4">
              کنترل دسترسی کارکنان و مدیریت اطلاعات پرسنل با امنیت بالا
            </p>
            <div className="flex items-center text-primary font-bold group-hover:gap-2 transition-all">
              <span>بیشتر بدانید</span>
              <span className="group-hover:translate-x-1 transition-transform">←</span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="text-center bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-border">
            <div className="flex justify-center mb-3">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <div className="text-4xl font-extrabold text-secondary mb-2">۹۹٪</div>
            <div className="text-secondarytext font-medium">افزایش بهره‌وری</div>
          </div>
          <div className="text-center bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-border">
            <div className="flex justify-center mb-3">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <div className="text-4xl font-extrabold text-secondary mb-2">۲۴/۷</div>
            <div className="text-secondarytext font-medium">پشتیبانی آنلاین</div>
          </div>
          <div className="text-center bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-border">
            <div className="flex justify-center mb-3">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <div className="text-4xl font-extrabold text-secondary mb-2">+۱۰۰۰</div>
            <div className="text-secondarytext font-medium">کسب‌وکار موفق</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20">
          <button
            onClick={() => navigate('/login')}
            className="bg-linear-to-r from-gradiantbtnfrom to-gradiantbtnto text-white px-16 py-5 rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300 inline-flex items-center gap-3 group"
          >
            <span>شروع کنید</span>
            <span className="group-hover:-translate-x-2 transition-transform">←</span>
          </button>
          <p className="text-tertiarytext mt-4 text-sm font-medium">
            نیاز به کارت اعتباری ندارید • نصب فوری • پشتیبانی رایگان
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-border mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-secondarytext font-medium">
            <p>© ۱۴۰۵ {config.marketName} - تمامی حقوق محفوظ است</p>
          </div>
        </div>
      </footer>

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