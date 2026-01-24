let products = [];
        let favorites = JSON.parse(localStorage.getItem('userFavorites')) || [];
        let currentView = 'all';
        let pendingOrder = null;

        // --- DATA LOADING ---
        async function init() {
            loadUserData();
            await loadProducts();
        }

        function loadUserData() {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            if(user) {
                document.getElementById('userNameDisplay').innerText = `Hello, ${user.full_name}! 👋`;
                document.getElementById('sidebarUserName').innerText = user.full_name;
                
                // If the path is relative (/uploads/...), prepend the server URL
                const picUrl = user.profile_image ? `http://localhost:3000${user.profile_image}` : 'https://via.placeholder.com/100';
                document.getElementById('sidebarUserImg').src = picUrl;
                document.getElementById('profilePreview').src = picUrl;
            }
        }

        async function loadProducts() {
            try {
                const res = await fetch('http://localhost:3000/api/products');
                products = await res.json();
                populateCategories();
                renderProducts();
            } catch (err) {
                console.error("Fetch error:", err);
            }
        }

        // --- PROFILE LOGIC ---
        function previewImage(input) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => document.getElementById('profilePreview').src = e.target.result;
                reader.readAsDataURL(input.files[0]);
            }
        }

        function openProfileModal() {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            document.getElementById('profName').value = user.full_name;
            document.getElementById('profEmail').value = user.email || "";
            document.getElementById('profPass').value = ""; // Clear password field
            document.getElementById('profileModal').style.display = 'flex';
        }

        document.getElementById('profileForm').onsubmit = async (e) => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem('currentUser'));
            const btn = document.getElementById('saveProfileBtn');
            btn.innerText = "Saving...";
            btn.disabled = true;

            const formData = new FormData();
            formData.append('id', user.id);
            formData.append('full_name', document.getElementById('profName').value);
            formData.append('email', document.getElementById('profEmail').value);
            
            const password = document.getElementById('profPass').value;
            if (password.trim() !== "") {
                formData.append('password', password);
            }
            
            const picFile = document.getElementById('profPicInput').files[0];
            if (picFile) formData.append('profile_pic', picFile);

            try {
                const res = await fetch('http://localhost:3000/api/users/update', {
                    method: 'PUT',
                    body: formData // No headers needed for FormData
                });
                const result = await res.json();
                
                if(result.success) {
                    // Update LocalStorage so changes persist across page reloads
                    user.full_name = document.getElementById('profName').value;
                    user.email = document.getElementById('profEmail').value;
                    if(result.profile_image) user.profile_image = result.profile_image;
                    
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    alert("Profile updated successfully!");
                    location.reload(); 
                } else {
                    alert("Update failed: " + result.message);
                }
            } catch (err) {
                console.error(err);
                alert("Server error. Could not update profile.");
            } finally {
                btn.innerText = "Save Changes";
                btn.disabled = false;
            }
        };

        // --- CATALOG LOGIC ---
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
            document.getElementById('viewSubtitle').innerText = view === 'all' ? 'Browsing live inventory.' : 'Your favorites.';
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

            let filtered = products.filter(p => {
                const matchName = p.name.toLowerCase().includes(term);
                const matchCat = cat === 'all' || p.category === cat;
                const matchView = currentView === 'all' || favorites.includes(p.id);
                return matchName && matchCat && matchView;
            });

            if (filtered.length === 0) {
                grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">No products found.</div>`;
                return;
            }

            grid.innerHTML = filtered.map(p => {
                const isOut = p.quantity <= 0;
                const isFav = favorites.includes(p.id);
                return `
                <div class="product-card">
                    <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite(${p.id})">${isFav ? '❤️' : '🤍'}</button>
                    <div class="img-container">
                        <img src="${p.image_url || 'https://via.placeholder.com/300'}" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
                        <span class="category-badge">${p.category}</span>
                    </div>
                    <h3 style="margin: 0 0 10px 0;">${p.name}</h3>
                    <div style="font-size: 0.8rem; color: ${isOut ? '#ef4444' : 'var(--text-muted)'}; font-weight: 600;">
                        ${isOut ? 'Out of Stock' : 'Stock: ' + p.quantity}
                    </div>
                    <div class="price-row">
                        <div class="price">₱${parseFloat(p.price).toLocaleString()}</div>
                        <button class="btn-order" onclick="openOrderModal(${p.id}, ${p.price}, '${p.name.replace(/'/g, "\\'")}')" 
                                ${isOut ? 'disabled style="background:#cbd5e1; cursor: not-allowed;"' : 'style="background:var(--success)"'}>
                            Order Now
                        </button>
                    </div>
                </div>`;
            }).join('');
        }

        function openOrderModal(productId, price, productName) {
            pendingOrder = { productId, price, productName };
            document.getElementById('modalProductDetails').innerHTML = `
                <div style="font-size: 1.1rem; font-weight: 700;">${productName}</div>
                <div style="color: var(--primary); font-size: 1.2rem; margin-top: 5px;">Total: ₱${parseFloat(price).toLocaleString()}</div>
            `;
            document.getElementById('orderModal').style.display = 'flex';
        }

        async function executePurchase() {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            const btn = document.getElementById('confirmOrderBtn');
            btn.innerText = "Processing...";
            btn.disabled = true;

            try {
                const res = await fetch('http://localhost:3000/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        user_id: user.id, 
                        product_id: pendingOrder.productId, 
                        quantity: 1, 
                        price: pendingOrder.price 
                    })
                });
                
                const data = await res.json();
                if(data.success) { 
                    alert("Order placed successfully!"); 
                    location.reload(); 
                } else {
                    alert("Order failed: " + data.message);
                }
            } catch (err) {
                alert("Connection error. Try again.");
            } finally {
                btn.innerText = "Confirm Purchase";
                btn.disabled = false;
                closeModal('orderModal');
            }
        }

        document.getElementById('confirmOrderBtn').onclick = executePurchase;
        function filterProducts() { renderProducts(); }
        function closeModal(id) { document.getElementById(id).style.display = 'none'; }
        function logout() { localStorage.clear(); window.location.href = 'login.html'; }

        init();