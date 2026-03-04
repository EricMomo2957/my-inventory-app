import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import daygridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import AdminSideNav from './admin_sidenav';

// 🎨 Centralized Category Styling Configuration
const categoryStyles = {
  'Work Task': { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', hex: '#4361ee' },
  'Delivery': { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', hex: '#10b981' },
  'Inventory Check': { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', hex: '#f59e0b' },
  'Supplier Meeting': { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20', hex: '#a855f7' },
};

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [listSearch, setListSearch] = useState(""); 
  const [formData, setFormData] = useState({ title: '', date: '', category: 'Work Task' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // Load events and map colors based on categoryStyles
  useEffect(() => {
    fetch('http://localhost:3000/api/schedules')
      .then(res => res.json())
      .then(data => {
        const formattedEvents = data.map(item => ({
          id: item.id,
          title: item.title || item.name,
          date: item.date,
          category: item.category,
          backgroundColor: categoryStyles[item.category]?.hex || '#4361ee',
          borderColor: 'transparent',
          allDay: true
        }));
        setEvents(formattedEvents);
      })
      .catch(err => console.error("Error loading events:", err));
  }, []);

  // 🔍 Logic: Filter table list based on Search input (Title or Category)
  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(listSearch.toLowerCase()) || 
    e.category.toLowerCase().includes(listSearch.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      const response = await fetch(`http://localhost:3000/api/schedules/${id}`, { method: 'DELETE' });
      if (response.ok) setEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) { console.error("Delete failed:", err); }
  };

  const startEdit = (event) => {
    setIsEditing(true);
    setEditId(event.id);
    setFormData({
      title: event.title,
      date: new Date(event.date).toISOString().split('T')[0],
      category: event.category || 'Work Task'
    });
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    const url = isEditing ? `http://localhost:3000/api/schedules/${editId}` : 'http://localhost:3000/api/schedules';
    try {
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setIsEditing(false);
        setFormData({ title: '', date: '', category: 'Work Task' });
        window.location.reload(); 
      }
    } catch (err) { console.error("Save failed:", err); }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0b1120] transition-colors duration-500">
      <AdminSideNav />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="p-8 border-b border-slate-200 dark:border-slate-800/50 bg-white/50 dark:bg-transparent backdrop-blur-md">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">📅 Schedule</h1>
          <p className="text-slate-500 text-sm font-medium">Manage arrivals and operations</p>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Calendar Section */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="calendar-wrapper">
              <FullCalendar
                plugins={[daygridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                events={events}
                height="450px"
                headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,dayGridWeek'
                }}
                eventClick={(info) => {
                    const evt = events.find(e => e.id == info.event.id);
                    if(evt) startEdit(evt);
                }}
              />
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-8 pb-10">
            {/* Entry Form */}
            <aside className="w-full xl:w-96 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl h-fit">
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">
                {isEditing ? '📝 Edit Entry' : '➕ Add Entry'}
              </h2>
              <form onSubmit={handleSaveEntry} className="space-y-5">
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Event Name</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:border-[#4361ee]" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Target Date</label>
                  <input type="date" className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:border-[#4361ee] color-scheme-light dark:color-scheme-dark" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Category</label>
                  <select className="w-full bg-slate-50 dark:bg-[#0b1120] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:border-[#4361ee]" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                    {Object.keys(categoryStyles).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                    <button type="submit" className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 ${isEditing ? 'bg-amber-500 text-black' : 'bg-[#4361ee] text-white shadow-indigo-500/20 hover:bg-indigo-500'}`}>
                    {isEditing ? 'Update Schedule' : 'Add to Calendar'}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={() => { setIsEditing(false); setFormData({title: '', date: '', category: 'Work Task'}); }} className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                            Cancel Edit
                        </button>
                    )}
                </div>
              </form>
            </aside>

            {/* Searchable Table */}
            <main className="flex-1 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl flex flex-col">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center gap-4">
                <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search by event or category..." 
                        className="w-full bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm dark:text-white outline-none focus:border-[#4361ee] transition-all"
                        value={listSearch}
                        onChange={(e) => setListSearch(e.target.value)}
                    />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="p-5 px-8 text-[10px] font-black uppercase text-slate-500 tracking-widest">Date</th>
                      <th className="p-5 px-8 text-[10px] font-black uppercase text-slate-500 tracking-widest">Event Details</th>
                      <th className="p-5 px-8 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {filteredEvents.length > 0 ? filteredEvents.map((event) => {
                      const style = categoryStyles[event.category] || categoryStyles['Work Task'];
                      return (
                        <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                          <td className="p-5 px-8 text-sm text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                            {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="p-5 px-8">
                            <div className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">{event.title}</div>
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase border ${style.bg} ${style.text} ${style.border}`}>
                              {event.category}
                            </span>
                          </td>
                          <td className="p-5 px-8 text-right space-x-2">
                            <button onClick={() => startEdit(event)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:bg-[#4361ee] hover:text-white transition-all shadow-sm">✏️</button>
                            <button onClick={() => handleDelete(event.id)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">🗑️</button>
                          </td>
                        </tr>
                      );
                    }) : (
                        <tr>
                            <td colSpan="3" className="p-12 text-center text-slate-400 italic text-sm">No schedules matching your search.</td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </main>
          </div>
        </div>
      </div>

      <style jsx>{`
        .calendar-wrapper :global(.fc) { --fc-border-color: rgba(203, 213, 225, 0.1); --fc-button-bg-color: #4361ee; }
        .calendar-wrapper :global(.fc-daygrid-day-number) { color: #64748b; font-weight: 800; padding: 8px; text-decoration: none !important; }
        .calendar-wrapper :global(.fc-col-header-cell-cushion) { color: #94a3b8; text-transform: uppercase; font-size: 10px; font-weight: 900; text-decoration: none !important; }
        .calendar-wrapper :global(.fc-toolbar-title) { font-weight: 900 !important; font-size: 1.1rem !important; }
        :global(.dark) .calendar-wrapper :global(.fc-toolbar-title) { color: #f8fafc; }
        .color-scheme-dark { color-scheme: dark; }
      `}</style>
    </div>
  );
}