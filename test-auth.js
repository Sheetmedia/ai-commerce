const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Found' : 'Not found');
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Found' : 'Not found');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('Environment variables not loaded. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  try {
    console.log('Testing authentication...');

    // Try to sign in with test credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password123'
    });

    if (error) {
      console.log('Sign in error:', error.message);
      return;
    }

    if (data.session?.access_token) {
      console.log('Successfully got token!');
      console.log('Token (first 50 chars):', data.session.access_token.substring(0, 50) + '...');

      // Test the API with the token
      const response = await fetch('http://localhost:3000/api/insights', {
        headers: {
          'Authorization': `Bearer ${data.session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response status:', response.status);
      const result = await response.json();
      console.log('API Response:', result);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testAuth();
