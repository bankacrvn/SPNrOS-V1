import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getThemeClasses } from '../../lib/themeClasses';
import { 
  X, Lock, Printer, ShoppingBag, Store, AlertTriangle, 
  CheckCircle2, Sparkles, Eye, ShieldCheck, KeyRound, QrCode
} from 'lucide-react';
import { EditableLayoutText } from './EditableLayoutText';

export const CmsModalPreviewer: React.FC = () => {
  const { previewModalType, setPreviewModalType, cmsSettings } = useApp();
  const [dummyPin, setDummyPin] = useState('260');
  const [activeTab, setActiveTab] = useState<'preview' | 'info'>('preview');

  if (!previewModalType) return null;

  const theme = getThemeClasses(cmsSettings.theme);
  const handleClose = () => setPreviewModalType(null);

  const modalConfig = (cmsSettings.modals as any)[previewModalType] || {
    title: 'System Modal Preview',
    subtitle: 'Interactive CMS Preview',
    description: 'This is a live preview of this modal dialog.',
    buttonText: 'Action',
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div 
        className={`w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${theme.cardRadius}`}
      >
        {/* CMS Preview Banner */}
        <div className="bg-sky-500/10 border-b border-sky-500/20 px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-bold">
            <Eye className="w-3.5 h-3.5 animate-pulse" />
            <span>CMS Live Modal Preview: <strong className="capitalize">{previewModalType}</strong></span>
          </div>
          <span className="text-[10px] text-slate-400">Interactive Simulation Mode</span>
        </div>

        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${theme.buttonRadius} ${theme.bg} flex items-center justify-center text-white shadow-md`}>
              {previewModalType === 'pinAuth' && <Lock className="w-5 h-5" />}
              {previewModalType === 'receipt' && <Printer className="w-5 h-5" />}
              {previewModalType === 'quickOrder' && <ShoppingBag className="w-5 h-5" />}
              {previewModalType === 'shiftManagement' && <Store className="w-5 h-5" />}
              {previewModalType === 'confirmation' && <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                <EditableLayoutText 
                  fieldPath={`modals.${previewModalType}.title`} 
                  fallback={modalConfig.title} 
                />
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <EditableLayoutText 
                  fieldPath={`modals.${previewModalType}.subtitle`} 
                  fallback={modalConfig.subtitle || 'System Modal'} 
                />
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Dynamic Body Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
            <EditableLayoutText 
              fieldPath={`modals.${previewModalType}.description`} 
              fallback={modalConfig.description}
              multiline
            />
          </div>

          {/* Type-Specific Preview Mockup Content */}
          {previewModalType === 'pinAuth' && (
            <div className="flex flex-col items-center justify-center py-2 space-y-4">
              <div className="flex items-center gap-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full border transition-all ${
                      dummyPin.length > idx 
                        ? `${theme.bg} border-transparent shadow-sm` 
                        : 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2 w-48">
                {['1','2','3','4','5','6','7','8','9','C','0','⌫'].map((k) => (
                  <button
                    key={k}
                    onClick={() => {
                      if (k === 'C') setDummyPin('');
                      else if (k === '⌫') setDummyPin(p => p.slice(0, -1));
                      else if (dummyPin.length < 6) setDummyPin(p => p + k);
                    }}
                    className={`h-10 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          )}

          {previewModalType === 'receipt' && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 font-mono text-xs space-y-2 text-slate-700 dark:text-slate-300">
              <div className="text-center font-bold pb-2 border-b border-dashed border-slate-300 dark:border-slate-700">
                <p className="text-sm font-sans">{cmsSettings.header.title || 'rOS Enterprise'}</p>
                <p className="text-[10px] text-slate-400">TAX ID: 0105562089123</p>
              </div>
              <div className="flex justify-between">
                <span>Receipt: #ORD-9821</span>
                <span>Table: T-04</span>
              </div>
              <div className="flex justify-between">
                <span>1x Wagyu Steak 250g</span>
                <span>฿890.00</span>
              </div>
              <div className="flex justify-between">
                <span>2x Craft Matcha Soda</span>
                <span>฿190.00</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-dashed border-slate-300 dark:border-slate-700">
                <span>Total Net</span>
                <span className={theme.text}>฿1,080.00</span>
              </div>
            </div>
          )}

          {previewModalType === 'quickOrder' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block">Order Type</span>
                  <span className="font-bold text-slate-900 dark:text-white">Dine-In (Table 08)</span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] text-slate-400 font-semibold block">Guest Count</span>
                  <span className="font-bold text-slate-900 dark:text-white">4 Persons</span>
                </div>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">Preset Items Ready</p>
                <p className="text-[11px] text-slate-400">Clicking confirm will route items directly to the kitchen display.</p>
              </div>
            </div>
          )}

          {previewModalType === 'shiftManagement' && (
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Cash</span>
                  <span className="font-bold text-emerald-600">฿3,450</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Credit Card</span>
                  <span className="font-bold text-indigo-600">฿8,120</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 block">PromptPay</span>
                  <span className="font-bold text-amber-600">฿4,200</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                Counted Drawer Cash float matches expected balance with zero variance.
              </p>
            </div>
          )}

          {previewModalType === 'confirmation' && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Administrative Safety Guard
              </p>
              <p className="text-[11px]">
                This modal is used across the system for dangerous actions like clearing carts, resetting PINs, or voiding tickets.
              </p>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handleClose}
            className={`px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors`}
          >
            Close Preview
          </button>
          <button
            onClick={handleClose}
            className={`px-5 py-2.5 text-xs font-bold text-white ${theme.button} ${theme.buttonRadius} transition-all active:scale-95 flex items-center gap-1.5`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              <EditableLayoutText 
                fieldPath={`modals.${previewModalType}.buttonText`} 
                fallback={modalConfig.buttonText || 'Confirm'} 
              />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
