import React from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../lib/i18n';
import { Printer, X, CheckCircle, QrCode } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { activeReceiptOrder, setActiveReceiptOrder, settings, language } = useApp();

  if (!activeReceiptOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(activeReceiptOrder.created_at).toLocaleString(
    language === 'th' ? 'th-TH' : 'en-US',
    { dateStyle: 'medium', timeStyle: 'short' }
  );

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Action Header */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>{getTranslation(language, 'orderCompleted')}</span>
          </div>
          <button
            onClick={() => setActiveReceiptOrder(null)}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Canvas */}
        <div id="printable-receipt" className="p-6 overflow-y-auto font-mono text-slate-800 dark:text-slate-200 space-y-4">
          
          {/* Restaurant Header */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
            <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900 dark:text-white">
              {settings.restaurant_name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
              {settings.receipt_header}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-sans pt-1">
              {getTranslation(language, 'receiptTitle')} ({getTranslation(language, 'taxInvoice')})
            </p>
          </div>

          {/* Metadata */}
          <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400 pt-1">
            <div className="flex justify-between">
              <span>Order #:</span>
              <span className="font-bold text-slate-900 dark:text-white">{activeReceiptOrder.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span>{getTranslation(language, 'tableNumber')}:</span>
              <span className="font-bold">{activeReceiptOrder.table_number}</span>
            </div>
            <div className="flex justify-between">
              <span>{getTranslation(language, 'date')}:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className="capitalize font-semibold">{activeReceiptOrder.payment_method.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 space-y-2">
            <div className="grid grid-cols-12 text-[11px] font-bold text-slate-500 uppercase pb-1 border-b border-slate-200 dark:border-slate-800">
              <span className="col-span-6">Item</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-4 text-right">Price</span>
            </div>

            {activeReceiptOrder.order_items?.map(item => (
              <div key={item.id} className="grid grid-cols-12 text-xs items-center">
                <span className="col-span-6 font-sans truncate pr-1">
                  {language === 'th' ? item.menu_item_name_th || item.menu_item_name_en : item.menu_item_name_en}
                </span>
                <span className="col-span-2 text-center">x{item.quantity}</span>
                <span className="col-span-4 text-right">฿{item.total_price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="pt-3 border-t border-dashed border-slate-300 dark:border-slate-700 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>{getTranslation(language, 'subtotal')}</span>
              <span>฿{activeReceiptOrder.total_amount.toFixed(2)}</span>
            </div>

            {activeReceiptOrder.discount_amount > 0 && (
              <div className="flex justify-between text-rose-500">
                <span>{getTranslation(language, 'discount')}</span>
                <span>-฿{activeReceiptOrder.discount_amount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-500">
              <span>{getTranslation(language, 'tax')} ({settings.tax_rate}%)</span>
              <span>฿{activeReceiptOrder.tax_amount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-base font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-300 dark:border-slate-700">
              <span>{getTranslation(language, 'grandTotal')}</span>
              <span className="text-sky-600 dark:text-sky-400">฿{activeReceiptOrder.net_amount.toFixed(2)}</span>
            </div>

            {activeReceiptOrder.payment_method === 'cash' && (
              <>
                <div className="flex justify-between text-slate-500 pt-1">
                  <span>{getTranslation(language, 'amountReceived')}</span>
                  <span>฿{(activeReceiptOrder.amount_received || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                  <span>{getTranslation(language, 'changeGiven')}</span>
                  <span>฿{(activeReceiptOrder.change_given || 0).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          {/* PromptPay QR Section if applicable */}
          {activeReceiptOrder.payment_method === 'qr_promptpay' && (
            <div className="pt-3 border-t border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                <QrCode className="w-24 h-24 text-slate-900" />
                <span className="text-[10px] font-bold text-slate-700 mt-1">PromptPay ID: {settings.promptpay_id}</span>
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="text-center pt-3 border-t border-dashed border-slate-300 dark:border-slate-700 font-sans text-xs text-slate-500">
            {settings.receipt_footer}
          </div>

        </div>

        {/* Modal Buttons */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3">
          <button
            onClick={() => setActiveReceiptOrder(null)}
            className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white font-semibold text-xs transition-colors"
          >
            {getTranslation(language, 'close')}
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>{getTranslation(language, 'print')}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
