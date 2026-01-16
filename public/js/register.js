document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Collect data from form inputs (Now including Role)
    const payload = {
        full_name: document.getElementById('regName').value,
        username: document.getElementById('regUsername').value,
        role: document.getElementById('regRole').value, // Gets 'clerk' or 'user' from <select>
        password: document.getElementById('regPassword').value
    };

    try {
        // 2. Send request to the backend
        // Use the full URL if your frontend and backend are on different ports (e.g., 5500 vs 3000)
        const response = await fetch('http://localhost:3000/api/users/register', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // 3. Handle the response
        if (response.ok || data.success) {
            alert(`Registration successful! Account created as: ${payload.role.toUpperCase()}`);
            window.location.href = 'login.html'; 
        } else {
            // Displays specific error like "Username already taken"
            alert('Error: ' + (data.error || 'Registration failed.'));
        }
    } catch (err) {
        console.error("Connection Error:", err);
        alert("Server connection error. Is your Node.js backend running on port 3000?");
    }
});