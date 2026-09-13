import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../lib/i18n';
import { SettingsSubTab, Category, MenuItem } from '../../types';
import { FULL_SUPABASE_SQL_SCHEMA, SCHEMA_TABLES_INFO } from '../../lib/sqlSchema';
import { saveSupabaseCredentials, getSavedSupabaseCredentials } from '../../lib/supabaseClient';
import { 
  Settings, Database, Lock, Store, Layers, Plus, Edit2, 
  Trash2, CheckCircle2, AlertCircle, Copy, Check, X, Shield, Upload, Image as ImageIcon,
  RefreshCw, Sparkles, UtensilsCrossed, Download, Code2, ChevronDown, ChevronUp, FileCode
} from 'lucide-react';
import { CmsSettingsPage } from './CmsSettingsPage';

export const SettingsView: React.FC = () => {
  const { 
    settingsSubTab, setSettingsSubTab, language, 
    settings, updateSettings, masterPin, updateMasterPin, 
    supabaseConnected, supabaseStatusMsg, recheckSupabase, 
    categories, saveCategory, menuItems, saveMenuItem, deleteMenuItem, 
    addToast, lastSyncedAt, isSyncing, syncDatabaseNow
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subtab 1: CMS View Mode (Theme Customizer vs Catalog)
  const [cmsSubMode, setCmsSubMode] = useState<'theme' | 'catalog'>('theme');
  const [editingCat, setEditingCat] = useState<Partial<Category> | null>(null);
  const [catNameEn, setCatNameEn] = useState('');
  const [catNameTh, setCatNameTh] = useState('');

  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [itemCatId, setItemCatId] = useState('');
  const [itemNameEn, setItemNameEn] = useState('');
  const [itemNameTh, setItemNameTh] = useState('');
  const [itemPrice, setItemPrice] = useState('100');
  const [itemCost, setItemCost] = useState('40');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemStock, setItemStock] = useState('50');
  const [itemReorder, setItemReorder] = useState('10');

  // Subtab 2: Systems
  const [restName, setRestName] = useState(settings.restaurant_name);
  const [vatRate, setVatRate] = useState(settings.tax_rate.toString());
  const [headerNote, setHeaderNote] = useState(settings.receipt_header);
  const [footerNote, setFooterNote] = useState(settings.receipt_footer);
  const [promptPayId, setPromptPayId] = useState(settings.promptpay_id);

  // Subtab 3: PIN
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');

  // Subtab 4: Servers
  const savedCreds = getSavedSupabaseCredentials();
  const [sbUrl, setSbUrl] = useState(savedCreds.url);
  const [sbAnonKey, setSbAnonKey] = useState(savedCreds.anonKey);
  const [isTestingSb, setIsTestingSb] = useState(false);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showInlineSql, setShowInlineSql] = useState(false);

  // Image File Upload Handler
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast('warning', language === 'th' ? 'ขนาดรูปภาพต้องไม่เกิน 5MB' : 'Image size must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setItemImageUrl(reader.result);
        addToast('success', language === 'th' ? 'อัปโหลดรูปภาพสำเร็จ' : 'Image uploaded successfully!');
      }
    };
    reader.readAsDataURL(file);
  };

  // CMS Category Form
  const handleOpenNewCategory = () => {
    setEditingCat({});
    setCatNameEn('');
    setCatNameTh('');
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveCategory({
      ...(editingCat?.id ? { id: editingCat.id } : {}),
      name_en: catNameEn,
      name_th: catNameTh,
      is_active: true,
    });
    setEditingCat(null);
  };

  // CMS Menu Item Form
  const handleOpenNewMenuItem = () => {
    setEditingItem({});
    setItemCatId(categories[0]?.id || '');
    setItemNameEn('');
    setItemNameTh('');
    setItemPrice('150');
    setItemCost('50');
    setItemImageUrl('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80');
    setItemStock('50');
    setItemReorder('10');
  };

  const handleOpenEditMenuItem = (m: MenuItem) => {
    setEditingItem(m);
    setItemCatId(m.category_id);
    setItemNameEn(m.name_en);
    setItemNameTh(m.name_th);
    setItemPrice(m.price.toString());
    setItemCost(m.cost.toString());
    setItemImageUrl(m.image_url);
    setItemStock(m.stock_quantity.toString());
    setItemReorder(m.reorder_level.toString());
  };

  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveMenuItem({
      ...(editingItem?.id ? { id: editingItem.id } : {}),
      category_id: itemCatId || categories[0]?.id || '',
      name_en: itemNameEn,
      name_th: itemNameTh,
      price: Number(itemPrice) || 0,
      cost: Number(itemCost) || 0,
      image_url: itemImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      stock_quantity: Number(itemStock) || 0,
      reorder_level: Number(itemReorder) || 10,
      is_active: true,
    });
    setEditingItem(null);
  };

  // Systems Save
  const handleSaveSystems = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      ...settings,
      restaurant_name: restName,
      tax_rate: isNaN(Number(vatRate)) ? 0 : Number(vatRate),
      receipt_header: headerNote,
      receipt_footer: footerNote,
      promptpay_id: promptPayId,
    });
  };

  // PIN Save
  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPinInput !== masterPin) {
      addToast('error', getTranslation(language, 'incorrectPin'));
      return;
    }
    if (newPinInput.length !== 6) {
      addToast('warning', 'New PIN must be exactly 6 digits');
      return;
    }
    updateMasterPin(newPinInput);
    setCurrentPinInput('');
    setNewPinInput('');
  };

  // Server Credentials Save & Test
  const handleSaveSupabaseCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseCredentials(sbUrl, sbAnonKey);
    setIsTestingSb(true);
    await recheckSupabase();
    setIsTestingSb(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(FULL_SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    addToast('success', getTranslation(language, 'sqlSchemaCopied'));
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([FULL_SUPABASE_SQL_SCHEMA], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supabase_complete_schema_migration.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('success', language === 'th' ? 'ดาวน์โหลดไฟล์ SQL Migration สำเร็จ' : 'Downloaded supabase_complete_schema_migration.sql');
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-100/50 dark:bg-slate-950/50">
      
      {/* Settings Navigation Subtab Header */}
      <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md flex items-center gap-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'cms', labelKey: 'cmsSubmodule', icon: <Layers className="w-4 h-4" /> },
          { id: 'systems', labelKey: 'systemsSubmodule', icon: <Store className="w-4 h-4" /> },
          { id: 'pin', labelKey: 'pinSubmodule', icon: <Lock className="w-4 h-4" /> },
          { id: 'servers', labelKey: 'serversSubmodule', icon: <Database className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSettingsSubTab(tab.id as SettingsSubTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
              settingsSubTab === tab.id
                ? 'bg-slate-900 text-white border-black dark:bg-white dark:text-slate-900 dark:border-white shadow-md'
                : 'border-transparent bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.icon}
            <span>{getTranslation(language, tab.labelKey as Parameters<typeof getTranslation>[1])}</span>
          </button>
        ))}
      </div>

      {/* SUBTAB 1: CMS (Theme Customizer & Catalog Management) */}
      {settingsSubTab === 'cms' && (
        <div className="space-y-6">
          
          {/* CMS Sub-Mode Switcher */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md w-fit">
            <button
              onClick={() => setCmsSubMode('theme')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                cmsSubMode === 'theme'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Website Builder & Theme Customizer</span>
            </button>
            <button
              onClick={() => setCmsSubMode('catalog')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                cmsSubMode === 'catalog'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Menu Catalog & Categories CMS</span>
            </button>
          </div>

          {/* Render Theme Customizer */}
          {cmsSubMode === 'theme' && <CmsSettingsPage />}

          {/* Render Menu Categories & Items CMS */}
          {cmsSubMode === 'catalog' && (
            <div className="space-y-6 animate-fade-in">
              {/* Categories Manager */}
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Menu Categories CMS
                  </h3>
                  <button
                    onClick={handleOpenNewCategory}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 border border-black dark:border-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map(cat => (
                    <div key={cat.id} className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{cat.name_en}</h4>
                        <p className="text-[10px] text-slate-400">{cat.name_th}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Menu Items Manager */}
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Menu Items CMS
                  </h3>
                  <button
                    onClick={handleOpenNewMenuItem}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 border border-black dark:border-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Menu Item</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3">Price</th>
                        <th className="py-2.5 px-3">Cost</th>
                        <th className="py-2.5 px-3">Stock</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                      {menuItems.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-3">
                              <img src={item.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                              <span className="font-bold text-slate-900 dark:text-white">{item.name_en} ({item.name_th})</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">฿{item.price.toFixed(2)}</td>
                          <td className="py-3 px-3 text-slate-400">฿{item.cost.toFixed(2)}</td>
                          <td className="py-3 px-3 font-bold">{item.stock_quantity}</td>
                          <td className="py-3 px-3 text-right space-x-2">
                            <button onClick={() => handleOpenEditMenuItem(item)} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteMenuItem(item.id)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* SUBTAB 2: Systems Settings Form */}
      {settingsSubTab === 'systems' && (
        <form onSubmit={handleSaveSystems} className="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm space-y-5 max-w-xl">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {getTranslation(language, 'systemsSubmodule')}
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {getTranslation(language, 'restaurantName')}
            </label>
            <input
              type="text"
              value={restName}
              onChange={e => setRestName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {getTranslation(language, 'taxRate')}
            </label>
            <input
              type="number"
              value={vatRate}
              onChange={e => setVatRate(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {getTranslation(language, 'promptPayId')}
            </label>
            <input
              type="text"
              value={promptPayId}
              onChange={e => setPromptPayId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {getTranslation(language, 'receiptHeader')}
            </label>
            <input
              type="text"
              value={headerNote}
              onChange={e => setHeaderNote(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {getTranslation(language, 'receiptFooter')}
            </label>
            <input
              type="text"
              value={footerNote}
              onChange={e => setFooterNote(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="py-3 px-6 rounded-2xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 border border-black dark:border-white font-bold text-xs shadow-md transition-all"
          >
            {getTranslation(language, 'save')}
          </button>
        </form>
      )}

      {/* SUBTAB 3: Master PIN Management */}
      {settingsSubTab === 'pin' && (
        <form onSubmit={handleChangePinSubmit} className="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm space-y-4 max-w-md">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {getTranslation(language, 'changePin')}
          </h3>

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-medium">
            Master Security PIN controls unlock screen access. Default preset PIN is <b>260539</b>.
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {getTranslation(language, 'currentPin')}
            </label>
            <input
              type="password"
              maxLength={6}
              value={currentPinInput}
              onChange={e => setCurrentPinInput(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-base font-bold focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {getTranslation(language, 'newPin')}
            </label>
            <input
              type="password"
              maxLength={6}
              value={newPinInput}
              onChange={e => setNewPinInput(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-base font-bold focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 border border-black dark:border-white font-bold text-xs shadow-md transition-all"
          >
            Update Security PIN
          </button>
        </form>
      )}

      {/* SUBTAB 4: Servers / Supabase Database Configuration */}
      {settingsSubTab === 'servers' && (
        <div className="space-y-6 max-w-2xl">
          
          {/* Status Badge Banner */}
          <div className={`p-5 rounded-3xl border flex items-center justify-between ${
            supabaseConnected
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'
          }`}>
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">
                  {supabaseConnected ? 'Supabase Database Connected' : 'Local Persistence Sync Mode'}
                </h4>
                <p className="text-xs opacity-80 mt-0.5">{supabaseStatusMsg}</p>
              </div>
            </div>

            <button
              onClick={() => setShowSqlModal(true)}
              className="px-3.5 py-2 rounded-xl bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 shadow-sm flex items-center gap-1.5 shrink-0 hover:border-black dark:hover:border-white"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{getTranslation(language, 'viewSqlSchema')}</span>
            </button>
          </div>

          {/* Database Sync Controls Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 text-sky-500 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Database Synchronization & Auto-Refresh</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Database automatically updates and refreshes every 3 minutes.
                </p>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                  Last synced: {lastSyncedAt ? lastSyncedAt.toLocaleTimeString() : 'Just now'}
                </p>
              </div>

              <button
                onClick={syncDatabaseNow}
                disabled={isSyncing}
                className="px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-lg shadow-sky-500/20 disabled:opacity-50 flex items-center gap-2 shrink-0 transition-all active:scale-98"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Synchronizing...' : 'Synchronize Database Now'}</span>
              </button>
            </div>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleSaveSupabaseCreds} className="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Supabase Database Credentials
            </h3>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {getTranslation(language, 'supabaseUrl')}
              </label>
              <input
                type="text"
                value={sbUrl}
                onChange={e => setSbUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-medium focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {getTranslation(language, 'supabaseAnonKey')}
              </label>
              <input
                type="password"
                value={sbAnonKey}
                onChange={e => setSbAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-medium focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isTestingSb}
              className="py-3 px-6 rounded-2xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 border border-black dark:border-white disabled:opacity-50 font-bold text-xs shadow-md transition-all"
            >
              {isTestingSb ? 'Testing Connection...' : 'Save & Test Supabase API Connection'}
            </button>
          </form>

          {/* Database Schema & Migration Specification Card */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {language === 'th' ? 'โครงสร้างฐานข้อมูล SQL Schema Migration' : 'Supabase SQL Schema Migration'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {language === 'th' 
                    ? 'สคริปต์โครงสร้างฐานข้อมูลแบบ Clean Production DDL (ไม่มีข้อมูลจำลอง/Seed Data ปะปน)' 
                    : 'Clean Enterprise DDL Migration (Strictly Without Mockup / Seed Data)'}
                </p>
              </div>

              {/* Status Pill: Zero Mockup Guaranteed */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold shrink-0 self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Zero Seed Data (Clean DDL)</span>
              </div>
            </div>

            {/* Architecture Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-400 font-medium">Production Tables</p>
                <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">11 Tables</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-400 font-medium">Security Layer</p>
                <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">Full RLS</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-400 font-medium">Inventory Automation</p>
                <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">Auto Stock</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-400 font-medium">Seed / Mockup</p>
                <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">0 Rows (Clean)</p>
              </div>
            </div>

            {/* 11 Database Tables Breakdown */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>{language === 'th' ? 'ตารางในระบบฐานข้อมูล (11 ตาราง)' : 'Database Tables Covered (11 Tables)'}</span>
                <span className="text-[11px] font-normal text-slate-400">All matching TypeScript models</span>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {SCHEMA_TABLES_INFO.map(table => (
                  <div key={table.name} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 truncate">{table.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          table.category === 'Core' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400' :
                          table.category === 'Sales' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400' :
                          table.category === 'HR' ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400' :
                          table.category === 'Finance' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' :
                          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {table.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{table.description}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {table.columnsCount} cols
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopySql}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSql}
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-400 font-bold text-xs text-slate-700 dark:text-slate-200 shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .sql File</span>
              </button>

              <button
                type="button"
                onClick={() => setShowInlineSql(!showInlineSql)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{showInlineSql ? 'Hide SQL Code' : 'Preview SQL Code'}</span>
                {showInlineSql ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={() => setShowSqlModal(true)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5 ml-auto transition-all"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Expand Modal</span>
              </button>
            </div>

            {/* Collapsible Inline SQL Code Viewer */}
            {showInlineSql && (
              <div className="space-y-2 pt-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-mono text-[11px] text-slate-400">supabase_schema_migration.sql (Clean Production DDL)</span>
                  <button
                    onClick={handleCopySql}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 flex items-center gap-1"
                  >
                    {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSql ? 'Copied' : 'Copy All'}</span>
                  </button>
                </div>
                <pre className="max-h-80 p-4 rounded-2xl bg-slate-950 text-slate-100 text-[11px] font-mono overflow-y-auto leading-relaxed border border-slate-800 select-all scrollbar-thin">
                  {FULL_SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            )}

            {/* 3-Step Setup Instructions */}
            <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 space-y-2">
              <p className="text-xs font-bold text-sky-900 dark:text-sky-200">
                {language === 'th' ? 'วิธีติดตั้ง SQL Schema ใน Supabase' : 'Quick Supabase Migration Guide:'}
              </p>
              <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside leading-relaxed">
                <li>{language === 'th' ? 'เปิดโปรเจกต์ Supabase ของคุณแล้วไปที่เมนู SQL Editor ทางด้านซ้าย' : 'Open your Supabase Project Dashboard and navigate to SQL Editor on the left.'}</li>
                <li>{language === 'th' ? 'คลิก "+ New Query" แล้ววางสคริปต์ SQL ด้านบนลงไป จากนั้นกดปุ่ม "Run"' : 'Click "+ New Query", paste the clean migration script, and click "Run".'}</li>
                <li>{language === 'th' ? 'คัดลอก Project URL และ Anon Key มาใส่ในช่องด้านบน แล้วกดบันทึก' : 'Copy your Project URL and Anon Key into the inputs above and click "Save & Test".'}</li>
              </ol>
            </div>
          </div>

        </div>
      )}

      {/* CMS Modal: Add Category */}
      {editingCat && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <form onSubmit={handleSaveCategory} className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Category</h3>
              <button type="button" onClick={() => setEditingCat(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">English Name</label>
              <input
                type="text"
                value={catNameEn}
                onChange={e => setCatNameEn(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Thai Name</label>
              <input
                type="text"
                value={catNameTh}
                onChange={e => setCatNameTh(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
              />
            </div>

            <button type="submit" className="w-full py-2.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-black dark:border-white font-bold text-xs shadow-md">
              Save Category
            </button>
          </form>
        </div>
      )}

      {/* CMS Modal: Add / Edit Menu Item with Image Upload Feature */}
      {editingItem && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <form onSubmit={handleSaveMenuItem} className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingItem.id ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button type="button" onClick={() => setEditingItem(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
              <select
                value={itemCatId}
                onChange={e => setItemCatId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name_en} ({c.name_th})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">English Name</label>
                <input
                  type="text"
                  value={itemNameEn}
                  onChange={e => setItemNameEn(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Thai Name</label>
                <input
                  type="text"
                  value={itemNameTh}
                  onChange={e => setItemNameTh(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Selling Price (฿)</label>
                <input
                  type="number"
                  value={itemPrice}
                  onChange={e => setItemPrice(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Unit Cost (฿)</label>
                <input
                  type="number"
                  value={itemCost}
                  onChange={e => setItemCost(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                />
              </div>
            </div>

            {/* Menu Item Image Upload Feature */}
            <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Menu Image</span>
                <span className="text-[10px] text-slate-400">Upload file or enter URL</span>
              </label>

              <div className="flex items-center gap-3">
                {itemImageUrl ? (
                  <img
                    src={itemImageUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}

                <div className="flex-1 space-y-1.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 border border-black dark:border-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image File</span>
                  </button>

                  <input
                    type="text"
                    value={itemImageUrl}
                    onChange={e => setItemImageUrl(e.target.value)}
                    placeholder="Or paste image URL"
                    className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-mono focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Initial Stock Qty</label>
                <input
                  type="number"
                  value={itemStock}
                  onChange={e => setItemStock(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reorder Alert Level</label>
                <input
                  type="number"
                  value={itemReorder}
                  onChange={e => setItemReorder(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 border border-black dark:border-white font-bold text-xs shadow-md transition-all"
            >
              Save Menu Item
            </button>
          </form>
        </div>
      )}

      {/* SQL Migration Script Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {language === 'th' ? 'สคริปต์โครงสร้างฐานข้อมูล Supabase PostgreSQL (11 ตาราง)' : 'Supabase PostgreSQL Schema Migration (11 Tables)'}
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    Clean Production DDL • ZERO Mockup / Seed Data Included
                  </span>
                </div>
              </div>
              <button onClick={() => setShowSqlModal(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'th'
                ? 'คัดลอกหรือดาวน์โหลดสคริปต์นี้ไปรันใน Supabase SQL Editor เพื่อสร้าง 11 ตารางหลัก (รวม HR และ Salary Payroll), ทริกเกอร์ตัดสต็อกอัตโนมัติ, ทริกเกอร์ Audit Log, อินเด็กซ์ และ RLS Policies โดยไม่มีข้อมูลจำลองใดๆ'
                : 'Copy or download this complete migration script and run it in your Supabase SQL Editor to initialize all 11 core tables (including HR & Salary Payroll), auto-stock triggers, audit logging triggers, indexes, and RLS policies with zero dummy records.'}
            </p>

            <pre className="flex-1 min-h-[300px] p-4 rounded-2xl bg-slate-950 text-slate-100 text-xs font-mono overflow-y-auto leading-relaxed border border-slate-800 select-all scrollbar-thin">
              {FULL_SUPABASE_SQL_SCHEMA}
            </pre>

            <div className="flex flex-wrap justify-between items-center gap-2 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySql}
                  className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 border border-black dark:border-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
                >
                  {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                </button>

                <button
                  onClick={handleDownloadSql}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .sql</span>
                </button>
              </div>

              <button onClick={() => setShowSqlModal(false)} className="py-2.5 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
