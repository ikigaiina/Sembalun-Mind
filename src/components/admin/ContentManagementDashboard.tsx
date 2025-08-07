import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit3, Trash2, Eye, Upload, Download, Save, X,
  Search, Filter, Grid, List, Calendar, Tag, User, BarChart3,
  Copy, Archive, RefreshCw, FileText, Image, Video, Headphones,
  CheckCircle, Clock, AlertCircle, Star
} from 'lucide-react';
import { Card, Button, Input } from '../ui';
import type { MeditationContent, QuoteContent, BreathingExercise } from '../../data/contentSchema';
import { CONTENT_TEMPLATES } from '../../data/contentSchema';
import defaultContent from '../../data/defaultContent.json';

interface AdminContentProps {
  className?: string;
}

type ContentType = 'meditation' | 'quote' | 'breathing';
type ViewMode = 'grid' | 'list';
type FilterStatus = 'all' | 'draft' | 'published' | 'archived';

interface ContentStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
  thisWeek: number;
}

export const ContentManagementDashboard: React.FC<AdminContentProps> = ({ className = "" }) => {
  const [activeTab, setActiveTab] = useState<ContentType>('meditation');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingContent, setEditingContent] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  
  // Mock data - dalam implementasi nyata akan dari database/file
  const [contentData, setContentData] = useState({
    meditations: defaultContent.meditations as MeditationContent[],
    quotes: defaultContent.quotes as QuoteContent[],
    breathingExercises: defaultContent.breathingExercises as BreathingExercise[]
  });

  // Calculate stats
  const calculateStats = (type: ContentType): ContentStats => {
    const data = type === 'meditation' ? contentData.meditations :
                 type === 'quote' ? contentData.quotes :
                 contentData.breathingExercises;
    
    return {
      total: data.length,
      published: data.filter(item => item.status === 'published').length,
      draft: data.filter(item => item.status === 'draft').length,
      archived: data.filter(item => item.status === 'archived').length,
      thisWeek: data.filter(item => {
        const createdDate = new Date(item.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdDate >= weekAgo;
      }).length
    };
  };

  const currentStats = calculateStats(activeTab);
  const currentData = activeTab === 'meditation' ? contentData.meditations :
                     activeTab === 'quote' ? contentData.quotes :
                     contentData.breathingExercises;

  // Filter and search
  const filteredData = currentData.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ('text' in item && item.text?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateContent = (template: any) => {
    setSelectedTemplate(template);
    setEditingContent({
      id: `new_${Date.now()}`,
      type: template.type,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...getDefaultValues(template)
    });
    setShowCreateModal(true);
  };

  const getDefaultValues = (template: any) => {
    const defaults: any = {};
    template.fields.forEach((field: any) => {
      if (field.type === 'multiselect' || field.name === 'tags') {
        defaults[field.name] = [];
      } else if (field.type === 'number') {
        defaults[field.name] = 0;
      } else if (field.type === 'checkbox') {
        defaults[field.name] = false;
      } else {
        defaults[field.name] = '';
      }
    });
    return defaults;
  };

  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusConfig = {
      published: { color: 'text-green-700 bg-green-100', icon: CheckCircle },
      draft: { color: 'text-yellow-700 bg-yellow-100', icon: Clock },
      archived: { color: 'text-gray-700 bg-gray-100', icon: Archive }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || AlertCircle;
    
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config?.color || 'text-gray-700 bg-gray-100'}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

  const ContentCard: React.FC<{ item: any }> = ({ item }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card className="p-4 hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary-400">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-heading font-semibold text-gray-800 mb-2 line-clamp-2">
              {item.title || item.name || item.text?.substring(0, 50) + '...'}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {item.description || item.text?.substring(0, 100) + '...'}
            </p>
          </div>
          <StatusBadge status={item.status} />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center space-x-3">
            {item.duration && (
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {item.duration} min
              </span>
            )}
            {item.difficulty && (
              <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                {item.difficulty}
              </span>
            )}
            {item.category && (
              <span className="flex items-center">
                <Tag className="w-3 h-3 mr-1" />
                {item.category}
              </span>
            )}
          </div>
        </div>

        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 3).map((tag: string, index: number) => (
              <span key={index} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{item.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {new Date(item.updatedAt).toLocaleDateString('id-ID')}
          </div>
          
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs"
              onClick={() => {
                setEditingContent(item);
                setShowCreateModal(true);
              }}
            >
              <Edit3 className="w-3 h-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs"
              onClick={() => {
                // Preview functionality
              }}
            >
              <Eye className="w-3 h-3" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs text-red-600"
              onClick={() => {
                // Delete functionality
                if (confirm('Yakin ingin menghapus konten ini?')) {
                  // Handle delete
                }
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const CreateContentModal: React.FC = () => (
    <AnimatePresence>
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreateModal(false);
              setEditingContent(null);
              setSelectedTemplate(null);
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-heading font-semibold text-gray-800">
                {editingContent?.id?.startsWith('new_') ? 'Buat Konten Baru' : 'Edit Konten'}
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingContent(null);
                  setSelectedTemplate(null);
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-4">
              {selectedTemplate ? (
                <>
                  {/* Template-based form would go here */}
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{selectedTemplate.title}</h3>
                    <p className="text-gray-600 mb-4">{selectedTemplate.description}</p>
                    <p className="text-sm text-gray-500">
                      Form builder akan diimplementasikan berdasarkan template fields
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                  <p className="text-gray-600">Template tidak ditemukan</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
              <Button 
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingContent(null);
                  setSelectedTemplate(null);
                }}
              >
                Batal
              </Button>
              <Button>
                <Save className="w-4 h-4 mr-2" />
                {editingContent?.id?.startsWith('new_') ? 'Buat Konten' : 'Simpan Perubahan'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-heading font-bold text-gray-900">
                Admin Content Management
              </h1>
              <p className="text-gray-600 mt-1">
                Kelola konten meditasi, kutipan, dan latihan pernapasan
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-lg font-semibold text-gray-900">{currentStats.total}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="text-lg font-semibold text-gray-900">{currentStats.published}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Draft</p>
                  <p className="text-lg font-semibold text-gray-900">{currentStats.draft}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <Archive className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Archived</p>
                  <p className="text-lg font-semibold text-gray-900">{currentStats.archived}</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                  <Star className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">This Week</p>
                  <p className="text-lg font-semibold text-gray-900">{currentStats.thisWeek}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6">
            {[
              { key: 'meditation', label: 'Meditasi', icon: User, count: contentData.meditations.length },
              { key: 'quote', label: 'Kutipan', icon: FileText, count: contentData.quotes.length },
              { key: 'breathing', label: 'Pernapasan', icon: RefreshCw, count: contentData.breathingExercises.length }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as ContentType)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    activeTab === tab.key ? 'bg-white text-primary-600' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Search and Filter */}
            <div className="flex flex-1 gap-3 max-w-2xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder={`Cari ${activeTab === 'meditation' ? 'meditasi' : activeTab === 'quote' ? 'kutipan' : 'teknik pernapasan'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* View Controls */}
            <div className="flex items-center space-x-3">
              <div className="flex border border-gray-300 rounded-md">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Create Content Dropdown */}
              <div className="relative group">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Konten
                </Button>
                
                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  {CONTENT_TEMPLATES.filter(template => template.type === activeTab).map(template => (
                    <button
                      key={template.type}
                      onClick={() => handleCreateContent(template)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg border-b last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{template.title}</div>
                      <div className="text-sm text-gray-600">{template.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada konten</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Tidak ada konten yang sesuai dengan pencarian atau filter Anda.'
                : `Mulai buat konten ${activeTab} pertama Anda.`
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <Button onClick={() => handleCreateContent(CONTENT_TEMPLATES.find(t => t.type === activeTab)!)}>
                <Plus className="w-4 h-4 mr-2" />
                Buat Konten Pertama
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            key={`${activeTab}-${viewMode}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}
          >
            <AnimatePresence mode="popLayout">
              {filteredData.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <CreateContentModal />
    </div>
  );
};