import { useState } from 'react';
import { Header } from '../components/ui/Header';
import { Card } from '../components/ui/Card';
import { CairnIcon } from '../components/ui/CairnIcon';
import { BreathingCard } from '../components/ui/BreathingCard';
import { MoodSelector, type MoodType } from '../components/ui/MoodSelector';
import { FloatingButton } from '../components/ui/FloatingButton';
import { Button } from '../components/ui/Button';

export const ComponentsDemo: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>();
  const [breathingActive, setBreathingActive] = useState(false);
  const [cairnProgress, setCairnProgress] = useState(60);

  return (
    <div>
      <Header title="UI Components Demo" showBack={true} />
      
      <div className="px-4 py-6 space-y-6">
        
        {/* CairnIcon Demo */}
        <Card>
          <h3 className="font-heading text-gray-800 mb-4">CairnIcon Component</h3>
          <div className="flex items-center justify-around">
            <div className="text-center">
              <CairnIcon progress={20} size={40} variant="artistic" className="text-primary mx-auto mb-2 hover:scale-110 transition-transform duration-300" />
              <p className="text-xs text-gray-600">20%</p>
            </div>
            <div className="text-center">
              <CairnIcon progress={50} size={40} variant="artistic" className="text-primary mx-auto mb-2 hover:scale-110 transition-transform duration-300" />
              <p className="text-xs text-gray-600">50%</p>
            </div>
            <div className="text-center">
              <CairnIcon progress={80} size={40} variant="artistic" className="text-primary mx-auto mb-2 hover:scale-110 transition-transform duration-300" />
              <p className="text-xs text-gray-600">80%</p>
            </div>
            <div className="text-center">
              <CairnIcon progress={100} size={40} variant="artistic" className="text-primary mx-auto mb-2 hover:scale-110 transition-transform duration-300" />
              <p className="text-xs text-gray-600">100%</p>
            </div>
          </div>
          
          <div className="mt-4">
            <input
              type="range"
              min="0"
              max="100"
              value={cairnProgress}
              onChange={(e) => setCairnProgress(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-center mt-2">
              <CairnIcon progress={cairnProgress} size={60} variant="artistic" className="text-primary animate-pulse" />
              <p className="text-sm text-gray-600 mt-2">Progress: {cairnProgress}%</p>
            </div>
          </div>
        </Card>

        {/* MoodSelector Demo */}
        <Card>
          <h3 className="font-heading text-gray-800 mb-4">MoodSelector Component</h3>
          <MoodSelector 
            selectedMood={selectedMood}
            onMoodSelect={setSelectedMood}
            label="Pilih mood Anda untuk demo"
          />
        </Card>

        {/* BreathingCard Demo */}
        <BreathingCard
          title="BreathingCard Component"
          description="Klik untuk mengaktifkan animasi pernapasan"
          isActive={breathingActive}
          onClick={() => setBreathingActive(!breathingActive)}
        >
          <div className="flex justify-center space-x-4">
            <Button 
              variant="primary"
              size="small"
              onClick={() => setBreathingActive(true)}
            >
              Mulai
            </Button>
            <Button 
              variant="secondary"
              size="small"
              onClick={() => setBreathingActive(false)}
            >
              Berhenti
            </Button>
          </div>
        </BreathingCard>

        {/* FloatingButton Demo */}
        <Card>
          <h3 className="font-heading text-gray-800 mb-4">FloatingButton Variants</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <FloatingButton 
                variant="primary" 
                size="medium" 
                position="static"
                onClick={() => alert('Primary button clicked!')}
              >
                <CairnIcon size={24} variant="artistic" className="animate-spin" />
              </FloatingButton>
              <p className="text-xs text-gray-600 mt-2">Primary</p>
            </div>
            <div>
              <FloatingButton 
                variant="secondary" 
                size="medium" 
                position="static"
                onClick={() => alert('Secondary button clicked!')}
              >
                ❤️
              </FloatingButton>
              <p className="text-xs text-gray-600 mt-2">Secondary</p>
            </div>
            <div>
              <FloatingButton 
                variant="accent" 
                size="medium" 
                position="static"
                onClick={() => alert('Accent button clicked!')}
              >
                ⭐
              </FloatingButton>
              <p className="text-xs text-gray-600 mt-2">Accent</p>
            </div>
          </div>
        </Card>

        {/* Button sizes demo */}
        <Card>
          <h3 className="font-heading text-gray-800 mb-4">Button Sizes & Variants</h3>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Button size="small">Small</Button>
              <Button size="medium">Medium</Button>
              <Button size="large">Large</Button>
            </div>
            <div className="flex space-x-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
            </div>
          </div>
        </Card>

        <div className="pb-20">
          <p className="text-center text-sm text-gray-500">
            Semua komponen menggunakan sistem desain Sembalun dengan 12px rounded corners dan animasi halus.
          </p>
        </div>
      </div>

      {/* Fixed floating button */}
      <FloatingButton 
        onClick={() => alert('Fixed floating button!')}
        variant="primary"
        size="large"
      >
        🧘‍♀️
      </FloatingButton>
    </div>
  );
};