# 🔧 Panduan Reset Pencapaian Sembalun

Panduan lengkap untuk mereset pencapaian dan progress pengguna dalam aplikasi Sembalun.

## ⚠️ PERINGATAN PENTING

**TINDAKAN RESET TIDAK DAPAT DIBATALKAN!**

- Semua data yang direset akan hilang permanen
- Backup otomatis akan dibuat sebelum reset
- Gunakan dengan sangat hati-hati terutama di production

## 🛠️ Cara Penggunaan

### 1. Command Line Script (Direkomendasikan)

#### Instalasi
Pastikan dependencies sudah terinstall:
```bash
npm install
```

#### Perintah Dasar

```bash
# Preview data sebelum reset
npm run reset-achievements -- --preview --user-id=USER_ID

# Reset user tunggal
npm run reset-achievements -- --user-id=USER_ID --confirm

# Reset semua user (BERBAHAYA!)
npm run reset-achievements -- --all-users --confirm

# Backup saja tanpa reset
npm run reset-achievements -- --backup-only --user-id=USER_ID
```

#### Opsi Data Spesifik

```bash
# Reset hanya achievements
npm run reset-achievements -- --user-id=USER_ID --achievements --confirm

# Reset hanya progress meditasi
npm run reset-achievements -- --user-id=USER_ID --progress --confirm

# Reset hanya streak data
npm run reset-achievements -- --user-id=USER_ID --streaks --confirm

# Reset hanya mood entries
npm run reset-achievements -- --user-id=USER_ID --mood --confirm

# Reset hanya cairn progress
npm run reset-achievements -- --user-id=USER_ID --cairn --confirm

# Reset hanya course progress
npm run reset-achievements -- --user-id=USER_ID --courses --confirm
```

#### Contoh Lengkap

```bash
# Preview semua data user
npm run reset-achievements -- --preview --user-id=abc123

# Reset semua data user dengan backup
npm run reset-achievements -- --user-id=abc123 --confirm

# Reset hanya achievements dan progress
npm run reset-achievements -- --user-id=abc123 --achievements --progress --confirm

# Preview reset semua user
npm run reset-achievements -- --all-users --preview

# Reset SEMUA user (SANGAT BERBAHAYA!)
npm run reset-achievements -- --all-users --confirm
```

### 2. Admin Panel (UI)

Gunakan komponen `AchievementResetPanel` untuk interface visual:

```typescript
import AchievementResetPanel from './components/admin/AchievementResetPanel';

// Dalam komponen admin
<AchievementResetPanel />
```

### 3. Programmatic API

```typescript
import { achievementResetService } from './services/achievementResetService';

// Preview data
const preview = await achievementResetService.previewReset('userId');

// Backup data
const backup = await achievementResetService.backupUserData('userId');

// Reset user tunggal
const result = await achievementResetService.resetUserAchievements('userId', {
  resetAchievements: true,
  resetProgress: true,
  resetStreaks: true,
  resetMoodEntries: true,
  resetCairnProgress: true,
  resetCourseProgress: true,
  confirmReset: true
});

// Reset semua user
const allResult = await achievementResetService.resetAllUsersAchievements({
  confirmReset: true
});
```

## 📊 Data Yang Dapat Direset

| Jenis Data | Koleksi Firestore | Deskripsi |
|------------|-------------------|-----------|
| **Achievements** | `user_achievements` | Pencapaian yang telah dibuka user |
| **Progress** | `meditation_sessions` | Sesi meditasi dan history |
| **Streaks** | `user_streaks` | Data streak harian/konsistensi |
| **Mood Entries** | `mood_entries` | Catatan mood dan emosi |
| **Cairn Progress** | `cairn_progress` | Progress cairn/milestone |
| **Course Progress** | `course_progress` | Progress kursus SIY |

## 💾 Sistem Backup

### Backup Otomatis
- Setiap reset akan membuat backup otomatis ke localStorage
- Format: `sembalun_backup_{userId}_{timestamp}`
- Data backup dalam format JSON lengkap

### Cara Melihat Backup
1. Buka Developer Tools (F12)
2. Tab **Application** → **Local Storage**
3. Cari key yang dimulai dengan `sembalun_backup_`

### Restore Manual
```typescript
// Ambil data backup dari localStorage
const backupKey = 'sembalun_backup_userId_timestamp';
const backupData = JSON.parse(localStorage.getItem(backupKey) || '{}');

// Restore manual harus diimplementasi sesuai kebutuhan
// (tidak tersedia dalam script otomatis)
```

## 🔍 Monitoring dan Logging

### Log Output Script
```bash
🔥 Script Reset Pencapaian Sembalun
=====================================

📋 Mode Preview - tidak ada data yang akan dihapus

Total dokumen yang akan terpengaruh: 150

📁 user_achievements: 25 dokumen
📁 meditation_sessions: 75 dokumen
📁 user_streaks: 8 dokumen
📁 mood_entries: 40 dokumen
📁 cairn_progress: 2 dokumen
📁 course_progress: 0 dokumen
```

### Hasil Reset
```bash
✅ Reset berhasil!
📊 Berhasil mereset data pengguna. Total 150 dokumen dihapus.

📋 Detail penghapusan:
   achievements: 25 dokumen
   sessions: 75 dokumen
   streaks: 8 dokumen
   moodEntries: 40 dokumen
   cairnProgress: 2 dokumen
   courseProgress: 0 dokumen
```

## 🚨 Keamanan dan Best Practices

### Sebelum Reset Production
1. **Backup Database** - Buat backup lengkap Firestore
2. **Test di Development** - Coba dulu di environment development
3. **Inform Users** - Beri tahu pengguna jika diperlukan
4. **Schedule Maintenance** - Lakukan saat traffic rendah

### Akses Control
- Script command line memerlukan Firebase admin credentials
- Admin panel harus dilindungi dengan autentikasi admin
- Jangan expose endpoint reset di production API

### Monitoring
- Log semua aktivitas reset
- Monitor performa database setelah reset
- Siapkan rollback plan jika diperlukan

## 🐛 Troubleshooting

### Error: Firebase not initialized
```bash
# Pastikan environment variables terisi
echo $VITE_FIREBASE_API_KEY
echo $VITE_FIREBASE_PROJECT_ID

# Atau copy dari .env.local
cp .env.local.example .env.local
# Edit .env.local dengan credentials yang benar
```

### Error: Permission denied
```bash
# Pastikan user memiliki akses ke Firestore collections
# Cek Firestore Rules di Firebase Console
```

### Error: Batch write too large
```bash
# Script otomatis handle batch size 500 dokumen
# Jika masih error, mungkin ada dokumen yang sangat besar
# Check individual document sizes
```

### Script tidak berjalan
```bash
# Pastikan tsx terinstall
npm install --save-dev tsx

# Cek script di package.json
npm run reset-achievements -- --help
```

## 📝 Contoh Skenario Penggunaan

### Skenario 1: Reset User Testing
```bash
# Developer ingin reset data user testing
npm run reset-achievements -- --user-id=test-user-123 --confirm
```

### Skenario 2: Reset Batch Users
```bash
# Reset beberapa user sekaligus (manual loop)
for user in user1 user2 user3; do
  npm run reset-achievements -- --user-id=$user --confirm
done
```

### Skenario 3: Reset Production (Maintenance)
```bash
# 1. Backup database terlebih dahulu
# 2. Maintenance mode ON
# 3. Preview total impact
npm run reset-achievements -- --all-users --preview

# 4. Execute reset
npm run reset-achievements -- --all-users --confirm

# 5. Verify results
# 6. Maintenance mode OFF
```

### Skenario 4: Selective Reset
```bash
# Reset hanya achievements, keep progress
npm run reset-achievements -- --user-id=user123 --achievements --confirm

# Reset hanya streak data
npm run reset-achievements -- --user-id=user123 --streaks --confirm
```

## 📞 Support

Jika mengalami masalah:
1. Check logs di console
2. Verify Firebase permissions
3. Test di development environment first
4. Contact development team

---

⚠️ **REMEMBER**: Reset actions are irreversible. Always backup and test first!