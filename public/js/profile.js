/**
 * PROFILE MANAGEMENT SYSTEM
 * Handles data loading, persistence (LocalStorage + DB), and profile/password updates.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Data Load from LocalStorage
    loadProfileData();

    // 2. Handle Profile Photo Upload (PREVIEW & PERSISTENCE)
    const imageUpload = document.getElementById('imageUpload');
    if (imageUpload) {
        imageUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = async function(event) {
                    const base64Image = event.target.result;
                    const user = JSON.parse(localStorage.getItem('currentUser'));

                    // FIX: 1. Update the Screen immediately
                    document.getElementById('profileImg').src = base64Image;

                    // FIX: 2. CRITICAL - Update LocalStorage immediately so it stays after refresh
                    user.profile_image = base64Image;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    localStorage.setItem('userAvatar', base64Image); // Key for sidenav sync

                    // FIX: 3. Save to MySQL Database
                    try {
                        const res = await fetch(`http://localhost:3000/api/users/profile/${user.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                full_name: user.full_name,
                                email: user.email,
                                department: user.department,
                                profile_image: base64Image
                            })
                        });
                        
                        if (res.ok) {
                            console.log("Photo synced to database");
                            window.dispatchEvent(new Event('storage')); // Trigger sidenav update
                        }
                    } catch (err) {
                        console.error("Database sync failed:", err);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 3. Handle Profile Info Form Submission
    const editForm = document.getElementById('editProfileForm');
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem('currentUser'));
            
            const updatedData = {
                full_name: document.getElementById('editFullname').value,
                email: document.getElementById('editEmail').value,
                department: document.getElementById('editDept').value,
                profile_image: document.getElementById('profileImg').src // Use current image on screen
            };

            try {
                const res = await fetch(`http://localhost:3000/api/users/profile/${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });

                if (res.ok) {
                    const updatedUser = { ...user, ...updatedData };
                    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                    alert("Profile updated successfully!");
                    location.reload(); 
                } else {
                    alert("Failed to update profile.");
                }
            } catch (err) {
                console.error("Update error:", err);
                alert("Server error. Please check your connection.");
            }
        });
    }

    // 4. Handle Password Security Update
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPass = document.getElementById('newPass').value;
            const confirmPass = document.getElementById('confirmPass').value;
            const user = JSON.parse(localStorage.getItem('currentUser'));
            const errorDiv = document.getElementById('passError');

            if (newPass !== confirmPass) {
                if (errorDiv) errorDiv.style.display = 'block';
                return;
            }

            try {
                const res = await fetch(`http://localhost:3000/api/users/update-password/${user.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: newPass })
                });

                if (res.ok) {
                    alert("Password updated successfully! Please log in again.");
                    localStorage.removeItem('currentUser');
                    localStorage.removeItem('userAvatar');
                    window.location.href = 'login.html';
                }
            } catch (err) {
                alert("Server error. Try again later.");
            }
        });
    }
});

/**
 * RE-USABLE DATA LOADER
 * Updated to prioritize cached Base64 images for persistency
 */
function loadProfileData() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;

    // Load Text Values
    if (document.getElementById('profFullName')) document.getElementById('profFullName').innerText = user.full_name || 'Not Set';
    if (document.getElementById('displayHeaderName')) document.getElementById('displayHeaderName').innerText = user.full_name || user.username;
    if (document.getElementById('profEmail')) document.getElementById('profEmail').innerText = user.email || 'Not Set';
    if (document.getElementById('profAdminId')) document.getElementById('profAdminId').innerText = user.admin_id || '0000';
    if (document.getElementById('profDept')) document.getElementById('profDept').innerText = user.department || 'General';
    
    // Role Badge styling
    const roleBadge = document.getElementById('profRole');
    if (roleBadge) {
        roleBadge.innerText = user.role || 'clerk';
        roleBadge.style.textTransform = "capitalize";
    }

    // FIX: Priority check for the image to prevent disappearing on refresh
    const profileImg = document.getElementById('profileImg');
    if (profileImg) {
        const savedAvatar = user.profile_image || localStorage.getItem('userAvatar');
        
        if (savedAvatar && savedAvatar.startsWith('data:image')) {
            profileImg.src = savedAvatar;
        } else {
            profileImg.src = 'assets/default-avatar.png'; 
        }
    }
}

/**
 * MODAL OPENER
 */
function openEditProfileModal() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;
    
    document.getElementById('editFullname').value = user.full_name || '';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editDept').value = user.department || '';
    
    const modal = document.getElementById('editProfileModal');
    if (modal) modal.style.display = 'block';
}