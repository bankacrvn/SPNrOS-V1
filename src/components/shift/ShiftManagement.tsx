import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../lib/i18n';
import { 
  Store, Banknote, Clock, ArrowUpRight, 
  CheckCircle2, X, AlertTriangle, ShieldCheck, 
  CreditCard, QrCode, Wallet 
} from 'lucide-react';

export const ShiftManagement: React.FC = () => {
  const { activeShift, startShift, endShift, shifts, orders, language } = useApp();

  const [showStartModal, setShowStartModal] = useState(false);
  const [openingCashInput, setOpeningCashInput] = useState('2000');

  const [showEndModal, setShowEndModal] = useState(false);
  const [counts, setCounts] = useState({
    b1000: 0,
    b500: 0,
    b100: 0,
    b50: 0,
    b20: 0,
    c10: 0,
    c5: 0,
    c1: 0,
  });

  // Calculate sales breakdown by payment method for the active shift
  const shiftOrders = activeShift ? orders.filter(o => 
    o.status === 'completed' && new Date(o.created_at) >= new Date(activeShift.opened_at)
  ) : [];

  const shiftCashSales = shiftOrders
    .filter(o => o.payment_method === 'cash')
    .reduce((sum, o) => sum + o.net_amount, 0);

  const shiftCardSales = shiftOrders
    .filter(o => o.payment_method === 'credit_card')
    .reduce((sum, o) => sum + o.net_amount, 0);

  const shiftQRSales = shiftOrders
    .filter(o => o.payment_method === 'qr_promptpay' || (o.payment_method as string) === 'promptpay')
    .reduce((sum, o) => sum + o.net_amount, 0);

  const totalShiftSales = shiftCashSales + shiftCardSales + shiftQRSales;
  const totalShiftCash = activeShift ? activeShift.start_cash + shiftCashSales : 0;
  const activeExpectedCash = totalShiftCash;

  const handleStartShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await startShift(Number(openingCashInput) || 0);
    setShowStartModal(false);
  };

  const handleEndShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await endShift(counts, {
      cash: shiftCashSales,
      credit_card: shiftCardSales,
      qr_promptpay: shiftQRSales,
    });
    setShowEndModal(false);
  };

  const calculatedTotalCounted = 
    (counts.b1000 * 1000) + 
    (counts.b500 * 500) + 
    (counts.b100 * 100) + 
    (counts.b50 * 50) + 
    (counts.b20 * 20) + 
    (counts.c10 * 10) + 
    (counts.c5 * 5) + 
    (counts.c1 * 1);

  const currentVariance = calculatedTotalCounted - activeExpectedCash;

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-100/50 dark:bg-slate-950/50">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {getTranslation(language, 'shiftTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {activeShift ? `Active Shift ID: ${activeShift.id}` : getTranslation(language, 'noActiveShift')}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {activeShift ? (
          <button
            onClick={() => setShowEndModal(true)}
            className="px-5 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            <span>{getTranslation(language, 'endShift')}</span>
          </button>
        ) : (
          <button
            onClick={() => setShowStartModal(true)}
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            <Store className="w-4 h-4" />
            <span>{getTranslation(language, 'startShift')}</span>
          </button>
        )}
      </div>

      {/* Active Shift Dashboard Cards */}
      {activeShift ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Card 1: Total Cash */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Total Cash</span>
              <Wallet className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ฿{totalShiftCash.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400">
              Opening (฿{activeShift.start_cash.toFixed(2)}) + Sales (฿{shiftCashSales.toFixed(2)})
            </p>
          </div>

          {/* Card 2: Total Credit Card */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Total Credit Card</span>
              <CreditCard className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              ฿{shiftCardSales.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400">Credit card payments in active shift</p>
          </div>

          {/* Card 3: Total QR Payment */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Total QR Payment</span>
              <QrCode className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              ฿{shiftQRSales.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400">PromptPay / QR code sales in active shift</p>
          </div>

          {/* Card 4: Total Shift Sales */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>{getTranslation(language, 'salesInShift')}</span>
              <ArrowUpRight className="w-4 h-4 text-sky-500" />
            </div>
            <p className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">
              ฿{totalShiftSales.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400">{shiftOrders.length} orders in active shift</p>
          </div>

          {/* Card 5: Opening Cash */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>{getTranslation(language, 'openingCash')}</span>
              <Banknote className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
              ฿{activeShift.start_cash.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400">
              Started: {new Date(activeShift.opened_at).toLocaleTimeString()}
            </p>
          </div>

          {/* Card 6: Expected Cash Drawer */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>{getTranslation(language, 'currentExpectedCash')}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              ฿{activeExpectedCash.toFixed(2)}
            </p>
            <p className="text-[11px] text-slate-400">Opening Cash + Cash Sales</p>
          </div>

        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center gap-4">
          <AlertTriangle className="w-8 h-8 shrink-0" />
          <div>
            <h3 className="font-bold text-sm">{getTranslation(language, 'noActiveShift')}</h3>
            <p className="text-xs mt-0.5 opacity-80">
              Click the "{getTranslation(language, 'startShift')}" button above to enter drawer cash and begin taking orders.
            </p>
          </div>
        </div>
      )}

      {/* Shift Audit History Table */}
      <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          {getTranslation(language, 'shiftHistory')}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                <th className="py-3 px-3">Shift ID</th>
                <th className="py-3 px-3">Opened At</th>
                <th className="py-3 px-3">Closed At</th>
                <th className="py-3 px-3">Opening Cash</th>
                <th className="py-3 px-3">Cash Sales</th>
                <th className="py-3 px-3">Credit Card</th>
                <th className="py-3 px-3">QR Payment</th>
                <th className="py-3 px-3">Total Sales</th>
                <th className="py-3 px-3">Counted Cash</th>
                <th className="py-3 px-3">Variance</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
              {shifts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-6 text-slate-400">
                    {getTranslation(language, 'noData')}
                  </td>
                </tr>
              ) : (
                shifts.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">{s.id.slice(-8)}</td>
                    <td className="py-3 px-3">{new Date(s.opened_at).toLocaleString()}</td>
                    <td className="py-3 px-3">{s.closed_at ? new Date(s.closed_at).toLocaleString() : '-'}</td>
                    <td className="py-3 px-3">฿{s.start_cash.toFixed(2)}</td>
                    <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      ฿{(s.total_cash_sales ?? 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 font-bold text-indigo-600 dark:text-indigo-400">
                      ฿{(s.total_credit_card ?? 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 font-bold text-amber-600 dark:text-amber-400">
                      ฿{(s.total_qr_payment ?? 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 font-bold text-sky-600 dark:text-sky-400">
                      ฿{(s.system_sales ?? 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      ฿{(s.total_drawer_cash || s.start_cash).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 font-bold">
                      {(s.variance || 0) === 0 ? (
                        <span className="text-emerald-500">฿0.00</span>
                      ) : (s.variance || 0) > 0 ? (
                        <span className="text-sky-500">+฿{(s.variance || 0).toFixed(2)}</span>
                      ) : (
                        <span className="text-rose-500">฿{(s.variance || 0).toFixed(2)}</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                        s.status === 'open' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Start Shift Modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <form onSubmit={handleStartShiftSubmit} className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {getTranslation(language, 'startShift')}
              </h3>
              <button type="button" onClick={() => setShowStartModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {getTranslation(language, 'openingCash')} (฿)
              </label>
              <input
                type="number"
                value={openingCashInput}
                onChange={e => setOpeningCashInput(e.target.value)}
                placeholder="2000"
                required
                className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-lg focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all"
            >
              Confirm Opening Shift
            </button>
          </form>
        </div>
      )}

      {/* End Shift & Drawer Count Breakdown Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <form onSubmit={handleEndShiftSubmit} className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {getTranslation(language, 'endShift')}
              </h3>
              <button type="button" onClick={() => setShowEndModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Shift Payment Method Breakdown Summary Before Closing */}
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Active Shift Sales Breakdown</span>
                <span className="text-[10px] font-normal text-slate-400">Auto-recorded</span>
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-medium block">Cash</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">฿{shiftCashSales.toFixed(2)}</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-medium block">Credit Card</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">฿{shiftCardSales.toFixed(2)}</span>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-medium block">QR Payment</span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400">฿{shiftQRSales.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              {getTranslation(language, 'cashDenominations')}
            </p>

            {/* Bill & Coin Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'bill1000', key: 'b1000', val: 1000 },
                { label: 'bill500', key: 'b500', val: 500 },
                { label: 'bill100', key: 'b100', val: 100 },
                { label: 'bill50', key: 'b50', val: 50 },
                { label: 'bill20', key: 'b20', val: 20 },
                { label: 'coin10', key: 'c10', val: 10 },
                { label: 'coin5', key: 'c5', val: 5 },
                { label: 'coin1', key: 'c1', val: 1 },
              ].map(item => (
                <div key={item.key} className="p-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    {getTranslation(language, item.label as Parameters<typeof getTranslation>[1])}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={(counts as any)[item.key]}
                    onChange={e => setCounts(prev => ({ ...prev, [item.key]: Number(e.target.value) || 0 }))}
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold text-sm focus:outline-none"
                  />
                  <div className="text-[10px] text-right font-semibold text-slate-400">
                    = ฿{((counts as any)[item.key] * item.val).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Calculation Summary */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400">{getTranslation(language, 'totalCounted')}:</span>
                <span className="text-sm font-bold text-emerald-400">฿{calculatedTotalCounted.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{getTranslation(language, 'currentExpectedCash')}:</span>
                <span>฿{activeExpectedCash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 font-bold">
                <span>{getTranslation(language, 'variance')}:</span>
                <span className={currentVariance >= 0 ? 'text-sky-400' : 'text-rose-400'}>
                  {currentVariance >= 0 ? `+฿${currentVariance.toFixed(2)}` : `฿${currentVariance.toFixed(2)}`}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all"
            >
              {getTranslation(language, 'shiftClosedSuccess')}
            </button>

          </form>
        </div>
      )}

    </div>
  );
};
