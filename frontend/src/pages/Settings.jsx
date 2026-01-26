export default function Settings() {
  const settings = ["General", "Security", "Notifications", "App Preferences"];
  
  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-black text-white">Settings</h1>
        <p className="text-slate-500 text-sm font-medium">Configure your system preferences</p>
      </header>
      <div className="space-y-4">
        {settings.map(item => (
          <div key={item} className="bg-[#111827] p-6 rounded-2xl border border-slate-800 flex justify-between items-center hover:border-[#4361ee] transition-colors cursor-pointer group">
            <span className="text-white font-bold">{item}</span>
            <span className="text-slate-600 group-hover:text-[#4361ee] transition-colors">→</span>
          </div>
        ))}
      </div>
    </div>
  );
}