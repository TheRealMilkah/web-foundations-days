const loadBtn = document.getElementById('load-users');
const filterInput = document.getElementById('filter-input');
const statusEl = document.getElementById('status');
const usersListEl = document.getElementById('users-list');
let allUsers = [];

function renderUsers(list) {
  usersListEl.innerHTML = '';
  if (list.length === 0) {
    if (allUsers.length > 0) {
      statusEl.textContent = 'No users match your filter.';
    }
    return;
  }
  list.forEach(user => {
    const li = document.createElement('li');
    const nameEl = document.createElement('strong');
    nameEl.textContent = user.name;
    const emailEl = document.createElement('div');
    emailEl.textContent = `Email: ${user.email}`;
    const cityEl = document.createElement('div');
    cityEl.textContent = `City: ${user.address.city}`;
    const companyEl = document.createElement('div');
    companyEl.textContent = `Company: ${user.company.name}`;
    li.appendChild(nameEl);
    li.appendChild(emailEl);
    li.appendChild(cityEl);
    li.appendChild(companyEl);
    usersListEl.appendChild(li);
  });
}

async function loadUsers() {
  const url = 'https://jsonplaceholder.typicode.com/users';
  try {
    loadBtn.disabled = true;
    statusEl.textContent = 'Loading users...';
    usersListEl.innerHTML = '';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const users = await response.json();
    allUsers = users;
    renderUsers(allUsers);
    statusEl.textContent = `Loaded ${allUsers.length} users successfully.`;
  } catch (error) {
    statusEl.textContent = `Error loading users: ${error.message}`;
  } finally {
    loadBtn.disabled = false;
  }
}

loadBtn.addEventListener('click', loadUsers);
filterInput.addEventListener('input', () => {
  const q = filterInput.value.toLowerCase().trim();
  if (!q) {
    renderUsers(allUsers);
    if (allUsers.length > 0) statusEl.textContent = `Loaded ${allUsers.length} users successfully.`;
    return;
  }
  const filtered = allUsers.filter(u => u.name.toLowerCase().includes(q));
  renderUsers(filtered);
  if (filtered.length > 0) {
    statusEl.textContent = `Showing ${filtered.length} of ${allUsers.length} users.`;
  }
});
