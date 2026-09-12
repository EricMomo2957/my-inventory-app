import React, { useState, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  Printer, 
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
  Volume2, 
  VolumeX, 
  Layers, 
  Sliders, 
  Check, 
  Building2, 
  Warehouse,
  Moon,
  Sun,
  Barcode
} from 'lucide-react';

export default function ClerkSetting() {
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('alerts'); // 'hardware', 'security', 'dispatch', 'alerts'
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  // Retrieve user data from localStorage safely
  const userData = useMemo(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : { name: localStorage.getItem('userName') || 'Warehouse Clerk' };
    } catch {
      return { name: 'Warehouse Clerk' };
    }
  }, []);

  const [configs, setConfigs] = useState({
    // Desk & Hardware Setup
    receiptAutoPrint: true,
    scannerBeep: true,
    scannerPrefix: 'SKU-',
    printerModel: 'Thermal POS-80 (Default USB)',
    copiesCount: 1,

    // Security & Credentials
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    sessionAutoLock: true,
    lockTimeMinutes: 30,

    // Dispatch & Stock Receiving
    confirmZeroStockPrompt: true,
    autoOpenVoucherModal: true,
    defaultRecipientDept: 'General Operations',
    requireCustomerSignature: false,

    // Alerts & Sound Triggers
    soundEffects: true,
    criticalLowStockBeep: true,
    expiryAudioWarning: true,
    deskNotice: 'Floor Clerk Desk is currently synced and operational for Material Issuance and Inbound Receiving.'
  });

  const handleToggle = (key) => {
    setConfigs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setConfigs(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    if (window.confirm("Reset clerk desk preferences to default settings?")) {
      setConfigs({
        receiptAutoPrint: true,
        scannerBeep: true,
        scannerPrefix: 'SKU-',
        printerModel: 'Thermal POS-80 (Default USB)',
        copiesCount: 1,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        sessionAutoLock: true,
        lockTimeMinutes: 30,
        confirmZeroStockPrompt: true,
        autoOpenVoucherModal: true,
        defaultRecipientDept: 'General Operations',
        requireCustomerSignature: false,
        soundEffects: true,
        criticalLowStockBeep: true,
        expiryAudioWarning: true,
        deskNotice: 'Floor Clerk Desk is currently synced and operational for Material Issuance and Inbound Receiving.'
      });
      alert("Clerk settings reset to defaults.");
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
      
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 w-full">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Clerk Desk & Hardware Configurations
            </h1>
            <p className={`text-xs font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Configure clerk desk preferences, scanner behavior, receipt auto-printing, and staff security keys
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
              <span>Clerk desk configuration saved successfully!</span>
            </div>
            <span className="text-[10px] uppercase font-mono">Synced</span>
          </div>
        )}

        {/* 4 Interactive Category Tab Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Card 1: Desk & Hardware Setup */}
          <button
            type="button"
            onClick={() => setActiveTab('hardware')}
            className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
              activeTab === 'hardware'
                ? isDark 
                  ? 'bg-blue-950/30 border-blue-500 ring-2 ring-blue-500 shadow-lg shadow-blue-500/10' 
                  : 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500 shadow-md shadow-blue-500/10'
                : isDark
                  ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700 text-slate-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-extrabold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Hardware & Scanner Setup
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Thermal printers & barcode scanner
              </p>
            </div>
          </button>

          {/* Card 2: Security & Credentials */}
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
                Staff Security & PIN
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Clerk password & auto-lock
              </p>
            </div>
          </button>

          {/* Card 3: Dispatch & Stock In */}
          <button
            type="button"
            onClick={() => setActiveTab('dispatch')}
            className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
              activeTab === 'dispatch'
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
                Dispatch & Vouchers
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Fulfillment rules & requisitions
              </p>
            </div>
          </button>

          {/* Card 4: Alerts & Sound Triggers */}
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
                Alerts & Sound Triggers
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Notifications & floor alerts
              </p>
            </div>
          </button>
        </div>

        {/* Dynamic Config Area Container */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-xs transition-colors ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
        }`}>

          {/* --- TAB 1: HARDWARE SETUP --- */}
          {activeTab === 'hardware' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 gap-3">
                <div>
                  <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Peripheral & Hardware Integration
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Configure thermal barcode scanner and voucher printing peripherals
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50/50 border-slate-100'} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Auto-Print Dispatch Receipts</h4>
                      <p className="text-[11px] text-slate-400">Instantly trigger print dialog upon dispatch completion</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={configs.receiptAutoPrint}
                      onChange={() => handleToggle('receiptAutoPrint')}
                      className="w-4 h-4 accent-[#00684a] rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Barcode Scanner Beep</h4>
                      <p className="text-[11px] text-slate-400">Play confirmation audio feedback on successful SKU barcode scan</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={configs.scannerBeep}
                      onChange={() => handleToggle('scannerBeep')}
                      className="w-4 h-4 accent-[#00684a] rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Assigned Thermal Printer
                    </label>
                    <input 
                      type="text"
                      value={configs.printerModel}
                      onChange={(e) => handleChange('printerModel', e.target.value)}
                      className={`w-full p-3.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                        isDark ? 'bg-[#0b1120] border-slate-700 text-white focus:border-[#00684a]' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#00684a]'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Scanner Prefix Filter
                    </label>
                    <input 
                      type="text"
                      value={configs.scannerPrefix}
                      onChange={(e) => handleChange('scannerPrefix', e.target.value)}
                      className={`w-full p-3.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                        isDark ? 'bg-[#0b1120] border-slate-700 text-white focus:border-[#00684a]' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#00684a]'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 2: SECURITY & CREDENTIALS --- */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 gap-3">
                <div>
                  <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Clerk Credentials & Shift Security
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Update your staff login password and configure auto-lock protection
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50/50 border-slate-100'} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Inactivity Auto-Lock</h4>
                      <p className="text-[11px] text-slate-400">Lock the desk console after 30 minutes of idle floor time</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={configs.sessionAutoLock}
                      onChange={() => handleToggle('sessionAutoLock')}
                      className="w-4 h-4 accent-[#00684a] rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50/50 border-slate-100'} space-y-3`}>
                  <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Update Clerk Password</h4>
                  
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

          {/* --- TAB 3: DISPATCH & STOCK RECEIVING --- */}
          {activeTab === 'dispatch' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 gap-3">
                <div>
                  <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Dispatch & Material Issuance Rules
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Configure requisition workflow behavior and stock verification popups
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50/50 border-slate-100'} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Zero Stock Warnings</h4>
                      <p className="text-[11px] text-slate-400">Warn clerk if an item is fully depleted during staging</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={configs.confirmZeroStockPrompt}
                      onChange={() => handleToggle('confirmZeroStockPrompt')}
                      className="w-4 h-4 accent-[#00684a] rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Auto-Open Voucher View</h4>
                      <p className="text-[11px] text-slate-400">Open full issuance certificate modal upon submitting dispatch</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={configs.autoOpenVoucherModal}
                      onChange={() => handleToggle('autoOpenVoucherModal')}
                      className="w-4 h-4 accent-[#00684a] rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Default Recipient Department
                    </label>
                    <input 
                      type="text"
                      value={configs.defaultRecipientDept}
                      onChange={(e) => handleChange('defaultRecipientDept', e.target.value)}
                      className={`w-full p-3.5 rounded-xl border text-xs font-semibold outline-none transition-all ${
                        isDark ? 'bg-[#0b1120] border-slate-700 text-white focus:border-[#00684a]' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#00684a]'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 4: ALERTS & SOUND TRIGGERS --- */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 gap-3">
                <div>
                  <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Notifications & Floor Desk Status
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Configure real-time notifications, acoustic beeps, and display preferences
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
                  <span>{testNotificationSent ? 'Test Alert Dispatched!' : 'Test Notification'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Card: Notifications & Audio */}
                <div className={`p-6 rounded-2xl border ${
                  isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                } space-y-5`}>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <Bell className="w-4 h-4" />
                    <span>Notifications & Sound</span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Critical Low Stock Sound
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Acoustic warning chime on low stock discovery
                      </p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={configs.criticalLowStockBeep}
                      onChange={() => handleToggle('criticalLowStockBeep')}
                      className="w-4 h-4 accent-[#00684a] rounded cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        FIFO Expiry Audio Alerts
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Alert clerk when scanning batches near expiry window
                      </p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={configs.expiryAudioWarning}
                      onChange={() => handleToggle('expiryAudioWarning')}
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
                          Toggle clerk floor desk between dark and light theme
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

                {/* Right Card: Desk Live Status */}
                <div className={`p-6 rounded-2xl border ${
                  isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                } space-y-5`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
                      <Warehouse className="w-4 h-4" />
                      <span>Floor Desk Status</span>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      OPERATIONAL / LIVE
                    </span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-1">
                    <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      Active Staff Custodian
                    </h4>
                    <p className="text-sm font-extrabold text-[#00684a] dark:text-emerald-400">
                      {userData.name}
                    </p>
                    <p className="text-[10px] text-slate-400">Authorized Clerk Operator</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                      FLOOR DESK STATUS BROADCAST
                    </label>
                    <textarea 
                      rows="3"
                      value={configs.deskNotice}
                      onChange={(e) => handleChange('deskNotice', e.target.value)}
                      className={`w-full p-3.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                        isDark ? 'bg-[#0f172a] border-slate-700 text-white focus:border-[#00684a]' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-[#00684a]'
                      }`}
                    />
                    <p className="text-[10px] text-slate-400 italic mt-1">
                      This status notice confirms desk availability for stock receiving and material dispatch.
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