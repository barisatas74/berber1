const USERS = [
  { username: 'admin',   password: '1234',   role: 'superadmin', name: 'Mehmet Usta' },
  { username: 'berber1', password: 'pass123', role: 'staff',      name: 'Ali Usta'   },
];

const form       = document.getElementById('loginForm');
const alert_     = document.getElementById('alert');
const loginBtn   = document.getElementById('loginBtn');
const loginText  = document.getElementById('loginText');
const loginSpinner = document.getElementById('loginSpinner');
const togglePw   = document.getElementById('togglePw');
const pwInput    = document.getElementById('password');
const remember   = document.getElementById('remember');

// Pre-fill if remembered
const saved = localStorage.getItem('kb_remember');
if (saved) {
  document.getElementById('username').value = saved;
  remember.checked = true;
}

togglePw.addEventListener('click', () => {
  pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
});

function showAlert(msg) {
  alert_.textContent = msg;
  alert_.classList.add('show');
}

function hideAlert() { alert_.classList.remove('show'); }

form.addEventListener('submit', (e) => {
  e.preventDefault();
  hideAlert();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    showAlert('Lütfen kullanıcı adı ve şifre girin.');
    return;
  }

  // Loading state
  loginText.style.display = 'none';
  loginSpinner.style.display = 'block';
  loginBtn.disabled = true;

  setTimeout(() => {
    const user = USERS.find(u => u.username === username && u.password === password);

    if (user) {
      if (remember.checked) {
        localStorage.setItem('kb_remember', username);
      } else {
        localStorage.removeItem('kb_remember');
      }

      sessionStorage.setItem('kb_auth', JSON.stringify({
        username: user.username,
        name: user.name,
        role: user.role,
        loginTime: new Date().toISOString()
      }));

      window.location.href = 'admin.html';
    } else {
      loginText.style.display = 'block';
      loginSpinner.style.display = 'none';
      loginBtn.disabled = false;
      showAlert('Kullanıcı adı veya şifre hatalı.');
      document.getElementById('password').value = '';
      document.getElementById('password').focus();
    }
  }, 900);
});
