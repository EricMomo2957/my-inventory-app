import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import AdminHeader from './AdminHeader';
import { 
  Building2, 
  Shield, 
  Truck, 
  Bell, 
  RotateCcw, 
  Save, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  User, 
  KeyRound, 
  Clock, 
  Mail, 
  MessageSquare, 
  Database, 
  Sparkles, 
  Sliders, 
  Check,
  Warehouse,
  Moon,
  Sun,
  Layers,
  MapPin,
  Calendar,
  Globe
} from 'lucide-react';

export default function AdminSetting() {
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('alerts'); // 'store', 'security', 'orders', 'alerts'
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  // --- Form & Config States ---
  const [configs, setConfigs] = useState({
    // Store & Operating Hours
    storeName: localStorage.getItem('storeName') || 'MindStock Central Warehouse',
    storeCode: 'MS-WMS-01',
    operatingHours: '08:00 AM - 08:00 PM',
    prepTime: '15 mins',
    timezone: 'UTC+08:00 (Asia/Manila)',
    currency: 'PHP (₱)',
    address: 'Warehouse Hub 4, Industrial Blvd, Metro Center',
    
    // Security & Access Control
    twoFactorAuth: false,
    sessionTimeout: '60 mins',
    strictIpLock: true,
    requireAuditNotes: true,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',

    // Orders, Delivery & Fees
    reorderThreshold: 5,
    fifoEnforced: true,
    autoGenerateSku: true,
    defaultSupplierLeadDays: 3,
    allowNegativeStock: false,
    autoPrintVouchers: true,

    // Alerts & System
    emailNotifications: true,
    smsTriggers: false,
    maintenanceMode: false,
    maintenanceNotice: 'MindStock is currently undergoing scheduled system maintenance. Ordering, support, and dispatch are temporarily paused.'
  });

  const handleToggle = (key) => {
    setConfigs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setConfigs(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    localStorage.setItem('storeName', configs.storeName);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    if (window.confirm("Reset all configurations to factory system defaults?")) {
      setConfigs({
        storeName: 'MindStock Central Warehouse',
        storeCode: 'MS-WMS-01',
        operatingHours: '08:00 AM - 08:00 PM',
        prepTime: '15 mins',
        timezone: 'UTC+08:00 (Asia/Manila)',
        currency: 'PHP (₱)',
        address: 'Warehouse Hub 4, Industrial Blvd, Metro Center',
        twoFactorAuth: false,
        sessionTimeout: '60 mins',
        strictIpLock: true,
        requireAuditNotes: true,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        reorderThreshold: 5,
        fifoEnforced: true,
        autoGenerateSku: true,
        defaultSupplierLeadDays: 3,
        allowNegativeStock: false,
        autoPrintVouchers: true,
        emailNotifications: true,
        smsTriggers: false,
        maintenanceMode: false,
        maintenanceNotice: 'MindStock is currently undergoing scheduled system maintenance. Ordering, support, and dispatch are temporarily paused.'
      });
      alert("Settings restored to system defaults.");
    }
  };

  const handleSendTestNotification = () => {
    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 3000);
  };

  return (
    <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 font-sans ${
      isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Top Header Bar */}
      <AdminHeader 
        title="System & Store Settings"
        subtitle="Warehouse Policies, Operating Hours & Security Parameters"
      />
      
      <div className="flex-1 overflow-y-auto p-8 space-y-8 max-w-[1400px] mx-auto w-full">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              System & Store Configurations
            </h1>
            <p className={`text-xs font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Configure store operation rules, delivery parameters, security keys, and alert notifications
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDefaults}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                isDark 
                  ? 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200' 
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00684a] hover:bg-[#00583e] text-white text-xs font-bold shadow-md shadow-[#00684a]/20 transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[#00684a] dark:text-emerald-400 flex items-center justify-between text-xs font-bold animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configuration changes committed and active across MindStock engine!</span>
            </div>
            <span className="text-[10px] uppercase font-mono">Synced</span>
          </div>
        )}

        {/* 4 Interactive Category Tab Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Card 1: Store & Operating Hours */}
          <button
            type="button"
            onClick={() => setActiveTab('store')}
            className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
              activeTab === 'store'
                ? isDark 
                  ? 'bg-blue-950/30 border-blue-500 ring-2 ring-blue-500 shadow-lg shadow-blue-500/10' 
                  : 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500 shadow-md shadow-blue-500/10'
                : isDark
                  ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700 text-slate-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Store & Operating Hours
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Hours, prep time & regional info
              </p>
            </div>
          </button>

          {/* Card 2: Security & Access Control */}
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
              activeTab === 'security'
                ? isDark 
                  ? 'bg-rose-950/30 border-rose-500 ring-2 ring-rose-500 shadow-lg shadow-rose-500/10' 
                  : 'bg-rose-50/60 border-rose-500 ring-2 ring-rose-500 shadow-md shadow-rose-500/10'
                : isDark
                  ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700 text-slate-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Security & Access Control
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Credentials, 2FA & sessions
              </p>
            </div>
          </button>

          {/* Card 3: Orders, Delivery & Fees */}
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
              activeTab === 'orders'
                ? isDark 
                  ? 'bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/10' 
                  : 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500 shadow-md shadow-emerald-500/10'
                : isDark
                  ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700 text-slate-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Orders, Delivery & Fees
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Delivery fees, free thresholds
              </p>
            </div>
          </button>

          {/* Card 4: Alerts & System */}
          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
              activeTab === 'alerts'
                ? isDark 
                  ? 'bg-purple-950/30 border-purple-500 ring-2 ring-purple-500 shadow-lg shadow-purple-500/10' 
                  : 'bg-purple-50/60 border-purple-500 ring-2 ring-purple-500 shadow-md shadow-purple-500/10'
                : isDark
                  ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700 text-slate-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Alerts & System
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Notifications & maintenance
              </p>
            </div>
          </button>
        </div>

        {/* Dynamic Config Area Container */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-xs transition-colors ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
        }`}>

          {/* --- TAB 1: STORE & OPERATING HOURS --- */}
          {activeTab === 'store' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 gap-3">
                <div>
                  <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Facility & Operating Parameters
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Manage operational shift hours, address, and localized regional data
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Warehouse / Facility Name
                    </label>
                    <input 
                      type="text"
                      value={configs.storeName}
                      onChange={(e) => handleChange('storeName', e.target.value)}
                      className={`w-full p-3.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                        isDark ? 'bg-[#0b1120] border-slate-700 text-white focus:border-[#00684a]' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#00684a]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Facility Branch Code
                    </label>
                    <input 
                      type="text"
                      value={configs.storeCode}
                      onChange={(e) => handleChange('storeCode', e.target.value)}
                      className={`w-full p-3.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                        isDark ? 'bg-[#0b1120] border-slate-700 text-white focus:border-[#00684a]' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#00684a]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Standard Operating Shift
                    </label>
                    <input 
                      type="text"
                      value={configs.operatingHours}
                      onChange={(e) => handleChange('operatingHours', e.target.value)}
                      className={`w-full p-3.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                        isDark ? 'bg-[#0b1120] border-slate-700 text-white focus:border-[#00684a]' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#00684a]'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      System Timezone
                    </label>
                    <input 
                      type="text"
                      value={configs.timezone}
                      onChange={(e) => handleChange('timezone', e.target.value)}
                      className={`w-full p-3.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                        isDark ? 'bg-[#0b1120] border-slate-700 text-white focus:border-[#00684a]' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#00684a]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Default Currency Format
                    </label>
                    <input 
                      type="text"
                      value={configs.currency}
                      onChange={(e) => handleChange('currency', e.target.value)}
                      className={`w-full p-3.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                        isDark ? 'bg-[#0b1120] border-slate-700 text-white focus:border-[#00684a]' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#00684a]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Physical Location & Address
                    </label>
                    <input 
                      type="text"
                      value={configs.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      className={`w-full p-3.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                        isDark ? 'bg-[#0b1120] border-slate-700 text-white focus:border-[#00684a]' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#00684a]'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 2: SECURITY & ACCESS CONTROL --- */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 gap-3">
                <div>
                  <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Security, Authentication & Sessions
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Configure staff authorization policies, password updates, and session governance
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Card: Security Toggles */}
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50/50 border-slate-100'} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Two-Factor Authentication</h4>
                      <p className="text-[11px] text-slate-400">Require 2FA one-time code on supervisor login</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={configs.twoFactorAuth}
                      onChange={() => handleToggle('twoFactorAuth')}
                      className="w-4 h-4 accent-[#00684a] rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Strict Session IP Lock</h4>
                      <p className="text-[11px] text-slate-400">Terminate sessions if IP origin changes during active shift</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={configs.strictIpLock}
                      onChange={() => handleToggle('strictIpLock')}
                      className="w-4 h-4 accent-[#00684a] rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Mandatory Audit Reasons</h4>
                      <p className="text-[11px] text-slate-400">Enforce justification reason on every inventory adjustment</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={configs.requireAuditNotes}
                      onChange={() => handleToggle('requireAuditNotes')}
                      className="w-4 h-4 accent-[#00684a] rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Right Card: Password Management */}
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50/50 border-slate-100'} space-y-3`}>
                  <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Admin Password Update</h4>
                  
                  <input 
                    type="password"
                    placeholder="Current Password"
                    value={configs.currentPassword}
                    onChange={(e) => handleChange('currentPassword', e.target.value)}
                    className={`w-full p-3 rounded-xl border text-xs font-semibold outline-none ${
                      isDark ? 'bg-[#0f172a] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  />
                  <input 
                    type="password"
                    placeholder="New Password"
                    value={configs.newPassword}
                    onChange={(e) => handleChange('newPassword', e.target.value)}
                    className={`w-full p-3 rounded-xl border text-xs font-semibold outline-none ${
                      isDark ? 'bg-[#0f172a] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  />
                  <input 
                    type="password"
                    placeholder="Confirm New Password"
                    value={configs.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className={`w-full p-3 rounded-xl border text-xs font-semibold outline-none ${
                      isDark ? 'bg-[#0f172a] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 3: ORDERS, DELIVERY & FEES --- */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 gap-3">
                <div>
                  <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Orders, Delivery & Inventory Parameters
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Configure safety stock thresholds, FIFO rules, and dispatch voucher defaults
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50/50 border-slate-100'} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>FIFO Lot Dispatch</h4>
                      <p className="text-[11px] text-slate-400">Strictly prioritize earliest batch lots to prevent spoilage</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={configs.fifoEnforced}
                      onChange={() => handleToggle('fifoEnforced')}
                      className="w-4 h-4 accent-[#00684a] rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Auto-Generate SKU Tags</h4>
                      <p className="text-[11px] text-slate-400">Automatically generate sequential barcodes on new SKU creation</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={configs.autoGenerateSku}
                      onChange={() => handleToggle('autoGenerateSku')}
                      className="w-4 h-4 accent-[#00684a] rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Print Dispatch Vouchers</h4>
                      <p className="text-[11px] text-slate-400">Prompt printable voucher window upon dispatch completion</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={configs.autoPrintVouchers}
                      onChange={() => handleToggle('autoPrintVouchers')}
                      className="w-4 h-4 accent-[#00684a] rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Global Low Stock Reorder Threshold
                    </label>
                    <input 
                      type="number"
                      value={configs.reorderThreshold}
                      onChange={(e) => handleChange('reorderThreshold', parseInt(e.target.value, 10))}
                      className={`w-full p-3.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                        isDark ? 'bg-[#0b1120] border-slate-700 text-white focus:border-[#00684a]' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#00684a]'
                      }`}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Triggers emergency low-stock alerts when inventory dips below this count</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Default Supplier Lead Time (Days)
                    </label>
                    <input 
                      type="number"
                      value={configs.defaultSupplierLeadDays}
                      onChange={(e) => handleChange('defaultSupplierLeadDays', parseInt(e.target.value, 10))}
                      className={`w-full p-3.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                        isDark ? 'bg-[#0b1120] border-slate-700 text-white focus:border-[#00684a]' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#00684a]'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 4: ALERTS & SYSTEM (EXACT MATCH TO SAMPLE PHOTO) --- */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 gap-3">
                <div>
                  <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Notifications & Maintenance Mode
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Configure real-time notifications and temporary platform access locks
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSendTestNotification}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                    testNotificationSent
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                      : isDark
                        ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40'
                        : 'border-emerald-200 text-[#00684a] bg-emerald-50 hover:bg-emerald-100/70'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testNotificationSent ? 'Test Dispatched!' : 'Test Notification'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Card: Notifications */}
                <div className={`p-6 rounded-2xl border ${
                  isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                } space-y-5`}>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <Bell className="w-4 h-4" />
                    <span>Notifications</span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Email Notifications
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Automated emails for orders and support
                      </p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={configs.emailNotifications}
                      onChange={() => handleToggle('emailNotifications')}
                      className="w-4 h-4 accent-[#00684a] rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        SMS System Triggers
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Receive SMS for critical store events
                      </p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={configs.smsTriggers}
                      onChange={() => handleToggle('smsTriggers')}
                      className="w-4 h-4 accent-[#00684a] rounded cursor-pointer"
                    />
                  </div>

                  {/* UI Theme Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          Interface Dark Theme
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Toggle between sleek SaaS dark mode and high-contrast light
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                        isDark ? 'bg-[#00684a]' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                        isDark ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Right Card: Maintenance Mode */}
                <div className={`p-6 rounded-2xl border ${
                  isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                } space-y-5`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Maintenance Mode</span>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider ${
                      configs.maintenanceMode
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {configs.maintenanceMode ? 'LOCKED / RESTRICTED' : 'OPERATIONAL / LIVE'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Lock Store Operations
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Toggle on to temporarily restrict customer orders and support submissions.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('maintenanceMode')}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                        configs.maintenanceMode ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                        configs.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      MAINTENANCE NOTICE MESSAGE
                    </label>
                    <textarea 
                      rows="3"
                      value={configs.maintenanceNotice}
                      onChange={(e) => handleChange('maintenanceNotice', e.target.value)}
                      className={`w-full p-3.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                        isDark ? 'bg-[#0f172a] border-slate-700 text-white focus:border-[#00684a]' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#00684a]'
                      }`}
                    />
                    <p className="text-[10px] text-slate-400 italic mt-1">
                      This notice is immediately broadcasted and displayed across the store for all visitors and customers.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}