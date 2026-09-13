import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../lib/i18n';
import { Lock, Delete, ShieldAlert, KeyRound } from 'lucide-react';

export const PinAuthModal: React.FC = () => {
  const { isAuthenticated, loginWithPin, language } = useApp();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (isAuthenticated) return null;

  const handleKeyPress = (num: string) => {
    if (pin.length < 6) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg('');
      if (nextPin.length === 6) {
        setTimeout(() => {
          const success = loginWithPin(nextPin);
          if (!success) {
            setErrorMsg(getTranslation(language, 'incorrectPin'));
            setPin('');
          }
        }, 100);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  const handlePresetPinClick = () => {
    setPin('260539');
    setTimeout(() => {
      loginWithPin('260539');
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 rounded-3xl border border-slate-200/50 dark:border-slate-800/80 shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center">
        
        {/* Top Security Icon & Header */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 mb-4">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          {getTranslation(language, 'masterPin')}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-6">
          {getTranslation(language, 'enterPin')}
        </p>

        {/* PIN Dots Indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[0, 1, 2, 3, 4, 5].map(idx => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                pin.length > idx
                  ? 'bg-sky-500 scale-110 shadow-md shadow-sky-500/50'
                  : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="flex items-center gap-2 text-rose-500 text-xs font-semibold mb-4 animate-shake">
            <ShieldAlert className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Numeric Keypad Grid */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="h-14 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 dark:hover:text-white text-slate-800 dark:text-slate-100 font-bold text-xl transition-all active:scale-95 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 shadow-sm"
            >
              {num}
            </button>
          ))}

          <button
            onClick={handleClear}
            className="h-14 rounded-2xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white font-semibold text-xs transition-all active:scale-95 flex items-center justify-center border border-rose-200 dark:border-rose-900/30"
          >
            Clear
          </button>

          <button
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 dark:hover:text-white text-slate-800 dark:text-slate-100 font-bold text-xl transition-all active:scale-95 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 shadow-sm"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all active:scale-95 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Quick Fill Hint for Seamless Access */}
        <button
          onClick={handlePresetPinClick}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-semibold transition-all border border-sky-500/20"
        >
          <KeyRound className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
          <span>Quick Unlock Master PIN: 260539</span>
        </button>

      </div>
    </div>
  );
};
