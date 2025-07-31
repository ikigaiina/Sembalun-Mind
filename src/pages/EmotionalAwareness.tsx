import React, { useState } from 'react';
import { EmotionWheel, type EmotionType } from '../components/ui/EmotionWheel';
import { StopTechnique } from '../components/ui/StopTechnique';
import { EmotionTracker } from '../components/ui/EmotionTracker';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

type ViewMode = 'overview' | 'emotions' | 'stop' | 'tracker';

export const EmotionalAwareness: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('overview');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);

  const handleEmotionSelect = (emotion: EmotionType) => {
    setSelectedEmotion(emotion);
  };

  const handleStopComplete = () => {
    // Could add analytics or user progress tracking here
    console.log('STOP technique completed');
  };

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-heading font-bold text-primary">
          Kesadaran Emosi
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Mengembangkan kesadaran emosi adalah kunci untuk hidup yang lebih tenang dan bijaksana. 
          Mari mulai perjalanan memahami diri lebih dalam.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div 
            className="space-y-4"
            onClick={() => setCurrentView('emotions')}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">🎭</div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                Roda Emosi
              </h3>
              <p className="text-gray-600 text-sm">
                Kenali dan pahami berbagai emosi yang Anda rasakan dengan panduan kesadaran tubuh
              </p>
            </div>
            <Button className="w-full bg-accent hover:bg-accent/90">
              Jelajahi Emosi
            </Button>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div 
            className="space-y-4"
            onClick={() => setCurrentView('stop')}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">✋</div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                Teknik STOP
              </h3>
              <p className="text-gray-600 text-sm">
                Praktik mindfulness untuk mengelola emosi kuat dengan metode yang terbukti efektif
              </p>
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90">
              Mulai STOP
            </Button>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div 
            className="space-y-4"
            onClick={() => setCurrentView('tracker')}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-xl font-semibold text-primary mb-2">
                Catat Emosi
              </h3>
              <p className="text-gray-600 text-sm">
                Tracking emosi harian untuk memahami pola dan perkembangan kesadaran diri
              </p>
            </div>
            <Button className="w-full bg-warm hover:bg-warm/90 text-white">
              Mulai Tracking
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-accent/20">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-primary mb-2">
              💡 Tentang "Search Inside Yourself"
            </h3>
          </div>
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>Kesadaran Emosi</strong> adalah kemampuan untuk mengenali dan memahami emosi kita sendiri. 
              Ini adalah fondasi dari kecerdasan emosional yang membantu kita:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span>Membuat keputusan yang lebih bijaksana</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span>Mengelola stres dan tekanan dengan lebih baik</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span>Membangun hubungan yang lebih sehat dan bermakna</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <span>Meningkatkan kepuasan dan kebahagiaan hidup</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderEmotions = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          onClick={() => setCurrentView('overview')}
          variant="outline"
          className="flex items-center gap-2"
        >
          ← Kembali
        </Button>
        <h2 className="text-2xl font-heading font-semibold text-primary">
          Jelajahi Emosi Anda
        </h2>
      </div>

      <EmotionWheel 
        onEmotionSelect={handleEmotionSelect}
        selectedEmotion={selectedEmotion}
      />

      {selectedEmotion && (
        <Card className="p-6 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30">
          <div className="text-center space-y-3">
            <h3 className="text-lg font-semibold text-primary">
              Langkah Selanjutnya
            </h3>
            <p className="text-gray-600 text-sm">
              Setelah mengenali emosi Anda, cobalah teknik STOP untuk mengelola perasaan dengan lebih bijaksana
            </p>
            <Button 
              onClick={() => setCurrentView('stop')}
              className="bg-primary hover:bg-primary/90"
            >
              Coba Teknik STOP
            </Button>
          </div>
        </Card>
      )}
    </div>
  );

  const renderStop = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          onClick={() => setCurrentView('overview')}
          variant="outline"
          className="flex items-center gap-2"
        >
          ← Kembali
        </Button>
        <h2 className="text-2xl font-heading font-semibold text-primary">
          Teknik STOP
        </h2>
      </div>

      <StopTechnique 
        onComplete={handleStopComplete}
        onStepChange={(step) => console.log('Current step:', step)}
      />
    </div>
  );

  const renderTracker = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          onClick={() => setCurrentView('overview')}
          variant="outline"
          className="flex items-center gap-2"
        >
          ← Kembali
        </Button>
        <h2 className="text-2xl font-heading font-semibold text-primary">
          Tracking Emosi Harian
        </h2>
      </div>

      <EmotionTracker 
        onTrackEmotion={(entry) => console.log('Emotion tracked:', entry)}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50 to-accent/20">
      <div className="container mx-auto px-4 py-8">
        {currentView === 'overview' && renderOverview()}
        {currentView === 'emotions' && renderEmotions()}
        {currentView === 'stop' && renderStop()}
        {currentView === 'tracker' && renderTracker()}
      </div>
    </div>
  );
};