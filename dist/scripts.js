class BloodWaveGuide {
  constructor() {
    ((this.soundEnabled = !0),
      (this.theme = 'dark'),
      (this.totalPoints = 71),
      (this.usedPoints = 48),
      (this.buildVersion = '1.1.0'),
      this.init());
  }
  init() {
    (this.loadFromLocalStorage(),
      this.createParticles(),
      this.setupEventListeners(),
      this.setupSkillCalculator(),
      this.setupDamageCalculator(),
      this.setupRotationDemo(),
      this.setupGearComparison(),
      this.setupScrollAnimations(),
      this.setupShareFeature(),
      this.setupBuildExportImport(),
      this.updatePointsDisplay());
  }
  loadFromLocalStorage() {
    try {
      const e = localStorage.getItem('d4guide_build');
      if (e) {
        const t = JSON.parse(e);
        ((this.theme = t.theme || 'dark'),
          (this.soundEnabled = !1 !== t.soundEnabled),
          'light' === this.theme && document.body.classList.add('light-theme'));
      }
    } catch (e) {
      console.log('No saved build found');
    }
  }
  saveToLocalStorage() {
    try {
      const e = this.getBuildData();
      localStorage.setItem('d4guide_build', JSON.stringify(e));
    } catch (e) {
      console.error('Failed to save build:', e);
    }
  }
  getBuildData() {
    const e = {};
    return (
      document.querySelectorAll('.points').forEach(t => {
        const a = t.closest('.skill-item'),
          n = a ? a.querySelector('.skill-name') : null,
          i = n ? n.textContent : t.id;
        e[i] = { current: parseInt(t.dataset.current) || 0, max: parseInt(t.dataset.max) || 5 };
      }),
      {
        version: this.buildVersion,
        timestamp: new Date().toISOString(),
        theme: this.theme,
        soundEnabled: this.soundEnabled,
        usedPoints: this.usedPoints,
        totalPoints: this.totalPoints,
        calculator: {
          weaponDamage: parseFloat(this.getInputValue('weaponDamage', 5e3)),
          intelligence: parseInt(this.getInputValue('intelligence', 1e3)),
          critChance: parseInt(this.getInputValue('critChance', 40)),
          critDamage: parseInt(this.getInputValue('critDamage', 200)),
          additiveDamage: parseInt(this.getInputValue('additiveDamage', 150)),
          multiplicativeDamage: parseInt(this.getInputValue('multiplicativeDamage', 100)),
          overpowerDamage: parseInt(this.getInputValue('overpowerDamage', 50)),
          shadowDamage: parseInt(this.getInputValue('shadowDamage', 80)),
          vulnerableDamage: parseInt(this.getInputValue('vulnerableDamage', 60)),
          bloodWaveRanks: parseInt(this.getInputValue('bloodWaveRanks', 5)),
          tidalWaves: parseInt(this.getInputValue('tidalWaves', 3)),
          doubleDamageChance: parseInt(this.getInputValue('doubleDamageChance', 50))
        },
        skillPoints: e
      }
    );
  }
  getInputValue(e, t) {
    const a = document.getElementById(e);
    return a ? a.value : t;
  }
  createParticles() {
    const e = document.getElementById('particles');
    if (e)
      for (let t = 0; t < 20; t++) {
        const t = document.createElement('div');
        ((t.className = 'particle'),
          (t.style.left = 100 * Math.random() + '%'),
          (t.style.animationDelay = 15 * Math.random() + 's'),
          (t.style.animationDuration = 15 + 10 * Math.random() + 's'),
          e.appendChild(t));
      }
  }
  setupEventListeners() {
    const e = document.getElementById('navToggle'),
      t = document.getElementById('navMenu');
    e &&
      t &&
      e.addEventListener('click', () => {
        (t.classList.toggle('active'), this.playSound('menu'));
      });
    const a = document.getElementById('themeSwitcher');
    a && a.addEventListener('click', () => this.toggleTheme());
    const n = document.getElementById('soundToggle');
    n && n.addEventListener('click', () => this.toggleSound());
    const i = document.getElementById('backToTop');
    (i &&
      (window.addEventListener('scroll', () => {
        (window.scrollY > 300 ? i.classList.add('visible') : i.classList.remove('visible'),
          this.updateProgressBar());
      }),
      i.addEventListener('click', () => {
        (window.scrollTo({ top: 0, behavior: 'smooth' }), this.playSound('click'));
      })),
      t &&
        e &&
        document.addEventListener('click', a => {
          t.contains(a.target) || e.contains(a.target) || t.classList.remove('active');
        }),
      document.querySelectorAll('.skill-slot').forEach(e => {
        e.addEventListener('click', () => {
          (this.activateSkill(e), this.playSound('skill'));
        });
      }),
      document.addEventListener('keydown', e => {
        ('Escape' === e.key && t && t.classList.remove('active'), this.handleKeyboardShortcuts(e));
      }));
  }
  setupSkillCalculator() {
    document.querySelectorAll('.points').forEach(e => {
      (e.addEventListener('click', e => {
        const t = parseInt(e.target.dataset.current),
          a = parseInt(e.target.dataset.max);
        t < a &&
          this.usedPoints < this.totalPoints &&
          ((e.target.dataset.current = t + 1),
          (e.target.textContent = t + 1 + '/' + a),
          this.usedPoints++,
          this.updatePointsDisplay(),
          this.playSound('click'),
          this.highlightElement(e.target.parentElement),
          this.saveToLocalStorage());
      }),
        e.addEventListener('contextmenu', e => {
          e.preventDefault();
          const t = parseInt(e.target.dataset.current);
          t > 0 &&
            ((e.target.dataset.current = t - 1),
            (e.target.textContent = t - 1 + '/' + e.target.dataset.max),
            this.usedPoints--,
            this.updatePointsDisplay(),
            this.playSound('click'),
            this.highlightElement(e.target.parentElement),
            this.saveToLocalStorage());
        }));
    });
    const e = document.getElementById('resetSkills');
    e && e.addEventListener('click', () => this.resetSkills());
  }
  setupDamageCalculator() {
    ([
      'weaponDamage',
      'intelligence',
      'critChance',
      'critDamage',
      'additiveDamage',
      'multiplicativeDamage',
      'overpowerDamage',
      'shadowDamage',
      'vulnerableDamage',
      'bloodWaveRanks',
      'tidalWaves',
      'doubleDamageChance'
    ].forEach(e => {
      const t = document.getElementById(e);
      t &&
        t.addEventListener('input', () => {
          (this.calculateDamage(), this.saveToLocalStorage());
        });
    }),
      this.calculateDamage());
  }
  calculateDamage() {
    const e = parseFloat(this.getInputValue('weaponDamage', 5e3)),
      t = parseInt(this.getInputValue('intelligence', 1e3)),
      a = Math.min(100, parseInt(this.getInputValue('critChance', 40))),
      n = parseInt(this.getInputValue('critDamage', 200)),
      i = parseInt(this.getInputValue('additiveDamage', 150)),
      s = parseInt(this.getInputValue('multiplicativeDamage', 100)),
      o = parseInt(this.getInputValue('overpowerDamage', 50)),
      l = parseInt(this.getInputValue('shadowDamage', 80)),
      r = parseInt(this.getInputValue('vulnerableDamage', 60));
    let c =
      e *
      ((450 + 20 * (parseInt(this.getInputValue('bloodWaveRanks', 5)) - 1)) / 100) *
      (1 + 0.001 * t) *
      (1 + i / 100) *
      ((1 + s / 100) * (1 + l / 100)) *
      (1 + 0.4 * (parseInt(this.getInputValue('tidalWaves', 3)) - 1)) *
      (1 + Math.min(100, parseInt(this.getInputValue('doubleDamageChance', 50))) / 100);
    const d = 1 + n / 100,
      m = 1 + (a / 100) * (d - 1),
      u = 1 + r / 100,
      p = 1 + o / 100,
      h = Math.round(c),
      g = Math.round(c * d),
      v = Math.round(c * d * u),
      y = Math.round(c * p * 1.5),
      S = Math.round(c * m * (1 + 0.03 * (p - 1))),
      E = document.getElementById('damageResult');
    E && (E.textContent = S.toLocaleString());
    const C = document.getElementById('damageBreakdown');
    if (C) {
      C.textContent = '';
      [
        { label: 'Normal Hit:', value: h.toLocaleString(), cls: '' },
        { label: 'Critical Hit:', value: g.toLocaleString(), cls: 'critical' },
        { label: 'Vuln + Crit:', value: v.toLocaleString(), cls: 'vulnerable' },
        { label: 'Overpower:', value: y.toLocaleString(), cls: 'overpower' },
        { label: 'Average DPS:', value: S.toLocaleString(), cls: '', highlight: !0 }
      ].forEach(e => {
        const t = document.createElement('div');
        t.className = 'damage-breakdown-item' + (e.highlight ? ' highlight' : '');
        const a = document.createElement('span');
        ((a.className = 'breakdown-label'), (a.textContent = e.label));
        const n = document.createElement('span');
        ((n.className = 'breakdown-value' + (e.cls ? ' ' + e.cls : '')),
          (n.textContent = e.value),
          t.appendChild(a),
          t.appendChild(n),
          C.appendChild(t));
      });
    }
    return {
      normalDamage: h,
      criticalDamage: g,
      vulnerableCritDamage: v,
      overpowerDamage: y,
      avgDamage: S
    };
  }
  setupBuildExportImport() {
    const e = document.getElementById('exportBuild'),
      t = document.getElementById('importBuild'),
      a = document.getElementById('importFile');
    (e && e.addEventListener('click', () => this.exportBuild()),
      t &&
        a &&
        (t.addEventListener('click', () => a.click()),
        a.addEventListener('change', e => this.importBuild(e.target.files[0]))));
  }
  exportBuild() {
    const e = this.getBuildData(),
      t = JSON.stringify(e, null, 2),
      a = new Blob([t], { type: 'application/json' }),
      n = URL.createObjectURL(a),
      i = document.createElement('a');
    ((i.href = n),
      (i.download = 'blood-wave-build-' + new Date().toISOString().split('T')[0] + '.json'),
      document.body.appendChild(i),
      i.click(),
      document.body.removeChild(i),
      URL.revokeObjectURL(n),
      this.showNotification('Build exported successfully!'),
      this.playSound('click'));
  }
  importBuild(e) {
    if (!e) return;
    const t = new FileReader();
    ((t.onload = e => {
      try {
        const t = JSON.parse(e.target.result);
        (this.applyBuildData(t),
          this.showNotification('Build imported successfully!'),
          this.playSound('click'));
      } catch (e) {
        (this.showNotification('Error: Invalid build file', 'error'),
          console.error('Import error:', e));
      }
    }),
      t.readAsText(e));
  }
  applyBuildData(e) {
    if (!e.calculator) return;
    ([
      'weaponDamage',
      'intelligence',
      'critChance',
      'critDamage',
      'additiveDamage',
      'multiplicativeDamage',
      'overpowerDamage',
      'shadowDamage',
      'vulnerableDamage',
      'bloodWaveRanks',
      'tidalWaves',
      'doubleDamageChance'
    ].forEach(t => {
      const a = document.getElementById(t);
      a && void 0 !== e.calculator[t] && (a.value = e.calculator[t]);
    }),
      e.theme && e.theme !== this.theme && this.toggleTheme(),
      this.calculateDamage(),
      this.saveToLocalStorage());
  }
  showNotification(e, t) {
    t = t || 'success';
    const a = document.createElement('div');
    a.className = 'notification ' + t;
    const n = document.createElement('i');
    n.className = 'fas fa-' + ('success' === t ? 'check-circle' : 'exclamation-circle');
    const i = document.createElement('span');
    ((i.textContent = e),
      a.appendChild(n),
      a.appendChild(i),
      (a.style.position = 'fixed'),
      (a.style.top = '20px'),
      (a.style.right = '20px'),
      (a.style.padding = '15px 25px'),
      (a.style.background = 'success' === t ? 'var(--blood-red)' : '#ff4444'),
      (a.style.color = 'white'),
      (a.style.borderRadius = '8px'),
      (a.style.zIndex = '10000'),
      (a.style.display = 'flex'),
      (a.style.alignItems = 'center'),
      (a.style.gap = '10px'),
      (a.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)'),
      (a.style.animation = 'slideIn 0.3s ease'),
      document.body.appendChild(a),
      setTimeout(() => {
        ((a.style.animation = 'slideOut 0.3s ease'), setTimeout(() => a.remove(), 300));
      }, 3e3));
  }
  setupRotationDemo() {
    document.querySelectorAll('.rotation-step').forEach(e => {
      e.addEventListener('click', () => {
        (document.querySelectorAll('.rotation-step').forEach(e => e.classList.remove('active')),
          e.classList.add('active'),
          this.playSound('click'));
      });
    });
  }
  setupGearComparison() {
    document.querySelectorAll('.gear-slot').forEach(e => {
      e.addEventListener('click', () => this.showGearComparison(e));
    });
    const e = document.getElementById('closeModal');
    e &&
      e.addEventListener('click', () => {
        document.getElementById('gearModal').style.display = 'none';
      });
  }
  setupScrollAnimations() {
    const e = new IntersectionObserver(
      e => {
        e.forEach(e => {
          e.isIntersecting && e.target.classList.add('visible');
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.section').forEach(t => {
      e.observe(t);
    });
  }
  setupShareFeature() {
    const e = document.getElementById('shareBuild');
    e &&
      e.addEventListener('click', () => {
        const t = this.getInputValue('intelligence', 0),
          a = document.getElementById('damageResult'),
          n =
            '🩸 D4 Shadow Blood Wave Necro Build 🩸\n-----------------------------------\n🧠 Intelligence: ' +
            t +
            '\n💥 Avg Damage: ' +
            (a ? a.textContent : '0') +
            '\n🎯 Skill Points: ' +
            (this.usedPoints + '/' + this.totalPoints) +
            '\n-----------------------------------\nGenerated by Advanced Necro Guide\nhttps://d4guide.scarmonit.com';
        (navigator.clipboard.writeText(n).then(() => {
          (this.highlightElement(e), this.showNotification('Build copied to clipboard!'));
          const t = e.querySelector('i');
          t &&
            ((t.className = 'fas fa-check'),
            setTimeout(() => {
              t.className = 'fas fa-share-alt';
            }, 2e3));
        }),
          this.playSound('click'));
      });
  }
  activateSkill(e) {
    (document.querySelectorAll('.skill-slot').forEach(e => e.classList.remove('active')),
      e.classList.add('active'),
      console.log('Activated skill: ' + e.dataset.skill));
  }
  updatePointsDisplay() {
    const e = document.getElementById('pointsUsed');
    e && (e.textContent = this.usedPoints);
  }
  resetSkills() {
    (document.querySelectorAll('.points').forEach(e => {
      const t = parseInt(e.dataset.max);
      ((e.dataset.current = '0'), (e.textContent = '0/' + t));
    }),
      (this.usedPoints = 0),
      this.updatePointsDisplay(),
      this.playSound('reset'),
      this.saveToLocalStorage());
  }
  showGearComparison(e) {
    const t = e.dataset.gear,
      a = document.getElementById('gearModal'),
      n = document.getElementById('modalTitle'),
      i = document.getElementById('modalContent');
    if (!a || !n || !i) return;
    const s = {
      helmet: {
        primary: 'Heir of Perdition (Mythic)',
        primaryStats: ['+Crit Strike Chance', '+Lucky Hit Chance', '+Damage to Afflicted Enemies'],
        alternative: 'Aspect of the Cursed Aura',
        alternativeStats: ['+Max Life', '+Cooldown Reduction', '+Intelligence'],
        tempering: 'Total Armor, Shadow Resistance'
      },
      chest: {
        primary: 'Shroud of False Death (Mythic)',
        primaryStats: ['+1 All Passives', '+All Stats', '+Max Life'],
        alternative: 'Aspect of Hardened Bones',
        alternativeStats: ['+Damage Reduction', '+Max Life', '+Armor'],
        tempering: 'Corpse Tendrils Size, Maximum Life'
      },
      gloves: {
        primary: 'Sacrificial Aspect',
        primaryStats: ['+55% Sacrifice Bonuses', '+Attack Speed', '+Crit Strike Chance'],
        alternative: "Cruor's Embrace (Unique)",
        alternativeStats: ['+Blood Surge Ranks', '+Attack Speed', '+Crit Strike Chance'],
        tempering: 'Blood Overpower Damage %'
      },
      pants: {
        primary: "Kessime's Legacy (Unique)",
        primaryStats: ['+Blood Wave Dual Waves', '+Intelligence', '+Max Life'],
        alternative: "Tibault's Will (Unique)",
        alternativeStats: ['+Damage while Unstoppable', '+Max Resource', '+Damage Reduction'],
        tempering: 'None (Unique Item)'
      },
      boots: {
        primary: 'Aspect of Metamorphosis',
        primaryStats: ['+Movement Speed', '+All Stats', '+Resistances'],
        alternative: 'Aspect of Slaughter',
        alternativeStats: ['+Movement Speed', '+Max Life', '+Resistances'],
        tempering: 'Movement Speed, Dodge Chance'
      },
      weapon: {
        primary: 'Tidal Aspect (2H Weapon)',
        primaryStats: ['+3 Blood Waves', '+200% Wave Damage', '+Intelligence'],
        alternative: 'Bloodless Scream (Unique Scythe)',
        alternativeStats: ['+Shadow Damage to Frozen', '+Essence on Chill', '+Darkness Damage'],
        tempering: 'Blood Wave Double Damage Chance, Critical Strike Damage'
      },
      amulet: {
        primary: 'Aspect of Grasping Veins',
        primaryStats: ['+38% Crit Chance', '+75% Crit Damage', '+Cooldown Reduction'],
        alternative: "Banished Lord's Talisman (Unique)",
        alternativeStats: ['+Overpower Multiplier', '+Crit Strike Chance', '+Resource Generation'],
        tempering: 'Ultimate Cooldown Reduction %, Movement Speed'
      },
      ring1: {
        primary: 'Fastblood Aspect',
        primaryStats: [
          '+Ultimate CD Reduction on Blood Orb',
          '+Crit Strike Chance',
          '+Attack Speed'
        ],
        alternative: 'Ring of Starless Skies (Mythic)',
        alternativeStats: ['+Resource Cost Reduction', '+Damage Multiplier', '+Attack Speed'],
        tempering: 'Ultimate Cooldown Reduction %, Resource Generation'
      },
      ring2: {
        primary: 'Aspect of Ultimate Shadow',
        primaryStats: ['+Blood Wave is Darkness', '+Shadow DoT', '+Crit Strike Chance'],
        alternative: 'Ring of the Sacrilegious Soul (Unique)',
        alternativeStats: ['+Auto-cast Corpse Skills', '+Lucky Hit Chance', '+Crit Strike Chance'],
        tempering: 'Ultimate Cooldown Reduction %, Resource Generation'
      }
    }[t] || {
      primary: 'Highly Optimized Piece',
      primaryStats: ['Best in Slot stats'],
      alternative: 'Solid Alternative',
      alternativeStats: ['Budget stats'],
      tempering: 'Recommended Tempers'
    };
    ((n.textContent = t.charAt(0).toUpperCase() + t.slice(1) + ' Comparison'),
      (i.textContent = ''));
    const o = document.createElement('div');
    o.className = 'modal-comparison-grid';
    const l = this.createGearCard(
      'Primary Choice',
      s.primary,
      s.primaryStats,
      'primary',
      'fa-star',
      'var(--gold)'
    );
    o.appendChild(l);
    const r = this.createGearCard(
      'Alternative',
      s.alternative,
      s.alternativeStats,
      'alternative',
      'fa-exchange-alt',
      'var(--orange)'
    );
    (o.appendChild(r), i.appendChild(o));
    const c = document.createElement('div');
    c.className = 'tempering-box';
    const d = document.createElement('strong'),
      m = document.createElement('i');
    ((m.className = 'fas fa-hammer'),
      d.appendChild(m),
      d.appendChild(document.createTextNode(' Recommended Tempering: ')),
      c.appendChild(d),
      c.appendChild(document.createTextNode(s.tempering)),
      i.appendChild(c),
      (a.style.display = 'block'),
      this.playSound('click'),
      this.highlightElement(e));
  }
  createGearCard(e, t, a, n, i, s) {
    const o = document.createElement('div');
    o.className = 'comparison-card ' + n;
    const l = document.createElement('h4');
    ((l.style.color = s), (l.style.marginBottom = '10px'));
    const r = document.createElement('i');
    ((r.className = 'fas ' + i),
      l.appendChild(r),
      l.appendChild(document.createTextNode(' ' + e)),
      o.appendChild(l));
    const c = document.createElement('div');
    ((c.className = 'item-name'), (c.textContent = t), o.appendChild(c));
    const d = document.createElement('ul');
    return (
      a.forEach(e => {
        const t = document.createElement('li');
        ((t.textContent = e), d.appendChild(t));
      }),
      o.appendChild(d),
      o
    );
  }
  highlightElement(e) {
    e &&
      (e.classList.add('highlight-glow'),
      setTimeout(() => e.classList.remove('highlight-glow'), 500));
  }
  toggleTheme() {
    ((this.theme = 'dark' === this.theme ? 'light' : 'dark'),
      document.body.classList.toggle('light-theme'));
    const e = document.querySelector('#themeSwitcher i');
    (e && (e.className = 'dark' === this.theme ? 'fas fa-moon' : 'fas fa-sun'),
      this.saveToLocalStorage());
  }
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    const e = document.getElementById('soundToggle');
    if (!e) return;
    const t = e.querySelector('i');
    (this.soundEnabled
      ? (e.classList.remove('muted'), t && (t.className = 'fas fa-volume-up'))
      : (e.classList.add('muted'), t && (t.className = 'fas fa-volume-mute')),
      this.saveToLocalStorage());
  }
  playSound(e) {
    this.soundEnabled && console.log('Playing sound: ' + e);
  }
  handleKeyboardShortcuts(e) {
    if (e.key >= '1' && e.key <= '4') {
      const t = document.querySelectorAll('.skill-slot'),
        a = parseInt(e.key) - 1;
      t[a] && this.activateSkill(t[a]);
    }
    e.ctrlKey && 's' === e.key && (e.preventDefault(), this.exportBuild());
  }
  updateProgressBar() {
    const e = document.getElementById('progressBar');
    if (!e) return;
    const t = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    e.style.width = t + '%';
  }
}
(document.addEventListener('DOMContentLoaded', () => {
  window.bloodWaveGuide = new BloodWaveGuide();
}),
  console.log(
    '%c🩸 Advanced Shadow Blood Wave Necromancer Guide v1.1.0',
    'color: #8b0000; font-size: 16px; font-weight: bold;'
  ),
  console.log('Built for Season 11 - Divine Intervention'),
  console.log(
    'Features: D4-accurate damage calculator, build export/import, localStorage persistence'
  ));
