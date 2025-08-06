import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { courseService } from '../../services/courseService';
import type { Certificate } from '../../types/progress';

interface CertificateDisplayProps {
  className?: string;
}

export const CertificateDisplay: React.FC<CertificateDisplayProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  const loadCertificates = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userCertificates = await courseService.getUserCertificates(user.uid);
      setCertificates(userCertificates);
    } catch (error) {
      console.error('Error loading certificates:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadCertificates();
    }
  }, [user, loadCertificates]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} jam ${minutes} menit`;
    }
    return `${minutes} menit`;
  };

  const handleDownloadCertificate = (certificate: Certificate) => {
    // In a real implementation, this would download the PDF certificate
    console.log('Downloading certificate:', certificate.id);
    
    // For now, we'll create a simple text representation
    const certificateText = `
SERTIFIKAT PENYELESAIAN

${certificate.title}

Diberikan kepada peserta yang telah menyelesaikan kursus dengan dedikasi dan komitmen.

Tanggal: ${formatDate(certificate.issuedAt)}
Kode Verifikasi: ${certificate.verificationCode}
Waktu Penyelesaian: ${formatDuration(certificate.completionTime)}

Keterampilan yang Dikuasai:
${certificate.skills.map(skill => `• ${skill}`).join('\n')}
    `;

    // Create and download as text file
    const blob = new Blob([certificateText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sertifikat-${certificate.verificationCode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareCertificate = (certificate: Certificate) => {
    if (navigator.share) {
      navigator.share({
        title: certificate.title,
        text: `Saya telah menyelesaikan ${certificate.title}! Kode verifikasi: ${certificate.verificationCode}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      const shareText = `Saya telah menyelesaikan ${certificate.title}! Kode verifikasi: ${certificate.verificationCode}`;
      navigator.clipboard.writeText(shareText);
      alert('Link sertifikat telah disalin ke clipboard!');
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Sertifikat Saya</h3>
          <p className="text-gray-600">
            {certificates.length} sertifikat telah Anda raih
          </p>
        </div>
        <div className="text-3xl">🏆</div>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📜</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Belum Ada Sertifikat
          </h4>
          <p className="text-gray-600 mb-4">
            Selesaikan kursus untuk mendapatkan sertifikat pertama Anda
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((certificate) => (
            <div
              key={certificate.id}
              className="group relative bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedCertificate(certificate)}
            >
              {/* Certificate Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="text-xs font-medium text-blue-600 mb-1">
                    SERTIFIKAT PENYELESAIAN
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                    {certificate.title}
                  </h4>
                </div>
                <div className="text-2xl opacity-80">🏅</div>
              </div>

              {/* Certificate Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Tanggal:</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(certificate.issuedAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Waktu Belajar:</span>
                  <span className="font-medium text-gray-900">
                    {formatDuration(certificate.completionTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Kode:</span>
                  <span className="font-mono font-medium text-blue-600">
                    {certificate.verificationCode}
                  </span>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <div className="text-xs text-gray-600 mb-2">Keterampilan:</div>
                <div className="flex flex-wrap gap-1">
                  {certificate.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white bg-opacity-70 text-blue-700 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {certificate.skills.length > 3 && (
                    <span className="px-2 py-1 bg-white bg-opacity-70 text-gray-500 text-xs rounded-full">
                      +{certificate.skills.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadCertificate(certificate);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors"
                >
                  📥 Unduh
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShareCertificate(certificate);
                  }}
                  className="flex-1 px-3 py-2 bg-white text-blue-600 text-xs rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                >
                  📤 Bagikan
                </button>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-5 rounded-xl transition-all pointer-events-none" />
            </div>
          ))}
        </div>
      )}

      {/* Certificate Detail Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            {/* Certificate Design */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-4 border-blue-200 rounded-xl p-8 mb-6">
              <div className="text-center space-y-6">
                {/* Header */}
                <div className="space-y-2">
                  <div className="text-4xl">🏆</div>
                  <div className="text-xs font-bold text-blue-600 tracking-widest">
                    SERTIFIKAT PENYELESAIAN
                  </div>
                  <div className="text-sm text-gray-600">
                    SEMBALUN MEDITATION APP
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedCertificate.title}
                  </h2>
                  <div className="w-32 h-px bg-gradient-to-r from-blue-300 to-purple-300 mx-auto" />
                </div>

                {/* Description */}
                <p className="text-gray-700 text-sm leading-relaxed max-w-md mx-auto">
                  {selectedCertificate.description}
                </p>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Tanggal Penyelesaian</div>
                    <div className="font-semibold text-gray-900">
                      {formatDate(selectedCertificate.issuedAt)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Waktu Belajar</div>
                    <div className="font-semibold text-gray-900">
                      {formatDuration(selectedCertificate.completionTime)}
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <div className="text-gray-600 text-sm mb-3">Keterampilan yang Dikuasai</div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {selectedCertificate.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white bg-opacity-80 text-blue-700 text-sm rounded-full border border-blue-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Verification */}
                <div className="pt-4 border-t border-blue-200">
                  <div className="text-xs text-gray-600">Kode Verifikasi</div>
                  <div className="font-mono font-bold text-blue-600 text-lg tracking-wider">
                    {selectedCertificate.verificationCode}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={() => handleDownloadCertificate(selectedCertificate)}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                📥 Unduh Sertifikat
              </button>
              <button
                onClick={() => handleShareCertificate(selectedCertificate)}
                className="flex-1 px-6 py-3 bg-white text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors font-medium"
              >
                📤 Bagikan
              </button>
              <button
                onClick={() => setSelectedCertificate(null)}
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};