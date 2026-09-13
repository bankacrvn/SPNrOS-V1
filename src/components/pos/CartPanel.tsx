import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../lib/i18n';
import { PaymentMethod } from '../../types';
import { 
  Trash2, Plus, Minus, CreditCard, Banknote, 
  QrCode, Tag, ArrowRight, X, PanelRightClose, 
  PanelRightOpen, ShoppingCart, ChevronRight 
} from 'lucide-react';

export const CartPanel: React.FC = () => {
  const { 
    cart, cartExpanded, setCartExpanded, updateCartQuantity, removeFromCart, clearCart, 
    settings, submitOrder, language, activeShift 
  } = useApp();

  const [tableNumber, setTableNumber] = useState('Table 1');
  const [discountAmt, setDiscountAmt] = useState(0);
  const [discountInput, setDiscountInput] = useState('');
  const [showDiscountModal, setShowDiscountModal] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [receivedAmt, setReceivedAmt] = useState<number>(0);
  const [receivedInput, setReceivedInput] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0);
  const taxRate = settings.tax_rate ?? 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmt);
  const taxAmount = (discountedSubtotal * taxRate) / 100;
  const grandTotal = discountedSubtotal + taxAmount;

  const handleApplyDiscount = (amount: number) => {
    setDiscountAmt(amount);
    setShowDiscountModal(false);
  };

  const handleOpenCheckout = () => {
    if (!activeShift) {
      alert(language === 'th' ? 'กรุณาเปิดกะแคชเชียร์ก่อนเริ่มขายสินค้า' : 'Please start a cashier shift first');
      return;
    }
    setReceivedAmt(grandTotal);
    setReceivedInput(grandTotal.toString());
    setShowCheckoutModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (paymentMethod === 'cash' && receivedAmt < grandTotal) {
      alert(language === 'th' ? 'จำนวนเงินที่รับมาไม่เพียงพอ' : 'Amount received is less than grand total');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitOrder(tableNumber, discountAmt, paymentMethod, receivedAmt);
      setShowCheckoutModal(false);
      setDiscountAmt(0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Order creation failed: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cartExpanded) {
    return (
      <div className="w-16 h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-l border-slate-200/60 dark:border-slate-800/80 flex flex-col items-center justify-between py-4 transition-all shrink-0">
        <button
          onClick={() => setCartExpanded(true)}
          className="p-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-black dark:border-white shadow-md hover:scale-105 transition-all flex flex-col items-center gap-2 relative"
          title="Expand Order Cart"
        >
          <PanelRightOpen className="w-5 h-5" />
          {totalItemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-slate-900">
              {totalItemCount}
            </span>
          )}
        </button>

        <div
          onClick={() => setCartExpanded(true)}
          className="cursor-pointer font-bold text-xs tracking-wider text-slate-700 dark:text-slate-300 transform -rotate-90 whitespace-nowrap flex items-center gap-2"
        >
          <span>{getTranslation(language, 'cart')}</span>
          <span className="font-extrabold text-slate-900 dark:text-white">฿{grandTotal.toFixed(0)}</span>
        </div>

        <button
          onClick={() => setCartExpanded(true)}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
          title="Expand Cart"
        >
          <ChevronRight className="w-4 h-4 transform rotate-180" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-96 h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-l border-slate-200/60 dark:border-slate-800/80 flex flex-col justify-between transition-all shrink-0">
      
      {/* Cart Top Header with Collapse Toggle */}
      <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCartExpanded(false)}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Collapse Cart Panel"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {getTranslation(language, 'cart')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {cart.length} {getTranslation(language, 'itemsInCart')} ({totalItemCount} pcs)
            </p>
          </div>
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="p-1.5 rounded-xl hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
            title="Clear Cart"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        
        {/* Table Number Selector */}
        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
            {getTranslation(language, 'tableNumber')}:
          </span>
          <input
            type="text"
            value={tableNumber}
            onChange={e => setTableNumber(e.target.value)}
            placeholder="e.g. Table 5 / Takeaway"
            className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
          />
        </div>

        {cart.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500">
            <Tag className="w-12 h-12 stroke-1 mb-2 opacity-50" />
            <p className="text-xs font-medium">{getTranslation(language, 'emptyCart')}</p>
          </div>
        ) : (
          cart.map(item => (
            <div
              key={item.menuItem.id}
              className="p-3 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 flex items-center justify-between gap-3 shadow-sm hover:border-slate-900 transition-all"
            >
              <img
                src={item.menuItem.image_url}
                alt={item.menuItem.name_en}
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {language === 'th' ? item.menuItem.name_th : item.menuItem.name_en}
                </h4>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  ฿{item.menuItem.price.toFixed(2)}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
                <button
                  onClick={() => updateCartQuantity(item.menuItem.id, item.quantity - 1)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateCartQuantity(item.menuItem.id, item.quantity + 1)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Checkout Footer */}
      <div className="p-4 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-200/60 dark:border-slate-800/80 space-y-3">
        
        {/* Price Breakdown */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>{getTranslation(language, 'subtotal')}</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">฿{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <span>{getTranslation(language, 'discount')}</span>
              <button
                onClick={() => setShowDiscountModal(true)}
                className="text-[10px] font-bold text-slate-900 dark:text-white underline hover:opacity-80"
              >
                ({discountAmt > 0 ? `-฿${discountAmt.toFixed(2)}` : '+ Add'})
              </button>
            </span>
            <span className="font-semibold text-rose-500">-฿{discountAmt.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>{getTranslation(language, 'tax')} ({taxRate}%)</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">฿{taxAmount.toFixed(2)}</span>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {getTranslation(language, 'grandTotal')}
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              ฿{grandTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Submit Order Button - Black Outside Border Style */}
        <button
          onClick={handleOpenCheckout}
          disabled={cart.length === 0}
          className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white border border-black dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 dark:border-white disabled:opacity-50 font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          <span>{getTranslation(language, 'completeOrder')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </div>

      {/* Quick Discount Modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {getTranslation(language, 'quickDiscount')}
              </h3>
              <button onClick={() => setShowDiscountModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15, 20, 25, 50].map(pct => {
                const calculated = (subtotal * pct) / 100;
                return (
                  <button
                    key={pct}
                    onClick={() => handleApplyDiscount(calculated)}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-black hover:text-white hover:border-black dark:hover:bg-white dark:hover:text-black dark:hover:border-white text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    {pct}% Off
                  </button>
                );
              })}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Custom Fixed Discount Amount (฿)</label>
              <input
                type="number"
                value={discountInput}
                onChange={e => setDiscountInput(e.target.value)}
                placeholder="e.g. 100"
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
              />
            </div>

            <button
              onClick={() => handleApplyDiscount(Number(discountInput) || 0)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white border border-black hover:bg-black dark:bg-white dark:text-slate-900 dark:border-white font-bold text-xs shadow-md"
            >
              Apply Discount
            </button>
          </div>
        </div>
      )}

      {/* Checkout Payment Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {getTranslation(language, 'completeOrder')}
                </h3>
                <p className="text-xs text-slate-500">{tableNumber} • Grand Total: ฿{grandTotal.toFixed(2)}</p>
              </div>
              <button onClick={() => setShowCheckoutModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Payment Method Selector - Black Border Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {getTranslation(language, 'paymentMethod')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-slate-900 text-white border-black dark:bg-white dark:text-slate-900 dark:border-white shadow-sm'
                      : 'bg-slate-100/80 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span>{getTranslation(language, 'cash')}</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'credit_card'
                      ? 'bg-slate-900 text-white border-black dark:bg-white dark:text-slate-900 dark:border-white shadow-sm'
                      : 'bg-slate-100/80 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>{getTranslation(language, 'creditCard')}</span>
                </button>

                <button
                  onClick={() => setPaymentMethod('qr_promptpay')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'qr_promptpay'
                      ? 'bg-slate-900 text-white border-black dark:bg-white dark:text-slate-900 dark:border-white shadow-sm'
                      : 'bg-slate-100/80 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span>{getTranslation(language, 'promptPay')}</span>
                </button>

              </div>
            </div>

            {/* Cash Payment Details */}
            {paymentMethod === 'cash' && (
              <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {getTranslation(language, 'amountReceived')} (฿)
                  </label>
                  <input
                    type="number"
                    value={receivedInput}
                    onChange={e => {
                      setReceivedInput(e.target.value);
                      setReceivedAmt(Number(e.target.value) || 0);
                    }}
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-lg font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Quick Exact Bills buttons */}
                <div className="flex gap-2">
                  {[grandTotal, 500, 1000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => {
                        const roundAmt = Math.ceil(amt);
                        setReceivedAmt(roundAmt);
                        setReceivedInput(roundAmt.toString());
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-black dark:hover:border-white"
                    >
                      ฿{Math.ceil(amt)}
                    </button>
                  ))}
                </div>

                <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200 dark:border-slate-700 font-bold">
                  <span className="text-slate-600 dark:text-slate-400">{getTranslation(language, 'changeGiven')}:</span>
                  <span className={`text-base ${receivedAmt >= grandTotal ? 'text-emerald-500' : 'text-rose-500'}`}>
                    ฿{Math.max(0, receivedAmt - grandTotal).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* PromptPay QR Code Display */}
            {paymentMethod === 'qr_promptpay' && (
              <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-2">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                  <QrCode className="w-32 h-32 text-slate-900" />
                  <span className="text-xs font-bold text-slate-800 mt-2">
                    PromptPay ID: {settings.promptpay_id || '0812345678'}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900">
                    ฿{grandTotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{getTranslation(language, 'paymentQR')}</p>
              </div>
            )}

            {/* Confirm Payment Button - Black Outside Border */}
            <button
              onClick={handleConfirmSubmit}
              disabled={isSubmitting || (paymentMethod === 'cash' && receivedAmt < grandTotal)}
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white border border-black dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 dark:border-white disabled:opacity-50 font-bold text-sm shadow-md transition-all"
            >
              {isSubmitting ? getTranslation(language, 'loading') : `${getTranslation(language, 'confirm')} (฿${grandTotal.toFixed(2)})`}
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
