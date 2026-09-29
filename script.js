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
  { id: 'movies', name: 'تخمين الأفلام', icon: '🎬' }
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

function clearTimers() {
  if (snakeTimer) { clearInterval(snakeTimer); snakeTimer = null; }
  if (mathTimer) { clearInterval(mathTimer); mathTimer = null; }
  if (whackTimer) { clearInterval(whackTimer); whackTimer = null; }
  if (whackUpTimer) { clearInterval(whackUpTimer); whackUpTimer = null; }
}

function startGame(id, difficulty) {
  clearTimers();
  activeGame = id;
  activeDifficulty = difficulty;

  document.getElementById('homeScreen').classList.remove('active');
  document.getElementById('gameScreen').classList.add('active');

  const game = GAMES.find(g => g.id === id);
  const diff = DIFFICULTIES.find(d => d.id === difficulty);
  document.getElementById('gameTitle').textContent = game.icon + ' ' + game.name + ' ' + diff.icon;
  document.getElementById('currentScore').textContent = '0';

  const area = document.getElementById('gameArea');
  area.innerHTML = '';

  const bestKey = id + '_' + difficulty;
  const best = state.scores[bestKey] || 0;

  switch (id) {
  case 'xo':     initXO(area, difficulty, best); break;
  case 'memory': initMemory(area, difficulty, best); break;
  case 'snake':  initSnake(area, difficulty, best); break;
  case 'math':   initMath(area, difficulty, best); break;
  case 'guess':  initGuess(area, difficulty, best); break;
  case 'rps':    initRPS(area, difficulty, best); break;
  case 'whack':  initWhack(area, difficulty, best); break;
  case 'quiz':   initQuiz(area, difficulty, best); break;
  case 'simon':  initSimon(area, difficulty, best); break;
  case 'movies': initMovies(area, difficulty, best); break;
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
  // كل ما الصعوبة تزيد، الـ AI يبقى أذكى
  // easy: مش بيلعب صح دايماً
  // medium: بيلعب صح 50%
  // hard: دايماً أحسن حركة
  // legendary: دايماً أحسن حركة + مش بيغلط

  let cells = Array(9).fill(null);
  let turn = 'X';
  let active = true;
  const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

  area.innerHTML = `
    <p class="best">🏆 أفضل: ${best}</p>
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

  function bestMove(player) {
    // minimax بسيط
    const opponent = player === 'O' ? 'X' : 'O';

    function minimax(c, isMax) {
      const w = (() => {
        for (const [a, b, cc] of wins) {
          if (c[a] && c[a] === c[b] && c[a] === c[cc]) return c[a];
        }
        if (c.every(x => x)) return 'D';
        return null;
      })();
      if (w === player) return 10;
      if (w === opponent) return -10;
      if (w === 'D') return 0;

      if (isMax) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
          if (!c[i]) { c[i] = player; best = Math.max(best, minimax(c, false)); c[i] = null; }
        }
        return best;
      } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
          if (!c[i]) { c[i] = opponent; best = Math.min(best, minimax(c, true)); c[i] = null; }
        }
        return best;
      }
    }

    let bestScore = -Infinity;
    let move = -1;
    for (let i = 0; i < 9; i++) {
      if (!cells[i]) {
        cells[i] = player;
        const s = minimax(cells, false);
        cells[i] = null;
        if (s > bestScore) { bestScore = s; move = i; }
      }
    }
    return move;
  }

  function randomMove() {
    const empty = cells.map((v, i) => v === null ? i : -1).filter(i => i >= 0);
    return empty[Math.floor(Math.random() * empty.length)];
  }

  function aiPlay() {
    if (!active || turn !== 'O') return;

    let move;
    const r = Math.random();
    if (difficulty === 'easy') {
      move = r < 0.6 ? randomMove() : bestMove('O');
    } else if (difficulty === 'medium') {
      move = r < 0.3 ? randomMove() : bestMove('O');
    } else {
      move = bestMove('O');
    }
    play(move);
  }

  function play(i) {
    if (cells[i] || !active) return;
    cells[i] = turn;
    const w = winner();

    if (w) {
      active = false;
      let score = 0;
      if (w === 'X') {
        const baseScores = { easy: 30, medium: 60, hard: 120, legendary: 250 };
        score = baseScores[difficulty] || 50;
        status.textContent = 'كسبت! 🎉';
      } else if (w === 'D') {
        score = 10;
        status.textContent = 'تعادل';
      } else {
        score = 0;
        status.textContent = 'خسرت 😅';
      }
      render();
      if (score > 0) {
        document.getElementById('currentScore').textContent = score;
        recordScore('xo', difficulty, score);
      }
      return;
    }

    turn = turn === 'X' ? 'O' : 'X';
    render();

    if (turn === 'O') {
      setTimeout(aiPlay, 450);
    }
  }

  document.getElementById('xoReset').onclick = () => {
    cells = Array(9).fill(null);
    turn = 'X';
    active = true;
    build();
  };

  build();
}

/* ===== 19. الذاكرة ===== */
function initMemory(area, difficulty, best) {
  // easy: 4 أزواج (3x3 مش هينفع، هتكون 4x2 = 8 cards)
  // medium: 6 أزواج (4x3 = 12)
  // hard: 8 أزواج (4x4 = 16)
  // legendary: 10 أزواج (5x4 = 20)
  const pairsMap = { easy: 4, medium: 6, hard: 8, legendary: 10 };
  const pairCount = pairsMap[difficulty] || 6;

  const allIcons = ['🍎','🍌','🍇','🍉','🍒','🍋','🍑','🥝','🍍','🥥'];
  const icons = allIcons.slice(0, pairCount);
  let cards, flipped, matched, lock;

  area.innerHTML = `
    <p class="best">🏆 أفضل: ${best}</p>
    <p class="status" id="memStatus">لاقي كل الأزواج</p>
    <div id="memBoard" style="grid-template-columns: repeat(${pairCount > 8 ? 5 : 4}, minmax(54px, 68px))"></div>
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
        document.getElementById('currentScore').textContent = matched * 20;
        if (matched === pairCount) {
          const baseScores = { easy: 80, medium: 150, hard: 280, legendary: 500 };
          endGame('memory', difficulty, baseScores[difficulty] || 100);
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

/* ===== 20. الأفعى ===== */
function initSnake(area, difficulty, best) {
  const speeds = { easy: 250, medium: 180, hard: 130, legendary: 90 };
  const baseSpeed = speeds[difficulty] || 180;

  const size = 12, cols = 20, rows = 20;

  area.innerHTML = `
    <p class="best">🏆 أفضل: ${best}</p>
    <p class="status" id="snakeStatus">النقاط: 0</p>
    <canvas id="snakeCanvas" width="240" height="240"></canvas>
    <div class="snake-controls">
      <span></span><button id="snUp">↑</button><span></span>
      <button id="snLeft">←</button><button id="snDown">↓</button><button id="snRight">→</button>
    </div>
    <button class="reset" id="snakeReset" style="margin-top:14px">🔄 ابدأ من جديد</button>
  `;

  const canvas = document.getElementById('snakeCanvas');
  const ctx = canvas.getContext('2d');
  const status = document.getElementById('snakeStatus');
  let snake, dir, food, score, gameOver, speed;

  function reset() {
    snake = [{ x: 10, y: 10 }];
    dir = { x: 1, y: 0 };
    score = 0;
    speed = baseSpeed;
    gameOver = false;
    placeFood();
    status.textContent = 'النقاط: 0';
    document.getElementById('currentScore').textContent = '0';
    clearInterval(snakeTimer);
    snakeTimer = setInterval(tick, speed);
    draw();
  }

  function placeFood() {
    let f;
    do {
      f = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
    } while (snake.some(s => s.x === f.x && s.y === f.y));
    food = f;
  }

  function tick() {
    if (gameOver) return;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.y < 0 || head.x >= cols || head.y >= rows ||
        snake.some(s => s.x === head.x && s.y === head.y)) {
      gameOver = true;
      clearInterval(snakeTimer);
      endGame('snake', difficulty, score);
      return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      placeFood();
      // يسرّع اللعبة تدريجياً
      if (score % 50 === 0 && speed > 70) {
        speed -= 10;
        clearInterval(snakeTimer);
        snakeTimer = setInterval(tick, speed);
      }
      status.textContent = 'النقاط: ' + score;
      document.getElementById('currentScore').textContent = score;
    } else snake.pop();
    draw();
  }

  function draw() {
    const css = getComputedStyle(document.documentElement);
    ctx.fillStyle = css.getPropertyValue('--bg-2').trim() || '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 10;
    ctx.shadowColor = css.getPropertyValue('--accent').trim() || '#00f5ff';
    ctx.fillStyle = css.getPropertyValue('--accent').trim() || '#00f5ff';
    ctx.fillRect(food.x * size, food.y * size, size - 1, size - 1);
    ctx.shadowColor = css.getPropertyValue('--success').trim() || '#00ff88';
    ctx.fillStyle = css.getPropertyValue('--success').trim() || '#00ff88';
    snake.forEach((s, i) => {
      ctx.globalAlpha = i === 0 ? 1 : 0.8;
      ctx.fillRect(s.x * size, s.y * size, size - 1, size - 1);
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  function setDir(x, y) {
    if (dir.x === -x && dir.y === -y) return;
    if (dir.x === x && dir.y === y) return;
    dir = { x, y };
  }

  document.getElementById('snUp').onclick = () => setDir(0, -1);
  document.getElementById('snDown').onclick = () => setDir(0, 1);
  document.getElementById('snLeft').onclick = () => setDir(-1, 0);
  document.getElementById('snRight').onclick = () => setDir(1, 0);
  document.getElementById('snakeReset').onclick = reset;

  document.onkeydown = (e) => {
    if (activeGame !== 'snake') return;
    if (e.key === 'ArrowUp') setDir(0, -1);
    if (e.key === 'ArrowDown') setDir(0, 1);
    if (e.key === 'ArrowLeft') setDir(-1, 0);
    if (e.key === 'ArrowRight') setDir(1, 0);
  };

  reset();
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