document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Use the IDs from your current HTML: 'username' and 'password'
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    try {
        // Using the full URL to reach your backend
        const response = await fetch('http://localhost:3000/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            // 1. Save user info (id, name, role, etc.) in localStorage
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            
            // 2. Handle profile image if it exists
            if (data.user.profile_image) {
                localStorage.setItem('userAvatar', data.user.profile_image);
            }

            // 3. ROLE-BASED REDIRECTION LOGIC
            const role = data.user.role;
            
            console.log("Logged in as:", role); // For debugging

            if (role === 'admin') {
                window.location.href = 'index.html'; 
            } else if (role === 'clerk') {
                window.location.href = 'clerk_dashboard.html'; 
            } else {
                // Default redirect for 'user' or any other role
                window.location.href = 'user_dashboard.html'; 
            }

        } else {
            // Show the error message if login fails
            if (errorDiv) {
                errorDiv.style.display = 'block';
                errorDiv.textContent = data.message || "Invalid credentials";
            } else {
                alert(data.message || "Invalid credentials");
            }
        }
    } catch (err) {
        console.error("Login Error:", err);
        alert("Server connection error. Please ensure the backend is running.");
    }
});