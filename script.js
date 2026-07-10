let mutualAidShares = JSON.parse(localStorage.getItem('sokoshare_db')) || [
    { id: 1, name: "Fresh Spinach Bunches", qty: "4 Bunches", urgency: "high", location: "Community Fridge Slot 3", timestamp: Date.now() - 720000, anonymous: false },
    { id: 2, name: "Organic Maize Packets", qty: "10 kg total", urgency: "low", location: "Central Pantry Shelf A", timestamp: Date.now() - 7200000, anonymous: true },
    { id: 3, name: "Ripe Bananas", qty: "1 Full Bunch", urgency: "medium", location: "Main Gate Collection Table", timestamp: Date.now() - 2700000, anonymous: false }
];

let currentTreasuryBalance = parseInt(localStorage.getItem('sokoshare_balance')) || 4200;
const targetTreasuryGoal = 10000;
let registeredMembersCount = parseInt(localStorage.getItem('sokoshare_members')) || 84;

const communitySurplusPool = [
    { name: "Fresh Sukuma Wiki", qty: "2 Bundles", urgency: "high", location: "Community Fridge Shelf 1", anonymous: false },
    { name: "Ripe Avocados", qty: "5 Pieces", urgency: "medium", location: "Main Gate Collection Basket", anonymous: false },
    { name: "Yellow Beans Packet", qty: "2 kg Bag", urgency: "low", location: "Central Pantry Shelf B", anonymous: true },
    { name: "Fresh Tomatoes", qty: "1 Small Crate", urgency: "high", location: "Community Fridge Slot 4", anonymous: false },
    { name: "Sweet Potatoes", qty: "3 kg Basket", urgency: "low", location: "Central Pantry Shelf C", anonymous: false },
    { name: "Fresh Milk Packet", qty: "1 Litre", urgency: "high", location: "Community Fridge Slot 2", anonymous: true }
];

const formElement = document.getElementById('share-form');
const dispatchGrid = document.getElementById('dispatch-grid');
const statActive = document.getElementById('stat-active');
const statMembers = document.getElementById('stat-members');
const modalElement = document.getElementById('contributionModal');

function getRelativeTimeString(previousTimestamp) {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const elapsed = Date.now() - previousTimestamp;

    if (elapsed < msPerMinute) return 'Logged just now';   
    if (elapsed < msPerHour) return `Logged ${Math.round(elapsed / msPerMinute)} mins ago`;   
    return `Logged ${Math.round(elapsed / msPerHour)} hours ago`;   
}

function renderDispatchGrid() {
    dispatchGrid.innerHTML = '';
    statActive.textContent = mutualAidShares.length;
    if (statMembers) statMembers.textContent = registeredMembersCount;
    
    localStorage.setItem('sokoshare_db', JSON.stringify(mutualAidShares));
    localStorage.setItem('sokoshare_members', registeredMembersCount);

    if (mutualAidShares.length === 0) {
        dispatchGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; color:var(--text-muted); padding:4rem 1rem;">🌾 Ledger clear. Waiting for community dispatches...</div>`;
        return;
    }

    mutualAidShares.forEach(share => {
        const card = document.createElement('div');
        card.classList.add('aid-card', `urgency-${share.urgency}`);
        card.innerHTML = `
            <div class="card-top">
                <div>
                    <span class="item-title">${share.name}</span>
                    <div style="font-size:0.7rem; color:var(--soko-emerald); margin-top:2px;">🤝 ${share.anonymous ? "Anonymous" : "Verified Neighbor"}</div>
                </div>
                <span class="badge-qty">${share.qty}</span>
            </div>
            <div class="location-trace">📍 ${share.location}</div>
            <span class="time-stamp" data-timestamp="${share.timestamp}">${getRelativeTimeString(share.timestamp)}</span>
            <button class="btn-claim" onclick="claimShareItem(${share.id})">MARK AS CLAIMED</button>
        `;
        dispatchGrid.appendChild(card);
    });
}

function syncTreasuryInterface() {
    document.getElementById('fund-current').textContent = currentTreasuryBalance.toLocaleString();
    document.getElementById('fund-bar').style.width = `${Math.min((currentTreasuryBalance / targetTreasuryGoal) * 100, 100)}%`;
    localStorage.setItem('sokoshare_balance', currentTreasuryBalance);
}

// Spawns 1 fresh dispatch package smoothly
function spawnAutomatedPackage() {
    const randomItemTemplate = communitySurplusPool[Math.floor(Math.random() * communitySurplusPool.length)];
    mutualAidShares.unshift({
        id: Date.now(),
        name: randomItemTemplate.name,
        qty: randomItemTemplate.qty,
        urgency: randomItemTemplate.urgency,
        location: randomItemTemplate.location,
        timestamp: Date.now(),
        anonymous: randomItemTemplate.anonymous
    });
    // Add a chance that a new user signed up to post it
    if (Math.random() > 0.5) registeredMembersCount += 1;
    renderDispatchGrid();
}

// Dynamic Background Sync Core Engine (Simulates real community actions)
function runLiveSyncBackgroundTicker() {
    const actionSelector = Math.random();

    if (actionSelector < 0.4) {
        // 40% Chance: A community member drops off a brand new item
        spawnAutomatedPackage();
    } else if (actionSelector < 0.7 && mutualAidShares.length > 2) {
        // 30% Chance: Someone nearby claims an existing open item from the list
        mutualAidShares.pop(); // Removes the oldest item to show rapid turnover
        renderDispatchGrid();
    } else {
        // 30% Chance: A micro-contribution rolls into the Treasury ledger fund
        const presetDonations = [50, 100, 200, 500];
        const randomDonation = presetDonations[Math.floor(Math.random() * presetDonations.length)];
        
        currentTreasuryBalance += randomDonation;
        // Loop back down to support simulation baseline if goal is completely overflowed
        if (currentTreasuryBalance > targetTreasuryGoal) currentTreasuryBalance = 3500; 
        
        syncTreasuryInterface();
    }
}

// User Action Pipelines
window.openContributionModal = function(optAmount) {
    if (modalElement) modalElement.style.display = 'flex';
};

window.closeContributionModal = function() {
    if (modalElement) modalElement.style.display = 'none';
};

formElement.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!document.getElementById('item-anon').checked) registeredMembersCount += 1;

    mutualAidShares.unshift({
        id: Date.now(),
        name: document.getElementById('item-name').value.trim(),
        qty: document.getElementById('item-qty').value.trim(),
        urgency: document.getElementById('item-urgency').value,
        location: document.getElementById('pickup-loc').value.trim(),
        timestamp: Date.now(),
        anonymous: document.getElementById('item-anon').checked
    });
    formElement.reset();
    renderDispatchGrid();
});

window.claimShareItem = function(itemId) {
    mutualAidShares = mutualAidShares.filter(item => item.id !== itemId);
    renderDispatchGrid();
};

document.addEventListener("DOMContentLoaded", () => {
    const mainDonateBtn = document.getElementById('btn-donate-link');
    if (mainDonateBtn) mainDonateBtn.addEventListener('click', () => window.openContributionModal());
    
    // Set Interval: Fires the background automation every 20 seconds (20000 milliseconds)
    setInterval(runLiveSyncBackgroundTicker, 20000);
});

renderDispatchGrid();
syncTreasuryInterface();



