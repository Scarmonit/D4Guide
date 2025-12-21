class BloodWaveGuide {
  constructor() {
    ((this.soundEnabled = 'false' !== localStorage.getItem('soundEnabled')),
      (this.theme = localStorage.getItem('theme') || 'dark'),
      (this.dyslexicFont = 'true' === localStorage.getItem('dyslexicFont')),
      (this.totalPoints = 71),
      (this.usedPoints = 48),
      this.init());
  }
  init() {
    (this.applyPersistedSettings(),
      this.createParticles(),
      this.setupEventListeners(),
      this.setupSkillCalculator(),
      this.setupDamageCalculator(),
      this.setupRotationDemo(),
      this.setupGearComparison(),
      this.setupScrollAnimations(),
      this.setupShareFeature(),
      this.setupImageFallback(),
      this.updatePointsDisplay());
  }
  applyPersistedSettings() {
    ('light' === this.theme && document.body.classList.add('light-theme'),
      this.dyslexicFont && document.body.classList.add('dyslexic-font'),
      this.soundEnabled || document.getElementById('soundToggle')?.classList.add('muted'));
  }
  createParticles() {
    const e = document.getElementById('particles');
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
    (e.addEventListener('click', () => {
      (t.classList.toggle('active'), this.playSound('menu'));
    }),
      document.getElementById('themeSwitcher').addEventListener('click', () => {
        this.toggleTheme();
      }),
      document.getElementById('fontToggle').addEventListener('click', () => {
        this.toggleDyslexicFont();
      }),
      document.getElementById('soundToggle').addEventListener('click', () => {
        this.toggleSound();
      }));
    const a = document.getElementById('backToTop');
    (window.addEventListener('scroll', () => {
      (window.scrollY > 300 ? a.classList.add('visible') : a.classList.remove('visible'),
        this.updateProgressBar());
    }),
      a.addEventListener('click', () => {
        (window.scrollTo({ top: 0, behavior: 'smooth' }), this.playSound('click'));
      }),
      document.addEventListener('click', a => {
        t.contains(a.target) || e.contains(a.target) || t.classList.remove('active');
      }),
      document.querySelectorAll('.skill-slot').forEach(e => {
        e.addEventListener('click', () => {
          (this.activateSkill(e), this.playSound('skill'));
        });
      }),
      document.addEventListener('keydown', e => {
        ('Escape' === e.key && t.classList.remove('active'), this.handleKeyboardShortcuts(e));
      }),
      [
        e,
        document.getElementById('themeSwitcher'),
        document.getElementById('soundToggle'),
        document.getElementById('shareBuild'),
        document.getElementById('searchToggle')
      ].forEach(e => {
        e &&
          e.addEventListener('keydown', t => {
            ('Enter' !== t.key && ' ' !== t.key) || (t.preventDefault(), e.click());
          });
      }));
    let n = 0;
    (t.addEventListener(
      'touchstart',
      e => {
        n = e.changedTouches[0].screenX;
      },
      { passive: !0 }
    ),
      t.addEventListener(
        'touchend',
        e => {
          const a = e.changedTouches[0].screenX;
          n - a > 50 && t.classList.remove('active');
        },
        { passive: !0 }
      ));
  }
  setupSkillCalculator() {
    (document.querySelectorAll('.points').forEach(e => {
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
          this.highlightElement(e.target.parentElement));
      }),
        e.addEventListener('contextmenu', e => {
          e.preventDefault();
          const t = parseInt(e.target.dataset.current),
            a = parseInt(e.target.dataset.max);
          t > 0 &&
            ((e.target.dataset.current = t - 1),
            (e.target.textContent = t - 1 + '/' + a),
            this.usedPoints--,
            this.updatePointsDisplay(),
            this.playSound('click'),
            this.highlightElement(e.target.parentElement));
        }));
    }),
      document.getElementById('resetSkills').addEventListener('click', () => {
        this.resetSkills();
      }));
  }
  setupDamageCalculator() {
    ([
      'intelligence',
      'critChance',
      'critDamage',
      'overpowerDamage',
      'shadowDamage',
      'vulnerableDamage',
      'bloodWaveRanks'
    ].forEach(e => {
      document.getElementById(e).addEventListener('input', () => {
        this.calculateDamage();
      });
    }),
      this.calculateDamage());
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
    (document.querySelectorAll('.gear-slot').forEach(e => {
      e.addEventListener('click', () => {
        this.showGearComparison(e);
      });
    }),
      document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('gearModal').style.display = 'none';
      }));
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
        const t = `D4 Shadow Blood Wave Necro Build\n-----------------------------------\nIntelligence: ${document.getElementById('intelligence').value}\nEst. Damage: ${document.getElementById('damageResult').textContent}\nSkill Points: ${`${this.usedPoints}/${this.totalPoints}`}\n-----------------------------------\nGenerated by Advanced Necro Guide`;
        (navigator.clipboard.writeText(t).then(() => {
          this.highlightElement(e);
          const t = e.title;
          ((e.title = 'Copied!'), setTimeout(() => (e.title = t), 2e3));
          const a = e.querySelector('i');
          ((a.className = 'fas fa-check'),
            setTimeout(() => (a.className = 'fas fa-share-alt'), 2e3));
        }),
          this.playSound('click'));
      });
  }
  setupImageFallback() {
    document.querySelectorAll('img').forEach(e => {
      e.addEventListener('error', () => {
        ((e.src = 'https://via.placeholder.com/64/8b0000/ffffff?text=D4'),
          e.classList.add('image-fallback'));
      });
    });
  }
  calculateDamage() {
    const e = 10 * (parseInt(document.getElementById('intelligence').value) || 0),
      t =
        1 +
        ((parseInt(document.getElementById('critChance').value) || 0) / 100) *
          ((parseInt(document.getElementById('critDamage').value) || 0) / 100),
      a = 1 + (parseInt(document.getElementById('overpowerDamage').value) || 0) / 100,
      n = 1 + (parseInt(document.getElementById('shadowDamage').value) || 0) / 100,
      s = 1 + (parseInt(document.getElementById('vulnerableDamage').value) || 0) / 100,
      i = 1 + 0.2 * ((parseInt(document.getElementById('bloodWaveRanks').value) || 1) - 1),
      o = Math.round(e * t * a * n * s * i);
    document.getElementById('damageResult').textContent = o.toLocaleString();
  }
  activateSkill(e) {
    (document.querySelectorAll('.skill-slot').forEach(e => e.classList.remove('active')),
      e.classList.add('active'));
    const t = e.dataset.skill;
    console.log(`Activated skill: ${t}`);
  }
  updatePointsDisplay() {
    document.getElementById('pointsUsed').textContent = this.usedPoints;
  }
  resetSkills() {
    (document.querySelectorAll('.points').forEach(e => {
      const t = parseInt(e.dataset.max);
      ((e.dataset.current = '0'), (e.textContent = '0/' + t));
    }),
      (this.usedPoints = 0),
      this.updatePointsDisplay(),
      this.playSound('reset'));
  }
  showGearComparison(e) {
    const t = e.dataset.gear,
      a = document.getElementById('gearModal'),
      n = document.getElementById('modalTitle'),
      s = document.getElementById('modalContent'),
      i = {
        helmet: {
          primary: 'Heir of Perdition (Mythic)',
          primaryStats: [
            '+Crit Strike Chance',
            '+Lucky Hit Chance',
            '+Damage to Afflicted Enemies'
          ],
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
          alternativeStats: [
            '+Overpower Multiplier',
            '+Crit Strike Chance',
            '+Resource Generation'
          ],
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
          alternativeStats: [
            '+Auto-cast Corpse Skills',
            '+Lucky Hit Chance',
            '+Crit Strike Chance'
          ],
          tempering: 'Ultimate Cooldown Reduction %, Resource Generation'
        }
      }[t] || {
        primary: 'Highly Optimized Piece',
        primaryStats: ['Best in Slot stats'],
        alternative: 'Solid Alternative',
        alternativeStats: ['Budget stats'],
        tempering: 'Recommended Tempers'
      };
    n.textContent = `${t.charAt(0).toUpperCase() + t.slice(1)} Comparison`;
    let o = '<div class="modal-comparison-grid">';
    ((o += '<div class="comparison-card primary">'),
      (o +=
        '<h4 style="color: var(--gold); margin-bottom: 10px;"><i class="fas fa-star"></i> Primary Choice</h4>'),
      (o += `<div class="item-name">${i.primary}</div>`),
      (o += `<ul>${i.primaryStats.map(e => `<li>${e}</li>`).join('')}</ul>`),
      (o += '</div>'),
      (o += '<div class="comparison-card alternative">'),
      (o +=
        '<h4 style="color: var(--orange); margin-bottom: 10px;"><i class="fas fa-exchange-alt"></i> Alternative</h4>'),
      (o += `<div class="item-name">${i.alternative}</div>`),
      (o += `<ul>${i.alternativeStats.map(e => `<li>${e}</li>`).join('')}</ul>`),
      (o += '</div>'),
      (o += '</div>'),
      (o += '<div class="tempering-box">'),
      (o += `<strong><i class="fas fa-hammer"></i> Recommended Tempering:</strong> ${i.tempering}`),
      (o += '</div>'),
      (s.innerHTML = o),
      (a.style.display = 'block'),
      this.playSound('click'),
      this.highlightElement(e));
  }
  highlightElement(e) {
    (e.classList.add('highlight-glow'),
      setTimeout(() => e.classList.remove('highlight-glow'), 500));
  }
  toggleTheme() {
    ((this.theme = 'dark' === this.theme ? 'light' : 'dark'),
      document.body.classList.toggle('light-theme'));
    ((document.querySelector('#themeSwitcher i').className =
      'dark' === this.theme ? 'fas fa-moon' : 'fas fa-sun'),
      localStorage.setItem('theme', this.theme));
  }
  toggleDyslexicFont() {
    ((this.dyslexicFont = !this.dyslexicFont),
      document.body.classList.toggle('dyslexic-font'),
      localStorage.setItem('dyslexicFont', this.dyslexicFont),
      this.playSound('click'));
  }
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    const e = document.getElementById('soundToggle'),
      t = e.querySelector('i');
    (this.soundEnabled
      ? (e.classList.remove('muted'), (t.className = 'fas fa-volume-up'))
      : (e.classList.add('muted'), (t.className = 'fas fa-volume-mute')),
      localStorage.setItem('soundEnabled', this.soundEnabled));
  }
  playSound(e) {
    this.soundEnabled && console.log(`Playing sound: ${e}`);
  }
  handleKeyboardShortcuts(e) {
    if (e.key >= '1' && e.key <= '4') {
      const t = document.querySelectorAll('.skill-slot'),
        a = parseInt(e.key) - 1;
      t[a] && this.activateSkill(t[a]);
    }
  }
  updateProgressBar() {
    const e = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    document.getElementById('progressBar').style.width = e + '%';
  }
}
(document.addEventListener('DOMContentLoaded', () => {
  new BloodWaveGuide();
}),
  document.querySelectorAll('.variant-tab').forEach(e => {
    e.addEventListener('click', () => {
      const t = e.dataset.variant;
      (document.querySelectorAll('.variant-tab').forEach(e => e.classList.remove('active')),
        e.classList.add('active'),
        document.querySelectorAll('.variant-content').forEach(e => {
          (e.classList.remove('active'), e.dataset.variant === t && e.classList.add('active'));
        }));
    });
  }),
  console.log(
    "\n        [Blood Wave] Advanced Shadow Blood Wave Necromancer Guide Loaded!\n\n        Built for Season 11 - Divine Intervention\n        Features: Interactive calculators, skill tracking, damage simulation\n\n        Controls:\n        - Click skills to activate\n        - Use number keys 1-4 for quick skill selection\n        - ESC to close menus\n        - Click gear for comparisons\n\n        May Rathma's power flow through you!\n        "
  ),
  (function () {
    const e = document.getElementById('searchToggle'),
      t = document.getElementById('searchOverlay'),
      a = document.getElementById('searchInput'),
      n = document.getElementById('searchResults'),
      s = new Fuse(
        [
          {
            title: 'Sanctification',
            section: 'sanctification',
            content: 'Season 11 Sanctification system divine blessings'
          },
          {
            title: 'Build Variants',
            section: 'variants',
            content: 'Pit pushing farming speed variants'
          },
          {
            title: 'Skills & Keybinds',
            section: 'skills',
            content: 'Blood Wave Corpse Explosion Decrepify Blood Mist skills rotation'
          },
          {
            title: 'Skill Tree',
            section: 'skilltree',
            content: 'Passive skills talent points allocation'
          },
          {
            title: 'Book of the Dead',
            section: 'bookofthedead',
            content: 'Skeletal warriors mages golem minions'
          },
          {
            title: 'Paragon Boards',
            section: 'paragon',
            content: 'Glyphs rare nodes legendary boards'
          },
          {
            title: 'Gear & Aspects',
            section: 'gear',
            content: 'Helm chest gloves pants boots weapons aspects uniques'
          },
          {
            title: 'Stats Priority',
            section: 'stats',
            content: 'Critical strike damage cooldown reduction stats affixes'
          },
          {
            title: 'Gameplay Rotation',
            section: 'rotation',
            content: 'Combat rotation opener single target AoE'
          },
          {
            title: 'Gems & Runewords',
            section: 'gems',
            content: 'Ruby sapphire emerald diamond skull runewords'
          },
          {
            title: 'Mercenary Setup',
            section: 'mercenary',
            content: 'Mercenary hireling companion support'
          },
          {
            title: 'Divine Gifts',
            section: 'divinegifts',
            content: 'Divine gifts blessings season mechanic'
          },
          {
            title: 'Damage Calculator',
            section: 'calculator',
            content: 'Calculate damage DPS simulator'
          }
        ],
        { keys: ['title', 'content'], threshold: 0.4, includeMatches: !0 }
      );
    function i() {
      (t.classList.add('active'), a.focus(), (a.value = ''), l());
    }
    function o() {
      t.classList.remove('active');
    }
    function l() {
      for (; n.firstChild; ) n.removeChild(n.firstChild);
    }
    function r(e) {
      if ((l(), !e.trim())) return;
      const t = s.search(e);
      if (0 === t.length) {
        const e = document.createElement('div');
        return (
          (e.className = 'search-no-results'),
          (e.textContent = 'No results found'),
          void n.appendChild(e)
        );
      }
      t.slice(0, 8).forEach(e => {
        n.appendChild(
          (function (e) {
            const t = document.createElement('div');
            ((t.className = 'search-result-item'), (t.dataset.section = e.section));
            const a = document.createElement('div');
            a.className = 'title';
            const n = document.createElement('i');
            ((n.className = 'fas fa-arrow-right'),
              a.appendChild(n),
              a.appendChild(document.createTextNode(' ' + e.title)));
            const s = document.createElement('div');
            return (
              (s.className = 'context'),
              (s.textContent = e.content),
              t.appendChild(a),
              t.appendChild(s),
              t.addEventListener('click', () => {
                (o(), document.getElementById(e.section)?.scrollIntoView({ behavior: 'smooth' }));
              }),
              t
            );
          })(e.item)
        );
      });
    }
    (e.addEventListener('click', i),
      t.addEventListener('click', e => {
        e.target === t && o();
      }),
      a.addEventListener('input', e => r(e.target.value)),
      document.addEventListener('keydown', e => {
        ((e.ctrlKey || e.metaKey) && 'k' === e.key && (e.preventDefault(), i()),
          'Escape' === e.key && o());
      }));
  })(),
  'serviceWorker' in navigator &&
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then(e => console.log('SW registered:', e.scope))
        .catch(e => console.log('SW registration failed:', e));
    }));
