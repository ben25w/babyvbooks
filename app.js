const SUPABASE_URL = 'https://fxgkdefqdnedadjvdhiy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4Z2tkZWZxZG5lZGFkanZkaGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5ODA4NzcsImV4cCI6MjA4NDU1Njg3N30.rEnRU1rgEh_f0Rub9scyfN3ieb90kBSgLEkaXPhylmA';

let allBooks = [];
let deleteMode = false;

async function loadBooks() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/books?order=name.asc`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });
  allBooks = await response.json();
  displayBooks();
}

function displayBooks() {
  const list = document.getElementById('bookList');
  
  const displayBooks = allBooks.filter(b => !b.name.includes('Keep-alive'));
  displayBooks.sort((a, b) => a.name.localeCompare(b.name));

  if (displayBooks.length === 0) {
    list.innerHTML = '<p class="empty-message">No books yet. Add one to get started!</p>';
    return;
  }

  list.innerHTML = displayBooks.map(book => `
    <div class='book-item'>
      <p>${book.name}</p>
      <button class='delete-btn' onclick='deleteBook(${book.id})' style='display: ${deleteMode ? "inline-block" : "none"};'>Delete</button>
    </div>
  `).join('');
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

  let added = 0;
  let skipped = 0;

  for (const bookName of bookNames) {
    const duplicate = allBooks.some(b => b.name.toLowerCase() === bookName.toLowerCase());
    if (duplicate) {
      skipped++;
      continue;
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/books`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: bookName })
    });

    if (response.ok) {
      added++;
    }
  }

  let message = `Added ${added} book${added !== 1 ? 's' : ''}`;
  if (skipped > 0) {
    message += ` (${skipped} already in list)`;
  }
  alert(message);

  textarea.value = '';
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

  resultsDiv.innerHTML = '<div class="search-title">Search Results:</div>' + results.map(book => `
    <div class='book-item'>
      <p>${book.name}</p>
      <button class='delete-btn' onclick='deleteBook(${book.id})' style='display: ${deleteMode ? "inline-block" : "none"};'>Delete</button>
    </div>
  `).join('');
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

  const response = await fetch(`${SUPABASE_URL}/rest/v1/books`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: bookName })
  });

  if (response.ok) {
    input.value = '';
    loadBooks();
  } else {
    alert('Error adding book. Check your Supabase details.');
  }
}

async function deleteBook(id) {
  if (!confirm('Are you sure you want to delete this book?')) {
    return;
  }

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
}

loadBooks();
