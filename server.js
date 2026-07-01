const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const users = [];
const sampleGames = [
  { id: 'crypto-clash', name: 'Crypto Clash', entryFee: 15, multiplier: 3.5 },
  { id: 'laser-rush', name: 'Laser Rush', entryFee: 25, multiplier: 4 },
  { id: 'arena-spin', name: 'Arena Spin', entryFee: 10, multiplier: 2.8 },
];

function findUser(email) {
  return users.find((user) => user.email === email.toLowerCase());
}

function createHistoryEntry(type, title, details) {
  return { type, title, details, timestamp: new Date().toISOString() };
}

app.get('/api/status', (req, res) => {
  res.json({
    node: 'online',
    postgres: 'connected',
    mongodb: 'ready',
    ai: 'alive',
    message: 'Gaming center backend is running.',
  });
});

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (findUser(email)) {
    return res.status(409).json({ error: 'Email already registered.' });
  }

  const user = {
    name,
    email: email.toLowerCase(),
    password,
    balance: 0,
    history: [],
    lastBonusDate: null,
  };
  users.push(user);

  res.status(201).json({ message: 'User registered successfully.', user: { name: user.name, email: user.email, balance: user.balance } });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = findUser(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  res.json({ message: 'Login successful.', user: { name: user.name, email: user.email, balance: user.balance, history: user.history } });
});

app.post('/api/deposit', (req, res) => {
  const { email, amount } = req.body;
  const user = findUser(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Deposit amount must be a positive number.' });
  }

  user.balance += amount;
  user.history.unshift(createHistoryEntry('deposit', 'Deposit successful', `Added $${amount.toFixed(2)} to wallet.`));

  res.json({ message: 'Deposit completed.', balance: user.balance, history: user.history.slice(0, 10) });
});

app.post('/api/withdraw', (req, res) => {
  const { email, amount } = req.body;
  const user = findUser(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ error: 'Withdrawal amount must be a positive number.' });
  }
  if (user.balance < amount) {
    return res.status(400).json({ error: 'Insufficient funds.' });
  }

  user.balance -= amount;
  user.history.unshift(createHistoryEntry('withdraw', 'Withdrawal completed', `Removed $${amount.toFixed(2)} from wallet.`));

  res.json({ message: 'Withdrawal successful.', balance: user.balance, history: user.history.slice(0, 10) });
});

app.post('/api/play', (req, res) => {
  const { email, gameId, bet } = req.body;
  const user = findUser(email);
  const game = sampleGames.find((item) => item.id === gameId);
  if (!user || !game) {
    return res.status(404).json({ error: 'User or game not found.' });
  }
  if (typeof bet !== 'number' || bet < game.entryFee) {
    return res.status(400).json({ error: `Bet must be at least $${game.entryFee}.` });
  }
  if (user.balance < bet) {
    return res.status(400).json({ error: 'Insufficient balance.' });
  }

  const winChance = Math.min(0.85, 0.46 + bet / (bet + 200));
  const won = Math.random() < winChance;
  const payout = won ? bet * game.multiplier : 0;
  user.balance = user.balance - bet + payout;
  user.history.unshift(createHistoryEntry(won ? 'win' : 'loss', won ? 'Game win' : 'Game loss', won ? `Won $${payout.toFixed(2)} in ${game.name}.` : `Lost $${bet.toFixed(2)} in ${game.name}.`));

  res.json({
    message: won ? 'Win' : 'Loss',
    won,
    payout,
    balance: user.balance,
    history: user.history.slice(0, 10),
  });
});

app.listen(port, () => {
  console.log(`Lucy Gaming Center backend stub listening on http://localhost:${port}`);
  console.log('Simulated PostgreSQL and MongoDB services are available in-memory.');
});
