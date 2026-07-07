import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { FileText, Plus, Sun, Moon, Settings, Search } from 'lucide-react';
import useWorkspaceStore from '../store/useWorkspaceStore';
import useSettingsStore from '../store/useSettingsStore';
import styles from './CommandPalette.module.css';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pages, addPage } = useWorkspaceStore();
  const { theme, toggleTheme } = useSettingsStore();

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!open) return null;

  const handleSelectPage = (pageId) => {
    navigate(`/page/${pageId}`);
    setOpen(false);
  };

  const handleCreatePage = () => {
    const newPageId = addPage(null, 'Untitled');
    navigate(`/page/${newPageId}`);
    setOpen(false);
  };

  const handleToggleTheme = () => {
    toggleTheme();
    setOpen(false);
  };

  const isPageActive = (page, allPages) => {
    let current = page;
    while (current.parentId) {
      current = allPages[current.parentId];
      if (!current) return false;
    }
    return true;
  };

  const pagesList = Object.values(pages).filter(p => isPageActive(p, pages));

  return (
    <div className={styles.overlay} onClick={() => setOpen(false)}>
      <Command 
        className={styles.command} 
        onClick={(e) => e.stopPropagation()}
        loop
      >
        <Command.Input placeholder="Type a command or search..." autoFocus />
        <Command.List>
          <Command.Empty>No results found.</Command.Empty>

          <Command.Group heading="Pages">
            {pagesList.map((page) => (
              <Command.Item 
                key={page.id} 
                onSelect={() => handleSelectPage(page.id)}
              >
                <FileText />
                <span>{page.icon} {page.title || 'Untitled'}</span>
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Actions">
            <Command.Item onSelect={handleCreatePage}>
              <Plus />
              <span>Create New Page</span>
            </Command.Item>
            <Command.Item onSelect={handleToggleTheme}>
              {theme === 'light' ? <Moon /> : <Sun />}
              <span>Toggle {theme === 'light' ? 'Dark' : 'Light'} Theme</span>
            </Command.Item>
            <Command.Item onSelect={() => { navigate('/settings'); setOpen(false); }}>
              <Settings />
              <span>Open Settings</span>
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
