document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');

    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            // Save user info in localStorage so other pages can see it
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            // Redirect to the dashboard
            window.location.href = 'index.html';
        } else {
            errorDiv.style.display = 'block';
        }
    } catch (err) {
        console.error("Login Error:", err);
    }
});