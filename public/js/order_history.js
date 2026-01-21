let currentOrders = [];

        async function fetchOrders() {
            const userStr = localStorage.getItem('currentUser');
            if (!userStr) return;
            const user = JSON.parse(userStr);
            const tbody = document.getElementById('orderTableBody');

            try {
                const response = await fetch(`http://localhost:3000/api/orders/${user.id}`);
                currentOrders = await response.json();

                if (currentOrders.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 50px; color: var(--text-muted);">No orders found.</td></tr>`;
                    return;
                }

                tbody.innerHTML = currentOrders.map((order, index) => `
                    <tr>
                        <td onclick="openReceipt(${index})" style="font-weight: 600; color: var(--primary); cursor:pointer;">#ORD-${order.id}</td>
                        <td onclick="openReceipt(${index})" style="cursor:pointer;">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <img src="${order.image_url || 'https://via.placeholder.com/45'}" style="width: 45px; height: 45px; border-radius: 10px; object-fit: cover;">
                                <span style="font-weight: 500;">${order.product_name || 'Item'}</span>
                            </div>
                        </td>
                        <td>${new Date(order.order_date).toLocaleDateString()}</td>
                        <td style="font-weight: 700;">₱${parseFloat(order.total_amount).toLocaleString()}</td>
                        <td><span class="badge status-${(order.status || 'pending').toLowerCase()}">${order.status || 'Pending'}</span></td>
                        <td>
                            <button class="btn-delete" onclick="deleteOrder(${order.id}, event)" title="Delete Order">🗑️</button>
                        </td>
                    </tr>
                `).join('');

            } catch (err) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--danger);">Failed to load orders.</td></tr>`;
            }
        }

        async function deleteOrder(orderId, event) {
            event.stopPropagation(); // Prevents opening the receipt modal
            if (!confirm("Are you sure you want to remove this order from your history?")) return;

            try {
                const response = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
                    method: 'DELETE'
                });
                const result = await response.json();

                if (result.success) {
                    alert("Order deleted.");
                    fetchOrders(); // Refresh table
                } else {
                    alert("Error: " + result.message);
                }
            } catch (err) {
                alert("Server error. Could not delete.");
            }
        }

        function openReceipt(index) {
            const order = currentOrders[index];
            const content = document.getElementById('receiptContent');
            content.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>Order Date:</span><span>${new Date(order.order_date).toLocaleDateString()}</span></div>
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span>ID:</span><span style="font-weight:bold;">#ORD-${order.id}</span></div>
                <div style="border-top:1px solid var(--border-color); padding:15px 0; margin-bottom:15px;">
                    <div style="display:flex; justify-content:space-between;"><span>1x ${order.product_name}</span><span>₱${parseFloat(order.total_amount).toLocaleString()}</span></div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:1.2rem; font-weight:bold; color:var(--primary);"><span>TOTAL:</span><span>₱${parseFloat(order.total_amount).toLocaleString()}</span></div>
            `;
            document.getElementById('receiptTime').innerText = `Printed: ${new Date().toLocaleString()}`;
            document.getElementById('receiptModal').style.display = 'flex';
        }

        function closeModal() { document.getElementById('receiptModal').style.display = 'none'; }
        window.onclick = (e) => { if (e.target.id === 'receiptModal') closeModal(); }
        document.addEventListener('DOMContentLoaded', fetchOrders);