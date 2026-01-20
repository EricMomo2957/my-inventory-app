let charts = {};
        const isDark = document.documentElement.classList.contains('dark-mode');
        
        Chart.defaults.color = isDark ? '#94a3b8' : '#64748b';
        Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
        Chart.defaults.scale.grid.color = isDark ? '#334155' : '#e2e8f0';

        async function refreshData() {
            const days = document.getElementById('dateRange').value;
            try {
                const [prodRes, salesRes, histRes] = await Promise.all([
                    fetch('/api/products/report'),
                    fetch(`/api/reports/sales?days=${days}`),
                    fetch(`/api/reports/stock-history?days=${days}`)
                ]);
                renderDashboard(await prodRes.json(), await salesRes.json(), await histRes.json());
            } catch (err) { console.error(err); }
        }

        function renderDashboard(products, sales, history) {
            const totalRev = sales.reduce((sum, item) => sum + (item.quantity * item.price_at_time), 0);
            const invValue = products.reduce((sum, p) => sum + (p.quantity * parseFloat(p.price || 0)), 0);
            
            document.getElementById('statRev').innerText = `₱${totalRev.toLocaleString()}`;
            document.getElementById('statInv').innerText = `₱${invValue.toLocaleString()}`;
            document.getElementById('statAlerts').innerText = products.filter(p => p.quantity < 10).length;
            document.getElementById('statFlucts').innerText = history.length;

            Object.values(charts).forEach(c => { if(c) c.destroy(); });

            // ... Chart Generation logic (Revenue, Move, Pie, Stock) same as before ...
            const revData = {};
            sales.forEach(s => { revData[s.name] = (revData[s.name] || 0) + (s.quantity * s.price_at_time); });
            charts.rev = new Chart(document.getElementById('revenueBarChart'), {
                type: 'bar', data: { labels: Object.keys(revData), datasets: [{ label: 'Revenue', data: Object.values(revData), backgroundColor: '#4361ee', borderRadius: 6 }] },
                options: { maintainAspectRatio: false }
            });

            charts.move = new Chart(document.getElementById('movementLineChart'), {
                type: 'line', data: { labels: history.map(h => new Date(h.created_at).toLocaleDateString()), datasets: [{ label: 'Stock Change', data: history.map(h => h.change_amount), borderColor: '#4361ee', tension: 0.4, fill: true, backgroundColor: 'rgba(67, 97, 238, 0.1)' }] },
                options: { maintainAspectRatio: false }
            });

            const catData = {};
            products.forEach(p => { catData[p.category || 'Other'] = (catData[p.category] || 0) + p.quantity; });
            charts.pie = new Chart(document.getElementById('categoryPieChart'), {
                type: 'doughnut', data: { labels: Object.keys(catData), datasets: [{ data: Object.values(catData), backgroundColor: ['#4361ee', '#4cc9f0', '#f72585', '#7209b7'], borderWidth: 0 }] },
                options: { maintainAspectRatio: false, cutout: '75%' }
            });

            charts.stock = new Chart(document.getElementById('stockLevelChart'), {
                type: 'bar', data: { labels: products.map(p => p.name), datasets: [{ label: 'Stock', data: products.map(p => p.quantity), backgroundColor: '#10b981', borderRadius: 4 }] },
                options: { indexAxis: 'y', maintainAspectRatio: false }
            });

            document.getElementById('topProductsBody').innerHTML = Object.entries(revData).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([name, rev]) => {
                const prod = products.find(p => p.name === name) || {};
                const sold = sales.filter(s => s.name === name).reduce((a,b)=>a+b.quantity,0);
                return `<tr><td><strong>${name}</strong></td><td><span style="background:var(--primary-light); color:var(--primary); padding:4px 8px; border-radius:6px; font-size:0.75rem;">${prod.category || 'General'}</span></td><td>${sold}</td><td>₱${rev.toLocaleString()}</td></tr>`;
            }).join('');
        }

        function filterTable() {
            const filter = document.getElementById("tableSearch").value.toLowerCase();
            const rows = document.getElementById("topProductsBody").rows;
            for (let row of rows) { row.style.display = row.cells[0].textContent.toLowerCase().includes(filter) ? "" : "none"; }
        }

        function downloadCSV() {
            let csv = ['Product,Category,Sold,Revenue'];
            const rows = document.getElementById("topProductsBody").rows;
            for (let row of rows) { csv.push(Array.from(row.cells).map(td => `"${td.innerText.replace('₱', '').trim()}"`).join(',')); }
            const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob); link.download = 'bi_report.csv'; link.click();
        }

        document.addEventListener('DOMContentLoaded', refreshData);