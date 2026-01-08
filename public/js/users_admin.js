/**
 * 1. FETCH AND DISPLAY USERS
 */
async function fetchUsers() {
    try {
        // Updated to match the backend route: router.get('/all')
        const res = await fetch('/api/users/all'); 
        const users = await res.json();
        const tableBody = document.getElementById('userTableBody');
        
        if (!tableBody) return;
        tableBody.innerHTML = '';

        if (users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No users found.</td></tr>';
            return;
        }

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${user.username}</strong></td>
                <td>${user.full_name || '-'}</td>
                <td><span class="category-badge badge-${user.role.toLowerCase()}">${user.role}</span></td>
                <td>
                    <button class="btn-table" 
                        onclick='openEditUserModal(${JSON.stringify(user).replace(/'/g, "&apos;")})' 
                        style="background: #4361ee; color: white; margin-right: 5px; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">
                        ✏️ Edit
                    </button>
                    <button class="delete-btn" onclick="deleteUser(${user.id})" 
                        style="color: #dc3545; background: none; border: none; cursor: pointer; margin-left: 10px;">
                        🗑️ Remove
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (err) {
        console.error("Fetch error:", err);
        const tableBody = document.getElementById('userTableBody');
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="4" style="color:red;">Error loading users. Check console.</td></tr>';
    }
}

/**
 * 2. CREATE USER SUBMISSION
 */
document.getElementById('userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
        username: document.getElementById('regUser').value,
        full_name: document.getElementById('regFullName').value,
        password: document.getElementById('regPass').value,
        role: document.getElementById('regRole').value
    };

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
            fetchUsers(); // Refresh the table
        } else {
            const errData = await res.json();
            alert("Error: " + (errData.error || "Could not save user"));
        }
    } catch (err) {
        console.error("Connection error:", err);
    }
});

/**
 * 3. EDIT LOGIC: POPULATE MODAL
 */
function openEditUserModal(user) {
    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUsername').value = user.username;
    document.getElementById('editFullName').value = user.full_name;
    document.getElementById('editRole').value = user.role;
    document.getElementById('editPassword').value = ''; // Clear password field for security
    document.getElementById('editUserModal').style.display = 'flex';
}

/**
 * 4. EDIT LOGIC: SUBMIT UPDATE
 */
document.getElementById('editUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editUserId').value;
    const payload = {
        username: document.getElementById('editUsername').value,
        full_name: document.getElementById('editFullName').value,
        role: document.getElementById('editRole').value,
        password: document.getElementById('editPassword').value
    };

    try {
        // Pointing to the specific admin-update route we added to routes/users.js
        const res = await fetch(`/api/users/admin-update/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("User updated successfully!");
            document.getElementById('editUserModal').style.display = 'none';
            fetchUsers(); // Refresh table
        } else {
            const errData = await res.json();
            alert("Update failed: " + (errData.message || "Unknown error"));
        }
    } catch (err) {
        console.error("Update error:", err);
    }
});

/**
 * 5. DELETE USER
 */
async function deleteUser(id) {
    if (confirm("Are you sure you want to remove this user's access?")) {
        try {
            const res = await fetch(`/api/users/${id}`, { 
                method: 'DELETE' 
            });

            if (res.ok) {
                fetchUsers();
            } else {
                alert("Failed to delete user.");
            }
        } catch (err) {
            console.error("Delete error:", err);
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', fetchUsers);