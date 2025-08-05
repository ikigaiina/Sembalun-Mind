import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface MeditationHistory {
  previousExperience: 'none' | 'casual' | 'regular' | 'experienced';
  yearsPracticing: number;
  averageSessionLength: number;
  frequency: 'never' | 'rarely' | 'weekly' | 'few-times-week' | 'daily' | 'multiple-daily';
  techniques: string[];
  challenges: string[];
  motivations: string[];
  previousApps: string[];
  teachersOrCourses: string;
  consistencyRating: number;
  benefitsExperienced: string[];
  strugglingAreas: string[];
}

interface MeditationHistoryQuestionnaireProps {
  onComplete: (data: MeditationHistory) => void;
  onBack?: () => void;
}

export const MeditationHistoryQuestionnaire: React.FC<MeditationHistoryQuestionnaireProps> = ({
  onComplete,
  onBack
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState<MeditationHistory>({
    previousExperience: 'none',
    yearsPracticing: 0,
    averageSessionLength: 10,
    frequency: 'never',
    techniques: [],
    challenges: [],
    motivations: [],
    previousApps: [],
    teachersOrCourses: '',
    consistencyRating: 5,
    benefitsExperienced: [],
    strugglingAreas: []
  });

  const experienceLevels = [
    { value: 'none', label: 'Tidak ada pengalaman', description: 'Saya baru mengenal meditasi' },
    { value: 'casual', label: 'Pernah mencoba', description: 'Sesekali meditasi tapi tidak rutin' },
    { value: 'regular', label: 'Rutin berlatih', description: 'Meditasi secara konsisten beberapa bulan' },
    { value: 'experienced', label: 'Berpengalaman', description: 'Praktik meditasi lebih dari 1 tahun' }
  ];

  const frequencies = [
    { value: 'never', label: 'Tidak pernah' },
    { value: 'rarely', label: 'Jarang (sebulan sekali)' },
    { value: 'weekly', label: 'Mingguan' },
    { value: 'few-times-week', label: '2-3 kali seminggu' },
    { value: 'daily', label: 'Setiap hari' },
    { value: 'multiple-daily', label: 'Beberapa kali sehari' }
  ];

  const techniques = [
    'Mindfulness/Kesadaran Penuh',
    'Breathing Focus/Fokus Pernapasan',
    'Body Scan/Pemindaian Tubuh',
    'Loving-kindness/Cinta Kasih',
    'Transcendental Meditation',
    'Zen Meditation',
    'Vipassana',
    'Guided Meditation/Meditasi Terpandu',
    'Walking Meditation/Meditasi Berjalan',
    'Mantra Meditation'
  ];

  const challenges = [
    'Susah fokus/pikiran mudah teralihkan',
    'Tidak punya waktu yang cukup',
    'Mudah tertidur saat meditasi',
    'Tidak tahu cara yang benar',
    'Sulit menemukan posisi yang nyaman',
    'Merasa bosan atau gelisah',
    'Tidak merasakan manfaat yang jelas',
    'Lingkungan yang tidak mendukung/berisik',
    'Tidak konsisten dalam berlatih',
    'Ekspektasi yang terlalu tinggi'
  ];

  const motivations = [
    'Mengurangi stres dan kecemasan',
    'Meningkatkan fokus dan konsentrasi',
    'Tidur lebih berkualitas',
    'Mengembangkan kesadaran diri',
    'Mencari ketenangan batin',
    'Mengelola emosi dengan lebih baik',
    'Pertumbuhan spiritual',
    'Meningkatkan kesehatan mental',
    'Mengatasi depresi atau trauma',
    'Meningkatkan kreativitas'
  ];

  const benefits = [
    'Lebih tenang dan rileks',
    'Fokus yang lebih baik',
    'Tidur lebih nyenyak',
    'Lebih sabar dan tidak mudah marah',
    'Kesadaran diri meningkat',
    'Lebih bahagia dan positif',
    'Stres berkurang',
    'Hubungan interpersonal membaik',
    'Produktivitas meningkat',
    'Kesehatan fisik membaik'
  ];

  const strugglingAreas = [
    'Mempertahankan konsistensi',
    'Menemukan waktu yang tepat',
    'Mengatasi pikiran yang aktif',
    'Memahami teknik yang benar',
    'Mengatasi rasa kantuk',
    'Menemukan motivasi',
    'Menciptakan lingkungan yang tenang',
    'Mengatasi ekspektasi berlebihan',
    'Mengintegrasikan dengan kehidupan sehari-hari',
    'Menemukan guru atau panduan yang tepat'
  ];

  const handleMultipleChoice = (field: keyof MeditationHistory, value: string) => {
    setFormData(prev => {
      const currentValues = prev[field] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.previousExperience !== 'none' || formData.frequency !== 'never';
      case 2:
        return formData.techniques.length > 0 || formData.previousExperience === 'none';
      case 3:
        return formData.motivations.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Langkah {currentStep} dari {totalSteps}
          </span>
          <span className="text-sm text-gray-500">Riwayat Meditasi</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Experience Level & Frequency */}
      {currentStep === 1 && (
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Pengalaman Meditasi Anda
            </h3>
            <p className="text-gray-600">
              Bantu kami memahami latar belakang pengalaman meditasi Anda
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Tingkat pengalaman meditasi Anda:
              </h4>
              <div className="space-y-3">
                {experienceLevels.map((level) => (
                  <label
                    key={level.value}
                    className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.previousExperience === level.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="experience"
                      value={level.value}
                      checked={formData.previousExperience === level.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, previousExperience: e.target.value as 'none' | 'casual' | 'regular' | 'experienced' }))}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{level.label}</div>
                      <div className="text-sm text-gray-600">{level.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {formData.previousExperience !== 'none' && (
              <>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Berapa lama Anda sudah berlatih meditasi?
                  </h4>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={formData.yearsPracticing}
                      onChange={(e) => setFormData(prev => ({ ...prev, yearsPracticing: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="font-medium text-gray-900 min-w-[80px]">
                      {formData.yearsPracticing === 0 ? '< 1 tahun' : `${formData.yearsPracticing} tahun`}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Seberapa sering Anda bermeditasi?
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {frequencies.map((freq) => (
                      <label
                        key={freq.value}
                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          formData.frequency === freq.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="frequency"
                          value={freq.value}
                          checked={formData.frequency === freq.value}
                          onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as 'never' | 'rarely' | 'weekly' | 'few-times-week' | 'daily' | 'multiple-daily' }))}
                        />
                        <span className="text-gray-900">{freq.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Durasi rata-rata per sesi meditasi:
                  </h4>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="5"
                      max="60"
                      step="5"
                      value={formData.averageSessionLength}
                      onChange={(e) => setFormData(prev => ({ ...prev, averageSessionLength: parseInt(e.target.value) }))}
                      className="flex-1"
                    />
                    <span className="font-medium text-gray-900 min-w-[80px]">
                      {formData.averageSessionLength} menit
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Techniques & Previous Experience */}
      {currentStep === 2 && (
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Teknik & Pengalaman
            </h3>
            <p className="text-gray-600">
              Teknik meditasi apa yang pernah Anda coba?
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Teknik meditasi yang pernah Anda praktikkan: (pilih semua yang sesuai)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {techniques.map((technique) => (
                  <label
                    key={technique}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.techniques.includes(technique)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.techniques.includes(technique)}
                      onChange={() => handleMultipleChoice('techniques', technique)}
                    />
                    <span className="text-gray-900 text-sm">{technique}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Aplikasi meditasi yang pernah Anda gunakan:
              </h4>
              <input
                type="text"
                value={formData.previousApps.join(', ')}
                onChange={(e) => setFormData(prev => ({ ...prev, previousApps: e.target.value.split(', ').filter(Boolean) }))}
                placeholder="Headspace, Calm, Insight Timer, dll. (pisahkan dengan koma)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Guru, kursus, atau pelatihan meditasi yang pernah Anda ikuti:
              </h4>
              <textarea
                value={formData.teachersOrCourses}
                onChange={(e) => setFormData(prev => ({ ...prev, teachersOrCourses: e.target.value }))}
                placeholder="Ceritakan tentang pengalaman belajar meditasi Anda..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Motivations & Goals */}
      {currentStep === 3 && (
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Motivasi & Tujuan
            </h3>
            <p className="text-gray-600">
              Apa yang mendorong Anda untuk bermeditasi?
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Motivasi utama Anda bermeditasi: (pilih semua yang sesuai)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {motivations.map((motivation) => (
                  <label
                    key={motivation}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.motivations.includes(motivation)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.motivations.includes(motivation)}
                      onChange={() => handleMultipleChoice('motivations', motivation)}
                    />
                    <span className="text-gray-900 text-sm">{motivation}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Tantangan yang sering Anda hadapi: (pilih semua yang sesuai)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {challenges.map((challenge) => (
                  <label
                    key={challenge}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.challenges.includes(challenge)
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.challenges.includes(challenge)}
                      onChange={() => handleMultipleChoice('challenges', challenge)}
                    />
                    <span className="text-gray-900 text-sm">{challenge}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Benefits & Areas for Improvement */}
      {currentStep === 4 && (
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Manfaat & Area Pengembangan
            </h3>
            <p className="text-gray-600">
              Refleksi atas pengalaman meditasi Anda
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Seberapa konsisten Anda dalam bermeditasi? (1 = sangat tidak konsisten, 10 = sangat konsisten)
              </h4>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">1</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.consistencyRating}
                  onChange={(e) => setFormData(prev => ({ ...prev, consistencyRating: parseInt(e.target.value) }))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600">10</span>
                <span className="font-medium text-gray-900 min-w-[30px]">
                  {formData.consistencyRating}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Manfaat yang sudah Anda rasakan: (pilih semua yang sesuai)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {benefits.map((benefit) => (
                  <label
                    key={benefit}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.benefitsExperienced.includes(benefit)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.benefitsExperienced.includes(benefit)}
                      onChange={() => handleMultipleChoice('benefitsExperienced', benefit)}
                    />
                    <span className="text-gray-900 text-sm">{benefit}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Area yang ingin Anda kembangkan: (pilih semua yang sesuai)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {strugglingAreas.map((area) => (
                  <label
                    key={area}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.strugglingAreas.includes(area)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.strugglingAreas.includes(area)}
                      onChange={() => handleMultipleChoice('strugglingAreas', area)}
                    />
                    <span className="text-gray-900 text-sm">{area}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-8 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={handlePrevious}
        >
          {currentStep === 1 ? 'Kembali' : 'Sebelumnya'}
        </Button>

        <Button
          onClick={handleNext}
          disabled={!isStepValid()}
        >
          {currentStep === totalSteps ? '✨ Selesai' : 'Selanjutnya'}
        </Button>
      </div>
    </div>
  );
};