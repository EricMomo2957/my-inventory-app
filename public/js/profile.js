document.addEventListener('DOMContentLoaded', () => {
    loadProfileData();

    // 1. HANDLE IMAGE UPLOAD (PREVIEW & LOCAL CACHE)
    const imageUpload = document.getElementById('imageUpload');
    const profileImg = document.getElementById('profileImg');

    if (imageUpload) {
        imageUpload.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imageData = e.target.result;
                    if (profileImg) profileImg.src = imageData;
                    // Save to localStorage for immediate persistence during session
                    localStorage.setItem('userAvatar', imageData);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 2. HANDLE PROFILE INFO UPDATE (SAVE TO DATABASE)
    const editForm = document.getElementById('editProfileForm');
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get current user ID from local storage session
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) return;
            
            const userId = currentUser.id;

            const payload = {
                full_name: document.getElementById('editFullname').value,
                email: document.getElementById('editEmail').value,
                department: document.getElementById('editDept').value,
                profile_image: document.getElementById('profileImg').src // Captures the uploaded image
            };

            try {
                const res = await fetch(`/api/users/profile/${userId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    // Update local session data so header names refresh
                    const updatedUser = { ...currentUser, ...payload };
                    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                    
                    alert("Profile saved to database!");
                    location.reload(); 
                } else {
                    alert("Failed to save profile to database.");
                }
            } catch (err) {
                console.error("Save error:", err);
                alert("Server error. Please check your connection.");
            }
        });
    }

    // 3. HANDLE PASSWORD CHANGE
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem('currentUser'));
            const newPass = document.getElementById('newPass').value;
            const confirmPass = document.getElementById('confirmPass').value;
            const errorDiv = document.getElementById('passError');

            if (newPass !== confirmPass) {
                if (errorDiv) errorDiv.style.display = 'block';
                return;
            }

            if (errorDiv) errorDiv.style.display = 'none';

            try {
                const response = await fetch(`/api/users/update-password/${user.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: newPass })
                });

                if (response.ok) {
                    alert("Password updated successfully! Please log in again.");
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('userAvatar');
                    window.location.href = 'login.html';
                } else {
                    alert("Failed to update password.");
                }
            } catch (err) {
                console.error("Password update error:", err);
            }
        });
    }
});

/**
 * RE-USABLE DATA LOADER
 * Populates the UI with information from the current session
 */
function loadProfileData() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;

    // Display basic info to match Profile Details table
    if (document.getElementById('profFullName')) document.getElementById('profFullName').innerText = user.full_name || 'Not Set';
    if (document.getElementById('displayHeaderName')) document.getElementById('displayHeaderName').innerText = user.full_name || user.username;
    if (document.getElementById('profEmail')) document.getElementById('profEmail').innerText = user.email || 'Not Set';
    if (document.getElementById('profAdminId')) document.getElementById('profAdminId').innerText = user.adminId || '0001';
    if (document.getElementById('profDept')) document.getElementById('profDept').innerText = user.department || 'General';
    
    // Handle Username and Role Badge
    if (document.getElementById('profUsername')) document.getElementById('profUsername').innerText = user.username;
    
    const roleBadge = document.getElementById('profRole');
    if (roleBadge) {
        roleBadge.innerText = user.role;
        // Clean class string and apply styling based on role
        roleBadge.className = `category-badge badge-${user.role.toLowerCase()}`;
    }

    // Load saved avatar from user data or fallback to local cache
    const savedAvatar = user.profile_image || localStorage.getItem('userAvatar');
    if (savedAvatar && document.getElementById('profileImg')) {
        document.getElementById('profileImg').src = savedAvatar;
    }
}

/**
 * MODAL OPENER
 * Pre-fills the modal inputs with current user data
 */
function openEditProfileModal() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;
    
    if (document.getElementById('editFullname')) document.getElementById('editFullname').value = user.full_name || '';
    if (document.getElementById('editEmail')) document.getElementById('editEmail').value = user.email || '';
    if (document.getElementById('editDept')) document.getElementById('editDept').value = user.department || '';
    
    const modal = document.getElementById('editProfileModal');
    if (modal) modal.style.display = 'flex';
}