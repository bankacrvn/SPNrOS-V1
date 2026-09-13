import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../lib/i18n';
import { AuditLog } from '../../types';
import { FileText, Search, Eye, X, Lock, Download, Printer } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs, orders, accounting, employees, shifts, settings, language } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [viewDetailLog, setViewDetailLog] = useState<AuditLog | null>(null);

  // PDF Export Modal State
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [reportType, setReportType] = useState<'receipt' | 'payment' | 'pl'>('receipt');
  const [reportTimeframe, setReportTimeframe] = useState<'daily' | 'monthly'>('monthly');

  const modulesList = ['POS', 'Shift', 'Inventory', 'HR', 'Accounting', 'Settings', 'Auth'];

  const filteredLogs = auditLogs.filter(log => {
    const matchesModule = selectedModule === 'all' || log.module === selectedModule;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      log.action.toLowerCase().includes(q) || 
      log.performed_by.toLowerCase().includes(q) ||
      JSON.stringify(log.details).toLowerCase().includes(q);
    return matchesModule && matchesSearch;
  });

  // Print PDF Generator
  const handleGeneratePdf = () => {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      alert('Please allow popups to generate and view PDF reports.');
      return;
    }

    const todayStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const titleText = 
      reportType === 'receipt' ? `${reportTimeframe === 'daily' ? 'Daily' : 'Monthly'} Receipt Audit Report` :
      reportType === 'payment' ? `${reportTimeframe === 'daily' ? 'Daily' : 'Monthly'} Payment & Shift Summary Report` :
      `${reportTimeframe === 'daily' ? 'Daily' : 'Monthly'} Profit & Loss (P&L) Summary Report`;

    // Data calculations
    const posRevenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.net_amount, 0);
    const taxTotal = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.tax_amount || 0), 0);
    const cashTotal = orders.filter(o => o.status === 'completed' && o.payment_method === 'cash').reduce((sum, o) => sum + o.net_amount, 0);
    const cardTotal = orders.filter(o => o.status === 'completed' && o.payment_method === 'credit_card').reduce((sum, o) => sum + o.net_amount, 0);
    const qrTotal = orders.filter(o => o.status === 'completed' && o.payment_method === 'promptpay').reduce((sum, o) => sum + o.net_amount, 0);

    const journalIncome = accounting.filter(a => a.type === 'income').reduce((sum, a) => sum + a.amount, 0);
    const journalExpense = accounting.filter(a => a.type === 'expense' || a.status === 'paid').reduce((sum, a) => sum + a.amount, 0);
    const payrollCost = employees.filter(e => e.status === 'active').reduce((sum, e) => sum + (e.salary || 0), 0);
    const totalIncome = posRevenue + journalIncome;
    const totalExpense = journalExpense + payrollCost;
    const netPL = totalIncome - totalExpense;

    let tableContentHtml = '';

    if (reportType === 'receipt') {
      tableContentHtml = `
        <h3 style="margin-top:20px; font-size:14px;">Customer Receipts Summary</h3>
        <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:12px;">
          <thead>
            <tr style="background:#f1f5f9; border-bottom:2px solid #cbd5e1;">
              <th style="padding:8px; text-align:left;">Order #</th>
              <th style="padding:8px; text-align:left;">Table / Ref</th>
              <th style="padding:8px; text-align:left;">Date & Time</th>
              <th style="padding:8px; text-align:left;">Payment</th>
              <th style="padding:8px; text-align:right;">Net Amount</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(o => `
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:8px;"><strong>${o.order_number}</strong></td>
                <td style="padding:8px;">${o.table_number}</td>
                <td style="padding:8px;">${new Date(o.created_at).toLocaleString()}</td>
                <td style="padding:8px; text-transform:uppercase;">${o.payment_method}</td>
                <td style="padding:8px; text-align:right;">฿${o.net_amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top:15px; text-align:right; font-size:13px; font-weight:bold;">
          <p>Total Completed Orders: ${orders.length}</p>
          <p>VAT Tax Collected (0% Default): ฿${taxTotal.toFixed(2)}</p>
          <p style="font-size:16px; color:#0f172a;">Total Sales Revenue: ฿${posRevenue.toFixed(2)}</p>
        </div>
      `;
    } else if (reportType === 'payment') {
      tableContentHtml = `
        <h3 style="margin-top:20px; font-size:14px;">Payment Method & Cashier Breakdown</h3>
        <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:12px;">
          <thead>
            <tr style="background:#f1f5f9; border-bottom:2px solid #cbd5e1;">
              <th style="padding:8px; text-align:left;">Channel</th>
              <th style="padding:8px; text-align:left;">Transaction Count</th>
              <th style="padding:8px; text-align:right;">Total Volume</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:8px;"><strong>Cash Payments</strong></td>
              <td style="padding:8px;">${orders.filter(o => o.payment_method === 'cash').length}</td>
              <td style="padding:8px; text-align:right;">฿${cashTotal.toFixed(2)}</td>
            </tr>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:8px;"><strong>Credit Card Payments</strong></td>
              <td style="padding:8px;">${orders.filter(o => o.payment_method === 'credit_card').length}</td>
              <td style="padding:8px; text-align:right;">฿${cardTotal.toFixed(2)}</td>
            </tr>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:8px;"><strong>PromptPay QR Payments</strong></td>
              <td style="padding:8px;">${orders.filter(o => o.payment_method === 'promptpay').length}</td>
              <td style="padding:8px; text-align:right;">฿${qrTotal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <h3 style="margin-top:25px; font-size:14px;">Cashier Shift History</h3>
        <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:12px;">
          <thead>
            <tr style="background:#f1f5f9; border-bottom:2px solid #cbd5e1;">
              <th style="padding:8px; text-align:left;">Opened At</th>
              <th style="padding:8px; text-align:left;">Cashier</th>
              <th style="padding:8px; text-align:right;">Start Cash</th>
              <th style="padding:8px; text-align:right;">System Sales</th>
              <th style="padding:8px; text-align:right;">Variance</th>
            </tr>
          </thead>
          <tbody>
            ${shifts.map(s => `
              <tr style="border-bottom:1px solid #e2e8f0;">
                <td style="padding:8px;">${new Date(s.opened_at).toLocaleString()}</td>
                <td style="padding:8px;">${s.cashier_name}</td>
                <td style="padding:8px; text-align:right;">฿${s.start_cash.toFixed(2)}</td>
                <td style="padding:8px; text-align:right;">฿${(s.system_sales || 0).toFixed(2)}</td>
                <td style="padding:8px; text-align:right; font-weight:bold; color:${(s.variance || 0) < 0 ? '#e11d48' : '#059669'};">
                  ฿${(s.variance || 0).toFixed(2)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      tableContentHtml = `
        <h3 style="margin-top:20px; font-size:14px;">Profit & Loss Statement (P&L)</h3>
        <table style="width:100%; border-collapse:collapse; margin-top:10px; font-size:13px;">
          <tbody>
            <tr style="border-bottom:1px solid #e2e8f0; background:#f8fafc;">
              <td style="padding:10px;"><strong>1. POS Sales Revenue</strong></td>
              <td style="padding:10px; text-align:right; font-weight:bold; color:#059669;">+฿${posRevenue.toFixed(2)}</td>
            </tr>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:10px;"><strong>2. Other Income Journal</strong></td>
              <td style="padding:10px; text-align:right; font-weight:bold; color:#059669;">+฿${journalIncome.toFixed(2)}</td>
            </tr>
            <tr style="border-bottom:2px solid #0f172a; background:#f1f5f9;">
              <td style="padding:10px;"><strong>TOTAL OPERATING REVENUE</strong></td>
              <td style="padding:10px; text-align:right; font-size:15px; font-weight:black; color:#059669;">฿${totalIncome.toFixed(2)}</td>
            </tr>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:10px;"><strong>3. Operating Expenses & Bills</strong></td>
              <td style="padding:10px; text-align:right; font-weight:bold; color:#e11d48;">-฿${journalExpense.toFixed(2)}</td>
            </tr>
            <tr style="border-bottom:1px solid #e2e8f0;">
              <td style="padding:10px;"><strong>4. Employee Payroll Expenses</strong></td>
              <td style="padding:10px; text-align:right; font-weight:bold; color:#e11d48;">-฿${payrollCost.toFixed(2)}</td>
            </tr>
            <tr style="border-bottom:2px solid #0f172a; background:#f1f5f9;">
              <td style="padding:10px;"><strong>TOTAL OPERATING EXPENSE</strong></td>
              <td style="padding:10px; text-align:right; font-size:15px; font-weight:black; color:#e11d48;">฿${totalExpense.toFixed(2)}</td>
            </tr>
            <tr style="background:#e0f2fe;">
              <td style="padding:12px; font-size:16px;"><strong>NET PROFIT / LOSS</strong></td>
              <td style="padding:12px; text-align:right; font-size:18px; font-weight:black; color:${netPL >= 0 ? '#0284c7' : '#e11d48'};">
                ฿${netPL.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top:25px; padding:15px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px;">
          <p style="margin:0 0 5px 0; font-size:12px; font-weight:bold;">Monthly Budget Targets vs Actual Performance:</p>
          <p style="margin:0; font-size:12px;">Income Target: ฿${(settings.monthly_income_target || 150000).toLocaleString()} | Actual: ฿${totalIncome.toLocaleString()} (${Math.round((totalIncome / (settings.monthly_income_target || 150000)) * 100)}% Target Achieved)</p>
          <p style="margin:5px 0 0 0; font-size:12px;">Expense Target: ฿${(settings.monthly_expense_target || 50000).toLocaleString()} | Actual: ฿${totalExpense.toLocaleString()} (${Math.round((totalExpense / (settings.monthly_expense_target || 50000)) * 100)}% Budget Used)</p>
        </div>
      `;
    }

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${titleText}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
          body { font-family: 'Sarabun', sans-serif; padding: 30px; color: #1e293b; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
          .logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a; }
          .sublogo { font-size: 11px; color: #64748b; }
          .meta { text-align: right; font-size: 11px; color: #475569; }
          .footer { margin-top: 50px; display: flex; justify-content: space-between; text-align: center; font-size: 11px; color: #64748b; }
          .sig-box { width: 200px; border-top: 1px solid #94a3b8; padding-top: 5px; margin-top: 40px; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div className="header" style="display:flex; justify-between; border-bottom:2px solid #0f172a; padding-bottom:12px;">
          <div>
            <div class="logo">${settings.restaurant_name} — SPN rOS</div>
            <div class="sublogo">Enterprise ERP & Financial Audit System</div>
          </div>
          <div class="meta">
            <div><strong>Report:</strong> ${titleText}</div>
            <div><strong>Date Generated:</strong> ${todayStr}</div>
            <div><strong>Tax ID / Reg:</strong> 0105562819001</div>
          </div>
        </div>

        ${tableContentHtml}

        <div class="footer">
          <div>
            <div class="sig-box">Prepared By (Cashier/Staff)</div>
          </div>
          <div>
            <div class="sig-box">Audited & Approved By (Manager)</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 500);
          };
        </script>
      </body>
      </html>
    `;

    reportWindow.document.write(fullHtml);
    reportWindow.document.close();
    setShowPdfModal(false);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-100/50 dark:bg-slate-950/50">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {getTranslation(language, 'auditTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {getTranslation(language, 'auditSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPdfModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 border border-black dark:border-white font-bold text-xs shadow-md flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export to PDF Reports</span>
          </button>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
            <Lock className="w-3.5 h-3.5" />
            <span>Immutable Audit</span>
          </div>
        </div>
      </div>

      {/* Filter and Log Table */}
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

          {/* Module Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedModule('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedModule === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              All Modules
            </button>
            {modulesList.map(m => (
              <button
                key={m}
                onClick={() => setSelectedModule(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedModule === m
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Performed By</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400">
                    {getTranslation(language, 'noData')}
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {log.module}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {log.action}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {log.performed_by}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setViewDetailLog(log)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors"
                        title={getTranslation(language, 'viewDetails')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Export to PDF Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-slate-900 dark:text-white" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Export Financial & Audit PDF
                </h3>
              </div>
              <button onClick={() => setShowPdfModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Report Type</label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setReportType('receipt')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    reportType === 'receipt'
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <p className="font-bold text-xs">Daily / Monthly Receipt Report</p>
                  <p className="text-[10px] opacity-70">Order breakdown, tax invoice total, customer receipt audit</p>
                </button>

                <button
                  type="button"
                  onClick={() => setReportType('payment')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    reportType === 'payment'
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <p className="font-bold text-xs">Payment & Cashier Shift Report</p>
                  <p className="text-[10px] opacity-70">Cash, Credit Card, PromptPay QR breakdown & drawer variance</p>
                </button>

                <button
                  type="button"
                  onClick={() => setReportType('pl')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    reportType === 'pl'
                      ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <p className="font-bold text-xs">Profit & Loss (P&L) Summary Report</p>
                  <p className="text-[10px] opacity-70">Operating revenue, expenses, payroll cost, net margin & targets</p>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Report Timeframe</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReportTimeframe('daily')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    reportTimeframe === 'daily'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Daily Summary
                </button>
                <button
                  type="button"
                  onClick={() => setReportTimeframe('monthly')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    reportTimeframe === 'monthly'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Monthly Summary
                </button>
              </div>
            </div>

            <button
              onClick={handleGeneratePdf}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 border border-black dark:border-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Generate & Print PDF Report</span>
            </button>

          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {viewDetailLog && (
        <div className="fixed inset-0 z-[8000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {getTranslation(language, 'viewDetails')}
              </h3>
              <button onClick={() => setViewDetailLog(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-medium">
              <div className="flex justify-between">
                <span className="text-slate-400">Action:</span>
                <span className="font-bold text-slate-900 dark:text-white">{viewDetailLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Module:</span>
                <span className="font-bold">{viewDetailLog.module}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span>{new Date(viewDetailLog.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500">Parameters (JSON)</label>
              <pre className="p-3 rounded-2xl bg-slate-950 text-emerald-400 text-xs font-mono overflow-x-auto max-h-48">
                {JSON.stringify(viewDetailLog.details, null, 2)}
              </pre>
            </div>

            <button
              onClick={() => setViewDetailLog(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
