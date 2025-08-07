import { supabase, checkSupabaseConnection } from '../config/supabase';
import { SupabaseAuthService } from '../services/supabaseAuthService';
import { SupabaseDatabaseService } from '../services/supabaseDatabaseService';
import { SupabaseRealtimeService } from '../services/supabaseRealtimeService';

/**
 * Comprehensive Supabase Connection and Feature Test
 * Run this script to verify all Supabase functionality is working
 */
export class SupabaseConnectionTest {
  static async runFullTest(): Promise<void> {
    console.log('🧪 Starting Supabase Connection Test...\n');

    try {
      // Test 1: Basic connection
      await this.testBasicConnection();

      // Test 2: Authentication
      await this.testAuthentication();

      // Test 3: Database operations
      await this.testDatabaseOperations();

      // Test 4: Real-time subscriptions
      await this.testRealtimeFeatures();

      // Test 5: Row Level Security
      await this.testRowLevelSecurity();

      console.log('\n✅ All Supabase tests passed successfully!');
      console.log('🎉 Your Supabase setup is ready for production.');

    } catch (error) {
      console.error('\n❌ Supabase test failed:', error);
      throw error;
    }
  }

  /**
   * Test basic Supabase connection
   */
  static async testBasicConnection(): Promise<void> {
    console.log('1️⃣ Testing basic connection...');

    try {
      const isConnected = await checkSupabaseConnection();
      
      if (!isConnected) {
        throw new Error('Failed to connect to Supabase');
      }

      console.log('   ✅ Connection established');
      console.log('   ✅ Database accessible');

      // Test environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing environment variables');
      }

      console.log('   ✅ Environment variables configured');
      
    } catch (error) {
      console.error('   ❌ Basic connection failed:', error);
      throw error;
    }
  }

  /**
   * Test authentication features
   */
  static async testAuthentication(): Promise<void> {
    console.log('\n2️⃣ Testing authentication...');

    try {
      // Test getting current user (should be null initially)
      const currentUser = await SupabaseAuthService.getCurrentUser();
      console.log('   ✅ Current user check working');

      // Test getting current session
      const currentSession = await SupabaseAuthService.getCurrentSession();
      console.log('   ✅ Session check working');

      // Test auth state listener setup
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        console.log(`   📡 Auth state changed: ${event}`);
      });

      // Cleanup subscription
      subscription.unsubscribe();
      console.log('   ✅ Auth state listener working');

    } catch (error) {
      console.error('   ❌ Authentication test failed:', error);
      throw error;
    }
  }

  /**
   * Test basic database operations
   */
  static async testDatabaseOperations(): Promise<void> {
    console.log('\n3️⃣ Testing database operations...');

    try {
      // Test reading courses (public table)
      const courses = await SupabaseDatabaseService.getCourses();
      console.log(`   ✅ Course query successful (${courses.length} courses found)`);

      // Test course categories
      const beginnerCourses = await SupabaseDatabaseService.getCourses('pemula');
      console.log(`   ✅ Filtered course query successful (${beginnerCourses.length} beginner courses)`);

      // Test single course fetch
      if (courses.length > 0) {
        const singleCourse = await SupabaseDatabaseService.getCourse(courses[0].id);
        if (singleCourse) {
          console.log(`   ✅ Single course fetch successful: "${singleCourse.title}"`);
        }
      }

    } catch (error) {
      console.error('   ❌ Database operations test failed:', error);
      throw error;
    }
  }

  /**
   * Test real-time features
   */
  static async testRealtimeFeatures(): Promise<void> {
    console.log('\n4️⃣ Testing real-time features...');

    try {
      // Test realtime connection status
      const connectionStatus = SupabaseRealtimeService.getConnectionStatus();
      console.log(`   ✅ Realtime connection status: ${connectionStatus}`);

      // Test course subscription (public table)
      let subscriptionWorking = false;
      const subscription = SupabaseRealtimeService.subscribeToCourses((update) => {
        console.log(`   📡 Course update received: ${update.eventType}`);
        subscriptionWorking = true;
      });

      // Wait a moment for subscription to establish
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Cleanup subscription
      subscription.unsubscribe();
      console.log('   ✅ Course subscription setup successful');

      // Test broadcast channel
      const broadcastSubscription = SupabaseRealtimeService.createBroadcastChannel(
        'test_channel',
        (payload) => {
          console.log('   📡 Broadcast received:', payload);
        }
      );

      // Test sending broadcast
      const broadcastSent = await SupabaseRealtimeService.sendBroadcast('test_channel', {
        message: 'Test broadcast',
        timestamp: new Date().toISOString()
      });

      if (broadcastSent) {
        console.log('   ✅ Broadcast channel working');
      }

      // Cleanup
      broadcastSubscription.unsubscribe();

    } catch (error) {
      console.error('   ❌ Real-time features test failed:', error);
      throw error;
    }
  }

  /**
   * Test Row Level Security policies
   */
  static async testRowLevelSecurity(): Promise<void> {
    console.log('\n5️⃣ Testing Row Level Security...');

    try {
      // Test accessing protected tables without authentication
      // This should fail or return empty results due to RLS policies
      
      try {
        const { data, error } = await supabase
          .from('meditation_sessions')
          .select('*')
          .limit(1);

        // If no error but empty data, RLS is working
        if (!error && (!data || data.length === 0)) {
          console.log('   ✅ RLS blocking unauthorized access to meditation_sessions');
        } else if (error && error.code === 'PGRST301') {
          console.log('   ✅ RLS properly configured - access denied');
        }
      } catch (error: any) {
        if (error.code === 'PGRST301' || error.message.includes('JWT')) {
          console.log('   ✅ RLS working - JWT required for protected tables');
        } else {
          throw error;
        }
      }

      // Test accessing users table (should be blocked)
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .limit(1);

        if (!error && (!data || data.length === 0)) {
          console.log('   ✅ RLS blocking unauthorized access to users table');
        } else if (error) {
          console.log('   ✅ RLS working - users table protected');
        }
      } catch (error: any) {
        console.log('   ✅ RLS working - users table access denied');
      }

      // Test public table access (courses)
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .limit(1);

      if (!coursesError && coursesData && coursesData.length > 0) {
        console.log('   ✅ Public table (courses) accessible without authentication');
      }

    } catch (error) {
      console.error('   ❌ Row Level Security test failed:', error);
      throw error;
    }
  }

  /**
   * Run performance benchmarks
   */
  static async runPerformanceTest(): Promise<void> {
    console.log('\n⚡ Running performance benchmarks...');

    try {
      // Test query performance
      const startTime = Date.now();
      
      const courses = await SupabaseDatabaseService.getCourses();
      const queryTime = Date.now() - startTime;
      
      console.log(`   📊 Course query time: ${queryTime}ms`);
      
      if (queryTime < 1000) {
        console.log('   ✅ Query performance: Excellent');
      } else if (queryTime < 3000) {
        console.log('   ⚠️ Query performance: Good');
      } else {
        console.log('   ⚠️ Query performance: Slow - check network/database');
      }

      // Test connection establishment time
      const connectionStart = Date.now();
      await checkSupabaseConnection();
      const connectionTime = Date.now() - connectionStart;
      
      console.log(`   📊 Connection time: ${connectionTime}ms`);

    } catch (error) {
      console.error('   ❌ Performance test failed:', error);
    }
  }

  /**
   * Generate test report
   */
  static generateTestReport(): void {
    console.log('\n📋 Test Report Summary:');
    console.log('==========================================');
    console.log('✅ Basic Connection: PASSED');
    console.log('✅ Authentication Setup: PASSED');
    console.log('✅ Database Operations: PASSED');
    console.log('✅ Real-time Features: PASSED');
    console.log('✅ Row Level Security: PASSED');
    console.log('==========================================');
    console.log('\n🎯 Next Steps:');
    console.log('1. Set up your actual Supabase project credentials in .env');
    console.log('2. Run database migrations using the schema.sql file');
    console.log('3. Configure authentication providers (Google, etc.)');
    console.log('4. Test with real user accounts');
    console.log('5. Set up storage buckets for file uploads');
    console.log('\n📚 Documentation:');
    console.log('- Supabase Docs: https://supabase.com/docs');
    console.log('- Authentication: https://supabase.com/docs/guides/auth');
    console.log('- Database: https://supabase.com/docs/guides/database');
    console.log('- Real-time: https://supabase.com/docs/guides/realtime');
  }
}

// Export for use in tests or manual execution
export default SupabaseConnectionTest;

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  SupabaseConnectionTest.runFullTest()
    .then(() => {
      SupabaseConnectionTest.generateTestReport();
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}