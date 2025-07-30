import { Card } from '../components/ui/Card';

export const Journal: React.FC = () => {
  return (
    <div className="px-4 py-6 space-y-6 max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-heading text-gray-800 mb-2">Jurnal Hati</h1>
        <p className="text-gray-600 font-body">Catat perjalanan mindfulness dan refleksi harianmu</p>
      </div>

      <Card className="text-center">
        <div className="py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="font-heading text-gray-800 mb-2">Segera Hadir</h3>
          <p className="text-gray-600 font-body text-sm">
            Jurnal digital untuk mencatat pikiran dan perasaanmu
          </p>
        </div>
      </Card>
    </div>
  );
};