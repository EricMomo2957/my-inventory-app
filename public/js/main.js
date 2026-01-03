const tableBody = document.getElementById('inventoryTable');
const productForm = document.getElementById('productForm');
const modal = document.getElementById('editModal');

// Global Filter States
let currentCategory = ''; 
let showLowStockOnly = false;

/**
 * 1. Fetch products and calculate dashboard stats
 */
async function loadInventory() {
    try {
        const searchTerm = document.getElementById('searchInput').value;
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchTerm)}`);
        let products = await res.json();
        
        // --- DASHBOARD CALCULATION LOGIC ---
        let totalItems = 0;
        let totalValue = 0;
        let lowStockCount = 0;
        
        // Category Counters
        let vegCount = 0;
        let fruitCount = 0;
        let supplyCount = 0;
        let cannedCount = 0;

        products.forEach(p => {
            const qty = Number(p.quantity);
            totalItems += qty;
            totalValue += qty * Number(p.price);
            if (qty < 5) lowStockCount++;

            // Increment specific category counts
            if (p.category === 'Vegetables') vegCount += qty;
            if (p.category === 'Fruits') fruitCount += qty;
            if (p.category === 'Supplies') supplyCount += qty;
            if (p.category === 'Canned Goods') cannedCount += qty;
        });

        // --- UPDATE DASHBOARD UI ---
        document.getElementById('totalItems').innerText = totalItems;
        document.getElementById('totalValue').innerText = `$${totalValue.toFixed(2)}`;
        
        const lowStockElement = document.getElementById('lowStockCount');
        const alertTile = lowStockElement.closest('.stat-tile');
        lowStockElement.innerText = lowStockCount;

        // Update Category UI Tiles
        document.getElementById('countVegetables').innerText = vegCount;
        document.getElementById('countFruits').innerText = fruitCount;
        document.getElementById('countSupplies').innerText = supplyCount;
        document.getElementById('countCanned').innerText = cannedCount;

        // Dynamic Styling for Alert Tile
        if (lowStockCount > 0) {
            lowStockElement.classList.add('danger-text');
            alertTile?.classList.add('danger-mode');
        } else {
            lowStockElement.classList.remove('danger-text');
            alertTile?.classList.remove('danger-mode');
        }

        // --- APPLY BUTTON FILTERS ---
        if (currentCategory !== '') {
            products = products.filter(p => p.category === currentCategory);
        }
        if (showLowStockOnly) {
            products = products.filter(p => p.quantity < 5);
        }

        // --- RENDER TABLE ---
        tableBody.innerHTML = ''; // Clear for animation reset

        tableBody.innerHTML = products.map(p => {
            const categoryClass = p.category.toLowerCase().replace(/\s+/g, '-');

            return `
                <tr class="${p.quantity < 5 ? 'low-stock' : ''}">
                    <td>${p.name}</td>
                    <td>
                        <span class="badge badge-${categoryClass}">
                            ${p.category}
                        </span>
                    </td>
                    <td>${p.quantity}</td>
                    <td>$${Number(p.price).toFixed(2)}</td>
                    <td style="font-size: 0.8rem; color: #888;">
                        ${p.updated_at ? new Date(p.updated_at).toLocaleString() : 'Never'}
                    </td>
                    <td>
                        <button class="restock-btn" onclick="restockProduct(${p.id}, ${p.quantity})">
                            Restock (+10)
                        </button>
                        <button class="edit-btn" 
                            onclick="openEditModal(${p.id}, '${p.name}', ${p.quantity}, ${p.price}, '${p.category}')">
                            Edit
                        </button>
                        <button class="delete-btn" onclick="deleteProduct(${p.id})">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error("Error loading inventory:", err);
    }
}

/**
 * 2. Filter & Search Logic
 */
function setCategory(category) {
    currentCategory = category;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active-filter');
        if ((category === '' && btn.innerText === 'All') || btn.innerText === category) {
            btn.classList.add('active-filter');
        }
    });

    loadInventory();
}

function filterInventory() {
    loadInventory();
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    showLowStockOnly = false;
    setCategory(''); 
}

function toggleLowStock() {
    showLowStockOnly = !showLowStockOnly;
    const btn = document.getElementById('lowStockToggle');
    
    if (showLowStockOnly) {
        btn.innerText = "Show All Items";
        btn.classList.add('active-filter');
    } else {
        btn.innerText = "Show Low Stock Only";
        btn.classList.remove('active-filter');
    }
    
    loadInventory();
}

// Enter key listener
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') filterInventory();
    });
}

/**
 * 3. Product Actions
 */
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('name').value,
        quantity: document.getElementById('qty').value,
        price: document.getElementById('price').value,
        category: document.getElementById('category').value
    };

    await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    productForm.reset();
    loadInventory(); 
});

function openEditModal(id, name, qty, price, category) {
    document.getElementById('editId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editQty').value = qty;
    document.getElementById('editPrice').value = price;
    document.getElementById('editCategory').value = category;
    modal.style.display = 'block';
}

async function saveEdit() {
    const id = document.getElementById('editId').value;
    const data = {
        name: document.getElementById('editName').value,
        quantity: document.getElementById('editQty').value,
        price: document.getElementById('editPrice').value,
        category: document.getElementById('editCategory').value
    };

    const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        closeModal();
        loadInventory(); 
    }
}

async function deleteProduct(id) {
    if(confirm('Delete this item?')) {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        loadInventory();
    }
}

async function restockProduct(id, currentQty) {
    const newQty = Number(currentQty) + 10;
    try {
        const response = await fetch(`/api/products/restock/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: newQty })
        });

        if (response.ok) {
            loadInventory();
        }
    } catch (err) {
        console.error("Restock failed:", err);
    }
}

/**
 * 4. UI Helpers
 */
function closeModal() {
    modal.style.display = 'none';
}

window.onclick = (e) => { if (e.target == modal) closeModal(); };

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
    const btn = document.getElementById('themeToggle');

    document.documentElement.setAttribute('data-theme', targetTheme);
    localStorage.setItem('theme', targetTheme);
    
    if (btn) btn.innerText = targetTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.innerText = savedTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}

loadInventory();