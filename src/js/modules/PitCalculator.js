export class PitCalculator {
  constructor() {
    this.costs = {
      obducite: 0, // Ranks 1-4
      ingolith: 0, // Ranks 5-8
      neathiron: 0 // Ranks 9-12
    };

    // Cumulative costs per rank
    // Data based on Season 4/5/11 masterworking costs
    this.rankCosts = [
      { rank: 1, type: 'obducite', cost: 10 },
      { rank: 2, type: 'obducite', cost: 20 },
      { rank: 3, type: 'obducite', cost: 30 },
      { rank: 4, type: 'obducite', cost: 40 }, // Crit
      { rank: 5, type: 'ingolith', cost: 20 },
      { rank: 6, type: 'ingolith', cost: 40 },
      { rank: 7, type: 'ingolith', cost: 60 },
      { rank: 8, type: 'ingolith', cost: 80 }, // Crit
      { rank: 9, type: 'neathiron', cost: 20 },
      { rank: 10, type: 'neathiron', cost: 40 },
      { rank: 11, type: 'neathiron', cost: 60 },
      { rank: 12, type: 'neathiron', cost: 80 } // Crit
    ];

    this.init();
  }

  init() {
    this.renderCalculator();
    this.setupListeners();
  }

  renderCalculator() {
    const container = document.getElementById('pit-calculator');
    if (!container) return;

    container.innerHTML = `
      <div class="calculator-box pit-calc-container">
        <h3><i class="fas fa-dungeon"></i> Masterworking Planner</h3>
        <p class="calc-desc">Calculate materials needed to upgrade your gear in The Pit.</p>
        
        <div class="calc-controls">
          <div class="control-group">
            <label>Current Rank</label>
            <div class="rank-selector">
              <button class="rank-btn minus" data-action="dec-current"><i class="fas fa-minus"></i></button>
              <span id="currentRankDisplay" class="rank-value">0</span>
              <button class="rank-btn plus" data-action="inc-current"><i class="fas fa-plus"></i></button>
            </div>
          </div>
          
          <div class="control-group">
            <label>Target Rank</label>
            <div class="rank-selector">
              <button class="rank-btn minus" data-action="dec-target"><i class="fas fa-minus"></i></button>
              <span id="targetRankDisplay" class="rank-value">12</span>
              <button class="rank-btn plus" data-action="inc-target"><i class="fas fa-plus"></i></button>
            </div>
          </div>

          <div class="control-group">
            <label>Farm Tier</label>
            <input type="number" id="pitTierInput" value="61" min="1" max="200" class="tier-input">
            <div class="tier-info" id="tierInfo">Drops Neathiron</div>
          </div>
        </div>

        <div id="pitResults" class="pit-results">
          <!-- Results injected here -->
        </div>
      </div>
    `;

    this.updateCalculation();
  }

  setupListeners() {
    const container = document.getElementById('pit-calculator');
    if (!container) return;

    let currentRank = 0;
    let targetRank = 12;

    container.addEventListener('click', e => {
      const btn = e.target.closest('.rank-btn');
      if (!btn) return;

      const action = btn.dataset.action;

      if (action === 'dec-current' && currentRank > 0) currentRank--;
      if (action === 'inc-current' && currentRank < targetRank) currentRank++;

      if (action === 'dec-target' && targetRank > currentRank) targetRank--;
      if (action === 'inc-target' && targetRank < 12) targetRank++;

      // Sync constraints
      if (currentRank > targetRank) currentRank = targetRank;

      document.getElementById('currentRankDisplay').textContent = currentRank;
      document.getElementById('targetRankDisplay').textContent = targetRank;

      this.updateCalculation(currentRank, targetRank);
    });

    const tierInput = document.getElementById('pitTierInput');
    if (tierInput) {
      tierInput.addEventListener('input', () => {
        this.updateCalculation(currentRank, targetRank);
      });
    }
  }

  updateCalculation(current = 0, target = 12) {
    const tier = parseInt(document.getElementById('pitTierInput').value) || 1;
    const tierInfo = document.getElementById('tierInfo');
    const resultDiv = document.getElementById('pitResults');

    // Reset costs
    let needObducite = 0;
    let needIngolith = 0;
    let needNeathiron = 0;

    // Calculate needed mats
    for (let i = current + 1; i <= target; i++) {
      const cost = this.rankCosts.find(r => r.rank === i);
      if (cost.type === 'obducite') needObducite += cost.cost;
      if (cost.type === 'ingolith') needIngolith += cost.cost;
      if (cost.type === 'neathiron') needNeathiron += cost.cost;
    }

    // Determine drop type based on Tier
    let dropType = 'obducite';
    let dropAmount = 0;

    if (tier >= 61) {
      dropType = 'neathiron';
      dropAmount = 20 + (tier - 61) * 1.5; // Approx scaling
      tierInfo.textContent = `Drops Neathiron (~${Math.floor(dropAmount)})`;
      tierInfo.className = 'tier-info neathiron';
    } else if (tier >= 31) {
      dropType = 'ingolith';
      dropAmount = 20 + (tier - 31) * 1.5;
      tierInfo.textContent = `Drops Ingolith (~${Math.floor(dropAmount)})`;
      tierInfo.className = 'tier-info ingolith';
    } else {
      dropType = 'obducite';
      dropAmount = 10 + (tier - 1) * 1.5;
      tierInfo.textContent = `Drops Obducite (~${Math.floor(dropAmount)})`;
      tierInfo.className = 'tier-info obducite';
    }

    // Calculate conversion needed
    // 1 Neathiron -> 3 Ingolith -> 9 Obducite
    // We farm the highest tier possible and transmute down

    let runsNeeded = 0;
    const totalNeathironValue = needNeathiron + needIngolith / 3 + needObducite / 9;
    const totalIngolithValue = needIngolith + needObducite / 3;

    if (dropType === 'neathiron') {
      runsNeeded = Math.ceil(totalNeathironValue / dropAmount);
    } else if (dropType === 'ingolith') {
      if (needNeathiron > 0) {
        resultDiv.innerHTML = `<div class="warning-box"><i class="fas fa-exclamation-triangle"></i> Tier ${tier} is too low to farm Neathiron (Tier 61+ required).</div>`;
        return;
      }
      runsNeeded = Math.ceil(totalIngolithValue / dropAmount);
    } else {
      if (needNeathiron > 0 || needIngolith > 0) {
        resultDiv.innerHTML = `<div class="warning-box"><i class="fas fa-exclamation-triangle"></i> Tier ${tier} is too low. Farm higher tiers!</div>`;
        return;
      }
      runsNeeded = Math.ceil(needObducite / dropAmount);
    }

    // Render output
    let materialsHtml = '';
    if (needNeathiron > 0)
      materialsHtml += `<div class="mat-item neathiron"><span>${needNeathiron}</span> Neathiron</div>`;
    if (needIngolith > 0)
      materialsHtml += `<div class="mat-item ingolith"><span>${needIngolith}</span> Ingolith</div>`;
    if (needObducite > 0)
      materialsHtml += `<div class="mat-item obducite"><span>${needObducite}</span> Obducite</div>`;

    if (materialsHtml === '') {
      resultDiv.innerHTML =
        '<div class="success-box"><i class="fas fa-check-circle"></i> Max Rank Reached!</div>';
      return;
    }

    resultDiv.innerHTML = `
      <div class="mats-needed">
        <h4>Materials Needed:</h4>
        <div class="mats-grid">${materialsHtml}</div>
      </div>
      <div class="runs-result">
        <div class="runs-count">${runsNeeded}</div>
        <div class="runs-label">Estimated Runs at Tier ${tier}</div>
        <div class="runs-sub">Assumes converting higher mats to lower</div>
      </div>
    `;
  }
}
