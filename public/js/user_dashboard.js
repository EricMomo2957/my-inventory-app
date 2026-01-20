let products = [];
        let favorites = JSON.parse(localStorage.getItem('userFavorites')) || [];
        let currentView = 'all';
        let pendingOrder = null;

        async function loadData() {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if(user) document.getElementById('userNameDisplay').innerText = `Hello, ${user.full_name}! 👋`;

            try {
                const res = await fetch('http://localhost:3000/api/products');
                products = await res.json();
                populateCategories();
                renderProducts();
            } catch (err) {
                document.getElementById('productGrid').innerHTML = `<p>Error connecting to database.</p>`;
            }
        }

        function populateCategories() {
            const selector = document.getElementById('categoryFilter');
            const categories = [...new Set(products.map(p => p.category))];
            selector.innerHTML = '<option value="all">All Categories</option>';
            categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat; opt.innerText = cat;
                selector.appendChild(opt);
            });
        }

        function setView(view) {
            currentView = view;
            document.getElementById('navAll').classList.toggle('active', view === 'all');
            document.getElementById('navFav').classList.toggle('active', view === 'favorites');
            document.getElementById('viewSubtitle').innerText = view === 'all' ? 'Browsing live inventory.' : 'Your saved items.';
            renderProducts();
        }

        function toggleFavorite(id) {
            favorites = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
            localStorage.setItem('userFavorites', JSON.stringify(favorites));
            renderProducts();
        }

        function renderProducts() {
            const term = document.getElementById('searchInput').value.toLowerCase();
            const cat = document.getElementById('categoryFilter').value;
            const grid = document.getElementById('productGrid');

            let displayList = products.filter(p => {
                const matchName = p.name.toLowerCase().includes(term);
                const matchCat = cat === 'all' || p.category === cat;
                const matchView = currentView === 'all' || favorites.includes(p.id);
                return matchName && matchCat && matchView;
            });

            grid.innerHTML = displayList.length === 0 ? '<div style="grid-column: 1/-1; text-align: center; padding: 50px;">No items found.</div>' : 
            displayList.map(p => {
                const isOut = p.quantity === 0;
                const isFav = favorites.includes(p.id);
                return `
                <div class="product-card">
                    <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite(${p.id})">${isFav ? '❤️' : '🤍'}</button>
                    <div class="img-container">
                        <img src="${p.image_url || '/images/placeholder.png'}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                        <span class="category-badge">${p.category}</span>
                    </div>
                    <h3>${p.name}</h3>
                    <div style="font-size: 0.85rem; font-weight: 600; color: ${p.quantity < 5 && p.quantity > 0 ? '#ef4444' : 'var(--text-muted)'}">
                        ${isOut ? '❌ Out of Stock' : `📦 ${p.quantity} In Stock`}
                    </div>
                    <div class="price-row">
                        <div class="price">₱${parseFloat(p.price).toLocaleString()}</div>
                        <button class="btn-order" onclick="openOrderModal(${p.id}, ${p.price}, '${p.name}')" 
                                ${isOut ? 'disabled style="background:#cbd5e1;"' : 'style="background:var(--success)"'}>
                            ${isOut ? 'Unavailable' : 'Order Now'}
                        </button>
                    </div>
                </div>`;
            }).join('');
        }

        // --- MODAL & ORDERING LOGIC ---

        function openOrderModal(productId, price, productName) {
            pendingOrder = { productId, price, productName };
            const detailsDiv = document.getElementById('modalProductDetails');
            
            detailsDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span>Item:</span> <strong>${productName}</strong></div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;"><span>Price:</span> <strong>₱${parseFloat(price).toLocaleString()}</strong></div>
                <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 10px 0;">
                <div style="display: flex; justify-content: space-between; font-size: 1.1rem; color: var(--primary); font-weight: 700;"><span>Total:</span> <span>₱${parseFloat(price).toLocaleString()}</span></div>
            `;

            document.getElementById('orderModal').style.display = 'flex';
            document.getElementById('confirmOrderBtn').onclick = executePurchase;
        }

        async function executePurchase() {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            const btn = document.getElementById('confirmOrderBtn');
            btn.disabled = true; btn.innerText = "Processing...";

            try {
                const response = await fetch('http://localhost:3000/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        user_id: user.id, 
                        product_id: pendingOrder.productId, 
                        quantity: 1, 
                        price: pendingOrder.price 
                    })
                });

                const data = await response.json();
                if (data.success) {
                    alert("Order placed successfully!");
                    closeModal();
                    loadData(); // Update inventory stock counts in real-time
                } else {
                    alert("Order failed: " + data.message);
                }
            } catch (err) {
                alert("Connection error while placing order.");
            } finally {
                btn.disabled = false; btn.innerText = "Confirm Purchase";
            }
        }

        function closeModal() {
            document.getElementById('orderModal').style.display = 'none';
            pendingOrder = null;
        }

        function filterProducts() { renderProducts(); }
        function logout() { localStorage.clear(); window.location.href = 'login.html'; }
        loadData();