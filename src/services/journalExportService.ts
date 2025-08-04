import { journalingService } from './journalingService';
import type { JournalEntry } from './journalingService';
import { gratitudeJournalService } from './gratitudeJournalService';
import type { GratitudeEntry } from './gratitudeJournalService';
import { weeklyReflectionService } from './weeklyReflectionService';
import type { WeeklyReflectionSession } from './weeklyReflectionService';
import { reflectionPromptsService } from './reflectionPromptsService';
import type { ReflectionSession } from './reflectionPromptsService';
import { offlineMoodJournalService } from './offlineMoodJournalService';

export interface ExportOptions {
  format: 'json' | 'pdf' | 'txt' | 'csv' | 'markdown' | 'docx';
  dateRange?: {
    start: Date;
    end: Date;
  };
  includeTypes: {
    journals: boolean;
    gratitude: boolean;
    moods: boolean;
    weeklyReflections: boolean;
    reflectionSessions: boolean;
  };
  includeMetadata: boolean;
  includeImages: boolean;
  privacy: 'all' | 'private_only' | 'shared_only';
  compressionLevel: 'none' | 'low' | 'medium' | 'high';
  customization?: {
    template?: string;
    styling?: Record<string, any>;
    coverPage?: boolean;
    tableOfContents?: boolean;
  };
}

export interface ExportResult {
  success: boolean;
  downloadUrl?: string;
  filename: string;
  size: number; // bytes
  format: string;
  exportDate: Date;
  itemCount: number;
  error?: string;
}

export interface ExportHistory {
  id: string;
  userId: string;
  filename: string;
  format: string;
  size: number;
  itemCount: number;
  exportDate: Date;
  downloadUrl?: string;
  isExpired: boolean;
  options: ExportOptions;
}

export interface BackupSchedule {
  userId: string;
  isEnabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  format: ExportOptions['format'];
  includeTypes: ExportOptions['includeTypes'];
  autoCleanup: boolean;
  maxBackups: number;
  lastBackup?: Date;
  nextBackup?: Date;
  storageLocation: 'local' | 'cloud' | 'email';
  cloudProvider?: 'google_drive' | 'dropbox' | 'onedrive';
  emailAddress?: string;
}

export interface ImportOptions {
  format: 'json' | 'csv' | 'txt';
  mergeStrategy: 'skip_duplicates' | 'overwrite' | 'create_new';
  validateData: boolean;
  preserveTimestamps: boolean;
  tagPrefix?: string;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: Array<{
    line?: number;
    entry?: string;
    error: string;
  }>;
  summary: {
    journals: number;
    gratitude: number;
    moods: number;
    reflections: number;
  };
}

export class JournalExportService {
  private static instance: JournalExportService;
  private exportHistory: Map<string, ExportHistory[]> = new Map();

  static getInstance(): JournalExportService {
    if (!JournalExportService.instance) {
      JournalExportService.instance = new JournalExportService();
    }
    return JournalExportService.instance;
  }

  async exportJournalData(userId: string, options: ExportOptions): Promise<ExportResult> {
    try {
      // Gather all data based on options
      const data = await this.gatherExportData(userId, options);
      
      if (data.totalItems === 0) {
        throw new Error('No data found for the specified criteria');
      }

      // Generate export based on format
      let exportContent: string | Blob;
      let filename: string;

      switch (options.format) {
        case 'json':
          exportContent = await this.generateJSONExport(data, options);
          filename = `sembalun-journal-${userId}-${Date.now()}.json`;
          break;
        case 'pdf':
          exportContent = await this.generatePDFExport(data, options);
          filename = `sembalun-journal-${userId}-${Date.now()}.pdf`;
          break;
        case 'txt':
          exportContent = await this.generateTextExport(data, options);
          filename = `sembalun-journal-${userId}-${Date.now()}.txt`;
          break;
        case 'csv':
          exportContent = await this.generateCSVExport(data, options);
          filename = `sembalun-journal-${userId}-${Date.now()}.csv`;
          break;
        case 'markdown':
          exportContent = await this.generateMarkdownExport(data, options);
          filename = `sembalun-journal-${userId}-${Date.now()}.md`;
          break;
        case 'docx':
          exportContent = await this.generateDocxExport(data, options);
          filename = `sembalun-journal-${userId}-${Date.now()}.docx`;
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      // Create download URL
      const downloadUrl = await this.createDownloadUrl(exportContent, filename);
      
      // Calculate size
      const size = typeof exportContent === 'string' 
        ? new Blob([exportContent]).size 
        : exportContent.size;

      // Save to export history
      const exportResult: ExportResult = {
        success: true,
        downloadUrl,
        filename,
        size,
        format: options.format,
        exportDate: new Date(),
        itemCount: data.totalItems
      };

      await this.saveExportHistory(userId, exportResult, options);

      console.log(`Journal export completed: ${filename} (${size} bytes)`);
      return exportResult;
    } catch (error) {
      console.error('Error exporting journal data:', error);
      return {
        success: false,
        filename: '',
        size: 0,
        format: options.format,
        exportDate: new Date(),
        itemCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async importJournalData(
    userId: string, 
    file: File | string, 
    options: ImportOptions
  ): Promise<ImportResult> {
    try {
      let content: string;
      
      if (file instanceof File) {
        content = await this.readFileContent(file);
      } else {
        content = file;
      }

      // Parse content based on format
      const parsedData = await this.parseImportContent(content, options.format);
      
      if (!parsedData || parsedData.length === 0) {
        throw new Error('No valid data found in import file');
      }

      // Validate data if requested
      if (options.validateData) {
        await this.validateImportData(parsedData);
      }

      // Import data
      const result = await this.processImportData(userId, parsedData, options);
      
      console.log(`Import completed: ${result.importedCount} items imported`);
      return result;
    } catch (error) {
      console.error('Error importing journal data:', error);
      return {
        success: false,
        importedCount: 0,
        skippedCount: 0,
        errorCount: 1,
        errors: [{ error: error instanceof Error ? error.message : 'Unknown error' }],
        summary: { journals: 0, gratitude: 0, moods: 0, reflections: 0 }
      };
    }
  }

  async scheduleAutoBackup(userId: string, schedule: BackupSchedule): Promise<void> {
    try {
      // Calculate next backup date
      const nextBackup = this.calculateNextBackupDate(schedule.frequency);
      schedule.nextBackup = nextBackup;

      // Save schedule
      await this.saveBackupSchedule(userId, schedule);
      
      // Set up recurring backup
      await this.setupRecurringBackup(userId, schedule);
      
      console.log(`Auto backup scheduled for user ${userId}: ${schedule.frequency}`);
    } catch (error) {
      console.error('Error scheduling auto backup:', error);
      throw error;
    }
  }

  async getExportHistory(userId: string, limit: number = 20): Promise<ExportHistory[]> {
    try {
      const history = this.exportHistory.get(userId) || [];
      return history
        .sort((a, b) => new Date(b.exportDate).getTime() - new Date(a.exportDate).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting export history:', error);
      return [];
    }
  }

  async getBackupSchedule(userId: string): Promise<BackupSchedule | null> {
    try {
      // Load from storage
      return null; // Mock implementation
    } catch (error) {
      console.error('Error getting backup schedule:', error);
      return null;
    }
  }

  async createQuickBackup(userId: string): Promise<ExportResult> {
    const quickOptions: ExportOptions = {
      format: 'json',
      includeTypes: {
        journals: true,
        gratitude: true,
        moods: true,
        weeklyReflections: true,
        reflectionSessions: true
      },
      includeMetadata: true,
      includeImages: false,
      privacy: 'all',
      compressionLevel: 'medium'
    };

    return await this.exportJournalData(userId, quickOptions);
  }

  async shareExport(exportId: string, platform: 'email' | 'cloud' | 'link'): Promise<string> {
    try {
      // Mock implementation for sharing
      const shareUrl = `https://sembalun.app/shared-export/${exportId}`;
      console.log(`Export shared via ${platform}: ${shareUrl}`);
      return shareUrl;
    } catch (error) {
      console.error('Error sharing export:', error);
      throw error;
    }
  }

  async deleteExport(userId: string, exportId: string): Promise<void> {
    try {
      const history = this.exportHistory.get(userId) || [];
      const filteredHistory = history.filter(h => h.id !== exportId);
      this.exportHistory.set(userId, filteredHistory);
      
      console.log(`Export deleted: ${exportId}`);
    } catch (error) {
      console.error('Error deleting export:', error);
      throw error;
    }
  }

  // Private helper methods
  private async gatherExportData(userId: string, options: ExportOptions): Promise<{
    journals: JournalEntry[];
    gratitude: GratitudeEntry[];
    moods: any[];
    weeklyReflections: WeeklyReflectionSession[];
    reflectionSessions: ReflectionSession[];
    totalItems: number;
  }> {
    const data = {
      journals: [] as JournalEntry[],
      gratitude: [] as GratitudeEntry[],
      moods: [] as any[],
      weeklyReflections: [] as WeeklyReflectionSession[],
      reflectionSessions: [] as ReflectionSession[],
      totalItems: 0
    };

    // Gather journals
    if (options.includeTypes.journals) {
      const filters = options.dateRange ? { dateRange: options.dateRange } : undefined;
      data.journals = await journalingService.getUserJournalEntries(userId, filters);
    }

    // Gather gratitude entries
    if (options.includeTypes.gratitude) {
      const filters = options.dateRange ? { dateRange: options.dateRange } : undefined;
      data.gratitude = await gratitudeJournalService.getGratitudeEntries(userId, filters);
    }

    // Gather mood entries
    if (options.includeTypes.moods) {
      const days = options.dateRange 
        ? Math.ceil((options.dateRange.end.getTime() - options.dateRange.start.getTime()) / (1000 * 60 * 60 * 24))
        : 365;
      data.moods = await offlineMoodJournalService.getMoodHistory(userId, days);
    }

    // Gather weekly reflections
    if (options.includeTypes.weeklyReflections) {
      data.weeklyReflections = await weeklyReflectionService.getReflectionHistory(userId);
    }

    // Gather reflection sessions
    if (options.includeTypes.reflectionSessions) {
      data.reflectionSessions = await reflectionPromptsService.getReflectionHistory(userId);
    }

    // Filter by privacy settings
    if (options.privacy !== 'all') {
      data.journals = data.journals.filter(j => 
        options.privacy === 'private_only' ? j.privacy === 'private' : j.privacy !== 'private'
      );
    }

    // Calculate total items
    data.totalItems = data.journals.length + data.gratitude.length + data.moods.length + 
                     data.weeklyReflections.length + data.reflectionSessions.length;

    return data;
  }

  private async generateJSONExport(data: any, options: ExportOptions): Promise<string> {
    const exportData = {
      ...(options.includeMetadata && {
        metadata: {
          exportDate: new Date().toISOString(),
          format: 'json',
          version: '1.0',
          source: 'Sembalun Meditation App',
          itemCount: data.totalItems,
          includeMetadata: options.includeMetadata
        }
      }),
      data: {
        ...(options.includeTypes.journals && { journals: data.journals }),
        ...(options.includeTypes.gratitude && { gratitude: data.gratitude }),
        ...(options.includeTypes.moods && { moods: data.moods }),
        ...(options.includeTypes.weeklyReflections && { weeklyReflections: data.weeklyReflections }),
        ...(options.includeTypes.reflectionSessions && { reflectionSessions: data.reflectionSessions })
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  private async generatePDFExport(data: any, options: ExportOptions): Promise<Blob> {
    // Mock PDF generation - would use a library like jsPDF or Puppeteer
    const content = await this.generateTextExport(data, options);
    return new Blob([content], { type: 'application/pdf' });
  }

  private async generateTextExport(data: any, options: ExportOptions): Promise<string> {
    let content = `SEMBALUN JOURNAL EXPORT\n`;
    content += `Export Date: ${new Date().toLocaleDateString('id-ID')}\n`;
    content += `Total Items: ${data.totalItems}\n`;
    content += `${'='.repeat(50)}\n\n`;

    // Export journals
    if (options.includeTypes.journals && data.journals.length > 0) {
      content += `JOURNAL ENTRIES (${data.journals.length})\n`;
      content += `${'-'.repeat(30)}\n\n`;
      
      for (const journal of data.journals) {
        content += `Date: ${journal.createdAt.toLocaleDateString('id-ID')}\n`;
        content += `Title: ${journal.title || 'Untitled'}\n`;
        content += `Type: ${journal.type}\n`;
        if (journal.tags.length > 0) {
          content += `Tags: ${journal.tags.join(', ')}\n`;
        }
        content += `Content:\n${journal.content}\n\n`;
        content += `${'-'.repeat(20)}\n\n`;
      }
    }

    // Export gratitude entries
    if (options.includeTypes.gratitude && data.gratitude.length > 0) {
      content += `GRATITUDE ENTRIES (${data.gratitude.length})\n`;
      content += `${'-'.repeat(30)}\n\n`;
      
      for (const gratitude of data.gratitude) {
        content += `Date: ${gratitude.date.toLocaleDateString('id-ID')}\n`;
        content += `Gratitude Items:\n`;
        gratitude.gratitudes.forEach((item: any, index: number) => {
          content += `  ${index + 1}. ${item.text} (${item.category})\n`;
        });
        if (gratitude.reflection) {
          content += `Reflection: ${gratitude.reflection}\n`;
        }
        content += `${'-'.repeat(20)}\n\n`;
      }
    }

    // Export mood entries
    if (options.includeTypes.moods && data.moods.length > 0) {
      content += `MOOD ENTRIES (${data.moods.length})\n`;
      content += `${'-'.repeat(30)}\n\n`;
      
      for (const mood of data.moods) {
        content += `Date: ${mood.date.toLocaleDateString('id-ID')}\n`;
        content += `Overall: ${mood.overall}/5\n`;
        content += `Energy: ${mood.energy}/5\n`;
        content += `Stress: ${mood.stress}/5\n`;
        if (mood.notes) {
          content += `Notes: ${mood.notes}\n`;
        }
        content += `${'-'.repeat(20)}\n\n`;
      }
    }

    return content;
  }

  private async generateCSVExport(data: any, options: ExportOptions): Promise<string> {
    let csvContent = '';

    // Create a unified CSV with all entry types
    const headers = [
      'Type', 'Date', 'Title', 'Content', 'Mood', 'Tags', 'Category', 'Additional_Data'
    ];
    csvContent += headers.join(',') + '\n';

    // Add journal entries
    if (options.includeTypes.journals) {
      for (const journal of data.journals) {
        const row = [
          'Journal',
          journal.createdAt.toISOString(),
          this.escapeCsvField(journal.title || ''),
          this.escapeCsvField(journal.content),
          journal.mood?.after || journal.mood?.before || '',
          this.escapeCsvField(journal.tags.join(';')),
          journal.type,
          ''
        ];
        csvContent += row.join(',') + '\n';
      }
    }

    // Add gratitude entries
    if (options.includeTypes.gratitude) {
      for (const gratitude of data.gratitude) {
        const gratitudeText = gratitude.gratitudes.map((g: any) => g.text).join('; ');
        const row = [
          'Gratitude',
          gratitude.date.toISOString(),
          'Gratitude Entry',
          this.escapeCsvField(gratitudeText),
          gratitude.mood.after || '',
          '',
          'gratitude',
          this.escapeCsvField(gratitude.reflection || '')
        ];
        csvContent += row.join(',') + '\n';
      }
    }

    // Add mood entries
    if (options.includeTypes.moods) {
      for (const mood of data.moods) {
        const row = [
          'Mood',
          mood.date.toISOString(),
          'Mood Check-in',
          this.escapeCsvField(mood.notes || ''),
          mood.overall.toString(),
          this.escapeCsvField(mood.tags.join(';')),
          'mood',
          `energy:${mood.energy},stress:${mood.stress}`
        ];
        csvContent += row.join(',') + '\n';
      }
    }

    return csvContent;
  }

  private async generateMarkdownExport(data: any, options: ExportOptions): Promise<string> {
    let content = `# Sembalun Journal Export\n\n`;
    content += `**Export Date:** ${new Date().toLocaleDateString('id-ID')}\n`;
    content += `**Total Items:** ${data.totalItems}\n\n`;

    // Table of contents
    if (options.customization?.tableOfContents) {
      content += `## Table of Contents\n\n`;
      if (options.includeTypes.journals) content += `- [Journal Entries](#journal-entries)\n`;
      if (options.includeTypes.gratitude) content += `- [Gratitude Entries](#gratitude-entries)\n`;
      if (options.includeTypes.moods) content += `- [Mood Entries](#mood-entries)\n`;
      content += `\n---\n\n`;
    }

    // Journal entries
    if (options.includeTypes.journals && data.journals.length > 0) {
      content += `## Journal Entries\n\n`;
      
      for (const journal of data.journals) {
        content += `### ${journal.title || 'Untitled Entry'}\n\n`;
        content += `**Date:** ${journal.createdAt.toLocaleDateString('id-ID')}\n`;
        content += `**Type:** ${journal.type}\n`;
        if (journal.tags.length > 0) {
          content += `**Tags:** ${journal.tags.map((tag: string) => `\`${tag}\``).join(', ')}\n`;
        }
        content += `\n${journal.content}\n\n`;
        content += `---\n\n`;
      }
    }

    // Gratitude entries
    if (options.includeTypes.gratitude && data.gratitude.length > 0) {
      content += `## Gratitude Entries\n\n`;
      
      for (const gratitude of data.gratitude) {
        content += `### Gratitude - ${gratitude.date.toLocaleDateString('id-ID')}\n\n`;
        content += `**Items I'm grateful for:**\n\n`;
        gratitude.gratitudes.forEach((item: any, index: number) => {
          content += `${index + 1}. **${item.text}** *(${item.category})*\n`;
        });
        if (gratitude.reflection) {
          content += `\n**Reflection:**\n${gratitude.reflection}\n`;
        }
        content += `\n---\n\n`;
      }
    }

    return content;
  }

  private async generateDocxExport(data: any, options: ExportOptions): Promise<Blob> {
    // Mock DOCX generation - would use a library like docx
    const content = await this.generateMarkdownExport(data, options);
    return new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }

  private async createDownloadUrl(content: string | Blob, filename: string): Promise<string> {
    const blob = content instanceof Blob ? content : new Blob([content]);
    return URL.createObjectURL(blob);
  }

  private escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }

  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private async parseImportContent(content: string, format: ImportOptions['format']): Promise<any[]> {
    switch (format) {
      case 'json': {
        const jsonData = JSON.parse(content);
        return jsonData.data ? Object.values(jsonData.data).flat() : [];
      }
      case 'csv':
        return this.parseCSVContent(content);
      case 'txt':
        return this.parseTextContent(content);
      default:
        throw new Error(`Unsupported import format: ${format}`);
    }
  }

  private parseCSVContent(content: string): any[] {
    const lines = content.split('\n');
    const headers = lines[0].split(',');
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',');
        const entry: any = {};
        headers.forEach((header, index) => {
          entry[header.trim()] = values[index]?.trim() || '';
        });
        data.push(entry);
      }
    }

    return data;
  }

  private parseTextContent(content: string): any[] {
    // Simple text parsing - would be more sophisticated in real implementation
    const entries = content.split('---').map(section => ({
      type: 'text_import',
      content: section.trim(),
      createdAt: new Date()
    }));

    return entries.filter(entry => entry.content.length > 0);
  }

  private async validateImportData(data: any[]): Promise<void> {
    for (const item of data) {
      if (!item.content && !item.text) {
        throw new Error('Invalid data: missing content');
      }
    }
  }

  private async processImportData(
    userId: string, 
    data: any[], 
    options: ImportOptions
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: true,
      importedCount: 0,
      skippedCount: 0,
      errorCount: 0,
      errors: [],
      summary: { journals: 0, gratitude: 0, moods: 0, reflections: 0 }
    };

    for (let i = 0; i < data.length; i++) {
      try {
        const item = data[i];
        
        // Determine item type and import
        if (item.type === 'Journal' || item.content) {
          await journalingService.createJournalEntry(userId, {
            content: item.content,
            title: item.title,
            tags: options.tagPrefix ? [`${options.tagPrefix}imported`] : ['imported'],
            type: 'free_form'
          });
          result.summary.journals++;
          result.importedCount++;
        } else if (item.type === 'Gratitude') {
          // Would create gratitude entry
          result.summary.gratitude++;
          result.importedCount++;
        } else {
          result.skippedCount++;
        }
      } catch (error) {
        result.errorCount++;
        result.errors.push({
          line: i + 1,
          entry: JSON.stringify(data[i]).substring(0, 100),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    result.success = result.errorCount === 0;
    return result;
  }

  private calculateNextBackupDate(frequency: BackupSchedule['frequency']): Date {
    const now = new Date();
    const nextBackup = new Date(now);

    switch (frequency) {
      case 'daily':
        nextBackup.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        nextBackup.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        nextBackup.setMonth(now.getMonth() + 1);
        break;
    }

    return nextBackup;
  }

  private async saveBackupSchedule(userId: string, schedule: BackupSchedule): Promise<void> {
    // Mock implementation - would save to storage
    console.log('Backup schedule saved for user:', userId);
  }

  private async setupRecurringBackup(userId: string, schedule: BackupSchedule): Promise<void> {
    // Mock implementation - would set up actual recurring backup
    console.log('Recurring backup setup for user:', userId);
  }

  private async saveExportHistory(
    userId: string, 
    result: ExportResult, 
    options: ExportOptions
  ): Promise<void> {
    const historyEntry: ExportHistory = {
      id: `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      filename: result.filename,
      format: result.format,
      size: result.size,
      itemCount: result.itemCount,
      exportDate: result.exportDate,
      downloadUrl: result.downloadUrl,
      isExpired: false,
      options
    };

    const userHistory = this.exportHistory.get(userId) || [];
    userHistory.push(historyEntry);
    
    // Keep only last 50 exports
    if (userHistory.length > 50) {
      userHistory.splice(0, userHistory.length - 50);
    }
    
    this.exportHistory.set(userId, userHistory);
  }
}

export const journalExportService = JournalExportService.getInstance();