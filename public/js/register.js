document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Collect data from form inputs
    const userData = {
        full_name: document.getElementById('regName').value,
        username: document.getElementById('regUsername').value,
        password: document.getElementById('regPassword').value
    };

    try {
        /** * 2. Send request to the backend 
         * Path updated to /api/users/register to match your app.js route
         */
        const res = await fetch('http://localhost:3000/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await res.json();

        // 3. Handle the response
        if (res.ok) {
            alert("Registration successful! You can now login.");
            window.location.href = 'login.html';
        } else {
            // Displays specific error like "Username already taken"
            alert(data.error || "Registration failed.");
        }
    } catch (err) {
        /** * 4. Error Handling 
         * This triggers if the server is offline or CORS is blocked
         */
        console.error("Connection Error:", err);
        alert("Server connection error. Is your Node.js backend running?");
    }
});