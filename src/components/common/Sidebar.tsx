import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../lib/i18n';
import { NavTab } from '../../types';
import { 
  ShoppingCart, Store, LayoutDashboard, Package, 
  Users, Receipt, FileText, Settings, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { getThemeClasses } from '../../lib/themeClasses';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, language, cmsSettings } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const theme = getThemeClasses(cmsSettings.theme);
  const sidebarConf = cmsSettings.sidebar || { position: 'left', width: 'default', collapseOnMobile: true };

  // Calculate dynamic width based on CMS configuration
  const getExpandedWidthClass = () => {
    switch (sidebarConf.width) {
      case 'narrow':
        return 'w-48';
      case 'wide':
        return 'w-72';
      case 'default':
      default:
        return 'w-60';
    }
  };

  const isRight = sidebarConf.position === 'right';
  const borderClass = isRight ? 'border-l' : 'border-r';
  const mobileClass = sidebarConf.collapseOnMobile ? 'hidden sm:flex' : 'flex';

  const navItems: { id: NavTab; icon: React.ReactNode; labelKey: Parameters<typeof getTranslation>[1] }[] = [
    { id: 'pos', icon: <ShoppingCart className="w-5 h-5" />, labelKey: 'pos' },
    { id: 'shift', icon: <Store className="w-5 h-5" />, labelKey: 'shift' },
    { id: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" />, labelKey: 'dashboard' },
    { id: 'inventory', icon: <Package className="w-5 h-5" />, labelKey: 'inventory' },
    { id: 'hr', icon: <Users className="w-5 h-5" />, labelKey: 'hr' },
    { id: 'accounting', icon: <Receipt className="w-5 h-5" />, labelKey: 'accounting' },
    { id: 'audit', icon: <FileText className="w-5 h-5" />, labelKey: 'audit' },
    { id: 'settings', icon: <Settings className="w-5 h-5" />, labelKey: 'settings' },
  ];

  return (
    <aside
      className={`sticky top-16 h-[calc(100vh-4rem)] z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md ${borderClass} border-slate-200/70 dark:border-slate-800/80 ${mobileClass} flex-col justify-between transition-all duration-300 ${
        collapsed ? 'w-16' : getExpandedWidthClass()
      }`}
    >
      {/* Navigation List */}
      <div className="p-3 space-y-1.5 overflow-y-auto">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                // On mobile, auto-collapse
                if (window.innerWidth < 768) {
                  setCollapsed(true);
                }
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 ${theme.buttonRadius} font-bold text-xs sm:text-sm transition-all duration-200 group relative border ${
                isActive
                  ? `${theme.bg} text-white border-transparent shadow-lg shadow-sky-500/20 dark:shadow-none`
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={collapsed ? getTranslation(language, item.labelKey) : undefined}
            >
              <div className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                {item.icon}
              </div>
              {!collapsed && (
                <span className="truncate tracking-tight">{getTranslation(language, item.labelKey)}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse Toggle Button */}
      <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/50">
        <button
          onClick={() => setCollapsed(prev => !prev)}
          className={`w-full flex items-center justify-center p-2.5 ${theme.buttonRadius} bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors`}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isRight ? (
            collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : (
            collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
};

