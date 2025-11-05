const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  console.log('🚀 Setting up database...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Read and execute schema
    console.log('📄 Reading database schema...');
    const schemaPath = path.join(__dirname, '..', 'database.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Test connection
    console.log('🔗 Testing database connection...');
    const { data, error: testError } = await supabase.from('profiles').select('count').limit(1);
    if (testError && !testError.message.includes('relation "public.profiles" does not exist')) {
      throw testError;
    }

    console.log('✅ Database connection successful');

    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`🗄️  Executing ${statements.length} SQL statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec', { query: statement + ';' });
          if (error) {
            console.error(`❌ Statement ${i + 1} failed:`, error);
            console.error('Statement:', statement.substring(0, 100) + '...');
            // Continue with other statements
          }
        } catch (err) {
          console.error(`❌ Statement ${i + 1} error:`, err.message);
          // Continue with other statements
        }
      }
    }

    // Check if tables were created
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['profiles', 'tracked_products', 'product_snapshots']);

    if (tableError) {
      console.error('❌ Could not verify table creation:', tableError);
    } else {
      console.log('✅ Created tables:', tables?.map(t => t.table_name).join(', '));
    }

    // Read and execute seed data
    console.log('🌱 Reading seed data...');
    const seedPath = path.join(__dirname, 'seed.sql');
    if (fs.existsSync(seedPath)) {
      const seedData = fs.readFileSync(seedPath, 'utf8');

      if (seedData.trim()) {
        console.log('🌱 Executing seed data...');
        const { error: seedError } = await supabase.rpc('exec_sql', {
          sql: seedData
        });

        if (seedError) {
          console.error('❌ Seed execution failed:', seedError);
          process.exit(1);
        }
      } else {
        console.log('⚠️  Seed file is empty, skipping...');
      }
    } else {
      console.log('⚠️  No seed.sql file found, skipping...');
    }

    console.log('✅ Database setup complete!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();
