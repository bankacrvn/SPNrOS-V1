import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../lib/i18n';
import { AccountingTransaction } from '../../types';
import { 
  Receipt, Plus, ArrowUpRight, ArrowDownRight, 
  Search, Filter, X, Target, CheckCircle2, Clock, 
  CreditCard, DollarSign, Edit3, Building, TrendingUp, TrendingDown
} from 'lucide-react';

export const AccountingManagement: React.FC = () => {
  const { 
    accounting, addAccountingTx, updateAccountingTx, orders, employees, 
    menuItems, settings, updateSettings, language, addToast 
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'bill' | 'loan'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [txType, setTxType] = useState<'income' | 'expense' | 'bill' | 'loan'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Rent & Utilities');
  const [description, setDescription] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [interestRate, setInterestRate] = useState('4.5');

  // Edit Targets Modal state
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [incomeTargetInput, setIncomeTargetInput] = useState((settings.monthly_income_target || 150000).toString());
  const [expenseTargetInput, setExpenseTargetInput] = useState((settings.monthly_expense_target || 50000).toString());

  // Calculations for Monthly Summary & Targets
  const posRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.net_amount, 0);

  const totalJournalIncome = accounting
    .filter(a => a.type === 'income')
    .reduce((sum, a) => sum + a.amount, 0);

  const totalIncome = posRevenue + totalJournalIncome;

  const totalJournalExpense = accounting
    .filter(a => a.type === 'expense' || (a.type === 'bill' && a.status === 'paid') || (a.type === 'loan' && a.status === 'paid'))
    .reduce((sum, a) => sum + a.amount, 0);

  const totalSalaryCost = employees
    .filter(e => e.status === 'active')
    .reduce((sum, e) => sum + (e.salary || 0), 0);

  const totalExpense = totalJournalExpense + totalSalaryCost;

  const totalInventoryCost = menuItems
    .reduce((sum, item) => sum + (item.cost * item.stock_quantity), 0);

  const totalUpcomingBilled = accounting
    .filter(a => (a.type === 'bill' || a.type === 'loan') && a.status === 'pending')
    .reduce((sum, a) => sum + a.amount, 0);

  const totalNetPL = totalIncome - totalExpense;

  // Targets
  const incomeTarget = settings.monthly_income_target || 150000;
  const expenseTarget = settings.monthly_expense_target || 50000;
  const incomePct = Math.min(100, Math.round((totalIncome / incomeTarget) * 100));
  const expensePct = Math.min(200, Math.round((totalExpense / expenseTarget) * 100));

  // Filtered Transactions
  const filteredTx = accounting.filter(a => {
    const matchesType = filterType === 'all' || a.type === filterType;
    const q = searchQuery.toLowerCase();
    const matchesQuery = a.category.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
    return matchesType && matchesQuery;
  });

  const handleSaveTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addAccountingTx({
      type: txType,
      amount: Number(amount) || 0,
      category,
      description,
      transaction_date: txDate,
      due_date: (txType === 'bill' || txType === 'loan') ? dueDate : undefined,
      loan_interest_rate: txType === 'loan' ? Number(interestRate) : undefined,
      status: (txType === 'bill' || txType === 'loan') ? 'pending' : 'paid',
    });
    setShowAddModal(false);
    setAmount('');
    setDescription('');
  };

  const handleMarkAsPaid = async (tx: AccountingTransaction) => {
    await updateAccountingTx({
      ...tx,
      status: 'paid',
    });
  };

  const handleSaveTargetsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      ...settings,
      monthly_income_target: Number(incomeTargetInput) || 150000,
      monthly_expense_target: Number(expenseTargetInput) || 50000,
    });
    setShowTargetModal(false);
    addToast('success', language === 'th' ? 'อัปเดตเป้าหมายรายเดือนเรียบร้อย' : 'Monthly financial targets updated');
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-100/50 dark:bg-slate-950/50">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {getTranslation(language, 'accountingTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              General Ledger, Bills to Pay, Loan Liabilities & Target Analytics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIncomeTargetInput(incomeTarget.toString());
              setExpenseTargetInput(expenseTarget.toString());
              setShowTargetModal(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 font-bold text-xs shadow-sm flex items-center gap-2 transition-all"
          >
            <Target className="w-4 h-4 text-sky-500" />
            <span>Edit Target Budget</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 border border-black dark:border-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{getTranslation(language, 'recordTransaction')}</span>
          </button>
        </div>
      </div>

      {/* Target Budget Cards (Interactive - Click card to Edit) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Income Target Card */}
        <div 
          onClick={() => {
            setIncomeTargetInput(incomeTarget.toString());
            setExpenseTargetInput(expenseTarget.toString());
            setShowTargetModal(true);
          }}
          className="group cursor-pointer p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 border border-emerald-500/20 dark:border-emerald-500/30 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
              <TrendingUp className="w-4 h-4" />
              <span>Monthly Revenue Target</span>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform flex items-center gap-1">
              <Edit3 className="w-3 h-3" /> Click to Edit
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                ฿{totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Target: <span className="font-bold text-slate-700 dark:text-slate-300">฿{incomeTarget.toLocaleString('en-US')}</span>
              </p>
            </div>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {incomePct}%
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, incomePct)}%` }}
            />
          </div>
        </div>

        {/* Expense Target Card */}
        <div 
          onClick={() => {
            setIncomeTargetInput(incomeTarget.toString());
            setExpenseTargetInput(expenseTarget.toString());
            setShowTargetModal(true);
          }}
          className="group cursor-pointer p-6 rounded-3xl bg-gradient-to-br from-rose-500/10 via-white to-white dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900 border border-rose-500/20 dark:border-rose-500/30 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-extrabold text-xs uppercase tracking-wider">
              <TrendingDown className="w-4 h-4" />
              <span>Monthly Expense Budget</span>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform flex items-center gap-1">
              <Edit3 className="w-3 h-3" /> Click to Edit
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">
                ฿{totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Max Budget Limit: <span className="font-bold text-slate-700 dark:text-slate-300">฿{expenseTarget.toLocaleString('en-US')}</span>
              </p>
            </div>
            <span className={`text-2xl font-black ${expensePct > 100 ? 'text-rose-500' : 'text-sky-500'}`}>
              {expensePct}%
            </span>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full transition-all duration-500 ${expensePct > 100 ? 'bg-rose-500' : 'bg-sky-500'}`} 
              style={{ width: `${Math.min(100, expensePct)}%` }}
            />
          </div>
        </div>

      </div>

      {/* Monthly Summary Cards (6-Grid Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* 1. Total Income */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
            <span>Total Income</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
            ฿{totalIncome.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-slate-400">POS Sales + Income</p>
        </div>

        {/* 2. Total Expense */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
            <span>Total Expense</span>
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-lg font-extrabold text-rose-500">
            ฿{totalExpense.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-slate-400">Expenses + Payroll</p>
        </div>

        {/* 3. Total Salary */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
            <span>Total Salary</span>
            <Building className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
            ฿{totalSalaryCost.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-slate-400">Active Payroll</p>
        </div>

        {/* 4. Total Inventory Cost */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
            <span>Inventory Cost</span>
            <DollarSign className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
            ฿{totalInventoryCost.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-slate-400">Stock Asset Value</p>
        </div>

        {/* 5. Total Upcoming Billed */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
            <span>Upcoming Bills</span>
            <Clock className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
            ฿{totalUpcomingBilled.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-slate-400">Unpaid / Loans</p>
        </div>

        {/* 6. Total Net PL */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold">
            <span>Total P&L</span>
            <Receipt className="w-4 h-4 text-sky-500" />
          </div>
          <p className={`text-lg font-extrabold ${totalNetPL >= 0 ? 'text-sky-600 dark:text-sky-400' : 'text-rose-500'}`}>
            ฿{totalNetPL.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-slate-400">Net Operational P&L</p>
        </div>

      </div>

      {/* Ledger & Bills Table */}
      <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative max-w-md flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={getTranslation(language, 'search')}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'income'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'expense'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400'
              }`}
            >
              Expense
            </button>
            <button
              onClick={() => setFilterType('bill')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'bill'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400'
              }`}
            >
              Bills to Pay
            </button>
            <button
              onClick={() => setFilterType('loan')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === 'loan'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
              }`}
            >
              Loans & Liabilities
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                <th className="py-3 px-4">Date / Due Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400">
                    {getTranslation(language, 'noData')}
                  </td>
                </tr>
              ) : (
                filteredTx.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      <div>{tx.transaction_date}</div>
                      {tx.due_date && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                          Due: {tx.due_date}
                        </div>
                      )}
                    </td>
                    
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                        tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 
                        tx.type === 'expense' ? 'bg-rose-500/10 text-rose-500' :
                        tx.type === 'bill' ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-500'
                      }`}>
                        {tx.type === 'bill' ? 'Bill to Pay' : tx.type === 'loan' ? 'Loan' : tx.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {tx.category}
                      {tx.loan_interest_rate ? <span className="text-[10px] font-mono text-slate-400 ml-1">({tx.loan_interest_rate}% Interest)</span> : null}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">{tx.description || '-'}</td>

                    <td className="py-3.5 px-4">
                      {tx.status === 'pending' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Paid
                        </span>
                      )}
                    </td>

                    <td className={`py-3.5 px-4 text-right font-extrabold ${
                      tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}฿{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {tx.status === 'pending' ? (
                        <button
                          onClick={() => handleMarkAsPaid(tx)}
                          className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 border border-black dark:border-white text-[11px] font-bold shadow-sm transition-all"
                        >
                          Mark as Paid
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Record Transaction / Bill / Loan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <form onSubmit={handleSaveTransactionSubmit} className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Record Entry / Bill / Loan
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type Selector Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setTxType('income')}
                className={`py-2 rounded-xl transition-all ${
                  txType === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                + Income
              </button>
              <button
                type="button"
                onClick={() => setTxType('expense')}
                className={`py-2 rounded-xl transition-all ${
                  txType === 'expense' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                - Expense
              </button>
              <button
                type="button"
                onClick={() => setTxType('bill')}
                className={`py-2 rounded-xl transition-all ${
                  txType === 'bill' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Bill to Pay
              </button>
              <button
                type="button"
                onClick={() => setTxType('loan')}
                className={`py-2 rounded-xl transition-all ${
                  txType === 'loan' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Loan
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Amount (฿)</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="15000"
                required
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {txType === 'loan' ? 'Lender / Financial Institution' : 'Category / Vendor'}
              </label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder={txType === 'loan' ? 'Bangkok Bank SME Credit' : 'Utility, Supplies, Lease, Taxes'}
                required
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Details or reference number"
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none"
              />
            </div>

            {(txType === 'bill' || txType === 'loan') && (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none"
                  />
                </div>
                {txType === 'loan' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={interestRate}
                      onChange={e => setInterestRate(e.target.value)}
                      placeholder="4.5"
                      className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Transaction Date</label>
              <input
                type="date"
                value={txDate}
                onChange={e => setTxDate(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 border border-black dark:border-white font-bold text-xs shadow-md transition-all"
            >
              Save Financial Record
            </button>

          </form>
        </div>
      )}

      {/* Edit Targets Modal */}
      {showTargetModal && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <form onSubmit={handleSaveTargetsSubmit} className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-sky-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Monthly Targets Configuration
                </h3>
              </div>
              <button type="button" onClick={() => setShowTargetModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Monthly Income Target (฿)
              </label>
              <input
                type="number"
                value={incomeTargetInput}
                onChange={e => setIncomeTargetInput(e.target.value)}
                placeholder="150000"
                required
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-rose-600 dark:text-rose-400">
                Monthly Expense Budget Target (฿)
              </label>
              <input
                type="number"
                value={expenseTargetInput}
                onChange={e => setExpenseTargetInput(e.target.value)}
                placeholder="50000"
                required
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 border border-black dark:border-white font-bold text-xs shadow-md transition-all"
            >
              Update Targets
            </button>

          </form>
        </div>
      )}

    </div>
  );
};
