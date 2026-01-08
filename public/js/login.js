document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    try {
        // Using the full URL to match your backend port and registration fix
        const response = await fetch('http://localhost:3000/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            /**
             * Save user info in localStorage.
             * data.user now contains: id, full_name, role, email, admin_id, department, profile_image
             */
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            
            // If the user has a saved profile image, store it separately for the sidenav to use
            if (data.user.profile_image) {
                localStorage.setItem('userAvatar', data.user.profile_image);
            }

            // Redirect to the dashboard
            window.location.href = 'index.html';
        } else {
            // Show the error message if login fails
            errorDiv.style.display = 'block';
            errorDiv.textContent = data.message || "Invalid credentials";
        }
    } catch (err) {
        console.error("Login Error:", err);
        alert("Server connection error. Please ensure the backend is running.");
    }
});