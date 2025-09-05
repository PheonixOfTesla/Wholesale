// HOT DEALS GENERATOR METHODS - Add to WholesaleProApp class

scanHotDeals() {
    const zip = document.getElementById('hotdeals-zip').value || '32801';
    const radius = parseInt(document.getElementById('hotdeals-radius').value) || 100;
    const minProfit = parseFloat(document.getElementById('hotdeals-minprofit').value) || 10000;
    const minScore = parseInt(document.getElementById('hotdeals-minscore').value) || 70;
    
    // Show scanning notification
    this.showNotification('🔍 Scanning for hot deals...', 'success');
    
    // Generate hot deals
    const deals = this.generateHotDeals(zip, radius, minProfit, minScore);
    
    // Display results
    this.renderHotDeals(deals);
    this.updateHotDealsMetrics(deals);
    
    this.showNotification(`Found ${deals.length} hot deals!`, 'success');
}

generateHotDeals(centerZip, radius, minProfit, minScore) {
    const sources = ['Foreclosure', 'Tax Lien', 'Estate Sale', 'Expired MLS', 'Absentee Owner', 'Pre-foreclosure'];
    const streets = ['Main', 'Oak', 'Elm', 'Park', 'First', 'Second', 'Third', 'Maple', 'Cedar', 'Pine', 'Washington', 'Lincoln'];
    const cities = ['Orlando', 'Tampa', 'Jacksonville', 'Miami', 'Fort Lauderdale', 'Gainesville', 'Lakeland', 'St. Petersburg'];
    
    const deals = [];
    const dealCount = Math.floor(Math.random() * 15) + 10; // 10-25 deals
    
    for (let i = 0; i < dealCount; i++) {
        const arv = Math.floor(Math.random() * 350000) + 150000; // $150k-$500k
        const repairPercentage = Math.random() * 0.3 + 0.05; // 5-35% of ARV
        const repairs = Math.floor(arv * repairPercentage);
        const assignmentFee = minProfit + Math.floor(Math.random() * 10000);
        const mao = Math.floor(arv * 0.7) - repairs - assignmentFee;
        const profit = assignmentFee;
        
        // Calculate score (0-100)
        let score = 0;
        if (profit >= 20000) score += 40;
        else if (profit >= 15000) score += 30;
        else if (profit >= 10000) score += 20;
        
        // Motivation factor
        const motivation = Math.floor(Math.random() * 10) + 1;
        if (motivation >= 8) score += 30;
        else if (motivation >= 6) score += 20;
        else if (motivation >= 4) score += 10;
        
        // Days on market factor
        const daysOnMarket = Math.floor(Math.random() * 120);
        if (daysOnMarket <= 30) score += 20;
        else if (daysOnMarket <= 60) score += 10;
        
        // Source factor
        const source = sources[Math.floor(Math.random() * sources.length)];
        if (source === 'Foreclosure' || source === 'Tax Lien') score += 10;
        
        // Distance calculation (simulated)
        const distance = Math.floor(Math.random() * radius);
        
        // Only include deals that meet minimum criteria
        if (score >= minScore && profit >= minProfit) {
            deals.push({
                id: this.generateId(),
                address: `${Math.floor(Math.random() * 9999) + 100} ${streets[Math.floor(Math.random() * streets.length)]} St, ${cities[Math.floor(Math.random() * cities.length)]}, FL ${32801 + Math.floor(Math.random() * 200)}`,
                distance: distance,
                source: source,
                arv: arv,
                repairs: repairs,
                mao: mao,
                profit: profit,
                score: Math.min(score, 100),
                motivation: motivation,
                daysOnMarket: daysOnMarket
            });
        }
    }
    
    // Sort by score (highest first)
    return deals.sort((a, b) => b.score - a.score);
}

renderHotDeals(deals) {
    const tbody = document.getElementById('hotDealsTable');
    if (!tbody) return;
    
    if (deals.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">No deals found matching your criteria. Try adjusting filters.</td></tr>';
        return;
    }
    
    tbody.innerHTML = deals.map(deal => {
        const scoreColor = deal.score >= 80 ? '#10b981' : deal.score >= 60 ? '#f59e0b' : '#6b7280';
        const statusBadge = deal.score >= 80 ? 'status-contract' : deal.score >= 60 ? 'status-offer' : 'status-contacted';
        
        return `
            <tr onclick="this.style.backgroundColor = this.style.backgroundColor ? '' : '#fff3cd'" style="cursor: pointer;">
                <td><span style="font-size: 24px; font-weight: bold; color: ${scoreColor};">${deal.score}</span></td>
                <td><strong>${deal.address}</strong></td>
                <td>${deal.distance} mi</td>
                <td><span class="status-badge ${statusBadge}">${deal.source}</span></td>
                <td>$${deal.arv.toLocaleString()}</td>
                <td><strong>$${deal.mao.toLocaleString()}</strong></td>
                <td><strong style="color: #10b981;">$${deal.profit.toLocaleString()}</strong></td>
                <td>
                    <button class="btn btn-primary" onclick="app.addHotDealToLeads(${deal.id})" style="padding: 5px 10px; font-size: 12px;">+ Lead</button>
                    <button class="btn btn-success" onclick="app.viewHotDealDetails(${deal.id})" style="padding: 5px 10px; font-size: 12px;">View</button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Store deals for later use
    this.hotDeals = deals;
}

updateHotDealsMetrics(deals) {
    if (deals.length === 0) {
        this.updateElement('hottestDeal', '-');
        this.updateElement('dealsFound', '0');
        this.updateElement('avgScore', '0');
        this.updateElement('totalProfit', '$0');
        return;
    }
    
    const hottestDeal = deals[0];
    const avgScore = Math.round(deals.reduce((sum, d) => sum + d.score, 0) / deals.length);
    const totalProfit = deals.reduce((sum, d) => sum + d.profit, 0);
    
    this.updateElement('hottestDeal', `Score: ${hottestDeal.score}`);
    this.updateElement('dealsFound', deals.length);
    this.updateElement('avgScore', avgScore);
    this.updateElement('totalProfit', '$' + totalProfit.toLocaleString());
}

addHotDealToLeads(dealId) {
    const deal = this.hotDeals?.find(d => d.id === dealId);
    if (!deal) return;
    
    const leadData = {
        id: this.generateId(),
        address: deal.address,
        owner: `${deal.source} Property`,
        phone: '(555) ' + Math.floor(Math.random() * 900 + 100) + '-' + Math.floor(Math.random() * 9000 + 1000),
        arv: deal.arv,
        repairs: deal.repairs,
        assignmentFee: deal.profit,
        status: 'new',
        notes: `Hot Deal - Score: ${deal.score}/100, Source: ${deal.source}, Days on Market: ${deal.daysOnMarket}`,
        followup: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        dateAdded: new Date().toISOString(),
        mao: deal.mao
    };
    
    this.data.leads.push(leadData);
    this.saveData();
    this.showNotification('Hot deal added to leads!', 'success');
    
    // Switch to leads tab
    this.switchTab('leads');
}

viewHotDealDetails(dealId) {
    const deal = this.hotDeals?.find(d => d.id === dealId);
    if (!deal) return;
    
    const details = `
HOT DEAL DETAILS
━━━━━━━━━━━━━━━
Score: ${deal.score}/100
Address: ${deal.address}
Distance: ${deal.distance} miles
Source: ${deal.source}

FINANCIAL ANALYSIS
━━━━━━━━━━━━━━━
ARV: $${deal.arv.toLocaleString()}
Repairs: $${deal.repairs.toLocaleString()}
MAO: $${deal.mao.toLocaleString()}
Your Profit: $${deal.profit.toLocaleString()}

DEAL METRICS
━━━━━━━━━━━━━━━
Motivation Level: ${deal.motivation}/10
Days on Market: ${deal.daysOnMarket}
ROI Potential: ${Math.round((deal.profit / deal.mao) * 100)}%
    `;
    
    alert(details);
}
