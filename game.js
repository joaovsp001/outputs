(() => {
  "use strict";

  const TAU = Math.PI * 2;
  const SAVE_KEY = "praga-survivor-save-v1";
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;

  const el = {
    hud: document.getElementById("hud"),
    hpFill: document.getElementById("hpFill"),
    hpText: document.getElementById("hpText"),
    xpFill: document.getElementById("xpFill"),
    levelText: document.getElementById("levelText"),
    timeText: document.getElementById("timeText"),
    killText: document.getElementById("killText"),
    goldText: document.getElementById("goldText"),
    loadout: document.getElementById("loadout"),
    toast: document.getElementById("toast"),
    joystick: document.getElementById("joystick"),
    joyKnob: document.getElementById("joyKnob"),
    menu: document.getElementById("menuScreen"),
    shopScreen: document.getElementById("shopScreen"),
    returningPanel: document.getElementById("returningPanel"),
    playButton: document.getElementById("playButton"),
    shopOpenButton: document.getElementById("shopOpenButton"),
    shopBackButton: document.getElementById("shopBackButton"),
    charGrid: document.getElementById("characterGrid"),
    mapGrid: document.getElementById("mapGrid"),
    shopGrid: document.getElementById("shopGrid"),
    manaText: document.getElementById("manaText"),
    levelScreen: document.getElementById("levelScreen"),
    cardGrid: document.getElementById("cardGrid"),
    endScreen: document.getElementById("endScreen"),
    endEyebrow: document.getElementById("endEyebrow"),
    endTitle: document.getElementById("endTitle"),
    endStats: document.getElementById("endStats"),
    againButton: document.getElementById("againButton"),
    menuButton: document.getElementById("menuButton"),
    sysBtns: document.getElementById("sysBtns"),
    pauseBtn: document.getElementById("pauseBtn"),
    muteBtn: document.getElementById("muteBtn")
  };

  const RARITIES = [
    { id: "common", name: "Comum", color: "#cfcfcf", weight: 60, mult: 1 },
    { id: "uncommon", name: "Incomum", color: "#77df83", weight: 25, mult: 1.25 },
    { id: "rare", name: "Raro", color: "#62b5ff", weight: 12, mult: 1.55 },
    { id: "epic", name: "Epico", color: "#c783ff", weight: 3, mult: 1.9 },
    { id: "legendary", name: "Lendario", color: "#ffb347", weight: 1, mult: 2.35 }
  ];

  const RARITY_BONUS_PCT = {
    common: 4,
    uncommon: 6,
    rare: 8,
    epic: 11,
    legendary: 14
  };

  const CHARACTERS = [
    {
      id: "arcano",
      name: "Arcano",
      code: "AR",
      color: "#6f72f6",
      weapon: "arcane",
      hp: 54,
      speed: 184,
      passive: "Sobrecarga",
      desc: "+3% dano por projetil vivo."
    },
    {
      id: "cavalheiro",
      name: "Cavalheiro",
      code: "CV",
      color: "#8fa0a8",
      weapon: "sword",
      hp: 66,
      speed: 176,
      passive: "Guarda",
      desc: "Mais HP e dano recebido menor."
    },
    {
      id: "vampiro",
      name: "Vampiro",
      code: "VP",
      color: "#b83d58",
      weapon: "scythe",
      hp: 56,
      speed: 186,
      passive: "Sede",
      desc: "Abates curam HP visivel."
    },
    {
      id: "cacadora",
      name: "Cacadora",
      code: "CA",
      color: "#3faa77",
      weapon: "bow",
      hp: 52,
      speed: 188,
      passive: "Olho",
      desc: "Critico e dano a distancia."
    },
    {
      id: "piromante",
      name: "Piromante",
      code: "PI",
      color: "#ef6b3a",
      weapon: "fire",
      hp: 52,
      speed: 182,
      passive: "Pira",
      desc: "Queimadura e dano em alvos em chamas."
    }
  ];

  const MAPS = [
    {
      id: "green",
      name: "Campo Verde",
      hpMult: 1,
      dmgMult: 1,
      bg: "#cfeebf",
      tileA: "#bfe6a8",
      tileB: "#dff5c6",
      tileKey: "green",
      deco: "flowers"
    },
    {
      id: "waste",
      name: "Terra Devastada",
      hpMult: 1.5,
      dmgMult: 1.35,
      bg: "#d8d9a8",
      tileA: "#c6c780",
      tileB: "#e3dfa9",
      tileKey: "waste",
      deco: "stumps"
    },
    {
      id: "ash",
      name: "Ermo Calcinado",
      hpMult: 2.1,
      dmgMult: 1.8,
      bg: "#a34c3c",
      tileA: "#b95d42",
      tileB: "#8f443e",
      tileKey: "fire",
      deco: "rocks"
    }
  ];

  const SPRITE_PATHS = {
    characters: Object.fromEntries(CHARACTERS.flatMap((c) => [
      [`${c.id}_idle`, `assets/sprites/character_${c.id}_idle.png`],
      [`${c.id}_walk`, `assets/sprites/character_${c.id}_walk.png`]
    ])),
    enemies: {
      slime: "assets/sprites/generated_enemy_slime.png",
      goblin: "assets/sprites/generated_enemy_goblin.png",
      bat: "assets/sprites/generated_enemy_bat.png",
      skeleton: "assets/sprites/generated_enemy_skeleton.png",
      golem: "assets/sprites/generated_enemy_golem.png",
      bomber: "assets/sprites/generated_enemy_bomber.png"
    },
    bosses: {
      brute: "assets/sprites/generated_boss_brute.png",
      reaper: "assets/sprites/generated_boss_reaper.png"
    },
    maps: {
      green: "assets/maps/generated_map_green.webp",
      waste: "assets/maps/generated_map_waste.webp",
      fire: "assets/maps/generated_map_fire.webp"
    },
    projectiles: "assets/sprites/projectiles.png",
    drops: "assets/sprites/drops.png"
  };

  const sprites = {
    characters: {},
    enemies: {},
    bosses: {},
    maps: {},
    projectiles: null,
    drops: null
  };

  const ENEMY_TYPES = {
    slime: { name: "Slime", hp: 12, speed: 80, dmg: 8, xp: 2, r: 12, color: "#65c96d", kind: "slime" },
    goblin: { name: "Goblin", hp: 11, speed: 120, dmg: 7, xp: 2, r: 11, color: "#80b950", kind: "goblin" },
    bat: { name: "Morcego", hp: 8, speed: 160, dmg: 6, xp: 3, r: 9, color: "#8b72d9", kind: "bat" },
    skeleton: { name: "Esqueleto", hp: 18, speed: 95, dmg: 9, xp: 3, r: 11, color: "#f2ead5", kind: "skeleton" },
    golem: { name: "Golem", hp: 125, speed: 50, dmg: 16, xp: 10, r: 18, color: "#a89d8d", kind: "golem" },
    bomber: { name: "Bombardeiro", hp: 18, speed: 100, dmg: 20, xp: 4, r: 10, color: "#f28b47", kind: "bomber" }
  };

  const WEAPONS = {
    arcane: { name: "Cajado Arcano", code: "CAJ", cd: 0.55, dmg: 12, range: 270, speed: 540, color: "#7367f0", type: "projectile" },
    sword: { name: "Espada", code: "ESP", cd: 0.65, dmg: 16, range: 88, color: "#a9c2ce", type: "slash" },
    scythe: { name: "Foice", code: "FOI", cd: 0.7, dmg: 14, range: 76, color: "#b83d58", type: "spin" },
    bow: { name: "Arco Perfurante", code: "ARC", cd: 0.6, dmg: 11, range: 390, speed: 650, color: "#43a96d", type: "projectile" },
    fire: { name: "Cajado de Fogo", code: "FOG", cd: 1.1, dmg: 16, range: 310, speed: 390, color: "#f06a37", type: "projectile" },
    aura: { name: "Aura", code: "AUR", cd: 0.38, dmg: 6, range: 74, color: "#74d5ff", type: "aura", premium: true },
    ricochet: { name: "Arco Ricochete", code: "RIC", cd: 0.72, dmg: 10, range: 390, speed: 610, color: "#ffd166", type: "projectile", premium: true },
    shadow: { name: "Servo Sombrio", code: "SRV", cd: 1.8, dmg: 9, range: 120, color: "#5c4f73", type: "summon", premium: true }
  };

  const TOOLS = {
    force: { name: "Forca", code: "FOR", desc: "Dano de todas as armas." },
    haste: { name: "Velocidade", code: "VEL", desc: "Ataques saem mais rapido." },
    crit: { name: "Golpe Critico", code: "CRI", desc: "Mais chance e dano critico." },
    multishot: { name: "Multitiro", code: "MUL", desc: "Mais projetil em leque." },
    armor: { name: "Armadura", code: "ARM", desc: "Dano recebido menor." },
    frost: { name: "Gelo", code: "GEL", desc: "Hits podem reduzir a velocidade dos inimigos." },
    luck: { name: "Sorte", code: "SOR", desc: "Melhora as chances de raridades altas." }
  };

  const SHOP_ITEMS = [
    { id: "aura", kind: "weapon", cost: 80, name: "Aura", desc: "Campo de dano continuo." },
    { id: "ricochet", kind: "weapon", cost: 180, name: "Arco Ricochete", desc: "Flecha salta entre alvos." },
    { id: "shadow", kind: "weapon", cost: 350, name: "Servo Sombrio", desc: "Aliado que escala com o level." },
    { id: "hp", kind: "upgrade", cost: 70, name: "+HP", desc: "Mais vida maxima permanente." },
    { id: "damage", kind: "upgrade", cost: 90, name: "+Dano", desc: "Todas as armas batem mais forte." },
    { id: "speed", kind: "upgrade", cost: 85, name: "+Movimento", desc: "Mais velocidade permanente." },
    { id: "luck", kind: "upgrade", cost: 120, name: "+Sorte", desc: "Raridades melhores aparecem com mais frequencia." }
  ];

  const UPGRADE_ICON_INDEX = {
    bolt: 0,
    sword: 1,
    scythe: 2,
    bow: 3,
    fire: 4,
    aura: 5,
    ricochet: 6,
    shadow: 7,
    force: 8,
    haste: 9,
    crit: 10,
    multishot: 11,
    armor: 12,
    frost: 13,
    luck: 14,
    heal: 15
  };

  const UPGRADE_ICON_BY_ID = {
    arcane: "bolt",
    sword: "sword",
    scythe: "scythe",
    bow: "bow",
    fire: "fire",
    aura: "aura",
    ricochet: "ricochet",
    shadow: "shadow",
    force: "force",
    haste: "haste",
    crit: "crit",
    multishot: "multishot",
    armor: "armor",
    frost: "frost",
    luck: "luck",
    heal: "heal"
  };

  const keys = new Set();
  const pointer = {
    active: false,
    id: -1,
    originX: 0,
    originY: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0
  };

  let save = loadSave();
  let selectedChar = save.selectedChar || "arcano";
  let selectedMap = save.selectedMap || "green";
  let mode = "menu";
  let viewW = 1;
  let viewH = 1;
  let dpr = 1;
  let lastTime = performance.now();
  let game = null;
  let audio = null;

  const CG = (typeof window !== "undefined" && window.CrazyGames && window.CrazyGames.SDK) ? window.CrazyGames.SDK : null;
  let cgReady = false;
  let gameplayActive = false;
  let gamesStarted = 0;
  const pauseReasons = new Set();
  let systemPaused = false;
  let muted = Boolean(save.muted);

  function setPause(reason, on) {
    if (on) pauseReasons.add(reason);
    else pauseReasons.delete(reason);
    systemPaused = pauseReasons.size > 0;
    if (audio) {
      if (systemPaused && audio.context.state === "running") audio.context.suspend();
      else if (!systemPaused && audio.context.state === "suspended") audio.context.resume();
    }
  }

  function applyMuteToAudio() {
    if (audio) audio.master.gain.value = muted ? 0 : 0.12;
  }

  function setMuted(value) {
    muted = value;
    save.muted = value;
    persist();
    applyMuteToAudio();
    if (el.muteBtn) {
      el.muteBtn.textContent = muted ? "🔇" : "🔊";
      el.muteBtn.classList.toggle("is-off", muted);
    }
  }

  async function initCrazySDK() {
    if (!CG) return;
    try {
      await CG.init();
      cgReady = true;
      try { CG.game.loadingStop(); } catch (err) { /* optional */ }
    } catch (err) {
      console.warn("CrazyGames SDK indisponivel", err);
    }
  }

  function cgGameplayStart() {
    try {
      if (cgReady && !gameplayActive) {
        CG.game.gameplayStart();
        gameplayActive = true;
      }
    } catch (err) { /* noop */ }
  }

  function cgGameplayStop() {
    try {
      if (cgReady && gameplayActive) {
        CG.game.gameplayStop();
        gameplayActive = false;
      }
    } catch (err) { /* noop */ }
  }

  function cgHappytime() {
    try { if (cgReady) CG.game.happytime(); } catch (err) { /* noop */ }
  }

  function requestMidgameAd(done) {
    if (!cgReady) { done(); return; }
    let settled = false;
    let started = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      done();
    };
    try {
      CG.ad.requestAd("midgame", {
        adStarted: () => { started = true; setPause("ad", true); },
        adFinished: () => { setPause("ad", false); finish(); },
        adError: () => { setPause("ad", false); finish(); }
      });
    } catch (err) {
      finish();
      return;
    }
    setTimeout(() => { if (!started) finish(); }, 6000);
  }

  function beginGame() {
    if (gamesStarted > 0) requestMidgameAd(startGame);
    else startGame();
  }

  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          hasPlayed: Boolean(parsed.hasPlayed),
          mana: Number(parsed.mana || 0),
          unlockedMaps: Math.max(1, Number(parsed.unlockedMaps || 1)),
          premium: parsed.premium || {},
          upgrades: parsed.upgrades || {},
          selectedChar: parsed.selectedChar || "arcano",
          selectedMap: parsed.selectedMap || "green",
          bestTime: Number(parsed.bestTime || 0),
          muted: Boolean(parsed.muted)
        };
      }
    } catch (err) {
      console.warn("Save reset", err);
    }
    return {
      hasPlayed: false,
      mana: 0,
      unlockedMaps: 1,
      premium: {},
      upgrades: {},
      selectedChar: "arcano",
      selectedMap: "green",
      bestTime: 0,
      muted: false
    };
  }

  function persist() {
    save.selectedChar = selectedChar;
    save.selectedMap = selectedMap;
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  }

  function loadSprite(src) {
    if (typeof Image === "undefined") return null;
    const image = new Image();
    image.decoding = "async";
    image.src = src;
    image.loaded = false;
    image.onload = () => {
      image.loaded = true;
    };
    image.onerror = () => {
      image.failed = true;
    };
    return image;
  }

  function loadSprites() {
    for (const [key, src] of Object.entries(SPRITE_PATHS.characters)) {
      sprites.characters[key] = loadSprite(src);
    }
    for (const [key, src] of Object.entries(SPRITE_PATHS.enemies)) {
      sprites.enemies[key] = loadSprite(src);
    }
    for (const [key, src] of Object.entries(SPRITE_PATHS.bosses)) {
      sprites.bosses[key] = loadSprite(src);
    }
    // Mapas sao texturas grandes (~1-1.5MB cada). Carregamos sob demanda apenas
    // o mapa em uso, em vez de baixar os tres no boot. Ver ensureMapLoaded().
    sprites.projectiles = loadSprite(SPRITE_PATHS.projectiles);
    sprites.drops = loadSprite(SPRITE_PATHS.drops);
  }

  function ensureMapLoaded(tileKey) {
    if (!tileKey || sprites.maps[tileKey]) return;
    const src = SPRITE_PATHS.maps[tileKey];
    if (src) sprites.maps[tileKey] = loadSprite(src);
  }

  function ready(image) {
    return Boolean(image && (image.loaded || image.complete) && !image.failed);
  }

  function spriteFrame(sheet, frameW, frameH, frame, dx, dy, dw = frameW, dh = frameH) {
    if (!ready(sheet)) return false;
    const frames = Math.max(1, Math.floor(sheet.width / frameW));
    const index = ((frame % frames) + frames) % frames;
    ctx.drawImage(sheet, index * frameW, 0, frameW, frameH, Math.round(dx), Math.round(dy), Math.round(dw), Math.round(dh));
    return true;
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    viewW = Math.max(1, rect.width);
    viewH = Math.max(1, rect.height);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(viewW * dpr);
    canvas.height = Math.floor(viewH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }

  function distSq(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  function len(x, y) {
    return Math.hypot(x, y) || 1;
  }

  function normalize(x, y) {
    const l = len(x, y);
    return { x: x / l, y: y / l };
  }

  function hash2(x, y) {
    let n = x * 374761393 + y * 668265263;
    n = (n ^ (n >> 13)) * 1274126177;
    return ((n ^ (n >> 16)) >>> 0) / 4294967295;
  }

  function weighted(items, weightKey = "weight") {
    let total = 0;
    for (const item of items) total += item[weightKey];
    let roll = Math.random() * total;
    for (const item of items) {
      roll -= item[weightKey];
      if (roll <= 0) return item;
    }
    return items[items.length - 1];
  }

  function weightedEnemy(entries) {
    return weighted(entries.map(([id, weight]) => ({ id, weight }))).id;
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function currentCharacter() {
    return CHARACTERS.find((c) => c.id === selectedChar) || CHARACTERS[0];
  }

  function currentMap() {
    const unlocked = save.unlockedMaps || 1;
    const idx = MAPS.findIndex((m) => m.id === selectedMap);
    return MAPS[clamp(idx < 0 ? 0 : idx, 0, unlocked - 1)] || MAPS[0];
  }

  function unlockedWeaponIds() {
    const ids = ["arcane", "sword", "scythe", "bow", "fire"];
    for (const id of ["aura", "ricochet", "shadow"]) {
      if (save.premium[id]) ids.push(id);
    }
    return ids;
  }

  function showToast(text, seconds = 1.8) {
    el.toast.textContent = text;
    el.toast.classList.add("is-live");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => el.toast.classList.remove("is-live"), seconds * 1000);
  }

  function initAudio() {
    if (audio) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const master = context.createGain();
    master.gain.value = muted ? 0 : 0.12;
    master.connect(context.destination);
    audio = {
      context,
      master,
      lastHit: 0,
      gemCombo: 0,
      beatTimer: 0,
      tone(freq, dur, type = "sine", gain = 0.2, slide = 1) {
        const now = context.currentTime;
        const osc = context.createOscillator();
        const g = context.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * slide), now + dur);
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(gain, now + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        osc.connect(g);
        g.connect(master);
        osc.start(now);
        osc.stop(now + dur + 0.02);
      },
      hit() {
        const now = context.currentTime;
        if (now - this.lastHit < 0.028) return;
        this.lastHit = now;
        this.tone(rand(160, 230), 0.045, "square", 0.11, 0.55);
      },
      kill() {
        this.tone(rand(90, 130), 0.08, "triangle", 0.13, 0.45);
      },
      pickup() {
        this.gemCombo = Math.min(12, this.gemCombo + 1);
        this.tone(430 + this.gemCombo * 28, 0.055, "sine", 0.11, 1.18);
        clearTimeout(this.comboTimer);
        this.comboTimer = setTimeout(() => {
          this.gemCombo = 0;
        }, 420);
      },
      level() {
        [480, 620, 820].forEach((f, i) => setTimeout(() => this.tone(f, 0.08, "triangle", 0.18, 1.08), i * 70));
      },
      boss() {
        this.tone(130, 0.28, "sawtooth", 0.14, 0.5);
        setTimeout(() => this.tone(80, 0.24, "sawtooth", 0.13, 0.6), 90);
      },
      win() {
        [420, 560, 720, 960].forEach((f, i) => setTimeout(() => this.tone(f, 0.16, "triangle", 0.16, 1.02), i * 95));
      },
      playerHit() {
        this.tone(rand(85, 110), 0.14, "sawtooth", 0.15, 0.42);
      }
    };
  }

  function resumeAudio() {
    initAudio();
    if (audio && audio.context.state === "suspended") {
      audio.context.resume();
    }
  }

  function renderMenu() {
    el.menu.classList.remove("is-hidden");
    el.shopScreen.classList.add("is-hidden");
    el.hud.classList.add("is-hidden");
    el.sysBtns.classList.add("is-hidden");
    el.levelScreen.classList.add("is-hidden");
    el.endScreen.classList.add("is-hidden");
    el.returningPanel.classList.remove("is-hidden");
    el.manaText.textContent = String(Math.floor(save.mana || 0));

    // Textura do fundo do menu (sempre verde) + preload do mapa selecionado,
    // para o "Jogar" comecar com o chao ja carregado.
    ensureMapLoaded(MAPS[0].tileKey);
    ensureMapLoaded(currentMap().tileKey);

    el.charGrid.innerHTML = "";
    for (const character of CHARACTERS) {
      const button = document.createElement("button");
      button.className = `characterCard${character.id === selectedChar ? " is-selected" : ""}`;
      button.innerHTML = `
        <span class="choiceSprite" style="background-image:url('assets/sprites/character_${character.id}_idle.png')"></span>
        <span class="characterText"><b>${character.name}</b><small>${character.passive}: ${character.desc}</small></span>
      `;
      button.addEventListener("click", () => {
        selectedChar = character.id;
        persist();
        renderMenu();
      });
      el.charGrid.appendChild(button);
    }

    el.mapGrid.innerHTML = "";
    MAPS.forEach((map, index) => {
      const locked = index >= save.unlockedMaps;
      const selected = map.id === currentMap().id;
      const button = document.createElement("button");
      button.className = `choiceCard${selected ? " is-selected" : ""}${locked ? " is-locked" : ""}`;
      button.innerHTML = `<b>${locked ? "Bloqueado" : map.name}</b><small>HP x${map.hpMult} / dano x${map.dmgMult}</small>`;
      button.addEventListener("click", () => {
        if (locked) return;
        selectedMap = map.id;
        persist();
        renderMenu();
      });
      el.mapGrid.appendChild(button);
    });
  }

  function renderShop() {
    el.manaText.textContent = String(Math.floor(save.mana || 0));
    el.shopGrid.innerHTML = "";
    for (const item of SHOP_ITEMS) {
      const owned = item.kind === "weapon" ? Boolean(save.premium[item.id]) : Number(save.upgrades[item.id] || 0) > 0;
      const level = Number(save.upgrades[item.id] || 0);
      const cost = item.kind === "upgrade" ? Math.round(item.cost * (1 + level * 0.65)) : item.cost;
      const locked = save.mana < cost && !owned;
      const button = document.createElement("button");
      button.className = `shopItem${owned ? " is-owned" : ""}${locked ? " is-locked" : ""}`;
      const suffix = item.kind === "upgrade" && level ? ` Lv${level}` : "";
      const status = owned && item.kind === "weapon" ? "comprado" : `${cost} mana`;
      button.innerHTML = `<b>${item.name}${suffix}</b><small>${item.desc} - ${status}</small>`;
      button.addEventListener("click", () => {
        if (item.kind === "weapon" && save.premium[item.id]) return;
        if (save.mana < cost) return;
        save.mana -= cost;
        if (item.kind === "weapon") save.premium[item.id] = true;
        if (item.kind === "upgrade") save.upgrades[item.id] = level + 1;
        persist();
        renderShop();
      });
      el.shopGrid.appendChild(button);
    }
  }

  function openShop() {
    el.menu.classList.add("is-hidden");
    el.hud.classList.add("is-hidden");
    el.sysBtns.classList.add("is-hidden");
    el.levelScreen.classList.add("is-hidden");
    el.endScreen.classList.add("is-hidden");
    el.shopScreen.classList.remove("is-hidden");
    renderShop();
  }

  function closeShop() {
    renderMenu();
  }

  function startGame() {
    resumeAudio();
    save.hasPlayed = true;
    persist();

    const character = currentCharacter();
    const map = currentMap();
    ensureMapLoaded(map.tileKey);
    const hpUpgrade = Number(save.upgrades.hp || 0);
    const damageUpgrade = Number(save.upgrades.damage || 0);
    const speedUpgrade = Number(save.upgrades.speed || 0);
    let maxHp = character.hp + hpUpgrade * 8;
    if (character.id === "cavalheiro") maxHp *= 1.3;

    mode = "playing";
    game = {
      character,
      map,
      t: 0,
      dt: 0,
      killCount: 0,
      gold: 0,
      boss1Spawned: false,
      boss1Defeated: false,
      boss2Spawned: false,
      victory: false,
      spawnTimer: 0,
      calmTimer: 0,
      hitStop: 0,
      hitStopCd: 0,
      shake: 0,
      toastTimer: 0,
      healBucket: 0,
      healBucketTimer: 0,
      player: {
        x: 0,
        y: 0,
        r: 17,
        hp: maxHp,
        maxHp,
        speed: character.speed + speedUpgrade * 7,
        level: 1,
        xp: 0,
        nextXp: 7,
        lastDirX: 1,
        lastDirY: 0,
        invuln: 0,
        damageUpgrade: damageUpgrade * 0.08,
        trailClock: 0,
        weapons: {},
        tools: {},
        minionsWanted: 0
      },
      enemies: [],
      spawnMarks: [],
      projectiles: [],
      enemyProjectiles: [],
      gems: [],
      goldDrops: [],
      particles: [],
      deaths: [],
      texts: [],
      slashes: [],
      trails: [],
      telegraphs: [],
      chests: [],
      choices: [],
      cardAuto: 0
    };

    addWeapon(character.weapon);
    el.menu.classList.add("is-hidden");
    el.shopScreen.classList.add("is-hidden");
    el.endScreen.classList.add("is-hidden");
    el.levelScreen.classList.add("is-hidden");
    el.hud.classList.remove("is-hidden");
    el.sysBtns.classList.remove("is-hidden");
    if (el.pauseBtn) el.pauseBtn.textContent = "II";
    gamesStarted += 1;
    cgGameplayStop();
    cgGameplayStart();

    for (let i = 0; i < 18; i += 1) {
      const type = i % 3 === 0 ? "goblin" : i % 5 === 0 ? "bat" : "slime";
      queueSpawn(type, 250 + Math.random() * 340, Math.random() * TAU, 0.12 + Math.random() * 0.3);
    }
    showToast(`${map.name}: sobreviva ate 06:00`, 2.4);
  }

  function endRun(won) {
    if (!game || mode === "ended") return;
    mode = "ended";
    const seconds = Math.floor(game.t);
    const baseMana = Math.floor(game.killCount * 0.5 + seconds * 0.1 + game.player.level * 2 + (won ? 30 : 0));
    const goldMana = Math.floor(game.gold * 0.25);
    const mana = baseMana + goldMana;
    save.mana += mana;
    save.bestTime = Math.max(save.bestTime || 0, seconds);
    if (won) {
      const mapIndex = MAPS.findIndex((m) => m.id === game.map.id);
      if (mapIndex >= 0 && save.unlockedMaps === mapIndex + 1 && save.unlockedMaps < MAPS.length) {
        save.unlockedMaps += 1;
      }
    }
    persist();

    cgGameplayStop();
    el.hud.classList.add("is-hidden");
    el.sysBtns.classList.add("is-hidden");
    el.levelScreen.classList.add("is-hidden");
    el.endScreen.classList.remove("is-hidden");
    el.endEyebrow.textContent = won ? "Vitoria" : "Run encerrada";
    el.endTitle.textContent = won ? "A praga recuou" : "A horda venceu";
    el.endStats.innerHTML = [
      ["Tempo", formatTime(seconds)],
      ["Abates", String(game.killCount)],
      ["Level", String(game.player.level)],
      ["Ouro", `${game.gold} -> +${goldMana} mana`],
      ["Mana", `+${mana}`]
    ].map(([label, value]) => `<div><span>${label}</span>${value}</div>`).join("");
    if (audio) {
      if (won) audio.win();
      else audio.boss();
    }
    renderMenu();
    el.menu.classList.add("is-hidden");
    el.endScreen.classList.remove("is-hidden");
  }

  function addWeapon(id) {
    if (!game.player.weapons[id]) {
      game.player.weapons[id] = { level: 1, timer: rand(0.08, 0.25) };
      if (id === "shadow") game.player.minionsWanted = 1;
    }
  }

  function upgradeWeapon(id) {
    const current = game.player.weapons[id];
    if (current) {
      current.level = Math.min(25, current.level + 1);
      if (id === "shadow" && current.level >= 8) game.player.minionsWanted = 2;
    } else {
      addWeapon(id);
    }
  }

  function addTool(id) {
    game.player.tools[id] = Math.min(5, Number(game.player.tools[id] || 0) + 1);
  }

  function weaponLevel(id) {
    return game.player.weapons[id] ? game.player.weapons[id].level : 0;
  }

  function toolLevel(id) {
    return Number(game.player.tools[id] || 0);
  }

  function maxWeaponSlots() {
    return 3;
  }

  function maxToolSlots() {
    return 2;
  }

  function getDamageMult(enemy) {
    const p = game.player;
    let mult = 1 + p.damageUpgrade + toolLevel("force") * 0.08;
    if (game.character.id === "arcano") {
      const alive = game.projectiles.filter((proj) => proj.fromPlayer).length;
      mult *= 1 + Math.min(0.72, alive * 0.03);
    }
    if (game.character.id === "cacadora" && enemy && distSq(enemy, p) > 260 * 260) {
      mult *= 1.35;
    }
    if (game.character.id === "piromante" && enemy && enemy.burn > 0) {
      mult *= 1.25;
    }
    return mult;
  }

  function critInfo() {
    let chance = 0.05 + toolLevel("crit") * 0.055;
    let mult = 1.5 + toolLevel("crit") * 0.14;
    if (game.character.id === "cacadora") chance += 0.2;
    const crit = Math.random() < chance;
    return { crit, mult: crit ? mult : 1 };
  }

  function weaponDamage(id, level, enemy) {
    const base = WEAPONS[id].dmg * (1 + (level - 1) * 0.1);
    const crit = critInfo();
    return {
      value: base * getDamageMult(enemy) * crit.mult,
      crit: crit.crit
    };
  }

  function weaponCooldown(id, level) {
    const def = WEAPONS[id];
    const haste = clamp(1 - toolLevel("haste") * 0.045 - (level - 1) * 0.018, 0.48, 1);
    return def.cd * haste;
  }

  function projectileCount(level) {
    return 1 + Math.floor((level - 1) / 4) + Math.floor((toolLevel("multishot") + 1) / 2);
  }

  function getInputVector() {
    let x = 0;
    let y = 0;
    if (keys.has("arrowleft") || keys.has("a")) x -= 1;
    if (keys.has("arrowright") || keys.has("d")) x += 1;
    if (keys.has("arrowup") || keys.has("w")) y -= 1;
    if (keys.has("arrowdown") || keys.has("s")) y += 1;
    if (pointer.active) {
      x += pointer.vx;
      y += pointer.vy;
    }
    if (x || y) return normalize(x, y);
    return { x: 0, y: 0 };
  }

  function updateGame(dt) {
    if (!game) return;

    game.hitStopCd = Math.max(0, game.hitStopCd - dt);
    if (game.hitStop > 0) {
      game.hitStop -= dt;
      dt *= 0.15;
    }

    game.dt = dt;
    game.t += dt;
    game.shake = Math.max(0, game.shake - dt * 18);
    game.healBucketTimer -= dt;
    if (game.healBucketTimer <= 0) {
      game.healBucketTimer = 1;
      game.healBucket = 0;
    }

    const p = game.player;
    p.invuln = Math.max(0, p.invuln - dt);
    const input = getInputVector();
    p.walking = Boolean(input.x || input.y);
    if (input.x || input.y) {
      p.lastDirX = input.x;
      p.lastDirY = input.y;
      p.x += input.x * p.speed * dt;
      p.y += input.y * p.speed * dt;
      p.trailClock -= dt;
      if (p.trailClock <= 0) {
        p.trailClock = 0.035;
        game.trails.push({ x: p.x, y: p.y, r: p.r, life: 0.28, max: 0.28, color: game.character.color });
      }
    }

    updateSpawning(dt);
    updateSpawnMarks(dt);
    updateEnemies(dt);
    updateWeapons(dt);
    updateProjectiles(dt);
    updateEnemyProjectiles(dt);
    updateDrops(dt);
    updateEffects(dt);
    updateBossTimeline();
    updateMusic(dt);

    if (p.xp >= p.nextXp && mode === "playing") {
      levelUp();
    }

    if (p.hp <= 0) {
      endRun(false);
    }

    updateHud();
  }

  function updateMusic(dt) {
    if (!audio || mode !== "playing") return;
    audio.beatTimer -= dt;
    const intensity = clamp(game.enemies.length / 80 + game.t / 420, 0, 1.4);
    if (audio.beatTimer <= 0) {
      const interval = clamp(0.62 - intensity * 0.22, 0.28, 0.62);
      audio.beatTimer = interval;
      const base = game.boss1Spawned && !game.boss1Defeated ? 150 : game.boss2Spawned ? 110 : 220;
      audio.tone(base, 0.045, "triangle", 0.035 + intensity * 0.018, 0.95);
      if (game.t > 50 || game.enemies.length > 35) {
        setTimeout(() => audio && audio.tone(base * 1.5, 0.035, "sine", 0.028, 1.04), interval * 360);
      }
    }
  }

  function director() {
    const t = game.t;
    const bossAlive = game.enemies.some((e) => e.boss);
    if (bossAlive) return { minimum: game.boss2Spawned ? 30 : 25, frequency: 0.8 };
    let base;
    if (t < 60) base = { minimum: 24, frequency: 0.58 };
    else if (t < 120) base = { minimum: 34, frequency: 0.66 };
    else if (t < 180) base = { minimum: 44, frequency: 0.62 };
    else if (t < 270) base = { minimum: 52, frequency: 0.54 };
    else if (t < 360) base = { minimum: 68, frequency: 0.46 };
    else base = { minimum: 30, frequency: 0.8 };
    if (game.boss1Defeated) {
      base.minimum = Math.round(base.minimum * 1.5);
      base.frequency *= 0.7;
    }
    return base;
  }

  function spawnPool() {
    const t = game.t;
    if (t < 35) return [["slime", 56], ["goblin", 32], ["bat", 12]];
    if (t < 90) return [["slime", 42], ["goblin", 30], ["bat", 18], ["skeleton", 10]];
    if (t < 180) return [["slime", 26], ["goblin", 26], ["bat", 18], ["skeleton", 22], ["golem", 8]];
    if (t < 270) return [["goblin", 22], ["bat", 16], ["skeleton", 34], ["golem", 16], ["bomber", 12]];
    return [["skeleton", 43], ["golem", 28], ["bomber", 29]];
  }

  function updateSpawning(dt) {
    if (game.calmTimer > 0) {
      game.calmTimer -= dt;
      return;
    }
    const d = director();
    const alive = game.enemies.filter((e) => !e.boss).length + game.spawnMarks.length;
    game.spawnTimer -= dt;

    if (alive < d.minimum) {
      const need = Math.min(7, d.minimum - alive);
      for (let i = 0; i < need; i += 1) {
        queueSpawn(weightedEnemy(spawnPool()));
      }
      game.spawnTimer = Math.min(game.spawnTimer, 0.16);
      return;
    }

    if (game.spawnTimer <= 0) {
      queueSpawn(weightedEnemy(spawnPool()));
      game.spawnTimer = d.frequency;
    }
  }

  function queueSpawn(type, distance = null, angle = null, delay = 0.42) {
    const p = game.player;
    const forwardChance = Math.random() < 0.35 && (p.lastDirX || p.lastDirY);
    let a = angle;
    if (a === null) {
      a = forwardChance
        ? Math.atan2(p.lastDirY, p.lastDirX) + rand(-0.85, 0.85)
        : Math.random() * TAU;
    }
    const dist = distance || Math.max(viewW, viewH) * 0.58 + rand(60, 190);
    const x = p.x + Math.cos(a) * dist;
    const y = p.y + Math.sin(a) * dist;
    game.spawnMarks.push({ x, y, type, delay, t: 0, r: ENEMY_TYPES[type].r + 8 });
  }

  function updateSpawnMarks(dt) {
    for (const mark of game.spawnMarks) {
      mark.t += dt;
      if (mark.t >= mark.delay) {
        spawnEnemy(mark.type, mark.x, mark.y);
        mark.dead = true;
      }
    }
    game.spawnMarks = game.spawnMarks.filter((m) => !m.dead);
  }

  function spawnEnemy(type, x, y, extra = {}) {
    const def = ENEMY_TYPES[type];
    const hp = def.hp * game.map.hpMult * (1 + Math.max(0, game.t - 40) / 360 * 0.45);
    game.enemies.push({
      id: Math.random(),
      type,
      kind: def.kind,
      name: def.name,
      x,
      y,
      vx: 0,
      vy: 0,
      r: def.r,
      hp,
      maxHp: hp,
      speed: def.speed,
      dmg: def.dmg,
      xp: def.xp,
      color: def.color,
      contactCd: rand(0, 0.45),
      hitFlash: 0,
      squash: 0,
      knockX: 0,
      knockY: 0,
      burn: 0,
      burnTick: 0,
      slow: 0,
      phase: Math.random() * TAU,
      dead: false,
      ...extra
    });
  }

  function updateBossTimeline() {
    if (!game.boss1Spawned && game.t >= 180) {
      spawnBoss1();
    }
    if (game.boss1Defeated && !game.boss2Spawned && game.t >= 360) {
      spawnBoss2();
    }
  }

  function spawnBoss1() {
    game.boss1Spawned = true;
    const p = game.player;
    const angle = Math.random() * TAU;
    const hp = 9000 * game.map.hpMult;
    game.enemies.push({
      id: Math.random(),
      boss: true,
      bossType: "brute",
      name: "O Brutamontes",
      type: "boss1",
      kind: "boss1",
      x: p.x + Math.cos(angle) * 520,
      y: p.y + Math.sin(angle) * 520,
      vx: 0,
      vy: 0,
      r: 40,
      hp,
      maxHp: hp,
      speed: 82,
      dmg: 20,
      xp: 40,
      color: "#d85b49",
      state: "walk",
      attackTimer: 1.2,
      stateTimer: 0,
      contactCd: 0,
      hitFlash: 0,
      squash: 0,
      knockX: 0,
      knockY: 0,
      burn: 0,
      burnTick: 0,
      slow: 0,
      phase: 0
    });
    game.shake = 12;
    showToast("Boss: O Brutamontes", 2.4);
    if (audio) audio.boss();
  }

  function spawnBoss2() {
    game.boss2Spawned = true;
    const p = game.player;
    const angle = Math.random() * TAU;
    const hp = 18000 * game.map.hpMult;
    game.enemies.push({
      id: Math.random(),
      boss: true,
      bossType: "reaper",
      name: "Ceifador da Praga",
      type: "boss2",
      kind: "boss2",
      x: p.x + Math.cos(angle) * 560,
      y: p.y + Math.sin(angle) * 560,
      vx: 0,
      vy: 0,
      r: 48,
      hp,
      maxHp: hp,
      speed: 74,
      dmg: 28,
      xp: 80,
      color: "#573f65",
      state: "walk",
      attackTimer: 1.2,
      stateTimer: 0,
      contactCd: 0,
      hitFlash: 0,
      squash: 0,
      knockX: 0,
      knockY: 0,
      burn: 0,
      burnTick: 0,
      slow: 0,
      phase: 0
    });
    game.shake = 14;
    showToast("Boss final: Ceifador da Praga", 2.6);
    if (audio) audio.boss();
  }

  function updateEnemies(dt) {
    const p = game.player;
    for (const enemy of game.enemies) {
      if (enemy.dead) continue;
      enemy.hitFlash = Math.max(0, enemy.hitFlash - dt * 28);
      enemy.squash = Math.max(0, enemy.squash - dt * 9);
      enemy.burn = Math.max(0, enemy.burn - dt);
      enemy.slow = Math.max(0, enemy.slow - dt);
      enemy.contactCd -= dt;

      if (enemy.burn > 0) {
        enemy.burnTick -= dt;
        if (enemy.burnTick <= 0) {
          enemy.burnTick = 0.35;
          damageEnemy(enemy, 2.2 + game.player.level * 0.35, {
            x: enemy.x,
            y: enemy.y,
            color: "#ff8a4a",
            noCrit: true,
            noAudio: true,
            dot: true
          });
        }
      }

      if (enemy.dead) continue;

      if (enemy.boss) {
        updateBoss(enemy, dt);
      } else {
        updateNormalEnemy(enemy, dt);
      }

      enemy.x += enemy.knockX * dt;
      enemy.y += enemy.knockY * dt;
      enemy.knockX *= Math.pow(0.001, dt);
      enemy.knockY *= Math.pow(0.001, dt);

      const dx = p.x - enemy.x;
      const dy = p.y - enemy.y;
      const rr = p.r + enemy.r;
      if (dx * dx + dy * dy < rr * rr && enemy.contactCd <= 0) {
        if (enemy.kind === "bomber") {
          explode(enemy.x, enemy.y, 66, enemy.dmg * 1.15, "#ff9f43", true);
          killEnemy(enemy, true);
        } else {
          damagePlayer(enemy.dmg);
          enemy.contactCd = enemy.boss ? 0.65 : 0.82;
        }
      }
    }
    game.enemies = game.enemies.filter((e) => !e.dead);
  }

  function updateNormalEnemy(enemy, dt) {
    const p = game.player;
    const dx = p.x - enemy.x;
    const dy = p.y - enemy.y;
    const n = normalize(dx, dy);
    let speed = enemy.speed;
    speed *= slowMultiplier(enemy);
    if (enemy.kind === "golem" && dx * dx + dy * dy < 210 * 210) speed *= 1.85;
    if (enemy.kind === "bat") {
      const side = Math.sin(game.t * 7 + enemy.phase) * 0.58;
      enemy.x += (-n.y * side) * speed * dt;
      enemy.y += (n.x * side) * speed * dt;
    }
    enemy.x += n.x * speed * dt;
    enemy.y += n.y * speed * dt;
  }

  function updateBoss(enemy, dt) {
    if (enemy.bossType === "brute") updateBrute(enemy, dt);
    if (enemy.bossType === "reaper") updateReaper(enemy, dt);
  }

  function updateBrute(enemy, dt) {
    const p = game.player;
    const hpPct = enemy.hp / enemy.maxHp;
    const speedMult = hpPct < 0.5 ? 1.18 : 1;
    if (enemy.state === "walk") {
      moveToward(enemy, p.x, p.y, enemy.speed * speedMult * 0.72, dt);
      enemy.attackTimer -= dt;
      if (enemy.attackTimer <= 0) {
        if (Math.random() < 0.58) startBruteCharge(enemy);
        else startBruteWave(enemy);
      }
    } else if (enemy.state === "windCharge") {
      enemy.stateTimer -= dt;
      if (enemy.stateTimer <= 0) {
        enemy.state = "charge";
        enemy.stateTimer = 0.58;
        enemy.vx = enemy.chargeX * 520 * speedMult;
        enemy.vy = enemy.chargeY * 520 * speedMult;
        game.shake = Math.max(game.shake, 8);
      }
    } else if (enemy.state === "charge") {
      enemy.x += enemy.vx * dt;
      enemy.y += enemy.vy * dt;
      if (Math.abs(enemy.vx) > 1) enemy.faceX = enemy.vx < 0 ? -1 : 1;
      enemy.stateTimer -= dt;
      if (enemy.stateTimer <= 0) {
        enemy.vx = 0;
        enemy.vy = 0;
        enemy.state = "walk";
        enemy.attackTimer = hpPct < 0.5 ? 1.15 : 1.55;
      }
    } else if (enemy.state === "windWave") {
      enemy.stateTimer -= dt;
      if (enemy.stateTimer <= 0) {
        radialBossShots(enemy, 17, 190, 11, 1);
        enemy.state = "walk";
        enemy.attackTimer = hpPct < 0.5 ? 1.0 : 1.45;
      }
    }
  }

  function startBruteCharge(enemy) {
    const p = game.player;
    const n = normalize(p.x - enemy.x, p.y - enemy.y);
    enemy.chargeX = n.x;
    enemy.chargeY = n.y;
    enemy.state = "windCharge";
    enemy.stateTimer = 0.62;
    game.telegraphs.push({
      type: "line",
      x: enemy.x,
      y: enemy.y,
      dx: n.x,
      dy: n.y,
      width: 86,
      length: 700,
      life: 0.62,
      max: 0.62,
      color: "#ff6b5d"
    });
  }

  function startBruteWave(enemy) {
    enemy.state = "windWave";
    enemy.stateTimer = 0.68;
    game.telegraphs.push({
      type: "circle",
      x: enemy.x,
      y: enemy.y,
      r: 120,
      life: 0.68,
      max: 0.68,
      color: "#ffba49"
    });
  }

  function updateReaper(enemy, dt) {
    const p = game.player;
    const hpPct = enemy.hp / enemy.maxHp;
    const speedMult = hpPct < 0.5 ? 1.18 : 1;
    moveToward(enemy, p.x, p.y, enemy.speed * 0.55 * speedMult, dt);
    enemy.attackTimer -= dt;
    if (enemy.attackTimer > 0) return;
    const roll = Math.random();
    if (roll < 0.42) {
      for (let i = 0; i < 7; i += 1) {
        const a = Math.random() * TAU;
        const d = rand(80, 330);
        game.telegraphs.push({
          type: "meteor",
          x: p.x + Math.cos(a) * d,
          y: p.y + Math.sin(a) * d,
          r: rand(34, 48),
          life: 1.15,
          max: 1.15,
          color: "#ff745d",
          dmg: 22
        });
      }
    } else if (roll < 0.72) {
      for (let i = 0; i < 4; i += 1) {
        queueSpawn("skeleton", rand(180, 300), (i / 4) * TAU + Math.random() * 0.4, 0.32);
      }
    } else {
      game.telegraphs.push({
        type: "circle",
        x: enemy.x,
        y: enemy.y,
        r: 175,
        life: 0.72,
        max: 0.72,
        color: "#b985ff",
        pulse: true,
        dmg: 18
      });
    }
    enemy.attackTimer = hpPct < 0.5 ? 1.05 : 1.55;
  }

  function moveToward(entity, x, y, speed, dt) {
    const n = normalize(x - entity.x, y - entity.y);
    const slow = slowMultiplier(entity);
    entity.x += n.x * speed * slow * dt;
    entity.y += n.y * speed * slow * dt;
    if (Math.abs(n.x) > 0.05) entity.faceX = n.x < 0 ? -1 : 1;
  }

  function slowMultiplier(entity) {
    return entity.slow > 0 ? 0.55 : 1;
  }

  function radialBossShots(enemy, count, speed, damage, gapEvery = 0) {
    const offset = Math.random() * TAU;
    for (let i = 0; i < count; i += 1) {
      if (gapEvery && i % 7 === 0) continue;
      const a = offset + (i / count) * TAU;
      game.enemyProjectiles.push({
        x: enemy.x,
        y: enemy.y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        r: 8,
        dmg: damage,
        life: 5,
        color: "#ffba49"
      });
    }
  }

  function updateWeapons(dt) {
    const weapons = game.player.weapons;
    for (const id of Object.keys(weapons)) {
      const state = weapons[id];
      state.timer -= dt;
      if (id === "shadow") {
        updateMinions(dt, state.level);
        continue;
      }
      if (id === "aura") {
        updateAura(dt, state);
      }
      if (state.timer <= 0) {
        fireWeapon(id, state.level);
        state.timer += weaponCooldown(id, state.level);
      }
    }
  }

  function fireWeapon(id, level) {
    const def = WEAPONS[id];
    if (def.type === "slash") return fireSword(id, level);
    if (def.type === "spin") return fireScythe(id, level);
    if (def.type === "aura") return;

    const target = nearestEnemy(def.range);
    if (!target) return;
    const p = game.player;
    const baseAngle = Math.atan2(target.y - p.y, target.x - p.x);
    let count = projectileCount(level);
    if (id === "bow") count += Math.floor(level / 3);
    if (id === "arcane" && level >= 5) count += 2;
    count = Math.min(count, 10);
    const spread = count <= 1 ? 0 : Math.min(0.75, 0.14 * (count - 1));

    for (let i = 0; i < count; i += 1) {
      const t = count <= 1 ? 0 : i / (count - 1) - 0.5;
      const angle = baseAngle + t * spread;
      const dmg = weaponDamage(id, level, target);
      createProjectile({
        weapon: id,
        x: p.x + Math.cos(angle) * 17,
        y: p.y + Math.sin(angle) * 17,
        vx: Math.cos(angle) * def.speed,
        vy: Math.sin(angle) * def.speed,
        damage: dmg.value,
        crit: dmg.crit,
        range: def.range + level * 12,
        size: id === "fire" ? 9 : 6,
        color: def.color,
        pierce: id === "bow" ? 1 + Math.floor(level / 3) : 0,
        explode: id === "fire" ? 48 + level * 4 : 0,
        bounces: id === "ricochet" ? 3 + Math.floor(level / 2) : 0,
        burn: id === "fire" || game.character.id === "piromante"
      });
    }
  }

  function createProjectile(data) {
    game.projectiles.push({
      ...data,
      fromPlayer: true,
      travelled: 0,
      dead: false,
      hits: new Set()
    });
  }

  function fireSword(id, level) {
    const p = game.player;
    const angle = angleToNearest() ?? Math.atan2(p.lastDirY, p.lastDirX);
    const radius = WEAPONS[id].range + level * 5;
    game.slashes.push({ x: p.x, y: p.y, angle, radius, life: 0.16, max: 0.16, color: WEAPONS[id].color, arc: 1.65 });
    for (const enemy of game.enemies) {
      if (enemy.dead) continue;
      const dx = enemy.x - p.x;
      const dy = enemy.y - p.y;
      if (dx * dx + dy * dy > (radius + enemy.r) ** 2) continue;
      const a = Math.atan2(dy, dx);
      const diff = Math.abs(angleDiff(angle, a));
      if (diff < 1.45) {
        const dmg = weaponDamage(id, level, enemy);
        damageEnemy(enemy, dmg.value, { x: p.x, y: p.y, crit: dmg.crit, knock: 330, color: WEAPONS[id].color });
      }
    }
    game.shake = Math.max(game.shake, 2.5);
  }

  function fireScythe(id, level) {
    const p = game.player;
    const radius = WEAPONS[id].range + level * 6;
    game.slashes.push({ x: p.x, y: p.y, angle: game.t * 5, radius, life: 0.2, max: 0.2, color: WEAPONS[id].color, arc: TAU });
    for (const enemy of game.enemies) {
      if (enemy.dead) continue;
      const rr = radius + enemy.r;
      if (distSq(enemy, p) <= rr * rr) {
        const dmg = weaponDamage(id, level, enemy);
        damageEnemy(enemy, dmg.value, { x: p.x, y: p.y, crit: dmg.crit, knock: 210, color: WEAPONS[id].color });
      }
    }
  }

  function updateAura(dt, state) {
    const p = game.player;
    const radius = WEAPONS.aura.range + state.level * 8;
    state.auraPulse = (state.auraPulse || 0) + dt;
    if (state.timer > 0) return;
    for (const enemy of game.enemies) {
      const rr = radius + enemy.r;
      if (!enemy.dead && distSq(enemy, p) <= rr * rr) {
        const dmg = weaponDamage("aura", state.level, enemy);
        damageEnemy(enemy, dmg.value, { x: p.x, y: p.y, crit: dmg.crit, knock: 80, color: WEAPONS.aura.color, noHitStop: true });
      }
    }
  }

  function updateMinions(dt, level) {
    const p = game.player;
    const desired = level >= 8 ? 2 : 1;
    game.player.minionsWanted = desired;
    while ((game.minions || []).length < desired) {
      if (!game.minions) game.minions = [];
      const angle = Math.random() * TAU;
      game.minions.push({
        x: p.x + Math.cos(angle) * 42,
        y: p.y + Math.sin(angle) * 42,
        r: 12,
        timer: rand(0.1, 0.3),
        phase: Math.random() * TAU
      });
    }
    if (!game.minions) return;
    for (const minion of game.minions) {
      const homeX = p.x - p.lastDirX * 44 + Math.cos(minion.phase) * 28;
      const homeY = p.y - p.lastDirY * 44 + Math.sin(minion.phase) * 28;
      moveToward(minion, homeX, homeY, 210, dt);
      minion.timer -= dt;
      if (minion.timer <= 0) {
        minion.timer = 0.5;
        const target = nearestEnemy(170, minion);
        if (target) {
          const dmg = (8 + p.level * 2) * getDamageMult(target);
          damageEnemy(target, dmg, { x: minion.x, y: minion.y, knock: 120, color: WEAPONS.shadow.color });
        }
      }
    }
  }

  function angleToNearest() {
    const target = nearestEnemy(380);
    if (!target) return null;
    return Math.atan2(target.y - game.player.y, target.x - game.player.x);
  }

  function angleDiff(a, b) {
    return Math.atan2(Math.sin(b - a), Math.cos(b - a));
  }

  function nearestEnemy(range, from = game.player) {
    let best = null;
    let bestD = range * range;
    for (const enemy of game.enemies) {
      if (enemy.dead) continue;
      const d = distSq(enemy, from);
      if (d < bestD) {
        bestD = d;
        best = enemy;
      }
    }
    return best;
  }

  function updateProjectiles(dt) {
    for (const proj of game.projectiles) {
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      const step = Math.hypot(proj.vx * dt, proj.vy * dt);
      proj.travelled += step;
      if (proj.travelled > proj.range) proj.dead = true;
      if (proj.dead) continue;

      for (const enemy of game.enemies) {
        if (enemy.dead || proj.hits.has(enemy.id)) continue;
        const rr = enemy.r + proj.size;
        if (distSq(enemy, proj) <= rr * rr) {
          proj.hits.add(enemy.id);
          if (proj.explode) {
            explode(proj.x, proj.y, proj.explode, proj.damage, proj.color, false, proj.crit);
            proj.dead = true;
            break;
          }

          damageEnemy(enemy, proj.damage, {
            x: proj.x - proj.vx * 0.02,
            y: proj.y - proj.vy * 0.02,
            crit: proj.crit,
            knock: 160,
            color: proj.color
          });
          if (proj.burn && Math.random() < 0.55) {
            enemy.burn = Math.max(enemy.burn, 2.4);
          }
          if (proj.bounces > 0) {
            const next = nearestBounceTarget(enemy, proj.hits, 240);
            if (next) {
              const n = normalize(next.x - proj.x, next.y - proj.y);
              const speed = Math.hypot(proj.vx, proj.vy);
              proj.vx = n.x * speed;
              proj.vy = n.y * speed;
              proj.damage *= 0.82;
              proj.bounces -= 1;
              break;
            }
          }
          proj.pierce -= 1;
          if (proj.pierce < 0) {
            proj.dead = true;
            break;
          }
        }
      }
    }
    game.projectiles = game.projectiles.filter((p) => !p.dead);
  }

  function nearestBounceTarget(fromEnemy, hitSet, range) {
    let best = null;
    let bestD = range * range;
    for (const enemy of game.enemies) {
      if (enemy.dead || hitSet.has(enemy.id)) continue;
      const d = distSq(enemy, fromEnemy);
      if (d < bestD) {
        best = enemy;
        bestD = d;
      }
    }
    return best;
  }

  function updateEnemyProjectiles(dt) {
    const p = game.player;
    for (const proj of game.enemyProjectiles) {
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.life -= dt;
      if (proj.life <= 0) proj.dead = true;
      const rr = p.r + proj.r;
      if (!proj.dead && distSq(proj, p) <= rr * rr) {
        damagePlayer(proj.dmg);
        proj.dead = true;
      }
    }
    game.enemyProjectiles = game.enemyProjectiles.filter((p) => !p.dead);

    for (const tele of game.telegraphs) {
      tele.life -= dt;
      if (tele.life <= 0) {
        if (tele.type === "meteor") {
          explode(tele.x, tele.y, tele.r + 22, tele.dmg, "#ff745d", true);
          tele.dead = true;
        } else if (tele.pulse) {
          const rr = tele.r + p.r;
          if (distSq(tele, p) <= rr * rr) damagePlayer(tele.dmg || 18);
          radialBossShots(tele, 21, 210, 12, 1);
          tele.dead = true;
        } else {
          tele.dead = true;
        }
      }
    }
    game.telegraphs = game.telegraphs.filter((t) => !t.dead);
  }

  function explode(x, y, radius, damage, color, hurtsPlayer, crit = false) {
    for (let i = 0; i < 18; i += 1) {
      addParticle(x, y, color, rand(1.8, 4.4), rand(80, 260), Math.random() * TAU, rand(0.22, 0.5));
    }
    game.shake = Math.max(game.shake, hurtsPlayer ? 7 : 4);
    for (const enemy of game.enemies) {
      if (enemy.dead) continue;
      const rr = radius + enemy.r;
      if (distSq(enemy, { x, y }) <= rr * rr) {
        damageEnemy(enemy, damage, { x, y, crit, knock: 260, color });
        if (color !== "#ff745d" && Math.random() < 0.55) enemy.burn = Math.max(enemy.burn, 2.5);
      }
    }
    if (hurtsPlayer) {
      const p = game.player;
      const rr = radius + p.r;
      if (distSq(p, { x, y }) <= rr * rr) damagePlayer(damage);
    }
  }

  function damageEnemy(enemy, amount, opts = {}) {
    if (!enemy || enemy.dead) return;
    const final = Math.max(1, amount);
    enemy.hp -= final;
    enemy.hitFlash = 1;
    enemy.squash = 1;
    if (opts.knock && !enemy.boss) {
      const source = opts.x !== undefined ? opts : game.player;
      const n = normalize(enemy.x - source.x, enemy.y - source.y);
      enemy.knockX += n.x * opts.knock;
      enemy.knockY += n.y * opts.knock;
    }
    if (!opts.dot) {
      const color = opts.crit ? "#ffd166" : opts.color || "#fffdf6";
      addText(enemy.x + rand(-4, 4), enemy.y - enemy.r - 8, Math.round(final), color, opts.crit ? 1.42 : 1);
      for (let i = 0; i < (opts.crit ? 7 : 4); i += 1) {
        const a = Math.atan2(enemy.y - (opts.y || game.player.y), enemy.x - (opts.x || game.player.x)) + rand(-0.7, 0.7);
        addParticle(enemy.x, enemy.y, opts.color || enemy.color, rand(1.5, 3.2), rand(60, 170), a, rand(0.16, 0.32));
      }
      if (!opts.noAudio && audio) audio.hit();
      if (!opts.noHitStop && (opts.crit || final > 18) && game.hitStopCd <= 0) {
        game.hitStop = Math.max(game.hitStop, 0.06);
        game.hitStopCd = 0.34;
      }
    }
    maybeApplySlow(enemy, opts);
    if (enemy.hp <= 0) {
      killEnemy(enemy);
    }
  }

  function maybeApplySlow(enemy, opts) {
    const frost = toolLevel("frost");
    if (!frost || opts.dot || enemy.dead || enemy.hp <= 0) return;
    const chance = 0.12 + frost * 0.045;
    if (Math.random() < chance) {
      enemy.slow = Math.max(enemy.slow, 0.85 + frost * 0.16);
    }
  }

  function killEnemy(enemy, noDrop = false) {
    if (enemy.dead) return;
    enemy.dead = true;
    game.killCount += enemy.boss ? 0 : 1;
    spawnDeath(enemy);
    spawnAsh(enemy);
    game.shake = Math.max(game.shake, enemy.boss ? 14 : enemy.kind === "golem" ? 4 : 1.7);
    if (audio) {
      if (enemy.boss) audio.boss();
      else audio.kill();
    }
    if (!noDrop) {
      dropGem(enemy.x, enemy.y, enemy.xp + (enemy.boss ? 30 : 0));
      if (!enemy.boss && Math.random() < 0.3) dropGold(enemy.x, enemy.y, 4);
    }
    if (enemy.kind === "bomber" && !noDrop) {
      explode(enemy.x, enemy.y, 58, enemy.dmg * 0.7, "#ff9f43", true);
    }
    if (game.character.id === "vampiro" && !enemy.boss) {
      const heal = 2 + game.player.level * 0.3;
      if (game.healBucket < 16) {
        game.healBucket += heal;
        healPlayer(heal);
      }
    }
    if (enemy.bossType === "brute") {
      game.boss1Defeated = true;
      game.calmTimer = 6;
      showToast("Boss derrotado", 2);
      cgHappytime();
    }
    if (enemy.bossType === "reaper") {
      game.victory = true;
      endRun(true);
    }
  }

  function damagePlayer(amount) {
    const p = game.player;
    if (p.invuln > 0 || mode !== "playing") return;
    const t = clamp(game.t / 360, 0, 1);
    const late = lerp(1, 2.5, t * t * (3 - 2 * t));
    const earlySafety = game.t < 60 ? lerp(0.54, 1, game.t / 60) : 1;
    let dmg = amount * game.map.dmgMult * late * earlySafety;
    dmg *= 1 - Math.min(0.38, toolLevel("armor") * 0.055);
    if (game.character.id === "cavalheiro") dmg *= 0.85;
    p.hp -= dmg;
    p.invuln = 0.26;
    game.shake = Math.max(game.shake, 7);
    addText(p.x, p.y - 32, Math.round(dmg), "#ff5e6f", 1.15);
    if (audio) audio.playerHit();
  }

  function healPlayer(amount) {
    const p = game.player;
    const before = p.hp;
    p.hp = Math.min(p.maxHp, p.hp + amount);
    const healed = p.hp - before;
    if (healed > 0) {
      addText(p.x + rand(-8, 8), p.y - 34, `+${Math.round(healed)}`, "#4bd275", 1.08);
      for (let i = 0; i < 5; i += 1) addParticle(p.x, p.y, "#4bd275", rand(2, 4), rand(45, 120), Math.random() * TAU, 0.35);
    }
  }

  function dropGem(x, y, value) {
    const a = Math.random() * TAU;
    game.gems.push({
      x,
      y,
      vx: Math.cos(a) * rand(50, 150),
      vy: Math.sin(a) * rand(50, 150),
      value,
      r: 7,
      bounce: 1
    });
  }

  function dropGold(x, y, value) {
    const a = Math.random() * TAU;
    game.goldDrops.push({
      x,
      y,
      vx: Math.cos(a) * rand(40, 120),
      vy: Math.sin(a) * rand(40, 120),
      value,
      r: 7
    });
  }

  function updateDrops(dt) {
    const p = game.player;
    const magnet = 118 + p.level * 3;
    for (const gem of game.gems) {
      const dx = p.x - gem.x;
      const dy = p.y - gem.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < magnet * magnet) {
        const n = normalize(dx, dy);
        const d = Math.sqrt(d2);
        const pullSpeed = clamp(460 + (magnet - d) * 6.5, 460, 1120);
        const pull = clamp(dt * 10, 0, 1);
        gem.vx = lerp(gem.vx, n.x * pullSpeed, pull);
        gem.vy = lerp(gem.vy, n.y * pullSpeed, pull);
      }
      gem.x += gem.vx * dt;
      gem.y += gem.vy * dt;
      gem.vx *= Math.pow(0.04, dt);
      gem.vy *= Math.pow(0.04, dt);
      if (distSq(p, gem) < (p.r + gem.r + 12) ** 2) {
        p.xp += gem.value;
        gem.dead = true;
        addParticle(gem.x, gem.y, "#62b5ff", 3, 120, -Math.PI / 2, 0.25);
        if (audio) audio.pickup();
      }
    }
    for (const gold of game.goldDrops) {
      const dx = p.x - gold.x;
      const dy = p.y - gold.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < (magnet + 24) ** 2) {
        const n = normalize(dx, dy);
        const d = Math.sqrt(d2);
        const pullSpeed = clamp(380 + (magnet + 24 - d) * 5.2, 380, 920);
        const pull = clamp(dt * 8, 0, 1);
        gold.vx = lerp(gold.vx, n.x * pullSpeed, pull);
        gold.vy = lerp(gold.vy, n.y * pullSpeed, pull);
      }
      gold.x += gold.vx * dt;
      gold.y += gold.vy * dt;
      gold.vx *= Math.pow(0.04, dt);
      gold.vy *= Math.pow(0.04, dt);
      if (distSq(p, gold) < (p.r + gold.r + 12) ** 2) {
        game.gold += gold.value;
        gold.dead = true;
        addText(gold.x, gold.y - 10, `+${gold.value}`, "#ffd166", 0.86);
        if (audio) audio.pickup();
      }
    }
    game.gems = game.gems.filter((g) => !g.dead);
    game.goldDrops = game.goldDrops.filter((g) => !g.dead);
  }

  function updateEffects(dt) {
    for (const p of game.particles) {
      p.life -= dt;
      if (p.grav) {
        p.vy += p.grav * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.floorY != null && p.y >= p.floorY) {
          p.y = p.floorY;
          p.vy = 0;
          p.vx *= Math.pow(0.0002, dt); // pousou: para de deslizar
        } else {
          p.vx *= Math.pow(0.4, dt); // arrasto leve no ar
        }
      } else {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= Math.pow(0.02, dt);
        p.vy *= Math.pow(0.02, dt);
      }
    }
    if (game.deaths) {
      for (const d of game.deaths) d.life -= dt;
      game.deaths = game.deaths.filter((d) => d.life > 0);
    }
    for (const text of game.texts) {
      text.life -= dt;
      text.y -= 42 * dt;
      text.scale += 0.8 * dt;
    }
    for (const slash of game.slashes) {
      slash.life -= dt;
    }
    for (const trail of game.trails) {
      trail.life -= dt;
    }
    game.particles = game.particles.filter((p) => p.life > 0);
    game.texts = game.texts.filter((t) => t.life > 0);
    game.slashes = game.slashes.filter((s) => s.life > 0);
    game.trails = game.trails.filter((t) => t.life > 0);
  }

  function addParticle(x, y, color, size, speed, angle, life) {
    game.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      size,
      life,
      max: life,
      rot: Math.random() * TAU
    });
  }

  // Snapshot do sprite no instante da morte para redesenha-lo em branco sumindo
  // (o "vira po"). Vida curtissima (~0.16s) e custo de 1 drawImage por morte.
  function spawnDeath(enemy) {
    let sheet;
    let frame;
    let drawSize;
    let sourceSize;
    let yOff;
    let flip;
    if (enemy.boss) {
      sheet = sprites.bosses[enemy.bossType];
      const animSpeed = enemy.state && enemy.state.startsWith("wind") ? 12 : 7;
      frame = Math.floor(game.t * animSpeed + enemy.phase) % 4;
      drawSize = enemy.bossType === "reaper" ? 158 : 176;
      sourceSize = 160;
      yOff = -drawSize / 2 - 14;
      flip = enemy.faceX < 0;
    } else {
      sheet = sprites.enemies[enemy.kind];
      frame = Math.floor(game.t * 8 + enemy.phase) % 2;
      drawSize = enemy.kind === "golem" ? 62 : enemy.kind === "bat" ? 52 : enemy.kind === "bomber" ? 50 : enemy.kind === "slime" ? 50 : 48;
      sourceSize = 80;
      yOff = -drawSize / 2 - 5;
      flip = game.player.x < enemy.x;
    }
    if (!ready(sheet)) return; // sem sprite (formas vetoriais): so as cinzas
    const life = enemy.boss ? 0.24 : 0.16;
    game.deaths.push({ x: enemy.x, y: enemy.y, sheet, frame, drawSize, sourceSize, yOff, flip, life, max: life });
  }

  // Cinzas em cubo: sobem de leve, caem com gravidade e assentam no chao,
  // desbotando. Reaproveita o array de particulas (sem custo extra de memoria).
  function spawnAsh(enemy) {
    const count = enemy.boss ? 14 : 6;
    const feet = enemy.y + enemy.r;
    for (let i = 0; i < count; i += 1) {
      const ang = -Math.PI / 2 + rand(-0.9, 0.9);
      const spd = rand(40, enemy.boss ? 170 : 115);
      const life = rand(0.32, enemy.boss ? 0.7 : 0.6);
      const color = i % 4 === 0 ? enemy.color : (i % 2 ? "#565656" : "#3d3d3d");
      game.particles.push({
        x: enemy.x + rand(-enemy.r * 0.5, enemy.r * 0.5),
        y: enemy.y + rand(-enemy.r * 0.4, 0),
        vx: Math.cos(ang) * spd * 0.45 + rand(-26, 26),
        vy: Math.sin(ang) * spd,
        color,
        size: rand(1.5, enemy.boss ? 4 : 2.8),
        life,
        max: life,
        rot: Math.random() * TAU,
        grav: rand(440, 640),
        floorY: feet + rand(-2, enemy.r * 0.4)
      });
    }
  }

  function addText(x, y, text, color, scale = 1) {
    game.texts.push({
      x,
      y,
      text: String(text),
      color,
      scale,
      life: 0.74,
      max: 0.74
    });
  }

  function levelUp() {
    const p = game.player;
    p.xp -= p.nextXp;
    p.level += 1;
    p.nextXp = Math.round(5 + p.level * 4 + p.level * p.level * 1.1);
    p.maxHp += 1.4;
    p.hp = Math.min(p.maxHp, p.hp + 7);
    mode = "levelup";
    game.choices = buildChoices();
    game.cardAuto = 5.5;
    el.levelScreen.classList.remove("is-hidden");
    renderCards();
    showToast(`Level ${p.level}`, 1.1);
    if (audio) audio.level();
    for (let i = 0; i < 28; i += 1) {
      addParticle(p.x, p.y, game.character.color, rand(3, 6), rand(140, 360), Math.random() * TAU, rand(0.45, 0.85));
    }
    for (let i = 0; i < 14; i += 1) {
      addParticle(p.x, p.y, "#ffd166", rand(2.5, 5), rand(200, 420), Math.random() * TAU, rand(0.35, 0.7));
    }
  }

  function pickRarity() {
    const luck = (toolLevel("luck") || 0) + Number(save.upgrades.luck || 0);
    const list = RARITIES.map((r) => ({
      ...r,
      weight: r.weight + (r.id === "rare" ? luck * 2.5 : r.id === "epic" ? luck * 1.2 : r.id === "legendary" ? luck * 0.45 : 0)
    }));
    return weighted(list);
  }

  function rarityBonusPct(rarity) {
    return RARITY_BONUS_PCT[rarity.id] || RARITY_BONUS_PCT.common;
  }

  function rarityHealAmount(rarity) {
    return Math.round(14 * (1 + rarityBonusPct(rarity) / 100));
  }

  function buildChoices() {
    const choices = [];
    const ownedWeapons = Object.keys(game.player.weapons);
    const openWeaponSlots = ownedWeapons.length < maxWeaponSlots();
    const ownedTools = Object.keys(game.player.tools);
    const openToolSlots = ownedTools.length < maxToolSlots();
    const weaponPool = unlockedWeaponIds();

    const candidates = [];
    for (const id of ownedWeapons) {
      if (weaponLevel(id) < 25) candidates.push({ kind: "weapon", id, weight: 44 });
    }
    if (openWeaponSlots) {
      for (const id of weaponPool) {
        if (!game.player.weapons[id]) candidates.push({ kind: "weapon", id, weight: 20 });
      }
    }
    for (const id of ownedTools) {
      if (toolLevel(id) < 5) candidates.push({ kind: "tool", id, weight: 24 });
    }
    if (openToolSlots) {
      for (const id of Object.keys(TOOLS)) {
        if (!game.player.tools[id]) candidates.push({ kind: "tool", id, weight: 18 });
      }
    }
    candidates.push({ kind: "heal", id: "heal", weight: game.player.hp < game.player.maxHp * 0.55 ? 40 : 8 });

    while (choices.length < 3 && candidates.length) {
      const candidate = weighted(candidates);
      const idx = candidates.indexOf(candidate);
      if (idx >= 0) candidates.splice(idx, 1);
      const rarity = pickRarity();
      choices.push(makeChoice(candidate, rarity));
    }
    return choices;
  }

  function makeChoice(candidate, rarity) {
    if (candidate.kind === "weapon") {
      const def = WEAPONS[candidate.id];
      const owned = weaponLevel(candidate.id);
      const next = owned ? Math.min(25, owned + 1) : 1;
      return {
        ...candidate,
        rarity,
        icon: UPGRADE_ICON_BY_ID[candidate.id] || "bolt",
        title: owned ? `${def.name} Lv${next}` : def.name,
        desc: owned ? `+${rarityBonusPct(rarity)}% de impacto` : "Nova arma automatica",
        apply() {
          upgradeWeapon(candidate.id);
        }
      };
    }
    if (candidate.kind === "tool") {
      const def = TOOLS[candidate.id];
      return {
        ...candidate,
        rarity,
        icon: UPGRADE_ICON_BY_ID[candidate.id] || candidate.id,
        title: `${def.name} Lv${toolLevel(candidate.id) + 1}`,
        desc: `${def.desc} Bonus ${rarityBonusPct(rarity)}%.`,
        apply() {
          addTool(candidate.id);
        }
      };
    }
    const healAmount = rarityHealAmount(rarity);
    return {
      ...candidate,
      rarity,
      icon: "heal",
      title: "Cura",
      desc: `Recupera ${healAmount} HP agora.`,
      apply() {
        healPlayer(healAmount);
      }
    };
  }

  function renderCards() {
    el.cardGrid.innerHTML = "";
    game.choices.forEach((choice, index) => {
      const button = document.createElement("button");
      button.className = "upgradeCard";
      button.style.setProperty("--rarity-color", choice.rarity.color);
      const iconIndex = UPGRADE_ICON_INDEX[choice.icon] ?? UPGRADE_ICON_INDEX.heal;
      button.style.setProperty("--icon-x", `${(iconIndex % 4) * -64}px`);
      button.style.setProperty("--icon-y", `${Math.floor(iconIndex / 4) * -64}px`);
      button.innerHTML = `
        <span class="upgradeTop">
          <span class="upgradeIcon" aria-hidden="true"></span>
          <strong>${choice.title}</strong>
        </span>
        <span class="upgradeDesc">${choice.desc}</span>
        <small>${index + 1} - ${choice.rarity.name}</small>
      `;
      button.addEventListener("click", () => applyChoice(index));
      el.cardGrid.appendChild(button);
    });
  }

  function applyChoice(index) {
    if (mode !== "levelup" || !game.choices[index]) return;
    game.choices[index].apply();
    game.choices = [];
    el.levelScreen.classList.add("is-hidden");
    mode = "playing";
    updateHud();
  }

  function updateLevelScreen(dt) {
    if (mode !== "levelup" || !game) return;
    game.cardAuto -= dt;
    if (game.cardAuto <= 0) applyChoice(0);
  }

  function updateHud() {
    if (!game) return;
    const p = game.player;
    el.hpFill.style.width = `${clamp((p.hp / p.maxHp) * 100, 0, 100)}%`;
    el.hpText.textContent = `${Math.max(0, Math.ceil(p.hp))}/${Math.ceil(p.maxHp)}`;
    el.xpFill.style.width = `${clamp((p.xp / p.nextXp) * 100, 0, 100)}%`;
    el.levelText.textContent = String(p.level);
    el.timeText.textContent = formatTime(game.t);
    el.killText.textContent = `${game.killCount} KOs`;
    el.goldText.textContent = `${game.gold} ouro`;

    const items = [];
    for (const [id, state] of Object.entries(p.weapons)) items.push({ code: WEAPONS[id].code, level: state.level, color: WEAPONS[id].color });
    for (const [id, level] of Object.entries(p.tools)) items.push({ code: TOOLS[id].code, level, color: "#d9f6c5" });
    el.loadout.innerHTML = items.map((item) => `<div class="loadoutItem" style="background:${item.color}">${item.code}<i>${item.level}</i></div>`).join("");
  }

  function draw() {
    ctx.clearRect(0, 0, viewW, viewH);
    if (!game) {
      drawMenuField();
      return;
    }

    const p = game.player;
    const shake = game.shake > 0 ? game.shake : 0;
    const sx = shake ? rand(-shake, shake) : 0;
    const sy = shake ? rand(-shake, shake) : 0;
    const camX = p.x - viewW / 2 + sx;
    const camY = p.y - viewH / 2 + sy;

    ctx.save();
    ctx.translate(-camX, -camY);
    drawGround(camX, camY);
    drawSpawnMarks();
    drawTelegraphs();
    drawDrops();
    drawTrails();
    drawSlashes();
    drawProjectiles();
    drawShadows();
    drawEnemies();
    drawDeaths();
    drawMinions();
    drawPlayer();
    drawEnemyProjectiles();
    drawParticles();
    drawDamageTexts();
    ctx.restore();

    drawBossArrows(camX, camY);
  }

  function drawMenuField() {
    const fakeCamX = -viewW / 2;
    const fakeCamY = -viewH / 2;
    const fakeMap = MAPS[0];
    ctx.fillStyle = fakeMap.bg;
    ctx.fillRect(0, 0, viewW, viewH);
    ctx.save();
    ctx.translate(-fakeCamX, -fakeCamY);
    drawGround(fakeCamX, fakeCamY, fakeMap);
    ctx.restore();
  }

  function drawGround(camX, camY, overrideMap = null) {
    const map = overrideMap || game.map;
    const mapTexture = sprites.maps[map.tileKey];
    if (ready(mapTexture) && mapTexture.width > 256) {
      const tw = mapTexture.width;
      const th = mapTexture.height;
      const startX = Math.floor((camX - 100) / tw) * tw;
      const startY = Math.floor((camY - 100) / th) * th;
      ctx.fillStyle = map.bg;
      ctx.fillRect(camX - 100, camY - 100, viewW + 200, viewH + 200);
      for (let y = startY; y < camY + viewH + 100; y += th) {
        for (let x = startX; x < camX + viewW + 100; x += tw) {
          ctx.drawImage(mapTexture, x, y, tw, th);
        }
      }
      return;
    }

    const left = Math.floor((camX - 80) / 64) - 1;
    const right = Math.ceil((camX + viewW + 80) / 64) + 1;
    const top = Math.floor((camY - 80) / 64) - 1;
    const bottom = Math.ceil((camY + viewH + 80) / 64) + 1;
    ctx.fillStyle = map.bg;
    ctx.fillRect(camX - 100, camY - 100, viewW + 200, viewH + 200);

    for (let ty = top; ty <= bottom; ty += 1) {
      for (let tx = left; tx <= right; tx += 1) {
        const h = hash2(tx, ty);
        const tileSheet = sprites.maps[map.tileKey];
        const variant = Math.floor(h * 4) % 4;
        if (ready(tileSheet)) {
          spriteFrame(tileSheet, 64, 64, variant, tx * 64, ty * 64);
        } else {
          ctx.fillStyle = h > 0.5 ? map.tileA : map.tileB;
          ctx.globalAlpha = 0.45;
          ctx.fillRect(tx * 64, ty * 64, 64, 64);
          ctx.globalAlpha = 1;
        }

        if (h < 0.045) drawDecoration(tx * 64 + 18 + h * 90, ty * 64 + 18 + hash2(ty, tx) * 30, map, h);
        if (h > 0.97) drawGrassStroke(tx * 64 + 10 + h * 42, ty * 64 + 10 + hash2(tx + 9, ty - 2) * 42, map);
      }
    }
  }

  function drawDecoration(x, y, map, h) {
    ctx.save();
    ctx.translate(x, y);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#213326";
    if (map.deco === "flowers") {
      ctx.fillStyle = h < 0.08 ? "#ff8a6c" : "#ffd166";
      for (let i = 0; i < 4; i += 1) {
        const a = i * Math.PI / 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * 4, Math.sin(a) * 4, 3.5, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = "#5faf62";
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, TAU);
      ctx.fill();
    } else if (map.deco === "stumps") {
      ctx.fillStyle = "#9d7651";
      ctx.beginPath();
      ctx.roundRect(-7, -5, 14, 11, 4);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#775338";
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, TAU);
      ctx.stroke();
    } else {
      ctx.fillStyle = "#66625f";
      ctx.beginPath();
      ctx.moveTo(-8, 5);
      ctx.lineTo(-3, -7);
      ctx.lineTo(8, -4);
      ctx.lineTo(10, 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      if (h < 0.05) {
        ctx.strokeStyle = "#ff6d3d";
        ctx.beginPath();
        ctx.moveTo(-2, 6);
        ctx.lineTo(2, -5);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawGrassStroke(x, y, map) {
    ctx.strokeStyle = map.deco === "rocks" ? "rgba(80,73,70,0.22)" : "rgba(50,105,50,0.25)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    ctx.quadraticCurveTo(x + 7, y - 8, x + 13, y + 6);
    ctx.stroke();
  }

  function drawSpawnMarks() {
    for (const mark of game.spawnMarks) {
      const t = mark.t / mark.delay;
      ctx.save();
      ctx.translate(mark.x, mark.y);
      ctx.globalAlpha = 0.22 + t * 0.38;
      ctx.fillStyle = "#ff6b5d";
      ctx.strokeStyle = "#213326";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, mark.r * (0.65 + t * 0.35), mark.r * 0.55, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawTelegraphs() {
    for (const tele of game.telegraphs) {
      const t = 1 - tele.life / tele.max;
      ctx.save();
      ctx.globalAlpha = 0.2 + t * 0.46;
      ctx.fillStyle = tele.color;
      ctx.strokeStyle = "#213326";
      ctx.lineWidth = 3;
      if (tele.type === "line") {
        ctx.translate(tele.x, tele.y);
        ctx.rotate(Math.atan2(tele.dy, tele.dx));
        ctx.fillRect(0, -tele.width / 2, tele.length, tele.width);
        ctx.strokeRect(0, -tele.width / 2, tele.length, tele.width);
      } else {
        ctx.beginPath();
        ctx.arc(tele.x, tele.y, tele.r * (0.6 + t * 0.4), 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawDrops() {
    for (const gem of game.gems) {
      ctx.save();
      ctx.translate(gem.x, gem.y);
      if (!spriteFrame(sprites.drops, 24, 24, 0, -12, -12, 18, 18)) {
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = "#62b5ff";
        ctx.strokeStyle = "#213326";
        ctx.lineWidth = 2.5;
        ctx.fillRect(-gem.r, -gem.r, gem.r * 2, gem.r * 2);
        ctx.strokeRect(-gem.r, -gem.r, gem.r * 2, gem.r * 2);
      }
      ctx.restore();
    }
    for (const gold of game.goldDrops) {
      ctx.save();
      ctx.translate(gold.x, gold.y);
      if (!spriteFrame(sprites.drops, 24, 24, 1, -12, -12, 18, 18)) {
        ctx.fillStyle = "#ffd166";
        ctx.strokeStyle = "#213326";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, gold.r, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawTrails() {
    for (const trail of game.trails) {
      const a = trail.life / trail.max;
      ctx.globalAlpha = a * 0.22;
      ctx.fillStyle = trail.color;
      ctx.beginPath();
      ctx.arc(trail.x, trail.y, trail.r * (1.5 - a * 0.3), 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function drawSlashes() {
    for (const slash of game.slashes) {
      const t = slash.life / slash.max;
      ctx.save();
      ctx.translate(slash.x, slash.y);
      ctx.rotate(slash.angle);
      ctx.globalAlpha = t;
      ctx.lineCap = "round";
      ctx.lineWidth = slash.arc >= TAU ? 12 : 16;
      ctx.strokeStyle = "#213326";
      ctx.beginPath();
      if (slash.arc >= TAU) ctx.arc(0, 0, slash.radius, 0, TAU);
      else ctx.arc(0, 0, slash.radius, -slash.arc / 2, slash.arc / 2);
      ctx.stroke();
      ctx.lineWidth = slash.arc >= TAU ? 7 : 10;
      ctx.strokeStyle = slash.color;
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawProjectiles() {
    const projectileFrames = { arcane: 0, bow: 1, fire: 2, ricochet: 3, aura: 4 };
    for (const proj of game.projectiles) {
      ctx.save();
      ctx.translate(proj.x, proj.y);
      ctx.rotate(Math.atan2(proj.vy, proj.vx));
      const frame = projectileFrames[proj.weapon] ?? 0;
      if (spriteFrame(sprites.projectiles, 16, 16, frame, -8, -8, 16, 16)) {
        ctx.restore();
        continue;
      }
      ctx.fillStyle = proj.color;
      ctx.strokeStyle = "#213326";
      ctx.lineWidth = 2.5;
      if (proj.weapon === "bow" || proj.weapon === "ricochet") {
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-7, -5);
        ctx.lineTo(-3, 0);
        ctx.lineTo(-7, 5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, proj.size, 0, TAU);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawEnemyProjectiles() {
    for (const proj of game.enemyProjectiles) {
      ctx.save();
      ctx.translate(proj.x, proj.y);
      ctx.fillStyle = proj.color;
      ctx.strokeStyle = "#213326";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, proj.r, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawEnemies() {
    const sorted = [...game.enemies].sort((a, b) => a.y - b.y);
    for (const enemy of sorted) {
      if (enemy.boss) drawBoss(enemy);
      else drawEnemy(enemy);
    }
  }

  function drawEnemy(enemy) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    const bob = Math.sin(game.t * 8 + enemy.phase) * 1.5;
    ctx.translate(0, bob);
    const s = enemy.squash > 0 ? enemy.squash : 0;
    ctx.scale(1 + s * 0.12, 1 - s * 0.1);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#213326";
    ctx.fillStyle = enemy.hitFlash > 0 ? "#ffffff" : enemy.color;

    const enemySheet = sprites.enemies[enemy.kind];
    if (ready(enemySheet)) {
      const frame = Math.floor(game.t * 8 + enemy.phase) % 2;
      const drawSize = enemy.kind === "golem" ? 62 : enemy.kind === "bat" ? 52 : enemy.kind === "bomber" ? 50 : enemy.kind === "slime" ? 50 : 48;
      if (game.player.x < enemy.x) ctx.scale(-1, 1);
      ctx.filter = enemy.hitFlash > 0 ? "brightness(3.2) saturate(0)" : "none";
      spriteFrame(enemySheet, 80, 80, frame, -drawSize / 2, -drawSize / 2 - 5, drawSize, drawSize);
      ctx.filter = "none";
      drawBurnOverlay(enemy);
      drawSlowOverlay(enemy);
      drawEnemyHp(enemy);
      ctx.restore();
      return;
    }

    if (enemy.kind === "slime") {
      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.quadraticCurveTo(14, -6, 12, 7);
      ctx.quadraticCurveTo(0, 16, -12, 7);
      ctx.quadraticCurveTo(-14, -6, 0, -14);
      ctx.fill();
      ctx.stroke();
      drawEyes(-4, -2, 4, -2);
    } else if (enemy.kind === "goblin") {
      ctx.beginPath();
      ctx.moveTo(-9, -3);
      ctx.lineTo(-18, -10);
      ctx.lineTo(-11, 2);
      ctx.moveTo(9, -3);
      ctx.lineTo(18, -10);
      ctx.lineTo(11, 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(-10, -12, 20, 24, 7);
      ctx.fill();
      ctx.stroke();
      drawEyes(-4, -3, 4, -3);
    } else if (enemy.kind === "bat") {
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(-22, -12);
      ctx.lineTo(-13, 2);
      ctx.lineTo(-21, 10);
      ctx.lineTo(-3, 7);
      ctx.lineTo(0, 12);
      ctx.lineTo(3, 7);
      ctx.lineTo(21, 10);
      ctx.lineTo(13, 2);
      ctx.lineTo(22, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      drawEyes(-3, -2, 3, -2);
    } else if (enemy.kind === "skeleton") {
      ctx.fillStyle = enemy.hitFlash > 0 ? "#ffffff" : "#f6efd8";
      ctx.beginPath();
      ctx.arc(0, -8, 8, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(-6, 0, 12, 17, 4);
      ctx.fill();
      ctx.stroke();
      drawEyes(-3, -9, 3, -9);
    } else if (enemy.kind === "golem") {
      ctx.beginPath();
      ctx.roundRect(-17, -16, 34, 32, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = enemy.hitFlash > 0 ? "#ffffff" : "#c0b5a4";
      ctx.beginPath();
      ctx.roundRect(-12, -11, 24, 10, 4);
      ctx.fill();
      ctx.stroke();
      drawEyes(-5, -6, 5, -6);
    } else if (enemy.kind === "bomber") {
      ctx.beginPath();
      ctx.arc(0, 2, 12, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#213326";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.quadraticCurveTo(2, -18, 11, -17);
      ctx.stroke();
      ctx.fillStyle = "#ffcf5a";
      ctx.beginPath();
      ctx.arc(13, -17, 4, 0, TAU);
      ctx.fill();
      drawEyes(-4, 0, 4, 0);
    }
    drawBurnOverlay(enemy);
    drawSlowOverlay(enemy);
    drawEnemyHp(enemy);
    ctx.restore();
  }

  function drawBoss(enemy) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    const bob = Math.sin(game.t * 4 + enemy.phase) * 2;
    ctx.translate(0, bob);
    const s = enemy.squash > 0 ? enemy.squash : 0;
    ctx.scale(1 + s * 0.08, 1 - s * 0.07);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#213326";
    ctx.fillStyle = enemy.hitFlash > 0 ? "#ffffff" : enemy.color;

    const bossSheet = sprites.bosses[enemy.bossType];
    if (ready(bossSheet)) {
      const animSpeed = enemy.state && enemy.state.startsWith("wind") ? 12 : 7;
      const frame = Math.floor(game.t * animSpeed + enemy.phase) % 4;
      const drawSize = enemy.bossType === "reaper" ? 158 : 176;
      if (enemy.faceX < 0) ctx.scale(-1, 1);
      ctx.filter = enemy.hitFlash > 0 ? "brightness(3.2) saturate(0)" : "none";
      spriteFrame(bossSheet, 160, 160, frame, -drawSize / 2, -drawSize / 2 - 14, drawSize, drawSize);
      ctx.filter = "none";
      drawBurnOverlay(enemy);
      drawSlowOverlay(enemy);
      drawEnemyHp(enemy, true);
      ctx.restore();
      return;
    }

    if (enemy.bossType === "brute") {
      ctx.beginPath();
      ctx.roundRect(-38, -34, 76, 70, 18);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = enemy.hitFlash > 0 ? "#ffffff" : "#ffcf5a";
      ctx.beginPath();
      ctx.moveTo(-24, -28);
      ctx.lineTo(-12, -54);
      ctx.lineTo(0, -28);
      ctx.moveTo(24, -28);
      ctx.lineTo(12, -54);
      ctx.lineTo(0, -28);
      ctx.fill();
      ctx.stroke();
      drawEyes(-14, -9, 14, -9, 5);
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -52);
      ctx.quadraticCurveTo(44, -18, 34, 40);
      ctx.quadraticCurveTo(0, 60, -34, 40);
      ctx.quadraticCurveTo(-44, -18, 0, -52);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#213326";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(18, -28);
      ctx.lineTo(44, -55);
      ctx.lineTo(52, -46);
      ctx.stroke();
      drawEyes(-12, -16, 12, -16, 5);
    }
    drawBurnOverlay(enemy);
    drawSlowOverlay(enemy);
    drawEnemyHp(enemy, true);
    ctx.restore();
  }

  function drawEyes(x1, y1, x2, y2, r = 3) {
    ctx.fillStyle = "#213326";
    ctx.beginPath();
    ctx.arc(x1, y1, r, 0, TAU);
    ctx.arc(x2, y2, r, 0, TAU);
    ctx.fill();
  }

  function drawBurnOverlay(entity) {
    if (entity.burn <= 0 || entity.hitFlash > 0) return;
    const flicker = 0.32 + Math.sin(game.t * 24 + entity.phase * 3) * 0.14;
    ctx.globalAlpha = flicker * Math.min(1, entity.burn / 0.6);
    ctx.fillStyle = "#ff7a28";
    ctx.beginPath();
    ctx.arc(0, 0, entity.r * 0.95, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawSlowOverlay(entity) {
    if (entity.slow <= 0 || entity.hitFlash > 0) return;
    const pulse = 0.18 + Math.sin(game.t * 10 + entity.phase) * 0.04;
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = "#74d5ff";
    ctx.lineWidth = entity.boss ? 5 : 3;
    ctx.beginPath();
    ctx.arc(0, 0, entity.r * 1.18, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawEnemyHp(enemy, boss = false) {
    if (enemy.hp >= enemy.maxHp || enemy.dead) return;
    const w = boss ? 86 : 30;
    const y = boss ? enemy.r + 16 : enemy.r + 10;
    ctx.fillStyle = "rgba(33,51,38,0.34)";
    ctx.fillRect(-w / 2, y, w, 6);
    ctx.fillStyle = boss ? "#ff5e6f" : "#ff8a6c";
    ctx.fillRect(-w / 2, y, w * clamp(enemy.hp / enemy.maxHp, 0, 1), 6);
  }

  function drawShadow(x, y, rx, ry, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#16241a";
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  // Sombras de contato no chao: fundamentam cada figura no ambiente e encolhem
  // conforme o "bob" sobe, reforcando que estao pisando no solo (e nao flutuando).
  function drawShadows() {
    const p = game.player;
    for (const enemy of game.enemies) {
      if (enemy.dead) continue;
      if (enemy.boss) {
        const bob = Math.sin(game.t * 4 + enemy.phase) * 2;
        const lift = clamp(1 - bob * 0.04, 0.82, 1.12);
        drawShadow(enemy.x, enemy.y + enemy.r * 1.5, enemy.r * 1.3 * lift, enemy.r * 0.5 * lift, 0.3);
      } else {
        const bob = Math.sin(game.t * 8 + enemy.phase) * 1.5;
        const lift = clamp(1 - bob * 0.05, 0.8, 1.15);
        drawShadow(enemy.x, enemy.y + enemy.r + 6, enemy.r * 1.05 * lift, enemy.r * 0.44 * lift, 0.26);
      }
    }
    if (game.minions) {
      for (const minion of game.minions) {
        const bob = Math.sin(game.t * 5 + minion.phase) * 2;
        const lift = clamp(1 - bob * 0.05, 0.82, 1.12);
        drawShadow(minion.x, minion.y + 16, 12 * lift, 5 * lift, 0.22);
      }
    }
    const walkPulse = p.walking ? 1 + Math.sin(game.t * 20) * 0.06 : 1;
    drawShadow(p.x, p.y + 22, 17 * walkPulse, 7 * walkPulse, 0.28);
  }

  function drawMinions() {
    if (!game.minions) return;
    for (const minion of game.minions) {
      ctx.save();
      ctx.translate(minion.x, minion.y + Math.sin(game.t * 5 + minion.phase) * 2);
      ctx.fillStyle = "#5c4f73";
      ctx.strokeStyle = "#213326";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 13, 0, TAU);
      ctx.fill();
      ctx.stroke();
      drawEyes(-4, -2, 4, -2, 3);
      ctx.restore();
    }
  }

  function drawPlayer() {
    const p = game.player;
    const char = game.character;
    ctx.save();
    ctx.translate(p.x, p.y);
    const flash = p.invuln > 0 && Math.floor(game.t * 22) % 2 === 0;
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#213326";
    ctx.fillStyle = flash ? "#ffffff" : char.color;

    if (weaponLevel("aura")) {
      const aura = game.player.weapons.aura;
      const radius = WEAPONS.aura.range + aura.level * 8;
      ctx.save();
      ctx.globalAlpha = 0.13 + Math.sin(game.t * 5) * 0.03;
      ctx.fillStyle = WEAPONS.aura.color;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, TAU);
      ctx.fill();
      ctx.restore();
    }

    const sheetKey = `${char.id}_${p.walking ? "walk" : "idle"}`;
    const characterSheet = sprites.characters[sheetKey];
    if (ready(characterSheet)) {
      const frame = p.walking ? Math.floor(game.t * 10) % 4 : 0;
      const sourceSize = 96;
      const drawSize = 80;
      const yOffset = -54;
      if (p.lastDirX < 0) ctx.scale(-1, 1);
      ctx.filter = flash ? "brightness(3.2) saturate(0)" : "none";
      spriteFrame(characterSheet, sourceSize, sourceSize, frame, -drawSize / 2, yOffset, drawSize, drawSize);
      ctx.filter = "none";
      ctx.restore();
      return;
    }

    if (char.id === "cavalheiro") {
      ctx.beginPath();
      ctx.roundRect(-14, -18, 28, 34, 9);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#d7e7ec";
      ctx.beginPath();
      ctx.arc(0, -18, 12, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
    } else if (char.id === "vampiro") {
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.lineTo(18, 15);
      ctx.lineTo(0, 10);
      ctx.lineTo(-18, 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (char.id === "cacadora") {
      ctx.beginPath();
      ctx.moveTo(0, -22);
      ctx.lineTo(18, 6);
      ctx.lineTo(8, 20);
      ctx.lineTo(-8, 20);
      ctx.lineTo(-18, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (char.id === "piromante") {
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffcf5a";
      ctx.beginPath();
      ctx.moveTo(-10, -12);
      ctx.quadraticCurveTo(0, -34, 11, -12);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.roundRect(-14, -18, 28, 36, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ffd166";
      ctx.beginPath();
      ctx.moveTo(-12, -18);
      ctx.lineTo(0, -35);
      ctx.lineTo(12, -18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    drawEyes(-5, -5, 5, -5, 3.2);
    ctx.restore();
  }

  function drawDeaths() {
    if (!game.deaths || !game.deaths.length) return;
    for (const d of game.deaths) {
      const t = 1 - d.life / d.max; // 0 -> 1 ao longo da vida
      ctx.save();
      ctx.translate(d.x, d.y - t * 9); // sobe de leve enquanto some
      ctx.globalAlpha = 1 - t;
      const sc = 1 + t * 0.18;
      ctx.scale(sc, sc);
      if (d.flip) ctx.scale(-1, 1);
      ctx.filter = "brightness(4) saturate(0)"; // estoura em branco
      spriteFrame(d.sheet, d.sourceSize, d.sourceSize, d.frame, -d.drawSize / 2, d.yOff, d.drawSize, d.drawSize);
      ctx.filter = "none";
      ctx.restore();
    }
  }

  function drawParticles() {
    for (const p of game.particles) {
      const a = clamp(p.life / p.max, 0, 1);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot + game.t * 3);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = "#213326";
      ctx.lineWidth = 1.5;
      ctx.fillRect(-p.size, -p.size, p.size * 2, p.size * 2);
      ctx.strokeRect(-p.size, -p.size, p.size * 2, p.size * 2);
      ctx.restore();
    }
  }

  function drawDamageTexts() {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const text of game.texts) {
      const a = clamp(text.life / text.max, 0, 1);
      const size = Math.round(18 * text.scale);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.font = `900 ${size}px ui-sans-serif, system-ui`;
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#213326";
      ctx.fillStyle = text.color;
      ctx.strokeText(text.text, text.x, text.y);
      ctx.fillText(text.text, text.x, text.y);
      ctx.restore();
    }
  }

  function drawBossArrows(camX, camY) {
    const boss = game.enemies.find((e) => e.boss);
    if (!boss) return;
    const sx = boss.x - camX;
    const sy = boss.y - camY;
    if (sx > 0 && sx < viewW && sy > 0 && sy < viewH) return;
    const cx = viewW / 2;
    const cy = viewH / 2;
    const a = Math.atan2(sy - cy, sx - cx);
    const x = clamp(cx + Math.cos(a) * (Math.min(viewW, viewH) * 0.44), 34, viewW - 34);
    const y = clamp(cy + Math.sin(a) * (Math.min(viewW, viewH) * 0.44), 34, viewH - 34);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    ctx.fillStyle = "#ff5e6f";
    ctx.strokeStyle = "#213326";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.lineTo(-12, -14);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-12, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function togglePause() {
    if (!game || (mode !== "playing" && mode !== "paused")) return;
    if (mode === "playing") {
      mode = "paused";
      showToast("Pausado", 10);
    } else {
      mode = "playing";
      showToast("Voltando", 0.7);
    }
    if (el.pauseBtn) el.pauseBtn.textContent = mode === "paused" ? ">" : "II";
  }

  function frame(now) {
    const raw = (now - lastTime) / 1000;
    lastTime = now;
    const dt = clamp(raw, 0, 0.033);
    if (!systemPaused) {
      if (mode === "playing") updateGame(dt);
      if (mode === "levelup") updateLevelScreen(dt);
    }
    draw();
    requestAnimationFrame(frame);
  }

  function onKeyDown(event) {
    const key = event.key.toLowerCase();
    keys.add(key);
    if (mode === "levelup") {
      if (key === "1") applyChoice(0);
      if (key === "2") applyChoice(1);
      if (key === "3") applyChoice(2);
    }
    if ((key === "p" || key === "escape") && game) {
      togglePause();
    }
    if (key === "r" && (mode === "ended" || mode === "paused")) startGame();
  }

  function onKeyUp(event) {
    keys.delete(event.key.toLowerCase());
  }

  function canvasPointerDown(event) {
    if (mode !== "playing" || event.pointerType === "mouse") return;
    const rect = canvas.getBoundingClientRect();
    pointer.active = true;
    pointer.id = event.pointerId;
    pointer.originX = event.clientX - rect.left;
    pointer.originY = event.clientY - rect.top;
    pointer.x = pointer.originX;
    pointer.y = pointer.originY;
    pointer.vx = 0;
    pointer.vy = 0;
    el.joystick.style.left = `${pointer.originX - 64}px`;
    el.joystick.style.top = `${pointer.originY - 64}px`;
    el.joystick.style.bottom = "auto";
    el.joystick.classList.add("is-live");
    canvas.setPointerCapture(event.pointerId);
    resumeAudio();
  }

  function canvasPointerMove(event) {
    if (!pointer.active || event.pointerId !== pointer.id) return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    const dx = pointer.x - pointer.originX;
    const dy = pointer.y - pointer.originY;
    const length = Math.hypot(dx, dy);
    const max = 48;
    const clamped = Math.min(max, length);
    const nx = length ? dx / length : 0;
    const ny = length ? dy / length : 0;
    pointer.vx = nx * clamp(length / max, 0, 1);
    pointer.vy = ny * clamp(length / max, 0, 1);
    el.joyKnob.style.left = `${42 + nx * clamped}px`;
    el.joyKnob.style.top = `${42 + ny * clamped}px`;
  }

  function canvasPointerUp(event) {
    if (event.pointerId !== pointer.id) return;
    pointer.active = false;
    pointer.id = -1;
    pointer.vx = 0;
    pointer.vy = 0;
    el.joystick.classList.remove("is-live");
    el.joyKnob.style.left = "42px";
    el.joyKnob.style.top = "42px";
  }

  window.addEventListener("resize", resize);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);
  document.addEventListener("visibilitychange", () => setPause("hidden", document.hidden));
  canvas.addEventListener("pointerdown", canvasPointerDown);
  canvas.addEventListener("pointermove", canvasPointerMove);
  canvas.addEventListener("pointerup", canvasPointerUp);
  canvas.addEventListener("pointercancel", canvasPointerUp);
  el.playButton.addEventListener("click", beginGame);
  el.shopOpenButton.addEventListener("click", openShop);
  el.shopBackButton.addEventListener("click", closeShop);
  el.againButton.addEventListener("click", beginGame);
  el.menuButton.addEventListener("click", () => {
    cgGameplayStop();
    mode = "menu";
    game = null;
    renderMenu();
  });
  el.pauseBtn.addEventListener("click", togglePause);
  el.muteBtn.addEventListener("click", () => {
    resumeAudio();
    setMuted(!muted);
  });

  setMuted(muted);
  loadSprites();
  resize();
  renderMenu();
  initCrazySDK();
  requestAnimationFrame(frame);
})();
