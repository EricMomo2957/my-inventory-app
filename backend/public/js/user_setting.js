document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const darkModeToggle = document.getElementById('darkModeToggle');

    // 1. Load current data into fields
    if (user) {
        document.getElementById('setFullName').value = user.full_name;
        document.getElementById('setEmail').value = user.email || "";
        
        const picUrl = user.profile_image ? `http://localhost:3000${user.profile_image}` : 'https://via.placeholder.com/80';
        document.getElementById('settingsAvatar').src = picUrl;
    }

    // 2. Handle Dark Mode Toggle
    if (localStorage.getItem('darkMode') === 'enabled') {
        darkModeToggle.checked = true;
    }

    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            document.documentElement.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.documentElement.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
    });

    // 3. Handle Image Preview
    document.getElementById('settingsPicInput').onchange = function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => document.getElementById('settingsAvatar').src = e.target.result;
            reader.readAsDataURL(this.files[0]);
        }
    };

    // 4. Handle Form Submission
    document.getElementById('settingsForm').onsubmit = async (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById('saveBtn');
        saveBtn.innerText = "Saving...";
        saveBtn.disabled = true;

        const formData = new FormData();
        formData.append('id', user.id);
        formData.append('full_name', document.getElementById('setFullName').value);
        formData.append('email', document.getElementById('setEmail').value);
        
        const password = document.getElementById('setPass').value;
        if (password.trim() !== "") {
            formData.append('password', password);
        }

        const picFile = document.getElementById('settingsPicInput').files[0];
        if (picFile) {
            formData.append('profile_pic', picFile);
        }

        try {
            const response = await fetch('http://localhost:3000/api/users/update', {
                method: 'PUT',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Update local storage
                user.full_name = document.getElementById('setFullName').value;
                user.email = document.getElementById('setEmail').value;
                if (result.profile_image) user.profile_image = result.profile_image;
                
                localStorage.setItem('currentUser', JSON.stringify(user));
                alert("Settings saved successfully!");
                location.reload();
            } else {
                alert("Error updating settings: " + result.message);
            }
        } catch (error) {
            console.error("Update Error:", error);
            alert("Failed to connect to server.");
        } finally {
            saveBtn.innerText = "Update Profile";
            saveBtn.disabled = false;
        }
    };
});