import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useTheme } from '../../context/ThemeContext'; // Use context for instant toggle

export default function ClerkCalendar() {
  const { isDark } = useTheme(); // Listen to global theme
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({ title: '', date: '', category: 'Work Task' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

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
        }));
        setEvents(formattedEvents);
      })
      .catch(err => console.error("Error loading events:", err));
  }, []);

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
      if (response.ok) window.location.reload(); 
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const startEdit = (event) => {
    setIsEditing(true);
    setEditId(event.id);
    const formattedDate = new Date(event.date).toISOString().split('T')[0];
    setFormData({ title: event.title, date: formattedDate, category: event.category || 'Work Task' });
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const response = await fetch(`http://localhost:3000/api/schedules/${id}`, { method: 'DELETE' });
      if (response.ok) setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) { console.error(err); }
  };

  return (
    <div className={`w-full min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0b1120] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <main className="p-6 lg:p-10 max-w-7xl mx-auto">
        <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className={`text-3xl font-black flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            📅 Delivery & Task Schedule
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage upcoming stock arrivals and team tasks</p>
        </header>

        {/* CALENDAR DISPLAY */}
        <div className={`rounded-3xl p-8 mb-10 backdrop-blur-md shadow-2xl transition-all ${
          isDark ? 'bg-[#111827]/40 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className={`calendar-container ${isDark ? 'dark-mode' : 'light-mode'}`}>
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
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          {/* FORM SECTION */}
          <section className={`lg:col-span-1 rounded-3xl border p-8 shadow-2xl h-fit ${
            isDark ? 'bg-[#111827]/60 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h2 className={`text-xl font-black mb-6 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isEditing ? '📝 Edit Schedule' : '➕ New Entry'}
            </h2>
            <form onSubmit={handleSaveEntry} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2 ml-1">Event Name</label>
                <input 
                  type="text" 
                  className={`w-full border rounded-xl px-5 py-4 text-sm outline-none focus:border-[#4361ee] transition-all ${
                    isDark ? 'bg-[#0b1120] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                  placeholder="e.g. Weekly Restock"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2 ml-1">Target Date</label>
                <input 
                  type="date" 
                  className={`w-full border rounded-xl px-5 py-4 text-sm outline-none focus:border-[#4361ee] transition-all ${
                    isDark ? 'bg-[#0b1120] border-slate-800 text-white color-scheme-dark' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 tracking-widest mb-2 ml-1">Category</label>
                <select 
                  className={`w-full border rounded-xl px-5 py-4 text-sm outline-none focus:border-[#4361ee] transition-all appearance-none ${
                    isDark ? 'bg-[#0b1120] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
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
                isEditing ? 'bg-amber-500 text-black' : 'bg-[#4361ee] text-white'
              }`}>
                {isEditing ? 'Update Schedule' : 'Confirm Entry'}
              </button>
            </form>
          </section>

          {/* TABLE SECTION */}
          <section className={`lg:col-span-2 rounded-3xl border overflow-hidden shadow-2xl ${
            isDark ? 'bg-[#111827]/40 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <table className="w-full text-left">
              <thead className={`${isDark ? 'bg-[#0b1120]/50 border-slate-800' : 'bg-slate-50 border-slate-200'} border-b`}>
                <tr>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Date</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Details</th>
                  <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-blue-500/5 transition-colors">
                    <td className={`p-6 text-sm font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-6">
                      <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{event.title}</div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${
                        event.category === 'Delivery' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {event.category}
                      </span>
                    </td>
                    <td className="p-6 text-right space-x-4">
                      <button onClick={() => startEdit(event)} className="text-[#4361ee] font-black text-[10px] uppercase">Edit</button>
                      <button onClick={() => handleDelete(event.id)} className="text-red-500/70 font-black text-[10px] uppercase">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>

      <style>{`
        /* Dynamic Calendar Styling */
        .dark-mode { --fc-text-color: #fff; --fc-border-color: rgba(255,255,255,0.1); --fc-button-bg: #1e293b; }
        .light-mode { --fc-text-color: #1e293b; --fc-border-color: #e2e8f0; --fc-button-bg: #f8fafc; }

        .calendar-container { color: var(--fc-text-color); }
        .fc-theme-standard td, .fc-theme-standard th { border: 1px solid var(--fc-border-color) !important; }
        .fc-daygrid-day-number { font-weight: 900; color: #64748b; padding: 8px !important; }
        .fc-col-header-cell-cushion { font-size: 10px; font-weight: 900; text-transform: uppercase; color: #64748b; }
        .fc-toolbar-title { font-weight: 900 !important; font-size: 1.1rem !important; color: var(--fc-text-color); }
        .fc-button-primary { background-color: var(--fc-button-bg) !important; color: var(--fc-text-color) !important; border: 1px solid var(--fc-border-color) !important; font-weight: 900 !important; font-size: 10px !important; text-transform: uppercase; border-radius: 8px !important; }
        .fc-button-active { background-color: #4361ee !important; border-color: #4361ee !important; color: white !important; }
        .fc-event { border-radius: 4px !important; font-size: 10px !important; font-weight: 800 !important; padding: 2px 4px !important; }
        .color-scheme-dark { color-scheme: dark; }
      `}</style>
    </div>
  );
}