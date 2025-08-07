// Content Schema untuk Admin Content Management
export interface MeditationContent {
  id: string;
  title: string;
  description: string;
  duration: number; // dalam menit
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'breathing' | 'focus' | 'body-scan' | 'loving-kindness' | 'walking' | 'mantra' | 'visualization';
  tags: string[];
  audioUrl?: string;
  instructions: string[];
  benefits: string[];
  culturalContext?: {
    region?: 'jawa' | 'bali' | 'sumatra' | 'kalimantan' | 'sulawesi' | 'ntt' | 'maluku' | 'papua';
    tradition?: 'islam' | 'hindu' | 'buddha' | 'kristen' | 'katolik' | 'spiritual';
    language?: 'indonesia' | 'jawa' | 'sunda' | 'bali' | 'batak' | 'minang';
  };
  personalityMatch: {
    introvert: boolean;
    extrovert: boolean;
    analytical: boolean;
    creative: boolean;
    emotional: boolean;
    practical: boolean;
  };
  goalAlignment: {
    stress: boolean;
    focus: boolean;
    sleep: boolean;
    anxiety: boolean;
    confidence: boolean;
    spiritual: boolean;
  };
  timeOfDay: ('morning' | 'afternoon' | 'evening' | 'night')[];
  mood: ('happy' | 'sad' | 'anxious' | 'angry' | 'calm' | 'excited' | 'tired')[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
}

export interface QuoteContent {
  id: string;
  text: string;
  author: string;
  source?: string;
  category: 'motivational' | 'wisdom' | 'spiritual' | 'mindfulness' | 'gratitude' | 'peace';
  tags: string[];
  culturalContext?: {
    region?: string;
    tradition?: string;
    language?: string;
  };
  personalityMatch: {
    introvert: boolean;
    extrovert: boolean;
    analytical: boolean;
    creative: boolean;
    emotional: boolean;
    practical: boolean;
  };
  goalAlignment: {
    stress: boolean;
    focus: boolean;
    sleep: boolean;
    anxiety: boolean;
    confidence: boolean;
    spiritual: boolean;
  };
  mood: ('happy' | 'sad' | 'anxious' | 'angry' | 'calm' | 'excited' | 'tired')[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
}

export interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  pattern: {
    inhale: number;
    hold?: number;
    exhale: number;
    pause?: number;
  };
  rounds: number;
  duration: number; // dalam menit
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  benefits: string[];
  instructions: string[];
  contraindications?: string[];
  culturalOrigin?: string;
  personalityMatch: {
    introvert: boolean;
    extrovert: boolean;
    analytical: boolean;
    creative: boolean;
    emotional: boolean;
    practical: boolean;
  };
  goalAlignment: {
    stress: boolean;
    focus: boolean;
    sleep: boolean;
    anxiety: boolean;
    confidence: boolean;
    spiritual: boolean;
  };
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
}

export interface ContentTemplate {
  type: 'meditation' | 'quote' | 'breathing';
  title: string;
  description: string;
  fields: {
    name: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'file';
    label: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
    helpText?: string;
  }[];
}

// Predefined content templates untuk memudahkan admin
export const CONTENT_TEMPLATES: ContentTemplate[] = [
  {
    type: 'meditation',
    title: 'Meditasi Terpandu',
    description: 'Template untuk membuat konten meditasi terpandu',
    fields: [
      { name: 'title', type: 'text', label: 'Judul Meditasi', required: true, placeholder: 'Meditasi Ketenangan Hati' },
      { name: 'description', type: 'textarea', label: 'Deskripsi', required: true, placeholder: 'Deskripsi singkat tentang meditasi ini...' },
      { name: 'duration', type: 'number', label: 'Durasi (menit)', required: true, placeholder: '10' },
      { name: 'difficulty', type: 'select', label: 'Tingkat Kesulitan', required: true, options: ['beginner', 'intermediate', 'advanced'] },
      { name: 'category', type: 'select', label: 'Kategori', required: true, options: ['breathing', 'focus', 'body-scan', 'loving-kindness', 'walking', 'mantra', 'visualization'] },
      { name: 'tags', type: 'multiselect', label: 'Tags', required: false, options: ['stres', 'fokus', 'tidur', 'kecemasan', 'percaya-diri', 'spiritual', 'pagi', 'siang', 'malam'] },
      { name: 'instructions', type: 'textarea', label: 'Instruksi Lengkap', required: true, helpText: 'Pisahkan setiap langkah dengan baris baru' },
      { name: 'benefits', type: 'textarea', label: 'Manfaat', required: true, helpText: 'Pisahkan setiap manfaat dengan baris baru' }
    ]
  },
  {
    type: 'quote',
    title: 'Kutipan Inspiratif',
    description: 'Template untuk menambahkan kutipan inspiratif',
    fields: [
      { name: 'text', type: 'textarea', label: 'Teks Kutipan', required: true, placeholder: 'Ketenangan bukanlah tidak adanya badai, tapi kedamaian di tengah badai...' },
      { name: 'author', type: 'text', label: 'Penulis/Sumber', required: true, placeholder: 'Rumi' },
      { name: 'source', type: 'text', label: 'Sumber Lengkap', required: false, placeholder: 'Kitab Masnawi' },
      { name: 'category', type: 'select', label: 'Kategori', required: true, options: ['motivational', 'wisdom', 'spiritual', 'mindfulness', 'gratitude', 'peace'] },
      { name: 'tags', type: 'multiselect', label: 'Tags', required: false, options: ['ketenangan', 'kebijaksanaan', 'motivasi', 'spiritual', 'syukur', 'kedamaian'] }
    ]
  },
  {
    type: 'breathing',
    title: 'Latihan Pernapasan',
    description: 'Template untuk latihan pernapasan',
    fields: [
      { name: 'name', type: 'text', label: 'Nama Teknik', required: true, placeholder: 'Pernapasan 4-7-8' },
      { name: 'description', type: 'textarea', label: 'Deskripsi', required: true, placeholder: 'Teknik pernapasan untuk mengurangi stres...' },
      { name: 'inhale', type: 'number', label: 'Tarik Napas (detik)', required: true, placeholder: '4' },
      { name: 'hold', type: 'number', label: 'Tahan (detik)', required: false, placeholder: '7' },
      { name: 'exhale', type: 'number', label: 'Hembuskan (detik)', required: true, placeholder: '8' },
      { name: 'rounds', type: 'number', label: 'Jumlah Siklus', required: true, placeholder: '10' },
      { name: 'instructions', type: 'textarea', label: 'Instruksi', required: true, helpText: 'Pisahkan setiap langkah dengan baris baru' },
      { name: 'benefits', type: 'textarea', label: 'Manfaat', required: true, helpText: 'Pisahkan setiap manfaat dengan baris baru' }
    ]
  }
];