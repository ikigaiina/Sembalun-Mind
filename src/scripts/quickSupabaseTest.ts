/**
 * Quick Supabase Connection Test for Sembalun Mind
 * Run this to verify your Supabase setup is working
 */

import { supabase } from '../config/supabase';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'INFO';
  message: string;
}

async function quickSupabaseTest() {
  console.log('🔗 Testing Supabase Connection for Sembalun Mind...\n');

  const results: TestResult[] = [];

  try {
    // Test 1: Environment Variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl.includes('your-project-ref') || 
        supabaseKey.includes('your-anon-key')) {
      results.push({
        test: 'Environment Variables',
        status: 'FAIL',
        message: 'Missing or placeholder values in .env.local'
      });
      
      console.error('❌ Supabase credentials not configured properly');
      console.log('\n🔧 TO FIX THIS:');
      console.log('1. Copy .env.example to .env.local');
      console.log('2. Go to https://supabase.com/dashboard');
      console.log('3. Create a new project or select existing one');
      console.log('4. Go to Settings → API');
      console.log('5. Copy your Project URL and anon key to .env.local');
      console.log('6. Restart your dev server: npm run dev');
      return displayResults(results);
    }

    results.push({
      test: 'Environment Variables',
      status: 'PASS',
      message: 'Credentials loaded successfully'
    });

    console.log('✅ Environment variables configured');
    console.log(`   • URL: ${supabaseUrl.substring(0, 30)}...`);
    console.log(`   • Key: ${supabaseKey.substring(0, 20)}...\n`);

    // Test 2: Basic Connection
    console.log('🔍 Testing database connection...');
    
    try {
      const { error: connectionError } = await supabase
        .from('courses')
        .select('id')
        .limit(1);
      
      if (connectionError) {
        results.push({
          test: 'Database Connection',
          status: 'FAIL',
          message: connectionError.message
        });
        
        console.error('❌ Could not connect to Supabase database');
        console.log('\n🔧 POSSIBLE SOLUTIONS:');
        console.log('1. Check if your Supabase project is active (not paused)');
        console.log('2. Verify your Project URL and API key are correct');
        console.log('3. Make sure you ran the database schema (schema.sql)');
        return displayResults(results);
      }

      results.push({
        test: 'Database Connection',
        status: 'PASS',
        message: 'Successfully connected to database'
      });
      console.log('✅ Database connection successful');
      
    } catch (networkError: any) {
      results.push({
        test: 'Database Connection',
        status: 'FAIL',
        message: 'Network or connection error'
      });
      
      console.error('❌ Network error:', networkError.message);
      console.log('\n🔧 CHECK:');
      console.log('1. Your internet connection');
      console.log('2. Supabase service status');
      console.log('3. Firewall or VPN blocking connections');
      return displayResults(results);
    }

    // Test 3: Check Schema
    console.log('🗄️  Testing database schema...');
    const essentialTables = ['users', 'courses', 'meditation_sessions', 'journal_entries'];
    let schemaOk = true;
    
    for (const table of essentialTables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
          
        if (error) {
          results.push({
            test: `Table: ${table}`,
            status: 'FAIL',
            message: 'Table missing or misconfigured'
          });
          console.log(`❌ Table '${table}' not found`);
          schemaOk = false;
        } else {
          console.log(`✅ Table '${table}' exists`);
        }
      } catch (tableError: any) {
        results.push({
          test: `Table: ${table}`,
          status: 'FAIL',
          message: 'Could not access table'
        });
        console.log(`❌ Error accessing table '${table}':`, tableError.message);
        schemaOk = false;
      }
    }
    
    if (!schemaOk) {
      console.log('\n🔧 SCHEMA NOT SETUP:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Click "SQL Editor"');
      console.log('3. Copy the contents of supabase/schema.sql');
      console.log('4. Paste and run in SQL Editor');
      console.log('5. This creates all necessary tables and security');
    }

    // Test 4: Sample Data
    console.log('\n📊 Checking for sample data...');
    try {
      const { data: courses, error } = await supabase
        .from('courses')
        .select('*');
        
      if (error) {
        console.log('⚠️  Could not fetch courses:', error.message);
      } else {
        const courseCount = courses?.length || 0;
        console.log(`✅ Found ${courseCount} meditation courses`);
        
        if (courseCount === 0) {
          results.push({
            test: 'Sample Data',
            status: 'INFO',
            message: 'No sample courses found - run schema.sql to add sample data'
          });
        } else {
          results.push({
            test: 'Sample Data',
            status: 'PASS',
            message: `${courseCount} courses available`
          });
        }
      }
    } catch (sampleError: any) {
      console.log('ℹ️  Sample data check skipped:', sampleError.message);
    }

    // Test 5: Authentication System
    console.log('\n🔐 Testing authentication...');
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error && !error.message.includes('refresh')) {
        console.log('⚠️  Auth system warning:', error.message);
      } else {
        console.log('✅ Authentication system ready');
        results.push({
          test: 'Authentication',
          status: 'PASS',
          message: 'Auth system configured correctly'
        });
      }
    } catch (authError: any) {
      results.push({
        test: 'Authentication',
        status: 'FAIL',
        message: 'Auth system error'
      });
      console.log('❌ Auth system error:', authError.message);
    }

    displayResults(results);
    
  } catch (error: any) {
    console.error('\n💥 Unexpected error:', error);
    console.log('\n🆘 If this error persists:');
    console.log('1. Check your internet connection');
    console.log('2. Verify Supabase project is active');
    console.log('3. Try creating a new Supabase project');
  }
}

function displayResults(results: TestResult[]) {
  const passedTests = results.filter(r => r.status === 'PASS').length;
  const failedTests = results.filter(r => r.status === 'FAIL').length;
  const infoTests = results.filter(r => r.status === 'INFO').length;

  console.log('\n' + '='.repeat(60));
  console.log('📋 SUPABASE SETUP TEST RESULTS');
  console.log('='.repeat(60));
  
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : 
                 result.status === 'FAIL' ? '❌' : 'ℹ️ ';
    console.log(`${icon} ${result.test}: ${result.message}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ PASSED: ${passedTests}`);
  console.log(`❌ FAILED: ${failedTests}`);
  console.log(`ℹ️  INFO: ${infoTests}`);
  
  if (failedTests === 0) {
    console.log('\n🎉 SUCCESS! Supabase is ready for Sembalun Mind!');
    console.log('🚀 You can now:');
    console.log('   • Register and login users');
    console.log('   • Save meditation sessions');
    console.log('   • Write journal entries');
    console.log('   • Track user progress');
  } else {
    console.log('\n🔧 SETUP INCOMPLETE - Fix the failed tests above');
    console.log('📖 See SUPABASE_SETUP_STEPS.md for detailed help');
  }
  
  console.log('\n🌐 Your Supabase Dashboard:');
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl) {
    const projectId = supabaseUrl.split('//')[1]?.split('.')[0];
    console.log(`   https://supabase.com/dashboard/project/${projectId}`);
  }
}

// Export for use in other files
export { quickSupabaseTest };

// If running this file directly
if (typeof window === 'undefined') {
  quickSupabaseTest();
}

export default quickSupabaseTest;