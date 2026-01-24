/**
 * js/users_admin.js 
 * Synchronized with: id, username, full_name, role, email, admin_id, department, profile_image
 */

document.addEventListener('DOMContentLoaded', () => {
    const userForm = document.getElementById('userForm');
    const userTableBody = document.getElementById('userTableBody');
    const editUserForm = document.getElementById('editUserForm');

    // Initial Fetch
    fetchAndRenderUsers();

    /**
     * 1. FETCH AND RENDER USERS
     */
    async function fetchAndRenderUsers() {
        try {
            // Priority: Fetch from your MySQL Backend API
            const res = await fetch('/api/users/all'); 
            if (res.ok) {
                const users = await res.json();
                localStorage.setItem('users', JSON.stringify(users));
                renderTable(users);
            } else {
                throw new Error("API Offline");
            }
        } catch (err) {
            // Fallback to local storage if API is not yet connected
            console.warn("Using local fallback storage.");
            const localUsers = JSON.parse(localStorage.getItem('users')) || [];
            renderTable(localUsers);
        }
    }

    /**
     * 2. RENDER TABLE
     */
    function renderTable(users) {
        if (!userTableBody) return;
        userTableBody.innerHTML = '';

        // If the API returns an empty array, show this message
        if (!users || users.length === 0) {
            userTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">No users found. Check API connection.</td></tr>';
            return;
        }

        users.forEach(user => {
            const tr = document.createElement('tr');
            
            // Use database field 'profile_image' or fallback
            const imgPath = user.profile_image && user.profile_image !== "NULL" 
                            ? user.profile_image 
                            : 'assets/default-avatar.png';

            tr.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${imgPath}" 
                            style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover; border: 1px solid #ddd;"
                            onerror="this.src='assets/default-avatar.png'">
                        <div>
                            <strong style="display: block;">${user.username}</strong>
                            <small style="color: #888;">ID: ${user.admin_id || 'N/A'}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <div style="font-weight: 500;">${user.full_name || '-'}</div>
                    <small style="color: #666;">${user.email || 'No Email'}</small>
                </td>
                <td>${user.department || 'General'}</td>
                <td>
                    <span class="category-badge badge-${(user.role || 'clerk').toLowerCase()}">
                        ${user.role}
                    </span>
                </td>
                <td class="action-cell">
                    <button class="btn-table edit-btn" onclick="openEditModal(${user.id})">✏️ Edit</button>
                    <button class="btn-table delete-btn" onclick="deleteUser(${user.id})">🗑️ Delete</button>
                </td>
            `;
            userTableBody.appendChild(tr);
        });
    }
    /**
     * 3. CREATE USER HANDLER
     */
    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userData = {
                username: document.getElementById('regUser').value,
                full_name: document.getElementById('regFullName').value,
                email: document.getElementById('regEmail').value,
                password: document.getElementById('regPass').value,
                role: document.getElementById('regRole').value,
                admin_id: document.getElementById('regAdminId').value,
                department: document.getElementById('regDept').value
            };

            try {
                const res = await fetch('/api/users/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData)
                });
                if (res.ok) alert("User Created Successfully!");
            } catch (err) { 
                console.error("API Error - check connection"); 
            }

            // Local Sync for immediate testing
            const users = JSON.parse(localStorage.getItem('users')) || [];
            userData.id = Date.now();
            users.push(userData);
            localStorage.setItem('users', JSON.stringify(users));
            
            userForm.reset();
            if (typeof closeModal === 'function') {
                closeModal('userModal');
            } else {
                document.getElementById('userModal').style.display = 'none';
            }
            fetchAndRenderUsers();
        });
    }

    /**
     * 4. EDIT MODAL LOGIC
     */
    window.openEditModal = (id) => {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.id == id);
        
        if (user) {
            document.getElementById('editUserId').value = user.id;
            document.getElementById('editUsername').value = user.username;
            document.getElementById('editFullName').value = user.full_name;
            document.getElementById('editRole').value = user.role;
            
            // Security: Clear password field for edit
            if (document.getElementById('editPassword')) {
                document.getElementById('editPassword').value = '';
            }
            
            document.getElementById('editUserModal').style.display = 'flex';
        }
    };

    /**
     * 5. UPDATE SUBMISSION
     */
    if (editUserForm) {
        editUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('editUserId').value;
            const payload = {
                username: document.getElementById('editUsername').value,
                full_name: document.getElementById('editFullName').value,
                role: document.getElementById('editRole').value
            };

            const newPass = document.getElementById('editPassword').value;
            if (newPass) payload.password = newPass;

            // Local Update for instant feedback
            let users = JSON.parse(localStorage.getItem('users')) || [];
            const index = users.findIndex(u => u.id == id);
            if (index !== -1) {
                users[index] = { ...users[index], ...payload };
                localStorage.setItem('users', JSON.stringify(users));
            }

            try {
                await fetch(`/api/users/admin-update/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
            } catch (err) { 
                console.error("Server update failed, saved locally."); 
            }

            document.getElementById('editUserModal').style.display = 'none';
            fetchAndRenderUsers();
        });
    }

    /**
     * 6. DELETE USER
     */
    window.deleteUser = async (id) => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const userToDelete = users.find(u => u.id == id);

        if (!userToDelete) return;

        // Security: Self-deletion guard
        if (currentUser && userToDelete.username === currentUser.username) {
            alert("Security Alert: You cannot delete your own active Admin account.");
            return;
        }

        if (!confirm(`Are you sure you want to remove access for "${userToDelete.username}"?`)) return;

        // Local Update
        users = users.filter(u => u.id != id);
        localStorage.setItem('users', JSON.stringify(users));

        try {
            await fetch(`/api/users/${id}`, { method: 'DELETE' });
        } catch (err) { 
            console.error("Server deletion failed, removed locally."); 
        }

        fetchAndRenderUsers();
    };
});