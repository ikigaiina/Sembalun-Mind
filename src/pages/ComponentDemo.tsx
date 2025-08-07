import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CairnIcon, 
  BreathingCard, 
  MoodSelector, 
  MoodHistory, 
  DashboardLayout,
  Card 
} from '../components/ui';
import type { MoodType } from '../types/mood';

export const ComponentDemo: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<MoodType>('happy');
  const [breathingActive, setBreathingActive] = useState(false);

  return (
    <DashboardLayout showBottomNav={false}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-primary-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-4">
              <CairnIcon size={64} className="text-primary-600" />
            </div>
            <h1 className="text-4xl font-heading font-bold text-gray-800 mb-4">
              Sembalun UI Components
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Koleksi komponen UI yang telah dioptimalkan untuk aplikasi meditasi dengan 
              desain mobile-first, animasi framer-motion, dan sistem warna Sembalun
            </p>
          </motion.div>

          {/* Component Sections */}
          <div className="space-y-16">
            {/* CairnIcon Demo */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-8">
                <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6 text-center">
                  CairnIcon Component
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  Ikon minimalis tumpukan batu (cairn) dengan berbagai ukuran dan progress
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 items-center justify-items-center">
                  <div className="text-center space-y-3">
                    <CairnIcon size={32} progress={100} className="text-primary-600 mx-auto" />
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">32px</div>
                      <div>100% Progress</div>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <CairnIcon size={48} progress={60} className="text-accent-600 mx-auto" />
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">48px</div>
                      <div>60% Progress</div>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <CairnIcon size={64} progress={80} className="text-meditation-zen-600 mx-auto" />
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">64px</div>
                      <div>80% Progress</div>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <CairnIcon size={80} progress={40} className="text-meditation-energy-600 mx-auto" />
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">80px</div>
                      <div>40% Progress</div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.section>

            {/* MoodSelector Demo */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8">
                <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6 text-center">
                  MoodSelector Component
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  Pemilih suasana hati dengan emoji interaktif, animasi framer-motion, dan auto-save
                </p>
                
                <div className="max-w-md mx-auto mb-8">
                  <MoodSelector
                    selectedMood={selectedMood}
                    onMoodSelect={setSelectedMood}
                    label="Pilih suasana hati Anda:"
                    showLabels={true}
                  />
                </div>
                
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700">Variasi MoodSelector:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-600">Dengan Auto-Save</h4>
                      <MoodSelector
                        autoSave={true}
                        showLabels={false}
                        label="Mode otomatis:"
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-600">Tanpa Label</h4>
                      <MoodSelector
                        selectedMood="neutral"
                        showLabels={false}
                        label=""
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.section>

            {/* BreathingCard Demo */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-8">
                <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6 text-center">
                  BreathingCard Component
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  Kartu meditasi dengan animasi pernapasan yang halus dan panduan visual
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <BreathingCard
                    title="Pernapasan Tenang"
                    description="Latihan pernapasan 4 detik untuk menenangkan pikiran dan tubuh"
                    duration={4000}
                    isActive={breathingActive}
                    onClick={() => setBreathingActive(!breathingActive)}
                  />
                  
                  <BreathingCard
                    title="Pernapasan Energi"
                    description="Latihan pernapasan cepat 2 detik untuk meningkatkan energi"
                    duration={2000}
                    isActive={false}
                    onClick={() => console.log('Breathing card clicked')}
                  />
                </div>
                
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setBreathingActive(!breathingActive)}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {breathingActive ? 'Stop' : 'Start'} Breathing Animation
                  </button>
                </div>
              </Card>
            </motion.section>

            {/* MoodHistory Demo */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-8">
                <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6 text-center">
                  MoodHistory Component
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  Visualisasi riwayat suasana hati dengan grafik, statistik, dan kalender
                </p>
                
                <MoodHistory
                  showStats={true}
                  showChart={true}
                  showCalendar={true}
                />
              </Card>
            </motion.section>

            {/* DashboardLayout Demo */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-8">
                <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6 text-center">
                  DashboardLayout Component
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  Layout dashboard dengan navigasi bawah glassmorphic dan animasi framer-motion
                </p>
                
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm">
                    Komponen DashboardLayout sedang aktif untuk halaman ini.
                    Lihat navigasi bawah untuk melihat implementasinya.
                  </p>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="bg-white rounded p-2 shadow-sm">
                      <div className="font-medium">✨ Glassmorphic</div>
                      <div className="text-gray-500">Background blur</div>
                    </div>
                    <div className="bg-white rounded p-2 shadow-sm">
                      <div className="font-medium">🎭 Animasi</div>
                      <div className="text-gray-500">Framer Motion</div>
                    </div>
                    <div className="bg-white rounded p-2 shadow-sm">
                      <div className="font-medium">📱 Mobile</div>
                      <div className="text-gray-500">First Design</div>
                    </div>
                    <div className="bg-white rounded p-2 shadow-sm">
                      <div className="font-medium">🎨 Tema</div>
                      <div className="text-gray-500">Sembalun</div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.section>

            {/* Design System Demo */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-8">
                <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6 text-center">
                  Sembalun Design System
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  Sistem warna, tipografi, dan spacing yang konsisten untuk seluruh aplikasi
                </p>
                
                {/* Color Palette */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Color Palette</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-primary-400 rounded-lg mx-auto shadow-lg"></div>
                      <div className="text-sm">
                        <div className="font-medium">Primary</div>
                        <div className="text-gray-500">#6A8F6F</div>
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-accent-300 rounded-lg mx-auto shadow-lg"></div>
                      <div className="text-sm">
                        <div className="font-medium">Accent</div>
                        <div className="text-gray-500">#A9C1D9</div>
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-meditation-zen-400 rounded-lg mx-auto shadow-lg"></div>
                      <div className="text-sm">
                        <div className="font-medium">Zen</div>
                        <div className="text-gray-500">#7C9885</div>
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-meditation-energy-300 rounded-lg mx-auto shadow-lg"></div>
                      <div className="text-sm">
                        <div className="font-medium">Energy</div>
                        <div className="text-gray-500">#D4A574</div>
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-stone-400 rounded-lg mx-auto shadow-lg"></div>
                      <div className="text-sm">
                        <div className="font-medium">Stone</div>
                        <div className="text-gray-500">#94a3b8</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typography */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Typography</h3>
                  <div className="space-y-4">
                    <div className="text-4xl font-heading font-bold text-gray-800">
                      Heading Font - Playfair Display
                    </div>
                    <div className="text-lg font-primary text-gray-700">
                      Primary Font - Inter Variable
                    </div>
                    <div className="text-base font-body text-gray-600">
                      Body Font - Source Serif 4
                    </div>
                  </div>
                </div>

                {/* Border Radius */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Border Radius</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-primary-200 rounded-lg mx-auto"></div>
                      <div className="text-xs text-gray-600">12px</div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-primary-200 rounded-xl mx-auto"></div>
                      <div className="text-xs text-gray-600">16px</div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-primary-200 rounded-2xl mx-auto"></div>
                      <div className="text-xs text-gray-600">24px</div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-primary-200 rounded-full mx-auto"></div>
                      <div className="text-xs text-gray-600">Full</div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.section>

            {/* Features Summary */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="p-8 bg-gradient-to-br from-primary-50 to-accent-50">
                <h2 className="text-2xl font-heading font-semibold text-gray-800 mb-6 text-center">
                  Fitur Komponen Sembalun
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center mx-auto">
                      📱
                    </div>
                    <h3 className="font-semibold text-gray-800">Mobile-First</h3>
                    <p className="text-sm text-gray-600">
                      Dioptimalkan untuk perangkat mobile dengan responsivitas sempurna
                    </p>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-accent-500 text-white rounded-full flex items-center justify-center mx-auto">
                      🎭
                    </div>
                    <h3 className="font-semibold text-gray-800">Framer Motion</h3>
                    <p className="text-sm text-gray-600">
                      Animasi halus dan interaktif menggunakan Framer Motion
                    </p>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-meditation-zen-500 text-white rounded-full flex items-center justify-center mx-auto">
                      🧘
                    </div>
                    <h3 className="font-semibold text-gray-800">Meditation Focus</h3>
                    <p className="text-sm text-gray-600">
                      Dirancang khusus untuk aplikasi meditasi dan mindfulness
                    </p>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-meditation-energy-500 text-white rounded-full flex items-center justify-center mx-auto">
                      🎨
                    </div>
                    <h3 className="font-semibold text-gray-800">Design System</h3>
                    <p className="text-sm text-gray-600">
                      Sistem warna dan tipografi yang konsisten
                    </p>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-stone-500 text-white rounded-full flex items-center justify-center mx-auto">
                      ⚡
                    </div>
                    <h3 className="font-semibold text-gray-800">Performance</h3>
                    <p className="text-sm text-gray-600">
                      Optimasi performa dengan React 19 dan modern practices
                    </p>
                  </div>
                  
                  <div className="text-center space-y-3">
                    <div className="w-12 h-12 bg-meditation-calm-400 text-white rounded-full flex items-center justify-center mx-auto">
                      🌍
                    </div>
                    <h3 className="font-semibold text-gray-800">Indonesian Context</h3>
                    <p className="text-sm text-gray-600">
                      Disesuaikan dengan konteks dan budaya Indonesia
                    </p>
                  </div>
                </div>
              </Card>
            </motion.section>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-16 pb-8"
          >
            <div className="flex justify-center mb-4">
              <CairnIcon size={32} className="text-primary-600" />
            </div>
            <p className="text-gray-600">
              Sembalun UI Components - Designed for mindfulness and meditation
            </p>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};