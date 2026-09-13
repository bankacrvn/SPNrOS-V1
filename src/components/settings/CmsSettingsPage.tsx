import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, Palette, Layout, Sliders, Layers, Eye, 
  RotateCcw, Check, CheckCircle2, ShieldCheck, ChevronRight,
  Sidebar as SidebarIcon, AlignLeft, AlignCenter, Pin, MousePointerClick,
  Lock, Printer, ShoppingBag, Store, AlertTriangle, ArrowRightLeft,
  Smartphone, Monitor, RefreshCw, Sun, Moon,
  Upload, Image as ImageIcon, Trash2, Link as LinkIcon
} from 'lucide-react';
import { CmsPrimaryColor, CmsBorderRadius, CmsSettings, DEFAULT_CMS_SETTINGS } from '../../types';
import { PRIMARY_COLOR_MAP, BORDER_RADIUS_MAP, getThemeClasses } from '../../lib/themeClasses';
import { EditableLayoutText } from '../common/EditableLayoutText';

export const CmsSettingsPage: React.FC = () => {
  const { 
    cmsSettings, updateCmsSettings, updateCmsField, resetCmsSettings,
    isCmsMode, setIsCmsMode, setPreviewModalType, addToast, language,
    darkMode, toggleDarkMode
  } = useApp();

  const [activeSubSection, setActiveSubSection] = useState<'all' | 'theme' | 'layout' | 'modals'>('all');
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string>('Just now');

  const currentTheme = getThemeClasses(cmsSettings.theme);

  const handleUpdate = (updater: Partial<CmsSettings> | ((prev: CmsSettings) => CmsSettings)) => {
    updateCmsSettings(updater);
    setLastSavedTimestamp(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const handleLocalLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      addToast('error', 'File size exceeds 3MB limit');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      handleUpdate({
        header: {
          ...cmsSettings.header,
          logoUrl: result,
          logoType: 'image'
        }
      });
      addToast('success', 'Header logo uploaded and applied');
    };
    reader.readAsDataURL(file);
  };

  const LOGO_PRESETS = [
    { name: 'Gourmet Dining', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=120&h=120&q=80' },
    { name: 'Bistro & Grill', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=120&h=120&q=80' },
    { name: 'Sushi & Sake', url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=120&h=120&q=80' },
    { name: 'Artisan Cafe', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=120&h=120&q=80' },
  ];

  const applyPreset = (color: CmsPrimaryColor, radius: CmsBorderRadius, title?: string) => {
    handleUpdate({
      theme: {
        primaryColor: color,
        borderRadius: radius,
      },
      ...(title ? { header: { ...cmsSettings.header, title } } : {}),
    });
    addToast('success', `Applied preset: ${PRIMARY_COLOR_MAP[color].name}`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* 1. TOP HERO BAR: CMS STATUS & IN-PLACE VISUAL TOGGLE */}
      <div className={`p-6 rounded-3xl border transition-all duration-300 backdrop-blur-md shadow-sm ${
        isCmsMode 
          ? 'bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-sky-500/10 border-sky-500/40 dark:border-sky-500/30'
          : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800/80'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Left info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                isCmsMode 
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30 animate-pulse' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {isCmsMode ? 'Visual In-Place Mode Active' : 'CMS Customizer'}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Autosaved to LocalStorage ({lastSavedTimestamp})
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Sparkles className={`w-6 h-6 ${isCmsMode ? 'text-sky-500' : 'text-slate-400'}`} />
              <span>Website Builder & Theme Customizer</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Customize real-time application aesthetics, navigation layout, primary brand palette, and interactive modal dialogs with instant live preview and zero reload autosaving.
            </p>
          </div>

          {/* Right Action: In-Place Visual Edit Toggle Switch */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                const next = !isCmsMode;
                setIsCmsMode(next);
                addToast('info', next 
                  ? 'In-Place Visual Editing turned ON. Click any dashed layout text across the app to edit!' 
                  : 'In-Place Visual Editing turned OFF.'
                );
              }}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-98 border ${
                isCmsMode
                  ? 'bg-sky-500 hover:bg-sky-600 text-white border-sky-400 shadow-sky-500/25 ring-4 ring-sky-500/20'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-black dark:border-white hover:bg-black dark:hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <MousePointerClick className={`w-4 h-4 ${isCmsMode ? 'animate-bounce' : ''}`} />
                <span>{isCmsMode ? 'In-Place Editing: ON' : 'Turn On In-Place Editing'}</span>
              </div>
              <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${isCmsMode ? 'bg-white/30' : 'bg-slate-700 dark:bg-slate-300'}`}>
                <div className={`w-4 h-4 rounded-full bg-white dark:bg-slate-900 transition-transform ${isCmsMode ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>

            {/* Reset to defaults button */}
            <button
              onClick={() => {
                if (window.confirm('Reset all CMS customizations back to default factory settings?')) {
                  resetCmsSettings();
                  addToast('info', 'CMS settings reset to default.');
                }
              }}
              className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Reset to Factory Defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* QUICK PRESETS STRIP */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] shrink-0 pl-1">
          Quick Presets:
        </span>
        <button
          onClick={() => applyPreset('indigo', 'xl', 'rOS Enterprise')}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/50 hover:border-indigo-500 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2 shrink-0 transition-all"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
          <span>Enterprise Indigo</span>
        </button>
        <button
          onClick={() => applyPreset('emerald', 'full', 'rOS Fresh Organic')}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-500 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2 shrink-0 transition-all"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
          <span>Organic Emerald</span>
        </button>
        <button
          onClick={() => applyPreset('rose', 'md', 'rOS Bistro & Lounge')}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 hover:border-rose-500 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2 shrink-0 transition-all"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
          <span>Ruby Bistro</span>
        </button>
        <button
          onClick={() => applyPreset('amber', 'none', 'rOS Bakery & Café')}
          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 hover:border-amber-500 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2 shrink-0 transition-all"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
          <span>Artisan Amber</span>
        </button>
      </div>

      {/* 2. MAIN 2-COLUMN GRID: CONTROLS & LIVE SIMULATOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: THE CONTROLLER CARDS (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SECTION A: THEME SELECTOR */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${currentTheme.lightBg} ${currentTheme.text}`}>
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Theme & Brand Styling</h3>
                  <p className="text-xs text-slate-400">Primary palette & geometric corner radius</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                {PRIMARY_COLOR_MAP[cmsSettings.theme.primaryColor].name}
              </span>
            </div>

            {/* Primary Color Swatches */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Primary Brand Accent Color
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['indigo', 'emerald', 'rose', 'amber'] as CmsPrimaryColor[]).map((colKey) => {
                  const meta = PRIMARY_COLOR_MAP[colKey];
                  const isSelected = cmsSettings.theme.primaryColor === colKey;
                  return (
                    <button
                      key={colKey}
                      onClick={() => handleUpdate({
                        theme: { ...cmsSettings.theme, primaryColor: colKey },
                      })}
                      className={`p-3 rounded-2xl border transition-all text-left flex items-center gap-3 relative ${
                        isSelected
                          ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/80 shadow-sm ring-2 ring-slate-900/10 dark:ring-white/10'
                          : 'border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div 
                        className="w-8 h-8 rounded-full shadow-inner flex items-center justify-center text-white shrink-0" 
                        style={{ backgroundColor: meta.hex }}
                      >
                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{meta.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">{meta.hex}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Border Radius Options */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                UI Corner Geometry (Border Radius)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(['none', 'md', 'xl', 'full'] as CmsBorderRadius[]).map((radKey) => {
                  const meta = BORDER_RADIUS_MAP[radKey];
                  const isSelected = cmsSettings.theme.borderRadius === radKey;
                  return (
                    <button
                      key={radKey}
                      onClick={() => handleUpdate({
                        theme: { ...cmsSettings.theme, borderRadius: radKey },
                      })}
                      className={`p-3 rounded-2xl border transition-all text-center flex flex-col items-center gap-2 ${
                        isSelected
                          ? 'border-slate-900 dark:border-white bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                          : 'border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {/* Geometric Box Preview */}
                      <div className={`w-8 h-6 border-2 transition-all ${
                        isSelected ? 'border-white dark:border-slate-900' : 'border-slate-400'
                      } ${meta.button}`} />
                      <span className="text-xs font-bold tracking-tight">{meta.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION B: LAYOUT CONTROLLERS (Header & Sidebar) */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${currentTheme.lightBg} ${currentTheme.text}`}>
                <Layout className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Structural Layout Controllers</h3>
                <p className="text-xs text-slate-400">Header alignment, sticky dock & sidebar positioning</p>
              </div>
            </div>

            {/* 1. Header Configurations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Header Customizer</h4>
                <span className="text-[11px] font-semibold text-sky-500">Live Preview & Autosave</span>
              </div>

              {/* Header Logo Editor (Support Local Uploaded) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-sky-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Header Logo Editor</span>
                  </div>
                  {cmsSettings.header.logoUrl && (
                    <button
                      onClick={() => handleUpdate({
                        header: { ...cmsSettings.header, logoUrl: '', logoType: 'default' }
                      })}
                      className="text-[11px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Reset to Default rOS Emblem</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Current Logo / Emblem Preview */}
                  <div className="relative group shrink-0">
                    {cmsSettings.header.logoUrl ? (
                      <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/50 p-1.5 shadow-md flex items-center justify-center overflow-hidden">
                        <img
                          src={cmsSettings.header.logoUrl}
                          alt="Uploaded Logo"
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${currentTheme.gradient} flex items-center justify-center text-white shadow-md text-xl font-black tracking-tight`}>
                        rOS
                      </div>
                    )}
                    <span className="absolute -bottom-2 -right-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow">
                      {cmsSettings.header.logoUrl ? 'Custom' : 'Default'}
                    </span>
                  </div>

                  {/* Upload Controls & URL input */}
                  <div className="flex-1 space-y-2.5 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Local File Upload Button */}
                      <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Local Logo File</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          onChange={handleLocalLogoUpload}
                          className="hidden"
                        />
                      </label>

                      <span className="text-[11px] text-slate-400">PNG, JPG, SVG, WebP (Max 3MB)</span>
                    </div>

                    {/* Or URL input */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          value={cmsSettings.header.logoUrl || ''}
                          onChange={(e) => handleUpdate({
                            header: { ...cmsSettings.header, logoUrl: e.target.value, logoType: e.target.value ? 'image' : 'default' }
                          })}
                          placeholder="Or paste external image URL (https://...)"
                          className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20"
                        />
                      </div>
                    </div>

                    {/* Sample Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span className="text-[10px] text-slate-400 font-medium">Quick Presets:</span>
                      {LOGO_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => handleUpdate({
                            header: { ...cmsSettings.header, logoUrl: preset.url, logoType: 'image' }
                          })}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-sky-500 text-slate-700 dark:text-slate-300 transition-colors"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Header Title</label>
                  <input
                    type="text"
                    value={cmsSettings.header.title}
                    onChange={(e) => handleUpdate({
                      header: { ...cmsSettings.header, title: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20"
                    placeholder="e.g. rOS Enterprise"
                  />
                </div>

                {/* Subtitle */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Header Subtitle</label>
                  <input
                    type="text"
                    value={cmsSettings.header.subtitle}
                    onChange={(e) => handleUpdate({
                      header: { ...cmsSettings.header, subtitle: e.target.value }
                    })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20"
                    placeholder="e.g. Smart POS & ERP"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Alignment Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Title Alignment</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleUpdate({
                        header: { ...cmsSettings.header, alignment: 'left' }
                      })}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        cmsSettings.header.alignment === 'left'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-black dark:border-white shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                      <span>Left Dock</span>
                    </button>
                    <button
                      onClick={() => handleUpdate({
                        header: { ...cmsSettings.header, alignment: 'center' }
                      })}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        cmsSettings.header.alignment === 'center'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-black dark:border-white shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                      <span>Centered</span>
                    </button>
                  </div>
                </div>

                {/* Sticky Header Toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Dock Behavior</label>
                  <button
                    onClick={() => handleUpdate({
                      header: { ...cmsSettings.header, isSticky: !cmsSettings.header.isSticky }
                    })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                      cmsSettings.header.isSticky
                        ? 'border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Pin className={`w-3.5 h-3.5 ${cmsSettings.header.isSticky ? 'fill-sky-500' : ''}`} />
                      <span>Sticky Top Bar</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase font-bold">
                      {cmsSettings.header.isSticky ? 'Enabled' : 'Static'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Sidebar Configurations */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Sidebar Customizer</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Position Swap */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Dock Position</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleUpdate({
                        sidebar: { ...cmsSettings.sidebar, position: 'left' }
                      })}
                      className={`px-2.5 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        cmsSettings.sidebar.position === 'left'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-black dark:border-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>Left</span>
                    </button>
                    <button
                      onClick={() => handleUpdate({
                        sidebar: { ...cmsSettings.sidebar, position: 'right' }
                      })}
                      className={`px-2.5 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        cmsSettings.sidebar.position === 'right'
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-black dark:border-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>Right</span>
                    </button>
                  </div>
                </div>

                {/* Width Variant */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Width Size</label>
                  <select
                    value={cmsSettings.sidebar.width}
                    onChange={(e) => handleUpdate({
                      sidebar: { ...cmsSettings.sidebar, width: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="narrow">Narrow (192px)</option>
                    <option value="default">Default (240px)</option>
                    <option value="wide">Wide (288px)</option>
                  </select>
                </div>

                {/* Collapse on Mobile */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Mobile Adaptation</label>
                  <button
                    onClick={() => handleUpdate({
                      sidebar: { ...cmsSettings.sidebar, collapseOnMobile: !cmsSettings.sidebar.collapseOnMobile }
                    })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                      cmsSettings.sidebar.collapseOnMobile
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Auto-Collapse</span>
                    </div>
                    <span className="text-[10px] font-mono">{cmsSettings.sidebar.collapseOnMobile ? 'ON' : 'OFF'}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* SECTION C: MODAL MANAGER */}
          <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl ${currentTheme.lightBg} ${currentTheme.text}`}>
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Global Modal Manager</h3>
                  <p className="text-xs text-slate-400">Configure global dialog copy, toggles & interactive simulation</p>
                </div>
              </div>
            </div>

            {/* List of 5 Global Modals */}
            <div className="space-y-3">
              {[
                {
                  id: 'pinAuth',
                  name: 'Security PIN Authentication Modal',
                  icon: <Lock className="w-4 h-4 text-sky-500" />,
                  desc: 'Controls system lock screen and authorization keypad prompt.',
                },
                {
                  id: 'receipt',
                  name: 'Tax Invoice & Receipt Modal',
                  icon: <Printer className="w-4 h-4 text-emerald-500" />,
                  desc: 'Formats customer thermal printouts and official revenue vouchers.',
                },
                {
                  id: 'quickOrder',
                  name: 'Quick Order Creator Modal',
                  icon: <ShoppingBag className="w-4 h-4 text-indigo-500" />,
                  desc: 'Rapid takeaway & dine-in ticket entry terminal.',
                },
                {
                  id: 'shiftManagement',
                  name: 'Shift Management & Reconciliation Modal',
                  icon: <Store className="w-4 h-4 text-amber-500" />,
                  desc: 'Drawer float denomination counts and end-of-shift audits.',
                },
                {
                  id: 'confirmation',
                  name: 'System Confirmation Modal',
                  icon: <AlertTriangle className="w-4 h-4 text-rose-500" />,
                  desc: 'Universal confirmation modal for irreversible admin actions.',
                },
              ].map((modal) => {
                const conf = (cmsSettings.modals as any)[modal.id];
                return (
                  <div
                    key={modal.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          {modal.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{modal.name}</p>
                          <p className="text-[11px] text-slate-400">{modal.desc}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Enabled Toggle */}
                        <button
                          onClick={() => handleUpdate({
                            modals: {
                              ...cmsSettings.modals,
                              [modal.id]: { ...conf, enabled: !conf?.enabled }
                            }
                          })}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                            conf?.enabled
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          }`}
                        >
                          {conf?.enabled ? 'Active' : 'Disabled'}
                        </button>

                        {/* Interactive Preview Button */}
                        <button
                          onClick={() => {
                            setPreviewModalType(modal.id);
                            addToast('info', `Opening live simulation of ${modal.name}`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-sky-500 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5 text-sky-500" />
                          <span>Preview Modal</span>
                        </button>
                      </div>
                    </div>

                    {/* Editable Title Input */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500">Custom Modal Header Title</label>
                        <input
                          type="text"
                          value={conf?.title || ''}
                          onChange={(e) => handleUpdate({
                            modals: {
                              ...cmsSettings.modals,
                              [modal.id]: { ...conf, title: e.target.value }
                            }
                          })}
                          className="w-full mt-0.5 px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                          placeholder="Title..."
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500">Custom Action Button Text</label>
                        <input
                          type="text"
                          value={conf?.buttonText || ''}
                          onChange={(e) => handleUpdate({
                            modals: {
                              ...cmsSettings.modals,
                              [modal.id]: { ...conf, buttonText: e.target.value }
                            }
                          })}
                          className="w-full mt-0.5 px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                          placeholder="Button text..."
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: REAL-TIME INTERACTIVE WIREFRAME SIMULATOR (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-20 space-y-4">
            
            <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-lg space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-sky-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Layout Simulation</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${currentTheme.bg} animate-ping`} />
                  <span className="text-[11px] font-mono text-slate-400">Live Preview</span>
                </div>
              </div>

              {/* Wireframe Mockup Canvas */}
              <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-300 dark:border-slate-800 overflow-hidden shadow-inner p-3 space-y-3 font-sans text-xs">
                
                {/* Simulated Header */}
                <div className={`w-full bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between ${currentTheme.buttonRadius} ${
                  cmsSettings.header.alignment === 'center' ? 'flex-col sm:flex-row text-center sm:text-left' : ''
                }`}>
                  <div className={`flex items-center gap-2 ${cmsSettings.header.alignment === 'center' ? 'mx-auto sm:mx-0' : ''}`}>
                    {cmsSettings.header.logoUrl ? (
                      <div className={`w-7 h-7 ${currentTheme.buttonRadius} bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 overflow-hidden flex items-center justify-center shadow-sm shrink-0`}>
                        <img
                          src={cmsSettings.header.logoUrl}
                          alt="Logo Preview"
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className={`w-7 h-7 ${currentTheme.buttonRadius} ${currentTheme.bg} flex items-center justify-center text-white font-black text-xs shadow-sm`}>
                        rOS
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white leading-tight">
                        {cmsSettings.header.title || 'rOS Enterprise'}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {cmsSettings.header.subtitle || 'POS & ERP'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 pt-1 sm:pt-0">
                    <span className={`px-2 py-0.5 text-[9px] font-bold ${currentTheme.badge} ${currentTheme.badgeRadius}`}>
                      {PRIMARY_COLOR_MAP[cmsSettings.theme.primaryColor].name}
                    </span>
                    {cmsSettings.header.isSticky && (
                      <span className="text-[9px] font-mono text-sky-500 font-bold">Sticky</span>
                    )}
                  </div>
                </div>

                {/* Simulated Body (Sidebar + Content Workspace) */}
                <div className={`flex gap-2 min-h-[180px] ${cmsSettings.sidebar.position === 'right' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Simulated Sidebar */}
                  <div className={`bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800 flex flex-col justify-between ${currentTheme.buttonRadius} ${
                    cmsSettings.sidebar.width === 'narrow' ? 'w-16' : cmsSettings.sidebar.width === 'wide' ? 'w-24' : 'w-20'
                  }`}>
                    <div className="space-y-1">
                      {['POS', 'Shift', 'ROS', 'Stock'].map((label, idx) => (
                        <div
                          key={label}
                          className={`p-1.5 text-[10px] font-bold text-center transition-all ${currentTheme.buttonRadius} ${
                            idx === 0 
                              ? `${currentTheme.bg} text-white shadow-sm` 
                              : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          {label}
                        </div>
                      ))}
                    </div>

                    <div className="text-[9px] text-center text-slate-400 font-mono">
                      {cmsSettings.sidebar.position.toUpperCase()}
                    </div>
                  </div>

                  {/* Simulated Content Area */}
                  <div className={`flex-1 bg-white/70 dark:bg-slate-900/70 p-3 border border-slate-200 dark:border-slate-800 flex flex-col justify-between ${currentTheme.buttonRadius}`}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white text-[11px]">Active Workspace</span>
                        <span className="text-[9px] text-slate-400 font-mono">Ready</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-1.5">
                        <div className={`p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${currentTheme.buttonRadius}`}>
                          <p className="text-[9px] text-slate-400">Total Sales</p>
                          <p className={`font-extrabold ${currentTheme.text}`}>฿42,500</p>
                        </div>
                        <div className={`p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ${currentTheme.buttonRadius}`}>
                          <p className="text-[9px] text-slate-400">Active Shift</p>
                          <p className="font-extrabold text-emerald-500">OPEN</p>
                        </div>
                      </div>
                    </div>

                    {/* Primary Button Demo */}
                    <button className={`w-full py-2 text-[11px] font-bold text-white ${currentTheme.button} ${currentTheme.buttonRadius} mt-2 flex items-center justify-center gap-1`}>
                      <span>Sample Action Button</span>
                    </button>
                  </div>

                </div>

              </div>

              {/* Theme Settings Spec Sheet */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
                <p className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Theme Configuration Spec</span>
                  <span className="text-[10px] text-emerald-500 font-mono">Active</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                  <div>Brand Color: <strong className="text-slate-900 dark:text-white">{cmsSettings.theme.primaryColor}</strong></div>
                  <div>Border Radius: <strong className="text-slate-900 dark:text-white">{cmsSettings.theme.borderRadius}</strong></div>
                  <div>Header Sticky: <strong className="text-slate-900 dark:text-white">{cmsSettings.header.isSticky ? 'Yes' : 'No'}</strong></div>
                  <div>Sidebar Dock: <strong className="text-slate-900 dark:text-white">{cmsSettings.sidebar.position}</strong></div>
                  <div>Sidebar Width: <strong className="text-slate-900 dark:text-white">{cmsSettings.sidebar.width}</strong></div>
                  <div>In-Place Mode: <strong className="text-slate-900 dark:text-white">{isCmsMode ? 'ON' : 'OFF'}</strong></div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
