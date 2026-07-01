const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const logoutButton = document.getElementById('logoutButton');
const welcomeName = document.getElementById('welcomeName');
const walletAmount = document.getElementById('walletAmount');
const depositForm = document.getElementById('depositForm');
const depositAmount = document.getElementById('depositAmount');
const cardNumber = document.getElementById('cardNumber');
const expiryDate = document.getElementById('expiryDate');
const cvvCode = document.getElementById('cvvCode');
const depositSuccess = document.getElementById('depositSuccess');
const withdrawForm = document.getElementById('withdrawForm');
const withdrawAmount = document.getElementById('withdrawAmount');
const withdrawSuccess = document.getElementById('withdrawSuccess');
const bonusButton = document.getElementById('bonusButton');
const bonusMessage = document.getElementById('bonusMessage');
const themeToggle = document.getElementById('themeToggle');
const leaderboardList = document.getElementById('leaderboardList');
const gamesPlayedSpan = document.getElementById('gamesPlayed');
const winRateSpan = document.getElementById('winRate');
const liveFeed = document.getElementById('liveFeed');
const livePlayers = document.getElementById('livePlayers');
const liveJackpot = document.getElementById('liveJackpot');
const enterLiveButton = document.getElementById('enterLiveButton');
const gamesList = document.getElementById('gamesList');
const activityList = document.getElementById('activityList');
const recentWins = document.getElementById('recentWins');
const backendApiStatus = document.getElementById('apiStatus');
const backendDbStatus = document.getElementById('dbStatus');
const backendNosqlStatus = document.getElementById('nosqlStatus');
const backendLog = document.getElementById('backendLog');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const registerName = document.getElementById('registerName');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const gameModal = document.getElementById('gameModal');
const closeModal = document.getElementById('closeModal');
const modalGameTitle = document.getElementById('modalGameTitle');
const modalGameDescription = document.getElementById('modalGameDescription');
const playGameButton = document.getElementById('playGameButton');
const betAmount = document.getElementById('betAmount');
const gameResultBox = document.getElementById('gameResultBox');
const gameResultText = document.getElementById('gameResultText');

let liveFeedInterval = null;
const apiBaseUrl = 'http://localhost:3000';

const sampleGames = [
  {
    id: 'crypto-clash',
    name: 'Crypto Clash',
    description: 'Predict the crypto surge and win big rewards.',
    entryFee: 15,
    multiplier: 3.5,
  },
  {
    id: 'laser-rush',
    name: 'Laser Rush',
    description: 'Fast reaction game with instant cash prizes.',
    entryFee: 25,
    multiplier: 4,
  },
  {
    id: 'arena-spin',
    name: 'Arena Spin',
    description: 'Spin the arena wheel and watch your balance grow.',
    entryFee: 10,
    multiplier: 2.8,
  },
];

const sampleWins = [
  'Aisha won $112 from Laser Rush',
  'Mark earned $45 on Crypto Clash',
  'Jade cashed out $88 from Arena Spin',
  'Noah scored $128 bonus today',
];

let currentGame = null;

function getStoredUsers() {
  const stored = localStorage.getItem('lgc-users');
  return stored ? JSON.parse(stored) : [];
}

function setStoredUsers(users) {
  localStorage.setItem('lgc-users', JSON.stringify(users));
}

function getCurrentUser() {
  const email = localStorage.getItem('lgc-current-user');
  if (!email) return null;
  return getStoredUsers().find((user) => user.email === email) || null;
}

function setCurrentUser(email) {
  localStorage.setItem('lgc-current-user', email);
}

function logout() {
  localStorage.removeItem('lgc-current-user');
  showLogin();
}

function showLogin() {
  loginScreen.classList.remove('hidden');
  dashboardScreen.classList.add('hidden');
  logoutButton.classList.add('hidden');
}

function showDashboard(user) {
  loginScreen.classList.add('hidden');
  dashboardScreen.classList.remove('hidden');
  logoutButton.classList.remove('hidden');
  welcomeName.textContent = user.name;
  walletAmount.textContent = `$${user.balance.toFixed(2)}`;
  renderGames();
  renderRecentWins(user);
  renderActivityHistory(user);
  renderLeaderboard();
  updateUserStatsUI(user);
  startLiveFeed();
  startBackendSimulation();
}

function renderGames() {
  gamesList.innerHTML = sampleGames
    .map(
      (game) => `
      <div class="game-card">
        <div>
          <h4>${game.name}</h4>
          <p>${game.description}</p>
        </div>
        <div class="game-meta">
          <span>Entry fee: $${game.entryFee}</span>
          <span>Win up to: ${game.multiplier}x</span>
        </div>
        <button class="button button-primary" data-game-id="${game.id}">Play now</button>
      </div>
    `
    )
    .join('');

  gamesList.querySelectorAll('button[data-game-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const gameId = button.dataset.gameId;
      currentGame = sampleGames.find((item) => item.id === gameId);
      openGameModal(currentGame);
    });
  });
}

function renderRecentWins(user) {
  const recentUserWins = (user?.history || [])
    .filter((item) => item.type === 'win')
    .slice(0, 3)
    .map((item) => `You won ${item.details.replace('Won ', '')}`);

  const mergedWins = [...recentUserWins, ...sampleWins].slice(0, 4);
  recentWins.innerHTML = mergedWins
    .map((message) => `<li>${message}</li>`)
    .join('');
}

function openGameModal(game) {
  if (!game) return;
  modalGameTitle.textContent = game.name;
  modalGameDescription.textContent = game.description;
  betAmount.value = game.entryFee;
  betAmount.min = game.entryFee;
  betAmount.placeholder = `${game.entryFee}`;
  gameResultBox.classList.add('hidden');
  gameResultText.textContent = '';
  gameModal.classList.remove('hidden');
}

function closeGameModal() {
  gameModal.classList.add('hidden');
}

function updateUserBalance(email, newBalance) {
  const users = getStoredUsers();
  const user = users.find((item) => item.email === email);
  if (user) {
    user.balance = newBalance;
    setStoredUsers(users);
    walletAmount.textContent = `$${newBalance.toFixed(2)}`;
  }
}

function addUserHistory(email, entry) {
  const users = getStoredUsers();
  const user = users.find((item) => item.email === email);
  if (user) {
    user.history = user.history || [];
    user.history.unshift(entry);
    setStoredUsers(users);
  }
}

function renderActivityHistory(user) {
  const history = user.history || [];
  if (!history.length) {
    activityList.innerHTML = '<li>No transactions yet. Deposit or play a game to get started.</li>';
  } else {
    activityList.innerHTML = history
      .slice(0, 6)
      .map((item) => `
        <li class="transaction-card">
          <strong>${item.title}</strong>
          <span>${item.details}</span>
          <span class="status-badge ${item.type}">${item.label}</span>
        </li>
      `)
      .join('');
  }

  updateUserStatsUI(user);
}

function renderLeaderboard() {
  const users = getStoredUsers();
  const leaderboard = users
    .slice()
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 4)
    .map((user) => ({
      name: user.name,
      prize: `$${user.balance.toFixed(2)}`,
    }));

  const fallback = [
    { name: 'Luna', prize: '$987' },
    { name: 'Kai', prize: '$842' },
    { name: 'Raven', prize: '$734' },
    { name: 'Nova', prize: '$685' },
  ];

  const list = leaderboard.length ? leaderboard : fallback;
  leaderboardList.innerHTML = list
    .map(
      (player) => `
        <div class="leaderboard-item">
          <strong>${player.name}</strong>
          <span>${player.prize}</span>
        </div>
      `
    )
    .join('');
}

function updateLiveArena() {
  const players = 18 + Math.floor(Math.random() * 14);
  const jackpot = 400 + Math.floor(Math.random() * 350);
  livePlayers.textContent = players;
  liveJackpot.textContent = `$${jackpot}`;
}

const liveFeedMessages = [
  'Alexa just won $56 in Laser Rush.',
  'Riley joined a live Arena Spin showdown.',
  'Mia scored a fresh victory in Crypto Clash.',
  'Jayden is on a winning streak in Laser Rush.',
  'Zoe entered the live arena for a $30 bet.',
  'Leo just hit a 3x payout on Arena Spin.',
];

const backendEvents = [
  'Node.js API endpoint /api/game/start deployed successfully.',
  'Django auth service connected to PostgreSQL.',
  'MongoDB cluster synchronized with live player results.',
  'AI payout engine warmed up for real-time balancing.',
  'Secure payment gateway ready for fast deposits.',
  'Leaderboard API returned updated player ranks.',
];

const backendState = {
  api: 'Online',
  sql: 'Connected',
  nosql: 'Ready',
};

let backendInterval = null;

async function apiFetch(path, options = {}) {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, options);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || response.statusText);
    }
    return await response.json();
  } catch (error) {
    logBackendEvent(`Backend request failed: ${path} — ${error.message}`);
    backendState.api = 'Offline';
    backendState.sql = 'Unavailable';
    backendState.nosql = 'Unavailable';
    updateBackendStatus();
    return null;
  }
}

async function checkBackendStatus() {
  const status = await apiFetch('/api/status');
  if (status) {
    backendState.api = status.node || 'Online';
    backendState.sql = status.postgres || 'Connected';
    backendState.nosql = status.mongodb || 'Ready';
    updateBackendStatus();
    logBackendEvent('Backend health check passed.');
    return true;
  }
  return false;
}

function syncUserToLocal(user) {
  if (!user?.email) return;
  const users = getStoredUsers();
  const existing = users.find((item) => item.email === user.email);
  const sanitized = {
    name: user.name || existing?.name || '',
    email: user.email,
    password: user.password || existing?.password || '',
    balance: typeof user.balance === 'number' ? user.balance : existing?.balance || 0,
    history: Array.isArray(user.history) ? user.history : existing?.history || [],
    lastBonusDate: user.lastBonusDate || existing?.lastBonusDate || null,
  };
  if (existing) {
    Object.assign(existing, sanitized);
  } else {
    users.push(sanitized);
  }
  setStoredUsers(users);
  setCurrentUser(sanitized.email);
  return sanitized;
}

function logBackendEvent(message) {
  if (!backendLog) return;
  const item = document.createElement('p');
  item.textContent = `⟡ ${message}`;
  backendLog.prepend(item);
  if (backendLog.children.length > 7) {
    backendLog.removeChild(backendLog.lastChild);
  }
}

function updateBackendStatus() {
  if (!backendApiStatus || !backendDbStatus || !backendNosqlStatus) return;
  backendApiStatus.textContent = backendState.api;
  backendDbStatus.textContent = backendState.sql;
  backendNosqlStatus.textContent = backendState.nosql;
}

function startBackendSimulation() {
  updateBackendStatus();
  logBackendEvent('Backend services are online and ready.');

  if (backendInterval) {
    clearInterval(backendInterval);
  }

  backendInterval = setInterval(() => {
    const message = backendEvents[Math.floor(Math.random() * backendEvents.length)];
    logBackendEvent(message);
    if (Math.random() > 0.75) {
      backendState.api = 'Online';
      backendState.sql = 'Connected';
      backendState.nosql = 'Ready';
      updateBackendStatus();
    }
  }, 5200);
}

function simulateBackendRequest(action, details) {
  logBackendEvent(`API request: ${action} — ${details}`);
}

function addLiveFeedMessage(message) {
  const item = document.createElement('p');
  item.className = 'live-item';
  item.textContent = message;
  liveFeed.prepend(item);
  if (liveFeed.children.length > 6) {
    liveFeed.removeChild(liveFeed.lastChild);
  }
}

function startLiveFeed() {
  updateLiveArena();
  addLiveFeedMessage('Welcome to the live arena — join the action!');
  if (liveFeedInterval) {
    clearInterval(liveFeedInterval);
  }
  liveFeedInterval = setInterval(() => {
    updateLiveArena();
    const message = liveFeedMessages[Math.floor(Math.random() * liveFeedMessages.length)];
    addLiveFeedMessage(message);
  }, 4200);
}

function getNumberOnly(value) {
  return value.replace(/\D/g, '');
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function calculateUserStats(user) {
  const history = user.history || [];
  const gameEntries = history.filter((item) => item.type === 'win' || item.type === 'loss');
  const gamesPlayed = gameEntries.length;
  const wins = gameEntries.filter((item) => item.type === 'win').length;
  const winRate = gamesPlayed ? Math.round((wins / gamesPlayed) * 100) : 0;

  return { gamesPlayed, winRate };
}

function updateUserStatsUI(user) {
  const stats = calculateUserStats(user);
  gamesPlayedSpan.textContent = `${stats.gamesPlayed} games played`;
  winRateSpan.textContent = `${stats.winRate}% win rate`;
}

function formatCardNumber(value) {
  return getNumberOnly(value)
    .match(/.{1,4}/g)
    ?.join(' ') || value;
}

loginTab.addEventListener('click', () => {
  loginTab.classList.add('active');
  registerTab.classList.remove('active');
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
});

registerTab.addEventListener('click', () => {
  registerTab.classList.add('active');
  loginTab.classList.remove('active');
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = loginEmail.value.trim().toLowerCase();
  const password = loginPassword.value;

  const backendResponse = await apiFetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (backendResponse?.user) {
    const user = syncUserToLocal({ ...backendResponse.user, password });
    showDashboard(user);
    loginForm.reset();
    return;
  }

  const users = getStoredUsers();
  const user = users.find((item) => item.email === email && item.password === password);
  if (!user) {
    alert('Invalid login credentials. Please try again.');
    return;
  }
  setCurrentUser(user.email);
  showDashboard(user);
  loginForm.reset();
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = registerName.value.trim();
  const email = registerEmail.value.trim().toLowerCase();
  const password = registerPassword.value;
  if (!name || !email || !password) {
    alert('Please fill in every field.');
    return;
  }

  const backendResponse = await apiFetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  if (backendResponse?.user) {
    const user = syncUserToLocal({ ...backendResponse.user, password });
    showDashboard(user);
    registerForm.reset();
    return;
  }

  const users = getStoredUsers();
  const existing = users.find((item) => item.email === email);
  if (existing) {
    alert('This email is already registered. Please use another email.');
    return;
  }

  const newUser = { name, email, password, balance: 0, history: [], lastBonusDate: null };
  users.push(newUser);
  setStoredUsers(users);
  setCurrentUser(email);
  showDashboard(newUser);
  registerForm.reset();
});

logoutButton.addEventListener('click', logout);

depositForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const amount = Number(depositAmount.value);
  if (amount <= 0 || !Number.isFinite(amount)) {
    alert('Enter a valid deposit amount.');
    return;
  }

  if (getNumberOnly(cardNumber.value).length < 12) {
    alert('Enter a valid card number.');
    return;
  }

  if (!/^\d{2}\/\d{2}$/.test(expiryDate.value)) {
    alert('Expiry date should be in MM/YY format.');
    return;
  }

  if (!/^\d{3}$/.test(cvvCode.value)) {
    alert('Enter a valid CVV.');
    return;
  }

  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('Please login first.');
    return;
  }

  const backendResponse = await apiFetch('/api/deposit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: currentUser.email, amount }),
  });

  if (backendResponse?.balance != null) {
    const updatedUser = syncUserToLocal({
      ...currentUser,
      balance: backendResponse.balance,
      history: backendResponse.history,
    });
    currentUser.balance = updatedUser.balance;
    renderActivityHistory(updatedUser);
    renderLeaderboard();
    renderRecentWins(updatedUser);
    simulateBackendRequest('Deposit', 'Processed deposit through payment gateway.');
    depositForm.reset();
    depositSuccess.classList.remove('hidden');
    setTimeout(() => depositSuccess.classList.add('hidden'), 3500);
    return;
  }

  const newBalance = currentUser.balance + amount;
  updateUserBalance(currentUser.email, newBalance);
  currentUser.balance = newBalance;
  addUserHistory(currentUser.email, {
    title: 'Deposit successful',
    details: `Added $${amount.toFixed(2)} to wallet.`,
    type: 'deposit',
    label: 'Deposit',
  });
  renderActivityHistory(currentUser);
  renderLeaderboard();
  renderRecentWins(currentUser);
  depositForm.reset();
  depositSuccess.classList.remove('hidden');
  setTimeout(() => depositSuccess.classList.add('hidden'), 3500);
});

bonusButton.addEventListener('click', () => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('Please login first.');
    return;
  }

  const today = getTodayKey();
  if (currentUser.lastBonusDate === today) {
    alert('You can claim the daily bonus once per day.');
    return;
  }

  const bonus = 20;
  const newBalance = currentUser.balance + bonus;
  updateUserBalance(currentUser.email, newBalance);
  currentUser.balance = newBalance;
  currentUser.lastBonusDate = today;
  addUserHistory(currentUser.email, {
    title: 'Daily bonus claimed',
    details: `Received $${bonus.toFixed(2)} bonus credit.`,
    type: 'deposit',
    label: 'Bonus',
  });
  renderActivityHistory(currentUser);
  renderLeaderboard();
  renderRecentWins(currentUser);
  addLiveFeedMessage(`${currentUser.name} claimed the daily bonus!`);
  simulateBackendRequest('Bonus', 'Applied daily credit to wallet.');
  bonusMessage.classList.remove('hidden');
  setTimeout(() => bonusMessage.classList.add('hidden'), 3500);
});

let isNeon = false;

themeToggle.addEventListener('click', () => {
  isNeon = !isNeon;
  document.body.classList.toggle('neon', isNeon);
  themeToggle.textContent = isNeon ? 'Classic mode' : 'Neon mode';
});

withdrawForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const amount = Number(withdrawAmount.value);
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('Please login first.');
    return;
  }

  if (amount <= 0 || !Number.isFinite(amount)) {
    alert('Enter a valid withdrawal amount.');
    return;
  }

  if (amount > currentUser.balance) {
    alert('Insufficient balance to withdraw this amount.');
    return;
  }

  const backendResponse = await apiFetch('/api/withdraw', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: currentUser.email, amount }),
  });

  if (backendResponse?.balance != null) {
    const updatedUser = syncUserToLocal({
      ...currentUser,
      balance: backendResponse.balance,
      history: backendResponse.history,
    });
    currentUser.balance = updatedUser.balance;
    renderActivityHistory(updatedUser);
    renderLeaderboard();
    renderRecentWins(updatedUser);
    addLiveFeedMessage(`$${amount.toFixed(2)} withdrawn by ${updatedUser.name}.`);
    simulateBackendRequest('Withdrawal', 'Processed secure payout request.');
    withdrawForm.reset();
    withdrawSuccess.classList.remove('hidden');
    setTimeout(() => withdrawSuccess.classList.add('hidden'), 3500);
    return;
  }

  const newBalance = currentUser.balance - amount;
  updateUserBalance(currentUser.email, newBalance);
  currentUser.balance = newBalance;
  addUserHistory(currentUser.email, {
    title: 'Withdrawal completed',
    details: `Removed $${amount.toFixed(2)} from wallet.`,
    type: 'withdraw',
    label: 'Withdraw',
  });
  renderActivityHistory(currentUser);
  renderLeaderboard();
  renderRecentWins(currentUser);
  addLiveFeedMessage(`$${amount.toFixed(2)} withdrawn by ${currentUser.name}.`);
  simulateBackendRequest('Withdrawal', 'Processed secure payout request.');
  withdrawForm.reset();
  withdrawSuccess.classList.remove('hidden');
  setTimeout(() => withdrawSuccess.classList.add('hidden'), 3500);
});

closeModal.addEventListener('click', closeGameModal);

gameModal.addEventListener('click', (event) => {
  if (event.target === gameModal) {
    closeGameModal();
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !gameModal.classList.contains('hidden')) {
    closeGameModal();
  }
});

playGameButton.addEventListener('click', async () => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    alert('Please login before playing.');
    closeGameModal();
    return;
  }

  const bet = Number(betAmount.value);
  if (!currentGame || bet < currentGame.entryFee || !Number.isFinite(bet)) {
    alert(`Enter at least $${currentGame?.entryFee || 0} to play.`);
    return;
  }

  if (currentUser.balance < bet) {
    alert('You do not have enough balance for this bet. Deposit funds first.');
    return;
  }

  const backendResponse = await apiFetch('/api/play', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: currentUser.email, gameId: currentGame.id, bet }),
  });

  let didWin = false;
  let payout = 0;
  let newBalance = currentUser.balance - bet;

  if (backendResponse?.balance != null) {
    didWin = Boolean(backendResponse.won);
    payout = Number(backendResponse.payout || 0);
    newBalance = backendResponse.balance;
    const updatedUser = syncUserToLocal({
      ...currentUser,
      balance: backendResponse.balance,
      history: backendResponse.history,
    });
    currentUser.balance = updatedUser.balance;
    renderActivityHistory(updatedUser);
    renderLeaderboard();
    renderRecentWins(updatedUser);
    simulateBackendRequest('Game', didWin ? `Processed game win for ${updatedUser.name}` : `Processed game loss for ${updatedUser.name}`);
  } else {
    didWin = Math.random() < Math.min(0.85, 0.46 + bet / (bet + 200));
    payout = didWin ? bet * currentGame.multiplier : 0;
    newBalance = currentUser.balance - bet + payout;
    updateUserBalance(currentUser.email, newBalance);
    currentUser.balance = newBalance;
    addUserHistory(currentUser.email, {
      title: didWin ? 'Game win' : 'Game loss',
      details: didWin
        ? `Won $${payout.toFixed(2)} in ${currentGame.name}.`
        : `Lost $${bet.toFixed(2)} in ${currentGame.name}.`,
      type: didWin ? 'win' : 'loss',
      label: didWin ? 'Win' : 'Loss',
    });
    renderActivityHistory(currentUser);
    renderLeaderboard();
    renderRecentWins(currentUser);
  }

  const resultMessage = didWin
    ? `🎉 You won $${payout.toFixed(2)}! Your new balance is $${newBalance.toFixed(2)}.`
    : `💥 No win this round. Your new balance is $${newBalance.toFixed(2)}.`;

  gameResultText.textContent = resultMessage;
  addLiveFeedMessage(`${currentUser.name} ${didWin ? 'won' : 'lost'} $${(didWin ? payout : bet).toFixed(2)} in ${currentGame.name}.`);
  renderLeaderboard();
  renderRecentWins(currentUser);
  gameResultBox.classList.remove('hidden');
});

async function initialize() {
  await checkBackendStatus();

  const user = getCurrentUser();
  if (user) {
    showDashboard(user);
  } else {
    showLogin();
  }

  cardNumber.addEventListener('input', (event) => {
    event.target.value = formatCardNumber(event.target.value);
  });
  enterLiveButton.addEventListener('click', () => {
    const liveGame = sampleGames[Math.floor(Math.random() * sampleGames.length)];
    currentGame = liveGame;
    openGameModal(liveGame);
  });

  if (window.angular) {
    angular.module('techApp', []).controller('TechController', function () {
      this.frameworks = ['HTML', 'CSS', 'JavaScript', 'Bootstrap', 'W3.CSS', 'React', 'AngularJS', 'jQuery', 'Node.js', 'Python', 'Django', 'SQL', 'PostgreSQL', 'MongoDB', 'Java'];
    });
  }

  if (window.React && window.ReactDOM) {
    const e = window.React.createElement;
    const TechCard = () =>
      e('div', { className: 'tech-card' },
        e('h4', null, 'Gen AI + data science ready'),
        e('p', null, 'This demo uses modern JavaScript and simulates multiple backend and frontend technologies in one interface.'),
        e('ul', null,
          ['Django', 'Flask', 'SQL', 'MongoDB', 'AWS', 'Python', 'Node.js'].map((item) => e('li', { key: item }, item))
        )
      );
    window.ReactDOM.render(e(TechCard), document.getElementById('reactTech'));
  }
}

initialize();
