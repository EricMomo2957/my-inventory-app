import { useEffect, useState, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CustomerOrder from './pages/CustomerOrder';

// Theme Support
import { useTheme } from './context/ThemeContext'; 

// Layout and Security
import AdminSideNav from './pages/admin/admin_sidenav';
import ClerkSidenav from './pages/clerk/ClerkSidenav'; 
import ProtectedRoute from './context/ProtectedRoute';

// Public & Auth Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/login'; 
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Private Pages - Clerk & Warehouse Operations
import ClerkDashboard from './pages/clerk/ClerkDashboard';
import ClerkOrderManagement from './pages/clerk/order';
import InboundReceiving from './pages/clerk/InboundReceiving';
import CycleCountReconciliation from './pages/clerk/CycleCountReconciliation';
import ClerkCalendar from './pages/clerk/clerkCalendar';
import ClerkSetting from './pages/clerk/clerkSetting';
import ClerkProfile from './pages/clerk/clerkProfile';

// Private Pages - Admin Folder
import Dashboard from './pages/admin/Dashboard'; 
import AdminManagement from './pages/admin/AdminManagement';
import Calendar from './pages/admin/Calendar';
import AdminSetting from './pages/admin/adminSetting';
import AdminProfile from './pages/admin/AdminProfile';
import AdminStockHistory from './pages/admin/AdminStockHistory';
import AdminReports from './pages/admin/AdminReports';
import AdminContactRequest from './pages/admin/AdminContactRequest';

// Enterprise Warehouse Modules
import WarehouseLocationMap from './pages/admin/WarehouseLocationMap';
import SupplierManagement from './pages/admin/SupplierManagement';
import PurchaseOrderManagement from './pages/admin/PurchaseOrderManagement';
import ReorderRequisition from './pages/admin/ReorderRequisition';
import ABCAnalytics from './pages/admin/ABCAnalytics';
import ReportExportStudio from './pages/admin/ReportExportStudio';

export default function App() {
  const { isDark } = useTheme(); 
  const [products, setProducts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState([]); 

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('userToken');
  });

  const [user, setUser] = useState({ 
    name: localStorage.getItem('userName') || "Staff Member", 
    role: localStorage.getItem('userRole') || "clerk",
    avatar: `https://ui-avatars.com/api/?name=${localStorage.getItem('userName') || 'Staff'}&background=00684a&color=fff` 
  });

  useEffect(() => {
    if (isLoggedIn) {
      setUser({
        name: localStorage.getItem('userName') || "Staff Member",
        role: localStorage.getItem('userRole') || "clerk",
        avatar: `https://ui-avatars.com/api/?name=${localStorage.getItem('userName') || 'Staff'}&background=00684a&color=fff`
      });
    }
  }, [isLoggedIn]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:3000/api/products');
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProducts(data);
    } catch (error) { 
      console.error("Fetch error:", error); 
    }
  }, []);

  useEffect(() => { 
    if (isLoggedIn) {
      fetchProducts();
    }
  }, [fetchProducts, isLoggedIn]);

  const activeAlerts = useMemo(() => {
    return products.filter(p => p.quantity > 0 && p.quantity < 5 && !dismissedAlerts.includes(p.id));
  }, [products, dismissedAlerts]);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div className={`flex h-screen w-full font-sans overflow-hidden transition-colors duration-500 ${
        isDark ? 'bg-[#0b1120] text-slate-200' : 'bg-slate-50 text-slate-900'
      }`}>
        
        {isLoggedIn && (
          <>
            {(user.role === 'admin' || user.role === 'Administrator') ? (
              <AdminSideNav user={user} onLogout={handleLogout} />
            ) : (
              <ClerkSidenav user={user} onLogout={handleLogout} />
            )}
          </>
        )}

        <main className="flex-1 flex flex-col h-full overflow-y-auto relative scrollbar-hide">
          
          {isLoggedIn && activeAlerts.length > 0 && (
            <div className="fixed top-6 right-6 z-100 flex flex-col gap-3 pointer-events-none">
              {activeAlerts.map(item => (
                <div key={item.id} className={`pointer-events-auto p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-full w-80 border border-l-4 border-l-red-500 ${
                  isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="text-xl">⚠️</div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>Low Stock</h4>
                    <p className="text-xs text-slate-400">{item.name}: {item.quantity} left</p>
                  </div>
                  <button 
                    onClick={() => setDismissedAlerts(prev => [...prev, item.id])} 
                    className="text-slate-500 hover:text-white p-1"
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />  
            <Route path="/shop" element={<Navigate to="/clerk/order" replace />} />

            {/* 1. Common & Clerk Operations Routes (Clerks & Admins) */}
            <Route element={<ProtectedRoute allowedRoles={['clerk', 'staff', 'admin', 'administrator', 'manager']} />}>
              <Route path="/clerk/ClerkDashboard" element={<ClerkDashboard />} />
              <Route path="/clerk/location-map" element={<WarehouseLocationMap />} />
              <Route path="/clerk/stock-in" element={<InboundReceiving />} />
              <Route path="/clerk/order" element={<ClerkOrderManagement />} />
              <Route path="/clerk/cycle-count" element={<CycleCountReconciliation />} />
              <Route path="/clerk/clerkCalendar" element={<ClerkCalendar />} />
              <Route path="/clerk/clerkSetting" element={<ClerkSetting />} />
              <Route path="/clerk/clerkProfile" element={<ClerkProfile />} />
            </Route>

            {/* 2. Strictly Admin-Only Protected Routes (Restricted from Clerks) */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'administrator', 'manager']} />}>
              <Route path="/dashboard" element={<Dashboard products={products} fetchProducts={fetchProducts} activeAlertsCount={activeAlerts.length} />} />
              <Route path="/admin/location-map" element={<WarehouseLocationMap />} />
              <Route path="/admin/stock-in" element={<InboundReceiving />} />
              <Route path="/admin/purchase-orders" element={<PurchaseOrderManagement />} />
              <Route path="/admin/suppliers" element={<SupplierManagement />} />
              <Route path="/admin/reorder-requisition" element={<ReorderRequisition />} />
              <Route path="/admin/abc-analytics" element={<ABCAnalytics />} />
              <Route path="/admin/cycle-count" element={<CycleCountReconciliation />} />
              <Route path="/admin/report-studio" element={<ReportExportStudio />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/admin/settings" element={<AdminSetting />} /> 
              <Route path="/admin/view-profile" element={<AdminProfile />} />
              
              <Route path="/admin/users" element={<AdminManagement />} />
              <Route path="/admin/history" element={<AdminStockHistory />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/inquiries" element={<AdminContactRequest />} />
            </Route>

            {/* Backward compatibility / Staff aliases */}
            <Route path="/user_dashboard" element={<Navigate to="/clerk/ClerkDashboard" replace />} />
            <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
            <Route path="/clerk-dashboard" element={<Navigate to="/clerk/ClerkDashboard" replace />} />
            <Route path="/LandingPage" element={<Navigate to="/" replace />} />

            <Route path="*" element={
              <Navigate to={
                isLoggedIn 
                  ? (user.role === 'admin' || user.role === 'Administrator' ? "/dashboard" : "/clerk/ClerkDashboard") 
                  : "/"
              } replace />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}