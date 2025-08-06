import { supabase } from './supabaseClient';

/**
 * Supabase Setup and Configuration Helper
 * Contains utilities for setting up and validating Supabase configuration
 */
export class SupabaseSetup {
  /**
   * Validate environment variables
   */
  static validateEnvironment(): { isValid: boolean; missing: string[]; warnings: string[] } {
    const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
    const optional = ['VITE_SUPABASE_SERVICE_ROLE_KEY'];
    
    const missing: string[] = [];
    const warnings: string[] = [];

    // Check required variables
    required.forEach(varName => {
      const value = import.meta.env[varName];
      if (!value) {
        missing.push(varName);
      } else if (varName === 'VITE_SUPABASE_URL' && !value.includes('supabase.co')) {
        warnings.push(`${varName} doesn't appear to be a valid Supabase URL`);
      }
    });

    // Check optional variables
    optional.forEach(varName => {
      const value = import.meta.env[varName];
      if (!value) {
        warnings.push(`${varName} is not set (needed for admin operations)`);
      }
    });

    return {
      isValid: missing.length === 0,
      missing,
      warnings
    };
  }

  /**
   * Get setup instructions
   */
  static getSetupInstructions(): string {
    return `
🚀 Supabase Setup Instructions for Sembalun Meditation App

1. CREATE SUPABASE PROJECT:
   - Go to https://supabase.com
   - Click "New Project"
   - Choose organization and enter project details
   - Wait for project to be ready (2-3 minutes)

2. GET PROJECT CREDENTIALS:
   - Go to Settings > API
   - Copy "Project URL" and "anon public" key
   - Copy "service_role secret" key (for admin operations)

3. UPDATE ENVIRONMENT VARIABLES:
   - Copy .env.example to .env
   - Update these values:
     VITE_SUPABASE_URL=https://your-project-ref.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-here
     VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

4. RUN DATABASE MIGRATIONS:
   - Go to Supabase Dashboard > SQL Editor
   - Copy content from supabase/schema.sql
   - Run the SQL to create tables and policies

5. CONFIGURE AUTHENTICATION:
   - Go to Authentication > Settings
   - Configure Site URL: http://localhost:5173 (for development)
   - Add redirect URLs for production
   - Enable desired providers (Google, etc.)

6. CONFIGURE STORAGE (Optional):
   - Go to Storage > Buckets
   - Create buckets: avatars, audio, images, documents
   - Set up policies for each bucket

7. TEST CONNECTION:
   - Run: npm run test:supabase
   - Or import and run SupabaseConnectionTest.runFullTest()

8. PRODUCTION SETUP:
   - Update environment variables in deployment platform
   - Configure production domains in Supabase Auth settings
   - Set up Edge Functions if needed
   - Configure backups and monitoring

📚 Additional Resources:
   - Supabase Docs: https://supabase.com/docs
   - Authentication Guide: https://supabase.com/docs/guides/auth
   - Database Guide: https://supabase.com/docs/guides/database
   - Real-time Guide: https://supabase.com/docs/guides/realtime
`;
  }

  /**
   * Test database schema
   */
  static async testDatabaseSchema(): Promise<{ 
    success: boolean; 
    tables: string[]; 
    missingTables: string[];
    errors: string[] 
  }> {
    const expectedTables = [
      'users',
      'meditation_sessions',
      'journal_entries',
      'achievements',
      'courses',
      'user_course_progress',
      'bookmarks',
      'user_settings',
      'moods'
    ];

    const tables: string[] = [];
    const missingTables: string[] = [];
    const errors: string[] = [];

    try {
      // Test each table by trying to query it
      for (const tableName of expectedTables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

          if (error) {
            if (error.code === 'PGRST116') { // Table doesn't exist
              missingTables.push(tableName);
            } else {
              tables.push(tableName); // Table exists but might have RLS
            }
          } else {
            tables.push(tableName);
          }
        } catch (err: any) {
          errors.push(`Error testing table ${tableName}: ${err.message}`);
        }
      }

      return {
        success: missingTables.length === 0,
        tables,
        missingTables,
        errors
      };
    } catch (error: any) {
      return {
        success: false,
        tables: [],
        missingTables: expectedTables,
        errors: [error.message]
      };
    }
  }

  /**
   * Test Row Level Security policies
   */
  static async testRLSPolicies(): Promise<{
    success: boolean;
    protectedTables: string[];
    publicTables: string[];
    errors: string[];
  }> {
    const protectedTables: string[] = [];
    const publicTables: string[] = [];
    const errors: string[] = [];

    const tablesToTest = [
      { name: 'users', shouldBeProtected: true },
      { name: 'meditation_sessions', shouldBeProtected: true },
      { name: 'journal_entries', shouldBeProtected: true },
      { name: 'achievements', shouldBeProtected: true },
      { name: 'courses', shouldBeProtected: false },
      { name: 'user_course_progress', shouldBeProtected: true },
      { name: 'bookmarks', shouldBeProtected: true },
      { name: 'user_settings', shouldBeProtected: true },
      { name: 'moods', shouldBeProtected: true }
    ];

    for (const table of tablesToTest) {
      try {
        const { data, error } = await supabase
          .from(table.name)
          .select('*')
          .limit(1);

        if (table.shouldBeProtected) {
          // Protected tables should either return empty or error
          if (!data || data.length === 0 || (error && error.code === 'PGRST301')) {
            protectedTables.push(table.name);
          } else {
            errors.push(`Table ${table.name} should be protected but allows access`);
          }
        } else {
          // Public tables should return data or no error
          if (!error && data !== null) {
            publicTables.push(table.name);
          } else {
            errors.push(`Table ${table.name} should be public but blocks access`);
          }
        }
      } catch (err: any) {
        errors.push(`Error testing RLS on ${table.name}: ${err.message}`);
      }
    }

    return {
      success: errors.length === 0,
      protectedTables,
      publicTables,
      errors
    };
  }

  /**
   * Generate configuration report
   */
  static async generateConfigReport(): Promise<string> {
    const envValidation = this.validateEnvironment();
    const schemaTest = await this.testDatabaseSchema();
    const rlsTest = await this.testRLSPolicies();

    let report = '📋 SUPABASE CONFIGURATION REPORT\n';
    report += '=====================================\n\n';

    // Environment Variables
    report += '🔧 ENVIRONMENT VARIABLES:\n';
    if (envValidation.isValid) {
      report += '   ✅ All required variables set\n';
    } else {
      report += '   ❌ Missing variables:\n';
      envValidation.missing.forEach(missing => {
        report += `      - ${missing}\n`;
      });
    }

    if (envValidation.warnings.length > 0) {
      report += '   ⚠️ Warnings:\n';
      envValidation.warnings.forEach(warning => {
        report += `      - ${warning}\n`;
      });
    }

    // Database Schema
    report += '\n🗄️ DATABASE SCHEMA:\n';
    if (schemaTest.success) {
      report += '   ✅ All required tables exist\n';
      report += `   📊 Found tables: ${schemaTest.tables.join(', ')}\n`;
    } else {
      report += '   ❌ Missing tables:\n';
      schemaTest.missingTables.forEach(table => {
        report += `      - ${table}\n`;
      });
    }

    if (schemaTest.errors.length > 0) {
      report += '   ⚠️ Errors:\n';
      schemaTest.errors.forEach(error => {
        report += `      - ${error}\n`;
      });
    }

    // Row Level Security
    report += '\n🔐 ROW LEVEL SECURITY:\n';
    if (rlsTest.success) {
      report += '   ✅ RLS policies working correctly\n';
      report += `   🔒 Protected tables: ${rlsTest.protectedTables.join(', ')}\n`;
      report += `   🌍 Public tables: ${rlsTest.publicTables.join(', ')}\n`;
    } else {
      report += '   ❌ RLS policy issues:\n';
      rlsTest.errors.forEach(error => {
        report += `      - ${error}\n`;
      });
    }

    // Recommendations
    report += '\n🎯 RECOMMENDATIONS:\n';
    
    if (!envValidation.isValid) {
      report += '   1. Set up missing environment variables\n';
    }
    
    if (!schemaTest.success) {
      report += '   2. Run database migrations from supabase/schema.sql\n';
    }
    
    if (!rlsTest.success) {
      report += '   3. Check and fix Row Level Security policies\n';
    }
    
    if (envValidation.isValid && schemaTest.success && rlsTest.success) {
      report += '   🎉 Your Supabase setup is ready for production!\n';
    }

    return report;
  }

  /**
   * Quick setup validation
   */
  static async isReadyForProduction(): Promise<boolean> {
    const envValidation = this.validateEnvironment();
    const schemaTest = await this.testDatabaseSchema();
    const rlsTest = await this.testRLSPolicies();

    return envValidation.isValid && schemaTest.success && rlsTest.success;
  }
}

export default SupabaseSetup;