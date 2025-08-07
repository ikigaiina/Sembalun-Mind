// Simple Supabase connection test without import.meta.env dependency
console.log('🧪 Testing Supabase Configuration...');

// Direct environment variable testing
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wvimwcrfsvliefhynzwm.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2aW13Y3Jmc3ZsaWVmaHluendtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NzgxNzcsImV4cCI6MjA3MDA1NDE3N30.LiOZovRJmCsJxvE7L_fe509JmhM7SD6Xr9ufjn-BLF0';

console.log('📋 Configuration Check:');
console.log('✅ Supabase URL:', supabaseUrl);
console.log('✅ Supabase Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration!');
  process.exit(1);
}

// Test basic HTTP connection to Supabase
import https from 'https';

const testConnection = () => {
  return new Promise((resolve, reject) => {
    const url = new URL(supabaseUrl);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: '/rest/v1/',
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    };

    const req = https.request(options, (res) => {
      console.log(`🔗 HTTP Status: ${res.statusCode}`);
      
      if (res.statusCode === 200 || res.statusCode === 404) {
        console.log('✅ Successfully connected to Supabase!');
        resolve(true);
      } else {
        console.log('⚠️ Connected but unexpected status code');
        resolve(false);
      }
    });

    req.on('error', (error) => {
      console.error('❌ Connection failed:', error.message);
      reject(error);
    });

    req.setTimeout(10000, () => {
      console.error('❌ Connection timeout');
      reject(new Error('Timeout'));
    });

    req.end();
  });
};

// Run the test
testConnection()
  .then(() => {
    console.log('\n🎉 Supabase configuration is working!');
    console.log('📝 Next steps:');
    console.log('   1. Start your development server: npm run dev');
    console.log('   2. Check browser console for any remaining errors');
    console.log('   3. Set up your database schema in Supabase dashboard');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Supabase test failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your Supabase project URL');
    console.log('   2. Verify your API key');
    console.log('   3. Ensure your .env.local file is properly formatted');
    process.exit(1);
  });