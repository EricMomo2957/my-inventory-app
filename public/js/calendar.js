let calendar; // Global calendar variable

/**
 * 1. INITIALIZATION & THEME
 * Setup the calendar and apply dark mode immediately
 */
document.addEventListener('DOMContentLoaded', function() {
    applyCurrentTheme();
    
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
                
                // Map DB data to FullCalendar format using 'date' field
                const events = data.map(item => ({
                    id: item.id,
                    title: item.title,
                    start: item.date, 
                    backgroundColor: getColorByType(item.type),
                    borderColor: getColorByType(item.type),
                    extendedProps: { type: item.type }
                }));
                successCallback(events);
            } catch (err) { 
                console.error("Calendar fetch error:", err);
                failureCallback(err); 
            }
        }
    });
    
    calendar.render();
    loadScheduleTable(); // Initial load of the table below
});

/**
 * 2. HELPER: COLOR LOGIC
 */
function getColorByType(type) {
    switch(type) {
        case 'Work': return '#4361ee';      // Blue
        case 'Personal': return '#28c76f';  // Green
        case 'Delivery': return '#ff9f43';  // Orange
        case 'Inventory Check': return '#f72585'; // Pink
        default: return '#6e6b7b';          // Gray
    }
}

/**
 * 3. THEME MANAGEMENT
 */
function applyCurrentTheme() {
    const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

/**
 * 4. FETCH AND DISPLAY TABLE
 * Uses item.date to render the list rows and includes Edit/Delete actions
 */
async function loadScheduleTable() {
    const tableBody = document.getElementById('scheduleTableBody');
    if (!tableBody) return;

    try {
        const res = await fetch('/api/schedules');
        const data = await res.json();
        
        tableBody.innerHTML = data.map(item => {
            // Escape single quotes in title to prevent JS errors in the onclick string
            const escapedTitle = item.title.replace(/'/g, "\\'");
            
            return `
                <tr>
                    <td>${new Date(item.date).toLocaleDateString()}</td>
                    <td><strong>${item.title}</strong></td>
                    <td><span class="category-badge">${item.type}</span></td>
                    <td style="text-align: right;">
                        <button class="btn-table" style="background: #4361ee; color: white; margin-right: 5px;" 
                            onclick="openEditModal(${item.id}, '${escapedTitle}', '${item.date}', '${item.type}')">✏️ Edit</button>
                        <button class="btn-table delete-btn" onclick="deleteSchedule(${item.id})">🗑️ Remove</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error("Error loading table:", err);
    }
}

/**
 * 5. SAVE NEW ENTRY
 * Sends 'date' to the backend and refreshes the UI
 */
const scheduleForm = document.getElementById('scheduleForm');
if (scheduleForm) {
    scheduleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
            title: document.getElementById('schedTitle').value,
            date: document.getElementById('schedDate').value,
            type: document.getElementById('schedType').value
        };

        try {
            const res = await fetch('/api/schedules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                scheduleForm.reset();
                calendar.refetchEvents();
                loadScheduleTable();
            } else {
                const errData = await res.json();
                alert("Error: " + (errData.error || "Failed to save"));
            }
        } catch (err) {
            console.error("Submission error:", err);
        }
    });
}

/**
 * 6. DELETE ENTRY
 */
async function deleteSchedule(id) {
    if (confirm("Are you sure you want to delete this event?")) {
        try {
            const res = await fetch(`/api/schedules/${id}`, { 
                method: 'DELETE' 
            });
            
            if (res.ok) {
                calendar.refetchEvents();
                loadScheduleTable();
            } else {
                alert("Failed to delete entry.");
            }
        } catch (err) {
            console.error("Delete error:", err);
        }
    }
}

/**
 * 7. EDIT LOGIC
 */
async function openEditModal(id, title, date, type) {
    document.getElementById('editId').value = id;
    document.getElementById('editTitle').value = title;
    
    // Format date to YYYY-MM-DD specifically for the <input type="date"> field
    const dateObj = new Date(date);
    const formattedDate = dateObj.toISOString().split('T')[0];
    
    document.getElementById('editDate').value = formattedDate;
    document.getElementById('editType').value = type;
    document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

// Handle Update Submission
const editForm = document.getElementById('editForm');
if (editForm) {
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editId').value;
        const payload = {
            title: document.getElementById('editTitle').value,
            date: document.getElementById('editDate').value,
            type: document.getElementById('editType').value
        };

        try {
            const res = await fetch(`/api/schedules/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                closeEditModal();
                calendar.refetchEvents();
                loadScheduleTable();
            } else {
                const errData = await res.json();
                alert("Update failed: " + (errData.error || "Unknown error"));
            }
        } catch (err) {
            console.error("Update error:", err);
        }
    });
}