import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getTranslation } from '../../lib/i18n';
import { Employee, SalaryPayrollRecord } from '../../types';
import { 
  Users, UserPlus, Clock, CheckCircle2, 
  DollarSign, Calendar, Search, Filter,
  Phone, Mail, Building2, MoreHorizontal,
  Edit, Trash2, ArrowUpRight, ArrowDownRight,
  Receipt, CreditCard, ShieldCheck, Check,
  Sparkles, ChevronRight
} from 'lucide-react';
import { StaffDetailModal } from './StaffDetailModal';
import { SalaryPayrollModal } from './SalaryPayrollModal';

export const HRManagement: React.FC = () => {
  const { 
    employees, 
    payrollRecords, 
    clockInEmployee, 
    clockOutEmployee, 
    language 
  } = useApp();

  // Active view tab
  const [activeTab, setActiveTab] = useState<'roster' | 'payroll'>('roster');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('All');

  // Modal states
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] = useState<Employee | null>(null);

  const [payrollModalOpen, setPayrollModalOpen] = useState(false);
  const [selectedPayrollForModal, setSelectedPayrollForModal] = useState<SalaryPayrollRecord | null>(null);
  const [defaultEmpForPayroll, setDefaultEmpForPayroll] = useState<Employee | null>(null);

  // Stats
  const activeStaffCount = employees.filter(e => e.status !== 'terminated').length;
  const onDutyCount = employees.filter(e => !!e.clock_in && !e.clock_out).length;
  const totalMonthlyBaseSalary = employees
    .filter(e => e.status === 'active')
    .reduce((sum, e) => sum + (e.salary || 0), 0);
  const totalPayrollPaid = payrollRecords
    .filter(p => p.payment_status === 'paid')
    .reduce((sum, p) => sum + (p.net_salary || 0), 0);

  // Departments list for filter
  const departments = useMemo(() => {
    const set = new Set<string>();
    employees.forEach(e => {
      if (e.department) set.add(e.department);
    });
    return ['All', ...Array.from(set)];
  }, [employees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchSearch = 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.nickname && emp.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
        emp.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.phone && emp.phone.includes(searchQuery));
      const matchDept = selectedDepartment === 'All' || emp.department === selectedDepartment;
      return matchSearch && matchDept;
    });
  }, [employees, searchQuery, selectedDepartment]);

  // Filtered payroll records
  const filteredPayroll = useMemo(() => {
    return payrollRecords.filter(rec => {
      const matchSearch = 
        rec.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rec.pay_period.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPeriod = selectedPeriod === 'All' || rec.pay_period === selectedPeriod;
      return matchSearch && matchPeriod;
    });
  }, [payrollRecords, searchQuery, selectedPeriod]);

  // Available Pay Periods
  const payPeriods = useMemo(() => {
    const set = new Set<string>();
    payrollRecords.forEach(p => set.add(p.pay_period));
    return ['All', ...Array.from(set)];
  }, [payrollRecords]);

  // Open Add Employee
  const handleOpenAddStaff = () => {
    setSelectedEmployeeForModal(null);
    setStaffModalOpen(true);
  };

  // Open Edit Employee
  const handleOpenEditStaff = (emp: Employee) => {
    setSelectedEmployeeForModal(emp);
    setStaffModalOpen(true);
  };

  // Open Payroll for a specific employee
  const handleOpenPayrollForEmployee = (emp: Employee) => {
    setSelectedPayrollForModal(null);
    setDefaultEmpForPayroll(emp);
    setPayrollModalOpen(true);
  };

  // Open Add New Payroll (Generic)
  const handleOpenAddPayroll = () => {
    setSelectedPayrollForModal(null);
    setDefaultEmpForPayroll(null);
    setPayrollModalOpen(true);
  };

  // Open Edit Payroll
  const handleOpenEditPayroll = (rec: SalaryPayrollRecord) => {
    setSelectedPayrollForModal(rec);
    setDefaultEmpForPayroll(null);
    setPayrollModalOpen(true);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-100/50 dark:bg-slate-950/50">
      
      {/* Top Banner & Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-bold shadow-md">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {getTranslation(language, 'hrTitle')}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
                Staff & Payroll
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'th' 
                ? 'ระบบบริหารจัดการบุคลากร ทะเบียนพนักงาน และการเบิกจ่ายเงินเดือน' 
                : 'Enterprise staff directory, time tracking & monthly salary payroll management'}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleOpenAddPayroll}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <DollarSign className="w-4 h-4" />
            <span>{language === 'th' ? 'สร้างสลิปเงินเดือน' : 'Process Payroll'}</span>
          </button>

          <button
            onClick={handleOpenAddStaff}
            className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-slate-900 border border-black dark:border-white font-bold text-xs shadow-md flex items-center gap-2 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>{getTranslation(language, 'addEmployee')}</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Staff */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {language === 'th' ? 'พนักงานทั้งหมด' : 'Active Staff'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {activeStaffCount} <span className="text-xs font-normal text-slate-400">{language === 'th' ? 'คน' : 'staff'}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {employees.length} {language === 'th' ? 'รวมในระบบ' : 'total registered in roster'}
          </p>
        </div>

        {/* KPI 2: On Duty Now */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {language === 'th' ? 'เข้าเวร / ทำงานอยู่' : 'Currently On Duty'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-2">
            <span>{onDutyCount}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {Math.round((onDutyCount / (activeStaffCount || 1)) * 100)}% {language === 'th' ? 'ของกำลังพล' : 'shift coverage'}
          </p>
        </div>

        {/* KPI 3: Monthly Base Payroll */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {language === 'th' ? 'ฐานเงินเดือนรวม/เดือน' : 'Base Payroll Obligation'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            ฿{totalMonthlyBaseSalary.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {language === 'th' ? 'เฉลี่ย ฿' + Math.round(totalMonthlyBaseSalary / (activeStaffCount || 1)).toLocaleString() + ' / คน' : 'Estimated recurring cost'}
          </p>
        </div>

        {/* KPI 4: Total Disbursed */}
        <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {language === 'th' ? 'ยอดจ่ายเงินเดือนแล้ว' : 'Total Disbursed Payroll'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            ฿{totalPayrollPaid.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {payrollRecords.length} {language === 'th' ? 'สลิปเงินเดือนที่บันทึก' : 'payroll records filed'}
          </p>
        </div>
      </div>

      {/* Main View Mode Selector (Sub-Tabs) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex p-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'roster'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{language === 'th' ? 'ทำเนียบพนักงาน & ลงเวลา' : 'Staff Directory & Time Clock'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {employees.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'payroll'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>{language === 'th' ? 'การจ่ายเงินเดือน & สลิป' : 'Salary Payroll & Slips'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {payrollRecords.length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'roster' 
              ? (language === 'th' ? 'ค้นหาชื่อ, ตำแหน่ง, เบอร์โทร...' : 'Search staff name, position, phone...')
              : (language === 'th' ? 'ค้นหาสลิปเงินเดือน, งวด...' : 'Search payroll slips, staff, period...')}
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20 shadow-sm"
          />
        </div>
      </div>

      {/* VIEW 1: STAFF DIRECTORY & TIME CLOCK */}
      {activeTab === 'roster' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Department Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>Dept:</span>
            </span>
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedDepartment === dept
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Staff Roster Table */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden backdrop-blur-md">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {getTranslation(language, 'employeeRoster')}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'th' ? 'คลิกที่พนักงานเพื่อดูรายละเอียด หรือจัดการเงินเดือน' : 'Click on any staff to view master detail or disburse salary'}
                </p>
              </div>

              <span className="text-xs text-slate-400 font-mono">
                Showing {filteredEmployees.length} of {employees.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase bg-slate-50/50 dark:bg-slate-950/50">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Department & Role</th>
                    <th className="py-3 px-4">Base Salary</th>
                    <th className="py-3 px-4">Duty Status</th>
                    <th className="py-3 px-4">Clock Times</th>
                    <th className="py-3 px-4">Contact & Bank</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="font-bold">No staff members found matching criteria</p>
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map(emp => {
                      const isOnDuty = !!emp.clock_in && !emp.clock_out;

                      return (
                        <tr 
                          key={emp.id} 
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                        >
                          {/* Staff Name & ID */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                                {emp.name.slice(0, 2)}
                              </div>
                              <div>
                                <button
                                  onClick={() => handleOpenEditStaff(emp)}
                                  className="font-bold text-slate-900 dark:text-white hover:text-sky-500 dark:hover:text-sky-400 text-left transition-colors"
                                >
                                  {emp.name}
                                  {emp.nickname && (
                                    <span className="ml-1 text-slate-400 font-normal">({emp.nickname})</span>
                                  )}
                                </button>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  ID: {emp.id.slice(-6)}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Dept & Position */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900 dark:text-slate-200">
                              {emp.position}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {emp.department || 'General Service'}
                            </div>
                          </td>

                          {/* Base Salary */}
                          <td className="py-3.5 px-4 font-bold font-mono text-sky-600 dark:text-sky-400">
                            ฿{(emp.salary || 0).toLocaleString()}
                            <span className="text-[10px] text-slate-400 font-normal">/mo</span>
                          </td>

                          {/* Duty Status */}
                          <td className="py-3.5 px-4">
                            {isOnDuty ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                {getTranslation(language, 'onDuty')}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-400">
                                {getTranslation(language, 'offDuty')}
                              </span>
                            )}
                          </td>

                          {/* Clock In / Out Times */}
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            {emp.clock_in ? (
                              <div>
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">IN: </span>
                                {new Date(emp.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            ) : '-'}
                            {emp.clock_out && (
                              <div>
                                <span className="text-slate-400 font-bold">OUT: </span>
                                {new Date(emp.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </td>

                          {/* Contact & Banking */}
                          <td className="py-3.5 px-4 text-[11px] text-slate-500 dark:text-slate-400">
                            {emp.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-slate-400" />
                                <span>{emp.phone}</span>
                              </div>
                            )}
                            {emp.bank_name && (
                              <div className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                                {emp.bank_name.split(' ')[0]}: {emp.bank_account || emp.promptpay_id || 'N/A'}
                              </div>
                            )}
                          </td>

                          {/* Actions: Time Clock & Manage & Pay */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Clock In/Out Toggle */}
                              {isOnDuty ? (
                                <button
                                  onClick={() => clockOutEmployee(emp.id)}
                                  title="Clock Out Staff"
                                  className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white font-bold text-xs transition-colors"
                                >
                                  {getTranslation(language, 'clockOut')}
                                </button>
                              ) : (
                                <button
                                  onClick={() => clockInEmployee(emp.id)}
                                  title="Clock In Staff"
                                  className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white font-bold text-xs transition-colors"
                                >
                                  {getTranslation(language, 'clockIn')}
                                </button>
                              )}

                              {/* Pay Salary Shortcut */}
                              <button
                                onClick={() => handleOpenPayrollForEmployee(emp)}
                                title="Run Salary Payroll for this Staff"
                                className="px-2.5 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500 text-sky-600 hover:text-white font-bold text-xs transition-colors flex items-center gap-1"
                              >
                                <DollarSign className="w-3 h-3" />
                                <span>Pay</span>
                              </button>

                              {/* Edit Staff Profile */}
                              <button
                                onClick={() => handleOpenEditStaff(emp)}
                                title="View & Edit Staff Profile"
                                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SALARY PAYROLL & SLIPS */}
      {activeTab === 'payroll' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Period Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5" />
              <span>Period:</span>
            </span>
            {payPeriods.map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedPeriod === period
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Payroll Ledger Table */}
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden backdrop-blur-md">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {language === 'th' ? 'รายการบัญชีจ่ายเงินเดือน (Payroll Records)' : 'Disbursed Wage Slips & Records'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'th' ? 'รายการจ่ายค่าจ้าง โอที และการหักประกันสังคมที่บันทึกไว้' : 'Historical records of staff compensation, tax withholdings and payments'}
                </p>
              </div>

              <button
                onClick={handleOpenAddPayroll}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>{language === 'th' ? 'เพิ่มรายการเงินเดือน' : 'New Payroll Entry'}</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase bg-slate-50/50 dark:bg-slate-950/50">
                    <th className="py-3 px-4">Slip ID & Period</th>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Base Salary</th>
                    <th className="py-3 px-4">OT & Allowances</th>
                    <th className="py-3 px-4">Deductions</th>
                    <th className="py-3 px-4">Net Wage</th>
                    <th className="py-3 px-4">Disbursement</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-700 dark:text-slate-300">
                  {filteredPayroll.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Receipt className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        <p className="font-bold">No payroll records found for this period</p>
                        <button
                          onClick={handleOpenAddPayroll}
                          className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                        >
                          Generate First Payroll Slip
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredPayroll.map(rec => {
                      const isPaid = rec.payment_status === 'paid';
                      const isApproved = rec.payment_status === 'approved';

                      return (
                        <tr 
                          key={rec.id} 
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* Slip ID & Period */}
                          <td className="py-3.5 px-4 font-mono">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {rec.pay_period}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              #{rec.id.slice(-8)}
                            </div>
                          </td>

                          {/* Staff Name & Position */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {rec.employee_name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {rec.position} • {rec.department || 'Service'}
                            </div>
                          </td>

                          {/* Base Salary */}
                          <td className="py-3.5 px-4 font-mono font-semibold">
                            ฿{rec.base_salary.toLocaleString()}
                          </td>

                          {/* OT & Allowances */}
                          <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400">
                            <div>+฿{(rec.overtime_pay + rec.allowances + rec.bonus).toLocaleString()}</div>
                            <div className="text-[10px] text-slate-400">
                              {rec.overtime_hours > 0 ? `OT: ${rec.overtime_hours}h` : 'No OT'}
                            </div>
                          </td>

                          {/* Deductions */}
                          <td className="py-3.5 px-4 font-mono text-rose-500">
                            <div>-฿{rec.total_deductions.toLocaleString()}</div>
                            <div className="text-[10px] text-slate-400">
                              SS: ฿{rec.social_security}
                            </div>
                          </td>

                          {/* Net Wage (Hero) */}
                          <td className="py-3.5 px-4 font-mono font-black text-sm text-sky-600 dark:text-sky-400">
                            ฿{rec.net_salary.toLocaleString()}
                          </td>

                          {/* Status & Method */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                                isPaid
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : isApproved
                                    ? 'bg-sky-500/10 text-sky-600 border border-sky-500/20'
                                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              }`}>
                                {rec.payment_status}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 uppercase">
                                {rec.payment_method}
                              </span>
                            </div>
                            {rec.paid_at && (
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Paid {new Date(rec.paid_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleOpenEditPayroll(rec)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                            >
                              {language === 'th' ? 'ดู / แก้ไข' : 'View / Edit'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Staff Master Detail Modal */}
      <StaffDetailModal
        isOpen={staffModalOpen}
        employee={selectedEmployeeForModal}
        onClose={() => {
          setStaffModalOpen(false);
          setSelectedEmployeeForModal(null);
        }}
      />

      {/* MODAL 2: Salary Payroll Calculation & Disbursement Modal */}
      <SalaryPayrollModal
        isOpen={payrollModalOpen}
        payrollRecord={selectedPayrollForModal}
        defaultEmployee={defaultEmpForPayroll}
        onClose={() => {
          setPayrollModalOpen(false);
          setSelectedPayrollForModal(null);
          setDefaultEmpForPayroll(null);
        }}
      />

    </div>
  );
};
