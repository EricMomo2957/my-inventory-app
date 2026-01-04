// Target the form and the table body
const scheduleForm = document.getElementById('scheduleForm');
const scheduleTableBody = document.getElementById('scheduleTableBody');

/**
 * FETCH AND DISPLAY SCHEDULES FROM DATABASE
 */
async function loadSchedules() {
    try {
        const res = await fetch('/api/schedules');
        const schedules = await res.json();
        
        // Render the table rows
        scheduleTableBody.innerHTML = schedules.map(s => `
            <tr>
                <td><strong>${new Date(s.schedule_date).toLocaleDateString()}</strong></td>
                <td>${s.title}</td>
                <td><span class="category-badge badge-supplies">${s.type}</span></td>
                <td>
                    <button class="btn-table delete-btn" onclick="deleteSchedule(${s.id})">🗑️ Remove</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Error loading schedules:", err);
    }
}

/**
 * SAVE NEW SCHEDULE TO DATABASE
 */
scheduleForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // This stops the page from refreshing
    
    // Collect the data from your input fields
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
            // Success! Clear the form and refresh the list
            scheduleForm.reset();
            loadSchedules();
        } else {
            alert("Failed to save schedule. Check server logs.");
        }
    } catch (err) {
        console.error("Connection error:", err);
    }
});

/**
 * DELETE SCHEDULE
 */
async function deleteSchedule(id) {
    if (confirm("Delete this event?")) {
        await fetch(`/api/schedules/${id}`, { method: 'DELETE' });
        loadSchedules();
    }
}


// Initial load when the page opens
loadSchedules();