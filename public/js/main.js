/**
 * GLOBAL STATE & SELECTORS
 */
let currentCategory = ''; 
let showLowStockOnly = false;
let debounceTimer;

// Immediate security check
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (!currentUser && !window.location.pathname.includes('login.html')) {
    window.location.href = 'login.html';
}

/**
 * 1. SECURITY & ROLE HELPERS
 */
function applyRolePermissions() {
    if (!currentUser) return;
    const role = currentUser.role;

    if (role === 'clerk') {
        // Clerks can RESTOCK but not ADD, EDIT, or DELETE
        document.querySelectorAll('.add-main-btn, .edit-btn, .delete-btn').forEach(btn => {
            btn.style.display = 'none';
        });
    } 
    
    if (role === 'auditor') {
        // Auditors are Read-Only
        document.querySelectorAll('.add-main-btn, .btn-table').forEach(btn => {
            btn.style.display = 'none';
        });
    }
}

function logout() {
    if(confirm("Are you sure you want to log out?")) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

/**
 * 2. FORMATTING & UI HELPERS
 */
function formatCurrency(amount) {
    return "₱" + Number(amount).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function updateFilterStatusBadge() {
    const statusContainer = document.getElementById('filter-status-container');
    const filterText = document.getElementById('active-filter-text');
    const searchTerm = document.getElementById('searchInput')?.value || '';

    if (currentCategory !== '' || searchTerm !== '' || showLowStockOnly) {
        if (statusContainer) statusContainer.style.display = 'block';
        let message = "Applied: ";
        if (currentCategory) message += ` [${currentCategory}]`;
        if (searchTerm) message += ` "${searchTerm}"`;
        if (showLowStockOnly) message += ` [Low Stock]`;
        if (filterText) filterText.innerText = message;
    } else {
        if (statusContainer) statusContainer.style.display = 'none';
    }
}

/**
 * 3. CORE DATA LOADING & RENDER
 */
async function loadInventory() {
    try {
        const searchTerm = document.getElementById('searchInput')?.value || '';
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchTerm)}`);
        let products = await res.json();
        
        // DASHBOARD CALCULATIONS
        let totalItems = 0, totalValue = 0, lowStockCount = 0;
        let counts = { Vegetables: 0, Fruits: 0, Supplies: 0, "Canned Goods": 0 };

        products.forEach(p => {
            const qty = Number(p.quantity);
            totalItems += qty;
            totalValue += qty * Number(p.price);
            if (qty < 5) lowStockCount++;
            if (counts.hasOwnProperty(p.category)) counts[p.category] += qty;
        });

        // UPDATE UI TILES
        if(document.getElementById('totalItems')) document.getElementById('totalItems').innerText = totalItems;
        if(document.getElementById('totalValue')) document.getElementById('totalValue').innerText = formatCurrency(totalValue);
        if(document.getElementById('lowStockCount')) document.getElementById('lowStockCount').innerText = lowStockCount;
        if(document.getElementById('countVegetables')) document.getElementById('countVegetables').innerText = counts.Vegetables;
        if(document.getElementById('countFruits')) document.getElementById('countFruits').innerText = counts.Fruits;
        if(document.getElementById('countSupplies')) document.getElementById('countSupplies').innerText = counts.Supplies;
        if(document.getElementById('countCanned')) document.getElementById('countCanned').innerText = counts["Canned Goods"];

        // APPLY FILTERS
        if (currentCategory !== '') products = products.filter(p => p.category === currentCategory);
        if (showLowStockOnly) products = products.filter(p => p.quantity < 5);

        // RENDER TABLE
        const tableBody = document.getElementById('inventoryTable');
        if (!tableBody) return;

        if (products.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:50px; color:#888;">🔍 No matching products found.</td></tr>`;
        } else {
            tableBody.innerHTML = products.map(p => {
                const qty = Number(p.quantity);
                const categoryClass = p.category.toLowerCase().replace(/\s+/g, '-');
                const percentage = Math.min((qty / 50) * 100, 100);
                const barClass = qty < 5 ? 'bar-low' : (qty < 15 ? 'bar-medium' : 'bar-high');

                return `
                    <tr class="${qty < 5 ? 'low-stock' : ''}">
                        <td><strong>${p.name}</strong></td>
                        <td><span class="category-badge badge-${categoryClass}">${p.category}</span></td>
                        <td>
                            <div style="margin-bottom: 4px;"><strong>${qty}</strong></div>
                            <div class="stock-bar-container">
                                <div class="stock-bar-fill ${barClass}" style="width: ${percentage}%"></div>
                            </div>
                        </td>
                        <td>${formatCurrency(p.price)}</td>
                        <td style="font-size: 0.75rem; color: #888;">
                            ${p.updated_at || p.last_updated ? new Date(p.updated_at || p.last_updated).toLocaleString() : 'Never'}
                        </td>
                        <td class="action-cell">
                            <button class="btn-table restock-btn" onclick="restockProduct(${p.id})">
                                <span>🔄</span> Restock
                            </button>
                            <button class="btn-table edit-btn" onclick="openEditModal(${p.id}, '${p.name}', ${qty}, ${p.price}, '${p.category}')">
                                <span>✏️</span> Edit
                            </button>
                            <button class="btn-table delete-btn" onclick="deleteProduct(${p.id})">
                                <span>🗑️</span> Delete
                            </button>
                        </td>
                    </tr>`;
            }).join('');
        }

        updateFilterStatusBadge();
        applyRolePermissions();

    } catch (err) {
        console.error("Critical Error loading inventory:", err);
    }
}

/**
 * 4. RESTOCK HISTORY LOGIC
 */
async function loadRestockHistory() {
    try {
        const res = await fetch('/api/history');
        const history = await res.json();
        
        const historyTable = document.getElementById('historyTable');
        if (!historyTable) return;

        if (history.length === 0) {
            historyTable.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#888;">No recent activity.</td></tr>`;
            return;
        }

        historyTable.innerHTML = history.map(item => {
            const date = new Date(item.created_at);
            return `
                <tr>
                    <td style="font-size: 0.85rem; color: #666;">
                        ${date.toLocaleDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td><strong>${item.product_name}</strong></td>
                    <td><span style="color: #28c76f; font-weight: bold;">+${item.change_amount}</span></td>
                    <td><span class="user-pill">${item.user_name}</span></td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error("Failed to load history:", err);
    }
}

/**
 * 5. FILTER & SEARCH HANDLERS
 */
document.addEventListener('input', (e) => {
    if (e.target.id === 'searchInput') {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => loadInventory(), 300);
    }
});

function setCategory(category) {
    currentCategory = category;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active-filter', 
            (category === '' && btn.innerText === 'All') || btn.innerText === category
        );
    });
    loadInventory();
}

function toggleLowStock() {
    showLowStockOnly = !showLowStockOnly;
    const btn = document.getElementById('lowStockToggle');
    if (btn) {
        btn.innerText = showLowStockOnly ? "Show All Items" : "Show Low Stock Only";
        btn.classList.toggle('active-filter', showLowStockOnly);
    }
    loadInventory();
}

/**
 * 6. PRODUCT ACTIONS (ADD, EDIT, DELETE, RESTOCK)
 */
async function restockProduct(id) {
    const amount = prompt("Enter quantity to add to stock:");
    if (amount === null) return;
    
    const increment = parseInt(amount);
    if (isNaN(increment) || increment <= 0) {
        alert("Please enter a valid positive number.");
        return;
    }

    try {
        const response = await fetch(`/api/products/restock/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                increment: increment,
                user: currentUser.full_name 
            })
        });

        if (response.ok) {
            loadInventory();
            loadRestockHistory(); // Refresh the log immediately
            alert(`Successfully added ${increment} units!`);
        }
    } catch (err) {
        console.error("Restock error:", err);
    }
}

async function deleteProduct(id) {
    if (confirm('Permanently delete this item?')) {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        loadInventory();
    }
}

// Global listener for Product Form (Add New)
document.addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'productForm') {
        e.preventDefault();
        const data = {
            name: document.getElementById('name').value,
            quantity: document.getElementById('qty').value,
            price: document.getElementById('price').value,
            category: document.getElementById('category').value
        };

        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            closeAddModal();
            loadInventory();
        }
    }
});

/**
 * 7. MODAL CONTROL & THEME
 */
function openAddModal() { document.getElementById('addModal').style.display = 'flex'; }
function closeAddModal() { 
    document.getElementById('addModal').style.display = 'none';
    document.getElementById('productForm')?.reset();
}

function openEditModal(id, name, qty, price, category) {
    document.getElementById('editId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editQty').value = qty;
    document.getElementById('editPrice').value = price;
    document.getElementById('editCategory').value = category;
    document.getElementById('editModal').style.display = 'flex';
}

function closeModal() { document.getElementById('editModal').style.display = 'none'; }

async function saveEdit() {
    const id = document.getElementById('editId').value;
    const data = {
        name: document.getElementById('editName').value,
        quantity: document.getElementById('editQty').value,
        price: document.getElementById('editPrice').value,
        category: document.getElementById('editCategory').value
    };

    const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (res.ok) { closeModal(); loadInventory(); }
}

// Global click handler for modals
window.onclick = (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal();
        closeAddModal();
    }
};

/**
 * 8. INITIALIZATION
 */
window.addEventListener('DOMContentLoaded', () => {
    loadInventory();
    loadRestockHistory();
});