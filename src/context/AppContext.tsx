import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Language, NavTab, SettingsSubTab, Category, MenuItem, CartItem, 
  Order, OrderItem, CashierShift, Employee, SalaryPayrollRecord, AccountingTransaction, 
  AuditLog, SystemSettings, ToastMessage, PaymentMethod,
  CmsSettings, DEFAULT_CMS_SETTINGS 
} from '../types';
import { 
  dbFetchCategories, dbSaveCategory, dbFetchMenuItems, dbSaveMenuItem, dbDeleteMenuItem,
  dbFetchOrders, dbCreateOrder, dbFetchShifts, dbSaveShift,
  dbFetchEmployees, dbSaveEmployee, dbDeleteEmployee, dbFetchPayroll, dbSavePayroll, dbDeletePayroll,
  dbFetchAccounting, dbSaveAccounting,
  dbFetchAuditLogs, dbAddAuditLog, dbFetchSystemSettings, dbSaveSystemSettings,
  testSupabaseConnection, resetSupabaseInstance, getSavedSupabaseCredentials
} from '../lib/supabaseClient';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  settingsSubTab: SettingsSubTab;
  setSettingsSubTab: (subTab: SettingsSubTab) => void;
  
  // Auth
  isAuthenticated: boolean;
  masterPin: string;
  loginWithPin: (pin: string) => boolean;
  lockApp: () => void;
  updateMasterPin: (newPin: string) => void;

  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;

  // Supabase Status
  supabaseConnected: boolean;
  supabaseStatusMsg: string;
  recheckSupabase: () => Promise<void>;

  // Data State
  settings: SystemSettings;
  updateSettings: (newSettings: SystemSettings) => Promise<void>;
  categories: Category[];
  menuItems: MenuItem[];
  saveCategory: (cat: Partial<Category>) => Promise<void>;
  saveMenuItem: (item: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;

  // Cart & POS
  cart: CartItem[];
  cartExpanded: boolean;
  setCartExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  addToCart: (item: MenuItem, qty?: number, notes?: string) => void;
  updateCartQuantity: (itemId: string, qty: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  orders: Order[];
  submitOrder: (tableNum: string, discountAmt: number, paymentMethod: PaymentMethod, receivedAmt: number) => Promise<Order>;

  // Shift
  activeShift: CashierShift | null;
  startShift: (startCash: number) => Promise<CashierShift>;
  endShift: (
    counts: { b1000: number; b500: number; b100: number; b50: number; b20: number; c10: number; c5: number; c1: number },
    breakdown?: { cash: number; credit_card: number; qr_promptpay: number }
  ) => Promise<CashierShift>;
  shifts: CashierShift[];

  // HR
  employees: Employee[];
  saveEmployee: (emp: Partial<Employee>) => Promise<void>;
  deleteEmployee: (empId: string) => Promise<void>;
  clockInEmployee: (empId: string) => Promise<void>;
  clockOutEmployee: (empId: string) => Promise<void>;
  payrollRecords: SalaryPayrollRecord[];
  savePayrollRecord: (rec: Partial<SalaryPayrollRecord>, postToAccounting?: boolean) => Promise<void>;
  deletePayrollRecord: (id: string) => Promise<void>;

  // Accounting
  accounting: AccountingTransaction[];
  addAccountingTx: (tx: Partial<AccountingTransaction>) => Promise<void>;
  updateAccountingTx: (tx: Partial<AccountingTransaction>) => Promise<void>;

  // Audit
  auditLogs: AuditLog[];
  logAudit: (action: string, module: AuditLog['module'], details: Record<string, unknown> | string) => Promise<void>;

  // Receipt Modal State
  activeReceiptOrder: Order | null;
  setActiveReceiptOrder: (order: Order | null) => void;

  // CMS Website Builder & Theme Customizer
  cmsSettings: CmsSettings;
  isCmsMode: boolean;
  setIsCmsMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  updateCmsSettings: (updater: Partial<CmsSettings> | ((prev: CmsSettings) => CmsSettings)) => void;
  updateCmsField: (fieldPath: string, value: any) => void;
  resetCmsSettings: () => void;
  previewModalType: string | null;
  setPreviewModalType: (type: string | null) => void;

  lastSyncedAt: Date;
  isSyncing: boolean;
  syncDatabaseNow: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => (localStorage.getItem('spn_lang') as Language) || 'en');
  const [activeTab, setActiveTab] = useState<NavTab>('pos');
  const [settingsSubTab, setSettingsSubTab] = useState<SettingsSubTab>('cms');
  
  // Auth state - saved in sessionStorage so it resets on browser close or manual lock
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => sessionStorage.getItem('spn_authenticated') === 'true');
  const [masterPin, setMasterPin] = useState<string>('260539');

  // Dark Mode
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem('spn_theme') === 'dark');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Supabase
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<string>('Checking database connection...');

  // Settings & DB entities
  const [settings, setSettings] = useState<SystemSettings>({
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
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartExpanded, setCartExpanded] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shifts, setShifts] = useState<CashierShift[]>([]);
  const [activeShift, setActiveShift] = useState<CashierShift | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<SalaryPayrollRecord[]>([]);
  const [accounting, setAccounting] = useState<AccountingTransaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);

  // CMS Website Builder & Theme Customizer State (with LocalStorage Autosave)
  const [cmsSettings, setCmsSettings] = useState<CmsSettings>(() => {
    try {
      const saved = localStorage.getItem('ros_cms_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CMS_SETTINGS,
          ...parsed,
          header: { ...DEFAULT_CMS_SETTINGS.header, ...(parsed.header || {}) },
          sidebar: { ...DEFAULT_CMS_SETTINGS.sidebar, ...(parsed.sidebar || {}) },
          theme: { ...DEFAULT_CMS_SETTINGS.theme, ...(parsed.theme || {}) },
          modals: {
            ...DEFAULT_CMS_SETTINGS.modals,
            ...(parsed.modals || {}),
            pinAuth: { ...DEFAULT_CMS_SETTINGS.modals.pinAuth, ...(parsed.modals?.pinAuth || {}) },
            receipt: { ...DEFAULT_CMS_SETTINGS.modals.receipt, ...(parsed.modals?.receipt || {}) },
            quickOrder: { ...DEFAULT_CMS_SETTINGS.modals.quickOrder, ...(parsed.modals?.quickOrder || {}) },
            shiftManagement: { ...DEFAULT_CMS_SETTINGS.modals.shiftManagement, ...(parsed.modals?.shiftManagement || {}) },
            confirmation: { ...DEFAULT_CMS_SETTINGS.modals.confirmation, ...(parsed.modals?.confirmation || {}) },
          },
        };
      }
    } catch (e) {
      console.error('Failed to parse saved cmsSettings:', e);
    }
    return DEFAULT_CMS_SETTINGS;
  });

  const [isCmsMode, setIsCmsModeState] = useState<boolean>(() => {
    return localStorage.getItem('ros_is_cms_mode') === 'true';
  });

  const [previewModalType, setPreviewModalType] = useState<string | null>(null);

  const setIsCmsMode = (val: boolean | ((prev: boolean) => boolean)) => {
    setIsCmsModeState(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('ros_is_cms_mode', String(next));
      return next;
    });
  };

  const updateCmsSettings = (updater: Partial<CmsSettings> | ((prev: CmsSettings) => CmsSettings)) => {
    setCmsSettings(prev => {
      const updated = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      try {
        localStorage.setItem('ros_cms_settings', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to persist cms settings:', err);
      }
      return updated;
    });
  };

  const updateCmsField = (fieldPath: string, value: any) => {
    setCmsSettings(prev => {
      const clone = JSON.parse(JSON.stringify(prev));
      const parts = fieldPath.split('.');
      let target = clone;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!target[parts[i]]) target[parts[i]] = {};
        target = target[parts[i]];
      }
      target[parts[parts.length - 1]] = value;
      try {
        localStorage.setItem('ros_cms_settings', JSON.stringify(clone));
      } catch (err) {
        console.error('Failed to persist cms field update:', err);
      }
      return clone;
    });
  };

  const resetCmsSettings = () => {
    setCmsSettings(DEFAULT_CMS_SETTINGS);
    try {
      localStorage.setItem('ros_cms_settings', JSON.stringify(DEFAULT_CMS_SETTINGS));
    } catch (err) {
      console.error('Failed to reset cms settings:', err);
    }
  };

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('spn_lang', lang);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('spn_theme', next ? 'dark' : 'light');
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const loginWithPin = (pin: string): boolean => {
    if (pin === masterPin || pin === settings.master_pin) {
      setIsAuthenticated(true);
      sessionStorage.setItem('spn_authenticated', 'true');
      addToast('success', language === 'th' ? 'เข้าสู่ระบบสำเร็จ' : 'Unlocked successfully');
      logAudit('LOGIN', 'Auth', { pin_used: '******' });
      return true;
    }
    addToast('error', language === 'th' ? 'รหัส PIN ไม่ถูกต้อง' : 'Incorrect Master PIN');
    return false;
  };

  const lockApp = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('spn_authenticated');
    addToast('info', language === 'th' ? 'ล็อคหน้าจอระบบแล้ว' : 'System locked');
  };

  const updateMasterPin = (newPin: string) => {
    setMasterPin(newPin);
    setSettings(prev => ({ ...prev, master_pin: newPin }));
    dbSaveSystemSettings({ ...settings, master_pin: newPin });
    addToast('success', language === 'th' ? 'เปลี่ยนรหัส PIN สำเร็จ' : 'Master PIN updated');
    logAudit('CHANGE_PIN', 'Settings', { pin_length: newPin.length });
  };

  const recheckSupabase = async () => {
    resetSupabaseInstance();
    const res = await testSupabaseConnection();
    setSupabaseConnected(res.success);
    setSupabaseStatusMsg(res.message);
  };

  const logAudit = useCallback(async (action: string, module: AuditLog['module'], details: Record<string, unknown> | string) => {
    const newLog = await dbAddAuditLog({ action, module, details, performed_by: 'Cashier / Admin' });
    setAuditLogs(prev => [newLog, ...prev]);
  }, []);

  // Sync State & Auto Refresh
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const refreshData = useCallback(async () => {
    try {
      const [fetchedSettings, fetchedCats, fetchedItems, fetchedOrders, fetchedShifts, fetchedEmps, fetchedPayroll, fetchedAcc, fetchedAudit] = await Promise.all([
        dbFetchSystemSettings(),
        dbFetchCategories(),
        dbFetchMenuItems(),
        dbFetchOrders(),
        dbFetchShifts(),
        dbFetchEmployees(),
        dbFetchPayroll(),
        dbFetchAccounting(),
        dbFetchAuditLogs(),
      ]);

      if (fetchedSettings) {
        setSettings(fetchedSettings);
        if (fetchedSettings.master_pin) {
          setMasterPin(fetchedSettings.master_pin);
        }
      }
      setCategories(fetchedCats);
      setMenuItems(fetchedItems);
      setOrders(fetchedOrders);
      setShifts(fetchedShifts);
      
      const openShift = fetchedShifts.find(s => s.status === 'open') || null;
      setActiveShift(openShift);

      setEmployees(fetchedEmps);
      setPayrollRecords(fetchedPayroll);

      // Auto-record any completed order into accounting if missing
      const existingPosDescs = new Set(fetchedAcc.filter(a => a.category === 'POS Sales').map(a => a.description));
      for (const o of fetchedOrders) {
        if (o.status === 'completed') {
          const descKey = `Order ${o.order_number} (${o.table_number})`;
          if (!existingPosDescs.has(descKey)) {
            const newTx = await dbSaveAccounting({
              type: 'income',
              amount: o.net_amount,
              category: 'POS Sales',
              description: descKey,
              transaction_date: o.created_at ? o.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
              status: 'paid',
            });
            fetchedAcc.unshift(newTx);
            existingPosDescs.add(descKey);
          }
        }
      }

      setAccounting(fetchedAcc);
      setAuditLogs(fetchedAudit);
      setLastSyncedAt(new Date());
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  }, []);

  // Manual Synchronize Database
  const syncDatabaseNow = async () => {
    setIsSyncing(true);
    await recheckSupabase();
    await refreshData();
    setIsSyncing(false);
    addToast('success', language === 'th' ? 'ซิงค์ข้อมูลกับฐานข้อมูลเรียบร้อยแล้ว' : 'Database synchronized successfully!');
    logAudit('SYNC_DATABASE', 'Settings', { timestamp: new Date().toISOString() });
  };

  useEffect(() => {
    recheckSupabase();
    refreshData();

    // 3-minute automatic database update & refresh interval
    const interval = setInterval(() => {
      refreshData();
    }, 180000); // 180,000 ms = 3 minutes

    return () => clearInterval(interval);
  }, [refreshData]);

  const updateSettings = async (newSettings: SystemSettings) => {
    setSettings(newSettings);
    if (newSettings.master_pin) setMasterPin(newSettings.master_pin);
    await dbSaveSystemSettings(newSettings);
    addToast('success', language === 'th' ? 'บันทึกการตั้งค่าเรียบร้อย' : 'Settings updated');
    logAudit('UPDATE_SETTINGS', 'Settings', { restaurant_name: newSettings.restaurant_name });
  };

  const saveCategory = async (cat: Partial<Category>) => {
    const saved = await dbSaveCategory(cat);
    setCategories(prev => {
      const idx = prev.findIndex(c => c.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    addToast('success', language === 'th' ? 'บันทึกหมวดหมู่เรียบร้อย' : 'Category saved');
    logAudit('SAVE_CATEGORY', 'Settings', { category: saved.name_en });
  };

  const saveMenuItem = async (item: Partial<MenuItem>) => {
    const saved = await dbSaveMenuItem(item);
    setMenuItems(prev => {
      const idx = prev.findIndex(m => m.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    addToast('success', language === 'th' ? 'บันทึกรายการเมนูเรียบร้อย' : 'Menu item saved');
    logAudit('SAVE_MENU_ITEM', 'Inventory', { item: saved.name_en, price: saved.price });
  };

  const deleteMenuItem = async (id: string) => {
    await dbDeleteMenuItem(id);
    setMenuItems(prev => prev.filter(m => m.id !== id));
    addToast('info', language === 'th' ? 'ลบรายการเมนูแล้ว' : 'Menu item deleted');
    logAudit('DELETE_MENU_ITEM', 'Inventory', { id });
  };

  // Cart operations
  const addToCart = (item: MenuItem, qty = 1, notes = '') => {
    setCartExpanded(true);
    if (item.stock_quantity <= 0) {
      addToast('error', language === 'th' ? 'สินค้าหมดสต็อก' : 'Item is out of stock');
      return;
    }

    setCart(prev => {
      const existingIdx = prev.findIndex(c => c.menuItem.id === item.id && c.notes === notes);
      if (existingIdx >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + qty;
        if (newQty > item.stock_quantity) {
          addToast('warning', language === 'th' ? 'จำนวนที่สั่งเกินคลังสินค้าคงเหลือ' : 'Quantity exceeds available stock');
          return prev;
        }
        updated[existingIdx].quantity = newQty;
        return updated;
      } else {
        return [...prev, { menuItem: item, quantity: qty, notes }];
      }
    });
    addToast('success', `${language === 'th' ? 'เพิ่ม' : 'Added'} ${language === 'th' ? item.name_th : item.name_en} ${language === 'th' ? 'ลงตะกร้า' : 'to order'}`);
  };

  const updateCartQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.menuItem.id === itemId) {
        if (qty > item.menuItem.stock_quantity) {
          addToast('warning', language === 'th' ? 'จำนวนเกินสต็อกสินค้า' : 'Quantity exceeds stock');
          return item;
        }
        return { ...item, quantity: qty };
      }
      return item;
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.menuItem.id !== itemId));
  };

  const clearCart = () => setCart([]);

  // Submit Order
  const submitOrder = async (
    tableNum: string, 
    discountAmt: number, 
    paymentMethod: PaymentMethod, 
    receivedAmt: number
  ): Promise<Order> => {
    if (cart.length === 0) {
      throw new Error('Cart is empty');
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
    const taxRate = settings.tax_rate ?? 0;
    const discountedSubtotal = Math.max(0, subtotal - discountAmt);
    const taxAmount = (discountedSubtotal * taxRate) / 100;
    const netAmount = discountedSubtotal + taxAmount;
    const changeGiven = paymentMethod === 'cash' ? Math.max(0, receivedAmt - netAmount) : 0;

    const orderNum = `ORD-${Date.now().toString().slice(-6)}`;
    const orderId = `ord-${Date.now()}`;

    const orderItems: OrderItem[] = cart.map(c => ({
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      order_id: orderId,
      menu_item_id: c.menuItem.id,
      quantity: c.quantity,
      unit_price: c.menuItem.price,
      total_price: c.menuItem.price * c.quantity,
      menu_item_name_en: c.menuItem.name_en,
      menu_item_name_th: c.menuItem.name_th,
    }));

    const newOrder: Order = {
      id: orderId,
      order_number: orderNum,
      table_number: tableNum || 'Takeaway',
      total_amount: subtotal,
      discount_amount: discountAmt,
      tax_amount: taxAmount,
      net_amount: netAmount,
      payment_method: paymentMethod,
      amount_received: receivedAmt,
      change_given: changeGiven,
      status: 'completed',
      created_at: new Date().toISOString(),
      order_items: orderItems,
    };

    const created = await dbCreateOrder(newOrder, orderItems);
    
    // Update menu items in local state
    setMenuItems(prev => prev.map(m => {
      const bought = cart.find(c => c.menuItem.id === m.id);
      if (bought) {
        return { ...m, stock_quantity: Math.max(0, m.stock_quantity - bought.quantity) };
      }
      return m;
    }));

    setOrders(prev => [created, ...prev]);
    setCart([]);
    setActiveReceiptOrder(created);

    // Update active shift sales if open
    if (activeShift) {
      const updatedShift: CashierShift = {
        ...activeShift,
        system_sales: (activeShift.system_sales || 0) + netAmount,
      };
      setActiveShift(updatedShift);
      dbSaveShift(updatedShift);
    }

    // Record income transaction in accounting
    const newAccTx = await dbSaveAccounting({
      type: 'income',
      amount: netAmount,
      category: 'POS Sales',
      description: `Order ${orderNum} (${tableNum || 'Takeaway'})`,
      transaction_date: new Date().toISOString().split('T')[0],
      status: 'paid',
    });
    setAccounting(prev => [newAccTx, ...prev]);

    addToast('success', `${language === 'th' ? 'ทำรายการสั่งซื้อสำเร็จ!' : 'Order'} ${orderNum} ${language === 'th' ? 'สำเร็จ' : 'completed!'}`);
    logAudit('CREATE_ORDER', 'POS', { order_number: orderNum, net_amount: netAmount, payment_method: paymentMethod });

    return created;
  };

  // Shift logic
  const startShift = async (startCash: number): Promise<CashierShift> => {
    const shift: CashierShift = {
      id: `shift-${Date.now()}`,
      start_cash: startCash,
      cash_1000: 0,
      cash_500: 0,
      cash_100: 0,
      cash_50: 0,
      cash_20: 0,
      cash_10: 0,
      cash_5: 0,
      cash_1: 0,
      system_sales: 0,
      total_cash_sales: 0,
      total_credit_card: 0,
      total_qr_payment: 0,
      status: 'open',
      opened_at: new Date().toISOString(),
      cashier_name: 'Main Cashier',
    };

    const saved = await dbSaveShift(shift);
    setActiveShift(saved);
    setShifts(prev => [saved, ...prev]);
    addToast('success', language === 'th' ? 'เปิดกะใหม่เรียบร้อยแล้ว' : 'New shift started successfully');
    logAudit('START_SHIFT', 'Shift', { start_cash: startCash });
    return saved;
  };

  const endShift = async (
    counts: { b1000: number; b500: number; b100: number; b50: number; b20: number; c10: number; c5: number; c1: number },
    breakdown?: { cash: number; credit_card: number; qr_promptpay: number }
  ): Promise<CashierShift> => {
    if (!activeShift) throw new Error('No active shift');

    const totalCounted = 
      (counts.b1000 * 1000) + 
      (counts.b500 * 500) + 
      (counts.b100 * 100) + 
      (counts.b50 * 50) + 
      (counts.b20 * 20) + 
      (counts.c10 * 10) + 
      (counts.c5 * 5) + 
      (counts.c1 * 1);

    const cashSales = breakdown ? breakdown.cash : (activeShift.total_cash_sales || activeShift.system_sales || 0);
    const expectedCash = activeShift.start_cash + cashSales;
    const variance = totalCounted - expectedCash;

    const totalSales = breakdown ? (breakdown.cash + breakdown.credit_card + breakdown.qr_promptpay) : (activeShift.system_sales || 0);

    const closedShift: CashierShift = {
      ...activeShift,
      cash_1000: counts.b1000,
      cash_500: counts.b500,
      cash_100: counts.b100,
      cash_50: counts.b50,
      cash_20: counts.b20,
      cash_10: counts.c10,
      cash_5: counts.c5,
      cash_1: counts.c1,
      total_drawer_cash: totalCounted,
      end_cash: totalCounted,
      system_sales: totalSales,
      total_cash_sales: breakdown?.cash ?? cashSales,
      total_credit_card: breakdown?.credit_card ?? 0,
      total_qr_payment: breakdown?.qr_promptpay ?? 0,
      variance,
      status: 'closed',
      closed_at: new Date().toISOString(),
    };

    const saved = await dbSaveShift(closedShift);
    setActiveShift(null);
    setShifts(prev => prev.map(s => s.id === saved.id ? saved : s));
    addToast('success', language === 'th' ? 'ปิดกะและคำนวณยอดเรียบร้อยแล้ว' : 'Shift closed and recorded');
    logAudit('END_SHIFT', 'Shift', { total_drawer_cash: totalCounted, total_credit_card: closedShift.total_credit_card, total_qr_payment: closedShift.total_qr_payment, variance });
    return saved;
  };

  // HR
  const saveEmployee = async (emp: Partial<Employee>) => {
    const saved = await dbSaveEmployee(emp);
    setEmployees(prev => {
      const idx = prev.findIndex(e => e.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    addToast('success', language === 'th' ? 'บันทึกข้อมูลพนักงานสำเร็จ' : 'Employee details updated');
    logAudit('SAVE_EMPLOYEE', 'HR', { employee: saved.name });
  };

  const deleteEmployee = async (empId: string) => {
    await dbDeleteEmployee(empId);
    setEmployees(prev => prev.filter(e => e.id !== empId));
    addToast('info', language === 'th' ? 'ลบข้อมูลพนักงานเรียบร้อยแล้ว' : 'Staff member removed');
    logAudit('DELETE_EMPLOYEE', 'HR', { employee_id: empId });
  };

  const clockInEmployee = async (empId: string) => {
    const now = new Date().toISOString();
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      const updated = { ...emp, clock_in: now, clock_out: undefined };
      await dbSaveEmployee(updated);
      setEmployees(prev => prev.map(e => e.id === empId ? updated : e));
      addToast('success', `${emp.name} ${language === 'th' ? 'ลงเวลาเข้างานเรียบร้อย' : 'Clocked in successfully'}`);
      logAudit('CLOCK_IN', 'HR', { employee_id: empId, name: emp.name });
    }
  };

  const clockOutEmployee = async (empId: string) => {
    const now = new Date().toISOString();
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      const updated = { ...emp, clock_out: now };
      await dbSaveEmployee(updated);
      setEmployees(prev => prev.map(e => e.id === empId ? updated : e));
      addToast('success', `${emp.name} ${language === 'th' ? 'ลงเวลาออกงานเรียบร้อย' : 'Clocked out successfully'}`);
      logAudit('CLOCK_OUT', 'HR', { employee_id: empId, name: emp.name });
    }
  };

  const savePayrollRecord = async (rec: Partial<SalaryPayrollRecord>, postToAccounting: boolean = false) => {
    const saved = await dbSavePayroll(rec);
    setPayrollRecords(prev => {
      const idx = prev.findIndex(p => p.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });

    if (postToAccounting && saved.payment_status === 'paid') {
      await addAccountingTx({
        type: 'expense',
        amount: saved.net_salary,
        category: 'Payroll & Salaries',
        description: `Payroll: ${saved.employee_name} (${saved.pay_period})`,
        transaction_date: saved.paid_at ? saved.paid_at.split('T')[0] : new Date().toISOString().split('T')[0],
        status: 'paid',
      });
    }

    addToast('success', language === 'th' ? 'บันทึกรายการเงินเดือนสำเร็จ' : 'Salary payroll record saved');
    logAudit('SAVE_PAYROLL', 'HR', { employee: saved.employee_name, net_salary: saved.net_salary, status: saved.payment_status });
  };

  const deletePayrollRecord = async (id: string) => {
    await dbDeletePayroll(id);
    setPayrollRecords(prev => prev.filter(p => p.id !== id));
    addToast('info', language === 'th' ? 'ลบรายการสลิปเงินเดือนเรียบร้อย' : 'Payroll record deleted');
    logAudit('DELETE_PAYROLL', 'HR', { payroll_id: id });
  };

  // Accounting
  const addAccountingTx = async (tx: Partial<AccountingTransaction>) => {
    const saved = await dbSaveAccounting(tx);
    setAccounting(prev => [saved, ...prev]);
    addToast('success', language === 'th' ? 'บันทึกรายการบัญชีสำเร็จ' : 'Transaction recorded');
    logAudit('ADD_ACCOUNTING', 'Accounting', { type: saved.type, amount: saved.amount, category: saved.category });
  };

  const updateAccountingTx = async (tx: Partial<AccountingTransaction>) => {
    const saved = await dbSaveAccounting(tx);
    setAccounting(prev => prev.map(a => a.id === saved.id ? saved : a));
    addToast('success', language === 'th' ? 'อัปเดตสถานะบัญชีสำเร็จ' : 'Accounting status updated');
    logAudit('UPDATE_ACCOUNTING', 'Accounting', { id: saved.id, status: saved.status, type: saved.type });
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        activeTab,
        setActiveTab,
        settingsSubTab,
        setSettingsSubTab,
        isAuthenticated,
        masterPin,
        loginWithPin,
        lockApp,
        updateMasterPin,
        darkMode,
        toggleDarkMode,
        toasts,
        addToast,
        removeToast,
        supabaseConnected,
        supabaseStatusMsg,
        recheckSupabase,
        settings,
        updateSettings,
        categories,
        menuItems,
        saveCategory,
        saveMenuItem,
        deleteMenuItem,
        cart,
        cartExpanded,
        setCartExpanded,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        orders,
        submitOrder,
        activeShift,
        startShift,
        endShift,
        shifts,
        employees,
        saveEmployee,
        deleteEmployee,
        clockInEmployee,
        clockOutEmployee,
        payrollRecords,
        savePayrollRecord,
        deletePayrollRecord,
        accounting,
        addAccountingTx,
        updateAccountingTx,
        auditLogs,
        logAudit,
        activeReceiptOrder,
        setActiveReceiptOrder,
        cmsSettings,
        isCmsMode,
        setIsCmsMode,
        updateCmsSettings,
        updateCmsField,
        resetCmsSettings,
        previewModalType,
        setPreviewModalType,
        lastSyncedAt,
        isSyncing,
        syncDatabaseNow,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
