async function loadSidebar() {
            const res = await fetch('components/sidenav.html');
            const html = await res.text();
            document.getElementById('sidenav-placeholder').innerHTML = html;
            if(window.syncSidebarUI) syncSidebarUI();
        }

        function togglePasswordModal(show) {
            document.getElementById('passwordModal').style.display = show ? 'flex' : 'none';
        }

        function handlePasswordUpdate(e) {
            e.preventDefault();
            const p1 = document.getElementById('newPass').value;
            const p2 = document.getElementById('confirmPass').value;
            if(p1 !== p2) return alert("Passwords do not match!");
            if(p1.length < 8) return alert("Password too short!");
            
            alert("Password updated successfully!");
            togglePasswordModal(false);
        }

        document.addEventListener('DOMContentLoaded', () => {
            loadSidebar();

            const darkModeToggle = document.getElementById('darkModeToggle');
            const thresholdInput = document.getElementById('lowStockThreshold');
            const thresholdDisplay = document.getElementById('thresholdDisplay');

            if (localStorage.getItem('darkMode') === 'enabled') darkModeToggle.checked = true;

            const savedThreshold = localStorage.getItem('lowStockThreshold') || '10';
            thresholdInput.value = savedThreshold;
            thresholdDisplay.innerText = savedThreshold;

            darkModeToggle.addEventListener('change', () => {
                const isDark = darkModeToggle.checked;
                document.documentElement.classList.toggle('dark-mode', isDark);
                localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
            });

            thresholdInput.addEventListener('change', () => {
                localStorage.setItem('lowStockThreshold', thresholdInput.value);
                thresholdDisplay.innerText = thresholdInput.value;
            });
        });