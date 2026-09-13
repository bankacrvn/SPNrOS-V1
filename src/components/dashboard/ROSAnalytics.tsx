import React from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../lib/i18n';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, BarChart, Bar, CartesianGrid 
} from 'recharts';
import { 
  DollarSign, ShoppingBag, TrendingUp, AlertTriangle, 
  Wallet, ArrowUpRight, ArrowDownRight, Package, LayoutDashboard 
} from 'lucide-react';

export const ROSAnalytics: React.FC = () => {
  const { orders, menuItems, accounting, activeShift, language } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Today's stats
  const todayOrders = orders.filter(o => o.created_at && o.created_at.startsWith(todayStr));
  const grossSalesToday = todayOrders.reduce((sum, o) => sum + o.net_amount, 0);

  const todayExpenseTx = accounting.filter(a => a.type === 'expense' && a.transaction_date === todayStr);

  const totalExpenseToday = todayExpenseTx.reduce((sum, e) => sum + e.amount, 0);
  const netPLToday = grossSalesToday - totalExpenseToday;

  const lowStockItems = menuItems.filter(m => m.stock_quantity <= m.reorder_level && m.is_active);

  // Requirement 6: Generate Real 7-day Revenue & Expense Trend dynamically from actual data (NO MOCK DATA)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartData = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = daysOfWeek[d.getDay()];

    const dayOrders = orders.filter(o => o.created_at && o.created_at.startsWith(dateStr));
    const dayRevenue = dayOrders.reduce((sum, o) => sum + o.net_amount, 0);

    const dayExpenses = accounting
      .filter(a => a.type === 'expense' && a.transaction_date === dateStr)
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      day: dayName,
      revenue: dayRevenue,
      expenses: dayExpenses,
    };
  });

  // Requirement 6: Generate Real Hourly Peak Sales Distribution dynamically from actual orders (NO MOCK DATA)
  const targetHours = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
  const hourlyData = targetHours.map(hourStr => {
    const hNum = parseInt(hourStr.split(':')[0], 10);
    const count = orders.filter(o => {
      if (!o.created_at) return false;
      const orderDate = new Date(o.created_at);
      return orderDate.getHours() === hNum;
    }).length;

    return {
      hour: hourStr,
      orders: count,
    };
  });

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-100/50 dark:bg-slate-950/50">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            {getTranslation(language, 'dashboard')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'th' ? 'ข้อมูลสรุปยอดขาย การเงิน และสถิติการดำเนินงานแบบเรียลไทม์' : 'Real-time sales performance, financial analytics & operations overview'}
          </p>
        </div>
      </div>

      {/* Real-time KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        
        {/* KPI 1: Today's Gross Sales */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {getTranslation(language, 'grossSalesToday')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ฿{grossSalesToday.toFixed(2)}
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-400">
            <span>Today live sales update</span>
          </div>
        </div>

        {/* KPI 2: Net P&L Today */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {getTranslation(language, 'netProfitToday')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-extrabold tracking-tight ${netPLToday >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
            ฿{netPLToday.toFixed(2)}
          </p>
          <div className="text-[11px] text-slate-400">
            Revenue minus operating costs
          </div>
        </div>

        {/* KPI 3: Total Orders Today */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {getTranslation(language, 'totalOrdersToday')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {todayOrders.length}
          </p>
          <div className="text-[11px] text-slate-400">
            Avg order: ฿{todayOrders.length > 0 ? (grossSalesToday / todayOrders.length).toFixed(0) : '0'}
          </div>
        </div>

        {/* KPI 4: Cash in Drawer */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {getTranslation(language, 'cashInDrawer')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ฿{activeShift ? (activeShift.start_cash + (activeShift.system_sales || 0)).toFixed(2) : '0.00'}
          </p>
          <div className="text-[11px] text-slate-400">
            {activeShift ? 'Current Shift Active' : 'No Active Shift'}
          </div>
        </div>

        {/* KPI 5: Low Stock Items */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {getTranslation(language, 'lowStockAlerts')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-500 tracking-tight">
            {lowStockItems.length}
          </p>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
            Items require reordering
          </div>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Revenue vs Expense Trend Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {getTranslation(language, 'salesTrend')}
              </h3>
              <p className="text-xs text-slate-400">Weekly revenue vs operating expenses (Real Data)</p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '16px',
                    color: '#fff',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (฿)" />
                <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" name="Expenses (฿)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Peak Hours Distribution */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {getTranslation(language, 'hourlySales')}
            </h3>
            <p className="text-xs text-slate-400">Peak dining traffic hours (Real Data)</p>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '16px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="orders" fill="#0f172a" radius={[8, 8, 0, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Orders & Low Stock Reorder List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {getTranslation(language, 'recentOrders')}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                  <th className="py-2.5 px-3">Order Ref</th>
                  <th className="py-2.5 px-3">Table</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-400">
                      {getTranslation(language, 'noData')}
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 5).map(o => (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">{o.order_number}</td>
                      <td className="py-3 px-3">{o.table_number}</td>
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">฿{o.net_amount.toFixed(2)}</td>
                      <td className="py-3 px-3 capitalize">{o.payment_method.replace('_', ' ')}</td>
                      <td className="py-3 px-3 text-slate-400">{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-4 h-4 text-amber-500" />
            <span>{getTranslation(language, 'inventoryAlerts')}</span>
          </h3>

          <div className="space-y-3">
            {lowStockItems.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">All inventory items are well-stocked.</p>
            ) : (
              lowStockItems.map(item => (
                <div key={item.id} className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {language === 'th' ? item.name_th : item.name_en}
                    </h4>
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                      Reorder Threshold: {item.reorder_level}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-white font-extrabold text-xs">
                    {item.stock_quantity} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
