// src/lib/types.ts
export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: 'superadmin' | 'staff' | 'customer' | 'vendor';
  department?: 'customer_service' | 'management' | 'accounting' | 'vendor';
  image?: string | null;
}

export interface Order {
  id: string;
  customer_id: string;
  order_type: 'appointment' | 'description' | 'image_upload' | null;
  priority: string;
  appointment_date?: string;
  description?: string;
  image_urls?: string[];
  measurements?: { [key: string]: string };
  status: string;
  total_amount?: number;
  vendor_id?: string;
}