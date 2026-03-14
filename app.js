const SUPABASE_URL = 'https://fxgkdefqdnedadjvdhiy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4Z2tkZWZxZG5lZGFkanZkaGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5ODA4NzcsImV4cCI6MjA4NDU1Njg3N30.rEnRU1rgEh_f0Rub9scyfN3ieb90kBSgLEkaXPhylmA';
const SETTINGS_PASSWORD = 'blacktap';

let allBooks = [];
let editMode = false;
let sortBy = 'name';
let showDetails = false;
let buyersList = [];
let bannerMessages = [];

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
  const i = Math.floor(Math.random() * gradientThemes.length);
  document.body.style.background = gradientThemes[i];
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
    bannerMessages = data.map(function(m) { return { id: m.id, text: m.text }; });
  } catch (error) {
    console.error('Error loading banner messages:', error);
    bannerMessages = [];
  }
  showBanner();
  updateBannerDisplay();
}

function showBanner() {
  var el = document.getElementById('bannerText');
  if (!el) return;
  if (bannerMessages.length === 0) {
    el.textContent = '🎉 Happy 100 Days! 🎉';
    return;
  }
  var i = Math.floor(Math.random() * bannerMessages.length);
  el.textContent = bannerMessages[i].text;
}

function updateBannerDisplay() {
  var list = document.getElementById('bannerMessagesList');
  if (!list) return;
  if (bannerMessages.length === 0) {
    list.innerHTML = '<p class="empty-message">No messages yet.</p>';
    return;
  }
  list.innerHTML = bannerMessages.map(function(msg) {
    return '<div class="buyer-item"><span>' + msg.text + '</span><button class="remove-btn" onclick="removeBannerMessage(' + msg.id + ')">✕</button></div>';
  }).join('');
}

async function addBannerMessage() {
  var input = document.getElementById('newBannerInput');
  var text = input.value.trim();
  if (!text) { alert('Please enter a message'); return; }
  try {
    var response = await fetch(SUPABASE_URL + '/rest/v1/banner_messages', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ text: text })
    });
    if (response.ok) {
      var newMsg = await response.json();
      bannerMessages.push({ id: newMsg[0].id, text: newMsg[0].text });
      input.value = '';
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
    var response = await fetch(SUPABASE_URL + '/rest/v1/banner_messages?id=eq.' + id, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    });
    if (response.ok) {
      bannerMessages = bannerMessages.filter(function(m) { return m.id !== id; });
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
    var response = await fetch(SUPABASE_URL + '/rest/v1/buyers?order=name.asc', {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    });
    var data = await response.json();
    buyersList = data.map(function(b) { return { id: b.id, name: b.name }; });
    updateAllBuyerDropdowns();
    updateBuyersDisplay();
  } catch (error) {
    console.error('Error loading buyers:', error);
  }
}

function buildBuyerOptions() {
  var html = '<option value="">Select someone...</option>';
  buyersList.forEach(function(buyer) {
    html += '<option value="' + buyer.name + '">' + buyer.name + '</option>';
  });
  html += '<option value="Other">Other...</option>';
  return html;
}

function updateAllBuyerDropdowns() {
  var ids = ['modalBoughtByDropdown', 'modalBulkDropdown'];
  ids.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = buildBuyerOptions();
  });
}

function updateBuyersDisplay() {
  var el = document.getElementById('buyersList');
  if (!el) return;
  if (buyersList.length === 0) {
    el.innerHTML = '<p class="empty-message">No buyers yet.</p>';
    return;
  }
  el.innerHTML = buyersList.map(function(buyer) {
    return '<div class="buyer-item"><span>' + buyer.name + '</span><button class="remove-btn" onclick="removeBuyer(' + buyer.id + ', \'' + buyer.name + '\')">✕</button></div>';
  }).join('');
}

async function addBuyer() {
  var input = document.getElementById('newBuyerInput');
  var name = input.value.trim();
  if (!name) { alert('Please enter a name'); return; }
  if (buyersList.some(function(b) { return b.name.toLowerCase() === name.toLowerCase(); })) {
    alert('This name already exists');
    input.value = '';
    return;
  }
  try {
    var response = await fetch(SUPABASE_URL + '/rest/v1/buyers', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ name: name })
    });
    if (response.ok) {
      var newBuyer = await response.json();
      buyersList.push({ id: newBuyer[0].id, name: newBuyer[0].name });
      input.value = '';
      updateAllBuyerDropdowns();
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
  if (!confirm('Remove "' + name + '" from the list?')) return;
  try {
    var response = await fetch(SUPABASE_URL + '/rest/v1/buyers?id=eq.' + id, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    });
    if (response.ok) {
      buyersList = buyersList.filter(function(b) { return b.id !== id; });
      updateAllBuyerDropdowns();
      updateBuyersDisplay();
    } else {
      alert('Error removing buyer');
    }
  } catch (error) {
    console.error('Error removing buyer:', error);
    alert('Error removing buyer');
  }
}

// ── SETTINGS ───────────────────────────────────────────────

function toggleSettings() {
  var section = document.getElementById('settingsSection');
  var isHidden = section.style.display === 'none';
  if (isHidden) {
    section.style.display = 'block';
    document.getElementById('settingsPasswordRow').style.display = 'flex';
    document.getElementById('settingsContent').style.display = 'none';
    document.getElementById('settingsPassword').value = '';
    document.getElementById('settingsPassword').focus();
  } else {
    section.style.display = 'none';
    if (editMode) {
      editMode = false;
      updateEditBtn();
      displayBooks();
    }
  }
}

function unlockSettings() {
  var password = document.getElementById('settingsPassword').value;
  if (password === SETTINGS_PASSWORD) {
    document.getElementById('settingsPasswordRow').style.display = 'none';
    document.getElementById('settingsContent').style.display = 'block';
  } else {
    alert('Incorrect password');
    document.getElementById('settingsPassword').value = '';
  }
}

// ── EDIT MODE ──────────────────────────────────────────────

function toggleEditMode() {
  editMode = !editMode;
  updateEditBtn();
  if (editMode && !showDetails) {
    showDetails = true;
    document.getElementById('detailsBtn').textContent = '👁️ Hide Details';
  }
  displayBooks();
}

function updateEditBtn() {
  var btn = document.getElementById('editModeBtn');
  if (!btn) return;
  if (editMode) {
    btn.textContent = '✓ Done Editing';
    btn.style.background = 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)';
  } else {
    btn.textContent = '✏️ Edit Current Books';
    btn.style.background = '';
  }
}

function buildEditRowHTML(book) {
  var buyerOptions = '<option value="">Not set</option>';
  buyersList.forEach(function(buyer) {
    var sel = buyer.name === book.bought_by ? 'selected' : '';
    buyerOptions += '<option value="' + buyer.name + '" ' + sel + '>' + buyer.name + '</option>';
  });
  var isOther = book.bought_by && !buyersList.some(function(b) { return b.name === book.bought_by; });
  buyerOptions += '<option value="Other"' + (isOther ? ' selected' : '') + '>Other...</option>';
  var dateValue = book.date_added || '';
  var customVal = isOther ? (book.bought_by || '') : '';
  var customDisplay = isOther ? 'block' : 'none';

  return '<div class="edit-row">' +
    '<div class="edit-field">' +
      '<label class="edit-label">Bought by:</label>' +
      '<select class="edit-buyer-select" id="editSelect_' + book.id + '" onchange="handleEditSelectChange(' + book.id + ')">' + buyerOptions + '</select>' +
      '<input type="text" class="edit-buyer-custom" id="editCustom_' + book.id + '" placeholder="Enter name..." value="' + customVal + '" style="display:' + customDisplay + '; margin-top:8px;" />' +
    '</div>' +
    '<div class="edit-field">' +
      '<label class="edit-label">Date bought:</label>' +
      '<input type="date" class="edit-date-input" id="editDate_' + book.id + '" value="' + dateValue + '" />' +
    '</div>' +
    '<div class="edit-actions">' +
      '<button class="save-edit-btn" onclick="saveBookEdit(' + book.id + ')">💾 Save</button>' +
      '<button class="delete-inline-btn" onclick="deleteBook(' + book.id + ')">🗑️ Delete</button>' +
    '</div>' +
  '</div>';
}

function handleEditSelectChange(bookId) {
  var select = document.getElementById('editSelect_' + bookId);
  var custom = document.getElementById('editCustom_' + bookId);
  if (select.value === 'Other') {
    custom.style.display = 'block';
    custom.focus();
  } else {
    custom.style.display = 'none';
    custom.value = '';
  }
}

async function saveBookEdit(bookId) {
  var select = document.getElementById('editSelect_' + bookId);
  var custom = document.getElementById('editCustom_' + bookId);
  var dateInput = document.getElementById('editDate_' + bookId);
  var boughtBy = null;
  if (select.value === 'Other') {
    boughtBy = custom.value.trim() || null;
  } else if (select.value !== '') {
    boughtBy = select.value;
  }
  var dateValue = dateInput.value || null;
  try {
    var response = await fetch(SUPABASE_URL + '/rest/v1/books?id=eq.' + bookId, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ bought_by: boughtBy, date_added: dateValue })
    });
    if (response.ok) {
      var book = allBooks.find(function(b) { return b.id === bookId; });
      if (book) { book.bought_by = boughtBy; book.date_added = dateValue; }
      displayBooks();
    } else {
      alert('Error saving — please try again');
    }
  } catch (error) {
    console.error('Error saving book edit:', error);
    alert('Error saving');
  }
}

// ── BOOKS ──────────────────────────────────────────────────

async function loadBooks() {
  try {
    var response = await fetch(SUPABASE_URL + '/rest/v1/books?order=name.asc', {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    });
    allBooks = await response.json();
    displayBooks();
  } catch (error) {
    console.error('Error loading books:', error);
  }
}

function sortBooks(books) {
  var filtered = books.filter(function(b) { return !b.name.includes('Keep-alive'); });
  if (sortBy === 'date') {
    return filtered.sort(function(a, b) {
      return new Date(b.date_added || '1900-01-01') - new Date(a.date_added || '1900-01-01');
    });
  }
  return filtered.sort(function(a, b) { return a.name.localeCompare(b.name); });
}

function formatDate(dateString) {
  if (!dateString) return 'Not set';
  var date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function displayBooks() {
  var list = document.getElementById('bookList');
  var books = sortBooks(allBooks);

  if (books.length === 0) {
    list.innerHTML = '<p class="empty-message">No books yet. Add one to get started!</p>';
    return;
  }

  list.innerHTML = books.map(function(book) {

    if (editMode) {
      return '<div class="book-item">' +
        '<div class="book-details">' +
          '<p class="book-name">' + book.name + '</p>' +
          '<p class="book-info"><strong>Bought by:</strong> ' + (book.bought_by || 'Not set') + '</p>' +
          '<p class="book-info"><strong>Date bought:</strong> ' + formatDate(book.date_added) + '</p>' +
          buildEditRowHTML(book) +
        '</div>' +
      '</div>';
    }

    if (showDetails) {
      return '<div class="book-item">' +
        '<div class="book-details">' +
          '<p class="book-name">' + book.name + '</p>' +
          '<p class="book-info"><strong>Bought by:</strong> ' + (book.bought_by || 'Not set') + '</p>' +
          '<p class="book-info"><strong>Date bought:</strong> ' + formatDate(book.date_added) + '</p>' +
        '</div>' +
      '</div>';
    }

    return '<div class="book-item book-item-simple">' +
      '<div class="book-details">' +
        '<p class="book-name">' + book.name + '</p>' +
      '</div>' +
    '</div>';

  }).join('');
}

function toggleSortBy() {
  sortBy = sortBy === 'name' ? 'date' : 'name';
  document.getElementById('sortBtn').textContent = sortBy === 'date' ? '📅 Sort by Name' : '📅 Sort by Date';
  displayBooks();
}

function toggleDetails() {
  showDetails = !showDetails;
  document.getElementById('detailsBtn').textContent = showDetails ? '👁️ Hide Details' : '👁️ Show Details';
  displayBooks();
}

function toggleSearch() {
  var section = document.getElementById('searchSection');
  var isHidden = section.style.display === 'none';
  if (isHidden) {
    section.style.display = 'block';
    document.getElementById('searchInput').focus();
  } else {
    section.style.display = 'none';
    document.getElementById('searchResults').innerHTML = '';
    document.getElementById('searchInput').value = '';
  }
}

function searchBooks() {
  var query = document.getElementById('searchInput').value.toLowerCase();
  var results = allBooks
    .filter(function(b) { return b.name.toLowerCase().includes(query) && !b.name.includes('Keep-alive'); })
    .sort(function(a, b) { return a.name.localeCompare(b.name); });

  var resultsDiv = document.getElementById('searchResults');
  if (query === '') { resultsDiv.innerHTML = ''; return; }
  if (results.length === 0) { resultsDiv.innerHTML = '<p class="empty-message">No books found</p>'; return; }

  resultsDiv.innerHTML = '<div class="search-title">Search Results:</div>' + results.map(function(book) {
    return '<div class="book-item">' +
      '<div class="book-details">' +
        '<p class="book-name">' + book.name + '</p>' +
        '<p class="book-info"><strong>Bought by:</strong> ' + (book.bought_by || 'Not set') + '</p>' +
        '<p class="book-info"><strong>Date bought:</strong> ' + formatDate(book.date_added) + '</p>' +
      '</div>' +
    '</div>';
  }).join('');
}

// ── ADD BOOK MODAL ─────────────────────────────────────────

function openAddModal() {
  document.getElementById('addModal').style.display = 'flex';
  resetAddForm();
  setTimeout(function() {
    document.getElementById('modalBookInput').focus();
  }, 100);
}

function closeAddModal() {
  document.getElementById('addModal').style.display = 'none';
  resetAddForm();
}

function resetAddForm() {
  document.getElementById('addSuccessState').style.display = 'none';
  document.getElementById('addFormState').style.display = 'block';
  document.getElementById('modalBookInput').value = '';
  document.getElementById('modalBoughtByDropdown').value = '';
  document.getElementById('modalCustomBoughtBy').value = '';
  document.getElementById('modalCustomBoughtBy').style.display = 'none';
  document.getElementById('modalBulkTextarea').value = '';
  document.getElementById('modalBulkDropdown').value = '';
  document.getElementById('modalBulkCustom').value = '';
  document.getElementById('modalBulkCustom').style.display = 'none';
  document.getElementById('modalBulkSection').style.display = 'none';
}

function showAddSuccess(message) {
  document.getElementById('addFormState').style.display = 'none';
  document.getElementById('addSuccessState').style.display = 'block';
  document.getElementById('successMessage').innerHTML = message;
}

function toggleModalBulk() {
  var bulk = document.getElementById('modalBulkSection');
  bulk.style.display = bulk.style.display === 'none' ? 'block' : 'none';
}

function handleModalBoughtByChange() {
  var dropdown = document.getElementById('modalBoughtByDropdown');
  var custom = document.getElementById('modalCustomBoughtBy');
  if (dropdown.value === 'Other') {
    custom.style.display = 'block';
    custom.focus();
  } else {
    custom.style.display = 'none';
    custom.value = '';
  }
}

function handleModalBulkBoughtByChange() {
  var dropdown = document.getElementById('modalBulkDropdown');
  var custom = document.getElementById('modalBulkCustom');
  if (dropdown.value === 'Other') {
    custom.style.display = 'block';
    custom.focus();
  } else {
    custom.style.display = 'none';
    custom.value = '';
  }
}

async function addBook() {
  var input = document.getElementById('modalBookInput');
  var bookName = input.value.trim();
  if (!bookName) { alert('Please enter a book name'); return; }
  if (allBooks.some(function(b) { return b.name.toLowerCase() === bookName.toLowerCase(); })) {
    alert('You already have this book!');
    input.value = '';
    return;
  }
  var today = new Date().toISOString().split('T')[0];
  var dropdown = document.getElementById('modalBoughtByDropdown');
  var custom = document.getElementById('modalCustomBoughtBy');
  var boughtBy = null;
  if (dropdown.value === 'Other') {
    boughtBy = custom.value.trim() || null;
  } else if (dropdown.value) {
    boughtBy = dropdown.value;
  }
  try {
    var response = await fetch(SUPABASE_URL + '/rest/v1/books', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: bookName, date_added: today, bought_by: boughtBy })
    });
    if (response.ok) {
      await loadBooks();
      showAddSuccess('✅ <strong>"' + bookName + '"</strong> added!');
    } else {
      alert('Error adding book.');
    }
  } catch (error) {
    console.error('Error adding book:', error);
    alert('Error adding book');
  }
}

async function addBulkBooks() {
  var textarea = document.getElementById('modalBulkTextarea');
  var text = textarea.value;
  if (!text.trim()) { alert('Please enter at least one book name'); return; }
  var bookNames = text.split('\n').map(function(n) { return n.trim(); }).filter(function(n) { return n.length > 0; });
  if (bookNames.length === 0) { alert('Please enter at least one book name'); return; }
  var dropdown = document.getElementById('modalBulkDropdown');
  var custom = document.getElementById('modalBulkCustom');
  var boughtBy = null;
  if (dropdown.value === 'Other') {
    boughtBy = custom.value.trim() || null;
  } else if (dropdown.value) {
    boughtBy = dropdown.value;
  }
  var added = 0;
  var skipped = 0;
  var today = new Date().toISOString().split('T')[0];
  for (var i = 0; i < bookNames.length; i++) {
    var bookName = bookNames[i];
    if (allBooks.some(function(b) { return b.name.toLowerCase() === bookName.toLowerCase(); })) {
      skipped++;
      continue;
    }
    try {
      var response = await fetch(SUPABASE_URL + '/rest/v1/books', {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': 'Bearer ' + SUPABASE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: bookName, date_added: today, bought_by: boughtBy })
      });
      if (response.ok) added++;
    } catch (error) {
      console.error('Error adding book:', error);
    }
  }
  await loadBooks();
  var msg = '✅ <strong>' + added + ' book' + (added !== 1 ? 's' : '') + ' added!</strong>';
  if (skipped > 0) msg += '<br><span style="font-size:0.9em;color:#888;">' + skipped + ' already in list</span>';
  showAddSuccess(msg);
}

async function deleteBook(id) {
  if (!confirm('Are you sure you want to delete this book?')) return;
  try {
    var response = await fetch(SUPABASE_URL + '/rest/v1/books?id=eq.' + id, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
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
