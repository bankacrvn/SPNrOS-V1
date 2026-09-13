import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';
import { 
  X, User, Phone, Mail, Building2, DollarSign, 
  CreditCard, Calendar, FileText, AlertCircle, 
  Trash2, Check, ShieldCheck, HeartPulse
} from 'lucide-react';

interface StaffDetailModalProps {
  employee?: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (savedEmployee: Employee) => void;
}

const DEPARTMENTS = ['Kitchen', 'Service', 'Bar', 'Management', 'Cleaning', 'Logistics'];
const POSITIONS = [
  'Head Chef', 'Sous Chef', 'Line Cook', 'Pastry Chef', 'Kitchen Hand',
  'Floor Manager', 'Supervisor', 'Head Server', 'Server', 'Host / Hostess', 'Cashier',
  'Head Bartender', 'Bartender', 'Barista',
  'General Manager', 'Assistant Manager', 'Accountant', 'HR Officer',
  'Dishwasher', 'Cleaner'
];
const THAI_BANKS = [
  'Kasikorn Bank (KBank)',
  'Siam Commercial Bank (SCB)',
  'Bangkok Bank (BBL)',
  'Krungthai Bank (KTB)',
  'TMBThanachart Bank (ttb)',
  'Bank of Ayudhya (Krungsri)',
  'Government Savings Bank (GSB)',
  'PromptPay QR'
];

export const StaffDetailModal: React.FC<StaffDetailModalProps> = ({
  employee,
  isOpen,
  onClose,
  onSaved
}) => {
  const { saveEmployee, deleteEmployee, addToast, language } = useApp();

  const isEdit = !!employee?.id;

  // Form State
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    nickname: '',
    position: 'Server',
    department: 'Service',
    salary: 22000,
    hourly_rate: 100,
    phone: '',
    email: '',
    national_id: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    bank_name: 'Kasikorn Bank (KBank)',
    bank_account: '',
    promptpay_id: '',
    hire_date: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'active',
  });

  const [activeTab, setActiveTab] = useState<'general' | 'compensation' | 'contact' | 'emergency'>('general');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        nickname: employee.nickname || '',
        position: employee.position || 'Server',
        department: employee.department || 'Service',
        salary: employee.salary ?? 22000,
        hourly_rate: employee.hourly_rate ?? 100,
        phone: employee.phone || '',
        email: employee.email || '',
        national_id: employee.national_id || '',
        address: employee.address || '',
        emergency_contact: employee.emergency_contact || '',
        emergency_phone: employee.emergency_phone || '',
        bank_name: employee.bank_name || 'Kasikorn Bank (KBank)',
        bank_account: employee.bank_account || '',
        promptpay_id: employee.promptpay_id || '',
        hire_date: employee.hire_date || new Date().toISOString().split('T')[0],
        notes: employee.notes || '',
        status: employee.status || 'active',
      });
    } else {
      setFormData({
        name: '',
        nickname: '',
        position: 'Server',
        department: 'Service',
        salary: 22000,
        hourly_rate: 100,
        phone: '',
        email: '',
        national_id: '',
        address: '',
        emergency_contact: '',
        emergency_phone: '',
        bank_name: 'Kasikorn Bank (KBank)',
        bank_account: '',
        promptpay_id: '',
        hire_date: new Date().toISOString().split('T')[0],
        notes: '',
        status: 'active',
      });
    }
    setShowDeleteConfirm(false);
    setActiveTab('general');
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      addToast('error', language === 'th' ? 'กรุณากรอกชื่อพนักงาน' : 'Staff full name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: Partial<Employee> = {
        ...(employee?.id ? { id: employee.id } : {}),
        name: formData.name.trim(),
        nickname: formData.nickname?.trim(),
        position: formData.position || 'Server',
        department: formData.department || 'Service',
        salary: Number(formData.salary) || 0,
        hourly_rate: Number(formData.hourly_rate) || 0,
        phone: formData.phone?.trim(),
        email: formData.email?.trim(),
        national_id: formData.national_id?.trim(),
        address: formData.address?.trim(),
        emergency_contact: formData.emergency_contact?.trim(),
        emergency_phone: formData.emergency_phone?.trim(),
        bank_name: formData.bank_name,
        bank_account: formData.bank_account?.trim(),
        promptpay_id: formData.promptpay_id?.trim(),
        hire_date: formData.hire_date,
        notes: formData.notes?.trim(),
        status: formData.status || 'active',
      };

      await saveEmployee(payload);
      onClose();
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to save employee profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!employee?.id) return;
    try {
      setIsSubmitting(true);
      await deleteEmployee(employee.id);
      onClose();
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to remove employee record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[8500] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl my-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEdit 
                  ? (language === 'th' ? `แก้ไขข้อมูลพนักงาน: ${formData.name || ''}` : `Edit Staff: ${formData.name || ''}`)
                  : (language === 'th' ? 'เพิ่มข้อมูลพนักงานใหม่' : 'Add New Staff Member')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEdit ? `Staff ID: ${employee.id}` : 'Complete employee master profile details'}
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 gap-2 bg-slate-100/50 dark:bg-slate-950/40 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{language === 'th' ? 'ข้อมูลทั่วไป' : 'General & Role'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('compensation')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'compensation'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>{language === 'th' ? 'ค่าตอบแทน & บัญชี' : 'Compensation & Bank'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'contact'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{language === 'th' ? 'ข้อมูลติดต่อ' : 'Contact & Address'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('emergency')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === 'emergency'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>{language === 'th' ? 'บุคคลติดต่อฉุกเฉิน' : 'Emergency & Notes'}</span>
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* TAB 1: GENERAL & ROLE */}
          {activeTab === 'general' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'th' ? 'ชื่อ - นามสกุล *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Somchai Jaidee"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'th' ? 'ชื่อเล่น' : 'Nickname'}
                  </label>
                  <input
                    type="text"
                    value={formData.nickname || ''}
                    onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                    placeholder="e.g. Chai"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'th' ? 'แผนก' : 'Department'}
                  </label>
                  <select
                    value={formData.department || 'Service'}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'th' ? 'ตำแหน่ง' : 'Position / Role'}
                  </label>
                  <select
                    value={formData.position || 'Server'}
                    onChange={e => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20"
                  >
                    {POSITIONS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'th' ? 'สถานะการทำงาน' : 'Employment Status'}
                  </label>
                  <select
                    value={formData.status || 'active'}
                    onChange={e => setFormData({ ...formData, status: e.target.value as Employee['status'] })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20"
                  >
                    <option value="active">Active / ทำงานอยู่</option>
                    <option value="on_leave">On Leave / ลางาน</option>
                    <option value="terminated">Terminated / พ้นสภาพ</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'th' ? 'วันที่เริ่มงาน' : 'Hire Date'}
                  </label>
                  <input
                    type="date"
                    value={formData.hire_date || ''}
                    onChange={e => setFormData({ ...formData, hire_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === 'th' ? 'เลขประจำตัวประชาชน / พาสปอร์ต' : 'National ID / Passport No.'}
                </label>
                <input
                  type="text"
                  value={formData.national_id || ''}
                  onChange={e => setFormData({ ...formData, national_id: e.target.value })}
                  placeholder="e.g. 1-1004-99887-21-4"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>
          )}

          {/* TAB 2: COMPENSATION & BANK */}
          {activeTab === 'compensation' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'th' ? 'เงินเดือนพื้นฐาน (฿/เดือน)' : 'Base Monthly Salary (฿)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">฿</span>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={formData.salary ?? ''}
                      onChange={e => setFormData({ ...formData, salary: Number(e.target.value) })}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'th' ? 'ค่าล่วงเวลา / รายชั่วโมง (฿/ชม.)' : 'Hourly Rate / Overtime Base (฿/hr)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">฿</span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={formData.hourly_rate ?? ''}
                      onChange={e => setFormData({ ...formData, hourly_rate: Number(e.target.value) })}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/20 space-y-3">
                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs font-bold">{language === 'th' ? 'ข้อมูลบัญชีสำหรับจ่ายเงินเดือน' : 'Payroll Disbursement Details'}</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {language === 'th' ? 'ธนาคาร' : 'Bank Name'}
                  </label>
                  <select
                    value={formData.bank_name || THAI_BANKS[0]}
                    onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  >
                    {THAI_BANKS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {language === 'th' ? 'เลขที่บัญชีธนาคาร' : 'Bank Account Number'}
                    </label>
                    <input
                      type="text"
                      value={formData.bank_account || ''}
                      onChange={e => setFormData({ ...formData, bank_account: e.target.value })}
                      placeholder="e.g. 023-8-91234-5"
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {language === 'th' ? 'พร้อมเพย์ (PromptPay ID/เบอร์โทร)' : 'PromptPay ID / Mobile'}
                    </label>
                    <input
                      type="text"
                      value={formData.promptpay_id || ''}
                      onChange={e => setFormData({ ...formData, promptpay_id: e.target.value })}
                      placeholder="e.g. 0812345678"
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT & ADDRESS */}
          {activeTab === 'contact' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'th' ? 'เบอร์โทรศัพท์ติดต่อ' : 'Mobile Phone'}
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="081-234-5678"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'th' ? 'อีเมล' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="staff@restaurant.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === 'th' ? 'ที่อยู่ปัจจุบัน' : 'Residential Address'}
                </label>
                <textarea
                  rows={3}
                  value={formData.address || ''}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Address details, District, Province..."
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20 resize-none"
                />
              </div>
            </div>
          )}

          {/* TAB 4: EMERGENCY & NOTES */}
          {activeTab === 'emergency' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'th' ? 'ชื่อบุคคลติดต่อฉุกเฉิน' : 'Emergency Contact Person'}
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contact || ''}
                    onChange={e => setFormData({ ...formData, emergency_contact: e.target.value })}
                    placeholder="Parent / Spouse / Relative"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {language === 'th' ? 'เบอร์โทรติดต่อฉุกเฉิน' : 'Emergency Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={formData.emergency_phone || ''}
                    onChange={e => setFormData({ ...formData, emergency_phone: e.target.value })}
                    placeholder="089-999-9999"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {language === 'th' ? 'บันทึกเพิ่มเติม / ประวัติภายใน' : 'HR Notes & Records'}
                </label>
                <textarea
                  rows={3}
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Special certifications, allergies, food handling permits, notes..."
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20 resize-none"
                />
              </div>

              {isEdit && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{language === 'th' ? 'ลบข้อมูลพนักงานคนนี้' : 'Delete Staff Record'}</span>
                    </button>
                  ) : (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                      <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        {language === 'th' 
                          ? 'คุณแน่ใจหรือไม่ที่จะลบข้อมูลพนักงานคนนี้? ข้อมูลจะถูกลบออกจากฐานข้อมูล' 
                          : 'Are you sure you want to delete this staff record? This action cannot be undone.'}
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
            </div>
          )}

          {/* Form Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {language === 'th' ? 'ยกเลิก' : 'Cancel'}
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
                  : (isEdit ? (language === 'th' ? 'บันทึกการแก้ไข' : 'Save Changes') : (language === 'th' ? 'เพิ่มพนักงาน' : 'Create Staff Member'))}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
