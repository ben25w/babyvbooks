# Baby Violet's Books

A simple, beautiful book tracker for tracking books in a child's collection. Keep track of which books you have, who bought them, and when they were added.

## Features

- Add books individually or in bulk
- Track who bought each book with editable buyer list
- Track the date each book was added
- Sort books by name or date added
- Search for books in your collection
- Toggle details view for a clean, minimal list
- Delete books from the collection
- Password-protected settings to manage buyer names

## Setup

### Prerequisites

You'll need:
- A Supabase account (free tier works)
- The three files: `index.html`, `app.js`, and `style.css`

### Database Setup

1. Create a new Supabase project
2. Run this SQL in the SQL editor to create the books table:

```sql
CREATE TABLE books (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  date_added DATE,
  bought_by TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

3. Run this SQL to create the buyers table:

```sql
CREATE TABLE buyers (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO buyers (name) VALUES 
  ('Godma EE'),
  ('Uncle Ben'),
  ('Mum and Dad'),
  ('Nanna Deborah'),
  ('Grandma');
```

### Configuration

Open `app.js` and update the Supabase credentials at the top:

```javascript
const SUPABASE_URL = 'your-supabase-url';
const SUPABASE_KEY = 'your-supabase-key';
const SETTINGS_PASSWORD = 'blacktap';
```

You can get these from your Supabase project settings.

## Usage

### Adding Books

**Single Book:** Type the book name, select who bought it (or add a custom name), and click Add Book. The date is automatically set to today.

**Bulk Add:** Click "Bulk Add", paste or type multiple book names (one per line), select who bought them, and click Add All Books.

### Viewing Books

By default, only book names are shown. Click "Show Details" to see who bought each book and the date it was added.

### Sorting

Click "Sort by Date" to switch between alphabetical order and newest books first. The button toggles between the two.

### Searching

Click "Search" to find books by name. The search works in real-time as you type.

### Managing Buyers

Click "Manage" and enter the password (`blacktap`) to add or remove buyer names from the list. Changes save immediately to the database and update in the dropdowns.

### Deleting Books

Click "Delete" to enable delete buttons on each book. Click the delete button next to a book to remove it from your collection.

## Styling

The app uses a purple gradient background that changes randomly on each visit. All buttons and inputs are styled with smooth animations and hover effects.

## Browser Compatibility

Works in all modern browsers. Data persists in Supabase, so you can access your collection from any device.

## Notes

- The settings password is `blacktap` by default. You can change this in `app.js` if needed.
- Bulk add will skip books that already exist in your collection.
- All dates are stored and displayed in MM/DD/YYYY format.
