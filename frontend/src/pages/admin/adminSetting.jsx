import React, { useState, useEffect } from 'react';
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
  Globe,
  Download,
  UploadCloud,
  FileCode2,
  HardDrive,
  Coins,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Eye,
  RefreshCw,
  X
} from 'lucide-react';

export default function AdminSetting() {
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('security'); // 'store', 'security', 'orders', 'alerts', 'backup'
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Digest & Backup States
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [digestPreview, setDigestPreview] = useState(null);
  const [digestLoading, setDigestLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [dbStats, setDbStats] = useState({ tableCount: 12, totalRows: 150, dbSizeKb: 450 });
  const [toastMessage, setToastMessage] = useState(null);

  // --- Form & Config States ---
  const [configs, setConfigs] = useState({
    // Store & Facility
    store_name: 'MindStock Central Warehouse',
    store_code: 'MS-WMS-01',
    operating_hours: '08:00 AM - 08:00 PM',
    timezone: 'UTC+08:00 (Asia/Manila)',
    currency: 'PHP (₱)',
    address: 'Warehouse Hub 4, Industrial Blvd, Metro Center',
    
    // Security & Granular Role Permissions
    allow_clerk_edit_cost: false,
    allow_clerk_delete_sku: false,
    allow_clerk_create_product: true,
    allow_clerk_bulk_reconciliation: true,
    twoFactorAuth: false,
    sessionTimeout: '60 mins',
    strictIpLock: true,
    requireAuditNotes: true,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',

    // Inventory & Orders Policy
    low_stock_threshold: 5,
    reorderThreshold: 5,
    expiry_warning_days: 30,
    fifoEnforced: true,
    autoGenerateSku: true,
    defaultSupplierLeadDays: 3,
    allowNegativeStock: false,
    autoPrintVouchers: true,

    // Alerts & Automated Email Digest
    manager_alert_email: 'warehouse.manager@mindstock.com',
    daily_digest_enabled: true,
    emailNotifications: true,
    smsTriggers: false,
    maintenanceMode: false,
    maintenanceNotice: 'MindStock is currently undergoing scheduled system maintenance. Ordering, support, and dispatch are temporarily paused.'
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Load Settings from Backend API
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setConfigs(prev => ({
            ...prev,
            ...data.settings
          }));
          if (data.dbStats) setDbStats(data.dbStats);
        }
      }
    } catch (err) {
      console.warn("Using local settings fallback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggle = (key) => {
    setConfigs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setConfigs(prev => ({ ...prev, [key]: value }));
  };

  // 2. Save Settings to Backend API
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('http://localhost:3000/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configs)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('storeName', configs.store_name);
        setSavedSuccess(true);
        showToast("✅ System security policies & configurations saved!");
        setTimeout(() => setSavedSuccess(false), 3500);
      } else {
        alert("Failed to save: " + data.error);
      }
    } catch (err) {
      alert("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // 3. Trigger Low-Stock & Expiry Notification Digest
  const handleSendDigest = async () => {
    setDigestLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/settings/send-digest', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setDigestPreview(data.digest);
        setTestNotificationSent(true);
        showToast(`📧 Automated digest dispatched to ${data.digest.recipientEmail}`);
        setTimeout(() => setTestNotificationSent(false), 3500);
      } else {
        alert("Digest dispatch failed: " + data.error);
      }
    } catch (err) {
      alert("Error sending digest: " + err.message);
    } finally {
      setDigestLoading(false);
    }
  };

  // 4. 1-Click Download SQL Database Backup
  const handleDownloadBackup = async () => {
    setBackupLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/settings/backup');
      if (!res.ok) throw new Error("Failed to generate SQL backup dump");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindstock_backup_${new Date().toISOString().slice(0, 10)}.sql`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast("💾 Database SQL backup downloaded successfully!");
    } catch (err) {
      alert("Backup error: " + err.message);
    } finally {
      setBackupLoading(false);
    }
  };

  // 5. Restore Database from SQL File
  const handleRestoreFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm(`⚠️ CAUTION: Restoring database from "${file.name}" will overwrite conflicting records with the backup state. Proceed?`)) {
      e.target.value = '';
      return;
    }

    setRestoreLoading(true);
    try {
      const formData = new FormData();
      formData.append('backupFile', file);

      const res = await fetch('http://localhost:3000/api/settings/restore', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        showToast(`🎉 ${data.message}`);
        fetchSettings();
      } else {
        alert("Restore failed: " + data.error);
      }
    } catch (err) {
      alert("Restore error: " + err.message);
    } finally {
      setRestoreLoading(false);
      e.target.value = '';
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm("Reset all configurations & permissions to factory defaults?")) {
      const defaultState = {
        store_name: 'MindStock Central Warehouse',
        store_code: 'MS-WMS-01',
        operating_hours: '08:00 AM - 08:00 PM',
        timezone: 'UTC+08:00 (Asia/Manila)',
        currency: 'PHP (₱)',
        address: 'Warehouse Hub 4, Industrial Blvd, Metro Center',
        allow_clerk_edit_cost: false,
        allow_clerk_delete_sku: false,
        allow_clerk_create_product: true,
        allow_clerk_bulk_reconciliation: true,
        twoFactorAuth: false,
        sessionTimeout: '60 mins',
        strictIpLock: true,
        requireAuditNotes: true,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        low_stock_threshold: 5,
        reorderThreshold: 5,
        expiry_warning_days: 30,
        fifoEnforced: true,
        autoGenerateSku: true,
        defaultSupplierLeadDays: 3,
        allowNegativeStock: false,
        autoPrintVouchers: true,
        manager_alert_email: 'warehouse.manager@mindstock.com',
        daily_digest_enabled: true,
        emailNotifications: true,
        smsTriggers: false,
        maintenanceMode: false,
        maintenanceNotice: 'MindStock is currently undergoing scheduled system maintenance. Ordering, support, and dispatch are temporarily paused.'
      };
      setConfigs(defaultState);
      showToast("Settings reset to defaults");
    }
  };

  return (
    <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-300 font-sans ${
      isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {/* Top Header Bar */}
      <AdminHeader 
        title="Enterprise Governance & System Settings"
        subtitle="Granular Role Permissions, Automated Digest Alerts & 1-Click SQL Backup Hub"
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400/30 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 w-full">
        
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              System & Store Configurations
            </h1>
            <p className={`text-xs font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Configure clerk role permissions, automated email alerts, and disaster recovery backups
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetDefaults}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
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
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00684a] hover:bg-[#00583e] text-white text-xs font-bold shadow-md shadow-[#00684a]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-[#00684a] dark:text-emerald-400 flex items-center justify-between text-xs font-bold animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configuration changes and security policies successfully active across MindStock!</span>
            </div>
            <span className="text-[10px] uppercase font-mono bg-emerald-500/20 px-2 py-0.5 rounded">Synced</span>
          </div>
        )}

        {/* 5 Interactive Category Tab Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Card 1: Granular Role Permissions */}
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
              activeTab === 'security'
                ? isDark 
                  ? 'bg-rose-950/30 border-rose-500 ring-2 ring-rose-500 shadow-lg shadow-rose-500/10' 
                  : 'bg-rose-50/60 border-rose-500 ring-2 ring-rose-500 shadow-md shadow-rose-500/10'
                : isDark
                  ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700 text-slate-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`font-extrabold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Role Permissions
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Clerk access & cost locks
              </p>
            </div>
          </button>

          {/* Card 2: Automated Alerts & Email Digest */}
          <button
            type="button"
            onClick={() => setActiveTab('alerts')}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
              activeTab === 'alerts'
                ? isDark 
                  ? 'bg-purple-950/30 border-purple-500 ring-2 ring-purple-500 shadow-lg shadow-purple-500/10' 
                  : 'bg-purple-50/60 border-purple-500 ring-2 ring-purple-500 shadow-md shadow-purple-500/10'
                : isDark
                  ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700 text-slate-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-3">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`font-extrabold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Alerts & Digest
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Low-stock & expiry digests
              </p>
            </div>
          </button>

          {/* Card 3: 1-Click Database Backup Hub */}
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
              activeTab === 'backup'
                ? isDark 
                  ? 'bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/10' 
                  : 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500 shadow-md shadow-emerald-500/10'
                : isDark
                  ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700 text-slate-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-[#00684a] dark:text-emerald-400 flex items-center justify-center mb-3">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`font-extrabold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                SQL Backup Hub
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                1-Click backup & restore
              </p>
            </div>
          </button>

          {/* Card 4: Inventory & Replenishment Policies */}
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
              activeTab === 'orders'
                ? isDark 
                  ? 'bg-blue-950/30 border-blue-500 ring-2 ring-blue-500 shadow-lg shadow-blue-500/10' 
                  : 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500 shadow-md shadow-blue-500/10'
                : isDark
                  ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700 text-slate-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`font-extrabold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Inventory Policies
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                FIFO, lead times & tags
              </p>
            </div>
          </button>

          {/* Card 5: Facility & Shift Information */}
          <button
            type="button"
            onClick={() => setActiveTab('store')}
            className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
              activeTab === 'store'
                ? isDark 
                  ? 'bg-amber-950/30 border-amber-500 ring-2 ring-amber-500 shadow-lg shadow-amber-500/10' 
                  : 'bg-amber-50/60 border-amber-500 ring-2 ring-amber-500 shadow-md shadow-amber-500/10'
                : isDark
                  ? 'bg-[#0f172a] border-slate-800 hover:border-slate-700 text-slate-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`font-extrabold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Facility Profile
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Address & shift hours
              </p>
            </div>
          </button>
        </div>

        {/* Dynamic Config Area Container */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-xs transition-colors ${
          isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
        }`}>

          {/* ========================================================================= */}
          {/* TAB 1: GRANULAR ROLE PERMISSIONS & SECURITY */}
          {/* ========================================================================= */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-rose-500">Access Governance</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold">Live Enforcement</span>
                  </div>
                  <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'} mt-1`}>
                    Granular Clerk Role Permissions & Security
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Strictly govern which warehouse operations floor clerks are authorized to perform
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Card: Role Permission Toggles */}
                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50/50 border-slate-200'} space-y-4`}>
                  <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider mb-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Warehouse Floor Permissions (Clerks & Staff)</span>
                  </div>

                  {/* Permission 1: Allow Clerks to Edit Cost Price */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
                    <div className="pr-4">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Allow Clerks to Edit Product Landed Cost (PHP)
                        </h4>
                        {!configs.allow_clerk_edit_cost && (
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 text-[10px] font-bold">Locked</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        When disabled, cost price fields are read-only for clerks to prevent margin tampering.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('allow_clerk_edit_cost')}
                      className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer shrink-0 ${
                        configs.allow_clerk_edit_cost ? 'bg-[#00684a]' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                        configs.allow_clerk_edit_cost ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Permission 2: Allow Clerks to Delete SKUs */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
                    <div className="pr-4">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          Allow Clerks to Delete Catalog SKUs
                        </h4>
                        {!configs.allow_clerk_delete_sku && (
                          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 text-[10px] font-bold">Admin Only</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Protects against accidental catalog data loss. Requires Admin authentication to delete items.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('allow_clerk_delete_sku')}
                      className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer shrink-0 ${
                        configs.allow_clerk_delete_sku ? 'bg-[#00684a]' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                        configs.allow_clerk_delete_sku ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Permission 3: Allow Clerks to Register New SKUs */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
                    <div className="pr-4">
                      <h4 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Allow Clerks to Register New Inventory Products
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Permit floor staff to add new items directly at the Inbound Receiving desk.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('allow_clerk_create_product')}
                      className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer shrink-0 ${
                        configs.allow_clerk_create_product ? 'bg-[#00684a]' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                        configs.allow_clerk_create_product ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Permission 4: Allow Clerks to Perform Cycle Count Reconciliation */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs">
                    <div className="pr-4">
                      <h4 className={`text-xs font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Allow Clerks to Submit Cycle Count Audit Adjustments
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Authorizes physical stock variance adjustment submissions from the floor.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('allow_clerk_bulk_reconciliation')}
                      className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 cursor-pointer shrink-0 ${
                        configs.allow_clerk_bulk_reconciliation ? 'bg-[#00684a]' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                        configs.allow_clerk_bulk_reconciliation ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Right Card: Security & Authentication */}
                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50/50 border-slate-200'} space-y-4`}>
                  <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-wider mb-2">
                    <Lock className="w-4 h-4" />
                    <span>Authentication & Session Policies</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
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

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
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

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
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

                  {/* Password Update */}
                  <div className="pt-2">
                    <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'} mb-2`}>Update Admin Password</h4>
                    <div className="space-y-2">
                      <input 
                        type="password"
                        placeholder="Current Password"
                        value={configs.currentPassword}
                        onChange={(e) => handleChange('currentPassword', e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs font-semibold outline-none ${
                          isDark ? 'bg-[#0f172a] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                      <input 
                        type="password"
                        placeholder="New Password"
                        value={configs.newPassword}
                        onChange={(e) => handleChange('newPassword', e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs font-semibold outline-none ${
                          isDark ? 'bg-[#0f172a] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
                        }`}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: AUTOMATED LOW-STOCK & EXPIRY EMAIL DIGEST */}
          {/* ========================================================================= */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-purple-500">Automated Intelligence</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 text-[10px] font-bold">Daily Scheduler</span>
                  </div>
                  <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'} mt-1`}>
                    Automated Low-Stock & Expiry Notification Digest
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Automatically compile and dispatch daily alert briefings to managers for zero-stock and expiring batches
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSendDigest}
                    disabled={digestLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      testNotificationSent
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                        : isDark
                          ? 'border-purple-500/40 text-purple-400 bg-purple-950/20 hover:bg-purple-950/40'
                          : 'border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100/70'
                    }`}
                  >
                    {digestLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>{testNotificationSent ? 'Dispatched!' : 'Send Test Alert Digest'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Card: Alert Configuration */}
                <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50/50 border-slate-200'} space-y-4`}>
                  <div className="flex items-center gap-2 text-purple-500 font-bold text-xs uppercase tracking-wider mb-2">
                    <Mail className="w-4 h-4" />
                    <span>Manager Alert Digest Settings</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Manager Alert Email Address
                    </label>
                    <input 
                      type="email" 
                      value={configs.manager_alert_email}
                      onChange={(e) => handleChange('manager_alert_email', e.target.value)}
                      placeholder="manager@mindstock.com"
                      className={`w-full p-3 rounded-xl border text-xs font-semibold outline-none transition-all ${
                        isDark ? 'bg-[#0f172a] border-slate-700 text-white focus:border-purple-500' : 'bg-white border-slate-200 text-slate-900 focus:border-purple-500'
                      }`}
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Direct destination for daily emergency stockout & liability summaries</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Low Stock Alert Threshold
                      </label>
                      <input 
                        type="number" 
                        value={configs.low_stock_threshold}
                        onChange={(e) => handleChange('low_stock_threshold', parseInt(e.target.value, 10))}
                        className={`w-full p-3 rounded-xl border text-xs font-semibold outline-none transition-all ${
                          isDark ? 'bg-[#0f172a] border-slate-700 text-white focus:border-purple-500' : 'bg-white border-slate-200 text-slate-900 focus:border-purple-500'
                        }`}
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Triggers alert when units $\le$ threshold</p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Expiry Warning Horizon (Days)
                      </label>
                      <input 
                        type="number" 
                        value={configs.expiry_warning_days}
                        onChange={(e) => handleChange('expiry_warning_days', parseInt(e.target.value, 10))}
                        className={`w-full p-3 rounded-xl border text-xs font-semibold outline-none transition-all ${
                          isDark ? 'bg-[#0f172a] border-slate-700 text-white focus:border-purple-500' : 'bg-white border-slate-200 text-slate-900 focus:border-purple-500'
                        }`}
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Batches expiring within N days</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Enable Daily Automated Morning Digest
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Automatically dispatch stockout report at 08:00 AM daily
                      </p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={configs.daily_digest_enabled}
                      onChange={() => handleToggle('daily_digest_enabled')}
                      className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Right Card: Maintenance Mode */}
                <div className={`p-6 rounded-2xl border ${
                  isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50/50 border-slate-200'
                } space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Facility Maintenance Mode</span>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider ${
                      configs.maintenanceMode
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {configs.maintenanceMode ? 'LOCKED / RESTRICTED' : 'OPERATIONAL / LIVE'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
                    <div>
                      <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Lock Facility Dispatch
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Temporarily restrict outbound stock issuance and ordering
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
                      BROADCAST NOTICE MESSAGE
                    </label>
                    <textarea 
                      rows="3"
                      value={configs.maintenanceNotice}
                      onChange={(e) => handleChange('maintenanceNotice', e.target.value)}
                      className={`w-full p-3 rounded-xl border text-xs font-medium outline-none transition-all ${
                        isDark ? 'bg-[#0f172a] border-slate-700 text-white focus:border-[#00684a]' : 'bg-white border-slate-200 text-slate-800 focus:border-[#00684a]'
                      }`}
                    />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: 1-CLICK DATABASE BACKUP & RESTORE HUB */}
          {/* ========================================================================= */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-[#00684a] dark:text-emerald-400">Disaster Recovery</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#00684a] dark:text-emerald-300 text-[10px] font-bold">SQL Database</span>
                  </div>
                  <h2 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'} mt-1`}>
                    1-Click Database Backup & Restore Hub
                  </h2>
                  <p className="text-xs text-slate-400 font-medium">
                    Safely download complete timestamped SQL dumps or restore database state from previous snapshots
                  </p>
                </div>
              </div>

              {/* Database Quick Health Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50 border-slate-200'} flex items-center gap-3.5`}>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Database Tables</p>
                    <h4 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{dbStats.tableCount} Tables</h4>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50 border-slate-200'} flex items-center gap-3.5`}>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#00684a] dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Records</p>
                    <h4 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{dbStats.totalRows} Rows Indexed</h4>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50 border-slate-200'} flex items-center gap-3.5`}>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Database Storage</p>
                    <h4 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{dbStats.dbSizeKb} KB</h4>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Action 1: Download SQL Backup */}
                <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
                  isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50/50 border-slate-200'
                } space-y-4`}>
                  <div>
                    <div className="flex items-center gap-2 text-[#00684a] dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
                      <Download className="w-4 h-4" />
                      <span>Export Full Database Backup</span>
                    </div>
                    <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Generate Timestamped .SQL Dump
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Creates a complete, stand-alone SQL dump including tables for Products, Categories, Suppliers, Batches, Purchase Orders, Damaged/RTV claims, Stock History, and System Settings.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleDownloadBackup}
                      disabled={backupLoading}
                      className="w-full py-3.5 rounded-xl bg-[#00684a] hover:bg-[#00583e] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#00684a]/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {backupLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      <span>{backupLoading ? 'Compiling Dump...' : 'Download Full SQL Backup (.sql)'}</span>
                    </button>
                  </div>
                </div>

                {/* Action 2: Restore Database Backup */}
                <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
                  isDark ? 'bg-[#0b1120] border-slate-800' : 'bg-slate-50/50 border-slate-200'
                } space-y-4`}>
                  <div>
                    <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-wider mb-2">
                      <UploadCloud className="w-4 h-4" />
                      <span>Restore From SQL Backup</span>
                    </div>
                    <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Upload & Execute Backup Dump
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Select a valid MindStock `.sql` backup file to restore database tables and records. All foreign key constraints are temporarily disabled during execution for safe batch insertion.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <label className={`w-full py-3.5 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      restoreLoading 
                        ? 'opacity-50 cursor-not-allowed'
                        : isDark
                          ? 'border-blue-500/40 hover:border-blue-500 bg-blue-950/20 text-blue-400'
                          : 'border-blue-300 hover:border-blue-500 bg-blue-50 text-blue-700'
                    }`}>
                      {restoreLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                      <span>{restoreLoading ? 'Restoring Database...' : 'Select & Restore .SQL File'}</span>
                      <input 
                        type="file" 
                        accept=".sql" 
                        onChange={handleRestoreFile} 
                        disabled={restoreLoading}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: INVENTORY & REPLENISHMENT POLICIES */}
          {/* ========================================================================= */}
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
                      value={configs.low_stock_threshold}
                      onChange={(e) => handleChange('low_stock_threshold', parseInt(e.target.value, 10))}
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

          {/* ========================================================================= */}
          {/* TAB 5: FACILITY PROFILE & ADDRESS */}
          {/* ========================================================================= */}
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
                      value={configs.store_name}
                      onChange={(e) => handleChange('store_name', e.target.value)}
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
                      value={configs.store_code}
                      onChange={(e) => handleChange('store_code', e.target.value)}
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
                      value={configs.operating_hours}
                      onChange={(e) => handleChange('operating_hours', e.target.value)}
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

        </div>

      </div>

      {/* MODAL: LIVE EMAIL DIGEST PREVIEW */}
      {digestPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl border shadow-2xl ${
            isDark ? 'bg-[#0f172a] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black">Manager Alert Digest Preview</h3>
                  <p className="text-xs text-slate-400">Recipient: {digestPreview.recipientEmail}</p>
                </div>
              </div>
              <button 
                onClick={() => setDigestPreview(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Digest Summary Cards */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                <p className="text-[10px] font-bold text-red-500 uppercase">Zero Stock</p>
                <p className="text-xl font-black text-red-500">{digestPreview.summary.zeroStockCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-[10px] font-bold text-amber-500 uppercase">Low Stock</p>
                <p className="text-xl font-black text-amber-500">{digestPreview.summary.lowStockCount}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                <p className="text-[10px] font-bold text-purple-500 uppercase">Expiring Batches</p>
                <p className="text-xl font-black text-purple-500">{digestPreview.summary.expiringBatchesCount}</p>
              </div>
            </div>

            {/* Zero Stock List */}
            {digestPreview.criticalZeroStock.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-extrabold uppercase text-red-500 mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> Critical Zero Stock ({digestPreview.criticalZeroStock.length})
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {digestPreview.criticalZeroStock.map(item => (
                    <div key={item.id} className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 flex items-center justify-between text-xs">
                      <span className="font-bold">{item.name}</span>
                      <span className="font-mono text-slate-400">{item.location_zone} → {item.location_aisle}</span>
                      <span className="px-2 py-0.5 rounded bg-red-500 text-white font-black text-[10px]">0 Units</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expiring Batches List */}
            {digestPreview.expiringBatches.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-extrabold uppercase text-purple-500 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Perishable Expiry Liabilities ({digestPreview.expiringBatches.length})
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {digestPreview.expiringBatches.map(item => (
                    <div key={item.id} className="p-2 rounded-lg bg-purple-500/5 border border-purple-500/10 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono ml-2">[{item.batch_number}]</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-purple-600 text-white font-black text-[10px]">{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setDigestPreview(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}