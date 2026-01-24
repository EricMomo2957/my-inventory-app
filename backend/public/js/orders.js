let allProducts = [];
        let basket = {};
        let currentCategory = 'All';

        async function loadProducts() {
            try {
                const response = await fetch('/api/products');
                allProducts = await response.json();
                
                // Extract unique categories and render filter bar
                const categories = ['All', ...new Set(allProducts.map(p => p.category || 'Uncategorized'))];
                renderCategories(categories);
                
                renderProducts(allProducts);
            } catch (err) { console.error("Error loading products:", err); }
        }

        function renderCategories(categories) {
            const bar = document.getElementById('categoryBar');
            bar.innerHTML = categories.map(cat => `
                <button class="filter-pill ${cat === 'All' ? 'active' : ''}" 
                        onclick="setCategory('${cat}', this)">
                    ${cat}
                </button>
            `).join('');
        }

        function setCategory(cat, element) {
            currentCategory = cat;
            // Update UI active state
            document.querySelectorAll('.filter-pill').forEach(btn => btn.classList.remove('active'));
            if(element) element.classList.add('active');
            filterProducts();
        }

        function filterProducts() {
            const term = document.getElementById('searchInput').value.toLowerCase();
            
            const filtered = allProducts.filter(p => {
                const matchesSearch = p.name.toLowerCase().includes(term);
                const matchesCategory = currentCategory === 'All' || (p.category || 'Uncategorized') === currentCategory;
                return matchesSearch && matchesCategory;
            });
            
            renderProducts(filtered);
        }

        function renderProducts(productsToRender) {
            const container = document.getElementById('productContainer');
            if (productsToRender.length === 0) {
                container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: var(--text-muted);">No items found in this category.</div>`;
                return;
            }
            container.innerHTML = productsToRender.map(prod => `
                <div class="product-card">
                    <img src="${prod.image_url || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=300&q=80'}" 
                         alt="${prod.name}" class="product-image">
                    
                    <div class="product-info">
                        <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--primary); font-weight: 700; margin-bottom: 4px;">${prod.category || 'General'}</div>
                        <h3>${prod.name}</h3>
                        <span class="stock-badge">📦 Stock: ${prod.quantity}</span>
                        <div class="price-tag">${parseFloat(prod.price).toFixed(2)}</div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 80px 1fr; gap: 10px; margin-top: auto;">
                        <input type="number" class="order-input" id="qty-${prod.id}" value="1" min="1" max="${prod.quantity}">
                        <button class="btn-add-item" id="btn-${prod.id}" onclick="updateBasket(${prod.id})">Add Item</button>
                    </div>
                </div>
            `).join('');
        }

        function updateBasket(id) {
            const qtyInput = document.getElementById(`qty-${id}`);
            const qty = parseInt(qtyInput.value);
            const product = allProducts.find(p => p.id === id);

            if (qty > 0 && qty <= product.quantity) {
                basket[id] = qty;
                const btn = document.getElementById(`btn-${id}`);
                btn.innerText = "✓ Added";
                btn.classList.add('active');
                calculateTotal();
                setTimeout(() => { btn.innerText = "Update Qty"; }, 2000);
            } else { 
                alert("Insufficient stock available!"); 
            }
        }

        function calculateTotal() {
            let total = 0;
            Object.keys(basket).forEach(id => {
                const p = allProducts.find(prod => prod.id == id);
                if(p) total += p.price * basket[id];
            });
            document.getElementById('orderTotalDisplay').innerText = `₱${total.toFixed(2)}`;
        }

        function openCartReview() {
            if (Object.keys(basket).length === 0) return alert("Your cart is empty!");
            const list = document.getElementById('cartItemsList');
            let total = 0;
            list.innerHTML = Object.keys(basket).map(id => {
                const p = allProducts.find(prod => prod.id == id);
                total += p.price * basket[id];
                return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
                        <div>
                            <div style="font-weight:600;">${p.name}</div>
                            <div style="font-size:0.8rem; color:var(--text-muted);">Qty: ${basket[id]} × ₱${parseFloat(p.price).toFixed(2)}</div>
                        </div>
                        <div style="font-weight:700;">₱${(p.price * basket[id]).toFixed(2)}</div>
                    </div>`;
            }).join('');
            document.getElementById('modalTotal').innerText = `₱${total.toFixed(2)}`;
            document.getElementById('cartModal').style.display = 'flex';
        }

        function closeCartModal() { document.getElementById('cartModal').style.display = 'none'; }

        async function confirmFinalOrder() {
            const orderItems = Object.keys(basket).map(id => ({ productId: parseInt(id), quantity: basket[id] }));
            try {
                const response = await fetch('/api/orders/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ items: orderItems })
                });
                const result = await response.json();
                if (result.success) {
                    prepareReceipt();
                    window.print(); 
                    window.location.reload();
                } else {
                    alert("Error: " + result.error);
                }
            } catch (err) { alert("Network Error."); }
        }

        function prepareReceipt() {
            document.getElementById('receiptDate').innerText = "Date: " + new Date().toLocaleString();
            let total = 0;
            document.getElementById('receiptItems').innerHTML = Object.keys(basket).map(id => {
                const p = allProducts.find(prod => prod.id == id);
                total += p.price * basket[id];
                return `<tr><td>${p.name}</td><td>${basket[id]}</td><td>₱${(p.price * basket[id]).toFixed(2)}</td></tr>`;
            }).join('');
            document.getElementById('receiptTotal').innerText = `Grand Total: ₱${total.toFixed(2)}`;
        }

        loadProducts();