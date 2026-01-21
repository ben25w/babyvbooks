const SUPABASE_URL = 'https://fxgkdefqdnedadjvdhiy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4Z2tkZWZxZG5lZGFkanZkaGl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5ODA4NzcsImV4cCI6MjA4NDU1Njg3N30.rEnRU1rgEh_f0Rub9scyfN3ieb90kBSgLEkaXPhylmA';

exports.handler = async () => {
  try {
    // Add a dummy book
    const addResponse = await fetch(`${SUPABASE_URL}/rest/v1/books`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: '🔔 Keep-alive ping' })
    });

    if (!addResponse.ok) {
      return { statusCode: 500, body: 'Failed to add ping' };
    }

    // Wait a moment, then delete it
    await new Promise(resolve => setTimeout(resolve, 1000));

    const deleteResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/books?name=eq.🔔 Keep-alive ping`,
      {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    return { statusCode: 200, body: 'Ping successful' };
  } catch (error) {
    return { statusCode: 500, body: `Error: ${error.message}` };
  }
};
