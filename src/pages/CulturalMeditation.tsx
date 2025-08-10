import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mountain, Crown, Waves, TreePine, Home, Users } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useSmartBack } from '../hooks/useNavigationHistory';

export const CulturalMeditation: React.FC = () => {
  const navigate = useNavigate();
  const { goBack } = useSmartBack('/explore');

  const culturalPractices = [
    {
      id: 'minangkabau',
      title: 'Meditasi Kearifan Minangkabau',
      description: 'Menghubungkan dengan nilai-nilai luhur budaya Minangkabau seperti silaturahmi dan gotong royong',
      region: 'Sumatra',
      duration: '18 menit',
      difficulty: 'Menengah',
      icon: <Home className="w-6 h-6" />,
      color: 'from-amber-400 to-orange-500',
      tags: ['keluarga', 'kebijaksanaan', 'rumah gadang'],
      path: '/meditasi-minangkabau'
    },
    {
      id: 'sembalun',
      title: 'Meditasi Gunung Sembalun',
      description: 'Meditasi terinspirasi dari keindahan alam dan spiritualitas pegunungan Lombok',
      region: 'Nusa Tenggara Barat',
      duration: '20 menit',
      difficulty: 'Menengah',
      icon: <Mountain className="w-6 h-6" />,
      color: 'from-emerald-400 to-teal-500',
      tags: ['alam', 'ketenangan', 'gunung'],
      path: '/meditation/sembalun'
    },
    {
      id: 'javanese',
      title: 'Meditasi Jawa: Keheningan Batin',
      description: 'Praktik meditasi tradisional Jawa dengan fokus pada keheningan dan kebijaksanaan',
      region: 'Jawa',
      duration: '25 menit',
      difficulty: 'Lanjutan',
      icon: <Crown className="w-6 h-6" />,
      color: 'from-purple-400 to-indigo-500',
      tags: ['kebijaksanaan', 'nrimo', 'sabar'],
      path: '/meditation/javanese'
    },
    {
      id: 'bali',
      title: 'Meditasi Tri Hita Karana',
      description: 'Meditasi berdasarkan filosofi Bali tentang harmoni dengan alam, sesama, dan Tuhan',
      region: 'Bali',
      duration: '22 menit',
      difficulty: 'Menengah',
      icon: <Waves className="w-6 h-6" />,
      color: 'from-cyan-400 to-blue-500',
      tags: ['harmoni', 'alam', 'spiritual'],
      path: '/meditation/bali'
    },
    {
      id: 'sundanese',
      title: 'Meditasi Sunda: Kehidupan Sederhana',
      description: 'Menggali kedamaian melalui nilai kesederhanaan dan keterhubungan dengan alam',
      region: 'Jawa Barat',
      duration: '15 menit',
      difficulty: 'Pemula',
      icon: <TreePine className="w-6 h-6" />,
      color: 'from-green-400 to-emerald-500',
      tags: ['sederhana', 'alam', 'kesahajaan'],
      path: '/meditation/sundanese'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            className="mr-3"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meditasi Nusantara</h1>
            <p className="text-gray-600">Kearifan lokal Indonesia dalam praktik meditasi</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Introduction */}
        <Card className="mb-8 p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Menjalin Koneksi dengan Kearifan Budaya Indonesia
            </h2>
            <p className="text-gray-600">
              Setiap daerah di Indonesia memiliki kekayaan spiritual dan kebijaksanaan yang unik. 
              Dalam seri meditasi ini, kita akan menjalin koneksi dengan nilai-nilai luhur dari berbagai 
              tradisi budaya Nusantara.
            </p>
          </div>
        </Card>

        {/* Cultural Practices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {culturalPractices.map((practice) => (
            <Card 
              key={practice.id} 
              className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className={`h-2 bg-gradient-to-r ${practice.color}`}></div>
              <div className="p-6">
                <div className="flex items-start mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${practice.color} text-white mr-4`}>
                    {practice.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{practice.title}</h3>
                    <p className="text-gray-600 text-sm">{practice.region}</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{practice.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {practice.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center mb-4">
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">{practice.duration}</span> • {practice.difficulty}
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  className="w-full"
                  onClick={() => navigate(practice.path)}
                >
                  Mulai Meditasi
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Wisdom Quote */}
        <Card className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
          <div className="text-center">
            <p className="text-amber-800 italic text-lg mb-2">
              "Bhinneka Tunggal Ika - Berbeda-beda tetapi satu jua"
            </p>
            <p className="text-amber-700 text-sm">
              Keberagaman budaya Indonesia adalah kekayaan yang memperkaya praktik spiritual kita
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};