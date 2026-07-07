import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { FileText, Search, Settings, LayoutTemplate } from 'lucide-react';
import useWorkspaceStore from '../../store/useWorkspaceStore';
import styles from './CommandPalette.module.css';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { pages } = useWorkspaceStore();
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (action) => {
    setOpen(false);
    action();
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={() => setOpen(false)}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <Command className={styles.command}>
          <div className={styles.searchInputWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <Command.Input placeholder="Search pages or type a command..." className={styles.input} />
          </div>

          <Command.List className={styles.list}>
            <Command.Empty className={styles.empty}>No results found.</Command.Empty>

            <Command.Group heading="Pages" className={styles.group}>
              {Object.values(pages).map(page => (
                <Command.Item 
                  key={page.id} 
                  onSelect={() => handleSelect(() => navigate(`/page/${page.id}`))}
                  className={styles.item}
                >
                  <FileText size={16} className={styles.icon} />
                  {page.title || 'Untitled'}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Group heading="Actions" className={styles.group}>
              <Command.Item onSelect={() => handleSelect(() => navigate('/settings'))} className={styles.item}>
                <Settings size={16} className={styles.icon} /> Settings
              </Command.Item>
              <Command.Item onSelect={() => handleSelect(() => navigate('/templates'))} className={styles.item}>
                <LayoutTemplate size={16} className={styles.icon} /> Templates
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
