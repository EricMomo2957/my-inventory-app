/**
 * ADMIN USER MANAGEMENT
 * Handles fetching, creating, updating, and deleting users from the database.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initial Load
    fetchUsers();

    // 1. HANDLE NEW USER CREATION
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const newUser = {
                username: document.getElementById('regUser').value,
                full_name: document.getElementById('regFullName').value,
                password: document.getElementById('regPass').value,
                role: document.getElementById('regRole').value
            };

            try {
                const res = await fetch('http://localhost:3000/api/users/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newUser)
                });
                
                const data = await res.json();

                if (res.ok) {
                    alert("User created successfully!");
                    document.getElementById('userModal').style.display = 'none';
                    userForm.reset();
                    fetchUsers(); // Refresh the table list
                } else {
                    alert("Error: " + (data.message || "Could not save user"));
                }
            } catch (err) {
                console.error("Connection error during registration:", err);
                alert("Server connection failed.");
            }
        });
    }

    // 2. HANDLE USER UPDATES (Edit Form Submission)
    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const userId = document.getElementById('editUserId').value;
            const password = document.getElementById('editPassword').value;

            const updatedData = {
                username: document.getElementById('editUsername').value,
                full_name: document.getElementById('editFullName').value,
                role: document.getElementById('editRole').value
            };

            // Only include password in the update if the admin actually typed something
            if (password && password.trim() !== "") {
                updatedData.password = password;
            }

            try {
                // Note: Using the admin-update route to allow role changes
                const res = await fetch(`http://localhost:3000/api/users/admin-update/${userId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });

                if (res.ok) {
                    alert("User updated successfully!");
                    document.getElementById('editUserModal').style.display = 'none';
                    fetchUsers(); // Refresh the table
                } else {
                    const error = await res.json();
                    alert("Update failed: " + (error.message || "Unknown error"));
                }
            } catch (err) {
                console.error("Update error:", err);
                alert("Server error during update.");
            }
        });
    }
});

/**
 * 3. FETCH ALL USERS FROM DATABASE
 * Populates the table with user records and action buttons
 */
async function fetchUsers() {
    try {
        const res = await fetch('http://localhost:3000/api/users/all');
        
        if (!res.ok) throw new Error("Could not fetch user list");
        
        const users = await res.json();
        const tableBody = document.getElementById('userTableBody');
        
        if (!tableBody) return;
        tableBody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            
            // Format role for badge CSS
            const roleClass = `category-badge badge-${user.role.toLowerCase()}`;
            
            row.innerHTML = `
                <td><strong>${user.username}</strong></td>
                <td>${user.full_name || '-'}</td>
                <td><span class="${roleClass}">${user.role}</span></td>
                <td>
                    <button class="edit-btn" 
                        onclick='openEditModal(${JSON.stringify(user).replace(/'/g, "&apos;")})'
                        style="background: #4361ee; color: white; padding: 5px 10px; border: none; border-radius: 4px; cursor: pointer;">
                        ✏️ Edit
                    </button>
                    <button class="delete-btn" 
                        onclick="deleteUser(${user.id})" 
                        style="color: #dc3545; background: none; border: none; cursor: pointer; margin-left: 10px;">
                        🗑️ Delete
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (err) {
        console.error("Fetch users error:", err);
    }
}

/**
 * 4. OPEN EDIT MODAL & PREFILL DATA
 * Triggered by the 'Edit' button in the table
 */
function openEditModal(user) {
    const modal = document.getElementById('editUserModal');
    if (!modal) return;

    document.getElementById('editUserId').value = user.id;
    document.getElementById('editUsername').value = user.username;
    document.getElementById('editFullName').value = user.full_name || '';
    document.getElementById('editRole').value = user.role;
    
    // Clear the password field for security (admins only enter a new one if changing it)
    document.getElementById('editPassword').value = ''; 
    
    modal.style.display = 'flex';
}

/**
 * 5. DELETE USER
 * Permanently removes a user account
 */
async function deleteUser(id) {
    // Prevent admin from accidentally deleting themselves if desired, 
    // but for now, we follow the confirm prompt logic.
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;

    try {
        const res = await fetch(`http://localhost:3000/api/users/${id}`, { 
            method: 'DELETE' 
        });

        if (res.ok) {
            alert("User deleted successfully.");
            fetchUsers(); // Refresh the list
        } else {
            alert("Failed to delete user.");
        }
    } catch (err) {
        console.error("Delete error:", err);
        alert("Server error during deletion.");
    }
}