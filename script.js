/* ============================================
   DULA Pro - Main Script v3.0
   Stage 1: أساس + 5 ألعاب + 4 مراحل + متجر
   ============================================ */

/* ===== 1. البيانات الأساسية ===== */
const STORAGE_KEY = 'dulaPro_v3';

const defaultState = {
  playerName: '',
  xp: 0,
  coins: 100,
  streak: 0,
  lastDay: '',
  lastDaily: '',
  scores: {},        // { gameId_difficulty: bestScore }
  plays: {},
  ownedThemes: ['gaming'],
  ownedAvatars: ['default'],
  currentTheme: 'gaming',
  currentAvatar: 'default'
};

let state = { ...defaultState };

/* ===== 2. تحميل وحفظ ===== */
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) state = { ...defaultState, ...JSON.parse(saved) };
  } catch (e) { console.warn('Load error', e); }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) { console.warn('Save error', e); }
}

/* ===== 3. الثيمات (أسعار صعبة) ===== */
const THEMES = [
  { id: 'gaming', name: 'Gaming', icon: '🎮', price: 0,     tag: 'مجاني' },
  { id: 'ocean',  name: 'Ocean',  icon: '🌊', price: 1500,  tag: 'مبتدئ' },
  { id: 'fire',   name: 'Fire',   icon: '🔥', price: 5000,  tag: 'متقدم' },
  { id: 'galaxy', name: 'Galaxy', icon: '🌌', price: 15000, tag: 'أسطوري' }
];

/* ===== 4. الأفاتارات ===== */
const AVATARS = [
  { id: 'default', name: 'افتراضي', icon: '🎮', price: 0 },
  { id: 'cat',     name: 'قطة',     icon: '🐱', price: 500 },
  { id: 'robot',   name: 'روبوت',   icon: '🤖', price: 2000 },
  { id: 'dragon',  name: 'تنين',    icon: '🐉', price: 5000 },
  { id: 'wizard',  name: 'ساحر',    icon: '🧙', price: 10000 },
  { id: 'ninja',   name: 'نينجا',   icon: '🥷', price: 20000 }
];

/* ===== 5. الألعاب ===== */
const GAMES = [
  { id: 'xo',     name: 'إكس أوه',   icon: '❌' },
  { id: 'memory', name: 'الذاكرة',   icon: '🧠' },
  { id: 'snake',  name: 'أفعى',      icon: '🐍' },
  { id: 'math',   name: 'سباق الحساب', icon: '➕' },
  { id: 'guess',  name: 'خمن الرقم', icon: '🔢' },
  { id: 'rps',    name: 'حجر ورقة مقص', icon: '✊' },
  { id: 'whack',  name: 'اضرب الخلد', icon: '🔨' },
  { id: 'quiz',   name: 'سؤال وجواب', icon: '❓' },
  { id: 'simon',  name: 'ذاكر الألوان', icon: '🎨' },
  { id: 'movies', name: 'تخمين الأفلام', icon: '🎬' },
  { id: 'game2048', name: '2048', icon: '🔢' },
  { id: 'hangman', name: 'المشنوقة', icon: '🔤' },
  { id: 'flappy', name: 'الطائر', icon: '🐦' },
  { id: 'tetris', name: 'المكعبات', icon: '🧱' },
  { id: 'colormatch', name: 'لون مختلف', icon: '🌈' },
  { id: 'quickmemory', name: 'الذاكرة السريعة', icon: '🧠' }
];
/* ===== 6. المراحل ===== */
const DIFFICULTIES = [
  { id: 'easy',      name: 'سهل',     icon: '🟢', desc: 'للمبتدئين' },
  { id: 'medium',    name: 'متوسط',   icon: '🟡', desc: 'تحدي معقول' },
  { id: 'hard',      name: 'صعب',     icon: '🔴', desc: 'للمحترفين' },
  { id: 'legendary', name: 'أسطوري',  icon: '💜', desc: 'للمجانين بس!' }
];

/* ===== 7. المستوى ===== */
function getLevel() { return Math.floor(state.xp / 100) + 1; }
function getXPInLevel() { return state.xp % 100; }

/* ===== 8. المكافآت ===== */
function addReward(xp, coins) {
  state.xp += xp;
  state.coins += coins;
  saveState();
  renderAll();
}

/* ===== 9. حفظ النتيجة ===== */
function recordScore(gameId, difficulty, score) {
  const key = gameId + '_' + difficulty;
  const isNewBest = !state.scores[key] || score > state.scores[key];
  if (isNewBest) state.scores[key] = score;
  state.plays[gameId] = (state.plays[gameId] || 0) + 1;

  // مكافآت قليلة عشان الكوينز تبقى صعبة
  const multipliers = { easy: 1, medium: 1.5, hard: 2.2, legendary: 3.5 };
  const mult = multipliers[difficulty] || 1;

  const xp = Math.max(2, Math.floor(score / 15 * mult));
  const coins = Math.max(1, Math.floor(score / 40 * mult));

  state.xp += xp;
  state.coins += coins;
  saveState();
  renderAll();

  return { isNewBest, xp, coins, best: state.scores[key] };
}

/* ===== 10. العرض العام ===== */
function renderAll() {
  renderTopbar();
  renderQuickStats();
  renderLeaderboard();
  renderGames();
  renderShop();
}

function renderTopbar() {
  const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  set('userName', state.playerName || 'لاعب');
  set('userLevel', 'المستوى ' + getLevel());
  set('topCoins', state.coins);
  set('topStreak', state.streak);
  set('xpText', getXPInLevel() + ' / 100 XP');
  set('shopCoins', state.coins);

  const xpFill = document.getElementById('xpFill');
  if (xpFill) xpFill.style.width = getXPInLevel() + '%';

  const avatar = AVATARS.find(a => a.id === state.currentAvatar);
  const avatarEl = document.getElementById('userAvatar');
  if (avatarEl && avatar) avatarEl.textContent = avatar.icon;
}

function renderQuickStats() {
  const set = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  const totalPlays = Object.values(state.plays).reduce((a, b) => a + b, 0);
  const bestScore = Math.max(0, ...Object.values(state.scores));
  set('qsPlays', totalPlays);
  set('qsBest', bestScore);
  set('qsThemes', state.ownedThemes.length);
}

function renderLeaderboard() {
  const list = document.getElementById('leaderboardList');
  if (!list) return;

  const entries = Object.entries(state.scores)
    .map(([key, score]) => {
      const [gameId, diff] = key.split('_');
      const g = GAMES.find(x => x.id === gameId);
      const d = DIFFICULTIES.find(x => x.id === diff);
      return {
        name: g ? g.name : gameId,
        icon: g ? g.icon : '🎮',
        diffIcon: d ? d.icon : '',
        score
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (entries.length === 0) {
    list.innerHTML = '<li class="lb-empty">لا يوجد سكور بعد — ابدأ اللعب! 🎮</li>';
    return;
  }

  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
  list.innerHTML = entries.map((e, i) => `
    <li class="${i < 3 ? 'top' + (i + 1) : ''}">
      <span class="lb-rank">${medals[i]}</span>
      <span class="lb-name">${e.icon} ${e.name} ${e.diffIcon}</span>
      <span class="lb-score">${e.score}</span>
    </li>
  `).join('');
}

function renderGames() {
  const grid = document.getElementById('gamesGrid');
  if (!grid) return;

  grid.innerHTML = GAMES.map(g => {
    const bestAny = Math.max(0, ...[
      state.scores[g.id + '_easy'] || 0,
      state.scores[g.id + '_medium'] || 0,
      state.scores[g.id + '_hard'] || 0,
      state.scores[g.id + '_legendary'] || 0
    ]);
    return `
      <div class="game-card" data-name="${g.name}" onclick="showDifficulty('${g.id}')">
        <span class="gc-icon">${g.icon}</span>
        <div class="gc-name">${g.name}</div>
        <div class="gc-best">🏆 ${bestAny}</div>
        <div class="gc-plays">🎯 ${state.plays[g.id] || 0} مرة</div>
      </div>
    `;
  }).join('');
}

function filterGames(q) {
  q = (q || '').trim().toLowerCase();
  document.querySelectorAll('.game-card').forEach(card => {
    const name = (card.dataset.name || '').toLowerCase();
    card.style.display = (!q || name.includes(q)) ? '' : 'none';
  });
}

/* ===== 11. المتجر ===== */
function openShop() {
  document.getElementById('shopModal').classList.add('active');
  renderShop();
}

function closeShop() {
  document.getElementById('shopModal').classList.remove('active');
}

function renderShop() {
  const themesGrid = document.getElementById('themesGrid');
  const avatarsGrid = document.getElementById('avatarsGrid');
  if (!themesGrid || !avatarsGrid) return;

  themesGrid.innerHTML = THEMES.map(t => {
    const owned = state.ownedThemes.includes(t.id);
    const active = state.currentTheme === t.id;
    return `
      <div class="shop-item ${owned ? 'owned' : ''} ${active ? 'active' : ''}">
        ${active ? '<span class="si-tag">مفعّل</span>' : ''}
        <span class="si-icon">${t.icon}</span>
        <div class="si-name">${t.name}</div>
        <button class="si-price" ${owned && active ? 'disabled' : ''} onclick="buyTheme('${t.id}')">
          ${owned ? (active ? '✅ مفعّل' : 'استخدام') : t.price.toLocaleString() + ' 🪙'}
        </button>
      </div>
    `;
  }).join('');

  avatarsGrid.innerHTML = AVATARS.map(a => {
    const owned = state.ownedAvatars.includes(a.id);
    const active = state.currentAvatar === a.id;
    return `
      <div class="shop-item ${owned ? 'owned' : ''} ${active ? 'active' : ''}">
        ${active ? '<span class="si-tag">مفعّل</span>' : ''}
        <span class="si-icon">${a.icon}</span>
        <div class="si-name">${a.name}</div>
        <button class="si-price" ${owned && active ? 'disabled' : ''} onclick="buyAvatar('${a.id}')">
          ${owned ? (active ? '✅ مفعّل' : 'استخدام') : a.price.toLocaleString() + ' 🪙'}
        </button>
      </div>
    `;
  }).join('');
}

function buyTheme(id) {
  const theme = THEMES.find(t => t.id === id);
  if (!theme) return;
  const owned = state.ownedThemes.includes(id);

  if (owned) {
    state.currentTheme = id;
    applyTheme(id);
    saveState();
    renderAll();
    showToast('✅ تم تفعيل ثيم ' + theme.name);
    return;
  }

  if (state.coins < theme.price) {
    showToast('❌ ناقصك ' + (theme.price - state.coins).toLocaleString() + ' 🪙');
    return;
  }

  state.coins -= theme.price;
  state.ownedThemes.push(id);
  state.currentTheme = id;
  applyTheme(id);
  saveState();
  renderAll();
  showToast('🎉 اشتريت ثيم ' + theme.name + '!');
}

function buyAvatar(id) {
  const avatar = AVATARS.find(a => a.id === id);
  if (!avatar) return;
  const owned = state.ownedAvatars.includes(id);

  if (owned) {
    state.currentAvatar = id;
    saveState();
    renderAll();
    showToast('✅ تم تفعيل أفاتار ' + avatar.name);
    return;
  }

  if (state.coins < avatar.price) {
    showToast('❌ ناقصك ' + (avatar.price - state.coins).toLocaleString() + ' 🪙');
    return;
  }

  state.coins -= avatar.price;
  state.ownedAvatars.push(id);
  state.currentAvatar = id;
  saveState();
  renderAll();
  showToast('🎉 اشتريت أفاتار ' + avatar.name + '!');
}

function applyTheme(id) {
  if (id === 'gaming') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', id);
  }
}

/* ===== 12. الهدية اليومية ===== */
function claimDaily() {
  const today = new Date().toDateString();
  if (state.lastDaily === today) {
    showToast('🎁 خدت هدية النهاردة! ارجع بكرة');
    return;
  }
  state.lastDaily = today;
  const bonus = 30 + state.streak * 5;
  state.coins += bonus;
  saveState();
  renderAll();

  document.getElementById('dailyText').textContent = '+' + bonus + ' 🪙';
  document.getElementById('dailyModal').classList.add('active');
}

function closeDaily() {
  document.getElementById('dailyModal').classList.remove('active');
}

/* ===== 13. Streak ===== */
function checkStreak() {
  const today = new Date().toDateString();
  if (state.lastDay === today) return;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (state.lastDay === yesterday) state.streak++;
  else state.streak = 1;
  state.lastDay = today;
  saveState();
}

/* ===== 14. Toast ===== */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ===== 15. أدوات ===== */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ===== 16. اختيار الصعوبة ===== */
let pendingGame = null;

function showDifficulty(gameId) {
  // لو اللعبة xo، اعرض شاشة الاختيار مباشرة
  if (gameId === 'xo') {
    pendingGame = gameId;
    closeDifficulty();
    startGame('xo', null);
    return;
  }
  
  // ... باقي الكود القديم  
  pendingGame = gameId;
  const game = GAMES.find(g => g.id === gameId);
  if (!game) return;

  document.getElementById('diffTitle').textContent = game.icon + ' ' + game.name + ' — اختر الصعوبة';

  const grid = document.getElementById('difficultyGrid');
  grid.innerHTML = DIFFICULTIES.map(d => {
    const best = state.scores[gameId + '_' + d.id] || 0;
    return `
      <button class="diff-btn ${d.id}" onclick="chooseDifficulty('${gameId}', '${d.id}')">
        <span class="diff-icon">${d.icon}</span>
        <div class="diff-name">${d.name}</div>
        <div class="diff-desc">${d.desc}</div>
        <div class="diff-desc" style="margin-top:6px;color:var(--accent)">🏆 ${best}</div>
      </button>
    `;
  }).join('');

  document.getElementById('difficultyModal').classList.add('active');
}

function closeDifficulty() {
  document.getElementById('difficultyModal').classList.remove('active');
  pendingGame = null;
}

function chooseDifficulty(gameId, difficulty) {
  closeDifficulty();
  startGame(gameId, difficulty);
}

/* ===== 17. إدارة الألعاب ===== */
let activeGame = null;
let activeDifficulty = null;
let snakeTimer = null;
let mathTimer = null;
let whackTimer = null;
let whackUpTimer = null;
let flappyTimer = null;
let tetrisTimer = null;
let cmTimer = null;

function clearTimers() {
  if (snakeTimer) { clearInterval(snakeTimer); snakeTimer = null; }
  if (mathTimer) { clearInterval(mathTimer); mathTimer = null; }
  if (whackTimer) { clearInterval(whackTimer); whackTimer = null; }
  if (whackUpTimer) { clearInterval(whackUpTimer); whackUpTimer = null; }
  if (flappyTimer) { clearInterval(flappyTimer); flappyTimer = null; }
  if (tetrisTimer) { clearInterval(tetrisTimer); tetrisTimer = null; }
  if (cmTimer) { clearInterval(cmTimer); cmTimer = null; }
}
function startGame(id, difficulty) {
  clearTimers();
  activeGame = id;
  activeDifficulty = difficulty;

  document.getElementById('homeScreen').classList.remove('active');
  document.getElementById('gameScreen').classList.add('active');

  const game = GAMES.find(g => g.id === id);
  const diff = difficulty ? DIFFICULTIES.find(d => d.id === difficulty) : null;

  // ✅ حماية من null
  if (diff) {
    document.getElementById('gameTitle').textContent = game.icon + ' ' + game.name + ' ' + diff.icon;
  } else {
    document.getElementById('gameTitle').textContent = game.icon + ' ' + game.name;
  }

  document.getElementById('currentScore').textContent = '0';

  const area = document.getElementById('gameArea');
  area.innerHTML = '';

  const bestKey = difficulty ? id + '_' + difficulty : id;
  const best = state.scores[bestKey] || 0;

  switch (id) {
    case 'xo':          initXO(area, difficulty, best); break;
    case 'memory':      initMemory(area, difficulty, best); break;
    case 'snake':       initSnake(area, difficulty, best); break;
    case 'math':        initMath(area, difficulty, best); break;
    case 'guess':       initGuess(area, difficulty, best); break;
    case 'rps':         initRPS(area, difficulty, best); break;
    case 'whack':       initWhack(area, difficulty, best); break;
    case 'quiz':        initQuiz(area, difficulty, best); break;
    case 'simon':       initSimon(area, difficulty, best); break;
    case 'movies':      initMovies(area, difficulty, best); break;
    case 'game2048':    init2048(area, difficulty, best); break;
    case 'hangman':     initHangman(area, difficulty, best); break;
    case 'flappy':      initFlappy(area, difficulty, best); break;
    case 'tetris':      initTetris(area, difficulty, best); break;
    case 'colormatch':  initColorMatch(area, difficulty, best); break;
    case 'quickmemory': initQuickMemory(area, difficulty, best); break;
  }
}

function backHome() {
  clearTimers();
  document.getElementById('homeScreen').classList.add('active');
  document.getElementById('gameScreen').classList.remove('active');
  activeGame = null;
  activeDifficulty = null;
  renderAll();
}

function endGame(gameId, difficulty, score) {
  const result = recordScore(gameId, difficulty, score);
  const area = document.getElementById('gameArea');
  const game = GAMES.find(g => g.id === gameId);
  const diff = DIFFICULTIES.find(d => d.id === difficulty);

  area.innerHTML = `
    <div style="text-align:center;padding:30px 12px">
      <div style="font-size:70px;margin-bottom:10px">🎉</div>
      <h2 style="font-size:26px;color:var(--accent);margin-bottom:14px">انتهت اللعبة!</h2>
      <div style="font-size:12px;color:var(--muted);margin-bottom:6px">${game.icon} ${game.name} ${diff.icon} ${diff.name}</div>
      <div style="font-size:2.4rem;font-weight:900;margin:12px 0;background:var(--gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${score}</div>
      ${result.isNewBest ? '<div style="color:var(--success);font-weight:800;margin-bottom:12px;font-size:14px">🏆 رقم قياسي جديد!</div>' : ''}
      <div style="margin:14px 0;font-size:15px;font-weight:800">
        <span style="color:var(--warning)">💰 +${result.coins}</span>
        &nbsp;|&nbsp;
        <span style="color:var(--accent)">⭐ +${result.xp} XP</span>
      </div>
      <div style="color:var(--muted);margin-bottom:20px;font-size:13px">أفضل نتيجة: ${result.best}</div>
      <button class="reset" onclick="startGame('${gameId}', '${difficulty}')">🔄 العب تاني</button>
      <button class="reset" onclick="backHome()" style="background:var(--gradient-2)">🏠 الرئيسية</button>
    </div>
  `;
}

/* ===== 18. X-O ===== */
function initXO(area, difficulty, best) {
  if (!difficulty) {
    return showXOChoice();
  }
  if (difficulty === 'friend') {
    return startXOvsFriend(area);
  }
  return startXOvsAI(area, difficulty, best);
}

/* شاشة اختيار طريقة اللعب */
function showXOChoice() {
  const area = document.getElementById('gameArea');
  document.getElementById('gameTitle').textContent = '❌ إكس أوه ⭕';
  document.getElementById('currentScore').textContent = '—';

  area.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:18px;padding:30px 16px">
      <div style="font-size:26px;font-weight:900;background:var(--gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">❌ إكس أوه ⭕</div>
      <div style="color:var(--muted);font-size:14px">اختار طريقة اللعب</div>

      <button onclick="chooseXODifficulty()" style="width:100%;max-width:320px;padding:22px 20px;background:var(--card);border:2px solid var(--border);border-radius:20px;cursor:pointer;font:800 17px 'Cairo';color:var(--ink);display:flex;align-items:center;gap:16px;text-align:right;font-family:inherit">
        <span style="font-size:42px;flex-shrink:0">🤖</span>
        <div style="flex:1">
          <div style="font-size:17px;font-weight:900;margin-bottom:4px">ضد الكمبيوتر</div>
          <div style="font-size:12px;color:var(--muted);font-weight:600">العب ضد الذكاء الاصطناعي</div>
        </div>
      </button>

      <button onclick="startXOFriend()" style="width:100%;max-width:320px;padding:22px 20px;background:var(--card);border:2px solid var(--border);border-radius:20px;cursor:pointer;font:800 17px 'Cairo';color:var(--ink);display:flex;align-items:center;gap:16px;text-align:right;font-family:inherit">
        <span style="font-size:42px;flex-shrink:0">👥</span>
        <div style="flex:1">
          <div style="font-size:17px;font-weight:900;margin-bottom:4px">ضد صديق</div>
          <div style="font-size:12px;color:var(--muted);font-weight:600">العب مع صاحبك على نفس الجهاز</div>
        </div>
      </button>
    </div>
  `;
}

/* شاشة اختيار الصعوبة */
function chooseXODifficulty() {
  const area = document.getElementById('gameArea');

  area.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:16px;padding:20px 16px">
      <div style="font-size:24px;font-weight:900;background:var(--gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">🤖 ضد الكمبيوتر</div>
      <div style="color:var(--muted);font-size:14px;margin-bottom:16px">اختار المستوى</div>

      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;width:100%;max-width:420px">
        <button onclick="startXOAI('easy')" style="padding:22px 12px;background:var(--card);border:2px solid var(--border);border-radius:18px;cursor:pointer;font-family:inherit;color:var(--ink);display:flex;flex-direction:column;align-items:center;gap:8px">
          <div style="font-size:42px">🟢</div>
          <div style="font-size:17px;font-weight:900">سهل</div>
          <div style="font-size:11px;color:var(--muted);font-weight:600;text-align:center">الكمبيوتر بيغلط كتير</div>
        </button>

        <button onclick="startXOAI('medium')" style="padding:22px 12px;background:var(--card);border:2px solid var(--border);border-radius:18px;cursor:pointer;font-family:inherit;color:var(--ink);display:flex;flex-direction:column;align-items:center;gap:8px">
          <div style="font-size:42px">🟡</div>
          <div style="font-size:17px;font-weight:900">متوسط</div>
          <div style="font-size:11px;color:var(--muted);font-weight:600;text-align:center">الكمبيوتر شاطر</div>
        </button>

        <button onclick="startXOAI('hard')" style="padding:22px 12px;background:var(--card);border:2px solid var(--border);border-radius:18px;cursor:pointer;font-family:inherit;color:var(--ink);display:flex;flex-direction:column;align-items:center;gap:8px">
          <div style="font-size:42px">🔴</div>
          <div style="font-size:17px;font-weight:900">صعب</div>
          <div style="font-size:11px;color:var(--muted);font-weight:600;text-align:center">الكمبيوتر ذكي جدًا</div>
        </button>

        <button onclick="startXOAI('legendary')" style="padding:22px 12px;background:var(--card);border:2px solid var(--border);border-radius:18px;cursor:pointer;font-family:inherit;color:var(--ink);display:flex;flex-direction:column;align-items:center;gap:8px">
          <div style="font-size:42px">💜</div>
          <div style="font-size:17px;font-weight:900">مستحيل</div>
          <div style="font-size:11px;color:var(--muted);font-weight:600;text-align:center">مش هتكسب! 😏</div>
        </button>
      </div>

      <button onclick="startGame('xo', null)" style="margin-top:16px;padding:10px 22px;background:var(--bg-2);border:1px solid var(--border);border-radius:12px;color:var(--ink);cursor:pointer;font:700 14px inherit;font-family:inherit">← رجوع</button>
    </div>
  `;
}

/* تشغيل ضد الكمبيوتر */
function startXOAI(difficulty) {
  startGame('xo', difficulty);
}

/* تشغيل ضد صديق */
function startXOFriend() {
  startGame('xo', 'friend');
}

/* ضد صديق (لاعبين) */
function startXOvsFriend(area) {
  area = area || document.getElementById('gameArea');

  let cells = Array(9).fill(null);
  let turn = 'X';
  let active = true;
  let xWins = 0, oWins = 0, draws = 0;
  const winLines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  area.innerHTML = `
    <div style="display:flex;justify-content:center;gap:12px;margin-bottom:20px;flex-wrap:wrap">
      <div style="background:var(--bg-2);border:2px solid var(--accent);border-radius:14px;padding:10px 18px;text-align:center;min-width:90px">
        <div style="font-size:11px;color:var(--muted);font-weight:700">اللاعب X</div>
        <div style="font-size:22px;font-weight:900;margin-top:4px;color:var(--accent)" id="xoXWins">0</div>
      </div>
      <div style="background:var(--bg-2);border:2px solid var(--border);border-radius:14px;padding:10px 18px;text-align:center;min-width:90px">
        <div style="font-size:11px;color:var(--muted);font-weight:700">تعادل</div>
        <div style="font-size:22px;font-weight:900;margin-top:4px" id="xoDraws">0</div>
      </div>
      <div style="background:var(--bg-2);border:2px solid var(--accent-3);border-radius:14px;padding:10px 18px;text-align:center;min-width:90px">
        <div style="font-size:11px;color:var(--muted);font-weight:700">اللاعب O</div>
        <div style="font-size:22px;font-weight:900;margin-top:4px;color:var(--accent-3)" id="xoOWins">0</div>
      </div>
    </div>

    <div id="xoBoard"></div>
    <p class="status" id="xoStatus">دور اللاعب X</p>
    <button class="reset" id="xoReset">🔄 جولة جديدة</button>
    <button class="reset" onclick="startGame('xo', null)" style="background:var(--gradient-2)">↩ رجوع</button>
  `;

  const board = document.getElementById('xoBoard');
  const status = document.getElementById('xoStatus');

  function build() {
    board.innerHTML = '';
    cells.forEach((v, i) => {
      const b = document.createElement('button');
      b.className = 'cell';
      b.onclick = () => play(i);
      board.appendChild(b);
    });
    render();
  }

  function render() {
    [...board.children].forEach((b, i) => {
      b.textContent = cells[i] || '';
      b.className = 'cell' + (cells[i] === 'X' ? ' x' : cells[i] === 'O' ? ' o' : '');
      b.disabled = !!cells[i] || !active;
    });
    if (active) status.textContent = 'دور اللاعب ' + turn;
  }

  function winner() {
    for (const [a, b, c] of winLines) {
      if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) return cells[a];
    }
    if (cells.every(c => c)) return 'D';
    return null;
  }

  function play(i) {
    if (cells[i] || !active) return;
    cells[i] = turn;
    const w = winner();

    if (w) {
      active = false;
      if (w === 'D') { draws++; status.textContent = '🤝 تعادل!'; }
      else if (w === 'X') { xWins++; status.textContent = '🎉 اللاعب X كسب!'; }
      else { oWins++; status.textContent = '🎉 اللاعب O كسب!'; }
      document.getElementById('xoXWins').textContent = xWins;
      document.getElementById('xoOWins').textContent = oWins;
      document.getElementById('xoDraws').textContent = draws;
      document.getElementById('currentScore').textContent = xWins + oWins + draws;
      render();
      return;
    }

    turn = turn === 'X' ? 'O' : 'X';
    render();
  }

  document.getElementById('xoReset').onclick = () => {
    cells = Array(9).fill(null);
    turn = 'X';
    active = true;
    build();
  };

  build();
}

/* ضد الكمبيوتر */
function startXOvsAI(area, difficulty, best) {
  area = area || document.getElementById('gameArea');

  const names = { easy: '🟢 سهل', medium: '🟡 متوسط', hard: '🔴 صعب', legendary: '💜 مستحيل' };
  document.getElementById('gameTitle').textContent = '❌ إكس أوه ' + (names[difficulty] || '');

  best = best || state.scores['xo_' + difficulty] || 0;

  const aiConfig = {
    easy:      { mistakeRate: 0.70 },
    medium:    { mistakeRate: 0.40 },
    hard:      { mistakeRate: 0.15 },
    legendary: { mistakeRate: 0 }
  };
  const cfg = aiConfig[difficulty] || aiConfig.medium;

  let cells = Array(9).fill(null);
  let turn = 'X';
  let active = true;
  let wins = 0, losses = 0, draws = 0;
  const winLines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  area.innerHTML = `
    <p class="best">🏆 أفضل: ${best}</p>

    <div style="display:flex;justify-content:center;gap:10px;margin-bottom:16px;flex-wrap:wrap">
      <div style="background:var(--bg-2);border:2px solid var(--success);border-radius:14px;padding:8px 14px;text-align:center;min-width:80px">
        <div style="font-size:10px;color:var(--muted);font-weight:700">فزت</div>
        <div style="font-size:20px;font-weight:900;margin-top:4px;color:var(--success)" id="xoAiWins">0</div>
      </div>
      <div style="background:var(--bg-2);border:2px solid var(--border);border-radius:14px;padding:8px 14px;text-align:center;min-width:80px">
        <div style="font-size:10px;color:var(--muted);font-weight:700">تعادل</div>
        <div style="font-size:20px;font-weight:900;margin-top:4px" id="xoAiDraws">0</div>
      </div>
      <div style="background:var(--bg-2);border:2px solid var(--danger);border-radius:14px;padding:8px 14px;text-align:center;min-width:80px">
        <div style="font-size:10px;color:var(--muted);font-weight:700">خسرت</div>
        <div style="font-size:20px;font-weight:900;margin-top:4px;color:var(--danger)" id="xoAiLosses">0</div>
      </div>
    </div>

    <div id="xoBoard"></div>
    <p class="status" id="xoStatus">دورك — اختار مربع</p>
    <button class="reset" id="xoReset">🔄 جولة جديدة</button>
    <button class="reset" onclick="startGame('xo', null)" style="background:var(--gradient-2)">↩ رجوع</button>
  `;

  const board = document.getElementById('xoBoard');
  const status = document.getElementById('xoStatus');

  function build() {
    board.innerHTML = '';
    cells.forEach((v, i) => {
      const b = document.createElement('button');
      b.className = 'cell';
      b.onclick = () => playerPlay(i);
      board.appendChild(b);
    });
    render();
  }

  function render() {
    [...board.children].forEach((b, i) => {
      b.textContent = cells[i] || '';
      b.className = 'cell' + (cells[i] === 'X' ? ' x' : cells[i] === 'O' ? ' o' : '');
      b.disabled = !!cells[i] || !active;
    });
    if (active && turn === 'X') status.textContent = 'دورك — اختار مربع';
    else if (active && turn === 'O') status.textContent = '🤖 الكمبيوتر بيفكر...';
  }

  function winner() {
    for (const [a, b, c] of winLines) {
      if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) return cells[a];
    }
    if (cells.every(c => c)) return 'D';
    return null;
  }

  function playerPlay(i) {
    if (cells[i] || !active || turn !== 'X') return;
    cells[i] = 'X';
    const w = winner();
    if (w) return endRound(w);
    turn = 'O';
    render();
    setTimeout(aiPlay, 450);
  }

  function aiPlay() {
    if (!active || turn !== 'O') return;
    let move;
    if (Math.random() < cfg.mistakeRate) {
      const empty = cells.map((v, i) => v === null ? i : -1).filter(i => i >= 0);
      move = empty[Math.floor(Math.random() * empty.length)];
    } else {
      move = getBestMove();
    }
    if (move < 0) return;
    cells[move] = 'O';
    const w = winner();
    if (w) return endRound(w);
    turn = 'X';
    render();
  }

  function getBestMove() {
    let bestScore = -Infinity;
    let bestMove = -1;
    for (let i = 0; i < 9; i++) {
      if (cells[i] === null) {
        cells[i] = 'O';
        const score = minimax(cells, 0, false, -Infinity, Infinity);
        cells[i] = null;
        if (score > bestScore) { bestScore = score; bestMove = i; }
      }
    }
    return bestMove;
  }

  function minimax(b, depth, isMax, alpha, beta) {
    const w = checkWinner(b);
    if (w === 'O') return 10 - depth;
    if (w === 'X') return depth - 10;
    if (b.every(c => c)) return 0;
    if (isMax) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (b[i] === null) {
          b[i] = 'O';
          best = Math.max(best, minimax(b, depth + 1, false, alpha, beta));
          b[i] = null;
          alpha = Math.max(alpha, best);
          if (beta <= alpha) break;
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (b[i] === null) {
          b[i] = 'X';
          best = Math.min(best, minimax(b, depth + 1, true, alpha, beta));
          b[i] = null;
          beta = Math.min(beta, best);
          if (beta <= alpha) break;
        }
      }
      return best;
    }
  }

  function checkWinner(b) {
    for (const [a, c, d] of winLines) {
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
    }
    return null;
  }

  function endRound(w) {
    active = false;
    let score = 0;
    if (w === 'X') {
      wins++;
      status.textContent = '🎉 كسبت! برافو';
      score = { easy: 50, medium: 100, hard: 200, legendary: 400 }[difficulty] || 50;
      recordScore('xo', difficulty, score);
    } else if (w === 'O') {
      losses++;
      status.textContent = '😅 الكمبيوتر كسب';
      score = 0;
    } else {
      draws++;
      status.textContent = '🤝 تعادل';
      score = 10;
      recordScore('xo', difficulty, score);
    }
    document.getElementById('xoAiWins').textContent = wins;
    document.getElementById('xoAiLosses').textContent = losses;
    document.getElementById('xoAiDraws').textContent = draws;
    document.getElementById('currentScore').textContent = score;
    render();
  }

  document.getElementById('xoReset').onclick = () => {
    cells = Array(9).fill(null);
    turn = 'X';
    active = true;
    build();
  };

  build();
}


/* ===== 20. الأفعى ===== */
/* ===== الأفعى - نسخة محسّنة ===== */
function initSnake(area, difficulty, best) {
  const speeds = {
    easy: 220, medium: 160, hard: 110, legendary: 70
  };
  const baseSpeed = speeds[difficulty] || 160;
  const size = 20; // حجم الخلية (أكبر شوية للوضوح)
  const cols = 15;
  const rows = 15;

  area.innerHTML = `
    <style>
      .snake-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        user-select: none;
      }
      .snake-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        max-width: 340px;
        gap: 10px;
      }
      .snake-stat {
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 8px 14px;
        text-align: center;
        flex: 1;
      }
      .snake-stat-label {
        font-size: 10px;
        color: var(--muted);
        font-weight: 700;
      }
      .snake-stat-val {
        font-size: 18px;
        font-weight: 900;
        color: var(--accent);
      }
      #snakeCanvas {
        display: block;
        border-radius: 16px;
        background: var(--bg-2);
        border: 2px solid var(--border);
        touch-action: none;
        box-shadow: 0 10px 30px rgba(0,0,0,0.4), 0 0 30px rgba(0, 245, 255, 0.15);
        max-width: 100%;
        height: auto;
      }
      .snake-controls {
        display: grid;
        grid-template-columns: repeat(3, 60px);
        gap: 8px;
        justify-content: center;
      }
      .snake-controls button {
        font-size: 22px;
        padding: 14px 0;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: var(--bg-2);
        color: var(--ink);
        cursor: pointer;
        font-family: inherit;
        font-weight: 900;
        transition: all 0.1s;
        touch-action: manipulation;
      }
      .snake-controls button:active {
        background: var(--accent);
        color: var(--bg-1);
        transform: scale(0.95);
      }
      .snake-controls .empty {
        background: transparent;
        border: none;
        cursor: default;
      }
    </style>

    <div class="snake-wrap">
      <div class="snake-header">
        <div class="snake-stat">
          <div class="snake-stat-label">النقاط</div>
          <div class="snake-stat-val" id="snakeScore">0</div>
        </div>
        <div class="snake-stat">
          <div class="snake-stat-label">الطول</div>
          <div class="snake-stat-val" id="snakeLength">1</div>
        </div>
        <div class="snake-stat">
          <div class="snake-stat-label">أفضل</div>
          <div class="snake-stat-val" id="snakeBestVal">${best || 0}</div>
        </div>
      </div>

      <canvas id="snakeCanvas" width="${cols * size}" height="${rows * size}"></canvas>

      <div class="snake-controls">
        <div class="empty"></div>
        <button data-dir="up">↑</button>
        <div class="empty"></div>
        <button data-dir="left">←</button>
        <button data-dir="down">↓</button>
        <button data-dir="right">→</button>
      </div>
    </div>
  `;

  const canvas = document.getElementById('snakeCanvas');
  const ctx = canvas.getContext('2d');

  let snake = [{ x: 7, y: 7 }];
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let food = null;
  let score = 0;
  let speed = baseSpeed;
  let gameOver = false;
  let started = false;
  let tickInterval = null;
  let lastTick = 0;

  function placeFood() {
    const empty = [];
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        if (!snake.some(s => s.x === x && s.y === y)) {
          empty.push({ x, y });
        }
      }
    }
    if (empty.length === 0) return null;
    return empty[Math.floor(Math.random() * empty.length)];
  }

  function reset() {
    snake = [{ x: 7, y: 7 }];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    speed = baseSpeed;
    gameOver = false;
    started = false;
    food = placeFood();
    updateStats();
    draw();
  }

  function updateStats() {
    const scoreEl = document.getElementById('snakeScore');
    const lenEl = document.getElementById('snakeLength');
    if (scoreEl) scoreEl.textContent = score;
    if (lenEl) lenEl.textContent = snake.length;
    const curEl = document.getElementById('currentScore');
    if (curEl) curEl.textContent = score;
  }

  function setDir(newDir) {
    // منع الانعكاس 180 درجة
    if (newDir.x === -dir.x && newDir.y === -dir.y) return;
    if (newDir.x === dir.x && newDir.y === dir.y) return;
    nextDir = newDir;
    if (!started) started = true;
  }

  function tick() {
    if (gameOver) return;

    dir = nextDir;

    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

    // اصطدام بالحوائط
    if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
      return endSnake();
    }

    // اصطدام بالجسم
    if (snake.some((s, i) => i > 0 && s.x === head.x && s.y === head.y)) {
      return endSnake();
    }

    snake.unshift(head);

    if (food && head.x === food.x && head.y === food.y) {
      score += 10;
      food = placeFood();
      // زيادة السرعة تدريجياً
      if (speed > 60 && score % 50 === 0) {
        speed -= 8;
        clearInterval(tickInterval);
        startLoop();
      }
      updateStats();
    } else {
      snake.pop();
    }

    draw();
  }

  function draw() {
    // خلفية
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-2').trim() || '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // شبكة خفيفة
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * size, 0);
      ctx.lineTo(i * size, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= rows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * size);
      ctx.lineTo(canvas.width, i * size);
      ctx.stroke();
    }

    // الفood (تفاحة)
    if (food) {
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff006e';
      ctx.fillStyle = '#ff006e';
      ctx.beginPath();
      const cx = food.x * size + size / 2;
      const cy = food.y * size + size / 2;
      ctx.arc(cx, cy, size / 2 - 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // الأفعى
    snake.forEach((s, i) => {
      const isHead = i === 0;
      
      ctx.save();
      
      if (isHead) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00f5ff';
        ctx.fillStyle = '#00f5ff';
      } else {
        const alpha = 1 - (i / snake.length) * 0.5;
        ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00ff88';
      }

      const x = s.x * size + 2;
      const y = s.y * size + 2;
      const w = size - 4;
      const h = size - 4;
      const radius = 5;

      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.fill();
      
      // عيون الرأس
      if (isHead) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#0a0a1a';
        let eye1x, eye1y, eye2x, eye2y;
        if (dir.x === 1) { eye1x = x + w - 6; eye1y = y + 5; eye2x = x + w - 6; eye2y = y + h - 5; }
        else if (dir.x === -1) { eye1x = x + 6; eye1y = y + 5; eye2x = x + 6; eye2y = y + h - 5; }
        else if (dir.y === -1) { eye1x = x + 5; eye1y = y + 6; eye2x = x + w - 5; eye2y = y + 6; }
        else { eye1x = x + 5; eye1y = y + h - 6; eye2x = x + w - 5; eye2y = y + h - 6; }
        
        ctx.beginPath();
        ctx.arc(eye1x, eye1y, 2.5, 0, Math.PI * 2);
        ctx.arc(eye2x, eye2y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    });
  }

  function endSnake() {
    gameOver = true;
    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
    }

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 16px;
      z-index: 9999;
      color: #fff;
      text-align: center;
      padding: 20px;
    `;
    overlay.innerHTML = `
      <div style="font-size: 80px">💥</div>
      <div style="font-size: 28px; font-weight: 900; color: var(--danger)">انتهت اللعبة!</div>
      <div style="font-size: 22px; font-weight: 800">النقاط: ${score}</div>
      <div style="font-size: 16px; opacity: 0.8">الطول: ${snake.length}</div>
      <button class="reset" onclick="this.closest('div[style]').remove(); startGame('snake', '${difficulty}')">🔄 حاول تاني</button>
      <button class="reset" onclick="this.closest('div[style]').remove(); backHome()" style="background: var(--gradient-2)">🏠 الرئيسية</button>
    `;
    document.body.appendChild(overlay);

    setTimeout(() => {
      endGame('snake', difficulty, score);
    }, 2000);
  }

  function startLoop() {
    if (tickInterval) clearInterval(tickInterval);
    tickInterval = setInterval(tick, speed);
  }

  // أزرار التحكم
  area.querySelectorAll('.snake-controls button[data-dir]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const d = btn.dataset.dir;
      if (d === 'up') setDir({ x: 0, y: -1 });
      if (d === 'down') setDir({ x: 0, y: 1 });
      if (d === 'left') setDir({ x: -1, y: 0 });
      if (d === 'right') setDir({ x: 1, y: 0 });
    });
  });

  // كيبورد
  document.onkeydown = (e) => {
    if (activeGame !== 'snake') return;
    if (e.key === 'ArrowUp') { e.preventDefault(); setDir({ x: 0, y: -1 }); }
    if (e.key === 'ArrowDown') { e.preventDefault(); setDir({ x: 0, y: 1 }); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); setDir({ x: -1, y: 0 }); }
    if (e.key === 'ArrowRight') { e.preventDefault(); setDir({ x: 1, y: 0 }); }
  };

  // السحب بالإصبع
  let touchStartX = 0, touchStartY = 0;
  canvas.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }, { passive: true });

  canvas.addEventListener('touchend', (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);

    if (Math.max(adx, ady) < 25) return;

    if (adx > ady) setDir({ x: dx > 0 ? 1 : -1, y: 0 });
    else setDir({ x: 0, y: dy > 0 ? 1 : -1 });
  }, { passive: true });

  // تشغيل
  reset();
  startLoop();
}

/* ===== 21. رياضيات ===== */
function initMath(area, difficulty, best) {
  // عدد الأرقام بيزيد حسب الصعوبة
  const ranges = { easy: 10, medium: 25, hard: 50, legendary: 100 };
  const maxNum = ranges[difficulty] || 25;
  const durations = { easy: 40, medium: 30, hard: 25, legendary: 20 };
  let timeLeft = durations[difficulty] || 30;

  let score = 0, answer = 0, running = true;

  area.innerHTML = `
    <p class="best">🏆 أفضل: ${best}</p>
    <p class="status" id="mathStatus">النقاط: 0 — الوقت: ${timeLeft}</p>
    <p class="math-eq" id="mathEq">جاهز؟</p>
    <div class="math-opts" id="mathOpts"></div>
  `;

  const eqEl = document.getElementById('mathEq');
  const optsEl = document.getElementById('mathOpts');
  const status = document.getElementById('mathStatus');

  function newEq() {
    const a = Math.ceil(Math.random() * maxNum);
    const b = Math.ceil(Math.random() * maxNum);
    const ops = difficulty === 'easy' ? ['+'] : difficulty === 'medium' ? ['+', '-'] : ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    if (op === '+') answer = a + b;
    else if (op === '-') answer = a - b;
    else answer = a * b;

    eqEl.textContent = a + ' ' + op + ' ' + b + ' = ؟';

    const opts = new Set([answer]);
    while (opts.size < 3) {
      const offset = Math.max(1, Math.floor(Math.random() * Math.max(5, maxNum / 2))) * (Math.random() < 0.5 ? 1 : -1);
      opts.add(answer + offset);
    }
    optsEl.innerHTML = '';
    shuffle([...opts]).forEach(v => {
      const b2 = document.createElement('button');
      b2.textContent = v;
      b2.onclick = () => {
        if (!running) return;
        if (v === answer) {
          score += 10;
          status.textContent = 'النقاط: ' + score + ' — الوقت: ' + timeLeft;
          document.getElementById('currentScore').textContent = score;
        } else {
          timeLeft = Math.max(0, timeLeft - 2);
        }
        newEq();
      };
      optsEl.appendChild(b2);
    });
  }

  clearInterval(mathTimer);
  mathTimer = setInterval(() => {
    timeLeft--;
    status.textContent = 'النقاط: ' + score + ' — الوقت: ' + timeLeft;
    if (timeLeft <= 0) {
      clearInterval(mathTimer);
      running = false;
      endGame('math', difficulty, score);
    }
  }, 1000);

  newEq();
}

/* ===== 22. تخمين الرقم ===== */
function initGuess(area, difficulty, best) {
  // عدد الأرقام المتاح + عدد المحاولات
  const maxMap = { easy: 30, medium: 50, hard: 100, legendary: 200 };
  const triesMap = { easy: 10, medium: 8, hard: 6, legendary: 5 };
  const maxNum = maxMap[difficulty] || 50;
  const maxTries = triesMap[difficulty] || 8;

  let target = Math.ceil(Math.random() * maxNum);
  let tries = 0;

  area.innerHTML = `
    <p class="best">🏆 أفضل: ${best}</p>
    <p class="status">فكرت في رقم من 1 لـ ${maxNum}</p>
    <p class="status" style="font-size:13px;color:var(--muted)">محاولات مسموحة: ${maxTries}</p>
    <div class="guess-input-wrap">
      <input type="number" id="guessInput" min="1" max="${maxNum}" placeholder="؟">
      <button id="guessGo">جرّب</button>
    </div>
    <p class="status" id="guessStatus"></p>
    <button class="reset" id="guessReset">لعبة جديدة</button>
  `;

  const input = document.getElementById('guessInput');
  const status = document.getElementById('guessStatus');

  function doGuess() {
    const v = Number(input.value);
    if (!v || v < 1 || v > maxNum) return;
    tries++;

    if (v === target) {
      const baseScores = { easy: 50, medium: 100, hard: 200, legendary: 400 };
      let score = (baseScores[difficulty] || 100) - (tries - 1) * 10;
      score = Math.max(20, score);
      status.textContent = 'صح! الرقم كان ' + target + ' 🎉';
      document.getElementById('currentScore').textContent = score;
      recordScore('guess', difficulty, score);
      input.disabled = true;
      return;
    }

    if (tries >= maxTries) {
      status.textContent = 'خلصت المحاولات! الرقم كان ' + target + ' 😅';
      input.disabled = true;
      recordScore('guess', difficulty, 5);
      return;
    }

    status.textContent = (v < target ? 'أكبر من كده ⬆️' : 'أصغر من كده ⬇️') + ' (' + (maxTries - tries) + ' متبقي)';
    input.value = '';
    input.focus();
  }

  document.getElementById('guessGo').onclick = doGuess;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doGuess();
  });

  document.getElementById('guessReset').onclick = () => {
    target = Math.ceil(Math.random() * maxNum);
    tries = 0;
    input.value = '';
    input.disabled = false;
    status.textContent = '';
    input.focus();
  };
}

/* ===== 23. التشغيل ===== */
window.addEventListener('DOMContentLoaded', () => {
  loadState();
  checkStreak();
  applyTheme(state.currentTheme);

  // Splash Screen
  setTimeout(() => {
    document.getElementById('splash').classList.add('hide');
    setTimeout(() => {
      if (!state.playerName) {
        document.getElementById('nameScreen').classList.add('active');
      } else {
        document.getElementById('app').classList.add('active');
        renderAll();
      }
    }, 500);
  }, 2200);

  // حفظ الاسم
  const nameBtn = document.getElementById('saveNameBtn');
  const nameInput = document.getElementById('playerNameInput');

  nameBtn.onclick = () => {
    const name = nameInput.value.trim();
    if (!name) {
      showToast('⚠️ اكتب اسمك الأول');
      return;
    }
    state.playerName = name;
    saveState();
    document.getElementById('nameScreen').classList.remove('active');
    document.getElementById('app').classList.add('active');
    renderAll();
    showToast('أهلاً بيك يا ' + name + ' 🎉');
  };

  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') nameBtn.click();
  });

  // إغلاق المودالات
  document.getElementById('shopModal').addEventListener('click', (e) => {
    if (e.target.id === 'shopModal') closeShop();
  });
  document.getElementById('dailyModal').addEventListener('click', (e) => {
    if (e.target.id === 'dailyModal') closeDaily();
  });
  document.getElementById('difficultyModal').addEventListener('click', (e) => {
    if (e.target.id === 'difficultyModal') closeDifficulty();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeShop();
      closeDaily();
      closeDifficulty();
    }
  });
});
/* ===== 24. حجر ورقة مقص ===== */
function initRPS(area, difficulty, best) {
  const opts = ['✊', '✋', '✌️'];
  const beats = { '✊': '✌️', '✋': '✊', '✌️': '✋' };

  // عدد الجولات المطلوب للفوز
  const roundsToWin = { easy: 2, medium: 3, hard: 4, legendary: 5 };
  const target = roundsToWin[difficulty] || 3;
  const aiSmartness = { easy: 0.2, medium: 0.4, hard: 0.6, legendary: 0.85 };

  let playerWins = 0, aiWins = 0, draws = 0;

  area.innerHTML = `
    <p class="best">🏆 أفضل: ${best}</p>
    <p class="status">🎯 أول واحد يوصل ${target} فوز هو الفايز</p>
    <p class="status" id="rpsScore">أنت: 0 — الخصم: 0</p>
    <div class="rps-choices">
      <button data-c="✊">✊</button>
      <button data-c="✋">✋</button>
      <button data-c="✌️">✌️</button>
    </div>
    <div class="rps-result" id="rpsResult"></div>
    <p class="status" id="rpsStatus"></p>
    <button class="reset" id="rpsReset">لعبة جديدة</button>
  `;

  const resEl = document.getElementById('rpsResult');
  const statEl = document.getElementById('rpsStatus');
  const scoreEl = document.getElementById('rpsScore');

  function aiChoose() {
    // كل ما الصعوبة تعلى، الـ AI يبقى أذكى
    if (Math.random() < aiSmartness[difficulty]) {
      // يختار اللي يغلب حركة اللاعب السابقة
      const lastPlayer = document.querySelector('.rps-choices button:last-picked');
      return opts[Math.floor(Math.random() * 3)];
    }
    return opts[Math.floor(Math.random() * 3)];
  }

  function play(me) {
    const cpu = aiChoose();
    resEl.innerHTML = `<span>${me}</span><span style="font-size:20px;color:var(--muted)">VS</span><span>${cpu}</span>`;

    if (me === cpu) {
      draws++;
      statEl.textContent = 'تعادل!';
    } else if (beats[me] === cpu) {
      playerWins++;
      statEl.textContent = 'كسبت الجولة! 🎉';
    } else {
      aiWins++;
      statEl.textContent = 'خسرت الجولة 😅';
    }

    scoreEl.textContent = 'أنت: ' + playerWins + ' — الخصم: ' + aiWins;
    document.getElementById('currentScore').textContent = playerWins * 10;

    // فحص الفوز
    if (playerWins >= target) {
      const baseScores = { easy: 80, medium: 150, hard: 280, legendary: 500 };
      setTimeout(() => {
        endGame('rps', difficulty, baseScores[difficulty] || 150);
      }, 800);
      disableButtons();
    } else if (aiWins >= target) {
      setTimeout(() => {
        endGame('rps', difficulty, playerWins * 20);
      }, 800);
      disableButtons();
    }
  }

  function disableButtons() {
    area.querySelectorAll('.rps-choices button').forEach(b => b.disabled = true);
  }

  area.querySelectorAll('.rps-choices button').forEach(btn => {
    btn.onclick = () => play(btn.dataset.c);
  });

  document.getElementById('rpsReset').onclick = () => {
    playerWins = 0; aiWins = 0; draws = 0;
    resEl.innerHTML = '';
    statEl.textContent = '';
    scoreEl.textContent = 'أنت: 0 — الخصم: 0';
    document.getElementById('currentScore').textContent = '0';
    area.querySelectorAll('.rps-choices button').forEach(b => b.disabled = false);
  };
}

/* ===== 25. اضرب الخلد ===== */
function initWhack(area, difficulty, best) {
  // سرعة ظهور الخلد + مدة اللعب
  const speeds = { easy: 900, medium: 700, hard: 500, legendary: 350 };
  const durations = { easy: 30, medium: 30, hard: 30, legendary: 25 };
  const popSpeed = speeds[difficulty] || 700;
  let timeLeft = durations[difficulty] || 30;

  let score = 0, running = true;
  let holes = [];

  area.innerHTML = `
    <p class="best">🏆 أفضل: ${best}</p>
    <p class="status" id="whackStatus">النقاط: 0 — الوقت: ${timeLeft}</p>
    <div id="whackBoard"></div>
  `;

  const board = document.getElementById('whackBoard');
  const status = document.getElementById('whackStatus');

  function build() {
    board.innerHTML = '';
    holes = [];
    for (let i = 0; i < 9; i++) {
      const h = document.createElement('div');
      h.className = 'hole';
      h.onclick = () => hit(i);
      board.appendChild(h);
      holes.push(h);
    }
  }

  function hit(i) {
    if (!running || !holes[i].classList.contains('up')) return;
    holes[i].classList.remove('up');
    holes[i].textContent = '';
    score += 10;
    status.textContent = 'النقاط: ' + score + ' — الوقت: ' + timeLeft;
    document.getElementById('currentScore').textContent = score;
  }

  function popRandom() {
    if (!running) return;
    // ممكن يظهر أكتر من واحد في الصعوبات العالية
    const simultaneous = difficulty === 'legendary' ? 2 : 1;
    for (let k = 0; k < simultaneous; k++) {
      const free = holes.filter(h => !h.classList.contains('up'));
      if (free.length === 0) return;
      const h = free[Math.floor(Math.random() * free.length)];
      h.classList.add('up');
      h.textContent = '🐹';
      // يختفي لوحده بعد فترة
      setTimeout(() => {
        if (h.classList.contains('up')) {
          h.classList.remove('up');
          h.textContent = '';
        }
      }, popSpeed - 100);
    }
  }

  clearInterval(whackTimer);
  clearInterval(whackUpTimer);

  whackUpTimer = setInterval(popRandom, popSpeed);
  whackTimer = setInterval(() => {
    timeLeft--;
    status.textContent = 'النقاط: ' + score + ' — الوقت: ' + timeLeft;
    if (timeLeft <= 0) {
      clearInterval(whackTimer);
      clearInterval(whackUpTimer);
      running = false;
      endGame('whack', difficulty, score);
    }
  }, 1000);

  build();
}

/* ===== 26. سؤال وجواب ===== */
const QUIZ_BANK = [
  { q: 'ما عاصمة مصر؟', opts: ['القاهرة', 'الإسكندرية', 'أسوان'], a: 0 },
  { q: 'أكبر كوكب في المجموعة الشمسية؟', opts: ['الأرض', 'المشتري', 'زحل'], a: 1 },
  { q: 'كم قارة في العالم؟', opts: ['5', '6', '7'], a: 2 },
  { q: 'أسرع حيوان بري؟', opts: ['الفهد', 'الأسد', 'الحصان'], a: 0 },
  { q: 'أطول نهر في العالم؟', opts: ['الأمازون', 'النيل', 'الفرات'], a: 1 },
  { q: 'أكبر محيط في العالم؟', opts: ['الأطلسي', 'الهادي', 'الهندي'], a: 1 },
  { q: 'أعلى جبل في العالم؟', opts: ['إفرست', 'كليمنجارو', 'الألب'], a: 0 },
  { q: 'أول رائد فضاء وصل للقمر؟', opts: ['جاجارين', 'أرمسترونج', 'ألدرين'], a: 1 },
  { q: 'ما أكبر قارة في العالم؟', opts: ['أفريقيا', 'آسيا', 'أوروبا'], a: 1 },
  { q: 'كم عدد أيام السنة الكبيسة؟', opts: ['364', '365', '366'], a: 2 },
  { q: 'ما الغاز الذي نتنفسه؟', opts: ['الأكسجين', 'النيتروجين', 'الهيدروجين'], a: 0 },
  { q: 'ما عاصمة السعودية؟', opts: ['جدة', 'الرياض', 'مكة'], a: 1 },
  { q: 'ما عاصمة اليابان؟', opts: ['طوكيو', 'أوساكا', 'كيوتو'], a: 0 },
  { q: 'كم عدد ألوان قوس قزح؟', opts: ['5', '6', '7'], a: 2 },
  { q: 'ما أسرع طائر في العالم؟', opts: ['النسر', 'الصقر', 'السنونو'], a: 1 },
  { q: 'ما أكبر دولة عربية من حيث المساحة؟', opts: ['مصر', 'الجزائر', 'السعودية'], a: 1 },
  { q: 'كم عدد الحواس الأساسية؟', opts: ['4', '5', '6'], a: 1 },
  { q: 'ما الكوكب الأحمر؟', opts: ['الزهرة', 'المريخ', 'عطارد'], a: 1 },
  { q: 'ما عاصمة فرنسا؟', opts: ['روما', 'باريس', 'مدريد'], a: 1 },
  { q: 'في أي قارة تقع مصر؟', opts: ['آسيا', 'أفريقيا', 'أوروبا'], a: 1 },
  { q: 'ما أطول حيوان في العالم؟', opts: ['الفيل', 'الزرافة', 'الجمل'], a: 1 },
  { q: 'ما عدد أسنان الإنسان البالغ؟', opts: ['28', '30', '32'], a: 2 },
  { q: 'ما العضو الذي يضخ الدم؟', opts: ['الرئة', 'القلب', 'الكبد'], a: 1 },
  { q: 'كم عدد ساعات اليوم؟', opts: ['12', '24', '48'], a: 1 },
  { q: 'ما أكبر حيوان في العالم؟', opts: ['الفيل', 'الحوت الأزرق', 'القرش'], a: 1 },
  { q: 'ما البحر الذي يفصل مصر عن السعودية؟', opts: ['المتوسط', 'الأحمر', 'العرب'], a: 1 },
  { q: 'من رسم الموناليزا؟', opts: ['بيكاسو', 'دافنشي', 'فان جوخ'], a: 1 },
  { q: 'ما الكوكب الأقرب للشمس؟', opts: ['الزهرة', 'عطارد', 'الأرض'], a: 1 },
  { q: 'ما أكبر صحراء في العالم؟', opts: ['الكبرى', 'الصحراء الشرقية', 'صحراء النقب'], a: 0 },
  { q: 'كم عدد لاعبي فريق كرة القدم؟', opts: ['9', '10', '11'], a: 2 },
  { q: 'ما عاصمة إيطاليا؟', opts: ['ميلانو', 'روما', 'نابولي'], a: 1 },
  { q: 'ما الحيوان الملقب بسفينة الصحراء؟', opts: ['الحصان', 'الجمل', 'الفيل'], a: 1 },
  { q: 'كم عدد أضلاع المثلث؟', opts: ['2', '3', '4'], a: 1 },
  { q: 'ما أكبر مدينة في مصر؟', opts: ['الإسكندرية', 'القاهرة', 'الجيزة'], a: 1 },
  { q: 'ما السورة الأولى في القرآن؟', opts: ['البقرة', 'الفاتحة', 'الناس'], a: 1 }
];

function initQuiz(area, difficulty, best) {
  // عدد الأسئلة حسب الصعوبة
  const questionCount = { easy: 5, medium: 8, hard: 12, legendary: 15 };
  const totalQ = questionCount[difficulty] || 8;

  // نختار أسئلة عشوائية
  const shuffled = shuffle(QUIZ_BANK.slice()).slice(0, totalQ);

  let idx = 0, score = 0;

  area.innerHTML = `
    <p class="best">🏆 أفضل: ${best}</p>
    <p class="status" id="quizScore"></p>
    <p class="quiz-q" id="quizQ"></p>
    <div class="quiz-opts" id="quizOpts"></div>
    <style>
      .quiz-q { font-size: 18px; font-weight: 800; margin: 16px 0; line-height: 1.6; }
      .quiz-opts { display: grid; gap: 10px; margin-top: 16px; }
      .quiz-opts button {
        background: var(--bg-2);
        border: 2px solid var(--border);
        border-radius: 14px;
        padding: 16px;
        font: 700 15px inherit;
        cursor: pointer;
        color: var(--ink);
        transition: all 0.2s;
        font-family: inherit;
      }
      .quiz-opts button:hover:not(:disabled) {
        transform: translateY(-2px);
        background: var(--card-hover);
        border-color: var(--accent);
      }
      .quiz-opts button.correct {
        background: var(--success);
        color: var(--bg-1);
        border-color: var(--success);
        box-shadow: 0 0 25px rgba(0, 255, 136, 0.5);
      }
      .quiz-opts button.wrong {
        background: var(--danger);
        color: #fff;
        border-color: var(--danger);
      }
    </style>
  `;

  const qEl = document.getElementById('quizQ');
  const optsEl = document.getElementById('quizOpts');
  const scoreEl = document.getElementById('quizScore');

  function render() {
    if (idx >= totalQ) {
      // خلص الأسئلة
      const baseScores = { easy: 60, medium: 120, hard: 250, legendary: 500 };
      const perfectBonus = score === totalQ ? 50 : 0;
      const finalScore = Math.floor(((baseScores[difficulty] || 120) * score / totalQ)) + perfectBonus;
      endGame('quiz', difficulty, finalScore);
      return;
    }

    const q = shuffled[idx];
    scoreEl.textContent = 'سؤال ' + (idx + 1) + ' من ' + totalQ;
    qEl.textContent = q.q;
    optsEl.innerHTML = '';

    q.opts.forEach((opt, i) => {
      const b = document.createElement('button');
      b.textContent = opt;
      b.onclick = () => {
        [...optsEl.children].forEach((x, xi) => {
          x.disabled = true;
          if (xi === q.a) x.classList.add('correct');
        });
        if (i !== q.a) b.classList.add('wrong');
        else score++;
        document.getElementById('currentScore').textContent = score * 20;
        setTimeout(() => { idx++; render(); }, 900);
      };
      optsEl.appendChild(b);
    });
  }

  render();
}

/* ===== 27. سيمون ===== */
function initSimon(area, difficulty, best) {
  // سرعة الأنيميشن
  const flashSpeed = { easy: 550, medium: 420, hard: 320, legendary: 220 };
  const flashTime = flashSpeed[difficulty] || 420;

  area.innerHTML = `
    <p class="best">🏆 أفضل: ${best}</p>
    <p class="status" id="simonStatus">دوس ابدأ وذاكر الترتيب</p>
    <div id="simonBoard">
      <button class="simon-btn" id="simon0"></button>
      <button class="simon-btn" id="simon1"></button>
      <button class="simon-btn" id="simon2"></button>
      <button class="simon-btn" id="simon3"></button>
    </div>
    <button class="reset" id="simonReset">ابدأ</button>
    <style>
      #simonBoard {
        display: grid;
        grid-template-columns: repeat(2, 110px);
        grid-template-rows: repeat(2, 110px);
        gap: 12px;
        justify-content: center;
        margin: 20px auto;
      }
      .simon-btn {
        border: 3px solid var(--border);
        border-radius: 20px;
        cursor: pointer;
        opacity: 0.45;
        transition: opacity 0.15s, transform 0.15s, box-shadow 0.15s;
      }
      .simon-btn.lit {
        opacity: 1;
        transform: scale(1.05);
        box-shadow: 0 0 40px currentColor;
      }
      #simon0 { background: #ff006e; color: #ff006e; }
      #simon1 { background: #00f5ff; color: #00f5ff; }
      #simon2 { background: #ffb800; color: #ffb800; }
      #simon3 { background: #b537f2; color: #b537f2; }
    </style>
  `;

  const btns = [0,1,2,3].map(i => document.getElementById('simon' + i));
  const status = document.getElementById('simonStatus');
  let sequence = [], userStep = 0, playing = false, roundScore = 0;

  function flash(i) {
    return new Promise(res => {
      btns[i].classList.add('lit');
      setTimeout(() => {
        btns[i].classList.remove('lit');
        res();
      }, flashTime * 0.8);
    });
  }

  async function playSequence() {
    playing = false;
    status.textContent = 'بص واذكر... (' + sequence.length + ')';
    await new Promise(r => setTimeout(r, 600));
    for (const i of sequence) {
      await flash(i);
      await new Promise(r => setTimeout(r, flashTime * 0.3));
    }
    playing = true;
    userStep = 0;
    status.textContent = 'دورك! طول السلسلة: ' + sequence.length;
  }

  function nextRound() {
    sequence.push(Math.floor(Math.random() * 4));
    playSequence();
  }

  btns.forEach((b, i) => {
    b.onclick = () => {
      if (!playing) return;
      flash(i);
      if (i === sequence[userStep]) {
        userStep++;
        if (userStep === sequence.length) {
          playing = false;
          roundScore = sequence.length * 15;
          document.getElementById('currentScore').textContent = roundScore;
          status.textContent = 'صح! 🎉';
          setTimeout(nextRound, 800);
        }
      } else {
        playing = false;
        endGame('simon', difficulty, roundScore);
        sequence = [];
      }
    };
  });

  document.getElementById('simonReset').onclick = () => {
    sequence = [];
    roundScore = 0;
    document.getElementById('currentScore').textContent = '0';
    nextRound();
  };
}
/* ===== 28. تخمين الأفلام والمسلسلات ===== */

// بنك الأفلام والمسلسلات - مرتب حسب الصعوبة
const MOVIES_BANK = {
  easy: [
  { hint: '🎥 فيلم "اللمبي" بطولة مين؟', answer: 'محمد سعد', options: ['محمد سعد', 'أحمد حلمي', 'كريم عبد العزيز'] },
  { hint: '🎥 فيلم "همام في أمستردام" بطولة مين؟', answer: 'محمد هنيدي', options: ['أحمد السقا', 'أحمد عز', 'محمد هنيدي'] },
  { hint: '🎥 فيلم "إسماعيلية رايح جاي" بطولة مين؟', answer: 'محمد فؤاد', options: ['محمد فؤاد', 'عمرو دياب', 'تامر حسني'] },
  { hint: '🎥 فيلم "عسل إسود" بطولة مين؟', answer: 'أحمد حلمي', options: ['محمد سعد', 'أحمد حلمي', 'أحمد مكي'] },
  { hint: '🎥 فيلم "الفيل الأزرق" بطولة مين؟', answer: 'كريم عبد العزيز', options: ['أحمد عز', 'محمد رمضان', 'كريم عبد العزيز'] },
  { hint: '🎥 فيلم "الإرهاب والكباب" بطولة مين؟', answer: 'عادل إمام', options: ['عادل إمام', 'أحمد زكي', 'محمود عبد العزيز'] },
  { hint: '🎥 فيلم "الجزيرة" بطولة مين؟', answer: 'أحمد السقا', options: ['أحمد عز', 'أحمد السقا', 'محمد إمام'] },
  { hint: '🎥 فيلم "ولاد رزق" بطولة مين؟', answer: 'أحمد عز', options: ['أحمد السقا', 'كريم عبد العزيز', 'أحمد عز'] },
  { hint: '🎥 فيلم "عمارة يعقوبيان" بطولة مين؟', answer: 'عادل إمام', options: ['عادل إمام', 'محمد هنيدي', 'يحيى الفخراني'] },
  { hint: '🎥 فيلم "الناظر" بطولة مين؟', answer: 'علاء ولي الدين', options: ['محمد سعد', 'علاء ولي الدين', 'أحمد آدم'] },
  { hint: '🎥 فيلم "الكيت كات" بطولة مين؟', answer: 'محمود عبد العزيز', options: ['عادل إمام', 'نور الشريف', 'محمود عبد العزيز'] },
  { hint: '🎥 فيلم "الممر" بطولة مين؟', answer: 'أحمد عز', options: ['أحمد عز', 'أحمد السقا', 'أمير كرارة'] },
  { hint: '🎥 فيلم "كيرة والجن" بطولة كريم عبد العزيز و...؟', answer: 'أحمد عز', options: ['أحمد السقا', 'أحمد عز', 'محمد رمضان'] },
  { hint: '🎥 فيلم "البريء" بطولة مين؟', answer: 'أحمد زكي', options: ['أحمد زكي', 'عادل إمام', 'نور الشريف'] },
  { hint: '🎥 فيلم "أيام السادات" بطولة مين؟', answer: 'أحمد زكي', options: ['محمود عبد العزيز', 'أحمد زكي', 'يحيى الفخراني'] },
  { hint: '🎥 فيلم "أبي فوق الشجرة" بطولة مين؟', answer: 'عبد الحليم حافظ', options: ['فريد الأطرش', 'رشدي أباظة', 'عبد الحليم حافظ'] },
  { hint: '🎥 فيلم "مراتي مدير عام" بطولة شادية و...؟', answer: 'صلاح ذو الفقار', options: ['صلاح ذو الفقار', 'عمر الشريف', 'رشدي أباظة'] },
  { hint: '⭐ مين اللي بيتلقب بـ"الزعيم"؟', answer: 'عادل إمام', options: ['أحمد زكي', 'عادل إمام', 'محمود عبد العزيز'] },
  { hint: '⭐ مين اللي بيتلقب بـ"السندريلا"؟', answer: 'سعاد حسني', options: ['شادية', 'فاتن حمامة', 'سعاد حسني'] },
  { hint: '⭐ مين اللي بيتلقب بـ"النمر الأسود"؟', answer: 'أحمد زكي', options: ['أحمد زكي', 'أحمد السقا', 'أحمد عز'] },
  { hint: '⭐ مين اللي بيتلقب بـ"الساحر"؟', answer: 'محمود عبد العزيز', options: ['نور الشريف', 'محمود عبد العزيز', 'عادل إمام'] },
  { hint: '📺 مسلسل "رأفت الهجان" بطولة مين؟', answer: 'محمود عبد العزيز', options: ['عادل إمام', 'يحيى الفخراني', 'محمود عبد العزيز'] },
  { hint: '📺 مسلسل "الكبير أوي" بطولة مين؟', answer: 'أحمد مكي', options: ['أحمد مكي', 'محمد هنيدي', 'محمد سعد'] },
  { hint: '📺 مسلسل "لن أعيش في جلباب أبي" بطولة مين؟', answer: 'نور الشريف', options: ['عادل إمام', 'نور الشريف', 'صلاح السعدني'] },
  { hint: '📺 مسلسل "الاختيار" بطولة مين؟', answer: 'أمير كرارة', options: ['أحمد عز', 'محمد رمضان', 'أمير كرارة'] },
  { hint: '📺 مسلسل "كلبش" بطولة مين؟', answer: 'أمير كرارة', options: ['أمير كرارة', 'أحمد السقا', 'ياسر جلال'] },
  { hint: '📺 مسلسل "المداح" بطولة مين؟', answer: 'حمادة هلال', options: ['أحمد مكي', 'حمادة هلال', 'محمد إمام'] },
  { hint: '📺 مسلسل "جعفر العمدة" بطولة مين؟', answer: 'محمد رمضان', options: ['ياسر جلال', 'أمير كرارة', 'محمد رمضان'] },
  { hint: '📺 مسلسل "نسر الصعيد" بطولة مين؟', answer: 'محمد رمضان', options: ['محمد رمضان', 'أحمد السقا', 'أحمد العوضي'] },
  { hint: '📺 مسلسل "عايزة أتجوز" بطولة مين؟', answer: 'هند صبري', options: ['منى زكي', 'هند صبري', 'نيللي كريم'] },
  { hint: '📺 مسلسل "ذات" بطولة مين؟', answer: 'نيللي كريم', options: ['هند صبري', 'منى زكي', 'نيللي كريم'] },
  { hint: '📺 مسلسل "تحت الوصاية" بطولة مين؟', answer: 'منى زكي', options: ['منى زكي', 'ياسمين عبد العزيز', 'دينا الشربيني'] },
  { hint: '📺 مسلسل "يوميات ونيس" بطولة مين؟', answer: 'محمد صبحي', options: ['يحيى الفخراني', 'محمد صبحي', 'عادل إمام'] },
  { hint: '📺 مسلسل "فرقة ناجي عطا الله" بطولة مين؟', answer: 'عادل إمام', options: ['أحمد آدم', 'محمد سعد', 'عادل إمام'] },
  { hint: '📺 مسلسل "الدالي" بطولة مين؟', answer: 'نور الشريف', options: ['عادل إمام', 'يحيى الفخراني', 'نور الشريف'] },
  { hint: '🎥 فيلم "الحريف" بطولة مين؟', answer: 'عادل إمام', options: ['أحمد زكي', 'عادل إمام', 'محمود عبد العزيز'] },
  { hint: '🎥 فيلم "بلبل حيران" بطولة مين؟', answer: 'أحمد حلمي', options: ['أحمد حلمي', 'كريم عبد العزيز', 'أحمد مكي'] },
  { hint: '🎥 فيلم "زكي شان" بطولة مين؟', answer: 'أحمد حلمي', options: ['محمد سعد', 'أحمد آدم', 'أحمد حلمي'] },
  { hint: '🎥 فيلم "آسف على الإزعاج" بطولة مين؟', answer: 'أحمد حلمي', options: ['أحمد حلمي', 'محمد هنيدي', 'أحمد السقا'] },
  { hint: '🎥 فيلم "اللي بالي بالك" بطولة مين؟', answer: 'محمد سعد', options: ['أحمد حلمي', 'محمد سعد', 'محمد هنيدي'] },
  { hint: '🎥 فيلم "بوحة" بطولة مين؟', answer: 'محمد سعد', options: ['أحمد مكي', 'هاني رمزي', 'محمد سعد'] },
  { hint: '🎥 فيلم "صعيدي في الجامعة الأمريكية" بطولة مين؟', answer: 'محمد هنيدي', options: ['محمد هنيدي', 'علاء ولي الدين', 'أحمد حلمي'] },
  { hint: '🎥 فيلم "تيتو" بطولة مين؟', answer: 'أحمد السقا', options: ['أحمد عز', 'أحمد السقا', 'كريم عبد العزيز'] },
  { hint: '🎥 فيلم "إبراهيم الأبيض" بطولة مين؟', answer: 'أحمد السقا', options: ['أحمد عز', 'أحمد زكي', 'أحمد السقا'] },
  { hint: '🎥 فيلم "زوجة رجل مهم" بطولة مين؟', answer: 'أحمد زكي', options: ['أحمد زكي', 'عادل إمام', 'نور الشريف'] },
  { hint: '🎥 فيلم "ناصر ٥٦" بطولة مين؟', answer: 'أحمد زكي', options: ['محمود عبد العزيز', 'أحمد زكي', 'يحيى الفخراني'] },
  { hint: '🎥 فيلم "الفيل الأزرق ٢" بطولة مين؟', answer: 'كريم عبد العزيز', options: ['أحمد عز', 'أحمد السقا', 'كريم عبد العزيز'] },
  { hint: '🎥 فيلم "إسماعيل ياسين في الجيش" بطولة مين؟', answer: 'إسماعيل ياسين', options: ['إسماعيل ياسين', 'فؤاد المهندس', 'عادل إمام'] },
  { hint: '📺 مسلسل "موسى" بطولة مين؟', answer: 'محمد رمضان', options: ['أحمد عز', 'محمد رمضان', 'أمير كرارة'] },
  { hint: '📺 مسلسل "لعبة نيوتن" بطولة مين؟', answer: 'منى زكي', options: ['هند صبري', 'نيللي كريم', 'منى زكي'] }
],
  medium: [
  { hint: '🎬 مين مخرج فيلم "المومياء"؟', answer: 'شادي عبد السلام', options: ['يوسف شاهين', 'شادي عبد السلام', 'صلاح أبو سيف'] },
  { hint: '🎬 مين مخرج فيلم "عمارة يعقوبيان"؟', answer: 'مروان حامد', options: ['مروان حامد', 'خالد يوسف', 'شريف عرفة'] },
  { hint: '🎬 مين مخرج فيلم "الإرهاب والكباب"؟', answer: 'شريف عرفة', options: ['سمير سيف', 'وحيد حامد', 'شريف عرفة'] },
  { hint: '✍️ مين كاتب فيلم "الإرهاب والكباب"؟', answer: 'وحيد حامد', options: ['يوسف معاطي', 'وحيد حامد', 'أسامة أنور عكاشة'] },
  { hint: '✍️ مين كاتب مسلسل "ليالي الحلمية"؟', answer: 'أسامة أنور عكاشة', options: ['أسامة أنور عكاشة', 'وحيد حامد', 'محفوظ عبد الرحمن'] },
  { hint: '🎭 مين لعب شخصية "سليم البدري" في "ليالي الحلمية"؟', answer: 'يحيى الفخراني', options: ['صلاح السعدني', 'نور الشريف', 'يحيى الفخراني'] },
  { hint: '🎬 مين مخرج مسلسل "رأفت الهجان"؟', answer: 'يحيى العلمي', options: ['إسماعيل عبد الحافظ', 'يحيى العلمي', 'محمد فاضل'] },
  { hint: '🎬 مين مخرج فيلم "الكيت كات"؟', answer: 'داود عبد السيد', options: ['داود عبد السيد', 'يوسف شاهين', 'عاطف الطيب'] },
  { hint: '🎬 مين مخرج فيلم "سواق الأتوبيس"؟', answer: 'عاطف الطيب', options: ['محمد خان', 'رأفت الميهي', 'عاطف الطيب'] },
  { hint: '🎬 مين مخرج فيلم "الأرض"؟', answer: 'يوسف شاهين', options: ['يوسف شاهين', 'صلاح أبو سيف', 'هنري بركات'] },
  { hint: '🎭 مين لعبت دور "هنومة" في فيلم "باب الحديد"؟', answer: 'هند رستم', options: ['فاتن حمامة', 'هند رستم', 'تحية كاريوكا'] },
  { hint: '📅 فيلم "إسماعيلية رايح جاي" اتعرض سنة كام؟', answer: '1997', options: ['1992', '2002', '1997'] },
  { hint: '📅 فيلم "اللمبي" اتعرض سنة كام؟', answer: '2002', options: ['2002', '1999', '2006'] },
  { hint: '📅 فيلم "عسل إسود" اتعرض سنة كام؟', answer: '2010', options: ['2007', '2010', '2013'] },
  { hint: '📅 فيلم "الفيل الأزرق" اتعرض سنة كام؟', answer: '2014', options: ['2011', '2012', '2014'] },
  { hint: '📅 فيلم "الممر" اتعرض سنة كام؟', answer: '2019', options: ['2016', '2019', '2022'] },
  { hint: '🎭 مين لعب شخصية "منصور الحفني" في فيلم "الجزيرة"؟', answer: 'أحمد السقا', options: ['أحمد السقا', 'أحمد عز', 'كريم عبد العزيز'] },
  { hint: '🎬 مين مخرج فيلم "ولاد رزق"؟', answer: 'طارق العريان', options: ['مروان حامد', 'شريف عرفة', 'طارق العريان'] },
  { hint: '🎬 مين مخرج فيلم "إبراهيم الأبيض"؟', answer: 'مروان حامد', options: ['شريف عرفة', 'مروان حامد', 'سامح عبد العزيز'] },
  { hint: '🎬 مين مخرج فيلم "الممر"؟', answer: 'شريف عرفة', options: ['بيتر ميمي', 'شريف عرفة', 'محمد سامي'] },
  { hint: '🎥 فيلم "حسن ومرقص" بطولة عادل إمام و...؟', answer: 'عمر الشريف', options: ['عمر الشريف', 'نور الشريف', 'أحمد زكي'] },
  { hint: '🎭 مين لعب شخصية "عتريس" في فيلم "شيء من الخوف"؟', answer: 'محمود مرسي', options: ['أحمد مظهر', 'محمود مرسي', 'يحيى شاهين'] },
  { hint: '🎭 مين لعب دور العمدة في فيلم "الزوجة الثانية"؟', answer: 'صلاح منصور', options: ['عماد حمدي', 'محمود المليجي', 'صلاح منصور'] },
  { hint: '📖 فيلم "دعاء الكروان" مأخوذ عن رواية مين؟', answer: 'طه حسين', options: ['طه حسين', 'نجيب محفوظ', 'يوسف إدريس'] },
  { hint: '📖 فيلم "الحرام" مأخوذ عن رواية مين؟', answer: 'يوسف إدريس', options: ['إحسان عبد القدوس', 'يوسف إدريس', 'يوسف السباعي'] },
  { hint: '📖 فيلم "زقاق المدق" مأخوذ عن رواية مين؟', answer: 'نجيب محفوظ', options: ['نجيب محفوظ', 'طه حسين', 'إحسان عبد القدوس'] },
  { hint: '🎥 فيلم "في بيتنا رجل" بطولة مين؟', answer: 'عمر الشريف', options: ['رشدي أباظة', 'أحمد مظهر', 'عمر الشريف'] },
  { hint: '🎬 إيه أول فيلم مثّل فيه عمر الشريف؟', answer: 'صراع في الوادي', options: ['صراع في الوادي', 'في بيتنا رجل', 'نهر الحب'] },
  { hint: '⭐ مين اللي اتلقب بـ"ملك الترسو"؟', answer: 'فريد شوقي', options: ['رشدي أباظة', 'فريد شوقي', 'أنور وجدي'] },
  { hint: '⭐ مين اللي اتلقب بـ"جان السينما المصرية"؟', answer: 'رشدي أباظة', options: ['أحمد رمزي', 'عمر الشريف', 'رشدي أباظة'] },
  { hint: '⭐ مين اللي اتلقبت بـ"سيدة الشاشة العربية"؟', answer: 'فاتن حمامة', options: ['فاتن حمامة', 'شادية', 'سعاد حسني'] },
  { hint: '⭐ مين اللي اتلقب بـ"أبو الضحكة"؟', answer: 'إسماعيل ياسين', options: ['فؤاد المهندس', 'إسماعيل ياسين', 'عبد المنعم مدبولي'] },
  { hint: '📺 مسلسل "أرابيسك" بطولة مين؟', answer: 'صلاح السعدني', options: ['عادل إمام', 'يحيى الفخراني', 'صلاح السعدني'] },
  { hint: '📺 مسلسل "الحاج متولي" بطولة مين؟', answer: 'نور الشريف', options: ['نور الشريف', 'عادل إمام', 'يحيى الفخراني'] },
  { hint: '✍️ مين كاتب مسلسل "الجماعة"؟', answer: 'وحيد حامد', options: ['أسامة أنور عكاشة', 'وحيد حامد', 'بلال فضل'] },
  { hint: '🎥 فيلم "ضد الحكومة" بطولة مين؟', answer: 'أحمد زكي', options: ['أحمد زكي', 'نور الشريف', 'محمود عبد العزيز'] },
  { hint: '📖 فيلم "الفيل الأزرق" مأخوذ عن رواية مين؟', answer: 'أحمد مراد', options: ['علاء الأسواني', 'أحمد خالد توفيق', 'أحمد مراد'] },
  { hint: '📖 فيلم "عمارة يعقوبيان" مأخوذ عن رواية مين؟', answer: 'علاء الأسواني', options: ['أحمد مراد', 'علاء الأسواني', 'نجيب محفوظ'] },
  { hint: '🎬 مين مخرج فيلم "كباريه"؟', answer: 'سامح عبد العزيز', options: ['سامح عبد العزيز', 'سعيد حامد', 'شريف عرفة'] },
  { hint: '🎬 مين مخرج فيلم "اللمبي"؟', answer: 'وائل إحسان', options: ['سعيد حامد', 'أحمد الجندي', 'وائل إحسان'] },
  { hint: '🎬 مين مخرج فيلم "صعيدي في الجامعة الأمريكية"؟', answer: 'سعيد حامد', options: ['شريف عرفة', 'سعيد حامد', 'وائل إحسان'] },
  { hint: '🎬 مين مخرج فيلم "إسماعيلية رايح جاي"؟', answer: 'كريم ضياء الدين', options: ['كريم ضياء الدين', 'سعيد حامد', 'شريف عرفة'] },
  { hint: '🎬 مين مخرج مسلسل "الكبير أوي"؟', answer: 'أحمد الجندي', options: ['سامح عبد العزيز', 'محمد سامي', 'أحمد الجندي'] },
  { hint: '🎬 مين مخرج الجزء الأول من مسلسل "الاختيار"؟', answer: 'بيتر ميمي', options: ['بيتر ميمي', 'محمد سامي', 'حسين المنباوي'] },
  { hint: '🎬 مين مخرج فيلم "أحلام هند وكاميليا"؟', answer: 'محمد خان', options: ['داود عبد السيد', 'محمد خان', 'يسري نصر الله'] },
  { hint: '🎬 مين مخرج فيلم "المصير"؟', answer: 'يوسف شاهين', options: ['محمد خان', 'رأفت الميهي', 'يوسف شاهين'] },
  { hint: '🎬 مين مخرج فيلم "همام في أمستردام"؟', answer: 'سعيد حامد', options: ['شريف عرفة', 'سعيد حامد', 'وائل إحسان'] },
  { hint: '⭐ مين اللي اتلقب بـ"العندليب الأسمر"؟', answer: 'عبد الحليم حافظ', options: ['فريد الأطرش', 'محمد فوزي', 'عبد الحليم حافظ'] },
  { hint: '🎭 مين لعب شخصية "شريف الكردي" في فيلم "الفيل الأزرق"؟', answer: 'خالد الصاوي', options: ['كريم عبد العزيز', 'خالد الصاوي', 'أحمد مالك'] },
  { hint: '📅 فيلم "الجزيرة" اتعرض سنة كام؟', answer: '2007', options: ['2005', '2007', '2010'] }
],
  hard: [
  { hint: '🎬 مين مخرج "المومياء"؟', answer: 'شادي عبد السلام', options: ['شادي عبد السلام', 'يوسف شاهين', 'صلاح أبو سيف'] },
  { hint: '🎬 مخرج "باب الحديد"؟', answer: 'يوسف شاهين', options: ['يوسف شاهين', 'صلاح أبو سيف', 'حسين كمال'] },
  { hint: '📽️ أول فيلم مصري ناطق؟', answer: 'أولاد الذوات (1932)', options: ['أولاد الذوات (1932)', 'ليلى (1927)', 'العزيمة (1939)'] },
  { hint: '🎬 مخرج "بين القصرين"؟', answer: 'حسن الإمام', options: ['حسن الإمام', 'يوسف شاهين', 'صلاح أبو سيف'] },
  { hint: '✍️ كاتب "ليالي الحلمية"؟', answer: 'أسامة أنور عكاشة', options: ['أسامة أنور عكاشة', 'وحيد حامد', 'صالح مرسي'] },
  { hint: '🎭 بطل "رأفت الهجان"؟', answer: 'محمود عبد العزيز', options: ['محمود عبد العزيز', 'عادل إمام', 'نور الشريف'] },
  { hint: '✍️ كاتب "رأفت الهجان"؟', answer: 'صالح مرسي', options: ['صالح مرسي', 'وحيد حامد', 'أسامة أنور عكاشة'] },
  { hint: '🎬 مخرج "شيء من الخوف"؟', answer: 'حسين كمال', options: ['حسين كمال', 'يوسف شاهين', 'صلاح أبو سيف'] },
  { hint: '🎭 مين لعب دور عتريس في "شيء من الخوف"؟', answer: 'محمود مرسي', options: ['محمود مرسي', 'أحمد مظهر', 'يحيى شاهين'] },
  { hint: '🎬 مخرج "الكيت كات"؟', answer: 'داود عبد السيد', options: ['داود عبد السيد', 'يوسف شاهين', 'عاطف الطيب'] },
  { hint: '🎬 مخرج "دعاء الكروان"؟', answer: 'هنري بركات', options: ['هنري بركات', 'يوسف شاهين', 'صلاح أبو سيف'] },
  { hint: '🎬 مخرج "العزيمة"؟', answer: 'كمال سليم', options: ['كمال سليم', 'صلاح أبو سيف', 'يوسف شاهين'] },
  { hint: '🎬 مخرج "ريا وسكينة" (1953)؟', answer: 'صلاح أبو سيف', options: ['صلاح أبو سيف', 'حسن الإمام', 'كمال سليم'] },
  { hint: '🎭 بطل "الفتوة"؟', answer: 'فريد شوقي', options: ['فريد شوقي', 'رشدي أباظة', 'أنور وجدي'] },
  { hint: '🎬 مخرج "خلي بالك من زوزو"؟', answer: 'حسن الإمام', options: ['حسن الإمام', 'محمد خان', 'حسين كمال'] },
  { hint: '🎬 مخرج "الناصر صلاح الدين"؟', answer: 'يوسف شاهين', options: ['يوسف شاهين', 'صلاح أبو سيف', 'حسين كمال'] },
  { hint: '🎬 مخرج "اللص والكلاب"؟', answer: 'كمال الشيخ', options: ['كمال الشيخ', 'يوسف شاهين', 'صلاح أبو سيف'] },
  { hint: '🎬 مخرج "الاختيار"؟', answer: 'يوسف شاهين', options: ['يوسف شاهين', 'شادي عبد السلام', 'حسين كمال'] },
  { hint: '🎬 مخرج "إسكندرية ليه؟"؟', answer: 'يوسف شاهين', options: ['يوسف شاهين', 'محمد خان', 'داود عبد السيد'] },
  { hint: '🎬 مخرج "عمارة يعقوبيان"؟', answer: 'مروان حامد', options: ['مروان حامد', 'خالد يوسف', 'شريف عرفة'] },
  { hint: '✍️ كاتب "الإرهاب والكباب"؟', answer: 'وحيد حامد', options: ['وحيد حامد', 'أسامة أنور عكاشة', 'صالح مرسي'] },
  { hint: '🎬 مخرج "الجزيرة"؟', answer: 'شريف عرفة', options: ['شريف عرفة', 'طارق العريان', 'مروان حامد'] },
  { hint: '🎭 بطل "لن أعيش في جلباب أبي"؟', answer: 'نور الشريف', options: ['نور الشريف', 'عادل إمام', 'يحيى الفخراني'] },
  { hint: '🎭 بطل "أرابيسك"؟', answer: 'صلاح السعدني', options: ['صلاح السعدني', 'نور الشريف', 'يحيى الفخراني'] },
  { hint: '🎬 مخرج "أبي فوق الشجرة"؟', answer: 'حسين كمال', options: ['حسين كمال', 'يوسف شاهين', 'حسن الإمام'] },
  { hint: '📖 "نهر الحب" مأخوذ عن أي رواية عالمية؟', answer: 'آنا كارنينا', options: ['آنا كارنينا', 'مدام بوفاري', 'الآمال الكبرى'] },
  { hint: '🎬 أول فيلم لعمر الشريف؟', answer: 'صراع في الوادي', options: ['صراع في الوادي', 'في بيتنا رجل', 'نهر الحب'] },
  { hint: '⭐ اسم عمر الشريف الأصلي؟', answer: 'ميشيل شلهوب', options: ['ميشيل شلهوب', 'ميشيل ديمتري', 'ميشيل سليم'] },
  { hint: '🎬 مخرج "الأستاذة فاطمة"؟', answer: 'فطين عبد الوهاب', options: ['فطين عبد الوهاب', 'حسن الإمام', 'صلاح أبو سيف'] },
  { hint: '🎬 مخرج "الأفوكاتو"؟', answer: 'رأفت الميهي', options: ['رأفت الميهي', 'يوسف شاهين', 'عاطف الطيب'] },
  { hint: '🎬 مخرج "أحلام هند وكاميليا"؟', answer: 'محمد خان', options: ['محمد خان', 'داود عبد السيد', 'عاطف الطيب'] },
  { hint: '🎬 مخرج "سواق الأتوبيس"؟', answer: 'عاطف الطيب', options: ['عاطف الطيب', 'محمد خان', 'داود عبد السيد'] },
  { hint: '🎬 مخرج "زوجة رجل مهم"؟', answer: 'محمد خان', options: ['محمد خان', 'عاطف الطيب', 'داود عبد السيد'] },
  { hint: '✍️ كاتب "البريء"؟', answer: 'وحيد حامد', options: ['وحيد حامد', 'أسامة أنور عكاشة', 'يوسف معاطي'] },
  { hint: '🎬 مخرج "سهر الليالي"؟', answer: 'هاني خليفة', options: ['هاني خليفة', 'شريف عرفة', 'مروان حامد'] },
  { hint: '🎬 مخرج "إسماعيلية رايح جاي"؟', answer: 'كريم ضياء الدين', options: ['كريم ضياء الدين', 'سعيد حامد', 'شريف عرفة'] },
  { hint: '🎬 مخرج "صعيدي في الجامعة الأمريكية"؟', answer: 'سعيد حامد', options: ['سعيد حامد', 'شريف عرفة', 'وائل إحسان'] },
  { hint: '🎬 مخرج "الحب فوق هضبة الهرم"؟', answer: 'عاطف الطيب', options: ['عاطف الطيب', 'محمد خان', 'داود عبد السيد'] },
  { hint: '🎬 مخرج "أيام السادات"؟', answer: 'محمد خان', options: ['محمد خان', 'يوسف شاهين', 'عاطف الطيب'] },
  { hint: '🎬 مخرج "أرض الخوف"؟', answer: 'داود عبد السيد', options: ['داود عبد السيد', 'محمد خان', 'يوسف شاهين'] },
  { hint: '🎬 مخرج "الأرض" (1970)؟', answer: 'يوسف شاهين', options: ['يوسف شاهين', 'صلاح أبو سيف', 'حسين كمال'] },
  { hint: '🎬 مخرج "الحرام"؟', answer: 'هنري بركات', options: ['هنري بركات', 'يوسف شاهين', 'صلاح أبو سيف'] },
  { hint: '🎬 مخرج "شباب امرأة"؟', answer: 'صلاح أبو سيف', options: ['صلاح أبو سيف', 'حسين كمال', 'كمال الشيخ'] },
  { hint: '🎭 بطلة "شباب امرأة"؟', answer: 'تحية كاريوكا', options: ['تحية كاريوكا', 'فاتن حمامة', 'هند رستم'] },
  { hint: '🎭 بطلة مسلسل "ضمير أبلة حكمت"؟', answer: 'فاتن حمامة', options: ['فاتن حمامة', 'شادية', 'سعاد حسني'] },
  { hint: '✍️ كاتب مسلسل "زيزينيا"؟', answer: 'أسامة أنور عكاشة', options: ['أسامة أنور عكاشة', 'وحيد حامد', 'صالح مرسي'] },
  { hint: '🎭 بطلة "ليلى" (1927)؟', answer: 'عزيزة أمير', options: ['عزيزة أمير', 'فاتن حمامة', 'أمينة رزق'] },
  { hint: '🎬 مخرج "عودة الابن الضال"؟', answer: 'يوسف شاهين', options: ['يوسف شاهين', 'شادي عبد السلام', 'داود عبد السيد'] },
  { hint: '🎬 مخرج "البوسطجي"؟', answer: 'حسين كمال', options: ['حسين كمال', 'يوسف شاهين', 'صلاح أبو سيف'] },
  { hint: '🎬 مخرج "ولاد العم"؟', answer: 'شريف عرفة', options: ['شريف عرفة', 'مروان حامد', 'طارق العريان'] }
],
    legendary: [
    { hint: '📽️ في أي سنة أول عرض سينمائي في الإسكندرية؟', answer: '1896', options: ['1896', '1900', '1910'] },
    { hint: '🎬 مخرج "وداد"؟', answer: 'فريتز كرامب', options: ['فريتز كرامب', 'محمد كريم', 'توجو مزراحي'] },
    { hint: '🎥 أول فيلم لأم كلثوم؟', answer: 'وداد (1936)', options: ['وداد (1936)', 'سلامة (1945)', 'فاطمة (1947)'] },
    { hint: '🎬 مخرج "سلامة"؟', answer: 'توجو مزراحي', options: ['توجو مزراحي', 'فريتز كرامب', 'محمد كريم'] },
    { hint: '🎬 مخرج "زينب" (1930)؟', answer: 'محمد كريم', options: ['محمد كريم', 'توجو مزراحي', 'فريتز كرامب'] },
    { hint: '✍️ مين كاتب رواية "زينب"؟', answer: 'محمد حسين هيكل', options: ['محمد حسين هيكل', 'طه حسين', 'توفيق الحكيم'] },
    { hint: '🎞️ الاستوديو اللي أسسه طلعت حرب سنة 1935؟', answer: 'استوديو مصر', options: ['استوديو مصر', 'استوديو الأهرام', 'استوديو نحاس'] },
    { hint: '⭐ اسم أنور وجدي الحقيقي؟', answer: 'محمد أنور يحيى الفتال', options: ['محمد أنور يحيى الفتال', 'محمد أنور إبراهيم', 'أحمد أنور الفتال'] },
    { hint: '⭐ اسم شادية الحقيقي؟', answer: 'فاطمة أحمد كمال شاكر', options: ['فاطمة أحمد كمال شاكر', 'فاطمة محمد شاكر', 'فاطمة أحمد شريف'] },
    { hint: '⭐ اسم سعاد حسني الحقيقي؟', answer: 'سعاد محمد كامل البابا', options: ['سعاد محمد كامل البابا', 'سعاد محمد حسني', 'سعاد كامل حسني'] },
    { hint: '⭐ اسم نادية لطفي الحقيقي؟', answer: 'بولا محمد مصطفى شفيق', options: ['بولا محمد مصطفى شفيق', 'بولا إبراهيم شفيق', 'بولا محمد إبراهيم'] },
    { hint: '⭐ اسم ليلى مراد الحقيقي؟', answer: 'ليليان زكي موردخاي', options: ['ليليان زكي موردخاي', 'ليلى زكي مراد', 'ليليان مراد شكري'] },
    { hint: '⭐ اسم هند رستم الحقيقي؟', answer: 'إنجي محمد مراد', options: ['إنجي محمد مراد', 'إنجي مصطفى مراد', 'هند محمد رستم'] },
    { hint: '⭐ اسم تحية كاريوكا الحقيقي؟', answer: 'بدوية محمد كريم', options: ['بدوية محمد كريم', 'بدوية كامل محمد', 'تحية محمد كريم'] },
    { hint: '⭐ اسم أحمد زكي الكامل؟', answer: 'أحمد زكي متولي عبد الرحمن', options: ['أحمد زكي متولي عبد الرحمن', 'أحمد زكي عبد الرحمن', 'أحمد متولي زكي'] },
    { hint: '⭐ اسم سامية جمال الحقيقي؟', answer: 'زينب خليل إبراهيم محفوظ', options: ['زينب خليل إبراهيم محفوظ', 'زينب إبراهيم خليل', 'سامية خليل إبراهيم'] },
    { hint: '⭐ اسم سناء جميل الحقيقي؟', answer: 'ثريا يوسف عطا الله', options: ['ثريا يوسف عطا الله', 'ثريا جميل يوسف', 'سناء يوسف عطا الله'] },
    { hint: '⭐ اسم ماجدة الصباحي الحقيقي؟', answer: 'عفاف علي كامل الصباحي', options: ['عفاف علي كامل الصباحي', 'عفاف كامل علي الصباحي', 'ماجدة علي كامل'] },
    { hint: '🎭 اسم القرية في "شيء من الخوف"؟', answer: 'الدهاشنة', options: ['الدهاشنة', 'الكباشنة', 'الدهاشمة'] },
    { hint: '📍 الكيت كات اسم حي في أي منطقة؟', answer: 'إمبابة', options: ['إمبابة', 'شبرا', 'بولاق'] },
    { hint: '🎭 اسم القبيلة في "المومياء"؟', answer: 'الحربات', options: ['الحربات', 'الهربات', 'الحرابات'] },
    { hint: '🎭 مين لعب أبو سويلم في "الأرض"؟', answer: 'محمود المليجي', options: ['محمود المليجي', 'عماد حمدي', 'يحيى شاهين'] },
    { hint: '✍️ كاتب رواية "الأرض"؟', answer: 'عبد الرحمن الشرقاوي', options: ['عبد الرحمن الشرقاوي', 'نجيب محفوظ', 'يوسف إدريس'] },
    { hint: '✍️ كاتب قصة "البوسطجي"؟', answer: 'يحيى حقي', options: ['يحيى حقي', 'إحسان عبد القدوس', 'يوسف السباعي'] },
    { hint: '📍 أحداث "ثرثرة فوق النيل" بتدور فين؟', answer: 'عوامة', options: ['عوامة', 'باخرة', 'يخت'] },
    { hint: '🎬 مخرج "الكرنك"؟', answer: 'علي بدرخان', options: ['علي بدرخان', 'يوسف شاهين', 'حسين كمال'] },
    { hint: '🎬 مخرج "شفيقة ومتولي"؟', answer: 'علي بدرخان', options: ['علي بدرخان', 'حسين كمال', 'صلاح أبو سيف'] },
    { hint: '🎬 مخرج "أهل القمة"؟', answer: 'علي بدرخان', options: ['علي بدرخان', 'محمد خان', 'عاطف الطيب'] },
    { hint: '📅 سنة "حدوتة مصرية"؟', answer: '1982', options: ['1982', '1980', '1985'] },
    { hint: '📅 سنة "وداعًا بونابرت"؟', answer: '1985', options: ['1985', '1982', '1990'] },
    { hint: '🎬 مخرج "أرض الأحلام"؟', answer: 'داود عبد السيد', options: ['داود عبد السيد', 'يوسف شاهين', 'محمد خان'] },
    { hint: '🎬 مخرج "رسائل البحر"؟', answer: 'داود عبد السيد', options: ['داود عبد السيد', 'يوسف شاهين', 'عاطف الطيب'] },
    { hint: '🎬 مخرج "المتمردون" و"يوميات نائب في الأرياف"؟', answer: 'توفيق صالح', options: ['توفيق صالح', 'يوسف شاهين', 'صلاح أبو سيف'] },
    { hint: '🎬 مخرج "القاهرة 30"؟', answer: 'صلاح أبو سيف', options: ['صلاح أبو سيف', 'يوسف شاهين', 'حسين كمال'] },
    { hint: '🎭 مين لعب محجوب عبد الدايم في "القاهرة 30"؟', answer: 'حمدي أحمد', options: ['حمدي أحمد', 'أحمد مظهر', 'صلاح منصور'] },
    { hint: '📍 أحداث "بين السماء والأرض" بتدور فين؟', answer: 'في مصعد', options: ['في مصعد', 'في قطار', 'في طيارة'] },
    { hint: '🎬 مخرج "ضمير أبلة حكمت"؟', answer: 'إنعام محمد علي', options: ['إنعام محمد علي', 'علي بدرخان', 'محمد فاضل'] },
    { hint: '📍 "زيزينيا" أحداثها في أي مدينة؟', answer: 'الإسكندرية', options: ['الإسكندرية', 'القاهرة', 'بورسعيد'] },
    { hint: '🎬 مين شارك يوسف شاهين إخراج "هي فوضى"؟', answer: 'خالد يوسف', options: ['خالد يوسف', 'محمد خان', 'داود عبد السيد'] },
    { hint: '🎬 مخرج "فتاة المصنع"؟', answer: 'محمد خان', options: ['محمد خان', 'داود عبد السيد', 'عاطف الطيب'] },
    { hint: '🎬 مخرج "المتوحشة"؟', answer: 'سمير سيف', options: ['سمير سيف', 'شريف عرفة', 'عاطف الطيب'] },
    { hint: '🎬 مخرج "أميرة حبي أنا"؟', answer: 'حسن الإمام', options: ['حسن الإمام', 'يوسف شاهين', 'حسين كمال'] },
    { hint: '🎬 آخر أفلام نجيب الريحاني؟', answer: 'غزل البنات', options: ['غزل البنات', 'سلامة', 'سي عمر'] },
    { hint: '🎬 مخرج "غزل البنات"؟', answer: 'أنور وجدي', options: ['أنور وجدي', 'فطين عبد الوهاب', 'حسين كمال'] },
    { hint: '⭐ الاسم الحقيقي لرأفت الهجان؟', answer: 'رفعت علي سليمان الجمال', options: ['رفعت علي سليمان الجمال', 'رفعت جميل سليمان', 'رأفت علي الجمال'] },
    { hint: '✍️ كاتب "الشهد والدموع"؟', answer: 'أسامة أنور عكاشة', options: ['أسامة أنور عكاشة', 'وحيد حامد', 'صالح مرسي'] },
    { hint: '✍️ كاتب سيناريو "الكرنك"؟', answer: 'ممدوح الليثي', options: ['ممدوح الليثي', 'وحيد حامد', 'أسامة أنور عكاشة'] },
    { hint: '🎬 مخرج "العصفور"؟', answer: 'يوسف شاهين', options: ['يوسف شاهين', 'شادي عبد السلام', 'علي بدرخان'] },
    { hint: '🎬 مخرج "أنف وثلاث عيون"؟', answer: 'حسين كمال', options: ['حسين كمال', 'يوسف شاهين', 'صلاح أبو سيف'] },
    { hint: '🎬 مخرج "الأيدي الناعمة"؟', answer: 'أحمد ضياء الدين', options: ['أحمد ضياء الدين', 'فطين عبد الوهاب', 'حسن الإمام'] }
  ]
};

function initMovies(area, difficulty, best) {
  // عدد الأسئلة حسب الصعوبة
  const questionCount = { easy: 10, medium: 10, hard: 15, legendary: 20 };
  const totalQ = Math.min(questionCount[difficulty] || 8, MOVIES_BANK[difficulty].length);

  // نختار أسئلة عشوائية
  const shuffled = shuffle(MOVIES_BANK[difficulty].slice()).slice(0, totalQ);

  let idx = 0, score = 0;

  area.innerHTML = `
    <p class="best">🏆 أفضل: ${best}</p>
    <div style="text-align:center;margin-bottom:16px">
      <span style="font-size:14px;color:var(--muted);font-weight:700">🎬 تخمين الأفلام والمسلسلات</span>
    </div>
    <p class="status" id="moviesProgress"></p>
    <div id="moviesHint" style="
      background: var(--bg-2);
      border: 2px dashed var(--border);
      border-radius: 16px;
      padding: 24px 16px;
      margin: 18px 0;
      font-size: 20px;
      font-weight: 800;
      color: var(--accent);
      text-align: center;
      line-height: 1.6;
      box-shadow: 0 0 30px rgba(0, 245, 255, 0.15);
    "></div>
    <div class="movies-opts" id="moviesOpts"></div>
    <style>
      .movies-opts {
        display: grid;
        gap: 10px;
        margin-top: 18px;
      }
      .movies-opts button {
        background: var(--bg-2);
        border: 2px solid var(--border);
        border-radius: 14px;
        padding: 18px 16px;
        font: 800 16px inherit;
        cursor: pointer;
        color: var(--ink);
        transition: all 0.2s;
        font-family: inherit;
        position: relative;
      }
      .movies-opts button:hover:not(:disabled) {
        transform: translateY(-3px) scale(1.02);
        background: var(--card-hover);
        border-color: var(--accent);
        box-shadow: 0 0 25px rgba(0, 245, 255, 0.3);
      }
      .movies-opts button.correct {
        background: var(--success);
        color: var(--bg-1);
        border-color: var(--success);
        box-shadow: 0 0 30px rgba(0, 255, 136, 0.6);
      }
      .movies-opts button.correct::after {
        content: ' ✓';
        font-weight: 900;
      }
      .movies-opts button.wrong {
        background: var(--danger);
        color: #fff;
        border-color: var(--danger);
        animation: shake 0.4s;
      }
      .movies-opts button.wrong::after {
        content: ' ✗';
        font-weight: 900;
      }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-8px); }
        75% { transform: translateX(8px); }
      }
    </style>
  `;

  const progressEl = document.getElementById('moviesProgress');
  const hintEl = document.getElementById('moviesHint');
  const optsEl = document.getElementById('moviesOpts');

  function render() {
    if (idx >= totalQ) {
      const baseScores = { easy: 80, medium: 150, hard: 280, legendary: 500 };
      const perfectBonus = score === totalQ ? 100 : 0;
      const finalScore = Math.floor((baseScores[difficulty] || 150) * score / totalQ) + perfectBonus;
      endGame('movies', difficulty, finalScore);
      return;
    }

    const q = shuffled[idx];
    progressEl.textContent = '🎬 ' + (idx + 1) + ' من ' + totalQ;
    hintEl.textContent = q.hint;
    optsEl.innerHTML = '';

    shuffle(q.options.slice()).forEach(opt => {
      const b = document.createElement('button');
      b.textContent = opt;
      b.onclick = () => {
        [...optsEl.children].forEach(x => x.disabled = true);

        if (opt === q.answer) {
          b.classList.add('correct');
          score++;
          document.getElementById('currentScore').textContent = score * 20;
        } else {
          b.classList.add('wrong');
          // نظهر الإجابة الصح
          [...optsEl.children].forEach(x => {
            if (x.textContent === q.answer) x.classList.add('correct');
          });
        }

        setTimeout(() => { idx++; render(); }, 1100);
      };
      optsEl.appendChild(b);
    });
  }

  render();
}
/* ===== 29. الإنجازات ===== */
const ACHIEVEMENTS = [
  { id: 'first_game',   name: 'البداية', icon: '🎮', desc: 'العب أول لعبة', reward: { coins: 50 }, condition: (s) => Object.values(s.plays).reduce((a,b) => a+b, 0) >= 1 },
  { id: 'ten_games',    name: 'مدمن ألعاب', icon: '🕹️', desc: 'العب 10 ألعاب', reward: { coins: 150 }, condition: (s) => Object.values(s.plays).reduce((a,b) => a+b, 0) >= 10 },
  { id: 'fifty_games',  name: 'محترف', icon: '👑', desc: 'العب 50 لعبة', reward: { coins: 500 }, condition: (s) => Object.values(s.plays).reduce((a,b) => a+b, 0) >= 50 },
  { id: 'hundred_games', name: 'أسطورة', icon: '💫', desc: 'العب 100 لعبة', reward: { coins: 1500 }, condition: (s) => Object.values(s.plays).reduce((a,b) => a+b, 0) >= 100 },
  
  { id: 'score_500',   name: 'سكور عالي', icon: '🏆', desc: 'احصل على سكور 500', reward: { coins: 200 }, condition: (s) => Math.max(0, ...Object.values(s.scores)) >= 500 },
  { id: 'score_1000',  name: 'سكور ضخم', icon: '🥇', desc: 'احصل على سكور 1000', reward: { coins: 500 }, condition: (s) => Math.max(0, ...Object.values(s.scores)) >= 1000 },
  
  { id: 'coins_500',   name: 'جامع الكوينز', icon: '💰', desc: 'اجمع 500 كوين', reward: { coins: 100 }, condition: (s) => s.coins >= 500 },
  { id: 'coins_2000',  name: 'ثري', icon: '💎', desc: 'اجمع 2000 كوين', reward: { coins: 300 }, condition: (s) => s.coins >= 2000 },
  
  { id: 'level_5',     name: 'مبتدئ متقدم', icon: '⭐', desc: 'وصل للمستوى 5', reward: { coins: 200 }, condition: (s) => Math.floor(s.xp / 100) + 1 >= 5 },
  { id: 'level_10',    name: 'خبير', icon: '🌟', desc: 'وصل للمستوى 10', reward: { coins: 500 }, condition: (s) => Math.floor(s.xp / 100) + 1 >= 10 },
  { id: 'level_20',    name: 'نابغة', icon: '✨', desc: 'وصل للمستوى 20', reward: { coins: 1500 }, condition: (s) => Math.floor(s.xp / 100) + 1 >= 20 },
  
  { id: 'streak_3',    name: 'ملتزم', icon: '🔥', desc: 'العب 3 أيام متتالية', reward: { coins: 200 }, condition: (s) => s.streak >= 3 },
  { id: 'streak_7',    name: 'مافي', icon: '🔥🔥', desc: 'العب 7 أيام متتالية', reward: { coins: 700 }, condition: (s) => s.streak >= 7 },
  
  { id: 'theme_2',     name: 'متحمس', icon: '🎨', desc: 'اشتري ثيم جديد', reward: { coins: 100 }, condition: (s) => s.ownedThemes.length >= 2 },
  { id: 'theme_all',   name: 'جامع الثيمات', icon: '🌈', desc: 'اشتري كل الثيمات', reward: { coins: 2000 }, condition: (s) => s.ownedThemes.length >= 4 },
  
  { id: 'all_games',   name: 'المجرب', icon: '🎯', desc: 'العب كل الألعاب', reward: { coins: 800 }, condition: (s) => Object.keys(s.plays).length >= 10 }
];

function checkAchievements() {
  const unlocked = state.unlockedAchievements || [];
  const newUnlocks = [];

  ACHIEVEMENTS.forEach(ach => {
    if (unlocked.includes(ach.id)) return;
    if (ach.condition(state)) {
      newUnlocks.push(ach);
      unlocked.push(ach.id);
      state.coins += ach.reward.coins || 0;
      state.xp += ach.reward.xp || 0;
    }
  });

  if (newUnlocks.length > 0) {
    state.unlockedAchievements = unlocked;
    saveState();
    // إظهار كل إنجاز بتأخير بسيط
    newUnlocks.forEach((ach, i) => {
      setTimeout(() => showAchievementPopup(ach), i * 1500);
    });
    renderAll();
  }
}

function showAchievementPopup(ach) {
  const popup = document.getElementById('achievementPopup');
  document.getElementById('apName').textContent = ach.name;
  document.getElementById('apReward').textContent = '+' + ach.reward.coins + ' 🪙';
  popup.classList.add('show');
  setTimeout(() => popup.classList.remove('show'), 3500);
}

function openAchievements() {
  document.getElementById('achievementsModal').classList.add('active');
  renderAchievements();
}

function closeAchievements() {
  document.getElementById('achievementsModal').classList.remove('active');
}

function renderAchievements() {
  const list = document.getElementById('achievementsList');
  if (!list) return;

  const unlocked = state.unlockedAchievements || [];
  document.getElementById('achCount').textContent = unlocked.length;
  document.getElementById('achTotal').textContent = ACHIEVEMENTS.length;

  list.innerHTML = ACHIEVEMENTS.map(ach => {
    const isUnlocked = unlocked.includes(ach.id);
    return `
      <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}">
        <div class="ai-icon">${isUnlocked ? ach.icon : '🔒'}</div>
        <div class="ai-content">
          <div class="ai-name">${ach.name}</div>
          <div class="ai-desc">${ach.desc}</div>
          <div class="ai-reward">💰 ${ach.reward.coins} 🪙</div>
        </div>
        <div class="ai-status">${isUnlocked ? '✅' : ''}</div>
      </div>
    `;
  }).join('');
}

/* ===== 30. المهام اليومية ===== */
const MISSION_TEMPLATES = [
  { id: 'play_5',      name: 'العب 5 ألعاب', icon: '🎮', desc: 'العب 5 مرات النهاردة', target: 5,     reward: { coins: 80 } },
  { id: 'play_10',     name: 'العب 10 ألعاب', icon: '🕹️', desc: 'العب 10 مرات النهاردة', target: 10,    reward: { coins: 200 } },
  { id: 'win_memory',  name: 'اكسب في الذاكرة', icon: '🧠', desc: 'اكسب جولة ذاكرة',      target: 1,     reward: { coins: 100 } },
  { id: 'score_300',   name: 'سكور 300', icon: '🏆', desc: 'احصل على 300 سكور في لعبة', target: 300, reward: { coins: 150 } },
  { id: 'win_snake',   name: 'سكور 100 في الأفعى', icon: '🐍', desc: 'العبي أفعى لحد 100 سكور', target: 100, reward: { coins: 120 } },
  { id: 'play_different', name: 'نوع الألعاب', icon: '🎯', desc: 'العب 3 ألعاب مختلفة', target: 3,     reward: { coins: 100 } },
  { id: 'win_xo',      name: 'اكسب في XO', icon: '❌', desc: 'اكسب جولة إكس أوه',    target: 1,     reward: { coins: 80 } },
  { id: 'quiz_3',      name: 'سؤال وجواب', icon: '❓', desc: 'العب سؤال وجواب',      target: 1,     reward: { coins: 90 } }
];

function getMissions() {
  const today = new Date().toDateString();
  if (state.missionsDay !== today) {
    // مهام جديدة كل يوم
    const shuffled = shuffle(MISSION_TEMPLATES.slice()).slice(0, 3);
    state.missionsDay = today;
    state.missions = shuffled.map(m => ({ ...m, progress: 0, completed: false }));
    state.uniqueGamesToday = [];
    saveState();
  }
  return state.missions || [];
}

function updateMissionProgress(type, value) {
  const missions = getMissions();
  let updated = false;

  missions.forEach(m => {
    if (m.completed) return;

    if (m.id === 'play_5' && type === 'play') {
      m.progress++;
      if (m.progress >= m.target) completeMission(m);
    } else if (m.id === 'play_10' && type === 'play') {
      m.progress++;
      if (m.progress >= m.target) completeMission(m);
    } else if (m.id === 'win_memory' && type === 'win' && value === 'memory') {
      m.progress = 1;
      completeMission(m);
    } else if (m.id === 'win_xo' && type === 'win' && value === 'xo') {
      m.progress = 1;
      completeMission(m);
    } else if (m.id === 'quiz_3' && type === 'play' && value === 'quiz') {
      m.progress = 1;
      completeMission(m);
    } else if (m.id === 'score_300' && type === 'score' && value >= 300) {
      m.progress = value;
      completeMission(m);
    } else if (m.id === 'win_snake' && type === 'score' && value >= 100) {
      // هذا تقريبي بس ينفع
      m.progress = value;
      completeMission(m);
    } else if (m.id === 'play_different' && type === 'play') {
      if (!state.uniqueGamesToday) state.uniqueGamesToday = [];
      if (!state.uniqueGamesToday.includes(value)) {
        state.uniqueGamesToday.push(value);
        m.progress = state.uniqueGamesToday.length;
        if (m.progress >= m.target) completeMission(m);
      }
    }
    updated = true;
  });

  if (updated) {
    state.missions = missions;
    saveState();
  }
}

function completeMission(m) {
  if (m.completed) return;
  m.completed = true;
  state.coins += m.reward.coins;
  showToast('🎯 خلصت مهمة: ' + m.name + ' (+' + m.reward.coins + ' 🪙)');
}

function openMissions() {
  document.getElementById('missionsModal').classList.add('active');
  renderMissions();
}

function closeMissions() {
  document.getElementById('missionsModal').classList.remove('active');
}

function renderMissions() {
  const list = document.getElementById('missionsList');
  if (!list) return;

  const missions = getMissions();
  const completed = missions.filter(m => m.completed).length;
  document.getElementById('missionCount').textContent = completed;

  list.innerHTML = missions.map(m => {
    const pct = Math.min(100, Math.floor((m.progress || 0) / m.target * 100));
    return `
      <div class="mission-item ${m.completed ? 'completed' : ''}">
        <div class="mi-head">
          <div class="mi-icon">${m.icon}</div>
          <div class="mi-info">
            <div class="mi-name">${m.name}</div>
            <div class="mi-desc">${m.desc}</div>
          </div>
          <div class="mi-reward">+${m.reward.coins} 🪙</div>
        </div>
        <div class="mission-progress">
          <div class="mission-progress-bar" style="width: ${pct}%"></div>
        </div>
        <div class="mission-text">
          ${m.completed ? '✅ خلصت!' : (m.progress || 0) + ' / ' + m.target}
        </div>
      </div>
    `;
  }).join('');
}

/* ===== 31. تعديل recordScore لتفعيل المهام والإنجازات ===== */
const _originalRecordScore = recordScore;
recordScore = function(gameId, difficulty, score) {
  const result = _originalRecordScore(gameId, difficulty, score);
  
  // تحديث المهام
  updateMissionProgress('play', gameId);
  if (score > 0) updateMissionProgress('score', score);
  if (result.isNewBest && score >= 50) updateMissionProgress('win', gameId);
  
  // فحص الإنجازات
  setTimeout(checkAchievements, 300);
  
  return result;
};

/* ===== 32. ربط الإنجازات والمهام بالتشغيل ===== */
window.addEventListener('DOMContentLoaded', () => {
  // فحص الإنجازات بعد التحميل
  setTimeout(() => {
    checkAchievements();
    getMissions();
  }, 1500);
});
/* ===== 33. شاشة الإحصائيات ===== */
function openStats() {
  document.getElementById('statsModal').classList.add('active');
  renderStats();
}

function closeStats() {
  document.getElementById('statsModal').classList.remove('active');
}

function renderStats() {
  const content = document.getElementById('statsContent');
  if (!content) return;

  // ===== نظرة عامة =====
  const totalPlays = Object.values(state.plays).reduce((a, b) => a + b, 0);
  const totalCoins = state.coins;
  const totalXP = state.xp;
  const level = getLevel();
  const unlockedAch = (state.unlockedAchievements || []).length;
  const missionsDone = (state.missions || []).filter(m => m.completed).length;

  let html = `
    <div class="stats-overview">
      <div class="stats-overview-card">
        <div class="soc-icon">🎮</div>
        <div class="soc-num">${totalPlays}</div>
        <div class="soc-label">إجمالي الألعاب</div>
      </div>
      <div class="stats-overview-card">
        <div class="soc-icon">⭐</div>
        <div class="soc-num">${totalXP}</div>
        <div class="soc-label">إجمالي XP</div>
      </div>
      <div class="stats-overview-card">
        <div class="soc-icon">🪙</div>
        <div class="soc-num">${totalCoins}</div>
        <div class="soc-label">الكوينز</div>
      </div>
      <div class="stats-overview-card">
        <div class="soc-icon">🏅</div>
        <div class="soc-num">${level}</div>
        <div class="soc-label">المستوى</div>
      </div>
      <div class="stats-overview-card">
        <div class="soc-icon">🏆</div>
        <div class="soc-num">${unlockedAch}/${ACHIEVEMENTS.length}</div>
        <div class="soc-label">إنجازات</div>
      </div>
      <div class="stats-overview-card">
        <div class="soc-icon">🎯</div>
        <div class="soc-num">${missionsDone}/3</div>
        <div class="soc-label">مهام اليوم</div>
      </div>
    </div>
  `;

  // ===== إحصائيات كل لعبة =====
  html += '<div class="stats-section-title">🎯 تفاصيل الألعاب</div>';

  const allGames = Object.values(GAMES);
  const gamesWithPlay = allGames.filter(g => (state.plays[g.id] || 0) > 0);
  const gamesWithout = allGames.filter(g => (state.plays[g.id] || 0) === 0);

  if (gamesWithPlay.length === 0) {
    html += '<div class="stats-empty">🎮 لسه مالعبتش أي لعبة!<br>ابدأ العب عشان تشوف إحصائياتك هنا</div>';
  } else {
    gamesWithPlay.forEach(g => {
      const plays = state.plays[g.id] || 0;
      html += `
        <div class="stats-game-item">
          <div class="stats-game-head">
            <span class="sgh-icon">${g.icon}</span>
            <span class="sgh-name">${g.name}</span>
            <span class="sgh-plays">${plays} مرة</span>
          </div>
          <div class="stats-diff-grid">
            ${DIFFICULTIES.map(d => {
              const key = g.id + '_' + d.id;
              const score = state.scores[key] || 0;
              return `
                <div class="stats-diff ${score > 0 ? 'has-score' : ''}">
                  <span class="sd-icon">${d.icon}</span>
                  <span class="sd-score ${score > 0 ? '' : 'empty'}">${score > 0 ? score : '—'}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });
  }

  // ===== الألعاب اللي لسه مالعبتهاش =====
  if (gamesWithout.length > 0) {
    html += '<div class="stats-section-title">🔒 ألعاب لسه مالعبتش</div>';
    html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">';
    gamesWithout.forEach(g => {
      html += `<span style="background:var(--bg-2);padding:6px 12px;border-radius:10px;font-size:12px;font-weight:700">${g.icon} ${g.name}</span>`;
    });
    html += '</div>';
  }

  content.innerHTML = html;
}
/* ===== 34. الصندوق اليومي ===== */
function checkChestStatus() {
  const today = new Date().toDateString();
  const chest = document.getElementById('dailyChest');
  const icon = document.getElementById('chestIcon');
  const title = document.getElementById('chestTitle');
  const desc = document.getElementById('chestDesc');
  const badge = document.getElementById('chestBadge');

  if (!chest) return;

  if (state.lastChest === today) {
    // خلاص فتحه النهاردة
    chest.classList.add('claimed');
    icon.textContent = '📭';
    title.textContent = 'شكراً لزيارتك!';
    desc.textContent = 'ارجع بكرة عشان تفتح صندوق جديد 🎁';
    badge.style.display = 'none';
  } else {
    chest.classList.remove('claimed');
    icon.textContent = '🎁';
    title.textContent = 'الصندوق اليومي';
    desc.textContent = 'اضغط لفتح الصندوق!';
    badge.style.display = 'block';
  }
}

function openChest() {
  const today = new Date().toDateString();
  if (state.lastChest === today) {
    showToast('📭 فتحت الصندوق النهاردة — ارجع بكرة!');
    return;
  }

  // جايزة عشوائية
  const roll = Math.random();

  let coinsReward = 0;
  let xpReward = 0;
  let icon = '🪙';
  let title = 'مبروك!';
  let text = '';

  if (roll < 0.05) {
    // 5% جايزة نادرة جداً - الجاكبوت
    coinsReward = 500;
    xpReward = 100;
    icon = '💎';
    title = '🎉 جاكبوت! 🎉';
    text = `+${coinsReward} 🪙 و +${xpReward} ⭐`;
  } else if (roll < 0.20) {
    // 15% جايزة كبيرة
    coinsReward = 200;
    xpReward = 50;
    icon = '🏆';
    text = `+${coinsReward} 🪙 و +${xpReward} ⭐`;
  } else if (roll < 0.50) {
    // 30% جايزة متوسطة
    coinsReward = 100;
    xpReward = 25;
    icon = '💰';
    text = `+${coinsReward} 🪙 و +${xpReward} ⭐`;
  } else {
    // 50% جايزة صغيرة
    coinsReward = 50;
    xpReward = 10;
    icon = '🪙';
    text = `+${coinsReward} 🪙 و +${xpReward} ⭐`;
  }

  // إضافة الجايزة
  state.coins += coinsReward;
  state.xp += xpReward;
  state.lastChest = today;
  saveState();
  renderAll();
  checkChestStatus();

  // عرض النافذة
  document.getElementById('chestRewardIcon').textContent = icon;
  document.getElementById('chestRewardTitle').textContent = title;
  document.getElementById('chestRewardText').textContent = text;
  document.getElementById('chestModal').classList.add('active');

  // فحص الإنجازات
  setTimeout(checkAchievements, 300);
}

function closeChest() {
  document.getElementById('chestModal').classList.remove('active');
}

/* ===== ربط الصندوق بالتشغيل ===== */
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(checkChestStatus, 500);
});
/* ===== 35. مغامرة DULA ===== */
let advState = {
  stage: 0,
  lives: 3,
  score: 0,
  locked: false,
  timer: null,
  memoryFlipped: [],
  memoryMatched: 0,
  memoryLock: false
};

const ADV_TOTAL_STAGES = 12;

// بنك أسئلة المغامرة
const ADV_QUESTIONS = [
  { q: 'ما هو الكوكب الأحمر؟', opts: ['المريخ', 'الزهرة', 'عطارد'], a: 0 },
  { q: 'كم يوم في الأسبوع؟', opts: ['5', '7', '9'], a: 1 },
  { q: 'ما أكبر كوكب؟', opts: ['الأرض', 'المشتري', 'المريخ'], a: 1 },
  { q: 'ما عاصمة مصر؟', opts: ['القاهرة', 'الجيزة', 'أسوان'], a: 0 },
  { q: 'كم ضلع للمثلث؟', opts: ['2', '3', '4'], a: 1 },
  { q: 'ما سفينة الصحراء؟', opts: ['الجمل', 'الحصان', 'الفيل'], a: 0 },
  { q: 'ما الغاز الذي نتنفسه؟', opts: ['الأكسجين', 'الهيدروجين', 'الهيليوم'], a: 0 },
  { q: 'كم شهر في السنة؟', opts: ['10', '11', '12'], a: 2 },
  { q: 'ما أكبر محيط؟', opts: ['الأطلسي', 'الهادي', 'الهندي'], a: 1 },
  { q: 'ما عاصمة اليابان؟', opts: ['طوكيو', 'أوساكا', 'كيوتو'], a: 0 },
  { q: 'كم قارة في العالم؟', opts: ['5', '6', '7'], a: 2 },
  { q: 'ما أطول نهر؟', opts: ['الأمازون', 'النيل', 'الفرات'], a: 1 }
];

function startAdventure() {
  advState = {
    stage: 0, lives: 3, score: 0, locked: false, timer: null,
    memoryFlipped: [], memoryMatched: 0, memoryLock: false
  };
  clearTimers();

  document.getElementById('homeScreen').classList.remove('active');
  document.getElementById('gameScreen').classList.remove('active');
  document.getElementById('adventureScreen').classList.add('active');

  renderAdvStage();
}

function exitAdventure() {
  if (advState.timer) clearTimeout(advState.timer);
  advState.locked = true;
  document.getElementById('adventureScreen').classList.remove('active');
  document.getElementById('homeScreen').classList.add('active');
  renderAll();
}

function updateAdvProgress() {
  document.getElementById('advStageLabel').textContent =
    'المرحلة ' + (advState.stage + 1) + ' من ' + ADV_TOTAL_STAGES;
  document.getElementById('advScoreLabel').textContent = 'النقاط: ' + advState.score;
  document.getElementById('advProgressFill').style.width =
    ((advState.stage + 1) / ADV_TOTAL_STAGES * 100) + '%';

  const livesText = '❤️'.repeat(advState.lives) + '🖤'.repeat(3 - advState.lives);
  document.getElementById('advLives').textContent = livesText;
}

function renderAdvStage() {
  if (advState.stage >= ADV_TOTAL_STAGES) {
    advWin();
    return;
  }

  advState.locked = false;
  updateAdvProgress();

  const area = document.getElementById('advGameArea');
  const type = advState.stage % 6;

  if (type === 0) advMath(area);
  else if (type === 1) advQuiz(area);
  else if (type === 2) advGuess(area);
  else if (type === 3) advMemory(area);
  else if (type === 4) advReaction(area);
  else advRPS(area);
}

function advWin() {
  advState.locked = true;
  const area = document.getElementById('advGameArea');

  const rewardCoins = 500 + advState.score;
  const rewardXP = 200;

  state.coins += rewardCoins;
  state.xp += rewardXP;
  saveState();
  renderAll();
  setTimeout(checkAchievements, 500);

  area.innerHTML = `
    <div class="adv-end-screen">
      <div class="adv-end-icon">🏆</div>
      <div class="adv-end-title">مبروك! خلصت المغامرة!</div>
      <div class="adv-end-score">النقاط: ${advState.score}</div>
      <div class="adv-end-reward">+${rewardCoins} 🪙 و +${rewardXP} ⭐</div>
      <button class="reset" onclick="startAdventure()">🔄 العب تاني</button>
      <button class="reset" onclick="exitAdventure()" style="background:var(--gradient-2)">🏠 الرئيسية</button>
    </div>
  `;

  showToast('🎉 خلصت مغامرة DULA!');
}

function advLose() {
  advState.locked = true;
  const area = document.getElementById('advGameArea');

  const rewardCoins = Math.floor(advState.score / 2);

  if (rewardCoins > 0) {
    state.coins += rewardCoins;
    saveState();
    renderAll();
  }

  area.innerHTML = `
    <div class="adv-end-screen">
      <div class="adv-end-icon">💔</div>
      <div class="adv-end-title">خلصت القلوب!</div>
      <div class="adv-end-score">وصلت للمرحلة ${advState.stage + 1} من ${ADV_TOTAL_STAGES}</div>
      <div class="adv-end-score">النقاط: ${advState.score}</div>
      ${rewardCoins > 0 ? `<div class="adv-end-reward">+${rewardCoins} 🪙</div>` : ''}
      <button class="reset" onclick="startAdventure()">🔄 حاول تاني</button>
      <button class="reset" onclick="exitAdventure()" style="background:var(--gradient-2)">🏠 الرئيسية</button>
    </div>
  `;
}

function advCorrect(points) {
  if (advState.locked) return;
  advState.locked = true;
  advState.score += points;
  updateAdvProgress();

  // علامة صح كبيرة
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;pointer-events:none;';
  overlay.innerHTML = '<div style="font-size:140px;color:#00ff88;text-shadow:0 0 50px #00ff88;animation:rewardPop 0.5s ease">✅</div>';
  document.body.appendChild(overlay);

  advState.timer = setTimeout(() => {
    overlay.remove();
    advState.stage++;
    renderAdvStage();
  }, 1000);
}

function advWrong(msg) {
  if (advState.locked) return;
  advState.locked = true;
  advState.lives--;
  updateAdvProgress();

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;flex-direction:column;gap:20px;z-index:9999;pointer-events:none;';
  overlay.innerHTML = `
    <div style="font-size:140px;color:#ff2e63;text-shadow:0 0 50px #ff2e63;animation:rewardPop 0.5s ease">❌</div>
    <div style="color:#fff;font-size:18px;font-weight:800;background:rgba(255,46,99,0.9);padding:12px 24px;border-radius:16px">${msg || 'إجابة غلط!'}</div>
  `;
  document.body.appendChild(overlay);

  advState.timer = setTimeout(() => {
    overlay.remove();
    if (advState.lives <= 0) {
      advLose();
    } else {
      advState.stage++;
      renderAdvStage();
    }
  }, 1200);
}

/* ===== المرحلة: رياضيات ===== */
function advMath(area) {
  const a = 5 + Math.floor(Math.random() * 20);
  const b = 2 + Math.floor(Math.random() * 15);
  const op = Math.random() < 0.5 ? '+' : '-';
  const answer = op === '+' ? a + b : a - b;

  area.innerHTML = `
    <div class="adv-stage-badge">🧮 المرحلة ${advState.stage + 1}</div>
    <div class="adv-question">حل العملية السريعة</div>
    <div style="font-size:48px;font-weight:900;margin:24px 0;background:var(--gradient);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">${a} ${op} ${b} = ؟</div>
    <div class="adv-options">
      ${[answer, answer + 3, answer - 4, answer + 7].sort(() => Math.random() - 0.5).map(v =>
        `<button onclick="advMathAnswer(${v}, ${answer})">${v}</button>`
      ).join('')}
    </div>
  `;
}

function advMathAnswer(picked, correct) {
  if (picked === correct) advCorrect(50);
  else advWrong('الإجابة الصح: ' + correct);
}

/* ===== المرحلة: سؤال ===== */
function advQuiz(area) {
  const q = ADV_QUESTIONS[Math.floor(Math.random() * ADV_QUESTIONS.length)];

  area.innerHTML = `
    <div class="adv-stage-badge">❓ المرحلة ${advState.stage + 1}</div>
    <div class="adv-question">${q.q}</div>
    <div class="adv-options">
      ${q.opts.map((opt, i) =>
        `<button onclick="advQuizAnswer(${i}, ${q.a})">${opt}</button>`
      ).join('')}
    </div>
  `;
}

function advQuizAnswer(picked, correct) {
  if (picked === correct) advCorrect(60);
  else advWrong('الإجابة الصح: ' + ADV_QUESTIONS[Math.floor(Math.random() * ADV_QUESTIONS.length)].opts[correct]);
}

/* ===== المرحلة: تخمين ===== */
let advGuessTarget = 0;
let advGuessTries = 0;

function advGuess(area) {
  advGuessTarget = 1 + Math.floor(Math.random() * 50);
  advGuessTries = 0;

  area.innerHTML = `
    <div class="adv-stage-badge">🔢 المرحلة ${advState.stage + 1}</div>
    <div class="adv-question">خمن الرقم من 1 إلى 50</div>
    <div class="adv-input-wrap">
      <input type="number" id="advGuessInput" min="1" max="50" placeholder="؟">
      <button onclick="advGuessSubmit()">جرّب</button>
    </div>
    <p class="status" id="advGuessStatus"></p>
  `;

  setTimeout(() => {
    const el = document.getElementById('advGuessInput');
    if (el) el.focus();
  }, 100);
}

function advGuessSubmit() {
  const input = document.getElementById('advGuessInput');
  const status = document.getElementById('advGuessStatus');
  if (!input || !status) return;

  const v = Number(input.value);
  if (!v || v < 1 || v > 50) return;

  advGuessTries++;

  if (v === advGuessTarget) {
    advCorrect(80);
    return;
  }

  if (advGuessTries >= 4) {
    advWrong('الرقم كان: ' + advGuessTarget);
    return;
  }

  status.textContent = (v < advGuessTarget ? 'أكبر من كده ⬆️' : 'أصغر من كده ⬇️') +
    ' (باقي ' + (4 - advGuessTries) + ')';
  input.value = '';
  input.focus();
}

/* ===== المرحلة: ذاكرة ===== */
function advMemory(area) {
  const icons = ['🍎', '🚗', '⭐', '🐶', '⚽', '🚀'];
  const pairs = 3;
  const vals = [...icons.slice(0, pairs), ...icons.slice(0, pairs)].sort(() => Math.random() - 0.5);

  advState.memoryFlipped = [];
  advState.memoryMatched = 0;
  advState.memoryLock = false;

  area.innerHTML = `
    <div class="adv-stage-badge">🧠 المرحلة ${advState.stage + 1}</div>
    <div class="adv-question">افتح كل الأزواج</div>
    <div class="adv-memory-grid" id="advMemoryGrid">
      ${vals.map((v, i) => `<button data-i="${i}" data-val="${v}" onclick="advMemoryFlip(${i})"></button>`).join('')}
    </div>
  `;
}

function advMemoryFlip(i) {
  if (advState.memoryLock) return;
  const grid = document.getElementById('advMemoryGrid');
  if (!grid) return;

  const btn = grid.querySelector('[data-i="' + i + '"]');
  if (!btn || btn.classList.contains('flipped') || btn.classList.contains('matched')) return;

  btn.textContent = btn.dataset.val;
  btn.classList.add('flipped');
  advState.memoryFlipped.push(btn);

  if (advState.memoryFlipped.length === 2) {
    advState.memoryLock = true;
    const [a, b] = advState.memoryFlipped;

    if (a.dataset.val === b.dataset.val) {
      a.classList.add('matched');
      b.classList.add('matched');
      advState.memoryMatched++;
      advState.memoryFlipped = [];
      advState.memoryLock = false;

      if (advState.memoryMatched === 3) advCorrect(70);
    } else {
      setTimeout(() => {
        a.textContent = '';
        b.textContent = '';
        a.classList.remove('flipped');
        b.classList.remove('flipped');
        advState.memoryFlipped = [];
        advState.memoryLock = false;
      }, 700);
    }
  }
}

/* ===== المرحلة: رد فعل ===== */
function advReaction(area) {
  area.innerHTML = `
    <div class="adv-stage-badge">⚡ المرحلة ${advState.stage + 1}</div>
    <div class="adv-question">اضغط بس لما اللون يتغير!</div>
    <div class="adv-reaction-box" id="advReactionBox" onclick="advReactionClick()">استنى...</div>
  `;

  const box = document.getElementById('advReactionBox');
  const delay = 800 + Math.random() * 2000;

  advState.timer = setTimeout(() => {
    if (!box) return;
    box.classList.add('go');
    box.textContent = 'اضغط الآن!';
    box.dataset.go = '1';
    box.dataset.start = Date.now();
  }, delay);
}

function advReactionClick() {
  const box = document.getElementById('advReactionBox');
  if (!box) return;

  if (box.dataset.go === '1') {
    const ms = Date.now() - Number(box.dataset.start);
    advCorrect(Math.max(30, 100 - Math.floor(ms / 20)));
  } else {
    clearTimeout(advState.timer);
    advWrong('ضغطت بدري!');
  }
}

/* ===== المرحلة: حجر ورقة مقص ===== */
function advRPS(area) {
  area.innerHTML = `
    <div class="adv-stage-badge">✊ المرحلة ${advState.stage + 1}</div>
    <div class="adv-question">اكسب الجولة أمام الكمبيوتر!</div>
    <div class="adv-rps-choices">
      <button onclick="advRPSPlay('✊')">✊</button>
      <button onclick="advRPSPlay('✋')">✋</button>
      <button onclick="advRPSPlay('✌️')">✌️</button>
    </div>
  `;
}

function advRPSPlay(me) {
  const choices = ['✊', '✋', '✌️'];
  const beats = { '✊': '✌️', '✋': '✊', '✌️': '✋' };
  const cpu = choices[Math.floor(Math.random() * 3)];

  if (me === cpu) {
    showToast('تعادل — حاول مرة تانية');
    return;
  }

  if (beats[me] === cpu) {
    advCorrect(50);
  } else {
    advWrong(me + ' ضد ' + cpu + ' — خسرت');
  }
}
/* ===== 36. لعبة 2048 ===== */

let game2048State = null;

function init2048(area, difficulty, best) {
  // إعدادات الصعوبة
  const configs = {
    easy:      { size: 4, target: 512,  name: 'سهل' },
    medium:    { size: 4, target: 1024, name: 'متوسط' },
    hard:      { size: 4, target: 2048, name: 'صعب' },
    legendary: { size: 5, target: 2048, name: 'أسطوري' }
  };
  const cfg = configs[difficulty] || configs.easy;
  const size = cfg.size;

  // تهيئة اللعبة
  game2048State = {
    grid: Array(size * size).fill(0),
    score: 0,
    size: size,
    target: cfg.target,
    gameOver: false,
    won: false,
    moved: false
  };

  // إضافة مربعين في الأول
  addRandomTile();
  addRandomTile();

  area.innerHTML = `
    <style>
      .g2048-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
        user-select: none;
      }
      .g2048-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        max-width: 400px;
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 12px 16px;
      }
      .g2048-score-box {
        text-align: center;
      }
      .g2048-score-label {
        font-size: 11px;
        color: var(--muted);
        font-weight: 700;
      }
      .g2048-score-val {
        font-size: 22px;
        font-weight: 900;
        color: var(--accent);
        text-shadow: 0 0 15px var(--accent);
      }
      .g2048-target {
        font-size: 12px;
        color: var(--muted);
        font-weight: 700;
      }
      .g2048-board {
        position: relative;
        background: var(--bg-2);
        border: 2px solid var(--border);
        border-radius: 16px;
        padding: 8px;
        display: grid;
        gap: 6px;
        touch-action: none;
        box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      }
      .g2048-cell {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
        background: rgba(0,0,0,0.2);
        font-weight: 900;
        transition: all 0.12s ease;
        aspect-ratio: 1;
        font-size: 22px;
      }
      .g2048-cell[data-v="2"]    { background: #eee4da; color: #776e65; }
      .g2048-cell[data-v="4"]    { background: #ede0c8; color: #776e65; }
      .g2048-cell[data-v="8"]    { background: #f2b179; color: #fff; }
      .g2048-cell[data-v="16"]   { background: #f59563; color: #fff; }
      .g2048-cell[data-v="32"]   { background: #f67c5f; color: #fff; }
      .g2048-cell[data-v="64"]   { background: #f65e3b; color: #fff; }
      .g2048-cell[data-v="128"]  { background: #edcf72; color: #fff; font-size: 19px; box-shadow: 0 0 20px rgba(237,207,114,0.4); }
      .g2048-cell[data-v="256"]  { background: #edcc61; color: #fff; font-size: 19px; box-shadow: 0 0 25px rgba(237,204,97,0.5); }
      .g2048-cell[data-v="512"]  { background: #edc850; color: #fff; font-size: 19px; box-shadow: 0 0 30px rgba(237,200,80,0.6); }
      .g2048-cell[data-v="1024"] { background: #edc53f; color: #fff; font-size: 16px; box-shadow: 0 0 35px rgba(237,197,63,0.7); }
      .g2048-cell[data-v="2048"] { background: linear-gradient(135deg, #edc22e, #f9d423); color: #fff; font-size: 16px; box-shadow: 0 0 40px rgba(237,194,46,0.8); animation: pulse2048 1s ease-in-out infinite alternate; }
      .g2048-cell[data-v="4096"] { background: linear-gradient(135deg, #ff006e, #ff8c00); color: #fff; font-size: 16px; box-shadow: 0 0 50px rgba(255,0,110,0.9); }
      @keyframes pulse2048 {
        from { transform: scale(1); }
        to { transform: scale(1.05); }
      }
      .g2048-cell.pop {
        animation: cellPop 0.2s ease;
      }
      @keyframes cellPop {
        0% { transform: scale(0.3); }
        60% { transform: scale(1.15); }
        100% { transform: scale(1); }
      }
      .g2048-controls {
        display: grid;
        grid-template-columns: repeat(3, 58px);
        gap: 8px;
        justify-content: center;
      }
      .g2048-controls button {
        font-size: 22px;
        padding: 12px;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: var(--bg-2);
        color: var(--ink);
        cursor: pointer;
        transition: all 0.15s;
        font-family: inherit;
        font-weight: 900;
      }
      .g2048-controls button:hover {
        background: var(--accent);
        color: var(--bg-1);
        transform: translateY(-2px);
      }
      .g2048-controls button:active {
        transform: translateY(0);
      }
      .g2048-win-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 16px;
        z-index: 9999;
        animation: fadeIn2048 0.3s ease;
      }
      @keyframes fadeIn2048 {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .g2048-win-icon {
        font-size: 100px;
        animation: bounce2048 0.6s ease;
      }
      @keyframes bounce2048 {
        0% { transform: scale(0); }
        60% { transform: scale(1.3); }
        100% { transform: scale(1); }
      }
      .g2048-win-title {
        font-size: 32px;
        font-weight: 900;
        background: var(--gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .g2048-win-score {
        font-size: 22px;
        font-weight: 800;
        color: #fff;
      }
    </style>

    <div class="g2048-wrap">
      <div class="g2048-info">
        <div class="g2048-score-box">
          <div class="g2048-score-label">النقاط</div>
          <div class="g2048-score-val" id="g2048Score">0</div>
        </div>
        <div class="g2048-target">
          🎯 الهدف: ${cfg.target}<br>
          📐 الشبكة: ${size}×${size}
        </div>
      </div>

      <div class="g2048-board" id="g2048Board" style="grid-template-columns: repeat(${size}, minmax(0, 1fr)); width: ${size === 5 ? '340px' : '300px'}; max-width: 100%;"></div>

      <div class="g2048-controls">
        <span></span>
        <button onclick="move2048('up')">↑</button>
        <span></span>
        <button onclick="move2048('left')">←</button>
        <button onclick="move2048('down')">↓</button>
        <button onclick="move2048('right')">→</button>
      </div>

      <button class="reset" onclick="restart2048('${difficulty}')" style="margin-top:8px">🔄 لعبة جديدة</button>
    </div>
  `;

  // رسم الشبكة
  draw2048();

  // السحب باللمس
  setup2048Touch();

  // السحب بالكيبورد
  document.onkeydown = (e) => {
    if (activeGame !== 'game2048') return;
    if (e.key === 'ArrowUp') { e.preventDefault(); move2048('up'); }
    if (e.key === 'ArrowDown') { e.preventDefault(); move2048('down'); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); move2048('left'); }
    if (e.key === 'ArrowRight') { e.preventDefault(); move2048('right'); }
  };
}

/* ===== إضافة مربع عشوائي ===== */
function addRandomTile() {
  const s = game2048State;
  const empty = [];
  for (let i = 0; i < s.grid.length; i++) {
    if (s.grid[i] === 0) empty.push(i);
  }
  if (empty.length === 0) return;

  const idx = empty[Math.floor(Math.random() * empty.length)];
  s.grid[idx] = Math.random() < 0.9 ? 2 : 4;

  // علامة للمربع الجديد (أنيميشن)
  s.lastAdded = idx;
}

/* ===== رسم الشبكة ===== */
function draw2048() {
  const s = game2048State;
  const board = document.getElementById('g2048Board');
  if (!board) return;

  board.innerHTML = '';
  for (let i = 0; i < s.grid.length; i++) {
    const cell = document.createElement('div');
    cell.className = 'g2048-cell';
    cell.dataset.v = s.grid[i];
    cell.textContent = s.grid[i] === 0 ? '' : s.grid[i];

    if (s.lastAdded === i) {
      cell.classList.add('pop');
    }

    // حجم الخط حسب الرقم
    const v = s.grid[i];
    if (v >= 1000) cell.style.fontSize = '15px';
    else if (v >= 100) cell.style.fontSize = '17px';
    else cell.style.fontSize = '22px';

    board.appendChild(cell);
  }

  // تحديث النقاط
  const scoreEl = document.getElementById('g2048Score');
  if (scoreEl) scoreEl.textContent = s.score;

  document.getElementById('currentScore').textContent = s.score;

  s.lastAdded = -1;
}

/* ===== تحريك ===== */
function move2048(dir) {
  const s = game2048State;
  if (s.gameOver) return;

  const size = s.size;
  const oldGrid = [...s.grid];
  let moved = false;

  // استخراج الخطوط حسب الاتجاه
  const lines = [];
  for (let i = 0; i < size; i++) {
    const line = [];
    for (let j = 0; j < size; j++) {
      if (dir === 'left')  line.push(s.grid[i * size + j]);
      if (dir === 'right') line.push(s.grid[i * size + (size - 1 - j)]);
      if (dir === 'up')    line.push(s.grid[j * size + i]);
      if (dir === 'down')  line.push(s.grid[(size - 1 - j) * size + i]);
    }
    lines.push(line);
  }

  // دمج كل خط
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // شيل الأصفار
    let nums = line.filter(v => v !== 0);
    // دمج الأرقام المتشابهة
    const merged = [];
    for (let j = 0; j < nums.length; j++) {
      if (j < nums.length - 1 && nums[j] === nums[j + 1]) {
        const newVal = nums[j] * 2;
        merged.push(newVal);
        s.score += newVal;
        j++;
      } else {
        merged.push(nums[j]);
      }
    }
    // كمّل أصفار
    while (merged.length < size) merged.push(0);
    lines[i] = merged;
  }

  // رجع الشبكة
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (dir === 'left')  s.grid[i * size + j] = lines[i][j];
      if (dir === 'right') s.grid[i * size + (size - 1 - j)] = lines[i][j];
      if (dir === 'up')    s.grid[j * size + i] = lines[i][j];
      if (dir === 'down')  s.grid[(size - 1 - j) * size + i] = lines[i][j];
    }
  }

  // هل حصل تغيير؟
  for (let i = 0; i < s.grid.length; i++) {
    if (s.grid[i] !== oldGrid[i]) { moved = true; break; }
  }

  if (!moved) return;

  // ضيف مربع جديد
  addRandomTile();
  draw2048();

  // فحص الفوز
  if (!s.won && s.grid.some(v => v >= s.target)) {
    s.won = true;
    setTimeout(() => show2048Win(), 300);
    return;
  }

  // فحص الخسارة
  if (is2048GameOver()) {
    s.gameOver = true;
    setTimeout(() => endGame('game2048', '', s.score), 500);
  }
}

/* ===== فحص نهاية اللعبة ===== */
function is2048GameOver() {
  const s = game2048State;
  const size = s.size;

  // فيه مكان فاضي؟
  if (s.grid.some(v => v === 0)) return false;

  // فيه دمج ممكن؟
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const v = s.grid[i * size + j];
      if (j < size - 1 && v === s.grid[i * size + j + 1]) return false;
      if (i < size - 1 && v === s.grid[(i + 1) * size + j]) return false;
    }
  }
  return true;
}

/* ===== شاشة الفوز ===== */
function show2048Win() {
  const s = game2048State;
  const overlay = document.createElement('div');
  overlay.className = 'g2048-win-overlay';
  overlay.innerHTML = `
    <div class="g2048-win-icon">🎉</div>
    <div class="g2048-win-title">مبروك! وصلت لـ ${s.target}</div>
    <div class="g2048-win-score">النقاط: ${s.score}</div>
    <button class="reset" onclick="this.closest('.g2048-win-overlay').remove(); endGame('game2048', '', ${s.score});">تمام 🎯</button>
  `;
  document.body.appendChild(overlay);
}

/* ===== لعبة جديدة ===== */
function restart2048(difficulty) {
  startGame('game2048', difficulty);
}

/* ===== السحب باللمس ===== */
function setup2048Touch() {
  const board = document.getElementById('g2048Board');
  if (!board) return;

  let startX = 0, startY = 0, moved = false;

  board.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    moved = false;
  }, { passive: true });

  board.addEventListener('touchmove', (e) => {
    if (moved) return;
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) < 30) return;

    moved = true;
    if (absX > absY) {
      move2048(dx > 0 ? 'right' : 'left');
    } else {
      move2048(dy > 0 ? 'down' : 'up');
    }
  }, { passive: true });

  // الماوس للكمبيوتر
  let mouseDown = false;
  board.addEventListener('mousedown', (e) => {
    mouseDown = true;
    startX = e.clientX;
    startY = e.clientY;
  });

  board.addEventListener('mouseup', (e) => {
    if (!mouseDown) return;
    mouseDown = false;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) < 30) return;

    if (absX > absY) {
      move2048(dx > 0 ? 'right' : 'left');
    } else {
      move2048(dy > 0 ? 'down' : 'up');
    }
  });
}
/* ===== 37. لعبة المشنوقة ===== */

const HANGMAN_WORDS = {
  easy: [
    { word: 'قمر', hint: '🌙 في السماء ليلاً' },
    { word: 'بحر', hint: '🌊 ماء مالح' },
    { word: 'شمس', hint: '☀️ بتطلع الصبح' },
    { word: 'بيت', hint: '🏠 مكان السكن' },
    { word: 'باب', hint: '🚪 بتدخل منه' },
    { word: 'قلم', hint: '✏️ بتكتب بيه' },
    { word: 'كتاب', hint: '📚 فيه معلومات' },
    { word: 'ماء', hint: '💧 بتشربه' },
    { word: 'نار', hint: '🔥 بتولع' },
    { word: 'ورد', hint: '🌹 زهرة جميلة' },
    { word: 'نجم', hint: '⭐ في السماء' },
    { word: 'سحاب', hint: '☁️ فيه مطر' },
    { word: 'عسل', hint: '🍯 حلو المذاق' },
    { word: 'جبل', hint: '⛰️ مرتفع' },
    { word: 'نهر', hint: '🏞️ ماء جاري' }
  ],
  medium: [
    { word: 'مدرسة', hint: '🏫 مكان التعليم' },
    { word: 'مستشفى', hint: '🏥 مكان العلاج' },
    { word: 'سيارة', hint: '🚗 وسيلة نقل' },
    { word: 'طائرة', hint: '✈️ بتطير' },
    { word: 'مطبخ', hint: '🍳 مكان الطبخ' },
    { word: 'هاتف', hint: '📱 بتتكلم بيه' },
    { word: 'كمبيوتر', hint: '💻 جهاز إلكتروني' },
    { word: 'مفتاح', hint: '🔑 بيفتح الباب' },
    { word: 'ساعة', hint: '⏰ بتقيس الوقت' },
    { word: 'مكتبة', hint: '📖 فيها كتب' },
    { word: 'حقيبة', hint: '🎒 بتحمل فيها' },
    { word: 'مظلة', hint: '☂️ بتحميك من المطر' },
    { word: 'شاطئ', hint: '🏖️ عند البحر' },
    { word: 'حديقة', hint: '🌳 فيها زرع' },
    { word: 'سفينة', hint: '🚢 بتسير في البحر' }
  ],
  hard: [
    { word: 'استقلال', hint: '🗽 الحرية' },
    { word: 'ديمقراطية', hint: '🗳️ نظام حكم' },
    { word: 'تكنولوجيا', hint: '💻 التقنية' },
    { word: 'استثمار', hint: '💰 فلوس بفلوس' },
    { word: 'جامعة', hint: '🎓 التعليم العالي' },
    { word: 'مسؤولية', hint: '⚖️ الالتزام' },
    { word: 'ابتكار', hint: '💡 الإبداع' },
    { word: 'ثقافة', hint: '📚 المعرفة' },
    { word: 'اقتصاد', hint: '💵 المال والتجارة' },
    { word: 'صناعة', hint: '🏭 المصانع' },
    { word: 'زراعة', hint: '🌾 الأرض' },
    { word: 'تجارة', hint: '🛒 البيع والشراء' }
  ],
  legendary: [
    { word: 'استقلالية', hint: '🗽 الحرية الكاملة' },
    { word: 'كونفدرالية', hint: '🏛️ نظام سياسي' },
    { word: 'استعمارية', hint: '🌍 نظام قديم' },
    { word: 'تكنولوجية', hint: '💻 التقنية الحديثة' },
    { word: 'استثمارية', hint: '💰 تجارية' },
    { word: 'دستورية', hint: '📜 قانونية' },
    { word: 'برلمانية', hint: '🏛️ نظام حكم' },
    { word: 'دبلوماسية', hint: '🤝 العلاقات الدولية' }
  ]
};

const ARABIC_LETTERS = [
  'ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض',
  'ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','هـ','و','ي'
];

let hangmanState = null;

function initHangman(area, difficulty, best) {
  const maxMistakes = {
    easy: 8, medium: 7, hard: 6, legendary: 5
  };
  
  const words = HANGMAN_WORDS[difficulty] || HANGMAN_WORDS.easy;
  const wordObj = words[Math.floor(Math.random() * words.length)];
  
  hangmanState = {
    word: wordObj.word,
    hint: wordObj.hint,
    guessed: [],
    mistakes: 0,
    maxMistakes: maxMistakes[difficulty] || 7,
    difficulty: difficulty,
    gameOver: false
  };

  renderHangman(area, best);
}

function renderHangman(area, best) {
  const s = hangmanState;
  const wordDisplay = s.word.split('').map(letter => {
    if (s.guessed.includes(letter)) return letter;
    if (letter === ' ') return ' ';
    return '_';
  }).join(' ');

  const mistakesLeft = s.maxMistakes - s.mistakes;
  const mistakesEmoji = '❌'.repeat(s.mistakes) + '⚪'.repeat(mistakesLeft);
  
  const win = s.word.split('').every(l => s.guessed.includes(l));

  area.innerHTML = `
    <style>
      .hm-wrap { text-align: center; }
      .hm-hint {
        background: var(--bg-2);
        border: 2px dashed var(--border);
        border-radius: 14px;
        padding: 14px;
        margin-bottom: 16px;
        font-size: 16px;
        font-weight: 800;
        color: var(--accent);
      }
      .hm-mistakes {
        font-size: 18px;
        margin-bottom: 16px;
        letter-spacing: 3px;
      }
      .hm-word {
        background: var(--bg-2);
        border: 2px solid var(--border);
        border-radius: 16px;
        padding: 24px 16px;
        margin-bottom: 20px;
        font-size: 32px;
        font-weight: 900;
        letter-spacing: 12px;
        color: var(--accent);
        font-family: 'JetBrains Mono', monospace;
        text-shadow: 0 0 20px rgba(0, 245, 255, 0.5);
        direction: ltr;
        word-break: break-all;
      }
      .hm-letters {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
        gap: 8px;
        max-width: 500px;
        margin: 0 auto;
      }
      .hm-letter {
        aspect-ratio: 1;
        background: var(--bg-2);
        border: 2px solid var(--border);
        border-radius: 12px;
        color: var(--ink);
        font-size: 20px;
        font-weight: 900;
        cursor: pointer;
        font-family: inherit;
        transition: all 0.15s;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .hm-letter:hover:not(:disabled) {
        background: var(--accent);
        color: var(--bg-1);
        transform: scale(1.08);
        border-color: var(--accent);
      }
      .hm-letter:disabled {
        cursor: default;
        opacity: 0.4;
      }
      .hm-letter.correct {
        background: var(--success);
        color: var(--bg-1);
        border-color: var(--success);
        opacity: 1;
        box-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
      }
      .hm-letter.wrong {
        background: var(--danger);
        color: #fff;
        border-color: var(--danger);
        opacity: 1;
      }
      .hm-win {
        color: var(--success);
        font-size: 22px;
        font-weight: 900;
        margin: 16px 0;
        animation: hmPulse 1s ease-in-out infinite alternate;
      }
      @keyframes hmPulse {
        from { transform: scale(1); }
        to { transform: scale(1.05); }
      }
    </style>

    <div class="hm-wrap">
      <div class="hm-hint">💡 ${s.hint}</div>
      
      <div class="hm-mistakes">${mistakesEmoji}</div>
      
      <div class="hm-word">${wordDisplay}</div>
      
      ${win ? '<div class="hm-win">🎉 كسبت! 🎉</div>' : ''}
      
      <div class="hm-letters" id="hmLetters"></div>
      
      <button class="reset" onclick="startGame('hangman', '${s.difficulty}')" style="margin-top:20px">🔄 لعبة جديدة</button>
    </div>
  `;

  // رسم الحروف
  const lettersEl = document.getElementById('hmLetters');
  ARABIC_LETTERS.forEach(letter => {
    const btn = document.createElement('button');
    btn.className = 'hm-letter';
    btn.textContent = letter;
    
    if (s.guessed.includes(letter)) {
      btn.disabled = true;
      if (s.word.includes(letter)) btn.classList.add('correct');
      else btn.classList.add('wrong');
    }
    
    btn.onclick = () => guessLetter(letter);
    lettersEl.appendChild(btn);
  });

  if (win) {
    s.gameOver = true;
    setTimeout(() => {
      const baseScores = { easy: 80, medium: 150, hard: 250, legendary: 400 };
      const score = (baseScores[s.difficulty] || 100) - s.mistakes * 10;
      endGame('hangman', s.difficulty, Math.max(20, score));
    }, 1500);
  }
}

function guessLetter(letter) {
  const s = hangmanState;
  if (!s || s.gameOver) return;
  if (s.guessed.includes(letter)) return;

  s.guessed.push(letter);
  
  if (!s.word.includes(letter)) {
    s.mistakes++;
    if (s.mistakes >= s.maxMistakes) {
      s.gameOver = true;
      const area = document.getElementById('gameArea');
      area.innerHTML = `
        <div style="text-align:center;padding:30px 16px">
          <div style="font-size:80px;margin-bottom:16px">💀</div>
          <h2 style="color:var(--danger);font-size:24px;margin-bottom:16px">خسرت!</h2>
          <p style="font-size:18px;margin-bottom:8px">الكلمة كانت:</p>
          <p style="font-size:28px;font-weight:900;color:var(--accent);margin-bottom:20px">${s.word}</p>
          <button class="reset" onclick="startGame('hangman', '${s.difficulty}')">🔄 حاول تاني</button>
          <button class="reset" onclick="backHome()" style="background:var(--gradient-2)">🏠 الرئيسية</button>
        </div>
      `;
      return;
    }
  }

  renderHangman(document.getElementById('gameArea'));
}
/* ===== 38. لعبة Flappy Bird ===== */

let flappyState = null;

function initFlappy(area, difficulty, best) {
  const configs = {
    easy:      { speed: 2,   gap: 130, gravity: 0.35, jump: -5.5, birdSize: 32, pipeWidth: 55 },
    medium:    { speed: 3,   gap: 115, gravity: 0.45, jump: -6,   birdSize: 28, pipeWidth: 55 },
    hard:      { speed: 4,   gap: 100, gravity: 0.55, jump: -6.5, birdSize: 24, pipeWidth: 60 },
    legendary: { speed: 5.5, gap: 90,  gravity: 0.65, jump: -7,   birdSize: 22, pipeWidth: 65 }
  };
  const cfg = configs[difficulty] || configs.easy;

  area.innerHTML = `
    <style>
      .flappy-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        user-select: none;
      }
      .flappy-canvas-wrap {
        position: relative;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 15px 40px rgba(0,0,0,0.5), 0 0 40px rgba(0, 245, 255, 0.15);
        border: 2px solid var(--border);
        background: linear-gradient(180deg, #4ec0e8, #87ceeb);
        touch-action: none;
      }
      #flappyCanvas {
        display: block;
        touch-action: none;
        max-width: 100%;
        height: auto;
      }
      .flappy-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 16px;
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(4px);
        color: #fff;
        text-align: center;
        padding: 20px;
      }
      .flappy-overlay.hidden { display: none; }
      .flappy-overlay-icon { font-size: 80px; }
      .flappy-overlay-title {
        font-size: 26px;
        font-weight: 900;
        background: var(--gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .flappy-overlay-score {
        font-size: 20px;
        font-weight: 800;
      }
      .flappy-tap-hint {
        font-size: 14px;
        opacity: 0.8;
      }
      .flappy-score-badge {
        position: absolute;
        top: 12px;
        right: 12px;
        background: rgba(0,0,0,0.5);
        color: #fff;
        padding: 8px 18px;
        border-radius: 99px;
        font-size: 20px;
        font-weight: 900;
        backdrop-filter: blur(6px);
        border: 1px solid rgba(255,255,255,0.2);
        z-index: 2;
      }
    </style>

    <div class="flappy-wrap">
      <div class="flappy-canvas-wrap">
        <canvas id="flappyCanvas" width="340" height="500"></canvas>
        <div class="flappy-score-badge" id="flappyScore">0</div>
        <div class="flappy-overlay" id="flappyOverlay">
          <div class="flappy-overlay-icon">🐦</div>
          <div class="flappy-overlay-title">اضغط للبدء</div>
          <div class="flappy-overlay-score">🏆 أفضل: ${best || 0}</div>
          <div class="flappy-tap-hint">👆 اضغط في أي مكان للطيران</div>
        </div>
      </div>
      <button class="reset" onclick="startGame('flappy', '${difficulty}')">🔄 إعادة</button>
    </div>
  `;

  // إعداد اللعبة
  const canvas = document.getElementById('flappyCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  flappyState = {
    bird: { x: 80, y: H / 2, vy: 0, size: cfg.birdSize },
    pipes: [],
    score: 0,
    running: false,
    gameOver: false,
    cfg: cfg,
    frame: 0,
    difficulty: difficulty,
    ground: H - 60
  };

  // رسم أولي
  drawFlappy();

  // اضغط للبدء أو الطيران
  function handleTap(e) {
    e.preventDefault();
    const s = flappyState;
    if (!s) return;

    if (!s.running && !s.gameOver) {
      // ابدأ اللعب
      s.running = true;
      document.getElementById('flappyOverlay').classList.add('hidden');
      startFlappyLoop();
      s.bird.vy = cfg.jump;
    } else if (s.running) {
      s.bird.vy = cfg.jump;
    }
  }

  canvas.addEventListener('click', handleTap);
  canvas.addEventListener('touchstart', handleTap, { passive: false });
  
  // مسافة للطيران بكيبورد
  document.onkeydown = (e) => {
    if (activeGame !== 'flappy') return;
    if (e.key === ' ' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!flappyState.running && !flappyState.gameOver) {
        flappyState.running = true;
        document.getElementById('flappyOverlay').classList.add('hidden');
        startFlappyLoop();
        flappyState.bird.vy = cfg.jump;
      } else if (flappyState.running) {
        flappyState.bird.vy = cfg.jump;
      }
    }
  };
}

function startFlappyLoop() {
  if (flappyTimer) clearInterval(flappyTimer);
  flappyTimer = setInterval(flappyTick, 1000 / 60);
}

function flappyTick() {
  const s = flappyState;
  if (!s || !s.running || s.gameOver) return;

  s.frame++;

  // حركة الطائر
  s.bird.vy += s.cfg.gravity;
  s.bird.y += s.bird.vy;

  // حدود الأرض والسقف
  if (s.bird.y + s.bird.size > s.ground) {
    s.bird.y = s.ground - s.bird.size;
    return gameOverFlappy();
  }
  if (s.bird.y < 0) {
    s.bird.y = 0;
    s.bird.vy = 0;
  }

  // إنشاء أنابيب جديدة
  if (s.frame % Math.floor(60 * 1.5 / s.cfg.speed * 2) === 0 || s.pipes.length === 0) {
    const minTop = 40;
    const maxTop = s.ground - s.cfg.gap - 40;
    const topHeight = minTop + Math.random() * (maxTop - minTop);
    
    s.pipes.push({
      x: 340,
      topHeight: topHeight,
      width: s.cfg.pipeWidth,
      passed: false
    });
  }

  // حركة الأنابيب
  s.pipes.forEach(p => {
    p.x -= s.cfg.speed;

    // فحص الاصطدام
    const birdLeft = s.bird.x;
    const birdRight = s.bird.x + s.bird.size;
    const birdTop = s.bird.y;
    const birdBottom = s.bird.y + s.bird.size;

    if (birdRight > p.x && birdLeft < p.x + p.width) {
      if (birdTop < p.topHeight || birdBottom > p.topHeight + s.cfg.gap) {
        return gameOverFlappy();
      }
    }

    // عدّ النقاط
    if (!p.passed && p.x + p.width < s.bird.x) {
      p.passed = true;
      s.score++;
      document.getElementById('flappyScore').textContent = s.score;
      document.getElementById('currentScore').textContent = s.score;
    }
  });

  // شيل الأنابيب القديمة
  s.pipes = s.pipes.filter(p => p.x + p.width > -10);

  drawFlappy();
}

function drawFlappy() {
  const s = flappyState;
  if (!s) return;
  const canvas = document.getElementById('flappyCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // خلفية - سماء
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
  skyGrad.addColorStop(0, '#4ec0e8');
  skyGrad.addColorStop(1, '#87ceeb');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // سحاب
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  for (let i = 0; i < 3; i++) {
    const x = ((s.frame * 0.3 + i * 130) % (W + 80)) - 40;
    const y = 60 + i * 50;
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.arc(x + 20, y, 25, 0, Math.PI * 2);
    ctx.arc(x + 45, y, 20, 0, Math.PI * 2);
    ctx.fill();
  }

  // أرض
  const groundGrad = ctx.createLinearGradient(0, s.ground, 0, H);
  groundGrad.addColorStop(0, '#7cb342');
  groundGrad.addColorStop(1, '#558b2f');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, s.ground, W, H - s.ground);

  // نقشة الأرض
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  for (let i = 0; i < W; i += 20) {
    ctx.fillRect((i + s.frame * s.cfg.speed) % (W + 20) - 20, s.ground, 10, 4);
  }

  // الأنابيب
  s.pipes.forEach(p => {
    const pipeGrad = ctx.createLinearGradient(p.x, 0, p.x + p.width, 0);
    pipeGrad.addColorStop(0, '#66bb6a');
    pipeGrad.addColorStop(0.4, '#81c784');
    pipeGrad.addColorStop(1, '#388e3c');
    
    // الأنبوب العلوي
    ctx.fillStyle = pipeGrad;
    ctx.fillRect(p.x, 0, p.width, p.topHeight);
    // رأس الأنبوب العلوي
    ctx.fillRect(p.x - 5, p.topHeight - 22, p.width + 10, 22);
    
    // الأنبوب السفلي
    ctx.fillRect(p.x, p.topHeight + s.cfg.gap, p.width, s.ground - p.topHeight - s.cfg.gap);
    // رأس الأنبوب السفلي
    ctx.fillRect(p.x - 5, p.topHeight + s.cfg.gap, p.width + 10, 22);

    // إضاءة
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(p.x + 5, 0, 6, p.topHeight);
    ctx.fillRect(p.x + 5, p.topHeight + s.cfg.gap, 6, s.ground - p.topHeight - s.cfg.gap);
  });

  // الطائر
  const bx = s.bird.x;
  const by = s.bird.y;
  const bs = s.bird.size;

  ctx.save();
  ctx.translate(bx + bs / 2, by + bs / 2);
  const rotation = Math.max(-0.5, Math.min(0.8, s.bird.vy / 12));
  ctx.rotate(rotation);

  // الجسم
  ctx.fillStyle = '#ffca28';
  ctx.beginPath();
  ctx.ellipse(0, 0, bs / 2, bs / 2 * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f57c00';
  ctx.lineWidth = 2;
  ctx.stroke();

  // البطن
  ctx.fillStyle = '#ffe082';
  ctx.beginPath();
  ctx.ellipse(-bs * 0.1, bs * 0.15, bs * 0.3, bs * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // العين
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(bs * 0.15, -bs * 0.15, bs * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(bs * 0.18, -bs * 0.15, bs * 0.07, 0, Math.PI * 2);
  ctx.fill();

  // المنقار
  ctx.fillStyle = '#ff6f00';
  ctx.beginPath();
  ctx.moveTo(bs * 0.35, 0);
  ctx.lineTo(bs * 0.6, bs * 0.05);
  ctx.lineTo(bs * 0.35, bs * 0.15);
  ctx.closePath();
  ctx.fill();

  // الجنح
  const wingFlap = Math.sin(s.frame * 0.3) * 3;
  ctx.fillStyle = '#f57c00';
  ctx.beginPath();
  ctx.ellipse(-bs * 0.1, wingFlap, bs * 0.25, bs * 0.15, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function gameOverFlappy() {
  const s = flappyState;
  if (!s) return;
  s.gameOver = true;
  s.running = false;
  if (flappyTimer) {
    clearInterval(flappyTimer);
    flappyTimer = null;
  }

  const overlay = document.getElementById('flappyOverlay');
  if (overlay) {
    overlay.classList.remove('hidden');
    overlay.innerHTML = `
      <div class="flappy-overlay-icon">💥</div>
      <div class="flappy-overlay-title">خسرت!</div>
      <div class="flappy-overlay-score">النقاط: ${s.score}</div>
      <button class="reset" onclick="startGame('flappy', '${s.difficulty}')">🔄 حاول تاني</button>
    `;
  }

  setTimeout(() => {
    endGame('flappy', s.difficulty, s.score * 10);
  }, 1200);
}
/* ===== 39. لعبة Tetris ===== */

const TETRIS_PIECES = {
  I: { shape: [[1,1,1,1]], color: '#00f0f0' },
  O: { shape: [[1,1],[1,1]], color: '#f0f000' },
  T: { shape: [[0,1,0],[1,1,1]], color: '#a000f0' },
  S: { shape: [[0,1,1],[1,1,0]], color: '#00f000' },
  Z: { shape: [[1,1,0],[0,1,1]], color: '#f00000' },
  J: { shape: [[1,0,0],[1,1,1]], color: '#0000f0' },
  L: { shape: [[0,0,1],[1,1,1]], color: '#f0a000' }
};

let tetrisState = null;

function initTetris(area, difficulty, best) {
  const configs = {
    easy:      { cols: 10, rows: 16, speed: 800, name: 'سهل' },
    medium:    { cols: 10, rows: 18, speed: 600, name: 'متوسط' },
    hard:      { cols: 10, rows: 20, speed: 400, name: 'صعب' },
    legendary: { cols: 10, rows: 22, speed: 250, name: 'أسطوري' }
  };
  const cfg = configs[difficulty] || configs.medium;
  const cols = cfg.cols;
  const rows = cfg.rows;
  const cellSize = 26;

  tetrisState = {
    cols: cols,
    rows: rows,
    board: Array(rows).fill(null).map(() => Array(cols).fill(null)),
    current: null,
    next: null,
    score: 0,
    lines: 0,
    level: 1,
    gameOver: false,
    paused: false,
    speed: cfg.speed,
    difficulty: difficulty,
    cellSize: cellSize
  };

  area.innerHTML = `
    <style>
      .tetris-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        user-select: none;
      }
      .tetris-header {
        display: flex;
        gap: 12px;
        width: 100%;
        max-width: 400px;
        justify-content: center;
        flex-wrap: wrap;
      }
      .tetris-stat {
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 8px 14px;
        text-align: center;
        min-width: 70px;
      }
      .tetris-stat-label {
        font-size: 10px;
        color: var(--muted);
        font-weight: 700;
      }
      .tetris-stat-val {
        font-size: 18px;
        font-weight: 900;
        color: var(--accent);
      }
      .tetris-main {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        justify-content: center;
        flex-wrap: wrap;
      }
      .tetris-canvas-wrap {
        position: relative;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 15px 40px rgba(0,0,0,0.5), 0 0 40px rgba(0, 245, 255, 0.15);
        border: 2px solid var(--border);
        background: #0a0a1a;
        touch-action: none;
      }
      #tetrisCanvas {
        display: block;
        touch-action: none;
      }
      .tetris-next-box {
        background: var(--bg-2);
        border: 2px solid var(--border);
        border-radius: 14px;
        padding: 10px;
        text-align: center;
      }
      .tetris-next-label {
        font-size: 11px;
        color: var(--muted);
        font-weight: 700;
        margin-bottom: 6px;
      }
      #tetrisNextCanvas {
        display: block;
        border-radius: 8px;
      }
      .tetris-controls {
        display: grid;
        grid-template-columns: repeat(3, 58px);
        gap: 8px;
        justify-content: center;
      }
      .tetris-controls button {
        font-size: 22px;
        padding: 12px;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: var(--bg-2);
        color: var(--ink);
        cursor: pointer;
        transition: all 0.15s;
        font-family: inherit;
        font-weight: 900;
      }
      .tetris-controls button:hover {
        background: var(--accent);
        color: var(--bg-1);
        transform: translateY(-2px);
      }
      .tetris-controls button:active {
        transform: translateY(0);
      }
      .tetris-controls button.wide {
        grid-column: span 3;
      }
      .tetris-gameover {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 16px;
        z-index: 10;
        color: #fff;
        text-align: center;
        padding: 20px;
      }
      .tetris-gameover.hidden { display: none; }
      .tetris-gameover-icon {
        font-size: 70px;
      }
      .tetris-gameover-title {
        font-size: 26px;
        font-weight: 900;
        color: var(--danger);
      }
      .tetris-gameover-score {
        font-size: 20px;
        font-weight: 800;
      }
    </style>

    <div class="tetris-wrap">
      <div class="tetris-header">
        <div class="tetris-stat">
          <div class="tetris-stat-label">النقاط</div>
          <div class="tetris-stat-val" id="tetrisScore">0</div>
        </div>
        <div class="tetris-stat">
          <div class="tetris-stat-label">الصفوف</div>
          <div class="tetris-stat-val" id="tetrisLines">0</div>
        </div>
        <div class="tetris-stat">
          <div class="tetris-stat-label">المستوى</div>
          <div class="tetris-stat-val" id="tetrisLevel">1</div>
        </div>
      </div>

      <div class="tetris-main">
        <div class="tetris-canvas-wrap" style="width: ${cols * cellSize}px; height: ${rows * cellSize}px; max-width: 100%;">
          <canvas id="tetrisCanvas" width="${cols * cellSize}" height="${rows * cellSize}"></canvas>
          <div class="tetris-gameover hidden" id="tetrisGameOver">
            <div class="tetris-gameover-icon">💥</div>
            <div class="tetris-gameover-title">انتهت اللعبة!</div>
            <div class="tetris-gameover-score">النقاط: <span id="tetrisFinalScore">0</span></div>
            <button class="reset" onclick="startGame('tetris', '${difficulty}')">🔄 حاول تاني</button>
          </div>
        </div>

        <div class="tetris-next-box">
          <div class="tetris-next-label">التالي</div>
          <canvas id="tetrisNextCanvas" width="80" height="80"></canvas>
        </div>
      </div>

      <div class="tetris-controls">
        <button onclick="tetrisMove('left')">←</button>
        <button onclick="tetrisRotate()">🔄</button>
        <button onclick="tetrisMove('right')">→</button>
        <button onclick="tetrisSoftDrop()" class="wide">↓ نزول سريع ↓</button>
      </div>

      <button class="reset" onclick="startGame('tetris', '${difficulty}')">🔄 إعادة</button>
    </div>
  `;

  // تشغيل اللعبة
  spawnTetrisPiece();
  spawnTetrisPiece();
  drawTetris();

  // كيبورد
  document.onkeydown = (e) => {
    if (activeGame !== 'tetris') return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); tetrisMove('left'); }
    if (e.key === 'ArrowRight') { e.preventDefault(); tetrisMove('right'); }
    if (e.key === 'ArrowDown') { e.preventDefault(); tetrisSoftDrop(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); tetrisRotate(); }
    if (e.key === ' ') { e.preventDefault(); tetrisHardDrop(); }
  };

  // اللمس - سحب للتحريك
  setupTetrisTouch();

  // تايمر
  startTetrisLoop();
}

function startTetrisLoop() {
  if (tetrisTimer) clearInterval(tetrisTimer);
  tetrisTimer = setInterval(tetrisDrop, tetrisState.speed);
}

function spawnTetrisPiece() {
  const s = tetrisState;
  const keys = Object.keys(TETRIS_PIECES);
  
  if (!s.next) {
    const key = keys[Math.floor(Math.random() * keys.length)];
    s.next = { type: key, ...TETRIS_PIECES[key] };
  }
  
  s.current = {
    ...s.next,
    x: Math.floor((s.cols - s.next.shape[0].length) / 2),
    y: 0
  };
  
  const key = keys[Math.floor(Math.random() * keys.length)];
  s.next = { type: key, ...TETRIS_PIECES[key] };

  // فحص نهاية اللعبة
  if (tetrisCollision(s.current.shape, s.current.x, s.current.y)) {
    tetrisGameOver();
  }

  drawNextPiece();
}

function tetrisCollision(shape, px, py) {
  const s = tetrisState;
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (!shape[y][x]) continue;
      const nx = px + x;
      const ny = py + y;
      if (nx < 0 || nx >= s.cols || ny >= s.rows) return true;
      if (ny >= 0 && s.board[ny][nx]) return true;
    }
  }
  return false;
}

function tetrisDrop() {
  const s = tetrisState;
  if (!s || s.gameOver || s.paused) return;

  const nextY = s.current.y + 1;
  if (tetrisCollision(s.current.shape, s.current.x, nextY)) {
    lockTetrisPiece();
  } else {
    s.current.y = nextY;
    drawTetris();
  }
}

function tetrisMove(dir) {
  const s = tetrisState;
  if (!s || s.gameOver) return;
  const dx = dir === 'left' ? -1 : 1;
  if (!tetrisCollision(s.current.shape, s.current.x + dx, s.current.y)) {
    s.current.x += dx;
    drawTetris();
  }
}

function tetrisRotate() {
  const s = tetrisState;
  if (!s || s.gameOver) return;

  const shape = s.current.shape;
  const rotated = shape[0].map((_, i) => shape.map(row => row[i]).reverse());

  // جرب تدوير عادي
  if (!tetrisCollision(rotated, s.current.x, s.current.y)) {
    s.current.shape = rotated;
    drawTetris();
    return;
  }

  // جرب تحريك لليسار
  if (!tetrisCollision(rotated, s.current.x - 1, s.current.y)) {
    s.current.shape = rotated;
    s.current.x -= 1;
    drawTetris();
    return;
  }

  // جرب تحريك لليمين
  if (!tetrisCollision(rotated, s.current.x + 1, s.current.y)) {
    s.current.shape = rotated;
    s.current.x += 1;
    drawTetris();
  }
}

function tetrisSoftDrop() {
  const s = tetrisState;
  if (!s || s.gameOver) return;
  if (!tetrisCollision(s.current.shape, s.current.x, s.current.y + 1)) {
    s.current.y += 1;
    s.score += 1;
    updateTetrisScore();
    drawTetris();
  }
}

function tetrisHardDrop() {
  const s = tetrisState;
  if (!s || s.gameOver) return;
  while (!tetrisCollision(s.current.shape, s.current.x, s.current.y + 1)) {
    s.current.y += 1;
    s.score += 2;
  }
  updateTetrisScore();
  lockTetrisPiece();
}

function lockTetrisPiece() {
  const s = tetrisState;
  const shape = s.current.shape;
  
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const ny = s.current.y + y;
        const nx = s.current.x + x;
        if (ny >= 0 && ny < s.rows && nx >= 0 && nx < s.cols) {
          s.board[ny][nx] = s.current.color;
        }
      }
    }
  }

  // فحص الصفوف الكاملة
  let linesCleared = 0;
  for (let y = s.rows - 1; y >= 0; y--) {
    if (s.board[y].every(cell => cell)) {
      s.board.splice(y, 1);
      s.board.unshift(Array(s.cols).fill(null));
      linesCleared++;
      y++;
    }
  }

  if (linesCleared > 0) {
    const points = [0, 100, 300, 500, 800][linesCleared] || 1000;
    s.score += points * s.level;
    s.lines += linesCleared;
    s.level = Math.floor(s.lines / 10) + 1;
    
    // زيادة السرعة
    s.speed = Math.max(100, s.speed - 20);
    startTetrisLoop();
    
    updateTetrisScore();
  }

  spawnTetrisPiece();
  drawTetris();
}

function updateTetrisScore() {
  const s = tetrisState;
  const scoreEl = document.getElementById('tetrisScore');
  const linesEl = document.getElementById('tetrisLines');
  const levelEl = document.getElementById('tetrisLevel');
  
  if (scoreEl) scoreEl.textContent = s.score;
  if (linesEl) linesEl.textContent = s.lines;
  if (levelEl) levelEl.textContent = s.level;
  
  document.getElementById('currentScore').textContent = s.score;
}

function drawTetris() {
  const s = tetrisState;
  if (!s) return;
  const canvas = document.getElementById('tetrisCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cs = s.cellSize;

  // خلفية
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // شبكة
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= s.cols; x++) {
    ctx.beginPath();
    ctx.moveTo(x * cs, 0);
    ctx.lineTo(x * cs, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= s.rows; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * cs);
    ctx.lineTo(canvas.width, y * cs);
    ctx.stroke();
  }

  // البلوكات الموجودة
  for (let y = 0; y < s.rows; y++) {
    for (let x = 0; x < s.cols; x++) {
      if (s.board[y][x]) {
        drawTetrisBlock(ctx, x * cs, y * cs, cs, s.board[y][x]);
      }
    }
  }

  // القطعة الحالية
  if (s.current && !s.gameOver) {
    const shape = s.current.shape;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const px = (s.current.x + x) * cs;
          const py = (s.current.y + y) * cs;
          drawTetrisBlock(ctx, px, py, cs, s.current.color);
        }
      }
    }
  }
}

function drawTetrisBlock(ctx, x, y, size, color) {
  // جسم البلوك
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, size - 2, size - 2);

  // إضاءة
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.fillRect(x + 1, y + 1, size - 2, 3);
  ctx.fillRect(x + 1, y + 1, 3, size - 2);

  // ظل
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(x + 1, y + size - 4, size - 2, 3);
  ctx.fillRect(x + size - 4, y + 1, 3, size - 2);

  // حدود
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
}

function drawNextPiece() {
  const s = tetrisState;
  const canvas = document.getElementById('tetrisNextCanvas');
  if (!canvas || !s.next) return;
  const ctx = canvas.getContext('2d');
  const cs = 18;

  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const shape = s.next.shape;
  const offX = (canvas.width - shape[0].length * cs) / 2;
  const offY = (canvas.height - shape.length * cs) / 2;

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        drawTetrisBlock(ctx, offX + x * cs, offY + y * cs, cs, s.next.color);
      }
    }
  }
}

function tetrisGameOver() {
  const s = tetrisState;
  if (!s) return;
  s.gameOver = true;
  if (tetrisTimer) {
    clearInterval(tetrisTimer);
    tetrisTimer = null;
  }

  const overlay = document.getElementById('tetrisGameOver');
  if (overlay) {
    overlay.classList.remove('hidden');
    const finalEl = document.getElementById('tetrisFinalScore');
    if (finalEl) finalEl.textContent = s.score;
  }

  setTimeout(() => {
    endGame('tetris', s.difficulty, s.score);
  }, 1500);
}

function setupTetrisTouch() {
  const canvas = document.getElementById('tetrisCanvas');
  if (!canvas) return;

  let startX = 0, startY = 0, lastX = 0, moved = false, startTime = 0;

  canvas.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    lastX = startX;
    moved = false;
    startTime = Date.now();
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    const dx = t.clientX - lastX;
    const cellSize = tetrisState ? tetrisState.cellSize : 26;
    
    if (Math.abs(dx) > cellSize * 0.8) {
      if (dx > 0) tetrisMove('right');
      else tetrisMove('left');
      lastX = t.clientX;
      moved = true;
    }
  }, { passive: true });

  canvas.addEventListener('touchend', (e) => {
    const duration = Date.now() - startTime;
    if (!moved && duration < 250) {
      tetrisRotate();
    } else {
      const dy = (e.changedTouches[0]?.clientY || 0) - startY;
      if (dy > 80) tetrisHardDrop();
    }
  }, { passive: true });
}
/* ===== 40. لعبة Color Match ===== */

let cmState = null;

function initColorMatch(area, difficulty, best) {
  const configs = {
    easy:      { grid: 2, diff: 40, time: 20, name: 'سهل' },
    medium:    { grid: 3, diff: 25, time: 15, name: 'متوسط' },
    hard:      { grid: 4, diff: 15, time: 12, name: 'صعب' },
    legendary: { grid: 5, diff: 8,  time: 10, name: 'أسطوري' }
  };
  const cfg = configs[difficulty] || configs.medium;

  cmState = {
    gridSize: cfg.grid,
    diff: cfg.diff,
    timeLeft: cfg.time,
    maxTime: cfg.time,
    score: 0,
    round: 0,
    difficulty: difficulty,
    gameOver: false,
    targetColor: '',
    baseColor: '',
    locked: false,
    timer: null
  };

  area.innerHTML = `
    <style>
      .cm-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        user-select: none;
      }
      .cm-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        max-width: 380px;
        gap: 10px;
        flex-wrap: wrap;
      }
      .cm-stat {
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 8px 14px;
        text-align: center;
        flex: 1;
        min-width: 80px;
      }
      .cm-stat-label {
        font-size: 10px;
        color: var(--muted);
        font-weight: 700;
      }
      .cm-stat-val {
        font-size: 18px;
        font-weight: 900;
        color: var(--accent);
      }
      .cm-time-bar {
        width: 100%;
        max-width: 380px;
        height: 10px;
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 99px;
        overflow: hidden;
      }
      .cm-time-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--success), var(--warning), var(--danger));
        border-radius: 99px;
        transition: width 0.3s linear;
        box-shadow: 0 0 15px rgba(0, 245, 255, 0.4);
      }
      .cm-board {
        display: grid;
        gap: 8px;
        padding: 16px;
        background: var(--bg-2);
        border: 2px solid var(--border);
        border-radius: 20px;
        box-shadow: 0 15px 40px rgba(0,0,0,0.4), 0 0 40px rgba(0, 245, 255, 0.1);
      }
      .cm-cell {
        border-radius: 12px;
        cursor: pointer;
        transition: transform 0.15s, box-shadow 0.15s;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      }
      .cm-cell:hover {
        transform: scale(1.05);
      }
      .cm-cell:active {
        transform: scale(0.95);
      }
      .cm-cell.correct {
        animation: cmPop 0.4s ease;
      }
      .cm-cell.wrong {
        animation: cmShake 0.4s ease;
      }
      @keyframes cmPop {
        0% { transform: scale(1); }
        50% { transform: scale(1.3); box-shadow: 0 0 40px var(--success); }
        100% { transform: scale(1); }
      }
      @keyframes cmShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-8px); }
        75% { transform: translateX(8px); }
      }
      .cm-gameover {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 16px;
        z-index: 9999;
        color: #fff;
        text-align: center;
        padding: 20px;
      }
      .cm-gameover-icon {
        font-size: 80px;
      }
      .cm-gameover-title {
        font-size: 28px;
        font-weight: 900;
        background: var(--gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .cm-gameover-score {
        font-size: 22px;
        font-weight: 800;
      }
    </style>

    <div class="cm-wrap">
      <div class="cm-header">
        <div class="cm-stat">
          <div class="cm-stat-label">النقاط</div>
          <div class="cm-stat-val" id="cmScore">0</div>
        </div>
        <div class="cm-stat">
          <div class="cm-stat-label">الجولة</div>
          <div class="cm-stat-val" id="cmRound">1</div>
        </div>
        <div class="cm-stat">
          <div class="cm-stat-label">الوقت</div>
          <div class="cm-stat-val" id="cmTime">${cfg.time}</div>
        </div>
      </div>

      <div class="cm-time-bar">
        <div class="cm-time-fill" id="cmTimeFill" style="width: 100%"></div>
      </div>

      <div class="cm-board" id="cmBoard"></div>

      <button class="reset" onclick="startGame('colormatch', '${difficulty}')">🔄 إعادة</button>
    </div>
  `;

  renderCMRound();
  startCMTimer();
}

function renderCMRound() {
  const s = cmState;
  if (!s || s.gameOver) return;

  s.round++;
  document.getElementById('cmRound').textContent = s.round;

  // توليد لون أساسي عشوائي
  const hue = Math.floor(Math.random() * 360);
  const sat = 65 + Math.random() * 20;
  const light = 45 + Math.random() * 15;
  
  s.baseColor = `hsl(${hue}, ${sat}%, ${light}%)`;
  
  // اللون الهدف - مختلف في الإضاءة
  const diff = s.diff;
  const targetLight = light + (Math.random() < 0.5 ? diff : -diff);
  s.targetColor = `hsl(${hue}, ${sat}%, ${targetLight}%)`;

  // موقع اللون الهدف
  const total = s.gridSize * s.gridSize;
  const targetIndex = Math.floor(Math.random() * total);

  // رسم اللوحة
  const board = document.getElementById('cmBoard');
  const cellSize = s.gridSize <= 3 ? 80 : s.gridSize === 4 ? 65 : 55;
  board.style.gridTemplateColumns = `repeat(${s.gridSize}, ${cellSize}px)`;
  board.innerHTML = '';

  for (let i = 0; i < total; i++) {
    const cell = document.createElement('div');
    cell.className = 'cm-cell';
    cell.style.width = cellSize + 'px';
    cell.style.height = cellSize + 'px';
    cell.style.background = i === targetIndex ? s.targetColor : s.baseColor;
    cell.dataset.isTarget = i === targetIndex ? '1' : '0';
    cell.onclick = () => cmCellClick(cell, i === targetIndex);
    board.appendChild(cell);
  }
}

function cmCellClick(cell, isCorrect) {
  const s = cmState;
  if (!s || s.gameOver || s.locked) return;

  if (isCorrect) {
    s.locked = true;
    cell.classList.add('correct');
    
    // نقاط حسب السرعة
    const timeBonus = Math.floor(s.timeLeft * 3);
    const roundBonus = s.round * 5;
    s.score += 10 + timeBonus + roundBonus;
    
    document.getElementById('cmScore').textContent = s.score;
    document.getElementById('currentScore').textContent = s.score;

    // قلل الوقت والفرق
    s.timeLeft = Math.max(3, s.timeLeft - 0.3);
    s.diff = Math.max(3, s.diff - 1);
    
    // كبّر الشبكة كل 5 جولات
    if (s.round % 5 === 0 && s.gridSize < 7) {
      s.gridSize++;
    }

    setTimeout(() => {
      s.locked = false;
      renderCMRound();
    }, 400);

  } else {
    cell.classList.add('wrong');
    s.score = Math.max(0, s.score - 20);
    document.getElementById('cmScore').textContent = s.score;
    s.timeLeft = Math.max(0, s.timeLeft - 2);

    setTimeout(() => {
      cell.classList.remove('wrong');
    }, 400);
  }
}

function startCMTimer() {
  if (cmTimer) clearInterval(cmTimer);
  let lastTick = Date.now();
  
  cmTimer = setInterval(() => {
    const s = cmState;
    if (!s || s.gameOver) return;

    const now = Date.now();
    const delta = (now - lastTick) / 1000;
    lastTick = now;

    s.timeLeft -= delta;

    if (s.timeLeft <= 0) {
      s.timeLeft = 0;
      updateCMTime();
      cmGameOver();
      return;
    }

    updateCMTime();
  }, 100);
}

function updateCMTime() {
  const s = cmState;
  if (!s) return;
  
  const timeEl = document.getElementById('cmTime');
  const fillEl = document.getElementById('cmTimeFill');
  
  if (timeEl) timeEl.textContent = Math.ceil(s.timeLeft);
  
  if (fillEl) {
    const pct = (s.timeLeft / s.maxTime) * 100;
    fillEl.style.width = Math.max(0, pct) + '%';
  }
}

function cmGameOver() {
  const s = cmState;
  if (!s) return;
  s.gameOver = true;
  if (cmTimer) {
    clearInterval(cmTimer);
    cmTimer = null;
  }

  const overlay = document.createElement('div');
  overlay.className = 'cm-gameover';
  overlay.innerHTML = `
    <div class="cm-gameover-icon">⏰</div>
    <div class="cm-gameover-title">انتهى الوقت!</div>
    <div class="cm-gameover-score">النقاط: ${s.score}</div>
    <div style="opacity: 0.8">وصلت للجولة ${s.round}</div>
    <button class="reset" onclick="this.closest('.cm-gameover').remove(); startGame('colormatch', '${s.difficulty}')">🔄 حاول تاني</button>
    <button class="reset" onclick="this.closest('.cm-gameover').remove(); backHome()" style="background: var(--gradient-2)">🏠 الرئيسية</button>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => {
    endGame('colormatch', s.difficulty, s.score);
  }, 2000);
}
/* ===== 41. لعبة الذاكرة السريعة ===== */

let qmState = null;

function initQuickMemory(area, difficulty, best) {
  const configs = {
    easy:      { start: 3, max: 8,  showTime: 2500, name: 'سهل' },
    medium:    { start: 4, max: 10, showTime: 2000, name: 'متوسط' },
    hard:      { start: 5, max: 12, showTime: 1500, name: 'صعب' },
    legendary: { start: 6, max: 15, showTime: 1000, name: 'أسطوري' }
  };
  const cfg = configs[difficulty] || configs.medium;

  qmState = {
    difficulty: difficulty,
    level: 1,
    score: 0,
    digits: cfg.start,
    maxDigits: cfg.max,
    showTime: cfg.showTime,
    currentSequence: [],
    userInput: '',
    phase: 'show', // show, input, result
    locked: false,
    timer: null,
    gameOver: false
  };

  area.innerHTML = `
    <style>
      .qm-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        user-select: none;
      }
      .qm-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        max-width: 380px;
        gap: 10px;
        flex-wrap: wrap;
      }
      .qm-stat {
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 8px 14px;
        text-align: center;
        flex: 1;
        min-width: 80px;
      }
      .qm-stat-label {
        font-size: 10px;
        color: var(--muted);
        font-weight: 700;
      }
      .qm-stat-val {
        font-size: 18px;
        font-weight: 900;
        color: var(--accent);
      }
      .qm-phase {
        font-size: 14px;
        font-weight: 800;
        color: var(--warning);
        text-align: center;
        padding: 8px 16px;
        background: rgba(255, 184, 0, 0.15);
        border: 1px solid rgba(255, 184, 0, 0.4);
        border-radius: 10px;
        min-height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .qm-phase.input {
        background: rgba(0, 255, 136, 0.15);
        border-color: rgba(0, 255, 136, 0.4);
        color: var(--success);
      }
      .qm-display {
        min-height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 24px 16px;
        background: var(--bg-2);
        border: 2px solid var(--border);
        border-radius: 20px;
        width: 100%;
        max-width: 500px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        flex-wrap: wrap;
      }
      .qm-number {
        font-size: 44px;
        font-weight: 900;
        font-family: 'JetBrains Mono', monospace;
        color: var(--accent);
        text-shadow: 0 0 25px rgba(0, 245, 255, 0.6);
        animation: qmPop 0.3s ease;
        min-width: 40px;
        text-align: center;
      }
      .qm-number.hidden {
        color: var(--border);
        text-shadow: none;
      }
      @keyframes qmPop {
        0% { transform: scale(0.5); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      .qm-input-display {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: center;
      }
      .qm-input-box {
        width: 50px;
        height: 60px;
        border-radius: 12px;
        border: 2px solid var(--border);
        background: var(--bg-2);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        font-weight: 900;
        font-family: 'JetBrains Mono', monospace;
        color: var(--ink);
        transition: all 0.2s;
      }
      .qm-input-box.filled {
        background: var(--card);
        color: var(--accent);
        border-color: var(--accent);
        box-shadow: 0 0 20px rgba(0, 245, 255, 0.4);
      }
      .qm-input-box.correct {
        background: var(--success);
        color: var(--bg-1);
        border-color: var(--success);
      }
      .qm-input-box.wrong {
        background: var(--danger);
        color: #fff;
        border-color: var(--danger);
      }
      .qm-input-box.active {
        border-color: var(--warning);
        box-shadow: 0 0 20px rgba(255, 184, 0, 0.5);
        animation: qmBlink 1s ease-in-out infinite;
      }
      @keyframes qmBlink {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.08); }
      }
      .qm-keypad {
        display: grid;
        grid-template-columns: repeat(3, 65px);
        gap: 8px;
        justify-content: center;
      }
      .qm-keypad button {
        height: 60px;
        border-radius: 14px;
        border: 1px solid var(--border);
        background: var(--bg-2);
        color: var(--ink);
        font-size: 22px;
        font-weight: 900;
        font-family: inherit;
        cursor: pointer;
        transition: all 0.15s;
      }
      .qm-keypad button:hover:not(:disabled) {
        background: var(--accent);
        color: var(--bg-1);
        transform: translateY(-2px);
      }
      .qm-keypad button:active:not(:disabled) {
        transform: translateY(0);
      }
      .qm-keypad button:disabled {
        opacity: 0.4;
        cursor: default;
      }
      .qm-keypad button.del {
        background: var(--danger);
        color: #fff;
      }
      .qm-keypad button.ok {
        background: var(--success);
        color: var(--bg-1);
      }
      .qm-gameover {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 16px;
        z-index: 9999;
        color: #fff;
        text-align: center;
        padding: 20px;
        animation: qmFadeIn 0.4s ease;
      }
      @keyframes qmFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .qm-gameover-icon {
        font-size: 90px;
        animation: qmBounce 0.6s ease;
      }
      @keyframes qmBounce {
        0% { transform: scale(0) rotate(-180deg); }
        60% { transform: scale(1.3) rotate(15deg); }
        100% { transform: scale(1) rotate(0); }
      }
      .qm-gameover-title {
        font-size: 30px;
        font-weight: 900;
        background: var(--gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .qm-gameover-score {
        font-size: 22px;
        font-weight: 800;
      }
    </style>

    <div class="qm-wrap">
      <div class="qm-header">
        <div class="qm-stat">
          <div class="qm-stat-label">النقاط</div>
          <div class="qm-stat-val" id="qmScore">0</div>
        </div>
        <div class="qm-stat">
          <div class="qm-stat-label">المستوى</div>
          <div class="qm-stat-val" id="qmLevel">1</div>
        </div>
        <div class="qm-stat">
          <div class="qm-stat-label">الأرقام</div>
          <div class="qm-stat-val" id="qmDigits">${cfg.start}</div>
        </div>
      </div>

      <div class="qm-phase" id="qmPhase">👀 استعد...</div>

      <div class="qm-display" id="qmDisplay"></div>

      <div class="qm-input-display" id="qmInputDisplay" style="display:none"></div>

      <div class="qm-keypad" id="qmKeypad" style="display:none">
        ${[1,2,3,4,5,6,7,8,9].map(n => `<button onclick="qmAddDigit(${n})">${n}</button>`).join('')}
        <button onclick="qmAddDigit(0)">0</button>
        <button class="del" onclick="qmDelete()">⌫</button>
        <button class="ok" onclick="qmSubmit()">✓</button>
      </div>

      <button class="reset" onclick="startGame('quickmemory', '${difficulty}')" style="margin-top:8px">🔄 إعادة</button>
    </div>
  `;

  // كيبورد
  document.onkeydown = (e) => {
    if (activeGame !== 'quickmemory') return;
    if (qmState.phase !== 'input') return;
    
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      qmAddDigit(parseInt(e.key));
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      qmDelete();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      qmSubmit();
    }
  };

  startQMRound();
}

function startQMRound() {
  const s = qmState;
  if (!s || s.gameOver) return;

  s.phase = 'show';
  s.locked = true;
  s.userInput = '';

  // توليد تسلسل جديد
  s.currentSequence = [];
  for (let i = 0; i < s.digits; i++) {
    s.currentSequence.push(Math.floor(Math.random() * 10));
  }

  // إظهار التسلسل
  const display = document.getElementById('qmDisplay');
  const phase = document.getElementById('qmPhase');
  const inputDisplay = document.getElementById('qmInputDisplay');
  const keypad = document.getElementById('qmKeypad');

  inputDisplay.style.display = 'none';
  keypad.style.display = 'none';
  display.style.display = 'flex';

  phase.textContent = '👀 ركّز في الأرقام...';
  phase.classList.remove('input');

  display.innerHTML = s.currentSequence.map(n => 
    `<div class="qm-number">${n}</div>`
  ).join('');

  // بعد فترة العرض → اخفي وابدأ الإدخال
  clearTimeout(s.timer);
  s.timer = setTimeout(() => {
    qmStartInput();
  }, s.showTime);
}

function qmStartInput() {
  const s = qmState;
  if (!s || s.gameOver) return;

  s.phase = 'input';
  s.locked = false;

  const display = document.getElementById('qmDisplay');
  const phase = document.getElementById('qmPhase');
  const inputDisplay = document.getElementById('qmInputDisplay');
  const keypad = document.getElementById('qmKeypad');

  display.innerHTML = s.currentSequence.map(() => 
    `<div class="qm-number hidden">?</div>`
  ).join('');

  phase.textContent = '✍️ اكتب الأرقام بنفس الترتيب';
  phase.classList.add('input');

  inputDisplay.style.display = 'flex';
  keypad.style.display = 'grid';

  qmRenderInput();
}

function qmRenderInput() {
  const s = qmState;
  if (!s) return;

  const inputDisplay = document.getElementById('qmInputDisplay');
  const boxes = [];

  for (let i = 0; i < s.digits; i++) {
    const digit = s.userInput[i] !== undefined ? s.userInput[i] : '';
    let cls = 'qm-input-box';
    if (digit !== '') cls += ' filled';
    if (i === s.userInput.length) cls += ' active';
    boxes.push(`<div class="${cls}">${digit}</div>`);
  }

  inputDisplay.innerHTML = boxes.join('');
}

function qmAddDigit(n) {
  const s = qmState;
  if (!s || s.locked || s.phase !== 'input') return;
  if (s.userInput.length >= s.digits) return;

  s.userInput += n;
  qmRenderInput();
}

function qmDelete() {
  const s = qmState;
  if (!s || s.locked || s.phase !== 'input') return;

  s.userInput = s.userInput.slice(0, -1);
  qmRenderInput();
}

function qmSubmit() {
  const s = qmState;
  if (!s || s.locked || s.phase !== 'input') return;
  if (s.userInput.length !== s.digits) {
    showToast('⚠️ اكتب كل الأرقام');
    return;
  }

  s.locked = true;
  const correct = s.userInput === s.currentSequence.join('');

  // عرض النتيجة
  const inputDisplay = document.getElementById('qmInputDisplay');
  const boxes = inputDisplay.querySelectorAll('.qm-input-box');

  boxes.forEach((box, i) => {
    box.classList.remove('active', 'filled');
    if (s.userInput[i] === String(s.currentSequence[i])) {
      box.classList.add('correct');
    } else {
      box.classList.add('wrong');
    }
  });

  const phase = document.getElementById('qmPhase');

  if (correct) {
    phase.textContent = '✅ صح! +' + (10 * s.digits) + ' نقطة';
    phase.classList.add('input');
    s.score += 10 * s.digits;
    document.getElementById('qmScore').textContent = s.score;
    document.getElementById('currentScore').textContent = s.score;

    // المستوى التالي
    setTimeout(() => {
      s.level++;
      if (s.digits < s.maxDigits) s.digits++;
      document.getElementById('qmLevel').textContent = s.level;
      document.getElementById('qmDigits').textContent = s.digits;
      startQMRound();
    }, 1500);

  } else {
    phase.textContent = '❌ غلط! التسلسل كان: ' + s.currentSequence.join(' ');
    phase.classList.remove('input');
    phase.style.background = 'rgba(255, 46, 99, 0.15)';
    phase.style.borderColor = 'rgba(255, 46, 99, 0.4)';
    phase.style.color = 'var(--danger)';

    setTimeout(() => {
      qmGameOver();
    }, 2000);
  }
}

function qmGameOver() {
  const s = qmState;
  if (!s) return;
  s.gameOver = true;
  s.locked = true;
  clearTimeout(s.timer);

  const overlay = document.createElement('div');
  overlay.className = 'qm-gameover';
  overlay.innerHTML = `
    <div class="qm-gameover-icon">🧠</div>
    <div class="qm-gameover-title">انتهت اللعبة!</div>
    <div class="qm-gameover-score">النقاط: ${s.score}</div>
    <div style="opacity: 0.8">وصلت للمستوى ${s.level}</div>
    <button class="reset" onclick="this.closest('.qm-gameover').remove(); startGame('quickmemory', '${s.difficulty}')">🔄 حاول تاني</button>
    <button class="reset" onclick="this.closest('.qm-gameover').remove(); backHome()" style="background: var(--gradient-2)">🏠 الرئيسية</button>
  `;
  document.body.appendChild(overlay);

  setTimeout(() => {
    endGame('quickmemory', s.difficulty, s.score);
  }, 2000);
}