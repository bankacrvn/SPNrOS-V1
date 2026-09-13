import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Category, MenuItem, Order, OrderItem, CashierShift, 
  Employee, SalaryPayrollRecord, AccountingTransaction, AuditLog, SystemSettings 
} from '../types';

const STORAGE_KEY_SUPABASE_URL = 'spn_ros_supabase_url';
const STORAGE_KEY_SUPABASE_ANON_KEY = 'spn_ros_supabase_anon_key';

export const DEFAULT_SUPABASE_URL = 'https://hytfrzxfcsezipipnpzo.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5dGZyenhmY3NlemlwaXBucHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNDMzNDIsImV4cCI6MjEwNDgxOTM0Mn0.vVZK7aaVNGLqyuuA1PZMnD6sjj3M07wy4MKVw6Us4FA';

export function getSavedSupabaseCredentials(): { url: string; anonKey: string } {
  const metaEnv = (import.meta as unknown as { env: Record<string, string> }).env || {};
  const envUrl = metaEnv.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const envKey = metaEnv.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  const localUrl = localStorage.getItem(STORAGE_KEY_SUPABASE_URL) || envUrl;
  const localKey = localStorage.getItem(STORAGE_KEY_SUPABASE_ANON_KEY) || envKey;
  return { url: localUrl, anonKey: localKey };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (url) localStorage.setItem(STORAGE_KEY_SUPABASE_URL, url);
  else localStorage.removeItem(STORAGE_KEY_SUPABASE_URL);

  if (anonKey) localStorage.setItem(STORAGE_KEY_SUPABASE_ANON_KEY, anonKey);
  else localStorage.removeItem(STORAGE_KEY_SUPABASE_ANON_KEY);
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSavedSupabaseCredentials();
  if (!url || !anonKey || !url.startsWith('http')) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey);
    } catch {
      supabaseInstance = null;
    }
  }
  return supabaseInstance;
}

export function resetSupabaseInstance() {
  supabaseInstance = null;
}

export async function testSupabaseConnection(customUrl?: string, customKey?: string): Promise<{ success: boolean; message: string }> {
  const url = customUrl !== undefined ? customUrl : getSavedSupabaseCredentials().url;
  const anonKey = customKey !== undefined ? customKey : getSavedSupabaseCredentials().anonKey;

  if (!url || !anonKey) {
    return { success: false, message: 'Missing Supabase URL or Anon Key' };
  }

  try {
    const tempClient = createClient(url, anonKey);
    const { data, error } = await tempClient.from('system_settings').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      // Try checking categories
      const { error: catError } = await tempClient.from('categories').select('id').limit(1);
      if (catError) {
        return { success: false, message: `Connection failed: ${catError.message}` };
      }
    }
    return { success: true, message: 'Successfully connected to Supabase PostgreSQL database!' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Connection error: ${msg}` };
  }
}

// ============================================================================
// LOCAL STORAGE SEED & SYNC FALLBACK LAYER
// Guaranteed uninterrupted operation whether connected to Supabase or running locally
// ============================================================================

const LOCAL_STORE_KEYS = {
  categories: 'spn_ros_categories',
  menuItems: 'spn_ros_menu_items',
  orders: 'spn_ros_orders',
  shifts: 'spn_ros_shifts',
  employees: 'spn_ros_employees',
  payroll: 'spn_ros_payroll',
  accounting: 'spn_ros_accounting',
  audit: 'spn_ros_audit_logs',
  settings: 'spn_ros_settings',
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'c1000000-0000-0000-0000-000000000001', name_en: 'Main Course', name_th: 'อาหารจานหลัก', is_active: true },
  { id: 'c2000000-0000-0000-0000-000000000002', name_en: 'Beverages', name_th: 'เครื่องดื่ม', is_active: true },
  { id: 'c3000000-0000-0000-0000-000000000003', name_en: 'Desserts', name_th: 'ของหวาน', is_active: true },
  { id: 'c4000000-0000-0000-0000-000000000004', name_en: 'Appetizers', name_th: 'ของทานเล่น', is_active: true },
];

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: 'm1000000-0000-0000-0000-000000000001',
    category_id: 'c1000000-0000-0000-0000-000000000001',
    name_en: 'Wagyu Beef Ribeye Steak',
    name_th: 'สเต๊กเนื้อวัววากิว ริบอาย',
    price: 1250.00,
    cost: 580.00,
    image_url: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=600&q=80',
    stock_quantity: 25,
    reorder_level: 5,
    is_active: true,
  },
  {
    id: 'm1000000-0000-0000-0000-000000000002',
    category_id: 'c1000000-0000-0000-0000-000000000001',
    name_en: 'Truffle Cream Fettuccine',
    name_th: 'เฟตตูชินี่ครีมเห็ดทรัฟเฟิล',
    price: 420.00,
    cost: 160.00,
    image_url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281292?auto=format&fit=crop&w=600&q=80',
    stock_quantity: 40,
    reorder_level: 10,
    is_active: true,
  },
  {
    id: 'm1000000-0000-0000-0000-000000000003',
    category_id: 'c1000000-0000-0000-0000-000000000001',
    name_en: 'Pad Thai River Prawn',
    name_th: 'ผัดไทยกุ้งแม่น้ำสด',
    price: 350.00,
    cost: 120.00,
    image_url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=600&q=80',
    stock_quantity: 30,
    reorder_level: 8,
    is_active: true,
  },
  {
    id: 'm2000000-0000-0000-0000-000000000001',
    category_id: 'c2000000-0000-0000-0000-000000000002',
    name_en: 'Iced Matcha Latte',
    name_th: 'มัทฉะลาเต้เย็น',
    price: 140.00,
    cost: 45.00,
    image_url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
    stock_quantity: 100,
    reorder_level: 20,
    is_active: true,
  },
  {
    id: 'm2000000-0000-0000-0000-000000000002',
    category_id: 'c2000000-0000-0000-0000-000000000002',
    name_en: 'Signature Cold Brew Coffee',
    name_th: 'กาแฟโคลด์บรูว์สูตรพิเศษ',
    price: 160.00,
    cost: 50.00,
    image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80',
    stock_quantity: 80,
    reorder_level: 15,
    is_active: true,
  },
  {
    id: 'm3000000-0000-0000-0000-000000000001',
    category_id: 'c3000000-0000-0000-0000-000000000003',
    name_en: 'Mango Sticky Rice Parfait',
    name_th: 'พาร์เฟต์ข้าวเหนียวมะม่วง',
    price: 220.00,
    cost: 75.00,
    image_url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80',
    stock_quantity: 35,
    reorder_level: 10,
    is_active: true,
  },
  {
    id: 'm4000000-0000-0000-0000-000000000001',
    category_id: 'c4000000-0000-0000-0000-000000000004',
    name_en: 'Crispy Calamari Rings',
    name_th: 'ปลาหมึกทอดกรอบซอสทาร์ทาร์',
    price: 280.00,
    cost: 90.00,
    image_url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
    stock_quantity: 50,
    reorder_level: 12,
    is_active: true,
  }
];

const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'e1',
    name: 'Somchai Jaidee',
    nickname: 'Chef Chai',
    position: 'Head Chef',
    department: 'Kitchen',
    salary: 45000,
    hourly_rate: 250,
    phone: '081-234-5678',
    email: 'somchai.j@spnrestaurant.com',
    national_id: '1-1002-34567-89-0',
    address: '88/12 Sukhumvit Soi 21, Asoke, Bangkok 10110',
    emergency_contact: 'Ploypailin Jaidee (Wife)',
    emergency_phone: '089-876-5432',
    bank_name: 'Kasikornbank (KBANK)',
    bank_account: '045-2-98765-4',
    promptpay_id: '0812345678',
    hire_date: '2023-01-15',
    status: 'active',
    notes: 'Master specialist in culinary steak and French sauces.',
  },
  {
    id: 'e2',
    name: 'Suda Wongthong',
    nickname: 'Da',
    position: 'POS Cashier / Supervisor',
    department: 'Front of House',
    salary: 28000,
    hourly_rate: 160,
    phone: '084-555-1234',
    email: 'suda.w@spnrestaurant.com',
    national_id: '3-1005-98765-43-2',
    address: '45/8 Rama 9 Rd, Huai Khwang, Bangkok 10310',
    emergency_contact: 'Wichai Wongthong (Father)',
    emergency_phone: '081-444-9999',
    bank_name: 'Siam Commercial Bank (SCB)',
    bank_account: '123-4-56789-0',
    promptpay_id: '0845551234',
    hire_date: '2023-06-01',
    status: 'active',
    notes: 'Experienced in POS shifts and cash drawer reconciliation.',
  },
  {
    id: 'e3',
    name: 'Ananda Srivilai',
    nickname: 'Arm',
    position: 'Server / Host',
    department: 'Front of House',
    salary: 22000,
    hourly_rate: 125,
    phone: '086-777-8899',
    email: 'ananda.s@spnrestaurant.com',
    national_id: '1-1044-87654-32-1',
    address: '102 Sathorn Rd, Silom, Bangkok 10500',
    emergency_contact: 'Nipa Srivilai (Mother)',
    emergency_phone: '086-111-2233',
    bank_name: 'Bangkok Bank (BBL)',
    bank_account: '987-6-54321-9',
    promptpay_id: '0867778899',
    hire_date: '2024-02-10',
    status: 'active',
    notes: 'Fluent in English and Thai customer hospitality.',
  },
];

const DEFAULT_PAYROLL: SalaryPayrollRecord[] = [
  {
    id: 'pr-1',
    employee_id: 'e1',
    employee_name: 'Somchai Jaidee',
    position: 'Head Chef',
    department: 'Kitchen',
    pay_period: 'August 2026',
    base_salary: 45000,
    overtime_hours: 12,
    overtime_rate: 250,
    overtime_pay: 3000,
    allowances: 2000,
    bonus: 5000,
    gross_pay: 55000,
    tax_deduction: 1500,
    social_security: 750,
    other_deductions: 0,
    total_deductions: 2250,
    net_salary: 52750,
    payment_method: 'bank_transfer',
    payment_status: 'paid',
    bank_name: 'Kasikornbank (KBANK)',
    bank_account: '045-2-98765-4',
    paid_at: '2026-08-31T10:30:00.000Z',
    notes: 'August End of Month Payroll Disbursed',
    created_at: '2026-08-31T09:00:00.000Z',
  },
  {
    id: 'pr-2',
    employee_id: 'e2',
    employee_name: 'Suda Wongthong',
    position: 'POS Cashier / Supervisor',
    department: 'Front of House',
    pay_period: 'August 2026',
    base_salary: 28000,
    overtime_hours: 8,
    overtime_rate: 160,
    overtime_pay: 1280,
    allowances: 1500,
    bonus: 1000,
    gross_pay: 31780,
    tax_deduction: 450,
    social_security: 750,
    other_deductions: 0,
    total_deductions: 1200,
    net_salary: 30580,
    payment_method: 'bank_transfer',
    payment_status: 'paid',
    bank_name: 'Siam Commercial Bank (SCB)',
    bank_account: '123-4-56789-0',
    paid_at: '2026-08-31T10:30:00.000Z',
    notes: 'August End of Month Payroll Disbursed',
    created_at: '2026-08-31T09:00:00.000Z',
  },
];

const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  restaurant_name: 'SPN Gourmet Dining',
  tax_rate: 0,
  currency_symbol: '฿',
  timezone: 'Asia/Bangkok',
  receipt_header: 'Welcome to SPN Gourmet Dining',
  receipt_footer: 'Thank you for dining with us! Please come again.',
  promptpay_id: '0812345678',
  theme: 'light',
  master_pin: '260539',
  monthly_income_target: 150000,
  monthly_expense_target: 50000,
};

export function getLocalStore<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setLocalStore<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write to localStorage key ${key}`, err);
  }
}

// Data Fetching & Sync Layer
export async function dbFetchCategories(): Promise<Category[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
    if (!error && data && data.length > 0) {
      setLocalStore(LOCAL_STORE_KEYS.categories, data);
      return data;
    }
  }
  return getLocalStore(LOCAL_STORE_KEYS.categories, DEFAULT_CATEGORIES);
}

export async function dbSaveCategory(category: Partial<Category>): Promise<Category> {
  const supabase = getSupabaseClient();
  const id = category.id || `c-${Date.now()}`;
  const fullCat: Category = {
    id,
    name_en: category.name_en || 'New Category',
    name_th: category.name_th || 'หมวดหมู่ใหม่',
    is_active: category.is_active ?? true,
    created_at: category.created_at || new Date().toISOString(),
  };

  if (supabase) {
    await supabase.from('categories').upsert(fullCat);
  }

  const list = getLocalStore<Category[]>(LOCAL_STORE_KEYS.categories, DEFAULT_CATEGORIES);
  const idx = list.findIndex(c => c.id === id);
  if (idx >= 0) list[idx] = fullCat;
  else list.push(fullCat);
  setLocalStore(LOCAL_STORE_KEYS.categories, list);
  return fullCat;
}

export async function dbFetchMenuItems(): Promise<MenuItem[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.from('menu_items').select('*').order('created_at', { ascending: true });
    if (!error && data && data.length > 0) {
      setLocalStore(LOCAL_STORE_KEYS.menuItems, data);
      return data;
    }
  }
  return getLocalStore(LOCAL_STORE_KEYS.menuItems, DEFAULT_MENU_ITEMS);
}

export async function dbSaveMenuItem(item: Partial<MenuItem>): Promise<MenuItem> {
  const supabase = getSupabaseClient();
  const id = item.id || `m-${Date.now()}`;
  const fullItem: MenuItem = {
    id,
    category_id: item.category_id || '',
    name_en: item.name_en || 'New Item',
    name_th: item.name_th || 'รายการใหม่',
    price: Number(item.price) || 0,
    cost: Number(item.cost) || 0,
    image_url: item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    stock_quantity: Number(item.stock_quantity) || 0,
    reorder_level: Number(item.reorder_level) || 10,
    is_active: item.is_active ?? true,
    created_at: item.created_at || new Date().toISOString(),
  };

  if (supabase) {
    await supabase.from('menu_items').upsert(fullItem);
  }

  const list = getLocalStore<MenuItem[]>(LOCAL_STORE_KEYS.menuItems, DEFAULT_MENU_ITEMS);
  const idx = list.findIndex(m => m.id === id);
  if (idx >= 0) list[idx] = fullItem;
  else list.push(fullItem);
  setLocalStore(LOCAL_STORE_KEYS.menuItems, list);
  return fullItem;
}

export async function dbDeleteMenuItem(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    await supabase.from('menu_items').delete().eq('id', id);
  }
  const list = getLocalStore<MenuItem[]>(LOCAL_STORE_KEYS.menuItems, DEFAULT_MENU_ITEMS);
  const updated = list.filter(m => m.id !== id);
  setLocalStore(LOCAL_STORE_KEYS.menuItems, updated);
}

export async function dbFetchOrders(): Promise<Order[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
    if (!error && data) {
      setLocalStore(LOCAL_STORE_KEYS.orders, data);
      return data;
    }
  }
  return getLocalStore<Order[]>(LOCAL_STORE_KEYS.orders, []);
}

export async function dbCreateOrder(order: Order, items: OrderItem[]): Promise<Order> {
  const supabase = getSupabaseClient();

  if (supabase) {
    const { data: orderData, error: orderErr } = await supabase.from('orders').insert({
      id: order.id,
      order_number: order.order_number,
      table_number: order.table_number,
      total_amount: order.total_amount,
      discount_amount: order.discount_amount,
      tax_amount: order.tax_amount,
      net_amount: order.net_amount,
      payment_method: order.payment_method,
      amount_received: order.amount_received,
      change_given: order.change_given,
      status: order.status,
      created_at: order.created_at,
    }).select().single();

    if (!orderErr) {
      const dbItems = items.map(i => ({
        order_id: order.id,
        menu_item_id: i.menu_item_id,
        quantity: i.quantity,
        unit_price: i.unit_price,
        total_price: i.total_price,
      }));
      await supabase.from('order_items').insert(dbItems);
    }
  }

  // Deduct inventory stock in local state
  const menuItems = getLocalStore<MenuItem[]>(LOCAL_STORE_KEYS.menuItems, DEFAULT_MENU_ITEMS);
  items.forEach(item => {
    const found = menuItems.find(m => m.id === item.menu_item_id);
    if (found) {
      found.stock_quantity = Math.max(0, found.stock_quantity - item.quantity);
    }
  });
  setLocalStore(LOCAL_STORE_KEYS.menuItems, menuItems);

  // Save order to local list
  const orders = getLocalStore<Order[]>(LOCAL_STORE_KEYS.orders, []);
  const fullOrder = { ...order, order_items: items };
  orders.unshift(fullOrder);
  setLocalStore(LOCAL_STORE_KEYS.orders, orders);

  return fullOrder;
}

export async function dbFetchShifts(): Promise<CashierShift[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.from('cashier_shifts').select('*').order('opened_at', { ascending: false });
    if (!error && data) {
      setLocalStore(LOCAL_STORE_KEYS.shifts, data);
      return data;
    }
  }
  return getLocalStore<CashierShift[]>(LOCAL_STORE_KEYS.shifts, []);
}

export async function dbSaveShift(shift: CashierShift): Promise<CashierShift> {
  const supabase = getSupabaseClient();
  if (supabase) {
    await supabase.from('cashier_shifts').upsert(shift);
  }
  const shifts = getLocalStore<CashierShift[]>(LOCAL_STORE_KEYS.shifts, []);
  const idx = shifts.findIndex(s => s.id === shift.id);
  if (idx >= 0) shifts[idx] = shift;
  else shifts.unshift(shift);
  setLocalStore(LOCAL_STORE_KEYS.shifts, shifts);
  return shift;
}

export async function dbFetchEmployees(): Promise<Employee[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.from('employees').select('*').order('name', { ascending: true });
    if (!error && data && data.length > 0) {
      setLocalStore(LOCAL_STORE_KEYS.employees, data);
      return data;
    }
  }
  return getLocalStore<Employee[]>(LOCAL_STORE_KEYS.employees, DEFAULT_EMPLOYEES);
}

export async function dbSaveEmployee(employee: Partial<Employee>): Promise<Employee> {
  const supabase = getSupabaseClient();
  const id = employee.id || `e-${Date.now()}`;
  const fullEmp: Employee = {
    id,
    name: employee.name || 'New Staff',
    nickname: employee.nickname || '',
    position: employee.position || 'Staff',
    department: employee.department || 'Front of House',
    salary: Number(employee.salary) || 20000,
    hourly_rate: Number(employee.hourly_rate) || Math.round((Number(employee.salary) || 20000) / 176),
    phone: employee.phone || '',
    email: employee.email || '',
    national_id: employee.national_id || '',
    address: employee.address || '',
    emergency_contact: employee.emergency_contact || '',
    emergency_phone: employee.emergency_phone || '',
    bank_name: employee.bank_name || '',
    bank_account: employee.bank_account || '',
    promptpay_id: employee.promptpay_id || '',
    hire_date: employee.hire_date || new Date().toISOString().split('T')[0],
    notes: employee.notes || '',
    clock_in: employee.clock_in,
    clock_out: employee.clock_out,
    status: employee.status || 'active',
    created_at: employee.created_at || new Date().toISOString(),
  };

  if (supabase) {
    await supabase.from('employees').upsert(fullEmp);
  }

  const emps = getLocalStore<Employee[]>(LOCAL_STORE_KEYS.employees, DEFAULT_EMPLOYEES);
  const idx = emps.findIndex(e => e.id === id);
  if (idx >= 0) emps[idx] = fullEmp;
  else emps.push(fullEmp);
  setLocalStore(LOCAL_STORE_KEYS.employees, emps);
  return fullEmp;
}

export async function dbDeleteEmployee(empId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    await supabase.from('employees').delete().eq('id', empId);
  }
  const emps = getLocalStore<Employee[]>(LOCAL_STORE_KEYS.employees, DEFAULT_EMPLOYEES);
  const updated = emps.filter(e => e.id !== empId);
  setLocalStore(LOCAL_STORE_KEYS.employees, updated);
}

export async function dbFetchPayroll(): Promise<SalaryPayrollRecord[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.from('salary_payroll').select('*').order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      setLocalStore(LOCAL_STORE_KEYS.payroll, data);
      return data;
    }
  }
  return getLocalStore<SalaryPayrollRecord[]>(LOCAL_STORE_KEYS.payroll, DEFAULT_PAYROLL);
}

export async function dbSavePayroll(record: Partial<SalaryPayrollRecord>): Promise<SalaryPayrollRecord> {
  const supabase = getSupabaseClient();
  const id = record.id || `pr-${Date.now()}`;
  const baseSalary = Number(record.base_salary) || 0;
  const otHours = Number(record.overtime_hours) || 0;
  const otRate = Number(record.overtime_rate) || 0;
  const otPay = Number(record.overtime_pay) || (otHours * otRate);
  const allowances = Number(record.allowances) || 0;
  const bonus = Number(record.bonus) || 0;
  const grossPay = Number(record.gross_pay) || (baseSalary + otPay + allowances + bonus);

  const tax = Number(record.tax_deduction) || 0;
  const ssc = Number(record.social_security) || 0;
  const otherDeductions = Number(record.other_deductions) || 0;
  const totalDeductions = Number(record.total_deductions) || (tax + ssc + otherDeductions);
  const netSalary = Number(record.net_salary) || (grossPay - totalDeductions);

  const fullRecord: SalaryPayrollRecord = {
    id,
    employee_id: record.employee_id || '',
    employee_name: record.employee_name || 'Staff',
    position: record.position || 'Staff',
    department: record.department || 'Front of House',
    pay_period: record.pay_period || 'Current Period',
    base_salary: baseSalary,
    overtime_hours: otHours,
    overtime_rate: otRate,
    overtime_pay: otPay,
    allowances,
    bonus,
    gross_pay: grossPay,
    tax_deduction: tax,
    social_security: ssc,
    other_deductions: otherDeductions,
    total_deductions: totalDeductions,
    net_salary: netSalary,
    payment_method: record.payment_method || 'bank_transfer',
    payment_status: record.payment_status || 'draft',
    bank_name: record.bank_name || '',
    bank_account: record.bank_account || '',
    paid_at: record.paid_at,
    notes: record.notes || '',
    created_at: record.created_at || new Date().toISOString(),
  };

  if (supabase) {
    await supabase.from('salary_payroll').upsert(fullRecord);
  }

  const list = getLocalStore<SalaryPayrollRecord[]>(LOCAL_STORE_KEYS.payroll, DEFAULT_PAYROLL);
  const idx = list.findIndex(p => p.id === id);
  if (idx >= 0) list[idx] = fullRecord;
  else list.unshift(fullRecord);
  setLocalStore(LOCAL_STORE_KEYS.payroll, list);
  return fullRecord;
}

export async function dbDeletePayroll(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    await supabase.from('salary_payroll').delete().eq('id', id);
  }
  const list = getLocalStore<SalaryPayrollRecord[]>(LOCAL_STORE_KEYS.payroll, DEFAULT_PAYROLL);
  const updated = list.filter(p => p.id !== id);
  setLocalStore(LOCAL_STORE_KEYS.payroll, updated);
}

const DEFAULT_ACCOUNTING: AccountingTransaction[] = [
  {
    id: 'acc-1',
    type: 'income',
    amount: 85000,
    category: 'Catering & Events',
    description: 'Corporate Gala Banquet Payment',
    transaction_date: new Date().toISOString().split('T')[0],
    status: 'paid',
  },
  {
    id: 'acc-2',
    type: 'expense',
    amount: 14500,
    category: 'Food Supplies',
    description: 'Fresh Meat & Seafood Wholesale Delivery',
    transaction_date: new Date().toISOString().split('T')[0],
    status: 'paid',
  },
  {
    id: 'acc-3',
    type: 'bill',
    amount: 18500,
    category: 'Utility - Electricity',
    description: 'Monthly MEA Commercial Power Bill',
    transaction_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    status: 'pending',
  },
  {
    id: 'acc-4',
    type: 'bill',
    amount: 35000,
    category: 'Commercial Rent',
    description: 'Monthly Storefront Property Lease',
    transaction_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    status: 'pending',
  },
  {
    id: 'acc-5',
    type: 'loan',
    amount: 150000,
    category: 'SME Business Expansion Loan',
    description: 'Bangkok Bank Equipment Financing Loan',
    transaction_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
    loan_interest_rate: 4.75,
    status: 'pending',
  },
];

export async function dbFetchAccounting(): Promise<AccountingTransaction[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.from('accounting_transactions').select('*').order('transaction_date', { ascending: false });
    if (!error && data) {
      setLocalStore(LOCAL_STORE_KEYS.accounting, data);
      return data;
    }
  }
  return getLocalStore<AccountingTransaction[]>(LOCAL_STORE_KEYS.accounting, DEFAULT_ACCOUNTING);
}

export async function dbSaveAccounting(tx: Partial<AccountingTransaction>): Promise<AccountingTransaction> {
  const supabase = getSupabaseClient();
  const id = tx.id || `acc-${Date.now()}`;
  const fullTx: AccountingTransaction = {
    id,
    type: tx.type || 'expense',
    amount: Number(tx.amount) || 0,
    category: tx.category || 'General',
    description: tx.description || '',
    transaction_date: tx.transaction_date || new Date().toISOString().split('T')[0],
    status: tx.status || (tx.type === 'bill' || tx.type === 'loan' ? 'pending' : 'paid'),
    due_date: tx.due_date || '',
    loan_interest_rate: tx.loan_interest_rate ? Number(tx.loan_interest_rate) : 0,
  };

  if (supabase) {
    await supabase.from('accounting_transactions').upsert(fullTx);
  }

  const txs = getLocalStore<AccountingTransaction[]>(LOCAL_STORE_KEYS.accounting, []);
  const existingIdx = txs.findIndex(t => t.id === id);
  if (existingIdx >= 0) {
    txs[existingIdx] = fullTx;
  } else {
    txs.unshift(fullTx);
  }
  setLocalStore(LOCAL_STORE_KEYS.accounting, txs);
  return fullTx;
}

export async function dbFetchAuditLogs(): Promise<AuditLog[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(200);
    if (!error && data) {
      setLocalStore(LOCAL_STORE_KEYS.audit, data);
      return data;
    }
  }
  return getLocalStore<AuditLog[]>(LOCAL_STORE_KEYS.audit, []);
}

export async function dbAddAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
  const supabase = getSupabaseClient();
  const fullLog: AuditLog = {
    id: `log-${Date.now()}`,
    action: log.action,
    module: log.module,
    details: log.details,
    performed_by: log.performed_by || 'System User',
    timestamp: new Date().toISOString(),
  };

  if (supabase) {
    await supabase.from('audit_logs').insert(fullLog);
  }

  const logs = getLocalStore<AuditLog[]>(LOCAL_STORE_KEYS.audit, []);
  logs.unshift(fullLog);
  setLocalStore(LOCAL_STORE_KEYS.audit, logs);
  return fullLog;
}

export async function dbFetchSystemSettings(): Promise<SystemSettings> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.from('system_settings').select('*').limit(1).single();
    if (!error && data) {
      setLocalStore(LOCAL_STORE_KEYS.settings, data);
      return data;
    }
  }
  return getLocalStore<SystemSettings>(LOCAL_STORE_KEYS.settings, DEFAULT_SYSTEM_SETTINGS);
}

export async function dbSaveSystemSettings(settings: SystemSettings): Promise<SystemSettings> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data } = await supabase.from('system_settings').select('id').limit(1);
    const existingId = data && data[0] ? data[0].id : undefined;
    await supabase.from('system_settings').upsert({
      ...(existingId ? { id: existingId } : {}),
      restaurant_name: settings.restaurant_name,
      tax_rate: settings.tax_rate,
      currency_symbol: settings.currency_symbol,
      timezone: settings.timezone,
      receipt_header: settings.receipt_header,
      receipt_footer: settings.receipt_footer,
      promptpay_id: settings.promptpay_id,
      theme: settings.theme,
      master_pin: settings.master_pin,
      monthly_income_target: settings.monthly_income_target ?? 150000,
      monthly_expense_target: settings.monthly_expense_target ?? 50000,
    });
  }
  setLocalStore(LOCAL_STORE_KEYS.settings, settings);
  return settings;
}
