export class GlyphCalculator {
  constructor() {
    this.maxLevel = 100;
    this.init();
  }

  init() {
    this.renderCalculator();
    this.setupListeners();
  }

  renderCalculator() {
    const container = document.getElementById('glyph-calculator');
    if (!container) return;

    container.innerHTML = `
      <div class="calculator-box glyph-calc">
        <h3><i class="fas fa-arrow-up"></i> Glyph Upgrade Calculator</h3>
        <p class="calc-desc">Calculate your upgrade success chance in The Pit (Season 11 System).</p>
        
        <div class="calc-controls">
          <div class="control-group">
            <label>Glyph Level</label>
            <input type="number" id="glyphLevel" value="15" min="1" max="100" class="tier-input">
          </div>
          
          <div class="control-group">
            <label>Pit Tier Completed</label>
            <input type="number" id="pitTierGlyph" value="25" min="1" max="150" class="tier-input">
          </div>
        </div>

        <div id="glyphResult" class="glyph-result">
          <!-- Results injected here -->
        </div>
        
        <div class="glyph-table-mini">
          <small>Rule: Tier must be 10+ levels higher than Glyph for 100% chance.</small>
        </div>
      </div>
    `;

    this.calculateProbability();
  }

  setupListeners() {
    const inputs = ['glyphLevel', 'pitTierGlyph'];
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.calculateProbability());
      }
    });
  }

  calculateProbability() {
    const glyphLevel = parseInt(document.getElementById('glyphLevel').value) || 1;
    const pitTier = parseInt(document.getElementById('pitTierGlyph').value) || 1;
    const resultDiv = document.getElementById('glyphResult');

    const diff = pitTier - glyphLevel;
    let chance = 0;
    const bonusAttempts = 3; // Standard
    let extraText = '';

    // Season 11 / VoH Logic (Approximate based on known mechanics)
    if (diff >= 10) {
      chance = 100;
    } else if (diff >= 0) {
      // 0 to 9 difference drops from 70% to 20% roughly
      // Simplified curve
      chance = 70 - (9 - diff) * 5;
      if (chance < 15) chance = 15;
      if (diff === 0) chance = 70; // Exact tier match
    } else {
      chance = 5; // Penalty for lower tiers
      extraText = '<br><span class="warning-text">Tier too low!</span>';
    }

    // Cap
    if (chance > 100) chance = 100;
    if (chance < 0) chance = 0;

    let colorClass = 'prob-low';
    if (chance >= 100) colorClass = 'prob-guaranteed';
    else if (chance >= 60) colorClass = 'prob-high';
    else if (chance >= 30) colorClass = 'prob-med';

    resultDiv.innerHTML = `
      <div class="probability-display">
        <div class="prob-circle ${colorClass}">
          <span class="prob-value">${chance}%</span>
          <span class="prob-label">Success Chance</span>
        </div>
        <div class="prob-details">
          <p><strong>Attempts:</strong> ${bonusAttempts}</p>
          <p><strong>Safe Leveling Tier:</strong> ${glyphLevel + 10} ${extraText}</p>
        </div>
      </div>
    `;
  }
}
