import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import daygridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useTheme } from '../../context/ThemeContext';

const categoryStyles = {
  'Work Task': { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', hex: '#4361ee' },
  'Delivery': { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20', hex: '#10b981' },
  'Inventory Check': { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20', hex: '#f59e0b' },
  'Supplier Meeting': { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20', hex: '#a855f7' },
};

export default function Calendar() {
  const { isDark } = useTheme();
  const [events, setEvents] = useState([]);
  const [listSearch, setListSearch] = useState(""); 
  const [formData, setFormData] = useState({ title: '', date: '', category: 'Work Task' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

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
      // Ensures the date is in YYYY-MM-DD format for the input field
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
    <div className={`flex-1 flex flex-col min-w-0 transition-colors duration-500 ${isDark ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      <header className="p-8 border-b border-slate-200 dark:border-slate-800/50 bg-white/50 dark:bg-transparent backdrop-blur-md">
        <h1 className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>📅 Schedule</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className={`rounded-3xl border p-6 shadow-2xl ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'}`}>
          <FullCalendar
            key={isDark ? 'dark' : 'light'}
            plugins={[daygridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            height="450px"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' }}
            eventClick={(info) => {
                const evt = events.find(e => e.id == info.event.id);
                if(evt) startEdit(evt);
            }}
          />
        </div>

        <div className="flex flex-col xl:flex-row gap-8 pb-10">
          <aside className={`w-full xl:w-96 rounded-3xl border p-8 shadow-xl h-fit ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'}`}>
            <h2 className={`text-xl font-black mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {isEditing ? '📝 Edit Entry' : '➕ Add Entry'}
            </h2>
            <form onSubmit={handleSaveEntry} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Event Name</label>
                <input type="text" className={`w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-[#4361ee] ${isDark ? 'bg-[#0b1120] text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-200'}`} value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
              </div>
              
              {/* Added Target Date Input */}
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Target Date</label>
                <input type="date" className={`w-full rounded-xl px-4 py-3 text-sm outline-none focus:border-[#4361ee] ${isDark ? 'bg-[#0b1120] text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-200'}`} value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
              </div>

              <button type="submit" className={`w-full font-bold py-4 rounded-xl ${isEditing ? 'bg-amber-500' : 'bg-[#4361ee]'} text-white`}>
                {isEditing ? 'Update Schedule' : 'Add to Calendar'}
              </button>
              
              {isEditing && (
                <button type="button" onClick={() => { setIsEditing(false); setFormData({ title: '', date: '', category: 'Work Task' }); }} className="w-full text-slate-400 text-sm font-bold hover:text-red-500">
                  Cancel Edit
                </button>
              )}
            </form>
          </aside>

          <main className={`flex-1 rounded-3xl border overflow-hidden shadow-xl ${isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'}`}>
             <div className={`p-5 border-b ${isDark ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-50/50'}`}>
                <input type="text" placeholder="Search..." className={`w-full rounded-xl px-4 py-2 text-sm outline-none ${isDark ? 'bg-[#0b1120] text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200'}`} value={listSearch} onChange={(e) => setListSearch(e.target.value)} />
             </div>
             <table className="w-full text-left">
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
                    {filteredEvents.map(event => (
                        <tr key={event.id} className={`${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                            <td className={`p-5 px-8 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{event.title}</td>
                            <td className="p-5 px-8 text-right"><button onClick={() => handleDelete(event.id)}>🗑️</button></td>
                        </tr>
                    ))}
                </tbody>
             </table>
          </main>
        </div>
      </div>

      <style jsx global>{`
        .fc { --fc-border-color: ${isDark ? '#374151' : '#e2e8f0'} !important; }
        .fc-daygrid-day-number, .fc-col-header-cell-cushion, .fc-toolbar-title {
          color: ${isDark ? '#f8fafc' : '#0f172a'} !important;
        }
        .fc-daygrid-day { background-color: ${isDark ? '#111827' : '#ffffff'} !important; }
      `}</style>
    </div>
  );
}