/**
 * FETCH AND DISPLAY USERS
 * Loads the user list from the database and populates the table
 */
async function loadUsers() {
    try {
        const res = await fetch('/api/users');
        const users = await res.json();
        const tableBody = document.getElementById('userTableBody');

        if (!tableBody) return; // Guard clause if table doesn't exist on page

        tableBody.innerHTML = users.map(u => `
            <tr>
                <td><strong>${u.username}</strong></td>
                <td>${u.full_name || 'N/A'}</td>
                <td><span class="category-badge badge-${u.role}">${u.role}</span></td>
                <td>
                    <button class="btn-table delete-btn" onclick="deleteUser(${u.id})">🗑️ Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Failed to load users:", err);
    }
}

/**
 * HANDLE FORM SUBMISSION
 * Sends new user data to the backend registration endpoint
 */
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        username: document.getElementById('regUser').value,
        full_name: document.getElementById('regFullName').value,
        password: document.getElementById('regPass').value,
        role: document.getElementById('regRole').value
    };

    console.log("Sending data:", data);

    try {
        const res = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert("User saved successfully!");
            document.getElementById('userModal').style.display = 'none';
            document.getElementById('userForm').reset();
            loadUsers(); // Refresh the table automatically
        } else {
            const errData = await res.json();
            alert("Error: " + (errData.error || "Could not save user"));
        }
    } catch (err) {
        console.error("Connection error:", err);
        alert("Server connection failed. Please check if the backend is running.");
    }
});

/**
 * DELETE USER
 * Removes a user from the system by ID
 */
async function deleteUser(id) {
    if (confirm("Are you sure you want to remove this user's access?")) {
        try {
            const res = await fetch(`/api/users/${id}`, { 
                method: 'DELETE' 
            });

            if (res.ok) {
                loadUsers(); // Refresh table after deletion
            } else {
                alert("Failed to delete user.");
            }
        } catch (err) {
            console.error("Delete error:", err);
        }
    }
}

// Initialize the table when the page loads
loadUsers();