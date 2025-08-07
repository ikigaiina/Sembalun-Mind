import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Upload, Eye, HelpCircle, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Card, Button, Input } from '../ui';
import { ContentTemplate } from '../../data/contentSchema';

interface SimpleContentFormProps {
  template: ContentTemplate;
  initialData?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  className?: string;
}

type FieldType = 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'file';

interface ValidationError {
  field: string;
  message: string;
}

export const SimpleContentForm: React.FC<SimpleContentFormProps> = ({
  template,
  initialData,
  onSave,
  onCancel,
  className = ""
}) => {
  const [formData, setFormData] = useState<any>(initialData || {});
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Initialize form with default values
  useEffect(() => {
    if (!initialData) {
      const defaultData: any = {};
      template.fields.forEach(field => {
        switch (field.type) {
          case 'multiselect':
            defaultData[field.name] = [];
            break;
          case 'number':
            defaultData[field.name] = '';
            break;
          case 'checkbox':
            defaultData[field.name] = false;
            break;
          default:
            defaultData[field.name] = '';
        }
      });
      setFormData(defaultData);
    }
  }, [template, initialData]);

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error for this field
    setErrors(prev => prev.filter(error => error.field !== fieldName));
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = [];

    template.fields.forEach(field => {
      if (field.required) {
        const value = formData[field.name];
        
        if (!value || (Array.isArray(value) && value.length === 0) || 
            (typeof value === 'string' && value.trim() === '')) {
          newErrors.push({
            field: field.name,
            message: `${field.label} wajib diisi`
          });
        }
      }

      // Additional validations
      if (field.type === 'number' && formData[field.name]) {
        const numValue = Number(formData[field.name]);
        if (isNaN(numValue) || numValue < 0) {
          newErrors.push({
            field: field.name,
            message: `${field.label} harus berupa angka positif`
          });
        }
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Process form data
      const processedData = {
        ...formData,
        id: initialData?.id || `${template.type}_${Date.now()}`,
        type: template.type,
        status: 'draft',
        createdAt: initialData?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        // Auto-generate fields based on content
        ...generateAutoFields(formData, template.type)
      };

      await onSave(processedData);
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateAutoFields = (data: any, type: string) => {
    const autoFields: any = {};

    // Auto-generate personality match based on content analysis
    autoFields.personalityMatch = {
      introvert: analyzeForPersonality(data, 'introvert'),
      extrovert: analyzeForPersonality(data, 'extrovert'),
      analytical: analyzeForPersonality(data, 'analytical'),
      creative: analyzeForPersonality(data, 'creative'),
      emotional: analyzeForPersonality(data, 'emotional'),
      practical: analyzeForPersonality(data, 'practical')
    };

    // Auto-generate goal alignment based on keywords
    autoFields.goalAlignment = {
      stress: analyzeForGoal(data, ['stres', 'tenang', 'relaks', 'damai']),
      focus: analyzeForGoal(data, ['fokus', 'konsentrasi', 'perhatian']),
      sleep: analyzeForGoal(data, ['tidur', 'malam', 'istirahat']),
      anxiety: analyzeForGoal(data, ['cemas', 'khawatir', 'gelisah']),
      confidence: analyzeForGoal(data, ['percaya', 'yakin', 'berani']),
      spiritual: analyzeForGoal(data, ['spiritual', 'rohani', 'jiwa'])
    };

    // Auto-suggest time of day based on content
    if (type === 'meditation') {
      autoFields.timeOfDay = suggestTimeOfDay(data);
      autoFields.mood = suggestMoods(data);
    }

    return autoFields;
  };

  const analyzeForPersonality = (data: any, trait: string): boolean => {
    const text = (data.title + ' ' + data.description + ' ' + (data.instructions || '')).toLowerCase();
    
    const keywords = {
      introvert: ['sendiri', 'tenang', 'refleksi', 'dalam', 'pribadi'],
      extrovert: ['berbagi', 'komunitas', 'bersama', 'sosial', 'kelompok'],
      analytical: ['langkah', 'metode', 'sistematis', 'analisis', 'logis'],
      creative: ['imajinasi', 'visualisasi', 'kreatif', 'seni', 'ekspresif'],
      emotional: ['perasaan', 'emosi', 'hati', 'kasih', 'cinta'],
      practical: ['praktis', 'mudah', 'sederhana', 'efektif', 'fungsional']
    };

    return keywords[trait as keyof typeof keywords]?.some(keyword => 
      text.includes(keyword)
    ) || false;
  };

  const analyzeForGoal = (data: any, keywords: string[]): boolean => {
    const text = (data.title + ' ' + data.description + ' ' + (data.instructions || '')).toLowerCase();
    return keywords.some(keyword => text.includes(keyword));
  };

  const suggestTimeOfDay = (data: any): string[] => {
    const text = (data.title + ' ' + data.description).toLowerCase();
    const suggestions: string[] = [];
    
    if (text.includes('pagi') || text.includes('bangun')) suggestions.push('morning');
    if (text.includes('siang')) suggestions.push('afternoon');
    if (text.includes('sore')) suggestions.push('evening');
    if (text.includes('malam') || text.includes('tidur')) suggestions.push('night');
    
    return suggestions.length > 0 ? suggestions : ['morning', 'evening'];
  };

  const suggestMoods = (data: any): string[] => {
    const text = (data.title + ' ' + data.description).toLowerCase();
    const moods: string[] = [];
    
    if (text.includes('stres') || text.includes('tegang')) moods.push('anxious');
    if (text.includes('sedih')) moods.push('sad');
    if (text.includes('marah')) moods.push('angry');
    if (text.includes('lelah')) moods.push('tired');
    if (text.includes('tenang')) moods.push('calm');
    if (text.includes('bahagia')) moods.push('happy');
    
    return moods.length > 0 ? moods : ['calm'];
  };

  const renderField = (field: any) => {
    const error = errors.find(e => e.field === field.name);
    const value = formData[field.name] || '';

    const baseClasses = `w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
      error ? 'border-red-300' : 'border-gray-300'
    }`;

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={error ? 'border-red-300' : ''}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={field.name === 'instructions' ? 6 : 3}
            className={baseClasses}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            min="0"
            className={error ? 'border-red-300' : ''}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className={baseClasses}
          >
            <option value="">Pilih {field.label}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentValue = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      handleInputChange(field.name, [...currentValue, option]);
                    } else {
                      handleInputChange(field.name, currentValue.filter((v: string) => v !== option));
                    }
                  }}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 capitalize">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleInputChange(field.name, e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">{field.label}</span>
          </label>
        );

      case 'file':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Drag & drop file atau klik untuk upload
            </p>
            <input
              type="file"
              accept="audio/*,image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleInputChange(field.name, file.name);
                }
              }}
              className="hidden"
              id={`file-${field.name}`}
            />
            <label
              htmlFor={`file-${field.name}`}
              className="cursor-pointer text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Pilih File
            </label>
            {value && (
              <p className="text-sm text-gray-600 mt-2">
                File terpilih: {value}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const ContentPreview: React.FC = () => (
    <Card className="p-6 bg-gray-50">
      <h3 className="font-semibold text-gray-800 mb-4">Preview Konten</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-heading font-semibold text-gray-800">
            {formData.title || formData.name || 'Judul belum diisi'}
          </h4>
          {formData.description && (
            <p className="text-gray-600 mt-1">{formData.description}</p>
          )}
        </div>

        {formData.duration && (
          <div className="text-sm text-gray-500">
            <span className="font-medium">Durasi:</span> {formData.duration} menit
          </div>
        )}

        {formData.difficulty && (
          <div className="text-sm text-gray-500">
            <span className="font-medium">Tingkat:</span> {formData.difficulty}
          </div>
        )}

        {formData.instructions && (
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Instruksi:</h5>
            <div className="text-sm text-gray-600 space-y-1">
              {formData.instructions.split('\n').filter((line: string) => line.trim()).map((line: string, index: number) => (
                <p key={index}>• {line.trim()}</p>
              ))}
            </div>
          </div>
        )}

        {formData.benefits && (
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Manfaat:</h5>
            <div className="text-sm text-gray-600 space-y-1">
              {formData.benefits.split('\n').filter((line: string) => line.trim()).map((line: string, index: number) => (
                <p key={index}>• {line.trim()}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-heading font-semibold text-gray-800">
            {template.title}
          </h2>
          <p className="text-gray-600 text-sm mt-1">{template.description}</p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
        >
          <Eye className="w-4 h-4 mr-2" />
          {showPreview ? 'Sembunyikan' : 'Preview'}
        </Button>
      </div>

      <div className={`grid ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
        {/* Form */}
        <Card className="p-6">
          <form className="space-y-6">
            {template.fields.map(field => (
              <motion.div
                key={field.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {field.helpText && (
                    <div className="group relative">
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      <div className="invisible group-hover:visible absolute z-10 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg -top-2 left-6">
                        {field.helpText}
                      </div>
                    </div>
                  )}
                </div>
                
                {renderField(field)}
                
                {errors.find(e => e.field === field.name) && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.find(e => e.field === field.name)?.message}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </form>

          {/* Auto-generated Information */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
              <Info className="w-4 h-4" />
              <span className="font-medium">Informasi otomatis akan ditambahkan berdasarkan konten:</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
              <div>
                <div className="font-medium mb-1">Personality Match:</div>
                <div>• Analisis tipe kepribadian</div>
                <div>• Preferensi pengguna</div>
              </div>
              <div>
                <div className="font-medium mb-1">Goal Alignment:</div>
                <div>• Kesesuaian dengan tujuan</div>
                <div>• Rekomendasi waktu & mood</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Preview */}
        {showPreview && <ContentPreview />}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button 
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="w-4 h-4 mr-2" />
          Batal
        </Button>
        
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
            </motion.div>
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isSubmitting ? 'Menyimpan...' : 'Simpan Konten'}
        </Button>
      </div>

      {errors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2 text-red-800 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Mohon perbaiki kesalahan berikut:</span>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error.message}</li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};