import { createClient } from '@supabase/supabase-js';

// Force using mock database for local development
// اگر می‌خواهید Supabase واقعی استفاده کنید، این خط را غیرفعال کنید
const FORCE_MOCK = true;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface MockEmployee {
  id: string;
  user_id: string;
  full_name: string;
  role: 'admin' | 'cashier';
  phone?: string;
  created_at: string;
}

interface MockCategory {
  id: string;
  name: string;
  icon?: string;
  created_at: string;
}

interface MockProduct {
  id: string;
  name: string;
  category_id?: string;
  price: number;
  is_available: boolean;
  created_at: string;
}

interface MockCustomer {
  id: string;
  full_name: string;
  phone?: string;
  address?: string;
  created_at: string;
}

interface MockUser {
  id: string;
  email: string;
  password: string;
}

interface Session {
  user: { id: string; email: string };
}

const mockUsers: Record<string, MockUser> = {
  'admin@local.ir': { id: '1', email: 'admin@local.ir', password: '123456' },
  'user@local.ir': { id: '2', email: 'user@local.ir', password: '123456' },
};

const mockEmployees: Record<string, MockEmployee> = {
  '1': {
    id: '1',
    user_id: '1',
    full_name: 'مدیر سیستم',
    role: 'admin',
    phone: '09123456789',
    created_at: '2024-01-01',
  },
  '2': {
    id: '2',
    user_id: '2',
    full_name: 'محمود صندوقدار',
    role: 'cashier',
    phone: '09987654321',
    created_at: '2024-01-01',
  },
};

const mockCategories: Record<string, MockCategory> = {
  '1': {
    id: '1',
    name: 'نوشیدنی',
    icon: '🥤',
    created_at: '2024-01-01',
  },
  '2': {
    id: '2',
    name: 'غذا',
    icon: '🍔',
    created_at: '2024-01-01',
  },
  '3': {
    id: '3',
    name: 'دسر',
    icon: '🍰',
    created_at: '2024-01-01',
  },
};

const mockProducts: Record<string, MockProduct> = {
  '1': {
    id: '1',
    name: 'آب معدنی',
    category_id: '1',
    price: 5000,
    is_available: true,
    created_at: '2024-01-01',
  },
  '2': {
    id: '2',
    name: 'چای',
    category_id: '1',
    price: 8000,
    is_available: true,
    created_at: '2024-01-01',
  },
  '3': {
    id: '3',
    name: 'برگر گوشت',
    category_id: '2',
    price: 45000,
    is_available: true,
    created_at: '2024-01-01',
  },
  '4': {
    id: '4',
    name: 'فلافل',
    category_id: '2',
    price: 25000,
    is_available: true,
    created_at: '2024-01-01',
  },
  '5': {
    id: '5',
    name: 'کیک شکلاتی',
    category_id: '3',
    price: 35000,
    is_available: true,
    created_at: '2024-01-01',
  },
};

const mockCustomers: Record<string, MockCustomer> = {
  '1': {
    id: '1',
    full_name: 'علی احمدی',
    phone: '09111111111',
    address: 'تهران',
    created_at: '2024-01-01',
  },
  '2': {
    id: '2',
    full_name: 'زهرا محمودی',
    phone: '09222222222',
    address: 'تهران',
    created_at: '2024-01-01',
  },
};

const orders: Record<string, Record<string, unknown>> = {};
const orderItems: Record<string, Record<string, unknown>> = {};
let currentSession: Session | null = null;
const authListeners: Array<(event: string, session: Session | null) => void> = [];

const mockAuth = {
  getSession: async () => {
    return { data: { session: currentSession } };
  },
  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    authListeners.push(callback);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const idx = authListeners.indexOf(callback);
            if (idx !== -1) authListeners.splice(idx, 1);
          },
        },
      },
    };
  },
  signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
    const user = mockUsers[email];
    if (user && user.password === password) {
      currentSession = { user: { id: user.id, email: user.email } };
      authListeners.forEach((cb) => cb('SIGNED_IN', currentSession));
      return { data: { session: currentSession }, error: null };
    }
    return {
      data: null,
      error: { message: 'ایمیل یا رمز عبور اشتباه است' },
    };
  },
  signOut: async () => {
    currentSession = null;
    authListeners.forEach((cb) => cb('SIGNED_OUT', null));
    return { error: null };
  },
};

type FilterValue = unknown;

const mockFrom = (table: string) => ({
  select: () => {
    let tableData: unknown[] = [];

    if (table === 'products') {
      tableData = Object.values(mockProducts).filter((p) => p.is_available);
    } else if (table === 'categories') {
      tableData = Object.values(mockCategories);
    } else if (table === 'customers') {
      tableData = Object.values(mockCustomers);
    } else if (table === 'employees') {
      tableData = Object.values(mockEmployees);
    }

    return {
      eq: (col: string, value: FilterValue) => ({
        order: () => ({
          data: tableData,
          error: null,
        }),
        maybeSingle: async () => {
          if (table === 'employees' && col === 'user_id') {
            const emp = mockEmployees[value as string];
            return { data: emp || null, error: null };
          }
          return { data: null, error: null };
        },
      }),
      order: () => ({
        data: tableData,
        error: null,
      }),
    };
  },
  order: () => {
    let tableData: unknown[] = [];

    if (table === 'products') {
      tableData = Object.values(mockProducts).filter((p) => p.is_available);
    } else if (table === 'categories') {
      tableData = Object.values(mockCategories);
    } else if (table === 'customers') {
      tableData = Object.values(mockCustomers);
    }

    return {
      data: tableData,
      error: null,
    };
  },
  insert: async (data: Record<string, unknown> | Record<string, unknown>[]) => {
    const dataArray = Array.isArray(data) ? data : [data];

    if (table === 'orders') {
      const newOrder = { id: Math.random().toString(), ...dataArray[0] };
      orders[newOrder.id as string] = newOrder;

      return {
        select: () => ({
          single: async () => ({ data: newOrder, error: null }),
        }),
      };
    }

    if (table === 'order_items') {
      dataArray.forEach((item) => {
        const id = Math.random().toString();
        orderItems[id] = { id, ...item };
      });
      return { data: dataArray, error: null };
    }

    return { data: dataArray, error: null };
  },
});

const mockSupabase = {
  auth: mockAuth,
  from: mockFrom,
};

export const supabase = FORCE_MOCK || !(supabaseUrl && supabaseAnonKey)
  ? mockSupabase
  : createClient(supabaseUrl, supabaseAnonKey);
