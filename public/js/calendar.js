
let calendar; // Global calendar variable

document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    
    // Initialize FullCalendar
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        events: async function(info, successCallback, failureCallback) {
            try {
                const res = await fetch('/api/schedules');
                const data = await res.json();
                
                // Map your DB data to FullCalendar format
                const events = data.map(item => ({
                    id: item.id,
                    title: item.title,
                    start: item.date, // Must be YYYY-MM-DD
                    extendedProps: { type: item.type },
                    backgroundColor: item.type === 'Delivery' ? '#4361ee' : '#f72585'
                }));
                successCallback(events);
            } catch (err) { failureCallback(err); }
        }
    });
    
    calendar.render();
});

// Update your existing Add Event function to refresh the calendar
async function refreshDisplay() {
    // 1. Refresh your table (existing logic)
    loadScheduleTable(); 
    
    // 2. Refresh the visual calendar
    if (calendar) calendar.refetchEvents();
}

/**
 * THEME INITIALIZATION
 * Apply dark mode immediately based on localStorage state
 */
function applyCurrentTheme() {
    const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// Run theme check immediately
applyCurrentTheme();

// Target DOM elements
const scheduleForm = document.getElementById('scheduleForm');
const scheduleTableBody = document.getElementById('scheduleTableBody');

/**
 * FETCH AND DISPLAY SCHEDULES
 * Gets data from MySQL and renders it with color-coded badges
 */
async function loadSchedules() {
    try {
        const res = await fetch('/api/schedules');
        const schedules = await res.json();
        
        if (!scheduleTableBody) return;

        // Render rows with dynamic badge classes based on type
        // Replace the mapping logic inside loadSchedules()
        scheduleTableBody.innerHTML = schedules.map(s => {
            // Standardize the type for the CSS class (Removes spaces and converts to lowercase)
            const typeClass = s.type.toLowerCase().replace(/\s+/g, '-');

            return `
                <tr>
                    <td><strong>${new Date(s.schedule_date).toLocaleDateString()}</strong></td>
                    <td>${s.title}</td>
                    <td><span class="category-badge badge-${typeClass}">${s.type}</span></td>
                    <td style="text-align: right;">
                        <button class="btn-table delete-btn" onclick="deleteSchedule(${s.id})">🗑️ Remove</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error("Error loading schedules:", err);
    }
}

/**
 * SAVE NEW SCHEDULE
 * Sends form data to the Node.js backend
 */
if (scheduleForm) {
    scheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            title: document.getElementById('schedTitle').value,
            schedule_date: document.getElementById('schedDate').value,
            type: document.getElementById('schedType').value
        };

        try {
            const res = await fetch('/api/schedules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                scheduleForm.reset();
                loadSchedules();
            } else {
                const errData = await res.json();
                alert("Failed to save: " + (errData.error || "Check server logs"));
            }
        } catch (err) {
            console.error("Connection error:", err);
            alert("Could not connect to server. Ensure backend is running.");
        }
    });
}

/**
 * DELETE SCHEDULE
 * Removes the entry from the database
 */
async function deleteSchedule(id) {
    if (confirm("Are you sure you want to delete this event?")) {
        try {
            const res = await fetch(`/api/schedules/${id}`, { 
                method: 'DELETE' 
            });
            
            if (res.ok) {
                loadSchedules();
            } else {
                alert("Failed to delete entry.");
            }
        } catch (err) {
            console.error("Delete error:", err);
        }
    }
}

// Initial load when page opens
loadSchedules();