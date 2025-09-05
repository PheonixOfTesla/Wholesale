
// Add these methods to your WholesaleProApp class

scanHotDeals() {
    if (!this.hotDealsScanner) {
        this.hotDealsScanner = new HotDealsScanner(this);
    }
    
    const centerZip = document.getElementById('hotdeals-zip').value;
    const radius = parseInt(document.getElementById('hotdeals-radius').value);
    const minProfit = parseInt(document.getElementById('hotdeals-minprofit').value) || 0;
    const minScore = parseInt(document.getElementById('hotdeals-minscore').value) || 0;
    
    const hotDeals = this.hotDealsScanner.scanForHotDeals(centerZip, radius, minProfit, minScore);
    
    // Update metrics
    document.getElementById('dealsFound').textContent = hotDeals.length;
    document.getElementById('hottestDeal').textContent = hotDeals[0]?.address.substring(0, 30) + '...' || '-';
    document.getElementById('avgScore').textContent = hotDeals.length ? 
        Math.round(hotDeals.reduce((sum, d) => sum + d.score, 0) / hotDeals.length) : 0;
    document.getElementById('totalProfit').textContent = '$' + 
        hotDeals.reduce((sum, d) => sum + d.profitPotential, 0).toLocaleString();
    
    // Render table
    const tbody = document.getElementById('hotDealsTable');
    if (hotDeals.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">No deals found matching criteria</td></tr>';
    } else {
        tbody.innerHTML = hotDeals.map(deal => `
            <tr>
                <td><span style="font-weight: bold; color: ${deal.score >= 90 ? '#10b981' : deal.score >= 70 ? '#f59e0b' : '#6b7280'};">${deal.score}</span></td>
                <td><strong>${deal.address}</strong></td>
                <td>${deal.distance} mi</td>
                <td><span class="status-badge status-${deal.status}">${deal.status.toUpperCase()}</span></td>
                <td>$${deal.arv.toLocaleString()}</td>
                <td>$${deal.mao.toLocaleString()}</td>
                <td style="color: var(--success); font-weight: bold;">$${deal.profitPotential.toLocaleString()}</td>
                <td><button class="btn btn-primary" onclick="app.openLeadModal(${deal.id})" style="padding: 5px 10px;">View</button></td>
            </tr>
        `).join('');
    }
    
    this.showNotification(`Found ${hotDeals.length} hot deals within ${radius} miles!`, 'success');
}
