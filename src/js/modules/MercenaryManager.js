export class MercenaryManager {
  constructor() {
    this.mercenaries = {
      raheir: {
        name: 'Raheir',
        role: 'Shieldbearer',
        description: 'Provides massive defensive buffs and taunts enemies.',
        skills: [
          { name: 'Ground Slam', desc: 'Slams the ground, Slowing enemies and dealing damage.' },
          {
            name: "Raheir's Aegis",
            desc: 'Provides a barrier that absorbs damage for you and allies.'
          },
          {
            name: 'Bastion',
            desc: 'Passive: You gain 15% Damage Reduction while Raheir is active.'
          },
          { name: 'Inspiration', desc: "Passive: Raheir's attacks reduce your cooldowns." }
        ]
      },
      aldkin: {
        name: 'Aldkin',
        role: 'Cursed Child',
        description: 'Demon form that deals massive Shadow damage over time.',
        skills: [
          { name: 'Flame Surge', desc: 'Unleashes a wave of fire that Burns enemies.' },
          { name: 'Haunt', desc: 'Curses enemies, making them Vulnerable.' },
          {
            name: 'Darkness',
            desc: 'Passive: Enemies damaged by Aldkin take 10% more Shadow damage.'
          },
          { name: 'Fate', desc: 'Passive: Aldkin has a chance to execute Injured non-Elites.' }
        ]
      },
      varyana: {
        name: 'Varyana',
        role: 'Berserker Crone',
        description: 'Melee powerhouse that increases your attack speed.',
        skills: [
          {
            name: 'Whirlwind',
            desc: 'Spins rapidly, dealing Physical damage to surrounding enemies.'
          },
          { name: 'Bloodthirst', desc: 'Enrages, increasing Attack Speed for both of you.' },
          { name: 'Cleave', desc: "Passive: Varyana's attacks cause enemies to Bleed." },
          { name: 'Haste', desc: 'Passive: You gain Movement Speed after killing an Elite.' }
        ]
      },
      subo: {
        name: 'Subo',
        role: 'Bounty Hunter',
        description: 'Ranged support that marks targets and sets traps.',
        skills: [
          { name: 'Explosive Trap', desc: 'Sets a trap that explodes when enemies walk over it.' },
          {
            name: 'Mark Target',
            desc: 'Marks an enemy. You deal increased Critical Strike Damage to them.'
          },
          { name: 'Snipe', desc: 'Passive: Subo deals bonus damage to distant enemies.' },
          {
            name: 'Scavenger',
            desc: 'Passive: Enemies killed by Subo drop additional Gold/Materials.'
          }
        ]
      }
    };

    this.init();
  }

  init() {
    this.renderMercenaryUI();
    this.setupListeners();
  }

  renderMercenaryUI() {
    const container = document.getElementById('mercenary-ui');
    if (!container) return;

    container.innerHTML = `
      <div class="mercenary-tabs">
        ${Object.keys(this.mercenaries)
          .map(
            key => `
          <button class="merc-tab ${key === 'raheir' ? 'active' : ''}" data-merc="${key}">
            ${this.mercenaries[key].name}
          </button>
        `
          )
          .join('')}
      </div>
      <div class="mercenary-content" id="mercenary-content">
        <!-- Content loaded dynamically -->
      </div>
    `;

    this.loadMercenary('raheir');
  }

  setupListeners() {
    const tabs = document.querySelectorAll('.merc-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.loadMercenary(tab.dataset.merc);
      });
    });
  }

  loadMercenary(key) {
    const merc = this.mercenaries[key];
    const content = document.getElementById('mercenary-content');

    content.innerHTML = `
      <div class="merc-header">
        <h3><i class="fas fa-user-circle"></i> ${merc.name}</h3>
        <span class="merc-role">${merc.role}</span>
      </div>
      <p class="merc-desc">${merc.description}</p>
      <div class="merc-skills">
        ${merc.skills
          .map(
            skill => `
          <div class="merc-skill-card">
            <h4>${skill.name}</h4>
            <p>${skill.desc}</p>
          </div>
        `
          )
          .join('')}
      </div>
    `;

    // Animate in
    content.classList.remove('fade-in');
    void content.offsetWidth; // Trigger reflow
    content.classList.add('fade-in');
  }
}
