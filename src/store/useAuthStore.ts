// import { AxiosInstance } from 'axios';
// import { create } from 'zustand';
// import axiosInstance from '../lib/axiosInstance';
// import CryptoJS from 'crypto';

// // ⚠️ کلید رمزگذاری (حتماً از متغیر محیطی استفاده کنید)
// const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'YOUR_STRONG_SECRET_KEY';

// interface User {
//     _id: string;
//     phone: string;
//     name: string;
//     role: string;
//     createdAt: string;
//     updatedAt: string;
// }

// interface AuthStore {
//     user: User | null;
//     token: string | null;
//     loading: boolean;
//     error: string | null;
//     login: (phone: string, password: string) => Promise<void>;
//     logout: () => void;
//     setUser: (user: User | null) => void;
//     clearError: () => void;
//     initializeAuth: () => void;
// }

// // تابع رمزگذاری
// const encryptData = (data: string): string => {
//     return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
// };

// // تابع رمزگشایی
// const decryptData = (encryptedData: string): string | null => {
//     try {
//         const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
//         return bytes.toString(CryptoJS.enc.Utf8);
//     } catch (e) {
//         console.error('Decryption failed:', e);
//         return null;
//     }
// };

// // ✅ کلید ثابت برای localStorage (نه هش داده‌ها!)
// const AUTH_USER_KEY = 'authUser'; // کلید ثابت (هش نمی‌گیرد)

// const getStoredUser = (): User | null => {
//     const encryptedUser = localStorage.getItem(AUTH_USER_KEY);
//     if (encryptedUser) {
//         const decryptedData = decryptData(encryptedUser);
//         if (decryptedData) {
//             try {
//                 return JSON.parse(decryptedData);
//             } catch (e) {
//                 console.error('Invalid user data:', e);
//             }
//         }
//     }
//     return null;
// };

// export const useAuthStore = create<AuthStore>((set) => ({
//     user: getStoredUser(),
//     token: localStorage.getItem('authToken'),
//     loading: false,
//     error: null,
//     login: async (phone: string, password: string) => {
//         set({ loading: true, error: null });
//         try {
//             const response = await axiosInstance.post('/auth/login', { phone, password });
//             const { token, user } = response.data;

//             // ✅ ذخیره رمزگذاری شده (بدون پسورد)
//             if (typeof window !== 'undefined') {
//                 localStorage.setItem('authToken', token);
//                 const encryptedUser = encryptData(JSON.stringify(user));
//                 localStorage.setItem(AUTH_USER_KEY, encryptedUser); // کلید ثابت
//                 axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//             }

//             set({ user, token, loading: false, error: null });
//         } catch (error: any) {
//             const errorMessage = error.response?.data?.message || 'خطا در لاگین';
//             set({ loading: false, error: errorMessage, user: null, token: null });
//             throw error;
//         }
//     },
//     logout: () => {
//         if (typeof window !== 'undefined') {
//             localStorage.removeItem('authToken');
//             localStorage.removeItem(AUTH_USER_KEY); // کلید ثابت
//         }
//         set({ user: null, token: null, loading: false, error: null });
//     },
//     setUser: (user: User | null) => {
//         if (typeof window !== 'undefined' && user) {
//             const encryptedUser = encryptData(JSON.stringify(user));
//             localStorage.setItem(AUTH_USER_KEY, encryptedUser);
//         }
//         set({ user });
//     },
//     clearError: () => set({ error: null }),
//     initializeAuth: () => {
//         const token = localStorage.getItem('authToken');
//         const user = getStoredUser();
//         if (token && user) {
//             axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//             set({ token, user });
//         }
//     },
// }));

import { create } from "zustand";
import axiosInstance from "../lib/axiosInstance";
import { encryptData, decryptData } from "../utils/encryption";
import { hashString } from "../utils/hash";
import { getUserCached, removeUserCached } from "../utils/caching";

const AUTH_USER_KEY = "authUser";

interface User {
  _id: string;
  phone: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  getMe: () => void;
  clearError: () => void;
  initializeAuth: () => void;
}

const getStoredUser = (): User | null => {
  const encryptedUser =
    typeof window !== "undefined" ? localStorage.getItem(AUTH_USER_KEY) : null;
  if (!encryptedUser) return null;

  const decrypted = decryptData(encryptedUser);
  if (!decrypted) return null;

  try {
    return JSON.parse(decrypted);
  } catch (err) {
    console.error("Invalid user JSON:", err);
    return null;
  }
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: getStoredUser(),
  token:
    typeof window !== "undefined" ? localStorage.getItem("authToken") : null,
  loading: false,
  error: null,

  login: async (phone, password) => {
    set({ loading: true, error: null });

    try {
      const response = await axiosInstance.post("/auth/login", {
        phone,
        password,
      });
      const { token, user } = response.data;

      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", token);

        if (user.role !== "admin") {
          await removeUserCached(phone);
          const encryptedUser = await encryptData(
            JSON.stringify({
              ...user,
              password: await hashString(password),
              token,
            }),
          );

          const AUTH_USER_KEY = await hashString(phone);
          localStorage.setItem(AUTH_USER_KEY, encryptedUser);
        }
        axiosInstance.defaults.headers.common["Authorization"] =
          `Bearer ${token}`;
      }

      set({ user, token, loading: false });
    } catch (err: any) {
      let message =
        err.response?.data?.message || "لطفا اتصال اینترنت خود را بررسی کنید";

      if (!err.response) {
        // restore cached user
        const chachUser: any = await getUserCached(phone, password);
        if (chachUser && chachUser.success) {
          return set({
            user: chachUser.user,
            token: chachUser.token,
            loading: false,
          });
        } else if (typeof chachUser === "boolean") {
          message = "نام کاربری یا پسورد اشتباه است";
        }
      }
      set({ loading: false, error: message, user: null, token: null });
      throw err;
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem(AUTH_USER_KEY);
    }
    set({ user: null, token: null, loading: false, error: null });
  },

  setUser: (user) => {
    // if (typeof window !== "undefined" && user) {
    //     localStorage.setItem(AUTH_USER_KEY, encryptData(JSON.stringify(user)));
    // }
    set({ user });
  },

  getMe: async () => {
    const token = get().token || localStorage.getItem("authToken");
    if (!token) {
      // get().clearAuth();
      return false;
    }

    const response = await axiosInstance.get("/auth/me", {
      headers: {
        "x-auth-token": token,
      },
    });

    if (response.data) {
      const user = response.data;

      set({ user });
      return true;
    } else {
      // get().clearAuth();
      return false;
    }
  },

  clearError: () => set({ error: null }),

  initializeAuth: async () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    const user = get().user;

    // const user = getStoredUser();

    if (token && user) {
      axiosInstance.defaults.headers.common["Authorization"] =
        `Bearer ${token}`;
      set({ token, user });
    } else {
      await get().getMe();
      //   set({ isAuthenticated: await get().getMe() });
    }
  },
}));
