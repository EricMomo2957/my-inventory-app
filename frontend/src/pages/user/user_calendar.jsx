import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function UserCalendarView() {
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
        // Refresh local state instead of reloading page for a smoother SPA experience
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
    <div className="flex-1 overflow-y-auto p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          📅 My Schedule & Requests
        </h1>
        <p className="text-slate-500 font-medium">Manage your personal tasks and view delivery dates</p>
      </header>

      {/* TOP SECTION: CALENDAR */}
      <div className="bg-white rounded-3xl p-6 mb-8 shadow-xl calendar-container overflow-hidden">
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
        <div className="w-full lg:w-96 bg-slate-900/50 rounded-3xl border border-slate-800 p-8 shadow-xl h-fit">
          <h2 className="text-xl font-bold text-white mb-6">
            {isEditing ? '📝 Update Entry' : '➕ Request New Entry'}
          </h2>
          <form onSubmit={handleSaveEntry} className="space-y-5">
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Description</label>
              <input 
                type="text" 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                placeholder="e.g. Pickup Order #123"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Date</label>
              <input 
                type="date" 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none"
                style={{ colorScheme: 'dark' }}
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-500 mb-2 tracking-widest">Type</label>
              <select 
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none"
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
                  isEditing ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-[#4361ee] hover:bg-blue-700 text-white shadow-blue-600/20'
                }`}
              >
                {isEditing ? 'Save Changes' : 'Submit Request'}
              </button>
              
              {isEditing && (
                <button 
                  type="button" 
                  onClick={() => { setIsEditing(false); setFormData({title:'', date:'', category:'Personal Task'}); }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold py-3 rounded-xl text-xs"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* TABLE SECTION */}
        <div className="flex-1 bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left">
            <thead className="bg-slate-950 border-b border-slate-800">
              <tr>
                <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Date</th>
                <th className="p-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Event</th>
                <th className="p-5 text-[10px] font-black uppercase text-slate-500 text-center tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {events.length > 0 ? events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-5 text-sm text-slate-400 font-medium">
                    {new Date(event.date).toLocaleDateString()}
                  </td>
                  <td className="p-5 text-sm font-bold text-white">{event.title}</td>
                  <td className="p-5 text-center space-x-3">
                    <button onClick={() => startEdit(event)} className="text-indigo-400 hover:text-indigo-300 font-black text-[10px] uppercase tracking-tighter">Edit</button>
                    <button onClick={() => handleDelete(event.id)} className="text-red-500 hover:text-red-400 font-black text-[10px] uppercase tracking-tighter">Remove</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="p-20 text-center text-slate-600 italic">No scheduled events yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .calendar-container { color: #1e293b; }
        .fc-toolbar-title { font-weight: 900 !important; font-size: 1.1rem !important; text-transform: uppercase; color: #1e293b; }
        .fc-button-primary { background-color: #4361ee !important; border: none !important; font-weight: bold !important; border-radius: 12px !important; }
        .fc-daygrid-day-number { color: #1e293b; font-weight: bold; text-decoration: none; }
      `}</style>
    </div>
  );
}