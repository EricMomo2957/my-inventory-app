// DARK MODE TOGGLE LOGIC (Sync with Calendar.html)
        const darkModeToggle = document.getElementById('darkModeToggle');
        
        // Initial state of the toggle
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

        // REQUEST FETCHING & MODAL LOGIC
        let currentRequestId = null;

        async function fetchRequests() {
            const list = document.getElementById('requestsList');
            try {
                const response = await fetch('http://localhost:3000/api/contact-requests');
                const data = await response.json();

                if (!data || data.length === 0) {
                    list.innerHTML = `<p style="color: var(--text-muted);">No messages found.</p>`;
                    return;
                }

                list.innerHTML = data.map(req => `
                    <div class="request-card" id="req-${req.id}">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <div>
                                <div style="font-weight: 700;">${req.name}</div>
                                <div style="font-size: 0.85rem; color: var(--primary);">${req.email}</div>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button onclick="openReplyModal(${req.id}, '${req.name}', '${req.email}')" style="background: #dcfce7; color: #166534; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">Reply</button>
                                <button onclick="deleteRequest(${req.id})" style="background: #fee2e2; color: #991b1b; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">Delete</button>
                            </div>
                        </div>
                        <div class="message-box">${req.message}</div>
                        <div style="margin-top: 10px; font-size: 0.75rem; color: var(--text-muted);">📅 ${new Date(req.created_at).toLocaleString()}</div>
                    </div>
                `).join('');
            } catch (err) {
                list.innerHTML = `<p style="color: var(--danger);">Failed to load requests.</p>`;
            }
        }

        function openReplyModal(id, name, email) {
            currentRequestId = id;
            document.getElementById('modalName').innerText = `Reply to ${name}`;
            document.getElementById('modalEmail').innerText = email;
            document.getElementById('replyModal').style.display = 'flex';
        }

        function closeModal() {
            document.getElementById('replyModal').style.display = 'none';
            document.getElementById('adminResponse').value = '';
        }

        document.getElementById('confirmSendBtn').onclick = async () => {
            const message = document.getElementById('adminResponse').value;
            if(!message) return alert("Please enter a response.");
            
            try {
                const res = await fetch(`http://localhost:3000/api/contact-requests/${currentRequestId}/respond`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ response: message })
                });
                if(res.ok) {
                    alert("Response sent!");
                    closeModal();
                }
            } catch (err) { alert("Error connecting to server."); }
        };

        async function deleteRequest(id) {
            if (!confirm('Delete this request?')) return;
            try {
                await fetch(`http://localhost:3000/api/contact-requests/${id}`, { method: 'DELETE' });
                fetchRequests();
            } catch (err) { alert('Error deleting.'); }
        }

        fetchRequests();