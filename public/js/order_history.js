// order_history.js

// Global orders storage for modal lookup
let currentOrders = [];

/**
 * 1. Fetch and Display Orders for the logged-in user
 */
async function fetchOrders() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return;
    
    const user = JSON.parse(userStr);
    const tbody = document.getElementById('orderTableBody');

    try {
        const response = await fetch(`http://localhost:3000/api/orders/${user.id}`);
        if (!response.ok) throw new Error('Server response was not ok');
        
        currentOrders = await response.json();

        if (currentOrders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 50px; color: var(--text-muted);">You haven't placed any orders yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = currentOrders.map((order, index) => `
            <tr onclick="openReceipt(${index})">
                <td style="font-weight: 600; color: var(--primary);">#ORD-${order.id}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="${order.image_url || 'https://via.placeholder.com/45'}" 
                             onerror="this.src='https://via.placeholder.com/45?text=NA'"
                             style="width: 45px; height: 45px; border-radius: 10px; object-fit: cover; background: #f1f5f9;">
                        <span style="font-weight: 500;">${order.product_name || 'Item Not Found'}</span>
                    </div>
                </td>
                <td style="color: var(--text-muted);">
                    ${new Date(order.order_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                    })}
                </td>
                <td style="font-weight: 700;">₱${parseFloat(order.total_amount).toLocaleString()}</td>
                <td>
                    <span class="badge status-${(order.status || 'pending').toLowerCase()}">
                        ${order.status || 'Pending'}
                    </span>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        console.error("Fetch Error:", err);
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: #ef4444; padding: 20px;">
            <strong>Failed to connect to the server.</strong>
        </td></tr>`;
    }
}

/**
 * 2. Open the Receipt Modal and populate data
 */
function openReceipt(index) {
    const order = currentOrders[index];
    const content = document.getElementById('receiptContent');
    const time = document.getElementById('receiptTime');

    content.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span>Order Date:</span>
            <span>${new Date(order.order_date).toLocaleDateString()}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span>Transaction ID:</span>
            <span style="font-weight:bold;">#ORD-${order.id}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
            <span>Status:</span>
            <span style="text-transform:uppercase; font-weight:bold;">${order.status}</span>
        </div>
        
        <div style="border-top:1px solid var(--border-color); padding:15px 0; margin-bottom:15px;">
            <div style="display:flex; justify-content:space-between;">
                <span>1x ${order.product_name}</span>
                <span>₱${parseFloat(order.total_amount).toLocaleString()}</span>
            </div>
        </div>

        <div style="display:flex; justify-content:space-between; font-size:1.2rem; font-weight:bold; color:var(--primary);">
            <span>TOTAL PRICE:</span>
            <span>₱${parseFloat(order.total_amount).toLocaleString()}</span>
        </div>
    `;

    time.innerText = `Timestamp: ${new Date().toLocaleString()}`;
    document.getElementById('receiptModal').style.display = 'flex';
}

/**
 * 3. Modal Controls
 */
function closeModal() {
    document.getElementById('receiptModal').style.display = 'none';
}

// Close modal when clicking outside of the content area
window.onclick = function(event) {
    const modal = document.getElementById('receiptModal');
    if (event.target == modal) closeModal();
}

// Initial load
document.addEventListener('DOMContentLoaded', fetchOrders);