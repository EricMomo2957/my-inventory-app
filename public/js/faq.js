// Load existing FAQs from API
        async function loadFaqs() {
            try {
                const response = await fetch('/api/faqs');
                const faqs = await response.json();
                const tableBody = document.getElementById('faqTableBody');
                
                if (!faqs || faqs.length === 0) {
                    tableBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:30px; color:var(--text-muted);">No FAQs have been added yet.</td></tr>';
                    return;
                }

                tableBody.innerHTML = faqs.map(f => `
                    <tr>
                        <td><span class="tag">${f.category || 'General'}</span></td>
                        <td>
                            <div style="font-weight:700;">${f.question}</div>
                            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">${f.answer.substring(0, 60)}...</div>
                        </td>
                        <td style="text-align: right;">
                            <button class="delete-btn" onclick="deleteFaq(${f.id})">Delete</button>
                        </td>
                    </tr>
                `).join('');
            } catch (err) {
                console.error("API Error:", err);
            }
        }

        // Handle Form Submission
        document.getElementById('faqForm').onsubmit = async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            btn.disabled = true;
            btn.innerText = "Saving...";

            const data = {
                question: document.getElementById('question').value,
                category: document.getElementById('category').value,
                answer: document.getElementById('answer').value
            };

            try {
                const response = await fetch('/api/faqs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    document.getElementById('faqForm').reset();
                    loadFaqs();
                }
            } catch (err) {
                alert("Error saving FAQ entry.");
            } finally {
                btn.disabled = false;
                btn.innerText = "Add FAQ Entry";
            }
        };

        // Delete FAQ Entry
        async function deleteFaq(id) {
            if (confirm("Are you sure you want to delete this FAQ?")) {
                try {
                    const response = await fetch(`/api/faqs/${id}`, { method: 'DELETE' });
                    if (response.ok) {
                        loadFaqs();
                    }
                } catch (err) {
                    alert("Failed to delete entry.");
                }
            }
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', loadFaqs);