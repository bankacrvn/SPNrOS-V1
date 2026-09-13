import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../lib/i18n';
import { MenuItem } from '../../types';
import { 
  Package, Search, Plus, Minus, AlertTriangle, 
  TrendingUp, TrendingDown, RefreshCw, X, Edit2 
} from 'lucide-react';

export const InventoryManagement: React.FC = () => {
  const { menuItems, saveMenuItem, categories, language, logAudit } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all');

  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');
  const [adjustReason, setAdjustReason] = useState('Stock Receive');

  const filteredItems = menuItems.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = item.name_en.toLowerCase().includes(q) || item.name_th.toLowerCase().includes(q);
    
    if (filterStatus === 'low') return matchesSearch && item.stock_quantity > 0 && item.stock_quantity <= item.reorder_level;
    if (filterStatus === 'out') return matchesSearch && item.stock_quantity <= 0;
    return matchesSearch;
  });

  const handleConfirmStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const newStock = adjustType === 'add'
      ? selectedItem.stock_quantity + Number(adjustQty)
      : Math.max(0, selectedItem.stock_quantity - Number(adjustQty));

    await saveMenuItem({
      ...selectedItem,
      stock_quantity: newStock,
    });

    logAudit('ADJUST_STOCK', 'Inventory', {
      item_id: selectedItem.id,
      item_name: selectedItem.name_en,
      old_stock: selectedItem.stock_quantity,
      new_stock: newStock,
      adjustment_type: adjustType,
      reason: adjustReason,
    });

    setSelectedItem(null);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-100/50 dark:bg-slate-950/50">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {getTranslation(language, 'inventoryTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {menuItems.length} Total Inventory & Menu Stock Items
            </p>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setFilterStatus('low')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'low'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400'
            }`}
          >
            Low Stock ({menuItems.filter(m => m.stock_quantity > 0 && m.stock_quantity <= m.reorder_level).length})
          </button>
          <button
            onClick={() => setFilterStatus('out')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterStatus === 'out'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400'
            }`}
          >
            Out of Stock ({menuItems.filter(m => m.stock_quantity <= 0).length})
          </button>
        </div>
      </div>

      {/* Main Stock Table Container */}
      <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
        
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={getTranslation(language, 'search')}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none"
          />
        </div>

        {/* Stock Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4">Margin %</th>
                <th className="py-3 px-4">In Stock</th>
                <th className="py-3 px-4">Reorder Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
              {filteredItems.map(item => {
                const category = categories.find(c => c.id === item.category_id);
                const margin = item.price > 0 ? (((item.price - item.cost) / item.price) * 100).toFixed(1) : '0';
                const isOut = item.stock_quantity <= 0;
                const isLow = item.stock_quantity > 0 && item.stock_quantity <= item.reorder_level;

                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img src={item.image_url} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {language === 'th' ? item.name_th : item.name_en}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {language === 'th' ? item.name_en : item.name_th}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {category ? (language === 'th' ? category.name_th : category.name_en) : 'General'}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      ฿{item.price.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      ฿{item.cost.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-500">
                      {margin}%
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-sm">
                      {item.stock_quantity}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {item.reorder_level}
                    </td>

                    <td className="py-3.5 px-4">
                      {isOut ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-rose-500/10 text-rose-500">
                          {getTranslation(language, 'outOfStock')}
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-amber-500/10 text-amber-500 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500">
                          In Stock
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setAdjustQty(10);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 border border-black dark:border-white font-bold text-xs transition-colors shadow-sm"
                      >
                        Adjust Stock
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <form onSubmit={handleConfirmStockAdjustment} className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Adjust Inventory Stock
              </h3>
              <button type="button" onClick={() => setSelectedItem(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 flex items-center gap-3">
              <img src={selectedItem.image_url} alt="" className="w-10 h-10 rounded-xl object-cover" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {language === 'th' ? selectedItem.name_th : selectedItem.name_en}
                </h4>
                <p className="text-[11px] text-slate-500">Current Stock: {selectedItem.stock_quantity}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('add')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  adjustType === 'add'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                + Receive Stock
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('subtract')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  adjustType === 'subtract'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                - Waste / Deduct
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Quantity</label>
              <input
                type="number"
                min={1}
                value={adjustQty}
                onChange={e => setAdjustQty(Number(e.target.value) || 0)}
                required
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Reason</label>
              <input
                type="text"
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
                placeholder="e.g. Supplier delivery / Damaged"
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 border border-black dark:border-white font-bold text-xs shadow-md transition-all"
            >
              Confirm Stock Adjustment
            </button>

          </form>
        </div>
      )}

    </div>
  );
};
