import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../lib/i18n';
import { 
  Sun, Moon, Lock, Database, Clock, 
  Store, AlertCircle, CheckCircle2, Sparkles, MousePointerClick,
  Upload, Image as ImageIcon
} from 'lucide-react';
import { EditableLayoutText } from './EditableLayoutText';
import { getThemeClasses } from '../../lib/themeClasses';

export const Header: React.FC = () => {
  const { 
    language, setLanguage, 
    darkMode, toggleDarkMode, 
    lockApp, supabaseConnected, 
    activeShift, settings, setActiveTab, setSettingsSubTab,
    cmsSettings, isCmsMode, setIsCmsMode
  } = useApp();

  const [timeStr, setTimeStr] = useState('');
  const theme = getThemeClasses(cmsSettings.theme);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString(language === 'th' ? 'th-TH' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  const isSticky = cmsSettings.header?.isSticky !== false;
  const isCentered = cmsSettings.header?.alignment === 'center';

  return (
    <header className={`${isSticky ? 'sticky top-0' : 'relative'} z-40 w-full min-h-16 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800/80 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 transition-colors`}>
      
      {/* Left/Center Branding with Editable Title, Subtitle & Logo */}
      <div className={`flex items-center gap-3 ${isCentered ? 'mx-auto md:mx-0' : ''}`}>
        <div className="relative group">
          {cmsSettings.header?.logoUrl ? (
            <div className={`w-10 h-10 ${theme.buttonRadius} overflow-hidden bg-white/95 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm shrink-0 p-1`}>
              <img 
                src={cmsSettings.header.logoUrl} 
                alt="Brand Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className={`w-9 h-9 ${theme.buttonRadius} bg-gradient-to-tr ${theme.gradient} flex items-center justify-center text-white shadow-md shadow-sky-500/20 font-black text-lg tracking-tighter shrink-0`}>
              rOS
            </div>
          )}

          {/* Quick jump to Logo Customizer in CMS mode */}
          {isCmsMode && (
            <button
              onClick={() => {
                setActiveTab('settings');
                setSettingsSubTab('cms');
              }}
              title="Edit Logo in CMS Builder"
              className="absolute -bottom-1 -right-1 p-1 rounded-full bg-sky-500 text-white shadow hover:bg-sky-600 transition-transform active:scale-95"
            >
              <Upload className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        <div className={isCentered ? 'text-center md:text-left' : ''}>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base font-bold text-slate-900 dark:text-white leading-none tracking-tight">
              <EditableLayoutText
                fieldPath="header.title"
                fallback={cmsSettings.header?.title || settings.restaurant_name || 'rOS Enterprise'}
                className="font-bold text-slate-900 dark:text-white"
              />
            </h1>
            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 ${theme.badgeRadius} ${theme.badge}`}>
              Enterprise
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <EditableLayoutText
              fieldPath="header.subtitle"
              fallback={cmsSettings.header?.subtitle || getTranslation(language, 'appSubtitle')}
              className="text-xs text-slate-500 dark:text-slate-400"
            />
          </p>
        </div>
      </div>

      {/* Right Controls & Status Indicators */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap ml-auto">
        
        {/* Visual In-Place CMS Mode Quick Badge / Toggle */}
        <button
          onClick={() => {
            setActiveTab('settings');
            setSettingsSubTab('cms');
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            isCmsMode
              ? 'bg-sky-500/15 border-sky-500/40 text-sky-600 dark:text-sky-400 ring-2 ring-sky-500/20 shadow-sm animate-pulse'
              : 'bg-slate-100/70 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
          title="Open Website Builder / CMS Theme Customizer"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span className="hidden sm:inline">CMS</span>
          {isCmsMode && <span className="text-[10px] font-mono font-extrabold uppercase text-sky-500">Live</span>}
        </button>

        {/* Live Clock Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
          <Clock className={`w-3.5 h-3.5 ${theme.text}`} />
          <span>{timeStr}</span>
        </div>

        {/* Shift Badge */}
        <button
          onClick={() => setActiveTab('shift')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 ${theme.buttonRadius} text-xs font-semibold border transition-all ${
            activeShift
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {activeShift 
              ? `${getTranslation(language, 'shift')}: ${language === 'th' ? 'เปิดกะอยู่' : 'Open'}`
              : `${getTranslation(language, 'shift')}: ${getTranslation(language, 'noActiveShift')}`}
          </span>
        </button>

        {/* Supabase Status Badge */}
        <button
          onClick={() => {
            setActiveTab('settings');
            setSettingsSubTab('servers');
          }}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 ${theme.buttonRadius} text-xs font-semibold border transition-all ${
            supabaseConnected
              ? 'bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
          }`}
          title={supabaseConnected ? 'Connected to Supabase PostgreSQL' : 'Local Persistence Mode (Click to configure Supabase)'}
        >
          <Database className="w-3.5 h-3.5" />
          {supabaseConnected ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-sky-500" />
              <span>Supabase</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3 text-amber-500" />
              <span>Local Mode</span>
            </>
          )}
        </button>

        {/* Language Switcher */}
        <div className={`flex items-center p-0.5 ${theme.buttonRadius} bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700`}>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-1 ${theme.badgeRadius} text-xs font-bold transition-all ${
              language === 'en'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('th')}
            className={`px-2 py-1 ${theme.badgeRadius} text-xs font-bold transition-all ${
              language === 'th'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            TH
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`p-2 ${theme.buttonRadius} bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700/60`}
          title="Toggle Dark/Light Mode"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Lock Screen Button */}
        <button
          onClick={lockApp}
          className={`flex items-center gap-1.5 px-3 py-1.5 ${theme.buttonRadius} bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/20 transition-all active:scale-95`}
          title={getTranslation(language, 'lockApp')}
        >
          <Lock className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{getTranslation(language, 'lockApp')}</span>
        </button>

      </div>
    </header>
  );
};

