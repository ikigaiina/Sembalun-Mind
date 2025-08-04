#!/usr/bin/env tsx

/**
 * Script untuk mereset pencapaian pengguna
 * 
 * Cara menjalankan:
 * npm run reset-achievements -- --user-id=USER_ID
 * npm run reset-achievements -- --all-users --confirm
 * npm run reset-achievements -- --preview --user-id=USER_ID
 * npm run reset-achievements -- --backup-only --user-id=USER_ID
 */

import { achievementResetService } from '../services/achievementResetService';
import { initializeApp } from 'firebase/app';

// Firebase config - pastikan environment variables sudah diset
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
initializeApp(firebaseConfig);

interface ScriptArgs {
  userId?: string;
  allUsers?: boolean;
  preview?: boolean;
  backupOnly?: boolean;
  confirm?: boolean;
  help?: boolean;
  achievements?: boolean;
  progress?: boolean;
  streaks?: boolean;
  mood?: boolean;
  cairn?: boolean;
  courses?: boolean;
}

function parseArgs(): ScriptArgs {
  const args: ScriptArgs = {};
  
  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--user-id=')) {
      args.userId = arg.split('=')[1];
    } else if (arg === '--all-users') {
      args.allUsers = true;
    } else if (arg === '--preview') {
      args.preview = true;
    } else if (arg === '--backup-only') {
      args.backupOnly = true;
    } else if (arg === '--confirm') {
      args.confirm = true;
    } else if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--achievements') {
      args.achievements = true;
    } else if (arg === '--progress') {
      args.progress = true;
    } else if (arg === '--streaks') {
      args.streaks = true;
    } else if (arg === '--mood') {
      args.mood = true;
    } else if (arg === '--cairn') {
      args.cairn = true;
    } else if (arg === '--courses') {
      args.courses = true;
    }
  });

  return args;
}

function printHelp() {
  console.log(`
🔧 Script Reset Pencapaian Sembalun

USAGE:
  npm run reset-achievements -- [OPTIONS]

OPTIONS:
  --user-id=USER_ID     Reset pencapaian untuk user tertentu
  --all-users          Reset pencapaian untuk SEMUA user (BERBAHAYA!)
  --preview            Preview data yang akan dihapus tanpa menghapus
  --backup-only        Hanya backup data tanpa menghapus
  --confirm            Konfirmasi untuk melakukan reset (WAJIB)
  --help, -h           Tampilkan bantuan ini

DATA OPTIONS (optional, default = all):
  --achievements       Reset hanya pencapaian
  --progress          Reset hanya progress meditasi
  --streaks           Reset hanya streak data
  --mood              Reset hanya mood entries
  --cairn             Reset hanya cairn progress
  --courses           Reset hanya course progress

EXAMPLES:
  # Preview data user tertentu
  npm run reset-achievements -- --preview --user-id=abc123

  # Reset semua data untuk user tertentu
  npm run reset-achievements -- --user-id=abc123 --confirm

  # Reset hanya achievements untuk user tertentu
  npm run reset-achievements -- --user-id=abc123 --achievements --confirm

  # Backup data user tanpa menghapus
  npm run reset-achievements -- --backup-only --user-id=abc123

  # Reset SEMUA user (BERBAHAYA!)
  npm run reset-achievements -- --all-users --confirm

  # Preview reset semua user
  npm run reset-achievements -- --all-users --preview

⚠️  PERINGATAN: 
- Gunakan --confirm untuk benar-benar melakukan reset
- Tindakan reset TIDAK DAPAT dibatalkan
- Backup otomatis akan dibuat sebelum reset
`);
}

async function main() {
  const args = parseArgs();

  if (args.help) {
    printHelp();
    return;
  }

  console.log('🔥 Script Reset Pencapaian Sembalun');
  console.log('=====================================\n');

  try {
    // Preview mode
    if (args.preview) {
      console.log('📋 Mode Preview - tidak ada data yang akan dihapus\n');
      
      const preview = await achievementResetService.previewReset(args.userId);
      
      console.log(`Total dokumen yang akan terpengaruh: ${preview.totalDocuments}\n`);
      
      Object.entries(preview.collections).forEach(([collection, data]: [string, { count: number; sampleData: { data: any; }[]; }]) => {
        console.log(`📁 ${collection}: ${data.count} dokumen`);
        if (data.count > 0 && data.sampleData.length > 0) {
          console.log(`   Sample data: ${JSON.stringify(data.sampleData[0].data, null, 2).substring(0, 200)}...\n`);
        }
      });
      
      return;
    }

    // Backup only mode
    if (args.backupOnly) {
      if (!args.userId) {
        console.error('❌ Error: --user-id diperlukan untuk backup');
        process.exit(1);
      }

      console.log(`📦 Backup data untuk user: ${args.userId}`);
      const backup = await achievementResetService.backupUserData(args.userId);
      
      if (backup.success) {
        console.log('✅ Backup berhasil!');
        console.log(`📁 ${backup.message}`);
        console.log(`💾 Data tersimpan di localStorage browser`);
      } else {
        console.error('❌ Backup gagal:', backup.message);
        process.exit(1);
      }
      
      return;
    }

    // Validation
    if (!args.confirm) {
      console.error('❌ Error: --confirm diperlukan untuk melakukan reset');
      console.log('💡 Gunakan --preview untuk melihat data terlebih dahulu');
      console.log('💡 Gunakan --help untuk bantuan');
      process.exit(1);
    }

    if (!args.userId && !args.allUsers) {
      console.error('❌ Error: --user-id atau --all-users harus disediakan');
      process.exit(1);
    }

    // Build reset options
    const resetOptions = {
      resetAchievements: args.achievements || (!args.achievements && !args.progress && !args.streaks && !args.mood && !args.cairn && !args.courses),
      resetProgress: args.progress || (!args.achievements && !args.progress && !args.streaks && !args.mood && !args.cairn && !args.courses),
      resetStreaks: args.streaks || (!args.achievements && !args.progress && !args.streaks && !args.mood && !args.cairn && !args.courses),
      resetMoodEntries: args.mood || (!args.achievements && !args.progress && !args.streaks && !args.mood && !args.cairn && !args.courses),
      resetCairnProgress: args.cairn || (!args.achievements && !args.progress && !args.streaks && !args.mood && !args.cairn && !args.courses),
      resetCourseProgress: args.courses || (!args.achievements && !args.progress && !args.streaks && !args.mood && !args.cairn && !args.courses),
      confirmReset: true
    };

    console.log('⚙️ Opsi reset:');
    Object.entries(resetOptions).forEach(([key, value]) => {
      if (key !== 'confirmReset') {
        console.log(`   ${key}: ${value ? '✅' : '❌'}`);
      }
    });
    console.log('');

    // Single user reset
    if (args.userId) {
      console.log(`🔄 Mereset data untuk user: ${args.userId}`);
      
      // Backup first
      console.log('📦 Membuat backup...');
      const backup = await achievementResetService.backupUserData(args.userId);
      if (backup.success) {
        console.log(`✅ Backup berhasil: ${backup.message}`);
      } else {
        console.log(`⚠️  Backup gagal: ${backup.message}`);
      }

      // Reset
      console.log('🔄 Melakukan reset...');
      const result = await achievementResetService.resetUserAchievements(args.userId, resetOptions);
      
      if (result.success) {
        console.log('✅ Reset berhasil!');
        console.log(`📊 ${result.message}`);
        
        if (result.deletedCounts) {
          console.log('\n📋 Detail penghapusan:');
          Object.entries(result.deletedCounts).forEach(([type, count]) => {
            console.log(`   ${type}: ${count} dokumen`);
          });
        }
      } else {
        console.error('❌ Reset gagal:', result.message);
        process.exit(1);
      }
    }

    // All users reset
    if (args.allUsers) {
      console.log('⚠️  PERINGATAN: Mereset SEMUA USER!');
      console.log('🔄 Melakukan reset untuk semua pengguna...');
      
      const result = await achievementResetService.resetAllUsersAchievements(resetOptions);
      
      if (result.success) {
        console.log('✅ Reset semua user berhasil!');
        console.log(`📊 ${result.message}`);
        console.log(`👥 Pengguna terpengaruh: ${result.totalUsersAffected}`);
        console.log(`📄 Total dokumen dihapus: ${result.totalDeleted}`);
      } else {
        console.error('❌ Reset semua user gagal:', result.message);
        process.exit(1);
      }
    }

    console.log('\n🎉 Selesai!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run script
if (require.main === module) {
  main().catch(console.error);
}