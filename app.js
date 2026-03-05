const SUPABASE_URL = 'https://fxgkdefqdnedadjvdhiy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4Z2tkZWZxZG5lZGFkanZkaGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5ODA4NzcsImV4cCI6MjA4NDU1Njg3N30.rEnRU1rgEh_f0Rub9scyfN3ieb90kBSgLEkaXPhylmA';
const SETTINGS_PASSWORD = 'blacktap';

let allBooks = [];
let deleteMode = false;
let sortBy = 'name';
let showDetails = true;
let buyersList = [];

// Color gradient presets
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
  const selectedGradient = gradientThemes[randomIndex];
  document.body.style.background = selectedGradient;
}

function formatDate(dateString) {
  if (!dateString) return 'Not set';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

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
  
  const otherOption = document.createElement('option');
  otherOption.value = 'Other';
  otherOption.textContent = 'Other';
  dropdown.appendChild(otherOption);
  
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
  
  const otherOption = document.createElement('option');
  otherOption.value = 'Other';
  otherOption.textContent = 'Other';
  dropdown.appendChild(otherOption);
  
  dropdown.value = currentValue;
}

function updateBuyersDisplay() {
  const buyersList_elem = document.getElementById('buyersList');
  buyersList_elem.innerHTML = buyersList.map(buyer => `
    <div class='buyer-item'>
      <span>${buyer.name}</span>
      <button class='remove-btn' onclick='removeBuyer(${buyer.id}, "${buyer.name}")'>✕</button>
    </div>
  `).join('');
}

function unlockSettings() {
  const password = document.getElementById('settingsPassword').value;
  if (password === SETTINGS_PASSWORD) {
    document.querySelector('.settings-password').style.display = 'none';
    document.getElementById('settingsContent').style.display = 'block';
  } else {
    alert('Incorrect password');
    document.getElementById('settingsPassword').value = '';
  }
}

async function addBuyer() {
  const input = document.getElementById('newBuyerInput');
  const name = input.value.trim();
  
  if (!name) {
    alert('Please enter a name');
    return;
  }
  
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
        'Content-Type': 'application/json'
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
  if (confirm(`Remove "${name}" from the list?`)) {
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
}

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
    settingsSection.style.display = 'none';
  }
}

function toggleDetails() {
  showDetails = !showDetails;
  const detailsBtn = document.getElementById('detailsBtn');
  detailsBtn.textContent = showDetails ? '👁️ Hide Details' : '👁️ Show Details';
  displayBooks();
}

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
  const displayBooks = books.filter(b => !b.name.includes('Keep-alive'));
  
  if (sortBy === 'date') {
    return displayBooks.sort((a, b) => {
      const dateA = new Date(a.date_added || '1900-01-01');
      const dateB = new Date(b.date_added || '1900-01-01');
      return dateB - dateA;
    });
  }
  
  return displayBooks.sort((a, b) => a.name.localeCompare(b.name));
}

function displayBooks() {
  const list = document.getElementById('bookList');
  const displayBooks = sortBooks(allBooks);

  if (displayBooks.length === 0) {
    list.innerHTML = '<p class="empty-message">No books yet. Add one to get started!</p>';
    return;
  }

  if (showDetails) {
    list.innerHTML = displayBooks.map(book => `
      <div class='book-item'>
        <div class='book-details'>
          <p class='book-name'>${book.name}</p>
          <p class='book-info'><strong>Bought by:</strong> ${book.bought_by || 'Not set'}</p>
          <p class='book-info'><strong>Date bought:</strong> ${formatDate(book.date_added)}</p>
        </div>
        <button class='delete-btn' onclick='deleteBook(${book.id})' style='display: ${deleteMode ? "inline-block" : "none"};'>Delete</button>
      </div>
    `).join('');
  } else {
    list.innerHTML = displayBooks.map(book => `
      <div class='book-item book-item-simple'>
        <div class='book-details'>
          <p class='book-name'>${book.name}</p>
        </div>
        <button class='delete-btn' onclick='deleteBook(${book.id})' style='display: ${deleteMode ? "inline-block" : "none"};'>Delete</button>
      </div>
    `).join('');
  }
}

function toggleSortBy() {
  sortBy = sortBy === 'name' ? 'date' : 'name';
  const sortBtn = document.getElementById('sortBtn');
  sortBtn.textContent = sortBy === 'date' ? '📅 Sort by Name' : '📅 Sort by Date';
  displayBooks();
}

function toggleDeleteMode() {
  deleteMode = !deleteMode;
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
  
  if (!text.trim()) {
    alert('Please enter at least one book name');
    return;
  }

  const bookNames = text
    .split('\n')
    .map(name => name.trim())
    .filter(name => name.length > 0);

  if (bookNames.length === 0) {
    alert('Please enter at least one book name');
    return;
  }

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

  let added = 0;
  let skipped = 0;

  for (const bookName of bookNames) {
    const duplicate = allBooks.some(b => b.name.toLowerCase() === bookName.toLowerCase());
    if (duplicate) {
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
        body: JSON.stringify({ 
          name: bookName, 
          date_added: today,
          bought_by: boughtBy
        })
      });

      if (response.ok) {
        added++;
      }
    } catch (error) {
      console.error('Error adding book:', error);
    }
  }

  let message = `Added ${added} book${added !== 1 ? 's' : ''}`;
  if (skipped > 0) {
    message += ` (${skipped} already in list)`;
  }
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
  const results = allBooks.filter(b => 
    b.name.toLowerCase().includes(query) && !b.name.includes('Keep-alive')
  ).sort((a, b) => a.name.localeCompare(b.name));

  const resultsDiv = document.getElementById('searchResults');
  if (query === '') {
    resultsDiv.innerHTML = '';
    return;
  }

  if (results.length === 0) {
    resultsDiv.innerHTML = '<p class="empty-message">No books found</p>';
    return;
  }

  if (showDetails) {
    resultsDiv.innerHTML = '<div class="search-title">Search Results:</div>' + results.map(book => `
      <div class='book-item'>
        <div class='book-details'>
          <p class='book-name'>${book.name}</p>
          <p class='book-info'><strong>Bought by:</strong> ${book.bought_by || 'Not set'}</p>
          <p class='book-info'><strong>Date bought:</strong> ${formatDate(book.date_added)}</p>
        </div>
        <button class='delete-btn' onclick='deleteBook(${book.id})' style='display: ${deleteMode ? "inline-block" : "none"};'>Delete</button>
      </div>
    `).join('');
  } else {
    resultsDiv.innerHTML = '<div class="search-title">Search Results:</div>' + results.map(book => `
      <div class='book-item book-item-simple'>
        <div class='book-details'>
          <p class='book-name'>${book.name}</p>
        </div>
        <button class='delete-btn' onclick='deleteBook(${book.id})' style='display: ${deleteMode ? "inline-block" : "none"};'>Delete</button>
      </div>
    `).join('');
  }
}

async function addBook() {
  const input = document.getElementById('bookInput');
  const bookName = input.value.trim();
  
  if (!bookName) {
    alert('Please enter a book name');
    return;
  }

  const duplicate = allBooks.some(b => b.name.toLowerCase() === bookName.toLowerCase());
  if (duplicate) {
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
      body: JSON.stringify({ 
        name: bookName,
        date_added: today,
        bought_by: boughtBy
      })
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
  if (!confirm('Are you sure you want to delete this book?')) {
    return;
  }

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

// Initialize
async function init() {
  applyRandomGradient();
  await loadBuyers();
  await loadBooks();
}

init();
