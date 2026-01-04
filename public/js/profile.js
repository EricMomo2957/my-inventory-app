// 1. Populate Profile Data
const user = JSON.parse(localStorage.getItem('currentUser'));

if (user) {
    document.getElementById('profFullName').innerText = user.full_name;
    document.getElementById('profUsername').innerText = user.username;
    const roleBadge = document.getElementById('profRole');
    roleBadge.innerText = user.role;
    roleBadge.classList.add(`badge-${user.role}`);
}

// 2. Handle Password Change
document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newPass = document.getElementById('newPass').value;
    const confirmPass = document.getElementById('confirmPass').value;
    const errorDiv = document.getElementById('passError');

    if (newPass !== confirmPass) {
        errorDiv.style.display = 'block';
        return;
    }

    errorDiv.style.display = 'none';

    const response = await fetch(`/api/users/update-password/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPass })
    });

    if (response.ok) {
        alert("Password updated successfully! Please log in again.");
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    } else {
        alert("Failed to update password.");
    }
});