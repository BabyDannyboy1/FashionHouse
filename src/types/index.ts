export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: 'superadmin' | 'staff' | 'vendor' | 'customer';
  staff_type?: 'customer_service' | 'vendor' | null;
  phone?: string | null;
  address?: string | null;
  created_at: string;
  updated_at?: string | null;
  profile_picture?: string | null;
}

export interface Order {
  id: number;
  customer_id: number;
  staff_id?: number | null;
  vendor_id?: number | null;
  design_id?: number | null;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  description?: string | null;
  price?: number | null;
  commission_rate?: number | null;
  created_at: string;
  total_amount?: number | null;
  order_type?: 'appointment' | 'description' | 'image_upload' | null;
  paid_amount?: number | null;
  priority?: 'low' | 'medium' | 'high' | null;
  appointment_date?: string | null;
  measurements?: Record<string, string> | null;
  image_urls?: string[] | null;
}