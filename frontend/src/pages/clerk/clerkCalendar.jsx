import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function ClerkCalendar() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({ title: '', date: '', category: 'Work Task' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Handled via local storage to match global theme state
  const isDarkMode = localStorage.getItem('landingTheme') === 'dark';

  // Load events from backend
  useEffect(() => {
    fetch('http://localhost:3000/api/schedules')
      .then(res => res.json())
      .then(data => {
        const formattedEvents = data.map(item => ({
          id: item.id,
          title: item.title || item.name,
          date: item.date,
          category: item.category,
          backgroundColor: item.category === 'Delivery' ? '#10b981' : '#4361ee',
          borderColor: 'transparent',
          classNames: ['custom-event-card']
        }));
        setEvents(formattedEvents);
      })
      .catch(err => console.error("Error loading events:", err));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this event?")) return;
    try {
      const response = await fetch(`http://localhost:3000/api/schedules/${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) {
        setEvents(prev => prev.filter(event => event.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const startEdit = (event) => {
    setIsEditing(true);
    setEditId(event.id);
    const formattedDate = new Date(event.date).toISOString().split('T')[0];
    setFormData({ title: event.title, date: formattedDate, category: event.category || 'Work Task' });
    // Scroll to form smoothly
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return alert("Please fill in all fields");

    const url = isEditing ? `http://localhost:3000/api/schedules/${editId}` : 'http://localhost:3000/api/schedules';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Optimistic update or refresh
        window.location.reload(); 
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  return (
    <div className={`w-full transition-colors duration-300 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      
      <main className="p-6 lg:p-10 max-w-7xl mx-auto">
        <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            📅 Delivery & Task Schedule
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage upcoming stock arrivals and team tasks</p>
        </header>

        {/* CALENDAR DISPLAY - Glassmorphism Update */}
        <div className={`rounded-3xl p-8 mb-10 backdrop-blur-md shadow-2xl animate-in zoom-in-95 duration-500 ${
          isDarkMode ? 'bg-[#111827]/40 border border-slate-800' : 'bg-white border border-slate-200'
        }`}>
          <div className="calendar-container">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              height="600px"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,dayGridWeek'
              }}
              eventClick={(info) => alert('Task: ' + info.event.title)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          {/* ADD/EDIT FORM - Dark Glassmorphism */}
          <section className={`lg:col-span-1 rounded-3xl border p-8 shadow-2xl h-fit backdrop-blur-md ${
            isDarkMode ? 'bg-[#111827]/60 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              {isEditing ? '📝 Edit Schedule' : '➕ New Entry'}
            </h2>
            <form onSubmit={handleSaveEntry} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2 ml-1">Event Name</label>
                <input 
                  type="text" 
                  className="w-full bg-[#0b1120] border border-slate-800 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-[#4361ee] transition-all"
                  placeholder="e.g. Weekly Restock"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2 ml-1">Target Date</label>
                <input 
                  type="date" 
                  className="w-full bg-[#0b1120] border border-slate-800 rounded-xl px-5 py-4 text-sm text-white color-scheme-dark outline-none focus:border-[#4361ee] transition-all"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2 ml-1">Category</label>
                <select 
                  className="w-full bg-[#0b1120] border border-slate-800 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-[#4361ee] transition-all appearance-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Work Task">💼 Work Task</option>
                  <option value="Delivery">🚚 Delivery</option>
                  <option value="Inventory Check">📋 Inventory Check</option>
                  <option value="Supplier Meeting">🤝 Supplier Meeting</option>
                </select>
              </div>
              <button type="submit" className={`w-full font-black py-4 rounded-xl transition-all shadow-xl active:scale-95 ${
                isEditing 
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20' 
                  : 'bg-[#4361ee] hover:bg-[#3651d4] text-white shadow-[#4361ee]/20'
              }`}>
                {isEditing ? 'Update Schedule' : 'Confirm Entry'}
              </button>
              {isEditing && (
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-full text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </section>

          {/* EVENTS LIST TABLE - Dark Glassmorphism */}
          <section className={`lg:col-span-2 rounded-3xl border overflow-hidden shadow-2xl backdrop-blur-md ${
            isDarkMode ? 'bg-[#111827]/40 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <table className="w-full text-left">
              <thead className="bg-[#0b1120]/50 border-b border-slate-800">
                <tr>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Schedule Date</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Task Details</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-blue-500/5 transition-colors group">
                    <td className="p-6 text-sm text-slate-400 font-mono">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-6">
                      <div className="text-sm font-bold text-white mb-1">{event.title}</div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                        event.category === 'Delivery' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {event.category}
                      </span>
                    </td>
                    <td className="p-6 text-right space-x-4">
                      <button onClick={() => startEdit(event)} className="text-[#4361ee] hover:text-white font-black text-[10px] uppercase tracking-widest transition-colors">Edit</button>
                      <button onClick={() => handleDelete(event.id)} className="text-red-500/70 hover:text-red-400 font-black text-[10px] uppercase tracking-widest transition-colors">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>

      <style>{`
        .calendar-container { color: #fff; }
        .fc-theme-standard td, .fc-theme-standard th { border: 1px solid rgba(255,255,255,0.05) !important; }
        .fc-theme-standard .fc-scrollgrid { border: none !important; }
        .fc-daygrid-day-number { font-weight: bold; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #64748b; padding: 10px !important; }
        .fc-col-header-cell-cushion { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #475569; padding: 15px 0 !important; }
        .fc-toolbar-title { font-weight: 900 !important; font-size: 1.2rem !important; text-transform: uppercase; letter-spacing: 2px; color: #fff; }
        .fc-button-primary { background-color: #1e293b !important; border: 1px solid #334155 !important; font-weight: 900 !important; font-size: 10px !important; text-transform: uppercase; border-radius: 12px !important; padding: 8px 16px !important; }
        .fc-button-active { background-color: #4361ee !important; border-color: #4361ee !important; }
        .fc-event { border-radius: 6px !important; padding: 2px 5px !important; font-size: 10px !important; font-weight: 800 !important; border: none !important; }
        .color-scheme-dark { color-scheme: dark; }
      `}</style>
    </div>
  );
}