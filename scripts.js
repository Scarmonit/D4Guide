// Advanced JavaScript functionality
class BloodWaveGuide {
  constructor() {
    this.soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    this.theme = localStorage.getItem('theme') || 'dark';
    this.dyslexicFont = localStorage.getItem('dyslexicFont') === 'true';
    this.totalPoints = 71;
    this.usedPoints = 48; // Default allocated points
    this.init();
  }

  init() {
    this.applyPersistedSettings();
    this.createParticles();
    this.setupEventListeners();
    this.setupSkillCalculator();
    this.setupDamageCalculator();
    this.setupRotationDemo();
    this.setupGearComparison();
    this.setupScrollAnimations();
    this.setupShareFeature();
    this.setupImageFallback();
    this.updatePointsDisplay();
  }

  applyPersistedSettings() {
    if (this.theme === 'light') document.body.classList.add('light-theme');
    if (this.dyslexicFont) document.body.classList.add('dyslexic-font');
    if (!this.soundEnabled) document.getElementById('soundToggle')?.classList.add('muted');
  }

  createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 15 + 's';
      particle.style.animationDuration = 15 + Math.random() * 10 + 's';
      particlesContainer.appendChild(particle);
    }
  }

  setupEventListeners() {
    // Navigation
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      this.playSound('menu');
    });

    // Theme switcher
    document.getElementById('themeSwitcher').addEventListener('click', () => {
      this.toggleTheme();
    });

    // Font toggle
    document.getElementById('fontToggle').addEventListener('click', () => {
      this.toggleDyslexicFont();
    });

    // Sound toggle
    document.getElementById('soundToggle').addEventListener('click', () => {
      this.toggleSound();
    });

    // Back to top
    const backToTopBtn = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
      this.updateProgressBar();
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.playSound('click');
    });

    // Close nav when clicking outside
    document.addEventListener('click', e => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navMenu.classList.remove('active');
      }
    });

    // Skill bar interactions
    document.querySelectorAll('.skill-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        this.activateSkill(slot);
        this.playSound('skill');
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        navMenu.classList.remove('active');
      }
      this.handleKeyboardShortcuts(e);
    });

    // Handle accessibility for div-buttons
    [
      navToggle,
      document.getElementById('themeSwitcher'),
      document.getElementById('soundToggle'),
      document.getElementById('shareBuild'),
      document.getElementById('searchToggle')
    ].forEach(btn => {
      if (!btn) return;
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });

    // Swipe to close menu on mobile
    let touchStartX = 0;
    navMenu.addEventListener(
      'touchstart',
      e => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );
    navMenu.addEventListener(
      'touchend',
      e => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) {
          // Swipe left
          navMenu.classList.remove('active');
        }
      },
      { passive: true }
    );
  }

  setupSkillCalculator() {
    document.querySelectorAll('.points').forEach(pointElement => {
      // Left click to add
      pointElement.addEventListener('click', e => {
        const current = parseInt(e.target.dataset.current);
        const max = parseInt(e.target.dataset.max);

        if (current < max && this.usedPoints < this.totalPoints) {
          e.target.dataset.current = current + 1;
          e.target.textContent = current + 1 + '/' + max;
          this.usedPoints++;
          this.updatePointsDisplay();
          this.playSound('click');
          this.highlightElement(e.target.parentElement);
        }
      });

      // Right click to remove
      pointElement.addEventListener('contextmenu', e => {
        e.preventDefault();
        const current = parseInt(e.target.dataset.current);
        const max = parseInt(e.target.dataset.max);

        if (current > 0) {
          e.target.dataset.current = current - 1;
          e.target.textContent = current - 1 + '/' + max;
          this.usedPoints--;
          this.updatePointsDisplay();
          this.playSound('click');
          this.highlightElement(e.target.parentElement);
        }
      });
    });

    document.getElementById('resetSkills').addEventListener('click', () => {
      this.resetSkills();
    });
  }

  setupDamageCalculator() {
    const inputs = [
      'intelligence',
      'critChance',
      'critDamage',
      'overpowerDamage',
      'shadowDamage',
      'vulnerableDamage',
      'bloodWaveRanks'
    ];
    inputs.forEach(inputId => {
      document.getElementById(inputId).addEventListener('input', () => {
        this.calculateDamage();
      });
    });
    this.calculateDamage();
  }

  setupRotationDemo() {
    document.querySelectorAll('.rotation-step').forEach(step => {
      step.addEventListener('click', () => {
        document.querySelectorAll('.rotation-step').forEach(s => s.classList.remove('active'));
        step.classList.add('active');
        this.playSound('click');
      });
    });
  }

  setupGearComparison() {
    document.querySelectorAll('.gear-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        this.showGearComparison(slot);
      });
    });

    document.getElementById('closeModal').addEventListener('click', () => {
      document.getElementById('gearModal').style.display = 'none';
    });
  }

  setupScrollAnimations() {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.section').forEach(section => {
      observer.observe(section);
    });
  }

  setupShareFeature() {
    const shareBtn = document.getElementById('shareBuild');
    if (!shareBtn) return;

    shareBtn.addEventListener('click', () => {
      const int = document.getElementById('intelligence').value;
      const dmg = document.getElementById('damageResult').textContent;
      const points = `${this.usedPoints}/${this.totalPoints}`;

      const summary =
        'D4 Shadow Blood Wave Necro Build\n' +
        '-----------------------------------\n' +
        `Intelligence: ${int}\n` +
        `Est. Damage: ${dmg}\n` +
        `Skill Points: ${points}\n` +
        '-----------------------------------\n' +
        'Generated by Advanced Necro Guide';

      navigator.clipboard.writeText(summary).then(() => {
        this.highlightElement(shareBtn);
        const originalTitle = shareBtn.title;
        shareBtn.title = 'Copied!';
        setTimeout(() => (shareBtn.title = originalTitle), 2000);

        // Visual feedback
        const icon = shareBtn.querySelector('i');
        icon.className = 'fas fa-check';
        setTimeout(() => (icon.className = 'fas fa-share-alt'), 2000);
      });
      this.playSound('click');
    });
  }

  setupImageFallback() {
    document.querySelectorAll('img').forEach(img => {
      img.addEventListener('error', () => {
        img.src = 'https://via.placeholder.com/64/8b0000/ffffff?text=D4';
        img.classList.add('image-fallback');
      });
    });
  }

  calculateDamage() {
    const int = parseInt(document.getElementById('intelligence').value) || 0;
    const critChance = parseInt(document.getElementById('critChance').value) || 0;
    const critDamage = parseInt(document.getElementById('critDamage').value) || 0;
    const overpower = parseInt(document.getElementById('overpowerDamage').value) || 0;
    const shadow = parseInt(document.getElementById('shadowDamage').value) || 0;
    const vulnerable = parseInt(document.getElementById('vulnerableDamage').value) || 0;
    const ranks = parseInt(document.getElementById('bloodWaveRanks').value) || 1;

    // Simplified damage calculation
    const baseDamage = int * 10;
    const critMultiplier = 1 + (critChance / 100) * (critDamage / 100);
    const overpowerMultiplier = 1 + overpower / 100;
    const shadowMultiplier = 1 + shadow / 100;
    const vulnerableMultiplier = 1 + vulnerable / 100;
    const rankMultiplier = 1 + (ranks - 1) * 0.2;

    const totalDamage = Math.round(
      baseDamage *
        critMultiplier *
        overpowerMultiplier *
        shadowMultiplier *
        vulnerableMultiplier *
        rankMultiplier
    );

    document.getElementById('damageResult').textContent = totalDamage.toLocaleString();
  }

  activateSkill(slot) {
    document.querySelectorAll('.skill-slot').forEach(s => s.classList.remove('active'));
    slot.classList.add('active');

    // Show skill details (could be expanded)
    const skillName = slot.dataset.skill;
    console.log(`Activated skill: ${skillName}`);
  }

  updatePointsDisplay() {
    document.getElementById('pointsUsed').textContent = this.usedPoints;
  }

  resetSkills() {
    document.querySelectorAll('.points').forEach(pointElement => {
      const max = parseInt(pointElement.dataset.max);
      pointElement.dataset.current = '0';
      pointElement.textContent = '0/' + max;
    });
    this.usedPoints = 0;
    this.updatePointsDisplay();
    this.playSound('reset');
  }

  showGearComparison(slot) {
    const gearType = slot.dataset.gear;
    const modal = document.getElementById('gearModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');

    const gearData = {
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
    };

    const data = gearData[gearType] || {
      primary: 'Highly Optimized Piece',
      primaryStats: ['Best in Slot stats'],
      alternative: 'Solid Alternative',
      alternativeStats: ['Budget stats'],
      tempering: 'Recommended Tempers'
    };

    modalTitle.textContent = `${gearType.charAt(0).toUpperCase() + gearType.slice(1)} Comparison`;

    let content = '<div class="modal-comparison-grid">';

    content += '<div class="comparison-card primary">';
    content +=
      '<h4 style="color: var(--gold); margin-bottom: 10px;"><i class="fas fa-star"></i> Primary Choice</h4>';
    content += `<div class="item-name">${data.primary}</div>`;
    content += `<ul>${data.primaryStats.map(s => `<li>${s}</li>`).join('')}</ul>`;
    content += '</div>';

    content += '<div class="comparison-card alternative">';
    content +=
      '<h4 style="color: var(--orange); margin-bottom: 10px;"><i class="fas fa-exchange-alt"></i> Alternative</h4>';
    content += `<div class="item-name">${data.alternative}</div>`;
    content += `<ul>${data.alternativeStats.map(s => `<li>${s}</li>`).join('')}</ul>`;
    content += '</div>';

    content += '</div>';

    content += '<div class="tempering-box">';
    content += `<strong><i class="fas fa-hammer"></i> Recommended Tempering:</strong> ${data.tempering}`;
    content += '</div>';

    modalContent.innerHTML = content;
    modal.style.display = 'block';
    this.playSound('click');
    this.highlightElement(slot);
  }

  highlightElement(el) {
    el.classList.add('highlight-glow');
    setTimeout(() => el.classList.remove('highlight-glow'), 500);
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.body.classList.toggle('light-theme');
    const icon = document.querySelector('#themeSwitcher i');
    icon.className = this.theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    localStorage.setItem('theme', this.theme);
  }

  toggleDyslexicFont() {
    this.dyslexicFont = !this.dyslexicFont;
    document.body.classList.toggle('dyslexic-font');
    localStorage.setItem('dyslexicFont', this.dyslexicFont);
    this.playSound('click');
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    const toggle = document.getElementById('soundToggle');
    const icon = toggle.querySelector('i');

    if (this.soundEnabled) {
      toggle.classList.remove('muted');
      icon.className = 'fas fa-volume-up';
    } else {
      toggle.classList.add('muted');
      icon.className = 'fas fa-volume-mute';
    }
    localStorage.setItem('soundEnabled', this.soundEnabled);
  }

  playSound(type) {
    if (!this.soundEnabled) return;

    // In a real implementation, you would play actual sound files
    console.log(`Playing sound: ${type}`);
  }

  handleKeyboardShortcuts(e) {
    if (e.key >= '1' && e.key <= '4') {
      const skillSlots = document.querySelectorAll('.skill-slot');
      const index = parseInt(e.key) - 1;
      if (skillSlots[index]) {
        this.activateSkill(skillSlots[index]);
      }
    }
  }

  updateProgressBar() {
    const scrolled =
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    document.getElementById('progressBar').style.width = scrolled + '%';
  }
}

// Initialize the guide when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BloodWaveGuide();
});

// Build Variant Tab Switching
document.querySelectorAll('.variant-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const variant = tab.dataset.variant;

    // Update tabs
    document.querySelectorAll('.variant-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Update content
    document.querySelectorAll('.variant-content').forEach(content => {
      content.classList.remove('active');
      if (content.dataset.variant === variant) {
        content.classList.add('active');
      }
    });
  });
});

// Console easter egg
console.log(`
        [Blood Wave] Advanced Shadow Blood Wave Necromancer Guide Loaded!

        Built for Season 11 - Divine Intervention
        Features: Interactive calculators, skill tracking, damage simulation

        Controls:
        - Click skills to activate
        - Use number keys 1-4 for quick skill selection
        - ESC to close menus
        - Click gear for comparisons

        May Rathma's power flow through you!
        `);
// Search functionality using safe DOM methods
(function () {
  const searchToggle = document.getElementById('searchToggle');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  // Build search index from page content
  const searchIndex = [
    {
      title: 'Sanctification',
      section: 'sanctification',
      content: 'Season 11 Sanctification system divine blessings'
    },
    { title: 'Build Variants', section: 'variants', content: 'Pit pushing farming speed variants' },
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
    { title: 'Paragon Boards', section: 'paragon', content: 'Glyphs rare nodes legendary boards' },
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
    { title: 'Damage Calculator', section: 'calculator', content: 'Calculate damage DPS simulator' }
  ];

  const fuse = new Fuse(searchIndex, {
    keys: ['title', 'content'],
    threshold: 0.4,
    includeMatches: true
  });

  function openSearch() {
    searchOverlay.classList.add('active');
    searchInput.focus();
    searchInput.value = '';
    clearResults();
  }

  function closeSearch() {
    searchOverlay.classList.remove('active');
  }

  function clearResults() {
    while (searchResults.firstChild) {
      searchResults.removeChild(searchResults.firstChild);
    }
  }

  function createResultItem(item) {
    const div = document.createElement('div');
    div.className = 'search-result-item';
    div.dataset.section = item.section;

    const titleDiv = document.createElement('div');
    titleDiv.className = 'title';
    const icon = document.createElement('i');
    icon.className = 'fas fa-arrow-right';
    titleDiv.appendChild(icon);
    titleDiv.appendChild(document.createTextNode(' ' + item.title));

    const contextDiv = document.createElement('div');
    contextDiv.className = 'context';
    contextDiv.textContent = item.content;

    div.appendChild(titleDiv);
    div.appendChild(contextDiv);

    div.addEventListener('click', () => {
      closeSearch();
      document.getElementById(item.section)?.scrollIntoView({ behavior: 'smooth' });
    });

    return div;
  }

  function performSearch(query) {
    clearResults();

    if (!query.trim()) return;

    const results = fuse.search(query);

    if (results.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'search-no-results';
      noResults.textContent = 'No results found';
      searchResults.appendChild(noResults);
      return;
    }

    results.slice(0, 8).forEach(result => {
      searchResults.appendChild(createResultItem(result.item));
    });
  }

  // Event listeners
  searchToggle.addEventListener('click', openSearch);
  searchOverlay.addEventListener('click', e => {
    if (e.target === searchOverlay) closeSearch();
  });
  searchInput.addEventListener('input', e => performSearch(e.target.value));

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape') {
      closeSearch();
    }
  });
})();

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(reg => console.log('SW registered:', reg.scope))
      .catch(err => console.log('SW registration failed:', err));
  });
}
