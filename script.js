/* ============================================
   DULA Pro - Main Script v2.0
   كل حاجة: اسم اللاعب + المتجر + الثيمات + الألعاب
   ============================================ */

/* ====== 1. البيانات الأساسية ====== */
const STORAGE_KEY = 'dulaPro_v2';

const defaultState = {
  playerName: '',
  xp: 0,
  coins: 50,
  streak: 0,
  lastDay: '',
  lastDailyClaim: '',
  scores: {},
  plays: {},
  ownedThemes: ['gaming'],
  ownedAvatars: ['default'],
  currentTheme: 'gaming',
  currentAvatar: 'default'
};

let state = { ...defaultState };

/* ====== 2. تحميل وحفظ البيانات ====== */
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

/* ====== 3. الثيمات ====== */
const THEMES = [
  { id: 'gaming',  name: 'Gaming',  icon: '🎮', price: 0,    tag: 'مجاني',   desc: 'الثيم الافتراضي' },
  { id: 'ocean',   name: 'Ocean',   icon: '🌊', price: 100,  tag: 'مبتدئ',   desc: 'أزرق هادئ' },
  { id: 'fire',    name: 'Fire',    icon: '🔥', price: 300,  tag: 'متوسط',   desc: 'نار برتقالية' },
  { id: 'galaxy',  name: 'Galaxy',  icon: '🌌', price: 800,  tag: 'متقدم',   desc: 'فضاء بنفسجي' },
  { id: 'diamond', name: 'Diamond', icon: '💎', price: 2000, tag: 'نادر',    desc: 'ألماس أزرق' },
  { id: 'royal',   name: 'Royal',   icon: '👑', price: 5000, tag: 'أسطوري',  desc: 'ملكي ذهبي' }
];

const AVATARS = [
  { id: 'default', name: 'افتراضي', icon: '🎮', price: 0 },
  { id: 'cat',     name: 'قطة',      icon: '🐱', price: 50 },
  { id: 'lion',    name: 'أسد',      icon: '🦁', price: 150 },
  { id: 'robot',   name: 'روبوت',    icon: '🤖', price: 250 },
  { id: 'dragon',  name: 'تنين',     icon: '🐉', price: 500 },
  { id: 'wizard',  name: 'ساحر',     icon: '🧙', price: 800 },
  { id: 'ninja',   name: 'نينجا',    icon: '🥷', price: 1200 },
  { id: 'crown',   name: 'تاج',      icon: '👑', price: 2500 }
];

/* ====== 4. قائمة الألعاب ====== */
const GAMES = [
  { id: 'xo',        name: 'إكس أوه',       icon: '❌' },
  { id: 'rps',       name: 'حجر ورقة مقص',  icon: '✊' },
  { id: 'guess',     name: 'خمن الرقم',     icon: '🔢' },
  { id: 'memory',    name: 'الذاكرة',       icon: '🧠' },
  { id: 'snake',     name: 'أفعى',          icon: '🐍' },
  { id: 'whack',     name: 'اضرب الخلد',    icon: '🔨' },
  { id: 'quiz',      name: 'سؤال وجواب',    icon: '❓' },
  { id: 'simon',     name: 'ذاكر الألوان',  icon: '🎨' },
  { id: 'math',      name: 'سباق الحساب',   icon: '➕' },
  { id: 'react',     name: 'سرعة البديهة',  icon: '⚡' },
  { id: 'ucl',       name: 'دوري الأبطال',  icon: '🏆' },
  { id: 'epl',       name: 'الدوري الإنجليزي', icon: '⚽' },
  { id: 'wc',        name: 'كأس العالم',    icon: '🌍' },
  { id: 'player',    name: 'حياة لاعب',     icon: '🌟' },
  { id: 'about',     name: 'عن الموقع',     icon: 'ℹ️' }
];

/* ====== 5. المستوى والخبرة ====== */
function getLevel() { return Math.floor(state.xp / 100) + 1; }
function getXPInLevel() { return state.xp % 100; }

/* ====== 6. إضافة مكافآت ====== */
function addReward(xp, coins) {
  state.xp += xp;
  state.coins += coins;
  saveState();
  renderAll();
}

/* ====== 7. تسجيل نتيجة لعبة ====== */
function recordScore(gameId, score) {
  const isNewBest = !state.scores[gameId] || score > state.scores[gameId];
  if (isNewBest) state.scores[gameId] = score;
  state.plays[gameId] = (state.plays[gameId] || 0) + 1;

  const xp = Math.max(5, Math.floor(score / 5));
  const coins = Math.max(1, Math.floor(score / 10));

  state.xp += xp;
  state.coins += coins;
  saveState();
  renderAll();

  return { isNewBest, xp, coins, best: state.scores[gameId] };
}

/* ====== 8. عرض الواجهة ====== */
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
  set('qsGamesPlayed', totalPlays);
  set('qsBestScore', bestScore);
  set('qsThemes', state.ownedThemes.length);
}

function renderLeaderboard() {
  const list = document.getElementById('leaderboardList');
  if (!list) return;

  const entries = Object.entries(state.scores)
    .map(([id, score]) => {
      const g = GAMES.find(x => x.id === id);
      return { name: g ? g.name : id, icon: g ? g.icon : '🎮', score };
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
      <span class="lb-name">${e.icon} ${e.name}</span>
      <span class="lb-score">${e.score}</span>
    </li>
  `).join('');
}

function renderGames() {
  const grid = document.getElementById('gamesGrid');
  if (!grid) return;

  grid.innerHTML = GAMES.map(g => `
    <div class="game-card" data-name="${g.name}" onclick="startGame('${g.id}')">
      <span class="gc-icon">${g.icon}</span>
      <div class="gc-name">${g.name}</div>
      <div class="gc-best">🏆 ${state.scores[g.id] || 0}</div>
      <div class="gc-plays">🎯 ${state.plays[g.id] || 0} مرة</div>
    </div>
  `).join('');
}

function filterGames(q) {
  q = (q || '').trim().toLowerCase();
  document.querySelectorAll('.game-card').forEach(card => {
    const name = (card.dataset.name || '').toLowerCase();
    card.style.display = (!q || name.includes(q)) ? '' : 'none';
  });
}

/* ====== 9. المتجر ====== */
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
        <button class="si-price" ${owned ? (active ? 'disabled' : '') : ''} onclick="buyTheme('${t.id}')">
          ${owned ? (active ? '✅ مفعّل' : 'استخدام') : t.price + ' 🪙'}
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
        <button class="si-price" ${owned ? (active ? 'disabled' : '') : ''} onclick="buyAvatar('${a.id}')">
          ${owned ? (active ? '✅ مفعّل' : 'استخدام') : a.price + ' 🪙'}
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
    showToast('❌ محتاج ' + theme.price + ' 🪙 — ناقص ' + (theme.price - state.coins));
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
    showToast('❌ محتاج ' + avatar.price + ' 🪙');
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

/* ====== 10. الهدية اليومية ====== */
function claimDaily() {
  const today = new Date().toDateString();
  if (state.lastDailyClaim === today) {
    showToast('🎁 خدت هدية النهاردة! ارجع بكرة');
    return;
  }
  state.lastDailyClaim = today;

  const bonus = 50 + state.streak * 10;
  const xpBonus = 20 + state.streak * 5;
  state.coins += bonus;
  state.xp += xpBonus;
  saveState();
  renderAll();

  document.getElementById('rewardText').textContent = '+' + bonus + ' 🪙 و +' + xpBonus + ' XP';
  document.getElementById('rewardModal').classList.add('active');
}

function closeReward() {
  document.getElementById('rewardModal').classList.remove('active');
}

/* ====== 11. Streak ====== */
function checkStreak() {
  const today = new Date().toDateString();
  if (state.lastDay === today) return;

  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (state.lastDay === yesterday) state.streak++;
  else state.streak = 1;

  state.lastDay = today;
  saveState();
}

/* ====== 12. Toast ====== */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ====== 13. أدوات ====== */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ====== 14. التنقل بين الشاشات ====== */
let activeGame = null;
let snakeTimer = null;
let whackTimer = null;
let whackUpTimer = null;
let mathTimer = null;
let reactTimeout = null;

function clearTimers() {
  if (snakeTimer) clearInterval(snakeTimer);
  if (whackTimer) clearInterval(whackTimer);
  if (whackUpTimer) clearInterval(whackUpTimer);
  if (mathTimer) clearInterval(mathTimer);
  if (reactTimeout) clearTimeout(reactTimeout);
  snakeTimer = whackTimer = whackUpTimer = mathTimer = reactTimeout = null;
}

function startGame(id) {
  if (id === 'about') {
    document.getElementById('homeScreen').classList.remove('active');
    document.getElementById('gameScreen').classList.add('active');
    document.getElementById('gameTitle').textContent = 'ℹ️ عن الموقع';
    document.getElementById('currentScore').textContent = '—';
    document.getElementById('gameArea').innerHTML = `
      <div style="text-align:right;padding:20px;line-height:1.9">
        <p style="text-align:center;font-size:50px;margin:0">🎮</p>
        <h3 style="text-align:center;margin:12px 0">DULA Pro</h3>
        <p style="color:var(--ink-soft)">موقع ألعاب احترافي فيه ${GAMES.length} لعبة مختلفة.</p>
        <p style="color:var(--ink-soft)">🎯 اجمع الكوينز من الألعاب وافتح ثيمات فخمة!</p>
        <p style="color:var(--ink-soft)">🎨 ${THEMES.length} ثيمات مختلفة بأسعار متدرجة</p>
        <p style="color:var(--ink-soft)">👤 ${AVATARS.length} أفاتار مميز</p>
        <p style="color:var(--ink-soft);text-align:center;margin-top:20px;opacity:0.6">© DULA Pro 2025</p>
      </div>
    `;
    return;
  }

  document.getElementById('homeScreen').classList.remove('active');
  document.getElementById('gameScreen').classList.add('active');
  const game = GAMES.find(g => g.id === id);
  document.getElementById('gameTitle').textContent = game.icon + ' ' + game.name;
  document.getElementById('currentScore').textContent = '0';
  const area = document.getElementById('gameArea');
  area.innerHTML = '';
  activeGame = id;
  clearTimers();

  switch (id) {
    case 'xo': initXO(area); break;
    case 'rps': initRPS(area); break;
    case 'guess': initGuess(area); break;
    case 'memory': initMemory(area); break;
    case 'snake': initSnake(area); break;
    case 'whack': initWhack(area); break;
    case 'quiz': initQuiz(area, quizQuestions, 'quiz'); break;
    case 'simon': initSimon(area); break;
    case 'math': initMath(area); break;
    case 'react': initReact(area); break;
    case 'ucl': initQuiz(area, uclQuestions, 'ucl'); break;
    case 'epl': initQuiz(area, eplQuestions, 'epl'); break;
    case 'wc': initQuiz(area, wcQuestions, 'wc'); break;
    case 'player': initQuiz(area, playerQuestions, 'player'); break;
  }
}

function backHome() {
  clearTimers();
  document.getElementById('homeScreen').classList.add('active');
  document.getElementById('gameScreen').classList.remove('active');
  activeGame = null;
  renderAll();
}

function endGame(id, score) {
  const result = recordScore(id, score);
  const area = document.getElementById('gameArea');

  area.innerHTML = `
    <div style="text-align:center;padding:30px 10px">
      <h2 style="font-size:1.8rem;color:var(--accent);margin-bottom:14px">🎉 انتهت اللعبة!</h2>
      <div style="font-size:2rem;font-weight:900;margin:14px 0">سكورك: ${score}</div>
      ${result.isNewBest ? '<div style="color:var(--success);font-weight:800;margin-bottom:10px">🏆 رقم قياسي جديد!</div>' : ''}
      <div style="margin:12px 0;font-size:1.05rem">💰 +${result.coins} كوين &nbsp; ⭐ +${result.xp} XP</div>
      <div style="color:var(--muted);margin-bottom:16px">أفضل نتيجة: ${result.best}</div>
      <button class="reset" onclick="startGame('${id}')">🔄 العب تاني</button>
      <button class="reset" onclick="backHome()" style="background:var(--gradient-2)">🏠 الرئيسية</button>
    </div>
  `;
}

/* ====== 15. لعبة X-O ====== */
function initXO(area) {
  let cells = Array(9).fill(null);
  let turn = 'X';
  let active = true;
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  area.innerHTML = `
    <div id="xoBoard"></div>
    <p class="status" id="xoStatus"></p>
    <button class="reset" id="xoReset">جولة جديدة</button>
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
    for (const [a, b, c] of wins) {
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
      if (w === 'D') {
        status.textContent = 'تعادل!';
        recordScore('xo', 20);
      } else {
        status.textContent = 'فاز اللاعب ' + w + ' 🎉';
        recordScore('xo', 100);
      }
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

/* ====== 16. حجر ورقة مقص ====== */
function initRPS(area) {
  const opts = ['✊', '✋', '✌️'];
  const beats = { '✊': '✌️', '✋': '✊', '✌️': '✋' };
  let wins = 0;

  area.innerHTML = `
    <p class="status">اختار سلاحك!</p>
    <div class="rps-choices">
      <button data-c="✊">✊</button>
      <button data-c="✋">✋</button>
      <button data-c="✌️">✌️</button>
    </div>
    <div class="rps-result" id="rpsResult"></div>
    <p class="status" id="rpsStatus"></p>
  `;

  const resEl = document.getElementById('rpsResult');
  const statEl = document.getElementById('rpsStatus');

  area.querySelectorAll('.rps-choices button').forEach(btn => {
    btn.onclick = () => {
      const me = btn.dataset.c;
      const cpu = opts[Math.floor(Math.random() * 3)];
      resEl.textContent = me + '  مقابل  ' + cpu;

      if (me === cpu) statEl.textContent = 'تعادل!';
      else if (beats[me] === cpu) {
        wins++;
        statEl.textContent = 'كسبت! 🎉 (' + wins + ' فوز)';
        document.getElementById('currentScore').textContent = wins * 30;
        if (wins % 3 === 0) recordScore('rps', wins * 30);
      } else {
        statEl.textContent = 'خسرت 😅';
      }
    };
  });
}

/* ====== 17. خمن الرقم ====== */
function initGuess(area) {
  let target = Math.ceil(Math.random() * 50);
  let tries = 0;

  area.innerHTML = `
    <p class="status">فكرت في رقم من 1 لـ 50</p>
    <div class="guess-input-wrap">
      <input type="number" id="guessInput" min="1" max="50" placeholder="؟">
      <button id="guessGo">جرّب</button>
    </div>
    <p class="status" id="guessStatus"></p>
    <button class="reset" id="guessReset">لعبة جديدة</button>
  `;

  const input = document.getElementById('guessInput');
  const status = document.getElementById('guessStatus');

  document.getElementById('guessGo').onclick = () => {
    const v = Number(input.value);
    if (!v) return;
    tries++;
    if (v === target) {
      status.textContent = 'صح! الرقم كان ' + target + ' 🎉';
      const score = Math.max(20, 200 - tries * 20);
      document.getElementById('currentScore').textContent = score;
      recordScore('guess', score);
    } else {
      status.textContent = v < target ? 'أكبر من كده ⬆️' : 'أصغر من كده ⬇️';
    }
    input.value = '';
    input.focus();
  };

  document.getElementById('guessReset').onclick = () => {
    target = Math.ceil(Math.random() * 50);
    tries = 0;
    input.value = '';
    status.textContent = '';
  };
}

/* ====== 18. لعبة الذاكرة ====== */
function initMemory(area) {
  const icons = ['🍎','🍌','🍇','🍉','🍒','🍋','🍑','🥝'];
  let cards, flipped, matched, lock;

  area.innerHTML = `
    <p class="status" id="memStatus">لاقي كل الأزواج</p>
    <div id="memBoard"></div>
    <button class="reset" id="memReset">لعبة جديدة</button>
  `;

  const board = document.getElementById('memBoard');
  const status = document.getElementById('memStatus');

  function build() {
    cards = shuffle([...icons, ...icons]);
    flipped = [];
    matched = 0;
    lock = false;
    status.textContent = 'لاقي كل الأزواج';
    board.innerHTML = '';
    cards.forEach((icon, i) => {
      const c = document.createElement('div');
      c.className = 'mcard';
      c.onclick = () => flip(i, c);
      board.appendChild(c);
    });
  }

  function flip(i, el) {
    if (lock || el.classList.contains('flipped') || el.classList.contains('matched')) return;
    el.textContent = cards[i];
    el.classList.add('flipped');
    flipped.push({ i, el });

    if (flipped.length === 2) {
      lock = true;
      const [a, b] = flipped;
      if (cards[a.i] === cards[b.i]) {
        a.el.classList.add('matched');
        b.el.classList.add('matched');
        matched++;
        flipped = [];
        lock = false;
        document.getElementById('currentScore').textContent = matched * 50;
        if (matched === icons.length) {
          endGame('memory', Math.max(200, 800 - matched * 20));
        }
      } else {
        setTimeout(() => {
          a.el.textContent = '';
          b.el.textContent = '';
          a.el.classList.remove('flipped');
          b.el.classList.remove('flipped');
          flipped = [];
          lock = false;
        }, 700);
      }
    }
  }

  document.getElementById('memReset').onclick = build;
  build();
}

/* ====== 19. لعبة الأفعى ====== */
function initSnake(area) {
  const size = 12, cols = 20, rows = 20;

  area.innerHTML = `
    <p class="status" id="snakeStatus">النقاط: 0</p>
    <p class="best" id="snakeBest">أفضل: ${state.scores.snake || 0}</p>
    <canvas id="snakeCanvas" width="240" height="240"></canvas>
    <div class="snake-controls">
      <span></span><button id="snUp">↑</button><span></span>
      <button id="snLeft">←</button><button id="snDown">↓</button><button id="snRight">→</button>
    </div>
  `;

  const canvas = document.getElementById('snakeCanvas');
  const ctx = canvas.getContext('2d');
  const status = document.getElementById('snakeStatus');
  let snake, dir, food, score, gameOver;

  function reset() {
    snake = [{ x: 10, y: 10 }];
    dir = { x: 1, y: 0 };
    score = 0;
    gameOver = false;
    placeFood();
    status.textContent = 'النقاط: 0';
    document.getElementById('currentScore').textContent = '0';
    draw();
  }

  function placeFood() {
    food = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
  }

  function tick() {
    if (gameOver) return;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows ||
        snake.some(s => s.x === head.x && s.y === head.y)) {
      gameOver = true;
      clearInterval(snakeTimer);
      snakeTimer = null;
      endGame('snake', score);
      return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      placeFood();
      status.textContent = 'النقاط: ' + score;
      document.getElementById('currentScore').textContent = score;
    } else snake.pop();
    draw();
  }

  function draw() {
    const css = getComputedStyle(document.documentElement);
    ctx.fillStyle = css.getPropertyValue('--bg2').trim() || '#1a1f3a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = css.getPropertyValue('--accent').trim() || '#00f5ff';
    ctx.fillRect(food.x * size, food.y * size, size - 1, size - 1);
    ctx.fillStyle = css.getPropertyValue('--success').trim() || '#00ff88';
    snake.forEach(s => ctx.fillRect(s.x * size, s.y * size, size - 1, size - 1));
  }

  function setDir(x, y) {
    if (dir.x === -x && dir.y === -y) return;
    dir = { x, y };
  }

  document.getElementById('snUp').onclick = () => setDir(0, -1);
  document.getElementById('snDown').onclick = () => setDir(0, 1);
  document.getElementById('snLeft').onclick = () => setDir(-1, 0);
  document.getElementById('snRight').onclick = () => setDir(1, 0);

  document.onkeydown = (e) => {
    if (activeGame !== 'snake') return;
    if (e.key === 'ArrowUp') setDir(0, -1);
    if (e.key === 'ArrowDown') setDir(0, 1);
    if (e.key === 'ArrowLeft') setDir(-1, 0);
    if (e.key === 'ArrowRight') setDir(1, 0);
  };

  reset();
  snakeTimer = setInterval(tick, 170);
}

/* ====== 20. اضرب الخلد ====== */
function initWhack(area) {
  let score = 0, timeLeft = 30, holes = [], running = false;

  area.innerHTML = `
    <p class="status" id="whackStatus">النقاط: 0 — الوقت: 30</p>
    <p class="best" id="whackBest">أفضل: ${state.scores.whack || 0}</p>
    <div id="whackBoard"></div>
    <button class="reset" id="whackReset">ابدأ</button>
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
    holes.forEach(h => { h.classList.remove('up'); h.textContent = ''; });
    const i = Math.floor(Math.random() * 9);
    holes[i].classList.add('up');
    holes[i].textContent = '🐹';
  }

  document.getElementById('whackReset').onclick = () => {
    clearInterval(whackTimer);
    clearInterval(whackUpTimer);
    build();
    score = 0; timeLeft = 30; running = true;
    status.textContent = 'النقاط: 0 — الوقت: 30';
    document.getElementById('currentScore').textContent = '0';
    whackUpTimer = setInterval(popRandom, 700);
    whackTimer = setInterval(() => {
      timeLeft--;
      status.textContent = 'النقاط: ' + score + ' — الوقت: ' + timeLeft;
      if (timeLeft <= 0) {
        clearInterval(whackTimer);
        clearInterval(whackUpTimer);
        running = false;
        endGame('whack', score);
      }
    }, 1000);
  };

  build();
}

/* ====== 21. أسئلة ====== */
const quizQuestions = [
  { q: 'ما عاصمة مصر؟', opts: ['القاهرة', 'الإسكندرية', 'أسوان'], a: 0 },
  { q: 'أكبر كوكب في المجموعة الشمسية؟', opts: ['الأرض', 'المشتري', 'زحل'], a: 1 },
  { q: 'كم قارة في العالم؟', opts: ['5', '6', '7'], a: 2 },
  { q: 'أسرع حيوان بري؟', opts: ['الفهد', 'الأسد', 'الحصان'], a: 0 },
  { q: 'أطول نهر في العالم؟', opts: ['الأمازون', 'النيل', 'الفرات'], a: 1 },
  { q: 'أكبر محيط في العالم؟', opts: ['الأطلسي', 'الهادي', 'الهندي'], a: 1 },
  { q: 'أعلى جبل في العالم؟', opts: ['إفرست', 'كليمنجارو', 'الألب'], a: 0 },
  { q: 'أول رائد فضاء وصل للقمر؟', opts: ['جاجارين', 'أرمسترونج', 'ألدرين'], a: 1 }
];

const uclQuestions = [
  { q: 'الأكتر تتويجًا بدوري أبطال أوروبا؟', opts: ['ميلان', 'ريال مدريد', 'بايرن'], a: 1 },
  { q: 'ملعب "أنفيلد" ملعب أي فريق؟', opts: ['إيفرتون', 'ليفربول', 'مان يونايتد'], a: 1 },
  { q: 'ملعب "سانتياجو برنابيو"؟', opts: ['برشلونة', 'أتلتيكو', 'ريال مدريد'], a: 2 },
  { q: 'أكتر لاعب أهداف في دوري الأبطال؟', opts: ['ميسي', 'ليفاندوفسكي', 'رونالدو'], a: 2 },
  { q: 'يوفنتوس من أي مدينة؟', opts: ['ميلانو', 'روما', 'تورينو'], a: 2 },
  { q: 'أول نسخة من دوري الأبطال كانت في؟', opts: ['الأربعينات', 'الخمسينات', 'الستينات'], a: 1 }
];

const eplQuestions = [
  { q: 'الأكتر تتويجًا بالدوري الإنجليزي؟', opts: ['مان سيتي', 'مان يونايتد', 'ليفربول'], a: 1 },
  { q: 'ملعب "أولد ترافورد"؟', opts: ['مان سيتي', 'مان يونايتد', 'ليدز'], a: 1 },
  { q: 'ملعب "الإمارات"؟', opts: ['تشيلسي', 'توتنهام', 'أرسنال'], a: 2 },
  { q: 'نادي أرسنال بيتلقب بـ؟', opts: ['المدفعجية', 'الشياطين', 'السباع'], a: 0 },
  { q: 'نادي تشيلسي بيتلقب بـ؟', opts: ['البلوز', 'الريدز', 'الجانرز'], a: 0 },
  { q: 'الدوري الإنجليزي بشكله الحالي بدأ سنة؟', opts: ['1988', '1992', '1998'], a: 1 }
];

const playerQuestions = [
  { q: 'محمد صلاح بيلعب في أي مركز؟', opts: ['حارس', 'جناح/مهاجم', 'مدافع'], a: 1 },
  { q: 'محمد صلاح من مواليد أي محافظة؟', opts: ['الغربية', 'الإسكندرية', 'الجيزة'], a: 0 },
  { q: 'محمد صلاح بيلعب حاليًا لأي نادي؟', opts: ['تشيلسي', 'ليفربول', 'مان سيتي'], a: 1 },
  { q: 'محمد صلاح لعب في إيطاليا لنادي؟', opts: ['يوفنتوس', 'روما', 'إنتر'], a: 1 },
  { q: 'رقم قميص محمد صلاح؟', opts: ['7', '9', '11'], a: 2 }
];

const wcQuestions = [
  { q: 'الأكتر تتويجًا بكأس العالم؟', opts: ['ألمانيا', 'البرازيل', 'الأرجنتين'], a: 1 },
  { q: 'كأس العالم بيتقام كل؟', opts: ['سنتين', '3 سنين', '4 سنين'], a: 2 },
  { q: 'أول دولة استضافت كأس العالم؟', opts: ['البرازيل', 'الأوروغواي', 'إيطاليا'], a: 1 },
  { q: 'كأس العالم 2022 في أي دولة؟', opts: ['قطر', 'الإمارات', 'السعودية'], a: 0 },
  { q: 'كأس العالم 2026 هيشارك فيه كام منتخب؟', opts: ['32', '40', '48'], a: 2 }
];

function initQuiz(area, questions, gameId) {
  let idx = 0, score = 0;
  const totalQ = Math.min(8, questions.length);
  const shuffled = shuffle(questions.slice()).slice(0, totalQ);

  area.innerHTML = `
    <p class="status" id="quizScore"></p>
    <p class="best" id="quizBest">أفضل: ${state.scores[gameId] || 0}</p>
    <p class="quiz-q" id="quizQ"></p>
    <div class="quiz-opts" id="quizOpts"></div>
  `;

  const qEl = document.getElementById('quizQ');
  const optsEl = document.getElementById('quizOpts');
  const scoreEl = document.getElementById('quizScore');

  function render() {
    if (idx >= totalQ) {
      endGame(gameId, score * 20);
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

/* ====== 22. سيمون ====== */
function initSimon(area) {
  area.innerHTML = `
    <p class="status" id="simonStatus">دوس ابدأ وذاكر الترتيب</p>
    <p class="best" id="simonBest">أفضل: ${state.scores.simon || 0}</p>
    <div id="simonBoard">
      <button class="simon-btn" id="simon0"></button>
      <button class="simon-btn" id="simon1"></button>
      <button class="simon-btn" id="simon2"></button>
      <button class="simon-btn" id="simon3"></button>
    </div>
    <button class="reset" id="simonReset">ابدأ</button>
  `;

  const btns = [0,1,2,3].map(i => document.getElementById('simon' + i));
  const status = document.getElementById('simonStatus');
  let sequence = [], userStep = 0, playing = false;

  function flash(i) {
    return new Promise(res => {
      btns[i].classList.add('lit');
      setTimeout(() => { btns[i].classList.remove('lit'); res(); }, 420);
    });
  }

  async function playSequence() {
    playing = false;
    status.textContent = 'بص واذكر...';
    await new Promise(r => setTimeout(r, 500));
    for (const i of sequence) {
      await flash(i);
      await new Promise(r => setTimeout(r, 200));
    }
    playing = true;
    userStep = 0;
    status.textContent = 'دورك! (طول السلسلة: ' + sequence.length + ')';
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
          status.textContent = 'صح! هنزود واحدة 🎉';
          document.getElementById('currentScore').textContent = sequence.length * 10;
          setTimeout(nextRound, 700);
        }
      } else {
        playing = false;
        endGame('simon', sequence.length * 10);
        sequence = [];
      }
    };
  });

  document.getElementById('simonReset').onclick = () => {
    sequence = [];
    nextRound();
  };
}

/* ====== 23. سباق الحساب ====== */
function initMath(area) {
  let score = 0, timeLeft = 30, answer = 0, running = false;

  area.innerHTML = `
    <p class="status" id="mathStatus">النقاط: 0 — الوقت: 30</p>
    <p class="best" id="mathBest">أفضل: ${state.scores.math || 0}</p>
    <p class="math-eq" id="mathEq"></p>
    <div class="math-opts" id="mathOpts"></div>
    <button class="reset" id="mathReset">ابدأ</button>
  `;

  const eqEl = document.getElementById('mathEq');
  const optsEl = document.getElementById('mathOpts');
  const status = document.getElementById('mathStatus');

  function newEq() {
    const a = Math.ceil(Math.random() * 20);
    const b = Math.ceil(Math.random() * 20);
    const ops = ['+', '-'];
    const op = ops[Math.floor(Math.random() * 2)];
    answer = op === '+' ? a + b : a - b;
    eqEl.textContent = a + ' ' + op + ' ' + b + ' = ؟';
    const opts = new Set([answer]);
    while (opts.size < 3) opts.add(answer + Math.floor(Math.random() * 9) - 4);
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
        }
        newEq();
      };
      optsEl.appendChild(b2);
    });
  }

  document.getElementById('mathReset').onclick = () => {
    clearInterval(mathTimer);
    score = 0; timeLeft = 30; running = true;
    status.textContent = 'النقاط: 0 — الوقت: 30';
    document.getElementById('currentScore').textContent = '0';
    newEq();
    mathTimer = setInterval(() => {
      timeLeft--;
      status.textContent = 'النقاط: ' + score + ' — الوقت: ' + timeLeft;
      if (timeLeft <= 0) {
        clearInterval(mathTimer);
        running = false;
        endGame('math', score);
      }
    }, 1000);
  };

  eqEl.textContent = 'دوس ابدأ';
}

/* ====== 24. سرعة البديهة ====== */
function initReact(area) {
  let waitingGo = false, startTime = 0;

  area.innerHTML = `
    <p class="status" id="reactStatus">دوس ابدأ واستنى اللون</p>
    <p class="best" id="reactBest">أفضل: ${state.scores.react ? state.scores.react + ' مللي' : '—'}</p>
    <div id="reactBox">استنى...</div>
    <button class="reset" id="reactReset">ابدأ</button>
  `;

  const box = document.getElementById('reactBox');
  const status = document.getElementById('reactStatus');

  document.getElementById('reactReset').onclick = () => {
    clearTimeout(reactTimeout);
    box.classList.remove('go');
    box.textContent = 'استنى...';
    waitingGo = false;
    status.textContent = 'استنى اللون يتغير...';
    reactTimeout = setTimeout(() => {
      box.classList.add('go');
      box.textContent = 'دوس دلوقتي!';
      waitingGo = true;
      startTime = Date.now();
    }, 800 + Math.random() * 2000);
  };

  box.onclick = () => {
    if (waitingGo) {
      const ms = Date.now() - startTime;
      const score = Math.max(10, 1000 - ms);
      document.getElementById('currentScore').textContent = ms + 'ms';
      recordScore('react', score);
      status.textContent = 'وقتك: ' + ms + ' مللي ثانية ⚡';
      waitingGo = false;
      box.classList.remove('go');
      box.textContent = 'دوس ابدأ تاني';
    } else if (box.textContent === 'استنى...') {
      status.textContent = 'بدري! استنى اللون يتغير';
    }
  };
}

/* ====== 25. التشغيل ====== */
window.addEventListener('DOMContentLoaded', () => {
  loadState();
  checkStreak();
  applyTheme(state.currentTheme);

  // إخفاء شاشة البداية بعد ثانيتين
  setTimeout(() => {
    document.getElementById('splash').classList.add('hide');
    setTimeout(() => {
      if (!state.playerName) {
        document.getElementById('nameScreen').classList.add('active');
      } else {
        document.getElementById('app').classList.add('active');
        renderAll();
      }
    }, 400);
  }, 2000);

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

  // إغلاق المودالات بالضغط برا
  document.getElementById('shopModal').addEventListener('click', (e) => {
    if (e.target.id === 'shopModal') closeShop();
  });
  document.getElementById('rewardModal').addEventListener('click', (e) => {
    if (e.target.id === 'rewardModal') closeReward();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeShop();
      closeReward();
    }
  });
});