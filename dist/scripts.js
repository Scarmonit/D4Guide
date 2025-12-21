// Advanced JavaScript functionality with D4-accurate damage calculations
class BloodWaveGuide {
    constructor() {
        this.soundEnabled = true;
        this.theme = 'dark';
        this.totalPoints = 71;
        this.usedPoints = 48;
        this.buildVersion = '1.1.0';
        this.init();
    }

    init() {
        this.loadFromLocalStorage();
        this.createParticles();
        this.setupEventListeners();
        this.setupSkillCalculator();
        this.setupDamageCalculator();
        this.setupRotationDemo();
        this.setupGearComparison();
        this.setupScrollAnimations();
        this.setupShareFeature();
        this.setupBuildExportImport();
        this.updatePointsDisplay();
    }

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('d4guide_build');
            if (saved) {
                const data = JSON.parse(saved);
                this.theme = data.theme || 'dark';
                this.soundEnabled = data.soundEnabled !== false;
                if (this.theme === 'light') {
                    document.body.classList.add('light-theme');
                }
            }
        } catch (e) {
            console.log('No saved build found');
        }
    }

    saveToLocalStorage() {
        try {
            const buildData = this.getBuildData();
            localStorage.setItem('d4guide_build', JSON.stringify(buildData));
        } catch (e) {
            console.error('Failed to save build:', e);
        }
    }

    getBuildData() {
        const skillPoints = {};
        document.querySelectorAll('.points').forEach(el => {
            const skillItem = el.closest('.skill-item');
            const skillNameEl = skillItem ? skillItem.querySelector('.skill-name') : null;
            const skillName = skillNameEl ? skillNameEl.textContent : el.id;
            skillPoints[skillName] = {
                current: parseInt(el.dataset.current) || 0,
                max: parseInt(el.dataset.max) || 5
            };
        });

        return {
            version: this.buildVersion,
            timestamp: new Date().toISOString(),
            theme: this.theme,
            soundEnabled: this.soundEnabled,
            usedPoints: this.usedPoints,
            totalPoints: this.totalPoints,
            calculator: {
                weaponDamage: parseFloat(this.getInputValue('weaponDamage', 5000)),
                intelligence: parseInt(this.getInputValue('intelligence', 1000)),
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
            skillPoints: skillPoints
        };
    }

    getInputValue(id, defaultVal) {
        const el = document.getElementById(id);
        return el ? el.value : defaultVal;
    }

    createParticles() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (15 + Math.random() * 10) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    setupEventListeners() {
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                this.playSound('menu');
            });
        }

        const themeSwitcher = document.getElementById('themeSwitcher');
        if (themeSwitcher) {
            themeSwitcher.addEventListener('click', () => this.toggleTheme());
        }

        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.addEventListener('click', () => this.toggleSound());
        }

        const backToTopBtn = document.getElementById('backToTop');
        if (backToTopBtn) {
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
        }

        if (navMenu && navToggle) {
            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                }
            });
        }

        document.querySelectorAll('.skill-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                this.activateSkill(slot);
                this.playSound('skill');
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu) {
                navMenu.classList.remove('active');
            }
            this.handleKeyboardShortcuts(e);
        });
    }

    setupSkillCalculator() {
        document.querySelectorAll('.points').forEach(pointElement => {
            pointElement.addEventListener('click', (e) => {
                const current = parseInt(e.target.dataset.current);
                const max = parseInt(e.target.dataset.max);

                if (current < max && this.usedPoints < this.totalPoints) {
                    e.target.dataset.current = current + 1;
                    e.target.textContent = (current + 1) + '/' + max;
                    this.usedPoints++;
                    this.updatePointsDisplay();
                    this.playSound('click');
                    this.highlightElement(e.target.parentElement);
                    this.saveToLocalStorage();
                }
            });

            pointElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const current = parseInt(e.target.dataset.current);

                if (current > 0) {
                    e.target.dataset.current = current - 1;
                    e.target.textContent = (current - 1) + '/' + e.target.dataset.max;
                    this.usedPoints--;
                    this.updatePointsDisplay();
                    this.playSound('click');
                    this.highlightElement(e.target.parentElement);
                    this.saveToLocalStorage();
                }
            });
        });

        const resetBtn = document.getElementById('resetSkills');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSkills());
        }
    }

    setupDamageCalculator() {
        const inputs = [
            'weaponDamage', 'intelligence', 'critChance', 'critDamage',
            'additiveDamage', 'multiplicativeDamage', 'overpowerDamage',
            'shadowDamage', 'vulnerableDamage', 'bloodWaveRanks',
            'tidalWaves', 'doubleDamageChance'
        ];

        inputs.forEach(inputId => {
            const el = document.getElementById(inputId);
            if (el) {
                el.addEventListener('input', () => {
                    this.calculateDamage();
                    this.saveToLocalStorage();
                });
            }
        });
        this.calculateDamage();
    }

    calculateDamage() {
        const weaponDmg = parseFloat(this.getInputValue('weaponDamage', 5000));
        const int = parseInt(this.getInputValue('intelligence', 1000));
        const critChance = Math.min(100, parseInt(this.getInputValue('critChance', 40)));
        const critDamage = parseInt(this.getInputValue('critDamage', 200));
        const additive = parseInt(this.getInputValue('additiveDamage', 150));
        const multiplicative = parseInt(this.getInputValue('multiplicativeDamage', 100));
        const overpower = parseInt(this.getInputValue('overpowerDamage', 50));
        const shadow = parseInt(this.getInputValue('shadowDamage', 80));
        const vulnerable = parseInt(this.getInputValue('vulnerableDamage', 60));
        const ranks = parseInt(this.getInputValue('bloodWaveRanks', 5));
        const tidalWaves = parseInt(this.getInputValue('tidalWaves', 3));
        const doubleDmgChance = Math.min(100, parseInt(this.getInputValue('doubleDamageChance', 50)));

        const bloodWaveBasePct = 450;
        const rankBonus = (ranks - 1) * 20;
        const skillDamagePct = (bloodWaveBasePct + rankBonus) / 100;
        const mainStatFactor = 1 + (int * 0.001);
        const additiveFactor = 1 + (additive / 100);
        const shadowFactor = 1 + (shadow / 100);
        const multiplicativeFactor = (1 + (multiplicative / 100)) * shadowFactor;
        const tidalFactor = 1 + ((tidalWaves - 1) * 0.4);
        const doubleDmgFactor = 1 + (doubleDmgChance / 100);

        let baseDamage = weaponDmg * skillDamagePct * mainStatFactor * additiveFactor * multiplicativeFactor * tidalFactor * doubleDmgFactor;

        const critFactor = 1 + (critDamage / 100);
        const avgCritMultiplier = 1 + ((critChance / 100) * (critFactor - 1));
        const vulnerableFactor = 1 + (vulnerable / 100);
        const overpowerFactor = 1 + (overpower / 100);
        const overpowerChance = 0.03;

        const normalDamage = Math.round(baseDamage);
        const criticalDamage = Math.round(baseDamage * critFactor);
        const vulnerableCritDamage = Math.round(baseDamage * critFactor * vulnerableFactor);
        const overpowerDamageVal = Math.round(baseDamage * overpowerFactor * 1.5);
        const avgDamage = Math.round(baseDamage * avgCritMultiplier * (1 + (overpowerChance * (overpowerFactor - 1))));

        const resultEl = document.getElementById('damageResult');
        if (resultEl) {
            resultEl.textContent = avgDamage.toLocaleString();
        }

        const breakdownEl = document.getElementById('damageBreakdown');
        if (breakdownEl) {
            breakdownEl.textContent = '';

            const items = [
                { label: 'Normal Hit:', value: normalDamage.toLocaleString(), cls: '' },
                { label: 'Critical Hit:', value: criticalDamage.toLocaleString(), cls: 'critical' },
                { label: 'Vuln + Crit:', value: vulnerableCritDamage.toLocaleString(), cls: 'vulnerable' },
                { label: 'Overpower:', value: overpowerDamageVal.toLocaleString(), cls: 'overpower' },
                { label: 'Average DPS:', value: avgDamage.toLocaleString(), cls: '', highlight: true }
            ];

            items.forEach(item => {
                const row = document.createElement('div');
                row.className = 'damage-breakdown-item' + (item.highlight ? ' highlight' : '');

                const labelSpan = document.createElement('span');
                labelSpan.className = 'breakdown-label';
                labelSpan.textContent = item.label;

                const valueSpan = document.createElement('span');
                valueSpan.className = 'breakdown-value' + (item.cls ? ' ' + item.cls : '');
                valueSpan.textContent = item.value;

                row.appendChild(labelSpan);
                row.appendChild(valueSpan);
                breakdownEl.appendChild(row);
            });
        }

        return { normalDamage, criticalDamage, vulnerableCritDamage, overpowerDamage: overpowerDamageVal, avgDamage };
    }

    setupBuildExportImport() {
        const exportBtn = document.getElementById('exportBuild');
        const importBtn = document.getElementById('importBuild');
        const importFile = document.getElementById('importFile');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportBuild());
        }

        if (importBtn && importFile) {
            importBtn.addEventListener('click', () => importFile.click());
            importFile.addEventListener('change', (e) => this.importBuild(e.target.files[0]));
        }
    }

    exportBuild() {
        const buildData = this.getBuildData();
        const dataStr = JSON.stringify(buildData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'blood-wave-build-' + new Date().toISOString().split('T')[0] + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Build exported successfully!');
        this.playSound('click');
    }

    importBuild(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const buildData = JSON.parse(e.target.result);
                this.applyBuildData(buildData);
                this.showNotification('Build imported successfully!');
                this.playSound('click');
            } catch (err) {
                this.showNotification('Error: Invalid build file', 'error');
                console.error('Import error:', err);
            }
        };
        reader.readAsText(file);
    }

    applyBuildData(data) {
        if (!data.calculator) return;

        const fields = ['weaponDamage', 'intelligence', 'critChance', 'critDamage',
                       'additiveDamage', 'multiplicativeDamage', 'overpowerDamage',
                       'shadowDamage', 'vulnerableDamage', 'bloodWaveRanks',
                       'tidalWaves', 'doubleDamageChance'];

        fields.forEach(field => {
            const el = document.getElementById(field);
            if (el && data.calculator[field] !== undefined) {
                el.value = data.calculator[field];
            }
        });

        if (data.theme && data.theme !== this.theme) {
            this.toggleTheme();
        }

        this.calculateDamage();
        this.saveToLocalStorage();
    }

    showNotification(message, type) {
        type = type || 'success';
        const notification = document.createElement('div');
        notification.className = 'notification ' + type;

        const icon = document.createElement('i');
        icon.className = 'fas fa-' + (type === 'success' ? 'check-circle' : 'exclamation-circle');

        const text = document.createElement('span');
        text.textContent = message;

        notification.appendChild(icon);
        notification.appendChild(text);

        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px 25px';
        notification.style.background = type === 'success' ? 'var(--blood-red)' : '#ff4444';
        notification.style.color = 'white';
        notification.style.borderRadius = '8px';
        notification.style.zIndex = '10000';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.gap = '10px';
        notification.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        notification.style.animation = 'slideIn 0.3s ease';

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
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
            slot.addEventListener('click', () => this.showGearComparison(slot));
        });

        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                document.getElementById('gearModal').style.display = 'none';
            });
        }
    }

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });
    }

    setupShareFeature() {
        const shareBtn = document.getElementById('shareBuild');
        if (!shareBtn) return;

        shareBtn.addEventListener('click', () => {
            const int = this.getInputValue('intelligence', 0);
            const dmgEl = document.getElementById('damageResult');
            const dmg = dmgEl ? dmgEl.textContent : '0';
            const points = this.usedPoints + '/' + this.totalPoints;

            const summary = '🩸 D4 Shadow Blood Wave Necro Build 🩸\n' +
                            '-----------------------------------\n' +
                            '🧠 Intelligence: ' + int + '\n' +
                            '💥 Avg Damage: ' + dmg + '\n' +
                            '🎯 Skill Points: ' + points + '\n' +
                            '-----------------------------------\n' +
                            'Generated by Advanced Necro Guide\n' +
                            'https://d4guide.scarmonit.com';

            navigator.clipboard.writeText(summary).then(() => {
                this.highlightElement(shareBtn);
                this.showNotification('Build copied to clipboard!');

                const icon = shareBtn.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-check';
                    setTimeout(() => { icon.className = 'fas fa-share-alt'; }, 2000);
                }
            });
            this.playSound('click');
        });
    }

    activateSkill(slot) {
        document.querySelectorAll('.skill-slot').forEach(s => s.classList.remove('active'));
        slot.classList.add('active');
        console.log('Activated skill: ' + slot.dataset.skill);
    }

    updatePointsDisplay() {
        const el = document.getElementById('pointsUsed');
        if (el) {
            el.textContent = this.usedPoints;
        }
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
        this.saveToLocalStorage();
    }

    showGearComparison(slot) {
        const gearType = slot.dataset.gear;
        const modal = document.getElementById('gearModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalContent = document.getElementById('modalContent');

        if (!modal || !modalTitle || !modalContent) return;

        const gearData = {
            helmet: {
                primary: "Heir of Perdition (Mythic)",
                primaryStats: ["+Crit Strike Chance", "+Lucky Hit Chance", "+Damage to Afflicted Enemies"],
                alternative: "Aspect of the Cursed Aura",
                alternativeStats: ["+Max Life", "+Cooldown Reduction", "+Intelligence"],
                tempering: "Total Armor, Shadow Resistance"
            },
            chest: {
                primary: "Shroud of False Death (Mythic)",
                primaryStats: ["+1 All Passives", "+All Stats", "+Max Life"],
                alternative: "Aspect of Hardened Bones",
                alternativeStats: ["+Damage Reduction", "+Max Life", "+Armor"],
                tempering: "Corpse Tendrils Size, Maximum Life"
            },
            gloves: {
                primary: "Sacrificial Aspect",
                primaryStats: ["+55% Sacrifice Bonuses", "+Attack Speed", "+Crit Strike Chance"],
                alternative: "Cruor's Embrace (Unique)",
                alternativeStats: ["+Blood Surge Ranks", "+Attack Speed", "+Crit Strike Chance"],
                tempering: "Blood Overpower Damage %"
            },
            pants: {
                primary: "Kessime's Legacy (Unique)",
                primaryStats: ["+Blood Wave Dual Waves", "+Intelligence", "+Max Life"],
                alternative: "Tibault's Will (Unique)",
                alternativeStats: ["+Damage while Unstoppable", "+Max Resource", "+Damage Reduction"],
                tempering: "None (Unique Item)"
            },
            boots: {
                primary: "Aspect of Metamorphosis",
                primaryStats: ["+Movement Speed", "+All Stats", "+Resistances"],
                alternative: "Aspect of Slaughter",
                alternativeStats: ["+Movement Speed", "+Max Life", "+Resistances"],
                tempering: "Movement Speed, Dodge Chance"
            },
            weapon: {
                primary: "Tidal Aspect (2H Weapon)",
                primaryStats: ["+3 Blood Waves", "+200% Wave Damage", "+Intelligence"],
                alternative: "Bloodless Scream (Unique Scythe)",
                alternativeStats: ["+Shadow Damage to Frozen", "+Essence on Chill", "+Darkness Damage"],
                tempering: "Blood Wave Double Damage Chance, Critical Strike Damage"
            },
            amulet: {
                primary: "Aspect of Grasping Veins",
                primaryStats: ["+38% Crit Chance", "+75% Crit Damage", "+Cooldown Reduction"],
                alternative: "Banished Lord's Talisman (Unique)",
                alternativeStats: ["+Overpower Multiplier", "+Crit Strike Chance", "+Resource Generation"],
                tempering: "Ultimate Cooldown Reduction %, Movement Speed"
            },
            ring1: {
                primary: "Fastblood Aspect",
                primaryStats: ["+Ultimate CD Reduction on Blood Orb", "+Crit Strike Chance", "+Attack Speed"],
                alternative: "Ring of Starless Skies (Mythic)",
                alternativeStats: ["+Resource Cost Reduction", "+Damage Multiplier", "+Attack Speed"],
                tempering: "Ultimate Cooldown Reduction %, Resource Generation"
            },
            ring2: {
                primary: "Aspect of Ultimate Shadow",
                primaryStats: ["+Blood Wave is Darkness", "+Shadow DoT", "+Crit Strike Chance"],
                alternative: "Ring of the Sacrilegious Soul (Unique)",
                alternativeStats: ["+Auto-cast Corpse Skills", "+Lucky Hit Chance", "+Crit Strike Chance"],
                tempering: "Ultimate Cooldown Reduction %, Resource Generation"
            }
        };

        const data = gearData[gearType] || {
            primary: "Highly Optimized Piece",
            primaryStats: ["Best in Slot stats"],
            alternative: "Solid Alternative",
            alternativeStats: ["Budget stats"],
            tempering: "Recommended Tempers"
        };

        modalTitle.textContent = gearType.charAt(0).toUpperCase() + gearType.slice(1) + ' Comparison';

        // Build modal content using DOM methods
        modalContent.textContent = '';

        const grid = document.createElement('div');
        grid.className = 'modal-comparison-grid';

        // Primary card
        const primaryCard = this.createGearCard('Primary Choice', data.primary, data.primaryStats, 'primary', 'fa-star', 'var(--gold)');
        grid.appendChild(primaryCard);

        // Alternative card
        const altCard = this.createGearCard('Alternative', data.alternative, data.alternativeStats, 'alternative', 'fa-exchange-alt', 'var(--orange)');
        grid.appendChild(altCard);

        modalContent.appendChild(grid);

        // Tempering box
        const temperBox = document.createElement('div');
        temperBox.className = 'tempering-box';

        const strong = document.createElement('strong');
        const hammerIcon = document.createElement('i');
        hammerIcon.className = 'fas fa-hammer';
        strong.appendChild(hammerIcon);
        strong.appendChild(document.createTextNode(' Recommended Tempering: '));

        temperBox.appendChild(strong);
        temperBox.appendChild(document.createTextNode(data.tempering));
        modalContent.appendChild(temperBox);

        modal.style.display = 'block';
        this.playSound('click');
        this.highlightElement(slot);
    }

    createGearCard(title, itemName, stats, cardClass, iconClass, iconColor) {
        const card = document.createElement('div');
        card.className = 'comparison-card ' + cardClass;

        const h4 = document.createElement('h4');
        h4.style.color = iconColor;
        h4.style.marginBottom = '10px';

        const icon = document.createElement('i');
        icon.className = 'fas ' + iconClass;
        h4.appendChild(icon);
        h4.appendChild(document.createTextNode(' ' + title));
        card.appendChild(h4);

        const nameDiv = document.createElement('div');
        nameDiv.className = 'item-name';
        nameDiv.textContent = itemName;
        card.appendChild(nameDiv);

        const ul = document.createElement('ul');
        stats.forEach(stat => {
            const li = document.createElement('li');
            li.textContent = stat;
            ul.appendChild(li);
        });
        card.appendChild(ul);

        return card;
    }

    highlightElement(el) {
        if (!el) return;
        el.classList.add('highlight-glow');
        setTimeout(() => el.classList.remove('highlight-glow'), 500);
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        document.body.classList.toggle('light-theme');
        const icon = document.querySelector('#themeSwitcher i');
        if (icon) {
            icon.className = this.theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
        this.saveToLocalStorage();
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const toggle = document.getElementById('soundToggle');
        if (!toggle) return;

        const icon = toggle.querySelector('i');
        if (this.soundEnabled) {
            toggle.classList.remove('muted');
            if (icon) icon.className = 'fas fa-volume-up';
        } else {
            toggle.classList.add('muted');
            if (icon) icon.className = 'fas fa-volume-mute';
        }
        this.saveToLocalStorage();
    }

    playSound(type) {
        if (!this.soundEnabled) return;
        console.log('Playing sound: ' + type);
    }

    handleKeyboardShortcuts(e) {
        if (e.key >= '1' && e.key <= '4') {
            const skillSlots = document.querySelectorAll('.skill-slot');
            const index = parseInt(e.key) - 1;
            if (skillSlots[index]) {
                this.activateSkill(skillSlots[index]);
            }
        }
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.exportBuild();
        }
    }

    updateProgressBar() {
        const el = document.getElementById('progressBar');
        if (!el) return;
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        el.style.width = scrolled + '%';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.bloodWaveGuide = new BloodWaveGuide();
});


console.log('%c🩸 Advanced Shadow Blood Wave Necromancer Guide v1.1.0', 'color: #8b0000; font-size: 16px; font-weight: bold;');
console.log('Built for Season 11 - Divine Intervention');
console.log('Features: D4-accurate damage calculator, build export/import, localStorage persistence');
