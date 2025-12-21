export class CooldownPlanner {
  constructor() {
    this.baseCooldown = 50; // Blood Wave base CD
    this.init();
  }

  init() {
    this.renderPlanner();
    this.setupListeners();
  }

  renderPlanner() {
    const container = document.getElementById('cooldown-planner');
    if (!container) return;

    container.innerHTML = `
      <div class="calculator-box cooldown-box">
        <h3><i class="fas fa-stopwatch"></i> Blood Wave CD Planner</h3>
        <p class="calc-desc">Simulate your actual combat cooldown.</p>
        
        <div class="calc-controls">
          <div class="control-group">
            <label>Gear CDR %</label>
            <input type="number" id="gearCdr" value="30" min="0" max="75" class="tier-input" placeholder="Total %">
          </div>
          
          <div class="control-group">
            <label>Fastblood Rank</label>
            <select id="fastbloodRank" class="advisor-select" style="width: auto;">
              <option value="0">None</option>
              <option value="1.5">1.5s</option>
              <option value="2.5">2.5s</option>
              <option value="3.0" selected>3.0s</option>
              <option value="4.0">4.0s (Amulet)</option>
            </select>
          </div>

          <div class="control-group">
            <label>Blood Orbs / Rotation</label>
            <input type="number" id="bloodOrbs" value="5" min="0" max="20" class="tier-input">
          </div>
          
          <div class="control-group">
            <label>Decrepify Procs</label>
            <input type="number" id="decrepifyProcs" value="5" min="0" max="50" class="tier-input">
          </div>
        </div>

        <div id="cdrResult" class="cdr-result">
          <!-- Results -->
        </div>
      </div>
    `;

    this.calculateCooldown();
  }

  setupListeners() {
    const inputs = ['gearCdr', 'fastbloodRank', 'bloodOrbs', 'decrepifyProcs'];
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', () => this.calculateCooldown());
        el.addEventListener('change', () => this.calculateCooldown());
      }
    });
  }

  calculateCooldown() {
    const gearCdr = parseFloat(document.getElementById('gearCdr').value) || 0;
    const fastbloodRed = parseFloat(document.getElementById('fastbloodRank').value) || 0;
    const orbs = parseInt(document.getElementById('bloodOrbs').value) || 0;
    const decrProcs = parseInt(document.getElementById('decrepifyProcs').value) || 0;

    // 1. Apply Gear CDR (Multiplicative reduction)
    let currentCd = this.baseCooldown * (1 - gearCdr / 100);
    const cooldownAfterGear = currentCd;

    // 2. Apply Flat Reductions (Fastblood)
    const fastbloodTotal = fastbloodRed * orbs;
    currentCd -= fastbloodTotal;

    // 3. Apply Decrepify (1s reduction per lucky hit proc)
    const decrepifyTotal = decrProcs * 1.0;
    currentCd -= decrepifyTotal;

    // Cap at 0
    if (currentCd < 0) currentCd = 0;

    const resultDiv = document.getElementById('cdrResult');

    let statusClass = 'cd-bad';
    let statusText = 'Slow Rotation';

    if (currentCd <= 0) {
      statusClass = 'cd-instant';
      statusText = 'Instant Reset!';
    } else if (currentCd <= 10) {
      statusClass = 'cd-great';
      statusText = 'Smooth Rotation';
    } else if (currentCd <= 20) {
      statusClass = 'cd-ok';
      statusText = 'Waiting on CD';
    }

    resultDiv.innerHTML = `
      <div class="cd-display ${statusClass}">
        <span class="cd-value">${currentCd.toFixed(1)}s</span>
        <span class="cd-label">Final Cooldown</span>
      </div>
      <div class="cd-breakdown">
        <div>Gear CD: ${cooldownAfterGear.toFixed(1)}s</div>
        <div>Orbs: -${fastbloodTotal.toFixed(1)}s</div>
        <div>Decrepify: -${decrepifyTotal.toFixed(1)}s</div>
      </div>
      <div class="cd-status">${statusText}</div>
    `;
  }
}
