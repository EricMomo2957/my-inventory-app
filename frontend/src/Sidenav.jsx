import React from 'react';

function NavItem({ icon, label, active = false, color = "text-slate-400" }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${active ? 'bg-[#4361ee]/10 text-[#4361ee]' : `hover:bg-slate-800/50 hover:text-white ${color}`}`}>
      <span className="text-lg w-6">{icon}</span> {label}
    </button>
  );
}

export function Sidenav({ user, onLogout }) {
  return (
    <aside className="w-64 bg-[#111827] border-r border-slate-800 flex flex-col shrink-0 h-screen">
      <div className="p-7 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#4361ee] rounded-xl flex items-center justify-center shadow-lg text-xl">📦</div>
        <h2 className="text-lg font-bold text-white tracking-tight">Inventory Pro</h2>
      </div>
      
      <div className="mx-4 mb-6 p-3 bg-[#1e293b] border border-slate-800 rounded-xl flex items-center gap-3">
        <div className="w-10 h-10 bg-[#4361ee] rounded-lg flex items-center justify-center text-white font-bold">
          {user.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white truncate w-28">{user.name}</span>
          <small className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{user.role}</small>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase mb-2 mt-4">Main Menu</p>
        <NavItem icon="🏠" label="Dashboard" active />
        <NavItem icon="🛒" label="Customer Orders" />
        <NavItem icon="📅" label="Calendar" />
        
        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase mb-2 mt-6">User Account</p>
        <NavItem icon="👤" label="Profile" />
        <NavItem icon="⚙️" label="Settings" />
        {user.role === "Administrator" && (
          <NavItem icon="🛡️" label="Admin Management" color="text-amber-500" />
        )}
      </nav>

      <div className="p-4 border-t border-slate-800 mt-auto">
        <button 
          onClick={onLogout} 
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-400 bg-red-400/10 rounded-lg hover:bg-red-500 hover:text-white transition-all"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}