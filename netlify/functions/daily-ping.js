const SUPABASE_URL = 'https://fxgkdefqdnedadjvdhiy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4Z2tkZWZxZG5lZGFkanZkaGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5ODA4NzcsImV4cCI6MjA4NDU1Njg3N30.rEnRU1rgEh_f0Rub9scyfN3ieb90kBSgLEkaXPhylmA';

exports.handler = async () => {
  try {
    // Just do a read operation to keep Supabase awake
    const response = await fetch(`${SUPABASE_URL}/rest/v1/books?limit=1`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (response.ok) {
      return { statusCode: 200, body: 'Keep-alive ping successful' };
    } else {
      return { statusCode: 500, body: 'Ping failed' };
    }
  } catch (error) {
    return { statusCode: 500, body: `Error: ${error.message}` };
  }
};
