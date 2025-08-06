import React, { useState } from 'react';
import { exportData } from '../utils/dataExport';
import { importData } from '../utils/dataImport';

export const DataManagement: React.FC = () => {
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleExport = async () => {
    setExportMessage(null);
    try {
      const exportedData = await exportData();
      if (exportedData) {
        const blob = new Blob([exportedData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sembalun_data_${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setExportMessage('Data exported successfully!');
      } else {
        setExportMessage('Failed to export data.');
      }
    } catch (error) {
      console.error('Error during data export:', error);
      setExportMessage('Error during data export.');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleImport = async () => {
    setImportMessage(null);
    if (!selectedFile) {
      setImportMessage('Please select a file to import.');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const success = await importData(content);
        if (success) {
          setImportMessage('Data imported successfully!');
        } else {
          setImportMessage('Failed to import data.');
        }
      };
      reader.readAsText(selectedFile);
    } catch (error) {
      console.error('Error during data import:', error);
      setImportMessage('Error during data import.');
    }
  };

  return (
    <div>
      <h1>Data Management</h1>

      <section>
        <h2>Export Data</h2>
        <button onClick={handleExport}>Export All Data</button>
        {exportMessage && <p>{exportMessage}</p>}
      </section>

      <section>
        <h2>Import Data</h2>
        <input type="file" accept=".json" onChange={handleFileChange} />
        <button onClick={handleImport} disabled={!selectedFile}>Import Data</button>
        {importMessage && <p>{importMessage}</p>}
      </section>
    </div>
  );
};
