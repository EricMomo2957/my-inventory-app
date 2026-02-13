import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function Calendar() {
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
          category: item.category, // Storing raw category for the edit form
          backgroundColor: item.category === 'Delivery' ? '#10b981' : '#3b82f6',
          borderColor: 'transparent'
        }));
        setEvents(formattedEvents);
      })
      .catch(err => console.error("Error loading events:", err));
  }, []);

  // --- DELETE FUNCTION ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this event?")) return;

    try {
      const response = await fetch(`http://localhost:3000/api/schedules/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        setEvents(prev => prev.filter(event => event.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  // --- PREPARE EDIT ---
  const startEdit = (event) => {
    setIsEditing(true);
    setEditId(event.id);
    // Format date to YYYY-MM-DD for the date input
    const formattedDate = new Date(event.date).toISOString().split('T')[0];
    setFormData({
      title: event.title,
      date: formattedDate,
      category: event.category || 'Work Task'
    });
  };

  // --- SAVE FUNCTION (Handles both Add and Update) ---
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
        setFormData({ title: '', date: '', category: 'Work Task' });
        window.location.reload(); 
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  return (
    <div className="p-6 h-screen bg-[#0b1120] text-slate-300 overflow-y-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          📅 Delivery & Task Schedule
        </h1>
        <p className="text-slate-500 text-sm mt-1">Manage upcoming stock arrivals and team tasks</p>
      </header>

      {/* TOP SECTION: THE ACTUAL CALENDAR */}
      <div className="bg-white rounded-xl p-4 mb-8 shadow-2xl calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="450px"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
          }}
          eventClick={(info) => alert('Event: ' + info.event.title)}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 pb-10">
        {/* SIDEBAR: ADD/EDIT FORM */}
        <aside className="w-full lg:w-80 bg-[#111827] rounded-xl border border-slate-800 p-6 shadow-xl h-fit">
          <h2 className="text-xl font-bold text-white mb-6">
            {isEditing ? '📝 Edit Entry' : '➕ Add New Entry'}
          </h2>
          <form onSubmit={handleSaveEntry} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-500 mb-2">Event Name</label>
              <input 
                type="text" 
                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-blue-500"
                placeholder="e.g. Harvest Festival"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-500 mb-2">Target Date</label>
              <input 
                type="date" 
                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2 text-sm text-white color-scheme-dark outline-none"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-black text-slate-500 mb-2">Category</label>
              <select 
                className="w-full bg-[#1e293b] border border-slate-700 rounded-lg px-4 py-2 text-sm text-white outline-none"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Work Task">💼 Work Task</option>
                <option value="Delivery">🚚 Delivery</option>
                <option value="Inventory Check">📋 Inventory Check</option>
                <option value="Supplier Meeting">🤝 Supplier Meeting</option>
              </select>
            </div>
            
            <div className="flex flex-col gap-2 pt-2">
              <button 
                type="submit"
                className={`w-full font-black py-3 rounded-lg transition-all shadow-lg ${
                  isEditing ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                }`}
              >
                {isEditing ? 'Update Schedule' : 'Add to Calendar'}
              </button>
              
              {isEditing && (
                <button 
                  type="button"
                  onClick={() => { setIsEditing(false); setFormData({title:'', date:'', category:'Work Task'}); }}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg text-xs"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </aside>

        {/* TABLE LIST */}
        <main className="flex-1 bg-[#111827] rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0b1120] border-b border-slate-800">
              <tr>
                <th className="p-4 px-6 text-[10px] font-black uppercase text-slate-500">Date</th>
                <th className="p-4 px-6 text-[10px] font-black uppercase text-slate-500">Event Description</th>
                <th className="p-4 px-6 text-[10px] font-black uppercase text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {events.length > 0 ? events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 px-6 text-sm text-slate-400">
                    {new Date(event.date).toLocaleDateString()}
                  </td>
                  <td className="p-4 px-6 text-sm font-bold text-white">{event.title}</td>
                  <td className="p-4 px-6 text-center space-x-2">
                    <button 
                      onClick={() => startEdit(event)}
                      className="bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white px-3 py-1 rounded text-[10px] font-bold border border-blue-500/20 transition-all"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(event.id)}
                      className="bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1 rounded text-[10px] font-bold border border-red-500/20 transition-all"
                    >
                      🗑️ Remove
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="p-10 text-center text-slate-600 italic">No events found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </main>
      </div>

      <style jsx>{`
        .calendar-container { color: #334155; }
        .fc-toolbar-title { font-weight: 900 !important; font-size: 1.25rem !important; }
        .fc-button-primary { background-color: #3b82f6 !important; border: none !important; text-transform: capitalize !important; font-weight: bold !important; }
        .color-scheme-dark { color-scheme: dark; }
      `}</style>
    </div>
  );
}