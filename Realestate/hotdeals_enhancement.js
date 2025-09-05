// HOT DEALS GEOGRAPHIC SCANNER MODULE
class HotDealsScanner {
    constructor(app) {
        this.app = app;
        this.zipCodeDatabase = this.initZipDatabase();
    }
    
    initZipDatabase() {
        // Major FL zip codes with lat/lng for distance calc
        return {
            '32801': {lat: 28.5383, lng: -81.3792, city: 'Orlando'},
            '33601': {lat: 27.9506, lng: -82.4572, city: 'Tampa'},
            '33101': {lat: 25.7617, lng: -80.1918, city: 'Miami'},
            '32202': {lat: 30.3322, lng: -81.6557, city: 'Jacksonville'},
            '33401': {lat: 26.7153, lng: -80.0534, city: 'West Palm Beach'},
            '34236': {lat: 27.3364, lng: -82.5307, city: 'Sarasota'},
            '32501': {lat: 30.4213, lng: -87.2169, city: 'Pensacola'},
            '32301': {lat: 30.4383, lng: -84.2807, city: 'Tallahassee'}
        };
    }
    
    calculateDistance(zip1, zip2) {
        const coord1 = this.zipCodeDatabase[zip1];
        const coord2 = this.zipCodeDatabase[zip2];
        if (!coord1 || !coord2) return 999999;
        
        const R = 3959; // Earth radius in miles
        const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
        const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(coord1.lat * Math.PI / 180) * 
                  Math.cos(coord2.lat * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    calculateDealScore(lead) {
        let score = 0;
        
        // Profit potential (40 points max)
        const profit = lead.assignmentFee || 10000;
        if (profit >= 20000) score += 40;
        else if (profit >= 15000) score += 35;
        else if (profit >= 10000) score += 25;
        else if (profit >= 5000) score += 15;
        
        // Deal spread (30 points max)
        const spread = lead.arv - lead.mao;
        const spreadPercent = (spread / lead.arv) * 100;
        if (spreadPercent >= 35) score += 30;
        else if (spreadPercent >= 30) score += 25;
        else if (spreadPercent >= 25) score += 20;
        else if (spreadPercent >= 20) score += 15;
        
        // Lead status (20 points max)
        if (lead.status === 'contract') score += 20;
        else if (lead.status === 'offer') score += 15;
        else if (lead.status === 'contacted') score += 10;
        else if (lead.status === 'new') score += 5;
        
        // Days on market (10 points max)
        const daysOld = Math.floor((new Date() - new Date(lead.dateAdded)) / 86400000);
        if (daysOld <= 7) score += 10;
        else if (daysOld <= 14) score += 7;
        else if (daysOld <= 30) score += 4;
        
        return Math.min(100, score);
    }
    
    scanForHotDeals(centerZip, radius, minProfit, minScore) {
        const hotDeals = [];
        
        this.app.data.leads.forEach(lead => {
            // Extract zip from address (assumes format like "123 Main St, City, ST 12345")
            const zipMatch = lead.address.match(/\d{5}$/);
            if (!zipMatch) return;
            
            const leadZip = zipMatch[0];
            const distance = this.calculateDistance(centerZip, leadZip);
            
            if (distance <= radius) {
                const profit = lead.assignmentFee || 10000;
                const score = this.calculateDealScore(lead);
                
                if (profit >= minProfit && score >= minScore) {
                    hotDeals.push({
                        ...lead,
                        distance: Math.round(distance),
                        score: score,
                        profitPotential: profit
                    });
                }
            }
        });
        
        // Sort by score descending
        return hotDeals.sort((a, b) => b.score - a.score);
    }
}

// Inject into window for global access
window.HotDealsScanner = HotDealsScanner;
