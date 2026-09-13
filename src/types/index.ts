export type Language = 'en' | 'th';

export type NavTab = 
  | 'pos' 
  | 'shift' 
  | 'dashboard' 
  | 'inventory' 
  | 'hr' 
  | 'accounting' 
  | 'audit' 
  | 'settings';

export type SettingsSubTab = 'cms' | 'systems' | 'pin' | 'servers';

export interface Category {
  id: string;
  name_en: string;
  name_th: string;
  is_active: boolean;
  created_at?: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name_en: string;
  name_th: string;
  price: number;
  cost: number;
  image_url: string;
  stock_quantity: number;
  reorder_level: number;
  is_active: boolean;
  created_at?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export type PaymentMethod = 'cash' | 'credit_card' | 'qr_promptpay';
export type OrderStatus = 'completed' | 'cancelled' | 'pending';

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  menu_item_name_en?: string;
  menu_item_name_th?: string;
}

export interface Order {
  id: string;
  order_number: string;
  table_number: string;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  net_amount: number;
  payment_method: PaymentMethod;
  amount_received?: number;
  change_given?: number;
  status: OrderStatus;
  created_at: string;
  order_items?: OrderItem[];
}

export interface CashierShift {
  id: string;
  start_cash: number;
  end_cash?: number;
  cash_1000: number;
  cash_500: number;
  cash_100: number;
  cash_50: number;
  cash_20: number;
  cash_10: number;
  cash_5: number;
  cash_1: number;
  total_drawer_cash?: number;
  system_sales?: number;
  total_cash_sales?: number;
  total_credit_card?: number;
  total_qr_payment?: number;
  variance?: number;
  status: 'open' | 'closed';
  opened_at: string;
  closed_at?: string;
  cashier_name?: string;
}

export interface Employee {
  id: string;
  name: string;
  nickname?: string;
  position: string;
  department?: string;
  salary: number; // Base monthly salary
  hourly_rate?: number;
  phone?: string;
  email?: string;
  national_id?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  bank_name?: string;
  bank_account?: string;
  promptpay_id?: string;
  hire_date?: string;
  notes?: string;
  clock_in?: string;
  clock_out?: string;
  status: 'active' | 'on_leave' | 'terminated';
  created_at?: string;
}

export interface SalaryPayrollRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  position: string;
  department?: string;
  pay_period: string; // e.g. "September 2026" or "2026-09"
  base_salary: number;
  overtime_hours: number;
  overtime_rate: number;
  overtime_pay: number;
  allowances: number;
  bonus: number;
  gross_pay: number;
  tax_deduction: number;
  social_security: number;
  other_deductions: number;
  total_deductions: number;
  net_salary: number;
  payment_method: 'bank_transfer' | 'promptpay' | 'cash';
  payment_status: 'draft' | 'approved' | 'paid';
  bank_name?: string;
  bank_account?: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
}

export interface AccountingTransaction {
  id: string;
  type: 'income' | 'expense' | 'bill' | 'loan';
  amount: number;
  category: string;
  description: string;
  transaction_date: string;
  status?: 'pending' | 'paid';
  due_date?: string;
  loan_interest_rate?: number;
  created_at?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  module: 'POS' | 'Shift' | 'Inventory' | 'HR' | 'Accounting' | 'Settings' | 'Auth';
  details: string | Record<string, unknown>;
  performed_by: string;
  timestamp: string;
}

export interface SystemSettings {
  id?: string;
  restaurant_name: string;
  tax_rate: number; // e.g. 0 for 0% VAT
  currency_symbol: string;
  timezone: string;
  receipt_header: string;
  receipt_footer: string;
  promptpay_id: string;
  theme: 'light' | 'dark';
  master_pin: string;
  monthly_income_target?: number;
  monthly_expense_target?: number;
  supabase_url?: string;
  supabase_anon_key?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

// ==========================================
// CMS WEBSITE BUILDER & THEME CUSTOMIZER TYPES
// ==========================================

export interface CmsHeaderConfig {
  title: string;
  subtitle: string;
  alignment: 'left' | 'center';
  isSticky: boolean;
  logoUrl?: string;
  logoType?: 'default' | 'image';
}

export interface CmsSidebarConfig {
  position: 'left' | 'right';
  width: 'narrow' | 'default' | 'wide';
  collapseOnMobile: boolean;
}

export type CmsPrimaryColor = 'indigo' | 'emerald' | 'rose' | 'amber';
export type CmsBorderRadius = 'none' | 'md' | 'xl' | 'full';

export interface CmsThemeConfig {
  primaryColor: CmsPrimaryColor;
  borderRadius: CmsBorderRadius;
}

export interface CmsModalItemConfig {
  enabled: boolean;
  title: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
}

export interface CmsModalsConfig {
  pinAuth: CmsModalItemConfig;
  receipt: CmsModalItemConfig;
  quickOrder: CmsModalItemConfig;
  shiftManagement: CmsModalItemConfig;
  confirmation: CmsModalItemConfig;
}

export interface CmsSettings {
  header: CmsHeaderConfig;
  sidebar: CmsSidebarConfig;
  theme: CmsThemeConfig;
  modals: CmsModalsConfig;
}

export const DEFAULT_CMS_SETTINGS: CmsSettings = {
  header: {
    title: 'rOS Enterprise',
    subtitle: 'Smart Restaurant POS & ERP',
    alignment: 'left',
    isSticky: true,
    logoUrl: '',
    logoType: 'default',
  },
  sidebar: {
    position: 'left',
    width: 'default',
    collapseOnMobile: true,
  },
  theme: {
    primaryColor: 'indigo',
    borderRadius: 'xl',
  },
  modals: {
    pinAuth: {
      enabled: true,
      title: 'Security PIN Authentication',
      subtitle: 'Authorized Personnel Only',
      description: 'Enter your 6-digit master administrative security PIN to unlock this workstation.',
      buttonText: 'Unlock System',
    },
    receipt: {
      enabled: true,
      title: 'Tax Invoice & Receipt',
      subtitle: 'Official Customer Voucher',
      description: 'Review finalized transaction details, generate thermal vouchers, or print customer tax invoices.',
      buttonText: 'Print Receipt',
    },
    quickOrder: {
      enabled: true,
      title: 'Quick Order Creator',
      subtitle: 'Rapid Checkout Terminal',
      description: 'Speed-create direct dine-in or takeaway customer tickets with preset discounts and items.',
      buttonText: 'Submit Order',
    },
    shiftManagement: {
      enabled: true,
      title: 'Cashier Shift Drawer Reconciliation',
      subtitle: 'Cash Float & End-of-Day Audit',
      description: 'Audit cash float denominations and verify recorded credit card, PromptPay QR, and cash sales.',
      buttonText: 'Finalize Shift',
    },
    confirmation: {
      enabled: true,
      title: 'Administrative Confirmation',
      subtitle: 'Important Action Required',
      description: 'Are you sure you want to execute this administrative operation? This action will be logged in the audit trail.',
      buttonText: 'Confirm & Proceed',
    },
  },
};
