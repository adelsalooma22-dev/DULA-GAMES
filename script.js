/* ============================================
   DULA Games - Main Script
   ============================================ */

/* ====== 1. نظام البيانات الموحّد ====== */
const STORAGE_KEY = 'dulaGames_v3';

const defaultState = {
  xp: 0,
  coins: 0,
  streak: 0,
  lastDay: '',
  scores: {},      // أفضل سكور لكل لعبة
  plays: {},       // عدد مرات لعب كل لعبة
  owned: [],       // العناصر المشتراة من المتجر
  theme: 'default'
};

let state = { ...defaultState };

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) state = { ...defaultState, ...JSON.parse(saved) };
  } catch (e) { console.warn('Load error', e); }
  checkStreak();
  renderAll();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function checkStreak() {
  const today = new Date().toDateString();
  if (state.lastDay !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (state.lastDay === yesterday) state.streak++;
    else if (state.lastDay !== today) state.streak = 1;
    state.lastDay = today;
    saveState();
  }
}

/* ====== 2. المستوى والكوينز ====== */
function getLevel() { return Math.floor(state.xp / 100) + 1; }
function getXPInLevel() { return state.xp % 100; }

function addReward(xp, coins) {
  state.xp += xp;
  state.coins += coins;
  saveState();
  renderAll();
  showToast(`+${xp} XP و +${coins} 🪙`);
}

function addCoins(n) {
  state.coins += n;
  saveState();
  renderTopbar();
  showToast(`+${n} 🪙`);
}

function spendCoins(n) {
  if (state.coins < n) return false;
  state.coins -= n;
  saveState();
  renderTopbar();
  return true;
}

/* ====== 3. تسجيل نتيجة اللعبة ====== */
function recordScore(gameId, score, coinsEarned) {
  const isNewBest = !state.scores[gameId] || score > state.scores[gameId];
  if (isNewBest) state.scores[gameId] = score;
  state.plays[gameId] = (state.plays[gameId] || 0) + 1;

  const xp = Math.max(5, Math.floor(score / 5));
  const coins = coinsEarned || Math.max(1, Math.floor(score / 10));

  state.xp += xp;
  state.coins += coins;
  saveState();
  renderAll();

  return { isNewBest, xp, coins, best: state.scores[gameId] };
}

/* ====== 4. عرض الواجهة ====== */
function renderAll() {
  renderTopbar();
  renderLeaderboard();
  renderGames();
  renderShop();
}

function renderTopbar() {
  const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  el('topLevel', getLevel());
  el('topXP', state.xp);
  el('topCoins', state.coins);
  el('topStreak', state.streak);
  el('shopCoins', state.coins);
}

function renderLeaderboard() {
  const list = document.getElementById('leaderboardList');
  if (!list) return;

  const entries = Object.entries(state.scores)
    .map(([id, score]) => ({
      id,
      name: GAMES.find(g => g.id === id)?.name || id,
      icon: GAMES.find(g => g.id === id)?.icon || '🎮',
      score
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (entries.length === 0) {
    list.innerHTML = '<li style="justify-content:center;opacity:0.6">لا يوجد سكور بعد — ابدأ اللعب! 🎮</li>';
    return;
  }

  const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
  list.innerHTML = entries.map((e, i) => `
    <li class="${i < 3 ? 'top' + (i + 1) : ''}">
      <span class="rank">${medals[i]}</span>
      <span class="lb-name">${e.icon} ${e.name}</span>
      <span class="lb-score">${e.score}</span>
    </li>
  `).join('');
}

function renderGames() {
  const grid = document.getElementById('gamesGrid');
  if (!grid) return;

  grid.innerHTML = GAMES.map(g => `
    <div class="game-card" data-name="${g.name}" style="--tc:var(--c${(GAMES.indexOf(g) % 6) + 1})" onclick="startGame('${g.id}')">
      ${g.isNew ? '<span class="gc-badge">جديد</span>' : ''}
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

/* ====== 5. قائمة الألعاب ====== */
const GAMES = [
  { id: 'xo', name: 'إكس أوه', icon: '❌' },
  { id: 'rps', name: 'حجر ورقة مقص', icon: '✊' },
  { id: 'guess', name: 'خمن الرقم', icon: '🔢' },
  { id: 'memory', name: 'الذاكرة', icon: '🧠' },
  { id: 'snake', name: 'أفعى', icon: '🐍' },
  { id: 'whack', name: 'اضرب الخلد', icon: '🔨' },
  { id: 'quiz', name: 'سؤال وجواب', icon: '❓' },
  { id: 'simon', name: 'ذاكر الألوان', icon: '🎨' },
  { id: 'math', name: 'سباق الحساب', icon: '➕' },
  { id: 'react', name: 'سرعة البديهة', icon: '⚡' },
  { id: 'adventure', name: 'مغامرة DULA', icon: '🗺️', isNew: true },
  { id: 'about', name: 'عن الموقع', icon: 'ℹ️' },
  { id: 'ucl', name: 'دوري الأبطال', icon: '🏆' },
  { id: 'epl', name: 'الدوري الإنجليزي', icon: '⚽' },
  { id: 'player', name: 'حياة لاعب', icon: '🌟' },
  { id: 'wc', name: 'كأس العالم', icon: '🌍' }
];

/* ====== 6. التنقل ====== */
let activeGame = null;

function startGame(id) {
  document.getElementById('homeScreen').style.display = 'none';
  document.getElementById('gameScreen').style.display = 'block';

  const game = GAMES.find(g => g.id === id);
  document.getElementById('gameTitle').textContent = game.icon + ' ' + game.name;
  document.getElementById('currentScore').textContent = '0';

  const area = document.getElementById('gameArea');
  area.innerHTML = '';

  activeGame = id;
  clearAllTimers();

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
    case 'adventure': initAdventure(area); break;
    case 'about': initAbout(area); break;
    case 'ucl': initQuiz(area, uclQuestions, 'ucl'); break;
    case 'epl': initQuiz(area, eplQuestions, 'epl'); break;
    case 'player': initQuiz(area, playerQuestions, 'player'); break;
    case 'wc': initQuiz(area, wcQuestions, 'wc'); break;
  }
}

function backHome() {
  clearAllTimers();
  document.getElementById('homeScreen').style.display = 'block';
  document.getElementById('gameScreen').style.display = 'none';
  activeGame = null;
  renderAll();
}

function endGame(id, score) {
  const result = recordScore(id, score);
  const area = document.getElementById('gameArea');

  area.innerHTML = `
    <div style="text-align:center;padding:30px 10px">
      <h2 style="font-size:2rem;color:var(--c3);margin-bottom:14px">🎉 انتهت اللعبة!</h2>
      <div style="font-size:2rem;font-weight:800;margin:14px 0">سكورك: ${score}</div>
      ${result.isNewBest ? '<div style="color:var(--c5);font-weight:800;margin-bottom:10px">🏆 رقم قياسي جديد!</div>' : ''}
      <div style="margin:12px 0;font-size:1.1rem">💰 +${result.coins} كوين &nbsp; ⭐ +${result.xp} XP</div>
      <div style="color:var(--muted);margin-bottom:16px">أفضل نتيجة: ${result.best}</div>
      <button class="reset" onclick="startGame('${id}')">🔄 العب مرة تانية</button>
      <button class="reset" onclick="backHome()" style="background:var(--c4)">🏠 الرئيسية</button>
    </div>
  `;
}

function clearAllTimers() {
  if (snakeTimer) clearInterval(snakeTimer);
  if (whackTimer) clearInterval(whackTimer);
  if (whackUpTimer) clearInterval(whackUpTimer);
  if (mathTimer) clearInterval(mathTimer);
  if (reactTimeout) clearTimeout(reactTimeout);
  if (advReactTimer) clearTimeout(advReactTimer);
  snakeTimer = whackTimer = whackUpTimer = mathTimer = reactTimeout = advReactTimer = null;
}

/* ====== 7. أدوات مساعدة ====== */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2200);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ====== 8. لعبة X-O ====== */
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

/* ====== 9. حجر ورقة مقص ====== */
function initRPS(area) {
  const opts = ['✊', '✋', '✌️'];
  const beats = { '✊': '✌️', '✋': '✊', '✌️': '✋' };
  let wins = 0, losses = 0;

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
        if (wins % 3 === 0) recordScore('rps', wins * 30);
      } else {
        losses++;
        statEl.textContent = 'خسرت 😅 (' + losses + ' خسارة)';
      }
    };
  });
}

/* ====== 10. خمن الرقم ====== */
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
      status.textContent = 'صح! الرقم كان ' + target + ' 🎉 (محاولات: ' + tries + ')';
      const score = Math.max(20, 200 - tries * 20);
      recordScore('guess', score);
      document.getElementById('currentScore').textContent = score;
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

/* ====== 11. لعبة الذاكرة ====== */
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
          const score = Math.max(200, 1000 - matched * 20);
          endGame('memory', score);
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

/* ====== 12. لعبة الأفعى ====== */
let snakeTimer = null;

function initSnake(area) {
  const size = 12, cols = 20, rows = 20;

  area.innerHTML = `
    <p class="status" id="snakeStatus">النقاط: 0</p>
    <p class="best" id="snakeBest">أفضل نتيجة: ${state.scores.snake || 0}</p>
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
    food = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows)
    };
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
    } else {
      snake.pop();
    }
    draw();
  }

  function draw() {
    const css = getComputedStyle(document.documentElement);
    ctx.fillStyle = css.getPropertyValue('--bg1') || '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = css.getPropertyValue('--c3') || '#ffb703';
    ctx.fillRect(food.x * size, food.y * size, size - 1, size - 1);

    ctx.fillStyle = css.getPropertyValue('--c5') || '#51cf66';
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

/* ====== 13. اضرب الخلد ====== */
let whackTimer = null, whackUpTimer = null;

function initWhack(area) {
  let score = 0, timeLeft = 30, holes = [], running = false;

  area.innerHTML = `
    <p class="status" id="whackStatus">النقاط: 0 — الوقت: 30</p>
    <p class="best" id="whackBest">أفضل نتيجة: ${state.scores.whack || 0}</p>
    <div id="whackBoard"></div>
    <button class="reset" id="whackReset">ابدأ اللعب</button>
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
    score = 0;
    timeLeft = 30;
    running = true;
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

/* ====== 14. أسئلة (مشترك) ====== */
const quizQuestions = [
  { q: 'ما عاصمة مصر؟', opts: ['القاهرة', 'الإسكندرية', 'أسوان'], a: 0 },
  { q: 'أكبر كوكب في المجموعة الشمسية؟', opts: ['الأرض', 'المشتري', 'زحل'], a: 1 },
  { q: 'كم قارة في العالم؟', opts: ['5', '6', '7'], a: 2 },
  { q: 'أسرع حيوان بري؟', opts: ['الفهد', 'الأسد', 'الحصان'], a: 0 },
  { q: 'أطول نهر في العالم؟', opts: ['الأمازون', 'النيل', 'الفرات'], a: 1 },
  { q: 'أكبر محيط في العالم؟', opts: ['الأطلسي', 'الهادي', 'الهندي'], a: 1 },
  { q: 'أعلى جبل في العالم؟', opts: ['إفرست', 'كليمنجارو', 'الألب'], a: 0 },
  { q: 'أول رائد فضاء وصل للقمر؟', opts: ['يوري جاجارين', 'نيل أرمسترونج', 'باز ألدرين'], a: 1 }
];

const uclQuestions = [
  { q: 'الفريق الأكتر تتويجًا بدوري أبطال أوروبا؟', opts: ['ميلان', 'ريال مدريد', 'بايرن ميونخ'], a: 1 },
  { q: 'ملعب "أنفيلد" ملعب أي فريق؟', opts: ['إيفرتون', 'ليفربول', 'مانشستر يونايتد'], a: 1 },
  { q: 'أول نسخة من دوري أبطال أوروبا كانت في؟', opts: ['الأربعينات', 'الخمسينات', 'الستينات'], a: 1 },
  { q: 'ملعب "سانتياجو برنابيو" ملعب أي فريق؟', opts: ['برشلونة', 'أتلتيكو مدريد', 'ريال مدريد'], a: 2 },
  { q: 'مين صاحب أكبر عدد أهداف في تاريخ دوري الأبطال؟', opts: ['ميسي', 'ليفاندوفسكي', 'رونالدو'], a: 2 },
  { q: 'نادي يوفنتوس الإيطالي من أي مدينة؟', opts: ['ميلانو', 'روما', 'تورينو'], a: 2 }
];

const eplQuestions = [
  { q: 'الأكتر تتويجًا بالدوري الإنجليزي؟', opts: ['مان سيتي', 'مان يونايتد', 'ليفربول'], a: 1 },
  { q: 'ملعب "أولد ترافورد" ملعب أي فريق؟', opts: ['مان سيتي', 'مان يونايتد', 'ليدز'], a: 1 },
  { q: 'ملعب "الإمارات" ملعب أي فريق؟', opts: ['تشيلسي', 'توتنهام', 'أرسنال'], a: 2 },
  { q: 'نادي أرسنال بيتلقب بـ؟', opts: ['المدفعجية', 'الشياطين', 'السباع'], a: 0 },
  { q: 'نادي تشيلسي بيتلقب بـ؟', opts: ['البلوز', 'الريدز', 'الجانرز'], a: 0 },
  { q: 'الدوري الإنجليزي بشكله الحالي بدأ سنة؟', opts: ['1988', '1992', '1998'], a: 1 }
];

const playerQuestions = [
  { q: 'محمد صلاح بيلعب في أي مركز؟', opts: ['حارس', 'جناح/مهاجم', 'مدافع'], a: 1 },
  { q: 'محمد صلاح من مواليد أي محافظة؟', opts: ['الغربية', 'الإسكندرية', 'الجيزة'], a: 0 },
  { q: 'محمد صلاح بيلعب حاليًا لأي نادي؟', opts: ['تشيلسي', 'ليفربول', 'مان سيتي'], a: 1 },
  { q: 'محمد صلاح لعب في إيطاليا لنادي؟', opts: ['يوفنتوس', 'روما', 'إنتر'], a: 1 },
  { q: 'رقم قميص محمد صلاح في ليفربول؟', opts: ['7', '9', '11'], a: 2 }
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

  area.innerHTML = `
    <p class="status" id="quizScore"></p>
    <p class="best" id="quizBest">أفضل نتيجة: ${state.scores[gameId] || 0}</p>
    <p class="quiz-q" id="quizQ"></p>
    <div class="quiz-opts" id="quizOpts"></div>
  `;

  const qEl = document.getElementById('quizQ');
  const optsEl = document.getElementById('quizOpts');
  const scoreEl = document.getElementById('quizScore');

  const shuffled = shuffle(questions.slice()).slice(0, totalQ);

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

/* ====== 15. سيمون ====== */
function initSimon(area) {
  area.innerHTML = `
    <p class="status" id="simonStatus">دوس ابدأ وذاكر الترتيب</p>
    <p class="best" id="simonBest">أفضل نتيجة: ${state.scores.simon || 0}</p>
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

/* ====== 16. سباق الحساب ====== */
let mathTimer = null;

function initMath(area) {
  let score = 0, timeLeft = 30, answer = 0, running = false;

  area.innerHTML = `
    <p class="status" id="mathStatus">النقاط: 0 — الوقت: 30</p>
    <p class="best" id="mathBest">أفضل نتيجة: ${state.scores.math || 0}</p>
    <p class="math-eq" id="mathEq"></p>
    <div class="math-opts" id="mathOpts"></div>
    <button class="reset" id="mathReset">ابدأ اللعب</button>
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

    const arr = shuffle([...opts]);
    optsEl.innerHTML = '';
    arr.forEach(v => {
      const btn = document.createElement('button');
      btn.textContent = v;
      btn.onclick = () => {
        if (!running) return;
        if (v === answer) {
          score += 10;
          status.textContent = 'النقاط: ' + score + ' — الوقت: ' + timeLeft;
          document.getElementById('currentScore').textContent = score;
        }
        newEq();
      };
      optsEl.appendChild(btn);
    });
  }

  document.getElementById('mathReset').onclick = () => {
    clearInterval(mathTimer);
    score = 0;
    timeLeft = 30;
    running = true;
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

  eqEl.textContent = 'دوس ابدأ اللعب';
}

/* ====== 17. سرعة البديهة ====== */
let reactTimeout = null;

function initReact(area) {
  let waitingGo = false, startTime = 0;

  area.innerHTML = `
    <p class="status" id="reactStatus">دوس ابدأ واستنى اللون يتغير</p>
    <p class="best" id="reactBest">أفضل نتيجة: ${state.scores.react ? state.scores.react + ' مللي' : '—'}</p>
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
      recordScore('react', score);
      status.textContent = 'وقتك: ' + ms + ' مللي ثانية ⚡';
      document.getElementById('currentScore').textContent = ms + 'ms';
      waitingGo = false;
      box.classList.remove('go');
      box.textContent = 'دوس ابدأ تاني';
    } else if (box.textContent === 'استنى...') {
      status.textContent = 'بدري! استنى اللون يتغير';
    }
  };
}

/* ====== 18. مغامرة DULA ====== */
let advReactTimer = null;

function initAdventure(area) {
  let stage = 0, lives = 3, locked = false;
  const used = [];

  const generalQ = [
    { q: 'ما هو الكوكب الأحمر؟', o: ['المريخ', 'الزهرة', 'عطارد'], a: 0 },
    { q: 'كم يوم في الأسبوع؟', o: ['5', '7', '9'], a: 1 },
    { q: 'ما أكبر كوكب؟', o: ['الأرض', 'المشتري', 'المريخ'], a: 1 },
    { q: 'ما عاصمة مصر؟', o: ['القاهرة', 'الجيزة', 'أسوان'], a: 0 },
    { q: 'كم ضلع للمثلث؟', o: ['2', '3', '4'], a: 1 },
    { q: 'ما سفينة الصحراء؟', o: ['الجمل', 'الحصان', 'الفيل'], a: 0 },
    { q: 'ما الغاز الذي نتنفسه؟', o: ['الأكسجين', 'الهيدروجين', 'الهيليوم'], a: 0 },
    { q: 'كم شهر في السنة؟', o: ['10', '11', '12'], a: 2 }
  ];

  area.innerHTML = `
    <div class="adventure-head">
      <div>
        <h2>🗺️ مغامرة DULA</h2>
        <p id="advStage">المرحلة 1 من 12</p>
      </div>
      <div class="adv-hearts" id="advLives">❤️❤️❤️</div>
    </div>
    <div class="adv-progress"><i id="advProgressFill"></i></div>
    <div class="adventure-card">
      <div class="adv-badge" id="advType">تحدي</div>
      <h3 id="advTitle"></h3>
      <p id="advQuestion"></p>
      <div id="advArea"></div>
    </div>
    <p class="status" id="advStatus"></p>
    <button class="reset" id="advNext" style="display:none">المرحلة التالية →</button>
    <button class="reset" id="advRestart">ابدأ مغامرة جديدة</button>
  `;

  const stageEl = document.getElementById('advStage');
  const livesEl = document.getElementById('advLives');
  const fillEl = document.getElementById('advProgressFill');
  const typeEl = document.getElementById('advType');
  const titleEl = document.getElementById('advTitle');
  const qEl = document.getElementById('advQuestion');
  const areaEl = document.getElementById('advArea');
  const statusEl = document.getElementById('advStatus');
  const nextBtn = document.getElementById('advNext');

  function pick(arr) {
    const avail = arr.filter((_, i) => !used.includes(i));
    if (!avail.length) { used.length = 0; return arr[Math.floor(Math.random() * arr.length)]; }
    const idx = arr.indexOf(avail[Math.floor(Math.random() * avail.length)]);
    used.push(idx);
    return arr[idx];
  }

  function setCommon(title, type, q) {
    typeEl.textContent = type;
    titleEl.textContent = title;
    qEl.textContent = q || '';
    statusEl.textContent = '';
    areaEl.innerHTML = '';
    nextBtn.style.display = 'none';
  }

  function renderLives() {
    livesEl.textContent = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
  }

  function loseLife(msg) {
    if (locked) return;
    lives--;
    renderLives();
    statusEl.textContent = msg + ' ❤️ متبقي: ' + lives;
    if (lives <= 0) {
      locked = true;
      statusEl.textContent = 'انتهت المغامرة! وصلت للمرحلة ' + stage + ' من 12';
      return;
    }
    setTimeout(() => { stage++; renderStage(); }, 700);
  }

  function winStage(msg, xp, coins) {
    if (locked) return;
    locked = true;
    addReward(xp, coins);
    statusEl.textContent = msg + ' 🎉 +' + xp + ' XP و +' + coins + ' 🪙';
    nextBtn.style.display = stage < 11 ? 'inline-block' : 'none';
    if (stage === 11) {
      statusEl.textContent = '🏆 خلصت المغامرة! +50 XP إضافية';
      addReward(50, 20);
    }
  }

  function renderStage() {
    locked = false;
    renderLives();
    stageEl.textContent = 'المرحلة ' + (stage + 1) + ' من 12';
    fillEl.style.width = ((stage + 1) / 12 * 100) + '%';

    const type = stage % 6;
    if (type === 0) mathStage();
    else if (type === 1) quizStage();
    else if (type === 2) guessStage();
    else if (type === 3) memoryStage();
    else if (type === 4) reactionStage();
    else rpsStage();
  }

  function mathStage() {
    const n = 2 + Math.floor(stage / 3);
    const a = 5 + Math.floor(Math.random() * 10 * n);
    const b = 2 + Math.floor(Math.random() * 10 * n);
    const ops = stage >= 6 ? ['+', '-', '×'] : ['+', '-'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    const ans = op === '+' ? a + b : op === '-' ? a - b : a * b;

    setCommon('سباق الحساب', '🧮 حساب', 'حل العملية قبل الانتقال');
    areaEl.innerHTML = '<div class="adv-number">' + a + ' ' + op + ' ' + b + ' = ؟</div><div class="adv-options"></div>';
    const opts = areaEl.querySelector('.adv-options');
    const vals = new Set([ans]);
    while (vals.size < 3) vals.add(ans + Math.floor(Math.random() * 15) - 7);

    shuffle([...vals]).forEach(v => {
      const btn = document.createElement('button');
      btn.textContent = v;
      btn.onclick = () => {
        if (locked) return;
        if (v === ans) winStage('إجابة صحيحة!', 25, 7);
        else { btn.classList.add('wrong'); loseLife('الإجابة غلط.'); }
      };
      opts.appendChild(btn);
    });
  }

  function quizStage() {
    const item = pick(generalQ);
    setCommon('اختبر معلوماتك', '❓ سؤال', item.q);
    const opts = document.createElement('div');
    opts.className = 'adv-options';
    shuffle(item.o.map((v, i) => ({ v, i }))).forEach(x => {
      const b = document.createElement('button');
      b.textContent = x.v;
      b.onclick = () => {
        if (locked) return;
        if (x.i === item.a) { b.classList.add('correct'); winStage('إجابة ممتازة!', 22, 6); }
        else { b.classList.add('wrong'); loseLife('اختيار غير صحيح.'); }
      };
      opts.appendChild(b);
    });
    areaEl.appendChild(opts);
  }

  function guessStage() {
    const max = stage < 6 ? 30 : 60;
    const target = 1 + Math.floor(Math.random() * max);
    let tries = 0;

    setCommon('خمن الرقم', '🔢 تخمين', 'رقم سري من 1 إلى ' + max);
    areaEl.innerHTML = '<div class="adv-input"><input id="advGuess" type="number" min="1" max="' + max + '"><button class="adv-action">تخمين</button></div><p id="advHint" class="status"></p>';

    const input = document.getElementById('advGuess');
    const hint = document.getElementById('advHint');

    areaEl.querySelector('button').onclick = () => {
      if (locked) return;
      const v = Number(input.value);
      if (!v) return;
      tries++;
      if (v === target) winStage('صح! الرقم كان ' + target, 28, 8);
      else if (tries >= 4) { loseLife('الرقم كان ' + target); input.disabled = true; }
      else hint.textContent = v < target ? 'أكبر ⬆️' : 'أصغر ⬇️';
    };
    input.focus();
  }

  function memoryStage() {
    const icons = ['🍎', '🚗', '⭐', '🐶', '⚽', '🚀'];
    const pairCount = stage < 6 ? 3 : 4;
    const vals = shuffle([...icons].slice(0, pairCount).flatMap(x => [x, x]));
    let open = [], done = 0, lock = false;

    setCommon('ذاكرة سريعة', '🧠 ذاكرة', 'افتح كل الأزواج');
    const grid = document.createElement('div');
    grid.className = 'adv-memory';
    areaEl.appendChild(grid);

    vals.forEach((v, i) => {
      const b = document.createElement('button');
      b.dataset.i = i;
      b.onclick = () => {
        if (lock || b.classList.contains('done') || b.classList.contains('open')) return;
        b.textContent = v;
        b.classList.add('open');
        open.push(b);

        if (open.length === 2) {
          lock = true;
          if (open[0].textContent === open[1].textContent) {
            open.forEach(x => { x.classList.add('done'); x.classList.remove('open'); });
            open = [];
            done++;
            lock = false;
            if (done === pairCount) winStage('ذاكرة قوية!', 26, 7);
          } else {
            setTimeout(() => {
              open.forEach(x => { x.textContent = ''; x.classList.remove('open'); });
              open = [];
              lock = false;
            }, 500);
          }
        }
      };
      grid.appendChild(b);
    });
  }

  function reactionStage() {
    setCommon('سرعة البديهة', '⚡ رد فعل', 'اضغط فقط عندما يتغير اللون');
    const box = document.createElement('div');
    box.className = 'adv-reaction';
    box.textContent = 'استنى...';
    areaEl.appendChild(box);

    const delay = 700 + Math.random() * (stage >= 6 ? 1300 : 2300);
    advReactTimer = setTimeout(() => {
      box.classList.add('go');
      box.textContent = 'اضغط الآن!';
      box.dataset.go = '1';
      box.dataset.t = Date.now();
    }, delay);

    box.onclick = () => {
      if (box.dataset.go === '1') {
        const ms = Date.now() - Number(box.dataset.t);
        clearTimeout(advReactTimer);
        winStage('وقت رد فعلك: ' + ms + ' مللي', 30, 9);
      } else {
        clearTimeout(advReactTimer);
        loseLife('ضغطت بدري!');
      }
    };
  }

  function rpsStage() {
    setCommon('مواجهة سريعة', '✊ حجر ورقة مقص', 'اكسب الجولة أمام الكمبيوتر');
    const choices = ['✊', '✋', '✌️'];
    const beats = { '✊': '✌️', '✋': '✊', '✌️': '✋' };
    const wrap = document.createElement('div');
    wrap.className = 'adv-options';

    shuffle(choices.slice()).forEach(c => {
      const b = document.createElement('button');
      b.textContent = c;
      b.onclick = () => {
        if (locked) return;
        const cpu = choices[Math.floor(Math.random() * 3)];
        if (c === cpu) { statusEl.textContent = 'تعادل — حاول مرة أخرى'; return; }
        if (beats[c] === cpu) winStage(c + ' ضد ' + cpu + ' — كسبت!', 24, 6);
        else loseLife(c + ' ضد ' + cpu + ' — خسرت الجولة.');
      };
      wrap.appendChild(b);
    });
    areaEl.appendChild(wrap);
  }

  nextBtn.onclick = () => { if (stage < 11) { stage++; renderStage(); } };
  document.getElementById('advRestart').onclick = () => {
    stage = 0;
    lives = 3;
    used.length = 0;
    clearTimeout(advReactTimer);
    renderStage();
  };

  renderStage();
}

/* ====== 19. عن الموقع ====== */
function initAbout(area) {
  area.innerHTML = `
    <div class="about-box">
      <p class="about-emoji">🎮</p>
      <h2>DULA Games</h2>
      <p>موقع فيه مجموعة ألعاب بسيطة وسريعة تقدر تلعبها في أي وقت من غير تحميل أي برنامج.</p>
      <p>الموقع اتعمل كمشروع شخصي، وبيتزود بألعاب جديدة بشكل مستمر.</p>
      <p>🎯 كل لعبة بتحفظ أفضل نتيجة وصلت ليها على نفس الجهاز.</p>
      <p>💰 العب واجمع الكوينز واطلع في لوحة المتصدرين!</p>
      <p style="text-align:center;margin-top:20px;opacity:0.7">© DULA Games 2025</p>
    </div>
  `;
}

/* ====== 20. المتجر ====== */
const SHOP_ITEMS = [
  { id: 'theme-dark', name: 'ثيم داكن', icon: '🌙', price: 50, type: 'theme' },
  { id: 'theme-sunset', name: 'ثيم الغروب', icon: '🌅', price: 80, type: 'theme' },
  { id: 'avatar-cat', name: 'أفاتار قطة', icon: '🐱', price: 40, type: 'avatar' },
  { id: 'avatar-lion', name: 'أفاتار أسد', icon: '🦁', price: 60, type: 'avatar' },
  { id: 'avatar-robot', name: 'أفاتار روبوت', icon: '🤖', price: 70, type: 'avatar' },
  { id: 'boost-xp', name: 'مضاعف XP', icon: '⚡', price: 100, type: 'boost' }
];

function openShop() {
  document.getElementById('shopModal').classList.add('active');
  renderShop();
}

function closeShop() {
  document.getElementById('shopModal').classList.remove('active');
}

function renderShop() {
  const grid = document.getElementById('shopGrid');
  if (!grid) return;

  grid.innerHTML = SHOP_ITEMS.map(item => {
    const owned = state.owned.includes(item.id);
    return `
      <div class="shop-item ${owned ? 'owned' : ''}">
        <span class="si-icon">${item.icon}</span>
        <div class="si-name">${item.name}</div>
        <button class="si-price" ${owned ? 'disabled' : ''} onclick="buyItem('${item.id}')">
          ${owned ? '✅ مملوك' : item.price + ' 🪙'}
        </button>
      </div>
    `;
  }).join('');
}

function buyItem(id) {
  const item = SHOP_ITEMS.find(x => x.id === id);
  if (!item || state.owned.includes(id)) return;

  if (state.coins < item.price) {
    showToast('❌ كوينز غير كافية!');
    return;
  }

  state.coins -= item.price;
  state.owned.push(id);

  if (item.type === 'theme') {
    state.theme = id;
    applyTheme(id);
  }

  saveState();
  renderAll();
  showToast('✅ اشتريت ' + item.name);
}

function applyTheme(id) {
  if (id === 'theme-dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

/* ====== 21. التحدي اليومي ====== */
function claimDaily() {
  const today = new Date().toDateString();
  if (state.lastDay === today && state._dailyClaimed === today) {
    showToast('🎁 خدت مكافأة النهاردة!');
    return;
  }
  state._dailyClaimed = today;
  addReward(40, 15);
  saveState();
}

/* ====== 22. التشغيل ====== */
window.addEventListener('DOMContentLoaded', () => {
  loadState();
  if (state.theme) applyTheme(state.theme);

  // إغلاق المتجر بالضغط برا
  document.getElementById('shopModal').addEventListener('click', (e) => {
    if (e.target.id === 'shopModal') closeShop();
  });

  // إغلاق بأي كليك على زر Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeShop();
  });
});      