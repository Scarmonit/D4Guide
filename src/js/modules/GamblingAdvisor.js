export class GamblingAdvisor {
  constructor() {
    // Data based on Diablo 4 Aspect Slot Efficiency
    // Key: aspect name (partial match), Value: best slot to gamble
    this.aspectData = {
      Tidal: {
        slot: 'Sword/Focus',
        type: 'Offensive',
        reason: 'Offensive Aspects roll best on Weapons (cheaper than 2H)'
      },
      'Ultimate Shadow': {
        slot: 'Sword/Focus',
        type: 'Offensive',
        reason: 'Target 1H Weapons for Offensive Aspects'
      },
      'Hardened Bones': {
        slot: 'Pants',
        type: 'Defensive',
        reason: 'Pants only roll Defensive, removing dilution'
      },
      'Shielding Storm': {
        slot: 'Pants',
        type: 'Defensive',
        reason: 'Pants are the most efficient Defensive slot'
      },
      'Grasping Veins': { slot: 'Sword/Focus', type: 'Offensive', reason: 'Offensive pool' },
      Sacrificial: { slot: 'Sword/Focus', type: 'Offensive', reason: 'Offensive pool' },
      Fastblood: { slot: 'Ring', type: 'Resource', reason: 'Resource aspects only roll on Rings' },
      Metamorphosis: {
        slot: 'Boots',
        type: 'Mobility',
        reason: 'Mobility aspects roll best on Boots'
      },
      Slaughter: { slot: 'Boots', type: 'Mobility', reason: 'Boots for Speed/Mobility' },
      Embalmer: { slot: 'Pants', type: 'Defensive', reason: 'Defensive pool' },
      Disobedience: { slot: 'Pants', type: 'Defensive', reason: 'Defensive pool' }
    };

    this.init();
  }

  init() {
    this.renderAdvisor();
    this.setupListeners();
  }

  renderAdvisor() {
    const container = document.getElementById('gambling-advisor');
    if (!container) return;

    const aspectOptions = Object.keys(this.aspectData)
      .sort()
      .map(key => `<option value="${key}">${key} Aspect</option>`)
      .join('');

    container.innerHTML = `
      <div class="calculator-box gambling-box">
        <h3><i class="fas fa-coins"></i> Obol Gambling Advisor</h3>
        <p class="calc-desc">Don't waste Obols. Find the most efficient slot to gamble for your aspect.</p>
        
        <div class="advisor-input">
          <select id="aspectSelect" class="advisor-select">
            <option value="">Select an Aspect you need...</option>
            ${aspectOptions}
          </select>
        </div>

        <div id="gamblingResult" class="gambling-result">
          <div class="placeholder-text">Select an aspect to see the best gambling strategy</div>
        </div>
      </div>
    `;
  }

  setupListeners() {
    const select = document.getElementById('aspectSelect');
    if (!select) return;

    select.addEventListener('change', e => {
      this.showRecommendation(e.target.value);
    });
  }

  showRecommendation(aspectKey) {
    const resultDiv = document.getElementById('gamblingResult');
    if (!aspectKey) {
      resultDiv.innerHTML =
        '<div class="placeholder-text">Select an aspect to see the best gambling strategy</div>';
      resultDiv.className = 'gambling-result';
      return;
    }

    const data = this.aspectData[aspectKey];

    resultDiv.innerHTML = `
      <div class="gamble-card">
        <div class="gamble-header">
          <span class="aspect-type ${data.type.toLowerCase()}">${data.type}</span>
          <h4>${aspectKey} Aspect</h4>
        </div>
        <div class="gamble-body">
          <div class="recommendation">
            <span class="label">Gamble on:</span>
            <span class="slot-value"><i class="fas fa-dice"></i> ${data.slot}</span>
          </div>
          <p class="gamble-reason"><i class="fas fa-info-circle"></i> ${data.reason}</p>
        </div>
      </div>
    `;
    resultDiv.className = 'gambling-result active';
  }
}
