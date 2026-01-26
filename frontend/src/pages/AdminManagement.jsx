export default function AdminManagement() {
  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white">Admin Management</h1>
          <p className="text-slate-500 text-sm font-medium text-orange-500/80">Restricted Area: Administrators Only</p>
        </div>
        <button className="bg-orange-500 hover:bg-orange-400 text-white px-6 py-2.5 rounded-xl font-bold shadow-xl shadow-orange-600/20 active:scale-95 transition-all">+ New User</button>
      </header>
      
      <div className="bg-[#111827] rounded-3xl border border-orange-500/20 p-8">
        <div className="flex items-center gap-4 text-orange-500 bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20">
          <span className="text-2xl">🛡️</span>
          <p className="text-sm font-bold">You are currently managing system permissions and high-level security roles.</p>
        </div>
      </div>
    </div>
  );
}