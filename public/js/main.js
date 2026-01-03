const tableBody = document.getElementById('inventoryTable');
const productForm = document.getElementById('productForm');
const modal = document.getElementById('editModal');

// State variable for the Low Stock filter
let showLowStockOnly = false;

/**
 * 1. Fetch products and calculate dashboard stats
 */
async function loadInventory(searchTerm = '') {
    try {
        // We encode the search term to handle spaces safely
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchTerm)}`);
        let products = await res.json();
        
        // --- DASHBOARD CALCULATION LOGIC ---
        // We calculate stats based on ALL products returned from search 
        // before we filter the list for the "Low Stock Only" view.
        let totalItems = 0;
        let totalValue = 0;
        let lowStockCount = 0;

        products.forEach(p => {
            totalItems += Number(p.quantity);
            totalValue += Number(p.quantity) * Number(p.price);
            if (p.quantity < 5) lowStockCount++;
        });

        // --- FILTER LOGIC ---
        // If the admin toggled "Show Low Stock Only", we filter the list here
        if (showLowStockOnly) {
            products = products.filter(p => p.quantity < 5);
        }

        // --- RENDER TABLE ---
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

        // --- UPDATE DASHBOARD UI ---
        document.getElementById('totalItems').innerText = totalItems;
        document.getElementById('totalValue').innerText = `$${totalValue.toFixed(2)}`;

        const lowStockElement = document.getElementById('lowStockCount');
        lowStockElement.innerText = lowStockCount;

        // Dynamic Styling for Dashboard Alert
        if (lowStockCount > 0) {
            lowStockElement.classList.add('danger-text');
        } else {
            lowStockElement.classList.remove('danger-text');
        }

    } catch (err) {
        console.error("Error loading inventory:", err);
    }
}

/**
 * 2. Admin Search & Filter Logic
 */
function filterInventory() {
    const query = document.getElementById('searchInput').value;
    loadInventory(query);
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    loadInventory();
}

/**
 * Toggle Low Stock Filter
 */
function toggleLowStock() {
    showLowStockOnly = !showLowStockOnly;
    const btn = document.getElementById('lowStockToggle');
    
    if (showLowStockOnly) {
        btn.innerText = "Show All Items";
        btn.classList.add('active-filter'); // You can style this in CSS
    } else {
        btn.innerText = "Show Low Stock Only";
        btn.classList.remove('active-filter');
    }
    
    // Refresh with current search term
    filterInventory();
}

// "Enter" key listener
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') filterInventory();
    });
}

/**
 * 3. Add Product Logic
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

/**
 * 4. Modal & Edit Logic
 */
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

/**
 * 5. Delete Logic
 */
async function deleteProduct(id) {
    if(confirm('Delete this item?')) {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        loadInventory();
    }
}

/**
 * 6. Quick Restock Feature
 */
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

function closeModal() {
    modal.style.display = 'none';
}

window.onclick = (e) => { if (e.target == modal) closeModal(); };

/**
 * Dark Mode Toggle Logic
 */
function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
    const btn = document.getElementById('themeToggle');

    document.documentElement.setAttribute('data-theme', targetTheme);
    localStorage.setItem('theme', targetTheme);
    
    btn.innerText = targetTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}

// Check for saved user preference on page load
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.innerText = savedTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}

// Initial load
loadInventory();