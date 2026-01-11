import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only throw error if both are missing and we're in a browser (client-side)
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? '✓ Set' : '✗ Missing',
    key: supabaseAnonKey ? '✓ Set' : '✗ Missing',
  });
}

// Create client with proper session persistence
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
);

// Helper functions for common operations
export const supabaseHelpers = {
  // Auth & User Profiles
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      // Create user profile
      await supabase.from('user_profiles').insert([
        {
          id: data.user.id,
          email,
          full_name: fullName,
        },
      ]);
    }
    return data;
  },

  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signInWithGoogle() {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
  },

  async signOut() {
    return supabase.auth.signOut();
  },

  async getCurrentUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      // Try to get session as fallback
      const { data } = await supabase.auth.getSession();
      return data?.session?.user || null;
    }
  },

  async getUserProfile(userId: string) {
    return supabase.from('user_profiles').select('*').eq('id', userId).single();
  },

  // Products
  async getProducts(limit = 20, offset = 0) {
    return supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });
  },

  async getProductById(id: string) {
    return supabase.from('products').select('*').eq('id', id).single();
  },

  async getAllProducts() {
    return supabase.from('products').select('*').order('created_at', { ascending: false });
  },

  async createProduct(productData: {
    name: string;
    description: string;
    price: number;
    image_url: string;
    category: string;
    sizes: string[];
    colors: string[];
    stock: number;
  }) {
    return supabase.from('products').insert([productData]);
  },

  async updateProduct(id: string, updates: any) {
    return supabase.from('products').update(updates).eq('id', id);
  },

  async deleteProduct(id: string) {
    return supabase.from('products').delete().eq('id', id);
  },

  // Orders
  async createOrder(orderData: {
    user_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    address: string;
    city: string;
    zip_code: string;
    total_amount: number;
    status: string;
    payment_method: string;
  }) {
    return supabase.from('orders').insert([orderData]).select();
  },

  async getOrdersByUserId(userId: string) {
    return supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  },

  async getOrderById(id: string) {
    return supabase.from('orders').select('*').eq('id', id).single();
  },

  async getAllOrders() {
    return supabase.from('orders').select('*').order('created_at', { ascending: false });
  },

  async updateOrderStatus(orderId: string, status: string) {
    return supabase.from('orders').update({ status, updated_at: new Date() }).eq('id', orderId);
  },

  // Order Items
  async createOrderItems(items: Array<{
    order_id: string;
    product_id: string;
    quantity: number;
    size?: string;
    color?: string;
    price: number;
  }>) {
    return supabase.from('order_items').insert(items).select();
  },

  async getOrderItems(orderId: string) {
    return supabase.from('order_items').select('*').eq('order_id', orderId);
  },

  // Admin
  async getStats() {
    const [orders, products, profiles] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
    ]);

    let totalRevenue = 0;
    const { data: ordersData } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'delivered');

    if (ordersData) {
      totalRevenue = ordersData.reduce((sum, order) => sum + order.total_amount, 0);
    }

    return {
      totalOrders: orders.count || 0,
      totalRevenue,
      totalProducts: products.count || 0,
      totalCustomers: profiles.count || 0,
    };
  },

  async getIsAdmin(userId: string) {
    const { data } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();
    return data?.is_admin || false;
  },
};
