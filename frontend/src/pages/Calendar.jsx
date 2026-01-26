export default function Calendar() {
  return (
    <div className="p-8 h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-white">Event Calendar</h1>
        <p className="text-slate-500 text-sm font-medium">Scheduled deliveries and festivals</p>
      </header>
      <div className="flex-1 bg-[#111827] rounded-3xl border border-slate-800 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📅</div>
          <h2 className="text-xl font-black text-white">Calendar View Coming Soon</h2>
          <p className="text-slate-500 max-w-xs mx-auto mt-2">Integrating with the schedule list from your dashboard.</p>
        </div>
      </div>
    </div>
  );
}