const ADMIN_PASSWORD = "alk0slav3";

let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let bets = JSON.parse(localStorage.getItem('bets')) || [];

document.addEventListener('DOMContentLoaded', function() {
  if (users.length === 0) {
    users = [
      { login: "test", password: "123", balance: 100, isAdmin: false }
    ];
    localStorage.setItem('users', JSON.stringify(users));
  }

  updateAuthStatus();

  if (document.getElementById('weekGrid')) initWeek();
  if (document.getElementById('usersList')) updateUsersList();
});

function loginUser() {
  const login = document.getElementById('userLogin').value;
  const password = document.getElementById('userPassword').value;
  const user = users.find(u => u.login === login && u.password === password);

  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    showMessage(`Добро пожаловать, ${login}! Баланс: ${user.balance} монет`);
    setTimeout(() => window.location.href = "index.html", 1000);
  } else {
    showMessage("Ошибка: неверный логин или пароль!");
  }
}

function loginAdmin() {
  const password = document.getElementById('adminPassword').value;
  
  if (password === ADMIN_PASSWORD) {
    currentUser = {
      login: "ADMIN",
      isAdmin: true,
      balance: 9999
    };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showMessage("Админ-доступ разрешён");
    setTimeout(() => window.location.href = "admin.html", 500);
  } else {
    showMessage("Неверный админ-пароль!");
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  window.location.href = "auth.html";
}

function addUser() {
  const login = document.getElementById('newLogin').value;
  const password = document.getElementById('newPassword').value;
  const balance = parseInt(document.getElementById('newBalance').value) || 0;

  if (!login || !password) {
    alert('Заполните все поля!');
    return;
  }

  if (users.some(u => u.login === login)) {
    alert('Пользователь уже существует!');
    return;
  }

  users.push({ login, password, balance, isAdmin: false });
  localStorage.setItem('users', JSON.stringify(users));
  updateUsersList();
  alert(`Пользователь ${login} добавлен с балансом ${balance} монет!`);
}

function updateUsersList() {
  const list = document.getElementById('usersList');
  if (!list) return;
  
  list.innerHTML = users.map(user => `
    <li>
      ${user.login} 
      (Баланс: ${user.balance} монет)
      <button onclick="editUser('${user.login}')">Изменить</button>
    </li>
  `).join('');
}

function initWeek() {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт'];
    const dates = getCurrentWeekDates();
    const weekGrid = document.getElementById('weekGrid');
    weekGrid.innerHTML = '';
    
    days.forEach((day, index) => {
      const dayCard = document.createElement('div');
      dayCard.className = 'day-card';
      dayCard.innerHTML = `
        <h3>${day} (${dates[index]})</h3>
        <p>Ставок: ${countBetsForDay(day)}</p>
      `;
      weekGrid.appendChild(dayCard);
    });
  }

function placeBet() {
  if (!currentUser) {
    alert('Сначала войдите!');
    window.location.href = 'auth.html';
    return;
  }

  const day = document.getElementById('daySelect').value;
  const betType = document.getElementById('betType').value;
  const amount = parseInt(document.getElementById('betAmount').value);

  if (!amount || amount < 1) {
    alert('Введите корректную сумму!');
    return;
  }

  if (amount > currentUser.balance) {
    alert('Недостаточно средств!');
    return;
  }

  // Обновляем баланс
  currentUser.balance -= amount;
  users = users.map(u => u.login === currentUser.login ? currentUser : u);
  localStorage.setItem('users', JSON.stringify(users));
  localStorage.setItem('currentUser', JSON.stringify(currentUser));

  // Добавляем ставку
  bets.push({ 
    user: currentUser.login, 
    day, 
    betType, 
    amount,
    date: new Date().toISOString()
  });
  localStorage.setItem('bets', JSON.stringify(bets));

  document.getElementById('result').innerHTML = `
    <img src="alkash-likes.jpg" width="200">
    <p>Ставка принята! Остаток: ${currentUser.balance} монет</p>
  `;
  
  updateAuthStatus();
}

function updateAuthStatus() {
  const authBtn = document.getElementById('authButton');
  const balanceSpan = document.getElementById('userBalance');
  
  if (authBtn) {
    authBtn.textContent = currentUser ? (currentUser.isAdmin ? "Админ" : "Выйти") : "Войти";
    authBtn.onclick = currentUser ? logout : () => window.location.href = "auth.html";
  }
  
  if (balanceSpan && currentUser && !currentUser.isAdmin) {
    balanceSpan.textContent = `Баланс: ${currentUser.balance} монет`;
  }
}

function showMessage(msg) {
  const msgEl = document.getElementById('auth-message') || document.getElementById('authMessage');
  if (msgEl) msgEl.textContent = msg;
}

function countBetsForDay(day) {
  return bets.filter(bet => bet.day === day.toLowerCase()).length;
}

function getCurrentWeekDates() {
    const now = new Date();
    const dates = [];

    for (let i = 0; i <= 4; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - now.getDay() + i);
      dates.push(date.getDate() + '.' + (date.getMonth() + 1));
    }
    
    return dates;
  }