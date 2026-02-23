import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useTheme } from '../../context/ThemeContext'; // Adjust path as needed

export default function UserCalendarView() {
  const { isDark } = useTheme();
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({ title: '', date: '', category: 'Personal Task' });
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
          backgroundColor: item.category === 'Delivery' ? '#10b981' : '#6366f1',
          borderColor: 'transparent'
        }));
        setEvents(formattedEvents);
      })
      .catch(err => console.error("Error loading events:", err));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this event from your calendar?")) return;
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
    setFormData({
      title: event.title,
      date: formattedDate,
      category: event.category || 'Personal Task'
    });
  };

  const handleSaveEntry = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return alert("Please fill in all fields");

    const url = isEditing 
      ? `http://localhost:3000/api/schedules/${editId}` 
      : 'http://localhost:3000/api/schedules';
    
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsEditing(false);
        setEditId(null);
        setFormData({ title: '', date: '', category: 'Personal Task' });
        const refreshed = await fetch('http://localhost:3000/api/schedules').then(r => r.json());
        setEvents(refreshed.map(item => ({
          id: item.id,
          title: item.title || item.name,
          date: item.date,
          category: item.category,
          backgroundColor: item.category === 'Delivery' ? '#10b981' : '#6366f1',
          borderColor: 'transparent'
        })));
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto p-10 transition-colors duration-500 ${
      isDark ? 'bg-[#0b1120]' : 'bg-slate-50'
    }`}>
      <header className="mb-8">
        <h1 className={`text-3xl font-black flex items-center gap-3 ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          📅 My Schedule & Requests
        </h1>
        <p className="text-slate-500 font-medium">Manage your personal tasks and view delivery dates</p>
      </header>

      {/* TOP SECTION: CALENDAR */}
      <div className={`rounded-3xl p-6 mb-8 shadow-xl calendar-container overflow-hidden transition-colors ${
        isDark ? 'bg-[#111827] border border-slate-800' : 'bg-white border border-slate-200'
      }`}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="500px"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
          }}
          eventClick={(info) => alert('Event: ' + info.event.title)}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 pb-10">
        {/* FORM SECTION */}
        <div className={`w-full lg:w-96 rounded-3xl border p-8 shadow-xl h-fit transition-colors ${
          isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {isEditing ? '📝 Update Entry' : '➕ Request New Entry'}
          </h2>
          <form onSubmit={handleSaveEntry} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Description</label>
              <input 
                type="text" 
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-500 transition-all ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
                placeholder="e.g. Pickup Order #123"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Date</label>
              <input 
                type="date" 
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
                style={{ colorScheme: isDark ? 'dark' : 'light' }}
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Type</label>
              <select 
                className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Personal Task">💼 Personal Task</option>
                <option value="Delivery">🚚 Delivery Request</option>
                <option value="Meeting">🤝 Meeting</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-3 pt-2">
              <button 
                type="submit"
                className={`w-full font-black py-4 rounded-xl transition-all shadow-lg ${
                  isEditing 
                  ? 'bg-amber-500 hover:bg-amber-400 text-black' 
                  : 'bg-[#4361ee] hover:bg-blue-700 text-white shadow-blue-600/20'
                }`}
              >
                {isEditing ? 'Save Changes' : 'Submit Request'}
              </button>
              
              {isEditing && (
                <button 
                  type="button" 
                  onClick={() => { setIsEditing(false); setFormData({title:'', date:'', category:'Personal Task'}); }}
                  className={`w-full font-bold py-3 rounded-xl text-xs transition-colors ${
                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-200 hover:bg-slate-300 text-slate-600'
                  }`}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* TABLE SECTION */}
        <div className={`flex-1 rounded-3xl border overflow-hidden shadow-xl transition-colors ${
          isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <table className="w-full text-left">
            <thead className={`border-b transition-colors ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <tr>
                <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Date</th>
                <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Event</th>
                <th className="p-5 text-[10px] font-black uppercase text-slate-500 text-center tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/50' : 'divide-slate-100'}`}>
              {events.length > 0 ? events.map((event) => (
                <tr key={event.id} className={`transition-colors ${
                  isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'
                }`}>
                  <td className={`p-5 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {new Date(event.date).toLocaleDateString()}
                  </td>
                  <td className={`p-5 text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{event.title}</td>
                  <td className="p-5 text-center space-x-3">
                    <button onClick={() => startEdit(event)} className="text-indigo-500 hover:text-indigo-400 font-black text-[10px] uppercase tracking-tighter">Edit</button>
                    <button onClick={() => handleDelete(event.id)} className="text-red-500 hover:text-red-400 font-black text-[10px] uppercase tracking-tighter">Remove</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="p-20 text-center text-slate-400 italic">No scheduled events yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .fc-toolbar-title { 
          font-weight: 900 !important; 
          font-size: 1.1rem !important; 
          text-transform: uppercase; 
          color: ${isDark ? '#ffffff' : '#1e293b'} !important; 
        }
        .fc-button-primary { 
          background-color: #4361ee !important; 
          border: none !important; 
          font-weight: bold !important; 
          border-radius: 12px !important; 
        }
        .fc-daygrid-day-number { 
          color: ${isDark ? '#94a3b8' : '#1e293b'} !important; 
          font-weight: bold; 
          padding: 8px !important;
        }
        .fc-col-header-cell-cushion { 
          color: ${isDark ? '#64748b' : '#1e293b'} !important;
          text-transform: uppercase;
          font-size: 0.7rem;
          font-weight: 800;
        }
        /* Grid Lines */
        .fc td, .fc th { 
          border-color: ${isDark ? '#1e293b' : '#e2e8f0'} !important; 
        }
        .fc-theme-standard .fc-scrollgrid { 
          border-color: ${isDark ? '#1e293b' : '#e2e8f0'} !important; 
        }
      `}</style>
    </div>
  );
}