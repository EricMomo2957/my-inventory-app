document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const userData = {
        full_name: document.getElementById('regName').value,
        username: document.getElementById('regUsername').value,
        password: document.getElementById('regPassword').value // Note: In production, hash this!
    };

    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await res.json();

        if (res.ok) {
            alert("Registration successful! You can now login.");
            window.location.href = 'login.html';
        } else {
            alert(data.error || "Registration failed.");
        }
    } catch (err) {
        console.error("Error:", err);
        alert("Server connection error.");
    }
});