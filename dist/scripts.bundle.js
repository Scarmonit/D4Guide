(()=>{var y=class{constructor(){this.ritualRunes=[{name:"Yul",effect:"Cast a Skill with a Cooldown",offering:50},{name:"Cir",effect:"Cast the same Skill 3 times",offering:25},{name:"Ahu",effect:"Lucky Hit: up to 100% chance against Injured",offering:10},{name:"Neo",effect:"Deal damage after not taking damage for 5s",offering:300},{name:"Tam",effect:"Cast a Core Skill",offering:25},{name:"Xol",effect:"Evoke power from another Class",offering:150},{name:"Zan",effect:"Cast an Ultimate Skill",offering:150},{name:"Feo",effect:"Become Injured or Crowd Controlled",offering:1e3},{name:"Noc",effect:"Inflict Crowd Control",offering:5},{name:"Cem",effect:"Cast Evade",offering:50},{name:"Moni",effect:"Cast a Skill after moving",offering:10},{name:"Kaa",effect:"Lose 10% of Maximum Life",offering:2},{name:"Yax",effect:"Drink a Potion",offering:100},{name:"Poc",effect:"Spend 5% of your Resource",offering:2},{name:"Lac",effect:"Call your Mercenary",offering:500},{name:"Ur",effect:"Your Minion or Companion kills an enemy",offering:10},{name:"Qax",effect:"Kill a Non-Minion enemy",offering:10}],this.invocationRunes=[{name:"Wat",effect:"Cast Horrid Decrepify",cost:100},{name:"Met",effect:"Leave an Earthquake",cost:100},{name:"Ohm",effect:"Cast Enhanced War Cry",cost:600},{name:"Tun",effect:"Spawn Stun Grenades",cost:100},{name:"Ton",effect:"Spawn Meteorites",cost:25},{name:"Tal",effect:"Spawn Pestilent Swarm",cost:100},{name:"Ceh",effect:"Summon a Spirit Wolf",cost:100},{name:"Tec",effect:"Cast Earth Spike",cost:25},{name:"Yom",effect:"Cast Petrify",cost:500},{name:"Lac",effect:"Cast Challenging Shout",cost:400},{name:"Vex",effect:"+3 Skills for 5s",cost:400},{name:"Gar",effect:"Gain 2.5% Crit Chance for 5s",cost:25},{name:"Xal",effect:"Gain 20% Max Life for 4s",cost:200},{name:"Que",effect:"Gain Earthen Bulwark",cost:800},{name:"Yul",effect:"Gain a barrier for 10% Max Life",cost:150},{name:"Zec",effect:"Reduce Ultimate Cooldown by 4s",cost:200},{name:"Lum",effect:"Restore 1 Primary Resource",cost:5},{name:"Qua",effect:"Restore an Evade Charge",cost:400},{name:"Xan",effect:"Your next Skill Overpowers",cost:700},{name:"Eom",effect:"Reduce Cooldowns by 0.25s",cost:100},{name:"Lum",effect:"Restore 50 Primary Resource",cost:500},{name:"Ony",effect:"Cast Bolt",cost:25},{name:"Zan",effect:"Skill gains +20% damage",cost:150}],this.init()}init(){this.renderCalculator(),this.setupListeners()}renderCalculator(){let t=document.getElementById("runeword-calculator");t&&(t.innerHTML=`
      <div class="runeword-builder">
        <div class="rune-selection">
          <div class="rune-column">
            <h4><i class="fas fa-circle-notch"></i> Rune of Ritual</h4>
            <select id="ritualRune" class="rune-select">
              <option value="">Select Ritual Rune...</option>
              ${this.ritualRunes.map(e=>`<option value="${e.name}">${e.name} - ${e.effect}</option>`).join("")}
            </select>
            <div id="ritualInfo" class="rune-info"></div>
          </div>
          <div class="rune-column">
            <h4><i class="fas fa-bolt"></i> Rune of Invocation</h4>
            <select id="invocationRune" class="rune-select">
              <option value="">Select Invocation Rune...</option>
              ${this.invocationRunes.map(e=>`<option value="${e.name}">${e.name} - ${e.effect}</option>`).join("")}
            </select>
            <div id="invocationInfo" class="rune-info"></div>
          </div>
        </div>
        <div class="runeword-result" id="runewordResult">
          <div class="placeholder-text">Select both runes to see the synergy</div>
        </div>
      </div>
    `)}setupListeners(){let t=document.getElementById("ritualRune"),e=document.getElementById("invocationRune");t&&e&&(t.addEventListener("change",()=>this.updateDisplay()),e.addEventListener("change",()=>this.updateDisplay()))}updateDisplay(){let t=document.getElementById("ritualRune").value,e=document.getElementById("invocationRune").value,a=document.getElementById("runewordResult"),o=document.getElementById("ritualInfo"),n=document.getElementById("invocationInfo"),l=this.ritualRunes.find(i=>i.name===t),s=this.invocationRunes.find(i=>i.name===e);if(l?o.innerHTML=`
        <div class="rune-detail">
          <span class="label">Condition:</span> ${l.effect}
          <br><span class="label">Generates:</span> <span class="value">${l.offering} Offering</span>
        </div>
      `:o.innerHTML="",s?n.innerHTML=`
        <div class="rune-detail">
          <span class="label">Effect:</span> ${s.effect}
          <br><span class="label">Cost:</span> <span class="value">${s.cost} Offering</span>
        </div>
      `:n.innerHTML="",l&&s){let i=Math.floor(l.offering/s.cost),c="";i>=1?(c=`<span class="synergy-good">Excellent Synergy!</span> Triggers ${i} time(s) per action.`,l.offering%s.cost!==0&&(c+=` (Overflow: ${l.offering%s.cost} Offering)`)):c=`<span class="synergy-ok">Moderate Synergy.</span> Requires ${Math.ceil(s.cost/l.offering)} actions to trigger once.`,a.innerHTML=`
        <h3><span class="rune-name">${l.name}</span> + <span class="rune-name">${s.name}</span></h3>
        <div class="synergy-result">
          <p>${c}</p>
          <p class="effect-summary">
            <strong>How it works:</strong> Whenever you <em>${l.effect}</em>, you generate Offering. 
            Once you have ${s.cost} Offering, you automatically <em>${s.effect}</em>.
          </p>
        </div>
      `,a.className="runeword-result active"}else a.innerHTML='<div class="placeholder-text">Select both runes to see the synergy</div>',a.className="runeword-result"}};var b=class{constructor(){this.mercenaries={raheir:{name:"Raheir",role:"Shieldbearer",description:"Provides massive defensive buffs and taunts enemies.",skills:[{name:"Ground Slam",desc:"Slams the ground, Slowing enemies and dealing damage."},{name:"Raheir's Aegis",desc:"Provides a barrier that absorbs damage for you and allies."},{name:"Bastion",desc:"Passive: You gain 15% Damage Reduction while Raheir is active."},{name:"Inspiration",desc:"Passive: Raheir's attacks reduce your cooldowns."}]},aldkin:{name:"Aldkin",role:"Cursed Child",description:"Demon form that deals massive Shadow damage over time.",skills:[{name:"Flame Surge",desc:"Unleashes a wave of fire that Burns enemies."},{name:"Haunt",desc:"Curses enemies, making them Vulnerable."},{name:"Darkness",desc:"Passive: Enemies damaged by Aldkin take 10% more Shadow damage."},{name:"Fate",desc:"Passive: Aldkin has a chance to execute Injured non-Elites."}]},varyana:{name:"Varyana",role:"Berserker Crone",description:"Melee powerhouse that increases your attack speed.",skills:[{name:"Whirlwind",desc:"Spins rapidly, dealing Physical damage to surrounding enemies."},{name:"Bloodthirst",desc:"Enrages, increasing Attack Speed for both of you."},{name:"Cleave",desc:"Passive: Varyana's attacks cause enemies to Bleed."},{name:"Haste",desc:"Passive: You gain Movement Speed after killing an Elite."}]},subo:{name:"Subo",role:"Bounty Hunter",description:"Ranged support that marks targets and sets traps.",skills:[{name:"Explosive Trap",desc:"Sets a trap that explodes when enemies walk over it."},{name:"Mark Target",desc:"Marks an enemy. You deal increased Critical Strike Damage to them."},{name:"Snipe",desc:"Passive: Subo deals bonus damage to distant enemies."},{name:"Scavenger",desc:"Passive: Enemies killed by Subo drop additional Gold/Materials."}]}},this.init()}init(){this.renderMercenaryUI(),this.setupListeners()}renderMercenaryUI(){let t=document.getElementById("mercenary-ui");t&&(t.innerHTML=`
      <div class="mercenary-tabs">
        ${Object.keys(this.mercenaries).map(e=>`
          <button class="merc-tab ${e==="raheir"?"active":""}" data-merc="${e}">
            ${this.mercenaries[e].name}
          </button>
        `).join("")}
      </div>
      <div class="mercenary-content" id="mercenary-content">
        <!-- Content loaded dynamically -->
      </div>
    `,this.loadMercenary("raheir"))}setupListeners(){let t=document.querySelectorAll(".merc-tab");t.forEach(e=>{e.addEventListener("click",()=>{t.forEach(a=>a.classList.remove("active")),e.classList.add("active"),this.loadMercenary(e.dataset.merc)})})}loadMercenary(t){let e=this.mercenaries[t],a=document.getElementById("mercenary-content");a.innerHTML=`
      <div class="merc-header">
        <h3><i class="fas fa-user-circle"></i> ${e.name}</h3>
        <span class="merc-role">${e.role}</span>
      </div>
      <p class="merc-desc">${e.description}</p>
      <div class="merc-skills">
        ${e.skills.map(o=>`
          <div class="merc-skill-card">
            <h4>${o.name}</h4>
            <p>${o.desc}</p>
          </div>
        `).join("")}
      </div>
    `,a.classList.remove("fade-in"),a.offsetWidth,a.classList.add("fade-in")}};var E=class{constructor(){this.costs={obducite:0,ingolith:0,neathiron:0},this.rankCosts=[{rank:1,type:"obducite",cost:10},{rank:2,type:"obducite",cost:20},{rank:3,type:"obducite",cost:30},{rank:4,type:"obducite",cost:40},{rank:5,type:"ingolith",cost:20},{rank:6,type:"ingolith",cost:40},{rank:7,type:"ingolith",cost:60},{rank:8,type:"ingolith",cost:80},{rank:9,type:"neathiron",cost:20},{rank:10,type:"neathiron",cost:40},{rank:11,type:"neathiron",cost:60},{rank:12,type:"neathiron",cost:80}],this.init()}init(){this.renderCalculator(),this.setupListeners()}renderCalculator(){let t=document.getElementById("pit-calculator");t&&(t.innerHTML=`
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
    `,this.updateCalculation())}setupListeners(){let t=document.getElementById("pit-calculator");if(!t)return;let e=0,a=12;t.addEventListener("click",n=>{let l=n.target.closest(".rank-btn");if(!l)return;let s=l.dataset.action;s==="dec-current"&&e>0&&e--,s==="inc-current"&&e<a&&e++,s==="dec-target"&&a>e&&a--,s==="inc-target"&&a<12&&a++,e>a&&(e=a),document.getElementById("currentRankDisplay").textContent=e,document.getElementById("targetRankDisplay").textContent=a,this.updateCalculation(e,a)});let o=document.getElementById("pitTierInput");o&&o.addEventListener("input",()=>{this.updateCalculation(e,a)})}updateCalculation(t=0,e=12){let a=parseInt(document.getElementById("pitTierInput").value)||1,o=document.getElementById("tierInfo"),n=document.getElementById("pitResults"),l=0,s=0,i=0;for(let h=t+1;h<=e;h++){let v=this.rankCosts.find(f=>f.rank===h);v.type==="obducite"&&(l+=v.cost),v.type==="ingolith"&&(s+=v.cost),v.type==="neathiron"&&(i+=v.cost)}let c="obducite",d=0;a>=61?(c="neathiron",d=20+(a-61)*1.5,o.textContent=`Drops Neathiron (~${Math.floor(d)})`,o.className="tier-info neathiron"):a>=31?(c="ingolith",d=20+(a-31)*1.5,o.textContent=`Drops Ingolith (~${Math.floor(d)})`,o.className="tier-info ingolith"):(c="obducite",d=10+(a-1)*1.5,o.textContent=`Drops Obducite (~${Math.floor(d)})`,o.className="tier-info obducite");let r=0,p=i+s/3+l/9,m=s+l/3;if(c==="neathiron")r=Math.ceil(p/d);else if(c==="ingolith"){if(i>0){n.innerHTML=`<div class="warning-box"><i class="fas fa-exclamation-triangle"></i> Tier ${a} is too low to farm Neathiron (Tier 61+ required).</div>`;return}r=Math.ceil(m/d)}else{if(i>0||s>0){n.innerHTML=`<div class="warning-box"><i class="fas fa-exclamation-triangle"></i> Tier ${a} is too low. Farm higher tiers!</div>`;return}r=Math.ceil(l/d)}let g="";if(i>0&&(g+=`<div class="mat-item neathiron"><span>${i}</span> Neathiron</div>`),s>0&&(g+=`<div class="mat-item ingolith"><span>${s}</span> Ingolith</div>`),l>0&&(g+=`<div class="mat-item obducite"><span>${l}</span> Obducite</div>`),g===""){n.innerHTML='<div class="success-box"><i class="fas fa-check-circle"></i> Max Rank Reached!</div>';return}n.innerHTML=`
      <div class="mats-needed">
        <h4>Materials Needed:</h4>
        <div class="mats-grid">${g}</div>
      </div>
      <div class="runs-result">
        <div class="runs-count">${r}</div>
        <div class="runs-label">Estimated Runs at Tier ${a}</div>
        <div class="runs-sub">Assumes converting higher mats to lower</div>
      </div>
    `}};var S=class{constructor(){this.aspectData={Tidal:{slot:"Sword/Focus",type:"Offensive",reason:"Offensive Aspects roll best on Weapons (cheaper than 2H)"},"Ultimate Shadow":{slot:"Sword/Focus",type:"Offensive",reason:"Target 1H Weapons for Offensive Aspects"},"Hardened Bones":{slot:"Pants",type:"Defensive",reason:"Pants only roll Defensive, removing dilution"},"Shielding Storm":{slot:"Pants",type:"Defensive",reason:"Pants are the most efficient Defensive slot"},"Grasping Veins":{slot:"Sword/Focus",type:"Offensive",reason:"Offensive pool"},Sacrificial:{slot:"Sword/Focus",type:"Offensive",reason:"Offensive pool"},Fastblood:{slot:"Ring",type:"Resource",reason:"Resource aspects only roll on Rings"},Metamorphosis:{slot:"Boots",type:"Mobility",reason:"Mobility aspects roll best on Boots"},Slaughter:{slot:"Boots",type:"Mobility",reason:"Boots for Speed/Mobility"},Embalmer:{slot:"Pants",type:"Defensive",reason:"Defensive pool"},Disobedience:{slot:"Pants",type:"Defensive",reason:"Defensive pool"}},this.init()}init(){this.renderAdvisor(),this.setupListeners()}renderAdvisor(){let t=document.getElementById("gambling-advisor");if(!t)return;let e=Object.keys(this.aspectData).sort().map(a=>`<option value="${a}">${a} Aspect</option>`).join("");t.innerHTML=`
      <div class="calculator-box gambling-box">
        <h3><i class="fas fa-coins"></i> Obol Gambling Advisor</h3>
        <p class="calc-desc">Don't waste Obols. Find the most efficient slot to gamble for your aspect.</p>
        
        <div class="advisor-input">
          <select id="aspectSelect" class="advisor-select">
            <option value="">Select an Aspect you need...</option>
            ${e}
          </select>
        </div>

        <div id="gamblingResult" class="gambling-result">
          <div class="placeholder-text">Select an aspect to see the best gambling strategy</div>
        </div>
      </div>
    `}setupListeners(){let t=document.getElementById("aspectSelect");t&&t.addEventListener("change",e=>{this.showRecommendation(e.target.value)})}showRecommendation(t){let e=document.getElementById("gamblingResult");if(!t){e.innerHTML='<div class="placeholder-text">Select an aspect to see the best gambling strategy</div>',e.className="gambling-result";return}let a=this.aspectData[t];e.innerHTML=`
      <div class="gamble-card">
        <div class="gamble-header">
          <span class="aspect-type ${a.type.toLowerCase()}">${a.type}</span>
          <h4>${t} Aspect</h4>
        </div>
        <div class="gamble-body">
          <div class="recommendation">
            <span class="label">Gamble on:</span>
            <span class="slot-value"><i class="fas fa-dice"></i> ${a.slot}</span>
          </div>
          <p class="gamble-reason"><i class="fas fa-info-circle"></i> ${a.reason}</p>
        </div>
      </div>
    `,e.className="gambling-result active"}};var k=class{constructor(){this.maxLevel=100,this.init()}init(){this.renderCalculator(),this.setupListeners()}renderCalculator(){let t=document.getElementById("glyph-calculator");t&&(t.innerHTML=`
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
    `,this.calculateProbability())}setupListeners(){["glyphLevel","pitTierGlyph"].forEach(e=>{let a=document.getElementById(e);a&&a.addEventListener("input",()=>this.calculateProbability())})}calculateProbability(){let t=parseInt(document.getElementById("glyphLevel").value)||1,e=parseInt(document.getElementById("pitTierGlyph").value)||1,a=document.getElementById("glyphResult"),o=e-t,n=0,l=3,s="";o>=10?n=100:o>=0?(n=70-(9-o)*5,n<15&&(n=15),o===0&&(n=70)):(n=5,s='<br><span class="warning-text">Tier too low!</span>'),n>100&&(n=100),n<0&&(n=0);let i="prob-low";n>=100?i="prob-guaranteed":n>=60?i="prob-high":n>=30&&(i="prob-med"),a.innerHTML=`
      <div class="probability-display">
        <div class="prob-circle ${i}">
          <span class="prob-value">${n}%</span>
          <span class="prob-label">Success Chance</span>
        </div>
        <div class="prob-details">
          <p><strong>Attempts:</strong> ${l}</p>
          <p><strong>Safe Leveling Tier:</strong> ${t+10} ${s}</p>
        </div>
      </div>
    `}};var C=class{constructor(){this.baseCooldown=50,this.init()}init(){this.renderPlanner(),this.setupListeners()}renderPlanner(){let t=document.getElementById("cooldown-planner");t&&(t.innerHTML=`
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
    `,this.calculateCooldown())}setupListeners(){["gearCdr","fastbloodRank","bloodOrbs","decrepifyProcs"].forEach(e=>{let a=document.getElementById(e);a&&(a.addEventListener("input",()=>this.calculateCooldown()),a.addEventListener("change",()=>this.calculateCooldown()))})}calculateCooldown(){let t=parseFloat(document.getElementById("gearCdr").value)||0,e=parseFloat(document.getElementById("fastbloodRank").value)||0,a=parseInt(document.getElementById("bloodOrbs").value)||0,o=parseInt(document.getElementById("decrepifyProcs").value)||0,n=this.baseCooldown*(1-t/100),l=n,s=e*a;n-=s;let i=o*1;n-=i,n<0&&(n=0);let c=document.getElementById("cdrResult"),d="cd-bad",r="Slow Rotation";n<=0?(d="cd-instant",r="Instant Reset!"):n<=10?(d="cd-great",r="Smooth Rotation"):n<=20&&(d="cd-ok",r="Waiting on CD"),c.innerHTML=`
      <div class="cd-display ${d}">
        <span class="cd-value">${n.toFixed(1)}s</span>
        <span class="cd-label">Final Cooldown</span>
      </div>
      <div class="cd-breakdown">
        <div>Gear CD: ${l.toFixed(1)}s</div>
        <div>Orbs: -${s.toFixed(1)}s</div>
        <div>Decrepify: -${i.toFixed(1)}s</div>
      </div>
      <div class="cd-status">${r}</div>
    `}};var I=class{constructor(){this.soundEnabled=localStorage.getItem("soundEnabled")!=="false",this.theme=localStorage.getItem("theme")||"dark",this.dyslexicFont=localStorage.getItem("dyslexicFont")==="true",this.totalPoints=71,this.usedPoints=0,this.init()}init(){this.calculateInitialPoints(),this.applyPersistedSettings(),this.createParticles(),this.setupEventListeners(),this.setupSkillCalculator(),this.setupDamageCalculator(),this.setupRotationDemo(),this.setupGearComparison(),this.setupScrollAnimations(),this.setupShareFeature(),this.setupImageFallback(),this.setupBuildPersistence(),this.updatePointsDisplay(),new y,new b,new E,new S,new k,new C}calculateInitialPoints(){let t=0;document.querySelectorAll(".points").forEach(e=>{t+=parseInt(e.dataset.current)||0}),this.usedPoints=t}applyPersistedSettings(){this.theme==="light"&&document.body.classList.add("light-theme"),this.dyslexicFont&&document.body.classList.add("dyslexic-font"),this.soundEnabled||document.getElementById("soundToggle")?.classList.add("muted")}createParticles(){let t=document.getElementById("particles");for(let e=0;e<20;e++){let a=document.createElement("div");a.className="particle",a.style.left=Math.random()*100+"%",a.style.animationDelay=Math.random()*15+"s",a.style.animationDuration=15+Math.random()*10+"s",t.appendChild(a)}}setupEventListeners(){let t=document.getElementById("navToggle"),e=document.getElementById("navMenu");t.addEventListener("click",()=>{e.classList.toggle("active"),this.playSound("menu")}),document.getElementById("themeSwitcher").addEventListener("click",()=>{this.toggleTheme()}),document.getElementById("fontToggle").addEventListener("click",()=>{this.toggleDyslexicFont()}),document.getElementById("soundToggle").addEventListener("click",()=>{this.toggleSound()});let a=document.getElementById("backToTop");window.addEventListener("scroll",()=>{window.scrollY>300?a.classList.add("visible"):a.classList.remove("visible"),this.updateProgressBar()}),a.addEventListener("click",()=>{window.scrollTo({top:0,behavior:"smooth"}),this.playSound("click")}),document.addEventListener("click",n=>{!e.contains(n.target)&&!t.contains(n.target)&&e.classList.remove("active")}),document.querySelectorAll(".skill-slot").forEach(n=>{n.addEventListener("click",()=>{this.activateSkill(n),this.playSound("skill")})}),document.addEventListener("keydown",n=>{n.key==="Escape"&&e.classList.remove("active"),this.handleKeyboardShortcuts(n)}),[t,document.getElementById("themeSwitcher"),document.getElementById("soundToggle"),document.getElementById("shareBuild"),document.getElementById("searchToggle")].forEach(n=>{n&&n.addEventListener("keydown",l=>{(l.key==="Enter"||l.key===" ")&&(l.preventDefault(),n.click())})});let o=0;e.addEventListener("touchstart",n=>{o=n.changedTouches[0].screenX},{passive:!0}),e.addEventListener("touchend",n=>{let l=n.changedTouches[0].screenX;o-l>50&&e.classList.remove("active")},{passive:!0})}setupSkillCalculator(){document.querySelectorAll(".points").forEach(t=>{t.addEventListener("click",e=>{let a=parseInt(e.target.dataset.current),o=parseInt(e.target.dataset.max);a<o&&this.usedPoints<this.totalPoints&&(e.target.dataset.current=a+1,e.target.textContent=a+1+"/"+o,this.usedPoints++,this.updatePointsDisplay(),this.playSound("click"),this.highlightElement(e.target.parentElement))}),t.addEventListener("contextmenu",e=>{e.preventDefault();let a=parseInt(e.target.dataset.current),o=parseInt(e.target.dataset.max);a>0&&(e.target.dataset.current=a-1,e.target.textContent=a-1+"/"+o,this.usedPoints--,this.updatePointsDisplay(),this.playSound("click"),this.highlightElement(e.target.parentElement))})}),document.getElementById("resetSkills").addEventListener("click",()=>{this.resetSkills()})}setupDamageCalculator(){["weaponDamage","intelligence","bloodWaveRanks","tidalWaves","additiveDamage","multiplicativeDamage","shadowDamage","critChance","critDamage","vulnerableDamage","overpowerDamage","overpowerChance","doubleDamageChance"].forEach(e=>{let a=document.getElementById(e);a&&a.addEventListener("input",()=>{this.calculateDamage()})}),this.calculateDamage()}setupRotationDemo(){document.querySelectorAll(".rotation-step").forEach(t=>{t.addEventListener("click",()=>{document.querySelectorAll(".rotation-step").forEach(e=>e.classList.remove("active")),t.classList.add("active"),this.playSound("click")})})}setupGearComparison(){document.querySelectorAll(".gear-slot").forEach(t=>{t.addEventListener("click",()=>{this.showGearComparison(t)})}),document.getElementById("closeModal").addEventListener("click",()=>{document.getElementById("gearModal").style.display="none"})}setupScrollAnimations(){let t=new IntersectionObserver(e=>{e.forEach(a=>{a.isIntersecting&&a.target.classList.add("visible")})},{threshold:.1});document.querySelectorAll(".section").forEach(e=>{t.observe(e)})}setupShareFeature(){let t=document.getElementById("shareBuild");t&&t.addEventListener("click",()=>{let e=document.getElementById("intelligence").value,a=document.getElementById("damageResult").textContent,o=`${this.usedPoints}/${this.totalPoints}`,n=`D4 Shadow Blood Wave Necro Build
-----------------------------------
Intelligence: ${e}
Est. Damage: ${a}
Skill Points: ${o}
-----------------------------------
Generated by Advanced Necro Guide`;navigator.clipboard.writeText(n).then(()=>{this.highlightElement(t);let l=t.title;t.title="Copied!",setTimeout(()=>t.title=l,2e3);let s=t.querySelector("i");s.className="fas fa-check",setTimeout(()=>s.className="fas fa-share-alt",2e3)}),this.playSound("click")})}setupImageFallback(){document.querySelectorAll("img").forEach(t=>{t.addEventListener("error",()=>{t.src="https://via.placeholder.com/64/8b0000/ffffff?text=D4",t.classList.add("image-fallback")})})}setupBuildPersistence(){let t=document.getElementById("exportBuild"),e=document.getElementById("importBuild");t&&t.addEventListener("click",()=>{try{let a={version:"1.1",stats:{weaponDamage:document.getElementById("weaponDamage").value,intelligence:document.getElementById("intelligence").value,bloodWaveRanks:document.getElementById("bloodWaveRanks").value,tidalWaves:document.getElementById("tidalWaves").value,additiveDamage:document.getElementById("additiveDamage").value,multiplicativeDamage:document.getElementById("multiplicativeDamage").value,shadowDamage:document.getElementById("shadowDamage").value,critChance:document.getElementById("critChance").value,critDamage:document.getElementById("critDamage").value,vulnerableDamage:document.getElementById("vulnerableDamage").value,overpowerDamage:document.getElementById("overpowerDamage").value,overpowerChance:document.getElementById("overpowerChance").value,doubleDamageChance:document.getElementById("doubleDamageChance").value},skills:Array.from(document.querySelectorAll(".points")).map(n=>({current:n.dataset.current}))},o=btoa(JSON.stringify(a));navigator.clipboard.writeText(o).then(()=>{this.highlightElement(t),this.showToast("Build copied to clipboard!","success")}).catch(()=>{prompt("Copy build data:",o)})}catch{this.showToast("Export failed","error")}}),e&&e.addEventListener("click",()=>{let a=prompt("Paste build data string:");if(a)try{let o=JSON.parse(atob(a));if(!o.stats||!o.skills)throw new Error("Invalid format");for(let[l,s]of Object.entries(o.stats)){let i=document.getElementById(l);i&&(i.value=s)}let n=document.querySelectorAll(".points");o.skills.forEach((l,s)=>{if(n[s]){let i=n[s].dataset.max;n[s].dataset.current=l.current,n[s].textContent=n[s].textContent.includes("KEY")?"KEY":`${l.current}/${i}`}}),this.calculateInitialPoints(),this.updatePointsDisplay(),this.calculateDamage(),this.highlightElement(e),this.showToast("Build imported!","success")}catch{this.showToast("Import failed","error")}})}showToast(t,e="info"){let a=document.createElement("div");a.className=`toast toast-${e}`,Object.assign(a.style,{position:"fixed",bottom:"20px",left:"50%",transform:"translateX(-50%)",padding:"12px 24px",borderRadius:"8px",color:"white",zIndex:"3000",boxShadow:"0 4px 12px rgba(0,0,0,0.5)",backgroundColor:e==="success"?"#2ecc71":e==="error"?"#e74c3c":"#3498db"}),a.textContent=t,document.body.appendChild(a),setTimeout(()=>a.remove(),3e3)}calculateDamage(){let t=parseInt(document.getElementById("weaponDamage").value)||0,e=parseInt(document.getElementById("intelligence").value)||0,a=parseInt(document.getElementById("critChance").value)||0,o=parseInt(document.getElementById("critDamage").value)||0,n=parseInt(document.getElementById("overpowerDamage").value)||0,l=parseInt(document.getElementById("overpowerChance").value)||0,s=parseInt(document.getElementById("shadowDamage").value)||0,i=parseInt(document.getElementById("vulnerableDamage").value)||0,c=parseInt(document.getElementById("additiveDamage").value)||0,d=parseInt(document.getElementById("multiplicativeDamage").value)||0,r=parseInt(document.getElementById("doubleDamageChance").value)||0,p=parseInt(document.getElementById("bloodWaveRanks").value)||1,m=parseInt(document.getElementById("tidalWaves").value)||1,g=t*(1+e/1e3),h=1+c/100,v=1+d/100,f=1+a/100*(o/100),w=1+l/100*(n/100),B=1.2*(1+i/100),D=1+s/100,L=1+(p-1)*.15,x=1+r/100,R=m,$=Math.round(g*h*v*f*w*B*D*L*x*R),T=document.getElementById("damageResult");T&&(T.textContent=$.toLocaleString());let P=`
      Base: ${Math.round(g).toLocaleString()}<br>
      Additive: x${h.toFixed(2)}<br>
      Multiplicative: x${v.toFixed(2)}<br>
      Crit (Avg): x${f.toFixed(2)}<br>
      Overpower (Avg): x${w.toFixed(2)}<br>
      Vulnerable: x${B.toFixed(2)}<br>
      Shadow: x${D.toFixed(2)}<br>
      Skill Ranks: x${L.toFixed(2)}<br>
      Double: x${x.toFixed(2)}<br>
      Waves: x${R}
    `,M=document.getElementById("damageBreakdown");M&&(M.innerHTML=P)}activateSkill(t){document.querySelectorAll(".skill-slot").forEach(a=>a.classList.remove("active")),t.classList.add("active");let e=t.dataset.skill;console.log(`Activated skill: ${e}`)}updatePointsDisplay(){document.getElementById("pointsUsed").textContent=this.usedPoints}resetSkills(){document.querySelectorAll(".points").forEach(t=>{let e=parseInt(t.dataset.max);t.dataset.current="0",t.textContent="0/"+e}),this.usedPoints=0,this.updatePointsDisplay(),this.playSound("reset")}showGearComparison(t){let e=t.dataset.gear,a=document.getElementById("gearModal"),o=document.getElementById("modalTitle"),n=document.getElementById("modalContent"),s={helmet:{primary:"Heir of Perdition (Mythic)",primaryStats:["+Crit Strike Chance","+Lucky Hit Chance","+Damage to Afflicted Enemies"],alternative:"Aspect of the Cursed Aura",alternativeStats:["+Max Life","+Cooldown Reduction","+Intelligence"],tempering:"Total Armor, Shadow Resistance"},chest:{primary:"Shroud of False Death (Mythic)",primaryStats:["+1 All Passives","+All Stats","+Max Life"],alternative:"Aspect of Hardened Bones",alternativeStats:["+Damage Reduction","+Max Life","+Armor"],tempering:"Corpse Tendrils Size, Maximum Life"},gloves:{primary:"Sacrificial Aspect",primaryStats:["+55% Sacrifice Bonuses","+Attack Speed","+Crit Strike Chance"],alternative:"Cruor's Embrace (Unique)",alternativeStats:["+Blood Surge Ranks","+Attack Speed","+Crit Strike Chance"],tempering:"Blood Overpower Damage %"},pants:{primary:"Kessime's Legacy (Unique)",primaryStats:["+Blood Wave Dual Waves","+Intelligence","+Max Life"],alternative:"Tibault's Will (Unique)",alternativeStats:["+Damage while Unstoppable","+Max Resource","+Damage Reduction"],tempering:"None (Unique Item)"},boots:{primary:"Aspect of Metamorphosis",primaryStats:["+Movement Speed","+All Stats","+Resistances"],alternative:"Aspect of Slaughter",alternativeStats:["+Movement Speed","+Max Life","+Resistances"],tempering:"Movement Speed, Dodge Chance"},weapon:{primary:"Tidal Aspect (2H Weapon)",primaryStats:["+3 Blood Waves","+200% Wave Damage","+Intelligence"],alternative:"Bloodless Scream (Unique Scythe)",alternativeStats:["+Shadow Damage to Frozen","+Essence on Chill","+Darkness Damage"],tempering:"Blood Wave Double Damage Chance, Critical Strike Damage"},amulet:{primary:"Aspect of Grasping Veins",primaryStats:["+38% Crit Chance","+75% Crit Damage","+Cooldown Reduction"],alternative:"Banished Lord's Talisman (Unique)",alternativeStats:["+Overpower Multiplier","+Crit Strike Chance","+Resource Generation"],tempering:"Ultimate Cooldown Reduction %, Movement Speed"},ring1:{primary:"Fastblood Aspect",primaryStats:["+Ultimate CD Reduction on Blood Orb","+Crit Strike Chance","+Attack Speed"],alternative:"Ring of Starless Skies (Mythic)",alternativeStats:["+Resource Cost Reduction","+Damage Multiplier","+Attack Speed"],tempering:"Ultimate Cooldown Reduction %, Resource Generation"},ring2:{primary:"Aspect of Ultimate Shadow",primaryStats:["+Blood Wave is Darkness","+Shadow DoT","+Crit Strike Chance"],alternative:"Ring of the Sacrilegious Soul (Unique)",alternativeStats:["+Auto-cast Corpse Skills","+Lucky Hit Chance","+Crit Strike Chance"],tempering:"Ultimate Cooldown Reduction %, Resource Generation"}}[e]||{primary:"Highly Optimized Piece",primaryStats:["Best in Slot stats"],alternative:"Solid Alternative",alternativeStats:["Budget stats"],tempering:"Recommended Tempers"};o.textContent=`${e.charAt(0).toUpperCase()+e.slice(1)} Comparison`;let i='<div class="modal-comparison-grid">';i+='<div class="comparison-card primary">',i+='<h4 style="color: var(--gold); margin-bottom: 10px;"><i class="fas fa-star"></i> Primary Choice</h4>',i+=`<div class="item-name">${s.primary}</div>`,i+=`<ul>${s.primaryStats.map(c=>`<li>${c}</li>`).join("")}</ul>`,i+="</div>",i+='<div class="comparison-card alternative">',i+='<h4 style="color: var(--orange); margin-bottom: 10px;"><i class="fas fa-exchange-alt"></i> Alternative</h4>',i+=`<div class="item-name">${s.alternative}</div>`,i+=`<ul>${s.alternativeStats.map(c=>`<li>${c}</li>`).join("")}</ul>`,i+="</div>",i+="</div>",i+='<div class="tempering-box">',i+=`<strong><i class="fas fa-hammer"></i> Recommended Tempering:</strong> ${s.tempering}`,i+="</div>",n.innerHTML=i,a.style.display="block",this.playSound("click"),this.highlightElement(t)}highlightElement(t){t.classList.add("highlight-glow"),setTimeout(()=>t.classList.remove("highlight-glow"),500)}toggleTheme(){this.theme=this.theme==="dark"?"light":"dark",document.body.classList.toggle("light-theme");let t=document.querySelector("#themeSwitcher i");t.className=this.theme==="dark"?"fas fa-moon":"fas fa-sun",localStorage.setItem("theme",this.theme)}toggleDyslexicFont(){this.dyslexicFont=!this.dyslexicFont,document.body.classList.toggle("dyslexic-font"),localStorage.setItem("dyslexicFont",this.dyslexicFont),this.playSound("click")}toggleSound(){this.soundEnabled=!this.soundEnabled;let t=document.getElementById("soundToggle"),e=t.querySelector("i");this.soundEnabled?(t.classList.remove("muted"),e.className="fas fa-volume-up"):(t.classList.add("muted"),e.className="fas fa-volume-mute"),localStorage.setItem("soundEnabled",this.soundEnabled)}playSound(t){this.soundEnabled&&console.log(`Playing sound: ${t}`)}handleKeyboardShortcuts(t){if(t.key>="1"&&t.key<="4"){let e=document.querySelectorAll(".skill-slot"),a=parseInt(t.key)-1;e[a]&&this.activateSkill(e[a])}}updateProgressBar(){let t=window.scrollY/(document.documentElement.scrollHeight-window.innerHeight)*100;document.getElementById("progressBar").style.width=t+"%"}};document.addEventListener("DOMContentLoaded",()=>{new I});document.querySelectorAll(".variant-tab").forEach(u=>{u.addEventListener("click",()=>{let t=u.dataset.variant;document.querySelectorAll(".variant-tab").forEach(e=>e.classList.remove("active")),u.classList.add("active"),document.querySelectorAll(".variant-content").forEach(e=>{e.classList.remove("active"),e.dataset.variant===t&&e.classList.add("active")})})});console.log(`
        [Blood Wave] Advanced Shadow Blood Wave Necromancer Guide Loaded!

        Built for Season 11 - Divine Intervention
        Features: Interactive calculators, skill tracking, damage simulation

        Controls:
        - Click skills to activate
        - Use number keys 1-4 for quick skill selection
        - ESC to close menus
        - Click gear for comparisons

        May Rathma's power flow through you!
        `);(function(){let u=document.getElementById("searchToggle"),t=document.getElementById("searchOverlay"),e=document.getElementById("searchInput"),a=document.getElementById("searchResults"),o=[{title:"Sanctification",section:"sanctification",content:"Season 11 Sanctification system divine blessings"},{title:"Build Variants",section:"variants",content:"Pit pushing farming speed variants"},{title:"Skills & Keybinds",section:"skills",content:"Blood Wave Corpse Explosion Decrepify Blood Mist skills rotation"},{title:"Skill Tree",section:"skilltree",content:"Passive skills talent points allocation"},{title:"Book of the Dead",section:"bookofthedead",content:"Skeletal warriors mages golem minions"},{title:"Paragon Boards",section:"paragon",content:"Glyphs rare nodes legendary boards"},{title:"Gear & Aspects",section:"gear",content:"Helm chest gloves pants boots weapons aspects uniques"},{title:"Stats Priority",section:"stats",content:"Critical strike damage cooldown reduction stats affixes"},{title:"Gameplay Rotation",section:"rotation",content:"Combat rotation opener single target AoE"},{title:"Gems & Runewords",section:"gems",content:"Ruby sapphire emerald diamond skull runewords"},{title:"Mercenary Setup",section:"mercenary",content:"Mercenary hireling companion support"},{title:"Divine Gifts",section:"divinegifts",content:"Divine gifts blessings season mechanic"},{title:"Damage Calculator",section:"calculator",content:"Calculate damage DPS simulator"}],n=new Fuse(o,{keys:["title","content"],threshold:.4,includeMatches:!0});function l(){t.classList.add("active"),e.focus(),e.value="",i()}function s(){t.classList.remove("active")}function i(){for(;a.firstChild;)a.removeChild(a.firstChild)}function c(r){let p=document.createElement("div");p.className="search-result-item",p.dataset.section=r.section;let m=document.createElement("div");m.className="title";let g=document.createElement("i");g.className="fas fa-arrow-right",m.appendChild(g),m.appendChild(document.createTextNode(" "+r.title));let h=document.createElement("div");return h.className="context",h.textContent=r.content,p.appendChild(m),p.appendChild(h),p.addEventListener("click",()=>{s(),document.getElementById(r.section)?.scrollIntoView({behavior:"smooth"})}),p}function d(r){if(i(),!r.trim())return;let p=n.search(r);if(p.length===0){let m=document.createElement("div");m.className="search-no-results",m.textContent="No results found",a.appendChild(m);return}p.slice(0,8).forEach(m=>{a.appendChild(c(m.item))})}u.addEventListener("click",l),t.addEventListener("click",r=>{r.target===t&&s()}),e.addEventListener("input",r=>d(r.target.value)),document.addEventListener("keydown",r=>{(r.ctrlKey||r.metaKey)&&r.key==="k"&&(r.preventDefault(),l()),r.key==="Escape"&&s()})})();"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("/service-worker.js").then(u=>console.log("SW registered:",u.scope)).catch(u=>console.log("SW registration failed:",u))});})();
//# sourceMappingURL=scripts.bundle.js.map
