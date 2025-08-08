import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, MessageCircle, Tag } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import type { MoodType } from '../../types/mood';
import { getMoodColor, getMoodEmoji, getMoodLabel } from '../../types/mood';

interface MoodNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string, tags: string[]) => void;
  selectedMood: MoodType;
  existingNote?: string;
  existingTags?: string[];
}

export const MoodNoteModal: React.FC<MoodNoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedMood,
  existingNote = '',
  existingTags = []
}) => {
  const [note, setNote] = useState(existingNote);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(existingTags);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      onSave(note.trim(), tags);
      onClose();
    } catch (error) {
      console.error('Error saving mood note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTag();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                  style={{ backgroundColor: getMoodColor(selectedMood) }}
                >
                  {getMoodEmoji(selectedMood)}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Catatan Perasaan
                  </h2>
                  <p className="text-sm text-gray-600">
                    {getMoodLabel(selectedMood)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Note Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageCircle className="w-4 h-4 inline mr-1" />
                Ceritakan perasaan Anda
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Bagaimana perasaan Anda hari ini? Apa yang membuat Anda merasa seperti ini?"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                rows={4}
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {note.length}/500 karakter
              </div>
            </div>

            {/* Tags Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Tag (opsional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="kerja, keluarga, olahraga..."
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  maxLength={20}
                  disabled={tags.length >= 5}
                />
                <Button
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || tags.length >= 5}
                  size="sm"
                  variant="outline"
                >
                  Tambah
                </Button>
              </div>
              
              {/* Tags Display */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag, index) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-blue-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-1">
                {tags.length}/5 tag • Tekan Enter untuk menambah
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSaving}
              >
                Batal
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Menyimpan...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Simpan
                  </div>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};