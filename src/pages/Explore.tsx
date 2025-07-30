import { Card } from '../components/ui/Card';
import { CairnIcon } from '../components/ui/CairnIcon';

export const Explore: React.FC = () => {
  return (
    <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-heading text-gray-800 mb-2">Jelajahi Ketenangan</h1>
        <p className="text-gray-600 font-body">Temukan berbagai teknik meditasi yang sesuai denganmu</p>
      </div>

      <Card className="text-center">
        <div className="py-12">
          <CairnIcon size={100} progress={50} variant="artistic" className="text-primary mx-auto mb-4 animate-pulse hover:scale-105 transition-all duration-500" />
          <h3 className="font-heading text-gray-800 mb-2">Segera Hadir</h3>
          <p className="text-gray-600 font-body text-sm">
            Kami sedang menyiapkan berbagai teknik meditasi menarik untukmu
          </p>
        </div>
      </Card>
    </div>
  );
};