const tableBody = document.getElementById('inventoryTable');
const productForm = document.getElementById('productForm');
const modal = document.getElementById('editModal');

// 1. Fetch and display products
async function loadInventory() {
    const res = await fetch('/api/products');
    const products = await res.json();
    
    tableBody.innerHTML = products.map(p => `
        <tr class="${p.quantity < 5 ? 'low-stock' : ''}">
            <td>${p.name}</td>
            <td>${p.quantity}</td>
            <td>$${Number(p.price).toFixed(2)}</td>
            <td>
                <button class="edit-btn" onclick="openEditModal(${p.id}, '${p.name}', ${p.quantity}, ${p.price})">Edit</button>
                <button class="delete-btn" onclick="deleteProduct(${p.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// 2. Add product logic
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        name: document.getElementById('name').value,
        quantity: document.getElementById('qty').value,
        price: document.getElementById('price').value
    };

    await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    productForm.reset();
    loadInventory();
});

// 3. Delete product logic
async function deleteProduct(id) {
    if(confirm('Are you sure you want to delete this item?')) {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        loadInventory();
    }
}

// 4. Modal Logic (Open)
function openEditModal(id, name, qty, price) {
    document.getElementById('editId').value = id;
    document.getElementById('editName').value = name;
    document.getElementById('editQty').value = qty;
    document.getElementById('editPrice').value = price;
    modal.style.display = 'block';
}

// 5. Modal Logic (Close)
function closeModal() {
    modal.style.display = 'none';
}

// 6. Save Edit logic (PUT request)
async function saveEdit() {
    const id = document.getElementById('editId').value;
    const data = {
        name: document.getElementById('editName').value,
        quantity: document.getElementById('editQty').value,
        price: document.getElementById('editPrice').value
    };

    const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        closeModal();
        loadInventory();
    } else {
        alert('Failed to update product');
    }
}

// Close modal if user clicks outside of the box
window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}

// Initial load
loadInventory();