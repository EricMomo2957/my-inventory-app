/**
 * GLOBAL STATE & SELECTORS
 */
const tableBody = document.getElementById('inventoryTable');
let currentCategory = ''; 
let showLowStockOnly = false;
let debounceTimer;

/**
 * 1. HELPER FUNCTIONS
 */

// Format numbers as Philippine Peso with commas (e.g., ₱1,250.00)
function formatCurrency(amount) {
    return "₱" + Number(amount).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Update the visibility of the "Clear All Filters" badge
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
 * 2. CORE DATA LOADING
 */
async function loadInventory() {
    try {
        const searchTerm = document.getElementById('searchInput')?.value || '';
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchTerm)}`);
        let products = await res.json();
        
        // --- DASHBOARD CALCULATIONS ---
        let totalItems = 0, totalValue = 0, lowStockCount = 0;
        let vegCount = 0, fruitCount = 0, supplyCount = 0, cannedCount = 0;

        products.forEach(p => {
            const qty = Number(p.quantity);
            totalItems += qty;
            totalValue += qty * Number(p.price);
            if (qty < 5) lowStockCount++;

            if (p.category === 'Vegetables') vegCount += qty;
            if (p.category === 'Fruits') fruitCount += qty;
            if (p.category === 'Supplies') supplyCount += qty;
            if (p.category === 'Canned Goods') cannedCount += qty;
        });

        // --- UPDATE DASHBOARD UI ---
        document.getElementById('totalItems').innerText = totalItems;
        document.getElementById('totalValue').innerText = formatCurrency(totalValue);
        document.getElementById('lowStockCount').innerText = lowStockCount;
        document.getElementById('countVegetables').innerText = vegCount;
        document.getElementById('countFruits').innerText = fruitCount;
        document.getElementById('countSupplies').innerText = supplyCount;
        document.getElementById('countCanned').innerText = cannedCount;

        // --- APPLY FILTERS ---
        if (currentCategory !== '') {
            products = products.filter(p => p.category === currentCategory);
        }
        if (showLowStockOnly) {
            products = products.filter(p => p.quantity < 5);
        }

        // --- RENDER TABLE ---
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
                        <td><span class="badge badge-${categoryClass}">${p.category}</span></td>
                        <td>
                            <strong>${qty}</strong>
                            <div class="stock-bar-container"><div class="stock-bar-fill ${barClass}" style="width: ${percentage}%"></div></div>
                        </td>
                        <td>${formatCurrency(p.price)}</td>
                        <td style="font-size: 0.75rem; color: #888;">${p.updated_at ? new Date(p.updated_at).toLocaleString() : 'Never'}</td>
                        <td>
                            <button class="restock-btn" onclick="restockProduct(${p.id}, ${qty})">Restock</button>
                            <button class="edit-btn" onclick="openEditModal(${p.id}, '${p.name}', ${qty}, ${p.price}, '${p.category}')">Edit</button>
                            <button class="delete-btn" onclick="deleteProduct(${p.id})">Delete</button>
                        </td>
                    </tr>`;
            }).join('');
        }

        updateFilterStatusBadge();

    } catch (err) {
        console.error("Critical Error loading inventory:", err);
    }
}

/**
 * 3. FILTER & SEARCH HANDLERS
 */

// Search-as-you-type with Debouncing
document.addEventListener('input', (e) => {
    if (e.target.id === 'searchInput') {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => loadInventory(), 300);
    }
});

function setCategory(category) {
    currentCategory = category;
    // Update active UI state for filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active-filter', (category === '' && btn.innerText === 'All') || btn.innerText === category);
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

function clearAllFilters() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';
    currentCategory = '';
    showLowStockOnly = false;
    
    const lowStockBtn = document.getElementById('lowStockToggle');
    if (lowStockBtn) {
        lowStockBtn.innerText = "Show Low Stock Only";
        lowStockBtn.classList.remove('active-filter');
    }
    setCategory(''); // This calls loadInventory
}

/**
 * 4. MODAL & PRODUCT ACTIONS
 */

// Event Delegation for the dynamic "Add Product" form
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

function openAddModal() { document.getElementById('addModal').style.display = 'block'; }
function closeAddModal() { 
    document.getElementById('addModal').style.display = 'none';
    document.getElementById('productForm').reset();
}

function openEditModal(id, name, qty, price, category) {
    document.getElementById('editId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editQty').value = qty;
    document.getElementById('editPrice').value = price;
    document.getElementById('editCategory').value = category;
    document.getElementById('editModal').style.display = 'block';
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

async function deleteProduct(id) {
    if (confirm('Permanently delete this item?')) {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        loadInventory();
    }
}

async function restockProduct(id, currentQty) {
    const response = await fetch(`/api/products/restock/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: Number(currentQty) + 10 })
    });
    if (response.ok) loadInventory();
}

/**
 * 5. THEME & UTILS
 */
function toggleDarkMode() {
    const targetTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', targetTheme);
    localStorage.setItem('theme', targetTheme);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.innerText = targetTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}

// Global window clicks to close modals
window.onclick = (e) => {
    if (e.target.className === 'modal') {
        closeModal();
        closeAddModal();
    }
};

// Start the App
loadInventory();