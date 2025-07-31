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
          <CairnIcon size={80} progress={50} className="text-primary mx-auto mb-4" />
          <h3 className="font-heading text-gray-800 mb-2">Segera Hadir</h3>
          <p className="text-gray-600 font-body text-sm">
            Kami sedang menyiapkan berbagai teknik meditasi menarik untukmu
          </p>
        </div>
      </Card>
    </div>
  );
};