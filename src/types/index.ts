// export interface Employee {
//   _id: string;
//   user_id: string;
//   name: string;
//   role: 'admin' | 'cashier';
//   phone?: string;
//   created_at: string;
// }

export interface Customer {
  id: string;
  full_name: string;
  phone?: string;
  address?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category_id?: string;
  price: number;
  image_url?: string;
  description?: string;
  is_available: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  employee_id: string;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
