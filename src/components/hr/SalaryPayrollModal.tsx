import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee, SalaryPayrollRecord } from '../../types';
import { 
  X, DollarSign, Calculator, Receipt, 
  CheckCircle2, CreditCard, Calendar, User, 
  Building2, AlertCircle, ArrowDownRight, ArrowUpRight,
  Printer, Check, Trash2
} from 'lucide-react';

interface SalaryPayrollModalProps {
  payrollRecord?: SalaryPayrollRecord | null;
  defaultEmployee?: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SalaryPayrollModal: React.FC<SalaryPayrollModalProps> = ({
  payrollRecord,
  defaultEmployee,
  isOpen,
  onClose,
}) => {
  const { 
    employees, 
    savePayrollRecord, 
    deletePayrollRecord, 
    addToast, 
    language 
  } = useApp();

  const isEdit = !!payrollRecord?.id;

  // Selected Employee ID
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  
  // Pay Period
  const [payPeriod, setPayPeriod] = useState<string>('September 2026');

  // Earnings
  const [baseSalary, setBaseSalary] = useState<number>(22000);
  const [otHours, setOtHours] = useState<number>(0);
  const [otRate, setOtRate] = useState<number>(150);
  const [allowances, setAllowances] = useState<number>(1000);
  const [bonus, setBonus] = useState<number>(0);

  // Deductions
  const [taxDeduction, setTaxDeduction] = useState<number>(0);
  const [socialSecurity, setSocialSecurity] = useState<number>(750);
  const [otherDeductions, setOtherDeductions] = useState<number>(0);

  // Status & Method
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'promptpay' | 'cash'>('bank_transfer');
  const [paymentStatus, setPaymentStatus] = useState<'draft' | 'approved' | 'paid'>('paid');
  const [postToAccounting, setPostToAccounting] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Initialize or populate form
  useEffect(() => {
    if (payrollRecord) {
      setSelectedEmpId(payrollRecord.employee_id);
      setPayPeriod(payrollRecord.pay_period);
      setBaseSalary(payrollRecord.base_salary);
      setOtHours(payrollRecord.overtime_hours);
      setOtRate(payrollRecord.overtime_rate);
      setAllowances(payrollRecord.allowances);
      setBonus(payrollRecord.bonus);
      setTaxDeduction(payrollRecord.tax_deduction);
      setSocialSecurity(payrollRecord.social_security);
      setOtherDeductions(payrollRecord.other_deductions);
      setPaymentMethod(payrollRecord.payment_method);
      setPaymentStatus(payrollRecord.payment_status);
      setNotes(payrollRecord.notes || '');
      setPostToAccounting(payrollRecord.payment_status === 'paid');
    } else if (defaultEmployee) {
      setSelectedEmpId(defaultEmployee.id);
      setBaseSalary(defaultEmployee.salary || 22000);
      const calculatedOtRate = defaultEmployee.hourly_rate || Math.round((defaultEmployee.salary || 22000) / 30 / 8 * 1.5);
      setOtRate(calculatedOtRate);
      setOtHours(0);
      setAllowances(1000);
      setBonus(0);
      setTaxDeduction(0);
      // Thai Social Security standard: 5% of base salary capped at 750 THB
      const calcSS = Math.min(750, Math.round((defaultEmployee.salary || 22000) * 0.05));
      setSocialSecurity(calcSS);
      setOtherDeductions(0);
      setPaymentMethod(defaultEmployee.promptpay_id ? 'promptpay' : 'bank_transfer');
      setPaymentStatus('paid');
      setPostToAccounting(true);
      setNotes('');
    } else if (employees.length > 0) {
      const first = employees[0];
      setSelectedEmpId(first.id);
      setBaseSalary(first.salary || 22000);
      setOtRate(first.hourly_rate || Math.round((first.salary || 22000) / 30 / 8 * 1.5));
      setOtHours(0);
      setAllowances(1000);
      setBonus(0);
      setTaxDeduction(0);
      setSocialSecurity(Math.min(750, Math.round((first.salary || 22000) * 0.05)));
      setOtherDeductions(0);
      setPaymentMethod('bank_transfer');
      setPaymentStatus('paid');
      setPostToAccounting(true);
      setNotes('');
    }
    setShowDeleteConfirm(false);
  }, [payrollRecord, defaultEmployee, employees, isOpen]);

  // Handle Employee Change
  const handleEmployeeChange = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setBaseSalary(emp.salary || 22000);
      const calculatedOtRate = emp.hourly_rate || Math.round((emp.salary || 22000) / 30 / 8 * 1.5);
      setOtRate(calculatedOtRate);
      const calcSS = Math.min(750, Math.round((emp.salary || 22000) * 0.05));
      setSocialSecurity(calcSS);
      if (emp.promptpay_id) {
        setPaymentMethod('promptpay');
      } else if (emp.bank_account) {
        setPaymentMethod('bank_transfer');
      }
    }
  };

  const selectedEmployee = employees.find(e => e.id === selectedEmpId);

  // Computations
  const otPay = Math.round(otHours * otRate);
  const grossPay = Math.round(baseSalary + otPay + allowances + bonus);
  const totalDeductions = Math.round(taxDeduction + socialSecurity + otherDeductions);
  const netSalary = Math.max(0, grossPay - totalDeductions);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !selectedEmployee) {
      addToast('error', 'Please select an employee');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Partial<SalaryPayrollRecord> = {
        ...(payrollRecord?.id ? { id: payrollRecord.id } : {}),
        employee_id: selectedEmployee.id,
        employee_name: selectedEmployee.name,
        position: selectedEmployee.position,
        department: selectedEmployee.department,
        pay_period: payPeriod,
        base_salary: baseSalary,
        overtime_hours: otHours,
        overtime_rate: otRate,
        overtime_pay: otPay,
        allowances,
        bonus,
        gross_pay: grossPay,
        tax_deduction: taxDeduction,
        social_security: socialSecurity,
        other_deductions: otherDeductions,
        total_deductions: totalDeductions,
        net_salary: netSalary,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        bank_name: selectedEmployee.bank_name,
        bank_account: selectedEmployee.bank_account,
        paid_at: paymentStatus === 'paid' ? new Date().toISOString() : undefined,
        notes,
      };

      await savePayrollRecord(payload, postToAccounting);
      onClose();
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to save salary payroll entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!payrollRecord?.id) return;
    try {
      setIsSubmitting(true);
      await deletePayrollRecord(payrollRecord.id);
      onClose();
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to delete payroll record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const PERIOD_OPTIONS = [
    'September 2026',
    'August 2026',
    'July 2026',
    'October 2026'
  ];

  return (
    <div className="fixed inset-0 z-[8500] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl my-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEdit 
                  ? (language === 'th' ? 'แก้ไขรายการเงินเดือน & สลิปเงินเดือน' : 'Edit Payroll Record')
                  : (language === 'th' ? 'สร้างรายการจ่ายเงินเดือน (Salary & Payroll)' : 'Generate Staff Salary & Payroll')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'th' 
                  ? 'คำนวณเงินเดือน โอที เบี้ยเลี้ยง ประกันสังคม และตัดจ่ายบัญชี'
                  : 'Automated wage calculation, allowances, social security & accounting posting'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* 1. Employee Selection & Period */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-500" />
                <span>{language === 'th' ? 'เลือกพนักงาน *' : 'Select Employee *'}</span>
              </label>
              <select
                value={selectedEmpId}
                onChange={e => handleEmployeeChange(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.position} - {emp.department || 'General'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-500" />
                <span>{language === 'th' ? 'งวดการจ่ายเงินเดือน' : 'Payroll Period'}</span>
              </label>
              <select
                value={payPeriod}
                onChange={e => setPayPeriod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                {PERIOD_OPTIONS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Earnings Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4" />
                <span>{language === 'th' ? 'รายการรายรับ / รายได้ (Earnings)' : 'Earnings & Allowances'}</span>
              </span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                Gross: ฿{grossPay.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Base Salary */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {language === 'th' ? 'เงินเดือนพื้นฐาน (Base Salary ฿)' : 'Base Salary (฿)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={baseSalary}
                  onChange={e => setBaseSalary(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-900 dark:text-white outline-none"
                />
              </div>

              {/* Overtime */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                  <span>{language === 'th' ? 'ค่าล่วงเวลา (OT)' : 'Overtime (OT)'}</span>
                  <span className="text-[10px] text-emerald-500 font-mono">+฿{otPay.toLocaleString()}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="Hours"
                      value={otHours || ''}
                      onChange={e => setOtHours(Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-900 dark:text-white outline-none"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">hrs</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      placeholder="Rate ฿/h"
                      value={otRate || ''}
                      onChange={e => setOtRate(Number(e.target.value))}
                      className="w-full px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-900 dark:text-white outline-none"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">฿/h</span>
                  </div>
                </div>
              </div>

              {/* Allowances */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {language === 'th' ? 'เบี้ยเลี้ยง / ค่าเดินทาง / ค่าครองชีพ (฿)' : 'Allowances / Transportation (฿)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={allowances}
                  onChange={e => setAllowances(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-900 dark:text-white outline-none"
                />
              </div>

              {/* Bonus / Tips */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {language === 'th' ? 'โบนัส / ทิปรวมพิเศษ (฿)' : 'Bonus / Special Tip Share (฿)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={bonus}
                  onChange={e => setBonus(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3. Deductions Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                <ArrowDownRight className="w-4 h-4" />
                <span>{language === 'th' ? 'รายการหักเงิน (Deductions)' : 'Deductions & Social Security'}</span>
              </span>
              <span className="text-xs font-mono font-bold text-rose-500">
                Total: -฿{totalDeductions.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Social Security */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {language === 'th' ? 'ประกันสังคม (5%)' : 'Social Security'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const ss = Math.min(750, Math.round(baseSalary * 0.05));
                      setSocialSecurity(ss);
                    }}
                    className="text-[10px] text-sky-500 font-bold hover:underline"
                  >
                    Auto 5%
                  </button>
                </div>
                <input
                  type="number"
                  min="0"
                  value={socialSecurity}
                  onChange={e => setSocialSecurity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-900 dark:text-white outline-none"
                />
              </div>

              {/* Tax WHT */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {language === 'th' ? 'ภาษีหัก ณ ที่จ่าย' : 'Tax Deduction (WHT)'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={taxDeduction}
                  onChange={e => setTaxDeduction(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-900 dark:text-white outline-none"
                />
              </div>

              {/* Other Deductions */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {language === 'th' ? 'หักอื่นๆ (ขาด/ลา/สาย)' : 'Other Deductions'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={otherDeductions}
                  onChange={e => setOtherDeductions(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono text-slate-900 dark:text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* 4. Net Salary Hero Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-xl shadow-sky-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                {language === 'th' ? 'เงินเดือนสุทธิที่ต้องจ่าย (Net Payable Salary)' : 'Net Payable Wage'}
              </span>
              <div className="text-3xl sm:text-4xl font-black tracking-tight font-mono">
                ฿{netSalary.toLocaleString()}
              </div>
              <p className="text-[11px] text-white/70 mt-1">
                Gross ฿{grossPay.toLocaleString()} - Deductions ฿{totalDeductions.toLocaleString()}
              </p>
            </div>

            {selectedEmployee && (
              <div className="text-right sm:border-l sm:border-white/20 sm:pl-5 space-y-1 text-xs">
                <div className="font-bold">{selectedEmployee.name}</div>
                <div className="text-white/80">{selectedEmployee.position} • {selectedEmployee.department || 'Service'}</div>
                <div className="text-[11px] text-white/70 font-mono">
                  {selectedEmployee.bank_name || 'Bank'}: {selectedEmployee.bank_account || selectedEmployee.promptpay_id || 'Cash'}
                </div>
              </div>
            )}
          </div>

          {/* 5. Payment Details & Auto-Post Checkbox */}
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === 'th' ? 'ช่องทางการจ่ายเงิน' : 'Payment Method'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      paymentMethod === 'bank_transfer'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-black dark:border-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('promptpay')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      paymentMethod === 'promptpay'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-black dark:border-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    PromptPay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      paymentMethod === 'cash'
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-black dark:border-white'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Cash
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === 'th' ? 'สถานะการจ่ายเงิน' : 'Disbursement Status'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('draft')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      paymentStatus === 'draft'
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('approved')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      paymentStatus === 'approved'
                        ? 'bg-sky-500 text-white border-sky-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Approved
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus('paid')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      paymentStatus === 'paid'
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Paid
                  </button>
                </div>
              </div>
            </div>

            {/* Accounting Sync Checkbox */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-4 h-4 text-sky-500" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {language === 'th' ? 'บันทึกค่าใช้จ่ายลงบัญชีทันที (Accounting Ledger)' : 'Post Expense to Accounting Ledger'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {language === 'th' 
                      ? 'บันทึกรายการจ่ายเงินเดือน ฿' + netSalary.toLocaleString() + ' เข้าหมวด Payroll Expense อัตโนมัติ'
                      : 'Automatically creates an accounting expense entry under Staff Payroll'}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={postToAccounting}
                onChange={e => setPostToAccounting(e.target.checked)}
                className="w-5 h-5 rounded-lg text-sky-600 focus:ring-sky-500 accent-sky-500"
              />
            </div>
          </div>

          {/* Delete Option if editing */}
          {isEdit && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1.5 rounded-xl text-rose-500 hover:bg-rose-500/10 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'th' ? 'ลบรายการเงินเดือนนี้' : 'Delete Payroll Record'}</span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    {language === 'th' 
                      ? 'คุณแน่ใจหรือไม่ที่จะลบรายการเงินเดือนนี้?' 
                      : 'Are you sure you want to delete this payroll record?'}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      {isSubmitting ? 'Deleting...' : (language === 'th' ? 'ยืนยันการลบ' : 'Confirm Delete')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
                    >
                      {language === 'th' ? 'ยกเลิก' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {language === 'th' ? 'ปิด' : 'Close'}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 border border-black dark:border-white font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>
                {isSubmitting 
                  ? 'Saving...' 
                  : (isEdit 
                      ? (language === 'th' ? 'บันทึกการแก้ไข' : 'Save Changes') 
                      : (paymentStatus === 'paid' 
                          ? (language === 'th' ? 'จ่ายเงินเดือนและบันทึก' : 'Disburse & Record Payroll')
                          : (language === 'th' ? 'บันทึกรายการเงินเดือน' : 'Save Payroll Record')))}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
