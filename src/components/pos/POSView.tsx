import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../lib/i18n';
import { MenuItem } from '../../types';
import { CartPanel } from './CartPanel';
import { 
  Search, LayoutGrid, List, Plus, AlertCircle, 
  CheckCircle2, Flame, RefreshCw 
} from 'lucide-react';

export const POSView: React.FC = () => {
  const { categories, menuItems, addToCart, language, refreshData } = useApp();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredItems = menuItems.filter(item => {
    if (!item.is_active) return false;
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = item.name_en.toLowerCase().includes(q) || item.name_th.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 h-full flex flex-col lg:flex-row overflow-hidden bg-slate-100/50 dark:bg-slate-950/50">
      
      {/* Left Menu Selection Stage */}
      <div className="flex-1 h-full flex flex-col overflow-hidden p-4 sm:p-6 space-y-4">
        
        {/* Top Control Bar (Search, View Mode Toggle, Refresh) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={getTranslation(language, 'searchMenu')}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/50 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all border ${
                  viewMode === 'grid'
                    ? 'bg-slate-900 text-white border-black dark:bg-white dark:text-slate-900 dark:border-white shadow-sm'
                    : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title={getTranslation(language, 'gridView')}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all border ${
                  viewMode === 'list'
                    ? 'bg-slate-900 text-white border-black dark:bg-white dark:text-slate-900 dark:border-white shadow-sm'
                    : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title={getTranslation(language, 'listView')}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Refresh Sync Button */}
            <button
              onClick={() => refreshData()}
              className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100 text-slate-600 dark:text-slate-300 transition-colors shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Category Horizontal Filter Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white border-black dark:bg-white dark:text-slate-900 dark:border-white shadow-md'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800/60 hover:border-black dark:hover:border-white'
            }`}
          >
            {getTranslation(language, 'allCategories')} ({menuItems.length})
          </button>

          {categories.map(cat => {
            const count = menuItems.filter(m => m.category_id === cat.id && m.is_active).length;
            const isSel = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSel
                    ? 'bg-slate-900 text-white border-black dark:bg-white dark:text-slate-900 dark:border-white shadow-md'
                    : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-800/60 hover:border-black dark:hover:border-white'
                }`}
              >
                {language === 'th' ? cat.name_th : cat.name_en} ({count})
              </button>
            );
          })}
        </div>

        {/* Menu Items Container */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400">
              <AlertCircle className="w-10 h-10 stroke-1 mb-2 opacity-40" />
              <p className="text-sm font-medium">{getTranslation(language, 'noData')}</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredItems.map(item => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map(item => (
                <MenuItemRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Right Interactive Order Cart Slide-over Panel */}
      <CartPanel />

    </div>
  );
};

/* Component: Menu Item Card (Grid View) */
const MenuItemCard: React.FC<{ item: MenuItem }> = ({ item }) => {
  const { addToCart, language } = useApp();
  const isOut = item.stock_quantity <= 0;
  const isLow = item.stock_quantity > 0 && item.stock_quantity <= item.reorder_level;

  return (
    <div
      onClick={() => !isOut && addToCart(item, 1)}
      className={`group relative rounded-3xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-black dark:hover:border-white transition-all duration-300 cursor-pointer flex flex-col justify-between ${
        isOut ? 'opacity-60 grayscale' : 'active:scale-98'
      }`}
    >
      <div>
        {/* Card Image Stage */}
        <div className="relative h-32 sm:h-36 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            src={item.image_url}
            alt={item.name_en}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Price Badge */}
          <div className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-white text-xs font-extrabold tracking-tight border border-white/10 shadow-md">
            ฿{item.price.toFixed(2)}
          </div>

          {/* Low Stock or Out Badge */}
          {isOut ? (
            <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider shadow">
              {getTranslation(language, 'outOfStock')}
            </div>
          ) : isLow ? (
            <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-lg bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider shadow flex items-center gap-1">
              <Flame className="w-3 h-3" />
              <span>Stock: {item.stock_quantity}</span>
            </div>
          ) : null}
        </div>

        {/* Card Details */}
        <div className="p-3.5 space-y-1">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-black dark:group-hover:text-white transition-colors">
            {language === 'th' ? item.name_th : item.name_en}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {language === 'th' ? item.name_en : item.name_th}
          </p>
        </div>
      </div>

      {/* Card Action Button */}
      <div className="px-3.5 pb-3.5">
        <button
          onClick={e => {
            e.stopPropagation();
            if (!isOut) addToCart(item, 1);
          }}
          disabled={isOut}
          className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 border border-transparent hover:border-black dark:hover:border-white text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{getTranslation(language, 'addToCart')}</span>
        </button>
      </div>

    </div>
  );
};

/* Component: Menu Item Row (List View) */
const MenuItemRow: React.FC<{ item: MenuItem }> = ({ item }) => {
  const { addToCart, language } = useApp();
  const isOut = item.stock_quantity <= 0;

  return (
    <div
      onClick={() => !isOut && addToCart(item, 1)}
      className={`p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-4 hover:border-black dark:hover:border-white shadow-sm transition-all cursor-pointer ${
        isOut ? 'opacity-50 grayscale' : 'active:scale-99'
      }`}
    >
      <div className="flex items-center gap-3">
        <img
          src={item.image_url}
          alt={item.name_en}
          className="w-12 h-12 rounded-xl object-cover"
        />
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            {language === 'th' ? item.name_th : item.name_en}
          </h3>
          <p className="text-xs text-slate-400">Stock: {item.stock_quantity} units</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm font-extrabold text-slate-900 dark:text-white">
          ฿{item.price.toFixed(2)}
        </span>
        <button
          onClick={e => {
            e.stopPropagation();
            if (!isOut) addToCart(item, 1);
          }}
          disabled={isOut}
          className="p-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 border border-black dark:border-white font-bold hover:bg-black transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
