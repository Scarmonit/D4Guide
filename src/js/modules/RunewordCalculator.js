export class RunewordCalculator {
  constructor() {
    this.ritualRunes = [
      { name: 'Yul', effect: 'Cast a Skill with a Cooldown', offering: 50 },
      { name: 'Cir', effect: 'Cast the same Skill 3 times', offering: 25 },
      { name: 'Ahu', effect: 'Lucky Hit: up to 100% chance against Injured', offering: 10 },
      { name: 'Neo', effect: 'Deal damage after not taking damage for 5s', offering: 300 },
      { name: 'Tam', effect: 'Cast a Core Skill', offering: 25 },
      { name: 'Xol', effect: 'Evoke power from another Class', offering: 150 },
      { name: 'Zan', effect: 'Cast an Ultimate Skill', offering: 150 },
      { name: 'Feo', effect: 'Become Injured or Crowd Controlled', offering: 1000 },
      { name: 'Noc', effect: 'Inflict Crowd Control', offering: 5 },
      { name: 'Cem', effect: 'Cast Evade', offering: 50 },
      { name: 'Moni', effect: 'Cast a Skill after moving', offering: 10 },
      { name: 'Kaa', effect: 'Lose 10% of Maximum Life', offering: 2 },
      { name: 'Yax', effect: 'Drink a Potion', offering: 100 },
      { name: 'Poc', effect: 'Spend 5% of your Resource', offering: 2 },
      { name: 'Lac', effect: 'Call your Mercenary', offering: 500 },
      { name: 'Ur', effect: 'Your Minion or Companion kills an enemy', offering: 10 },
      { name: 'Qax', effect: 'Kill a Non-Minion enemy', offering: 10 }
    ];

    this.invocationRunes = [
      { name: 'Wat', effect: 'Cast Horrid Decrepify', cost: 100 },
      { name: 'Met', effect: 'Leave an Earthquake', cost: 100 },
      { name: 'Ohm', effect: 'Cast Enhanced War Cry', cost: 600 },
      { name: 'Tun', effect: 'Spawn Stun Grenades', cost: 100 },
      { name: 'Ton', effect: 'Spawn Meteorites', cost: 25 },
      { name: 'Tal', effect: 'Spawn Pestilent Swarm', cost: 100 },
      { name: 'Ceh', effect: 'Summon a Spirit Wolf', cost: 100 },
      { name: 'Tec', effect: 'Cast Earth Spike', cost: 25 },
      { name: 'Yom', effect: 'Cast Petrify', cost: 500 },
      { name: 'Lac', effect: 'Cast Challenging Shout', cost: 400 },
      { name: 'Vex', effect: '+3 Skills for 5s', cost: 400 },
      { name: 'Gar', effect: 'Gain 2.5% Crit Chance for 5s', cost: 25 },
      { name: 'Xal', effect: 'Gain 20% Max Life for 4s', cost: 200 },
      { name: 'Que', effect: 'Gain Earthen Bulwark', cost: 800 },
      { name: 'Yul', effect: 'Gain a barrier for 10% Max Life', cost: 150 },
      { name: 'Zec', effect: 'Reduce Ultimate Cooldown by 4s', cost: 200 },
      { name: 'Lum', effect: 'Restore 1 Primary Resource', cost: 5 },
      { name: 'Qua', effect: 'Restore an Evade Charge', cost: 400 },
      { name: 'Xan', effect: 'Your next Skill Overpowers', cost: 700 },
      { name: 'Eom', effect: 'Reduce Cooldowns by 0.25s', cost: 100 },
      { name: 'Lum', effect: 'Restore 50 Primary Resource', cost: 500 },
      { name: 'Ony', effect: 'Cast Bolt', cost: 25 },
      { name: 'Zan', effect: 'Skill gains +20% damage', cost: 150 }
    ];

    this.init();
  }

  init() {
    this.renderCalculator();
    this.setupListeners();
  }

  renderCalculator() {
    const container = document.getElementById('runeword-calculator');
    if (!container) return;

    container.innerHTML = `
      <div class="runeword-builder">
        <div class="rune-selection">
          <div class="rune-column">
            <h4><i class="fas fa-circle-notch"></i> Rune of Ritual</h4>
            <select id="ritualRune" class="rune-select">
              <option value="">Select Ritual Rune...</option>
              ${this.ritualRunes.map(r => `<option value="${r.name}">${r.name} - ${r.effect}</option>`).join('')}
            </select>
            <div id="ritualInfo" class="rune-info"></div>
          </div>
          <div class="rune-column">
            <h4><i class="fas fa-bolt"></i> Rune of Invocation</h4>
            <select id="invocationRune" class="rune-select">
              <option value="">Select Invocation Rune...</option>
              ${this.invocationRunes.map(r => `<option value="${r.name}">${r.name} - ${r.effect}</option>`).join('')}
            </select>
            <div id="invocationInfo" class="rune-info"></div>
          </div>
        </div>
        <div class="runeword-result" id="runewordResult">
          <div class="placeholder-text">Select both runes to see the synergy</div>
        </div>
      </div>
    `;
  }

  setupListeners() {
    const ritualSelect = document.getElementById('ritualRune');
    const invocationSelect = document.getElementById('invocationRune');

    if (ritualSelect && invocationSelect) {
      ritualSelect.addEventListener('change', () => this.updateDisplay());
      invocationSelect.addEventListener('change', () => this.updateDisplay());
    }
  }

  updateDisplay() {
    const ritualName = document.getElementById('ritualRune').value;
    const invocationName = document.getElementById('invocationRune').value;
    const resultDiv = document.getElementById('runewordResult');
    const ritualInfo = document.getElementById('ritualInfo');
    const invocationInfo = document.getElementById('invocationInfo');

    const ritual = this.ritualRunes.find(r => r.name === ritualName);
    const invocation = this.invocationRunes.find(r => r.name === invocationName);

    if (ritual) {
      ritualInfo.innerHTML = `
        <div class="rune-detail">
          <span class="label">Condition:</span> ${ritual.effect}
          <br><span class="label">Generates:</span> <span class="value">${ritual.offering} Offering</span>
        </div>
      `;
    } else {
      ritualInfo.innerHTML = '';
    }

    if (invocation) {
      invocationInfo.innerHTML = `
        <div class="rune-detail">
          <span class="label">Effect:</span> ${invocation.effect}
          <br><span class="label">Cost:</span> <span class="value">${invocation.cost} Offering</span>
        </div>
      `;
    } else {
      invocationInfo.innerHTML = '';
    }

    if (ritual && invocation) {
      const castsPerTrigger = Math.floor(ritual.offering / invocation.cost);
      let synergyText = '';

      if (castsPerTrigger >= 1) {
        synergyText = `<span class="synergy-good">Excellent Synergy!</span> Triggers ${castsPerTrigger} time(s) per action.`;
        if (ritual.offering % invocation.cost !== 0) {
          synergyText += ` (Overflow: ${ritual.offering % invocation.cost} Offering)`;
        }
      } else {
        const triggersNeeded = Math.ceil(invocation.cost / ritual.offering);
        synergyText = `<span class="synergy-ok">Moderate Synergy.</span> Requires ${triggersNeeded} actions to trigger once.`;
      }

      resultDiv.innerHTML = `
        <h3><span class="rune-name">${ritual.name}</span> + <span class="rune-name">${invocation.name}</span></h3>
        <div class="synergy-result">
          <p>${synergyText}</p>
          <p class="effect-summary">
            <strong>How it works:</strong> Whenever you <em>${ritual.effect}</em>, you generate Offering. 
            Once you have ${invocation.cost} Offering, you automatically <em>${invocation.effect}</em>.
          </p>
        </div>
      `;
      resultDiv.className = 'runeword-result active';
    } else {
      resultDiv.innerHTML =
        '<div class="placeholder-text">Select both runes to see the synergy</div>';
      resultDiv.className = 'runeword-result';
    }
  }
}
