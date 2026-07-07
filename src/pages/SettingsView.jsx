import { useState } from 'react';
import { Download, Upload, Monitor, Type } from 'lucide-react';
import useSettingsStore from '../store/useSettingsStore';
import useWorkspaceStore from '../store/useWorkspaceStore';
import useEditorStore from '../store/useEditorStore';
import styles from './SettingsView.module.css';

export default function SettingsView() {
  const { theme, toggleTheme } = useSettingsStore();
  const [importText, setImportText] = useState('');

  const handleExport = () => {
    const data = {
      workspace: localStorage.getItem('notion-workspace-storage'),
      editor: localStorage.getItem('notion-editor-storage'),
      settings: localStorage.getItem('notion-settings-storage'),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notion-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(importText);
      if (data.workspace) localStorage.setItem('notion-workspace-storage', data.workspace);
      if (data.editor) localStorage.setItem('notion-editor-storage', data.editor);
      if (data.settings) localStorage.setItem('notion-settings-storage', data.settings);
      
      alert('Import successful! Reloading application...');
      window.location.reload();
    } catch (e) {
      alert('Invalid backup data format.');
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImportText(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your workspace preferences.</p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Monitor size={18} /> Appearance
        </h2>
        <div className={styles.settingRow}>
          <div>
            <div className={styles.settingLabel}>Theme</div>
            <div className={styles.settingDesc}>Customize the look and feel.</div>
          </div>
          <button className={styles.toggleBtn} onClick={toggleTheme}>
            {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Download size={18} /> Data Management
        </h2>
        <div className={styles.settingRow}>
          <div>
            <div className={styles.settingLabel}>Export Workspace</div>
            <div className={styles.settingDesc}>Download a JSON backup of all pages and blocks.</div>
          </div>
          <button className={styles.actionBtn} onClick={handleExport}>
            <Download size={16} /> Export JSON
          </button>
        </div>

        <div className={styles.settingRowBlock}>
          <div className={styles.settingLabel}>Import Workspace</div>
          <div className={styles.settingDesc} style={{ marginBottom: '12px' }}>
            Warning: This will overwrite your current workspace data!
          </div>
          <textarea
            className={styles.textarea}
            placeholder="Paste JSON backup here..."
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
          />
          <div className={styles.importActions}>
            <label className={styles.uploadLabel}>
              <Upload size={16} /> Upload File
              <input type="file" accept=".json" onChange={handleFileImport} style={{ display: 'none' }} />
            </label>
            <button 
              className={styles.primaryBtn} 
              onClick={handleImport}
              disabled={!importText}
            >
              Import Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}