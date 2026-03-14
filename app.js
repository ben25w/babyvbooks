const SUPABASE_URL = 'https://fxgkdefqdnedadjvdhiy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4Z2tkZWZxZG5lZGFkanZkaGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5ODA4NzcsImV4cCI6MjA4NDU1Njg3N30.rEnRU1rgEh_f0Rub9scyfN3ieb90kBSgLEkaXPhylmA';
const SETTINGS_PASSWORD = 'blacktap';

let allBooks = [];
let deleteMode = false;
let editMode = false;
let sortBy = 'name';
let showDetails = false;
let buyersList = [];
let bannerMessages = [];
let bannerIndex = 0;
let bannerInterval = null;

// ── GRADIENTS ──────────────────────────────────────────────

const gradientThemes = [
  'linear-gradient(135deg, #8b4fb3 0%, #d994e6 50%, #f8d5f0 100%)',
  'linear-gradient(135deg, #6b2d9f 0%, #e91e63 50%, #fce4ec 100%)',
  'linear-gradient(135deg, #ff1493 0%, #8b4fb3 50%, #f5f5f5 100%)',
  'linear-gradient(135deg, #dda0dd 0%, #ffb6d9 50%, #ffffff 100%)',
  'linear-gradient(135deg, #4a148c 0%, #ff69b4 50%, #fff9e6 100%)',
  'linear-gradient(135deg, #9c27b0 0%, #f48fb1 50%, #fce4ec 100%)'
];

function applyRandomGradient() {
  const randomIndex = Math.floor(Math.random() * gradientThemes.length);
  document.body.style.background = gradientThemes[randomIndex];
}

// ── BANNER ─────────────────────────────────────────────────

async function loadBannerMessages() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/banner_messages?order=created_at.asc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    const data = await response.json();
    bannerMessages = data.map(m => ({ id: m.id, text: m.text }));
  } catch (error) {
    console.error('Error loading banner messages:', error);
    bannerMessages = [];
  }
  startBanner();
  updateBannerDisplay();
}

function startBanner() {
  const el = document.getElementById('bannerText');
  if (!el) return;

  if (bannerInterval) clearInterval(bannerInterval);

  if (bannerMessages.length === 0) {
    el.textContent = '🎉 Happy 100 Days! 🎉';
    return;
  }

  bannerIndex = 0;
  el.textContent = bannerMessages[0].text;

  if (bannerMessages.length === 1) return;

  bannerInterval = setInterval(() => {
    el.classList.add('banner-fade-out');
    setTimeout(() => {
      bannerIndex = (bannerIndex + 1) % bannerMessages.length;
      el.textContent = bannerMessages[bannerIndex].text;
      el.classList.remove('banner-fade-out');
      el.classList.add('banner-fade-in');
      setTimeout(() => el.classList.remove('banner-fade-in'), 600);
    }, 500);
  }, 3500);
}

function updateBannerDisplay() {
  const list = document.getElementById('bannerMessagesList');
  if (!list) return;
  if (bannerMessages.length === 0) {
    list.innerHTML = '<p class="empty-message" style="margin-bottom:12px;">No messages yet.</p>';
    return;
  }
  list.innerHTML = bannerMessages.map(msg => `
    <div class='buyer-item'>
      <span>${msg.text}</span>
      <button class='remove-btn' onclick='removeBannerMessage(${msg.id})'>✕</button>
    </div>
  `).join('');
}

async function addBannerMessage() {
  const input = document.getElementById('newBannerInput');
  const text = input.value.trim();
  if (!text) { alert('Please enter a message'); return; }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/banner_messages`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ text: text })
    });
    if (response.ok) {
      const newMsg = await response.json();
      bannerMessages.push({ id: newMsg[0].id, text: newMsg[0].text });
      input.value = '';
      startBanner();
      updateBannerDisplay();
    } else {
      alert('Error saving message');
    }
  } catch (error) {
    console.error('Error adding banner message:', error);
    alert('Error saving message');
  }
}

async function removeBannerMessage(id) {
  if (!confirm('Remove this banner message?')) return;
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/banner_messages?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    if (response.ok) {
      bannerMessages = bannerMessages.filter(m => m.id !== id);
      startBanner();
      updateBannerDisplay();
    } else {
      alert('Error removing message');
    }
  } catch (error) {
    console.error('Error removing banner message:', error);
    alert('Error removing message');
  }
}

// ── BUYERS ─────────────────────────────────────────────────

async function loadBuyers() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/buyers?order=name.asc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    const data = await response.json();
    buyersList = data.map(b => ({ id: b.id, name: b.name }));
    updateBuyersDropdown();
    updateBulkBuyersDropdown();
    updateBuyersDisplay();
  } catch (error) {
    console.error('Error loading buyers:', error);
  }
}

function updateBuyersDropdown() {
  const dropdown = document.getElementById('boughtByDropdown');
  const currentValue = dropdown.value;
  dropdown.innerHTML = '<option value="">Select someone...</option>';
  buyersList.forEach(buyer => {
    const option = document.createElement('option');
    option.value = buyer.name;
    option.textContent = buyer.name;
    dropdown.appendChild(option);
  });
  const other = document.createElement('option');
  other.value = 'Other';
  other.textContent = 'Other';
  dropdown.appendChild(other);
  dropdown.value = currentValue;
}

function updateBulkBuyersDropdown() {
  const dropdown = document.getElementById('bulkBoughtByDropdown');
  const currentValue = dropdown.value;
  dropdown.innerHTML = '<option value="">Select someone...</option>';
  buyersList.forEach(buyer => {
    const option = document.createElement('option');
    option.value = buyer.name;
    option.textContent = buyer.name;
    dropdown.appendChild(option);
  });
  const other = document.createElement('option');
  other.value = 'Other';
  other.textContent = 'Other';
  dropdown.appendChild(other);
  dropdown.value = currentValue;
}

function updateBuyersDisplay() {
  const el = document.getElementById('buyersList');
  el.innerHTML = buyersList.map(buyer => `
    <div class='buyer-item'>
      <span>${buyer.name}</span>
      <button class='remove-btn' onclick='removeBuyer(${buyer.id}, "${buyer.name}")'>✕</button>
    </div>
  `).join('');
}

async function addBuyer() {
  const input = document.getElementById('newBuyerInput');
  const name = input.value.trim();
  if (!name) { alert('Please enter a name'); return; }
  if (buyersList.some(b => b.name.toLowerCase() === name.toLowerCase())) {
    alert('This name already exists');
    input.value = '';
    return;
  }
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/buyers`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ name: name })
    });
    if (response.ok) {
      const newBuyer = await response.json();
      buyersList.push({ id: newBuyer[0].id, name: newBuyer[0].name });
      input.value = '';
      updateBuyersDropdown();
      updateBulkBuyersDropdown();
      updateBuyersDisplay();
    } else {
      alert('Error adding buyer');
    }
  } catch (error) {
    console.error('Error adding buyer:', error);
    alert('Error adding buyer');
  }
}

async function removeBuyer(id, name) {
  if (!confirm(`Remove "${name}" from the list?`)) return;
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/buyers?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    if (response.ok) {
      buyersList = buyersList.filter(b => b.id !== id);
      updateBuyersDropdown();
      updateBulkBuyersDropdown();
      updateBuyersDisplay();
    } else {
      alert('Error removing buyer');
    }
  } catch (error) {
    console.error('Error removing buyer:', error);
    alert('Error removing buyer');
  }
}

// ── SETTINGS / MANAGE ──────────────────────────────────────

function toggleSettings() {
  const settingsSection = document.getElementById('settingsSection');
  const isHidden = settingsSection.style.display === 'none';

  if (isHidden) {
    settingsSection.style.display = 'block';
    document.querySelector('.settings-password').style.display = 'flex';
    document.getElementById('settingsContent').style.display = 'none';
    document.getElementById('settingsPassword').value = '';
    document.getElementById('settingsPassword').focus();
  } else {
    // Closing manage — also turn off edit and delete modes
    settingsSection.style.display = 'none';
    lockManageMode();
  }
}

function unlockSettings() {
  const password = document.getElementById('settingsPassword').value;
  if (password === SETTINGS_PASSWORD) {
    document.querySelector('.settings-password').style.display = 'none';
    document.getElementById('settingsContent').style.display = 'block';
    // Show edit and delete buttons
    document.getElementById('editBtn').style.display = 'inline-block';
    document.getElementById('deleteBtn').style.display = 'inline-block';
  } else {
    alert('Incorrect password');
    document.getElementById('settingsPassword').value = '';
  }
}

function lockManageMode() {
  // Hide edit and delete buttons and turn off their modes
  document.getElementById('editBtn').style.display = 'none';
  document.getElementById('deleteBtn').style.display = 'none';

  if (editMode) {
    editMode = false;
    document.getElementById('editBtn').textContent = '✏️ Edit';
    document.getElementById('editBtn').style.background = '';
  }
  if (deleteMode) {
    deleteMode = false;
  }
  displayBooks();
}

// ── EDIT MODE ──────────────────────────────────────────────

function toggleEditMode() {
  editMode = !editMode;
  const editBtn = document.getElementById('editBtn');
  editBtn.textContent = editMode ? '✏️ Done Editing' : '✏️ Edit';
  editBtn.style.background = editMode
    ? 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)'
    : '';

  if (editMode && !showDetails) {
    showDetails = true;
    document.getElementById('detailsBtn').textContent = '👁️ Hide Details';
  }

  displayBooks();
}

function toggleDetails() {
  showDetails = !showDetails;
  document.getElementById('detailsBtn').textContent = showDetails ? '👁️ Hide Details' : '👁️ Show Details';
  displayBooks();
}

function buildEditRowHTML(book) {
  // Buyer dropdown
  let buyerOptions = '<option value="">Not set</option>';
  buyersList.forEach(buyer => {
    const selected = buyer.name === book.bought_by ? 'selected' : '';
    buyerOptions += `<option value="${buyer.name}" ${selected}>${buyer.name}</option>`;
  });
  const isOther = book.bought_by && !buyersList.some(b => b.name === book.bought_by);
  buyerOptions += `<option value="Other" ${isOther ? 'selected' : ''}>Other...</option>`;

  // Date value — stored as YYYY-MM-DD which is exactly what input[type=date] needs
  const dateValue = book.date_added || '';

  return `
    <div class="edit-row">
      <div class="edit-field">
        <label class="edit-label">Bought by:</label>
        <div class="edit-buyer-inputs">
          <select class="edit-buyer-select" id="editSelect_${book.id}" onchange="handleEditSelectChange(${book.id})">
            ${buyerOptions}
          </select>
          <input type="text" class="edit-buyer-custom" id="editCustom_${book.id}"
            placeholder="Enter name..."
            value="${isOther ? book.bought_by || '' : ''}"
            style="display: ${isOther ? 'block' : 'none'};" />
        </div>
      </div>
      <div class="edit-field">
        <label class="edit-label">Date bought:</label>
        <input type="date" class="edit-date-input" id="editDate_${book.id}" value="${dateValue}" />
      </div>
      <button class="save-edit-btn" onclick="saveBookEdit(${book.id})">💾 Save</button>
    </div>
  `;
}

function handleEditSelectChange(bookId) {
  const select = document.getElementById(`editSelect_${bookId}`);
  const customInput = document.getElementById(`editCustom_${bookId}`);
  if (select.value === 'Other') {
    customInput.style.display = 'block';
    customInput.focus();
  } else {
    customInput.style.display = 'none';
    customInput.value = '';
  }
}

async function saveBookEdit(bookId) {
  const select = document.getElementById(`editSelect_${bookId}`);
  const customInput = document.getElementById(`editCustom_${bookId}`);
  const dateInput = document.getElementById(`editDate_${bookId}`);

  let boughtBy = null;
  if (select.value === 'Other') {
    boughtBy = customInput.value.trim() || null;
  } else if (select.value !== '') {
    boughtBy = select.value;
  }

  const dateValue = dateInput.value || null;

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/books?id=eq.${bookId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ bought_by: boughtBy, date_added: dateValue })
    });

    if (response.ok) {
      const book = allBooks.find(b => b.id === bookId);
      if (book) {
        book.bought_by = boughtBy;
        book.date_added = dateValue;
      }
      displayBooks();
    } else {
      alert('Error saving — please try again');
    }
  } catch (error) {
    console.error('Error saving book edit:', error);
    alert('Error saving');
  }
}

// ── DISPLAY ────────────────────────────────────────────────

async function loadBooks() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/books?order=name.asc`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    allBooks = await response.json();
    displayBooks();
  } catch (error) {
    console.error('Error loading books:', error);
  }
}

function sortBooks(books) {
  const filtered = books.filter(b => !b.name.includes('Keep-alive'));
  if (sortBy === 'date') {
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date_added || '1900-01-01');
      const dateB = new Date(b.date_added || '1900-01-01');
      return dateB - dateA;
    });
  }
  return filtered.sort((a, b) => a.name.localeCompare(b.name));
}

function formatDate(dateString) {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function displayBooks() {
  const list = document.getElementById('bookList');
  const books = sortBooks(allBooks);

  if (books.length === 0) {
    list.innerHTML = '<p class="empty-message">No books yet. Add one to get started!</p>';
    return;
  }

  list.innerHTML = books.map(book => {
    const deleteButton = `<button class='delete-btn' onclick='deleteBook(${book.id})'>Delete</button>`;

    if (editMode) {
      return `
        <div class='book-item'>
          <div class='book-details'>
            <p class='book-name'>${book.name}</p>
            <p class='book-info'><strong>Bought by:</strong> ${book.bought_by || 'Not set'}</p>
            <p class='book-info'><strong>Date bought:</strong> ${formatDate(book.date_added)}</p>
            ${buildEditRowHTML(book)}
          </div>
        </div>
      `;
    }

    if (deleteMode) {
      return `
        <div class='book-item ${showDetails ? '' : 'book-item-simple'}'>
          <div class='book-details'>
            <p class='book-name'>${book.name}</p>
            ${showDetails ? `
              <p class='book-info'><strong>Bought by:</strong> ${book.bought_by || 'Not set'}</p>
              <p class='book-info'><strong>Date bought:</strong> ${formatDate(book.date_added)}</p>
            ` : ''}
          </div>
          ${deleteButton}
        </div>
      `;
    }

    if (showDetails) {
      return `
        <div class='book-item'>
          <div class='book-details'>
            <p class='book-name'>${book.name}</p>
            <p class='book-info'><strong>Bought by:</strong> ${book.bought_by || 'Not set'}</p>
            <p class='book-info'><strong>Date bought:</strong> ${formatDate(book.date_added)}</p>
          </div>
        </div>
      `;
    }

    return `
      <div class='book-item book-item-simple'>
        <div class='book-details'>
          <p class='book-name'>${book.name}</p>
        </div>
      </div>
    `;
  }).join('');
}

function toggleSortBy() {
  sortBy = sortBy === 'name' ? 'date' : 'name';
  document.getElementById('sortBtn').textContent = sortBy === 'date' ? '📅 Sort by Name' : '📅 Sort by Date';
  displayBooks();
}

function toggleDeleteMode() {
  deleteMode = !deleteMode;
  const deleteBtn = document.getElementById('deleteBtn');
  deleteBtn.textContent = deleteMode ? '🗑️ Done Deleting' : '🗑️ Delete';
  deleteBtn.style.background = deleteMode
    ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
    : '';
  displayBooks();
}

function toggleSearch() {
  const searchSection = document.getElementById('searchSection');
  const isHidden = searchSection.style.display === 'none';
  if (isHidden) {
    searchSection.style.display = 'block';
    document.getElementById('searchInput').focus();
  } else {
    searchSection.style.display = 'none';
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('searchInput').value = '';
  }
}

function toggleBulkMode() {
  const bulkSection = document.getElementById('bulkSection');
  const bulkButtons = document.querySelector('.bulk-buttons');
  const isHidden = bulkSection.style.display === 'none';
  if (isHidden) {
    bulkSection.style.display = 'block';
    bulkButtons.classList.add('show');
    document.getElementById('bulkBooksTextarea').focus();
  } else {
    bulkSection.style.display = 'none';
    bulkButtons.classList.remove('show');
    document.getElementById('bulkBooksTextarea').value = '';
    document.getElementById('bulkBoughtByDropdown').value = '';
    document.getElementById('bulkCustomBoughtByInput').value = '';
    document.getElementById('bulkCustomBoughtByInput').style.display = 'none';
  }
}

function handleBoughtByChange() {
  const dropdown = document.getElementById('boughtByDropdown');
  const customInput = document.getElementById('customBoughtByInput');
  if (dropdown.value === 'Other') {
    customInput.style.display = 'block';
    customInput.focus();
  } else {
    customInput.style.display = 'none';
    customInput.value = '';
  }
}

function handleBulkBoughtByChange() {
  const dropdown = document.getElementById('bulkBoughtByDropdown');
  const customInput = document.getElementById('bulkCustomBoughtByInput');
  if (dropdown.value === 'Other') {
    customInput.style.display = 'block';
    customInput.focus();
  } else {
    customInput.style.display = 'none';
    customInput.value = '';
  }
}

async function addBulkBooks() {
  const textarea = document.getElementById('bulkBooksTextarea');
  const text = textarea.value;
  if (!text.trim()) { alert('Please enter at least one book name'); return; }

  const bookNames = text.split('\n').map(n => n.trim()).filter(n => n.length > 0);
  if (bookNames.length === 0) { alert('Please enter at least one book name'); return; }

  const dropdown = document.getElementById('bulkBoughtByDropdown');
  const customInput = document.getElementById('bulkCustomBoughtByInput');
  let boughtBy = null;
  if (dropdown && dropdown.value) {
    if (dropdown.value === 'Other' && customInput.value.trim()) {
      boughtBy = customInput.value.trim();
    } else if (dropdown.value !== 'Other') {
      boughtBy = dropdown.value;
    }
  }

  let added = 0, skipped = 0;
  for (const bookName of bookNames) {
    if (allBooks.some(b => b.name.toLowerCase() === bookName.toLowerCase())) {
      skipped++;
      continue;
    }
    const today = new Date().toISOString().split('T')[0];
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/books`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: bookName, date_added: today, bought_by: boughtBy })
      });
      if (response.ok) added++;
    } catch (error) {
      console.error('Error adding book:', error);
    }
  }

  let message = `Added ${added} book${added !== 1 ? 's' : ''}`;
  if (skipped > 0) message += ` (${skipped} already in list)`;
  alert(message);

  textarea.value = '';
  document.getElementById('bulkBoughtByDropdown').value = '';
  document.getElementById('bulkCustomBoughtByInput').value = '';
  document.getElementById('bulkCustomBoughtByInput').style.display = 'none';
  toggleBulkMode();
  loadBooks();
}

function searchBooks() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const results = allBooks
    .filter(b => b.name.toLowerCase().includes(query) && !b.name.includes('Keep-alive'))
    .sort((a, b) => a.name.localeCompare(b.name));

  const resultsDiv = document.getElementById('searchResults');
  if (query === '') { resultsDiv.innerHTML = ''; return; }
  if (results.length === 0) {
    resultsDiv.innerHTML = '<p class="empty-message">No books found</p>';
    return;
  }

  resultsDiv.innerHTML = '<div class="search-title">Search Results:</div>' + results.map(book => `
    <div class='book-item'>
      <div class='book-details'>
        <p class='book-name'>${book.name}</p>
        <p class='book-info'><strong>Bought by:</strong> ${book.bought_by || 'Not set'}</p>
        <p class='book-info'><strong>Date bought:</strong> ${formatDate(book.date_added)}</p>
      </div>
    </div>
  `).join('');
}

async function addBook() {
  const input = document.getElementById('bookInput');
  const bookName = input.value.trim();
  if (!bookName) { alert('Please enter a book name'); return; }

  if (allBooks.some(b => b.name.toLowerCase() === bookName.toLowerCase())) {
    alert('You already have this book!');
    input.value = '';
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const dropdown = document.getElementById('boughtByDropdown');
  const customInput = document.getElementById('customBoughtByInput');
  let boughtBy = null;
  if (dropdown && dropdown.value) {
    if (dropdown.value === 'Other' && customInput.value.trim()) {
      boughtBy = customInput.value.trim();
    } else if (dropdown.value !== 'Other') {
      boughtBy = dropdown.value;
    }
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/books`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: bookName, date_added: today, bought_by: boughtBy })
    });
    if (response.ok) {
      input.value = '';
      document.getElementById('boughtByDropdown').value = '';
      document.getElementById('customBoughtByInput').value = '';
      document.getElementById('customBoughtByInput').style.display = 'none';
      loadBooks();
    } else {
      alert('Error adding book. Check your Supabase details.');
    }
  } catch (error) {
    console.error('Error adding book:', error);
    alert('Error adding book');
  }
}

async function deleteBook(id) {
  if (!confirm('Are you sure you want to delete this book?')) return;
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/books?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    if (response.ok) {
      loadBooks();
    } else {
      alert('Error deleting book');
    }
  } catch (error) {
    console.error('Error deleting book:', error);
    alert('Error deleting book');
  }
}

// ── INIT ───────────────────────────────────────────────────

async function init() {
  applyRandomGradient();
  await loadBuyers();
  await loadBannerMessages();
  await loadBooks();
}

init();
