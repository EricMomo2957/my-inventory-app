/**
 * 1. FETCH AND DISPLAY USERS
 * Loads the user list and populates the table with Edit/Delete actions
 */
async function loadUsers() {
    try {
        const res = await fetch('/api/users');
        const users = await res.json();
        const tableBody = document.getElementById('userTableBody');

        if (!tableBody) return;

        tableBody.innerHTML = users.map(u => {
            // Escape single quotes for the onclick function
            const escapedName = (u.full_name || 'N/A').replace(/'/g, "\\'");
            
            return `
                <tr>
                    <td><strong>${u.username}</strong></td>
                    <td>${u.full_name || 'N/A'}</td>
                    <td><span class="category-badge badge-${u.role}">${u.role}</span></td>
                    <td>
                        <button class="btn-table" 
                            onclick="openEditUserModal(${u.id}, '${u.username}', '${escapedName}', '${u.role}')" 
                            style="background: #4361ee; color: white; margin-right: 5px;">✏️ Edit</button>
                        <button class="btn-table delete-btn" onclick="deleteUser(${u.id})">🗑️ Remove</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error("Failed to load users:", err);
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
            loadUsers();
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
function openEditUserModal(id, username, fullName, role) {
    document.getElementById('editUserId').value = id;
    document.getElementById('editUsername').value = username;
    document.getElementById('editFullName').value = fullName;
    document.getElementById('editRole').value = role;
    document.getElementById('editPassword').value = ''; // Reset password field
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
        const res = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            document.getElementById('editUserModal').style.display = 'none';
            loadUsers(); // Refresh the list
        } else {
            alert("Failed to update user");
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
                loadUsers();
            } else {
                alert("Failed to delete user.");
            }
        } catch (err) {
            console.error("Delete error:", err);
        }
    }
}

// Initialize on page load
loadUsers();