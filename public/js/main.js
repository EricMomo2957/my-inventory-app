const tableBody = document.getElementById('inventoryTable');
const productForm = document.getElementById('productForm');
const modal = document.getElementById('editModal');

/**
 * 1. Fetch products and calculate dashboard stats
 */
async function loadInventory(searchTerm = '') {
    try {
        // We encode the search term to handle spaces or special characters safely
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchTerm)}`);
        const products = await res.json();
        
        let totalItems = 0;
        let totalValue = 0;
        let lowStockCount = 0;

        tableBody.innerHTML = products.map(p => {
            totalItems += Number(p.quantity);
            totalValue += Number(p.quantity) * Number(p.price);
            if (p.quantity < 5) lowStockCount++;

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
                        <button class="edit-btn" 
                            onclick="openEditModal(${p.id}, '${p.name}', ${p.quantity}, ${p.price}, '${p.category}')">
                            Edit
                        </button>
                        <button class="delete-btn" onclick="deleteProduct(${p.id})">Delete</button>
                    </td>
                </tr>
            `;
        }).join('');

        document.getElementById('totalItems').innerText = totalItems;
        document.getElementById('totalValue').innerText = `$${totalValue.toFixed(2)}`;

        const lowStockElement = document.getElementById('lowStockCount');
        lowStockElement.innerText = lowStockCount;

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
 * 2. Admin Search Logic
 */
function filterInventory() {
    const query = document.getElementById('searchInput').value;
    console.log("Button clicked! Searching for:", query); // Debugging line
    loadInventory(query);
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    loadInventory();
}

// Add the listener only after checking if the element exists
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            filterInventory();
        }
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
 * 4. Modal Logic (Edit)
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

function closeModal() {
    modal.style.display = 'none';
}

window.onclick = (e) => { if (e.target == modal) closeModal(); };

// Initial load
loadInventory();