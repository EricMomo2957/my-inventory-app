import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ClerkSidenav from './ClerkSidenav';

export default function ClerkCalendar() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({ title: '', date: '', category: 'Work Task' });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
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
          backgroundColor: item.category === 'Delivery' ? '#10b981' : '#3b82f6',
          borderColor: 'transparent'
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
        window.location.reload(); 
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  return (
    <div className={`flex min-h-screen w-full transition-colors duration-300 ${isDarkMode ? 'bg-[#0b1120]' : 'bg-slate-50'}`}>
      <ClerkSidenav />

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            📅 Delivery & Task Schedule
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage upcoming stock arrivals and team tasks</p>
        </header>

        {/* CALENDAR DISPLAY */}
        <div className={`rounded-2xl p-6 mb-8 shadow-2xl ${isDarkMode ? 'bg-white' : 'bg-white border border-slate-200'}`}>
          <div className="calendar-container">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
          {/* ADD/EDIT FORM */}
          <section className="lg:col-span-1 bg-[#111827] rounded-2xl border border-slate-800 p-6 shadow-xl h-fit">
            <h2 className="text-xl font-bold text-white mb-6">
              {isEditing ? '📝 Edit Entry' : '➕ Add New Entry'}
            </h2>
            <form onSubmit={handleSaveEntry} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 mb-2">Event Name</label>
                <input 
                  type="text" 
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                  placeholder="e.g. Harvest Festival"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 mb-2">Target Date</label>
                <input 
                  type="date" 
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white color-scheme-dark outline-none"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-black text-slate-500 mb-2">Category</label>
                <select 
                  className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white outline-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Work Task">💼 Work Task</option>
                  <option value="Delivery">🚚 Delivery</option>
                  <option value="Inventory Check">📋 Inventory Check</option>
                  <option value="Supplier Meeting">🤝 Supplier Meeting</option>
                </select>
              </div>
              <button type="submit" className={`w-full font-black py-4 rounded-xl transition-all shadow-lg ${isEditing ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'}`}>
                {isEditing ? 'Update Schedule' : 'Add to Calendar'}
              </button>
            </form>
          </section>

          {/* EVENTS LIST TABLE */}
          <section className="lg:col-span-2 bg-[#111827] rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left">
              <thead className="bg-[#0b1120] border-b border-slate-800">
                <tr>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-500">Date</th>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-500">Event</th>
                  <th className="p-5 text-[10px] font-black uppercase text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-5 text-sm text-slate-400">{new Date(event.date).toLocaleDateString()}</td>
                    <td className="p-5 text-sm font-bold text-white">{event.title}</td>
                    <td className="p-5 text-right space-x-2">
                      <button onClick={() => startEdit(event)} className="text-blue-400 hover:text-blue-300 font-bold text-xs uppercase">Edit</button>
                      <button onClick={() => handleDelete(event.id)} className="text-red-500 hover:text-red-400 font-bold text-xs uppercase">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>

      <style>{`
        .calendar-container { color: #1e293b; }
        .fc-toolbar-title { font-weight: 900 !important; font-size: 1.1rem !important; text-transform: uppercase; letter-spacing: 1px; }
        .fc-button-primary { background-color: #3b82f6 !important; border: none !important; font-weight: bold !important; border-radius: 8px !important; }
        .color-scheme-dark { color-scheme: dark; }
      `}</style>
    </div>
  );
}