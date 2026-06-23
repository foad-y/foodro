import * as yup from "yup";
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LogIn, ArrowRight, Lock, Phone } from 'lucide-react';
import AppLogo from "../components/AppLogo";

const loginSchema = yup.object({
  phone: yup
    .string()
    .required("شماره موبایل الزامی است")
    .matches(/^09\d{9}$/, "شماره موبایل معتبر نیست"),

  password: yup
    .string()
    .required("رمز عبور الزامی است")
    .min(4, "رمز عبور باید حداقل ۴ کاراکتر باشد"),
});

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login, user, loading, error } = useAuthStore();

  // بعد از لاگین، بر اساس role ریدایرکت کنید
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'cashier') {
        navigate('/cashier');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async () => {
    try {
      await loginSchema.validate(
        { phone, password },
        { abortEarly: false }
      );

      await toast.promise(
        login(phone, password),
        {
          pending: "در حال ورود...",
          success: "ورود با موفقیت انجام شد ✅",
          error: "خطایی در عملیات ورود رخ داده است ❌",
        }
      );
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const errors = [...new Set(err.errors)];
        errors.forEach((message) => {
          toast.error(message);
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-tertiary flex items-center justify-center px-4 relative overflow-hidden font-sans" dir="rtl">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-warning/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl py-8 px-6 border border-border">
          
          {/* Logo Section */}
          <div className="flex justify-center mb-4">
            <AppLogo className="lg:w-32 lg:h-32 w-28 h-28 drop-shadow-md" />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold bg-linear-to-r from-gradiantbtnfrom to-gradiantbtnto bg-clip-text text-transparent mb-2">
              ورود به سیستم
            </h2>
            <p className="text-secondarytext font-medium">
              لطفا اطلاعات خود را وارد کنید
            </p>
          </div>

          {/* Error Message کاملا داینامیک */}
          {error && (
            <div className="bg-error/10 border-r-4 border-error text-error px-4 py-3 rounded-lg mb-6 animate-shake">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-error rounded-full shadow-[0_0_5px_currentColor]"></div>
                <span className="font-bold text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            
            {/* Phone Input */}
            <div className="group">
              <label className="block text-sm font-bold text-secondary mb-2">
                نام کاربری
              </label>
              <div className="relative">
                {/* تغییر رنگ آیکون به primary در حالت فوکوس */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-tertiarytext group-focus-within:text-primary transition-colors duration-300">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  // تغییر رنگ حاشیه به primary در حالت فوکوس
                  className="w-full pr-12 pl-4 py-3.5 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 bg-white/50 text-primarytext font-medium outline-hidden"
                  placeholder="09120000000"
                  required
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit();
                  }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <label className="block text-sm font-bold text-secondary mb-2">
                رمز عبور
              </label>
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-tertiarytext group-focus-within:text-primary transition-colors duration-300">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-12 pl-4 py-3.5 border-2 border-border rounded-xl focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all duration-300 bg-white/50 text-primarytext font-medium outline-hidden"
                  placeholder="••••••••"
                  required
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmit();
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              onClick={handleSubmit}
              className="w-full bg-linear-to-r from-gradiantbtnfrom to-gradiantbtnto text-white py-4 rounded-xl font-bold hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>در حال ورود...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span>ورود</span>
                </>
              )}
            </button>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate('/')}
            className="w-full mt-6 text-secondarytext hover:text-primary hover:bg-primary/5 transition-all duration-300 py-3 rounded-xl font-bold flex items-center justify-center gap-2 group"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            <span>بازگشت به صفحه اصلی</span>
          </button>
        </div>
      </div>

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
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.5s; }
      `}</style>
    </div>
  );
}