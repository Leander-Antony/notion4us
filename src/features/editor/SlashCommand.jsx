import { useState, useEffect, useRef } from 'react';
import { Type, Heading1, Heading2, Heading3, Quote, List, ListOrdered, CheckSquare, Code, Image, MoreHorizontal, Link } from 'lucide-react';
import useEditorStore from '../../store/useEditorStore';
import styles from './SlashCommand.module.css';

const COMMANDS = [
  { id: 'page-link', label: 'Link to Page', icon: <Link size={18} />, type: 'page-link', description: 'Link to an existing page.' },
  { id: 'h1', label: 'Heading 1', icon: <Heading1 size={18} />, type: 'h1', description: 'Big section heading.' },
  { id: 'h2', label: 'Heading 2', icon: <Heading2 size={18} />, type: 'h2', description: 'Medium section heading.' },
  { id: 'h3', label: 'Heading 3', icon: <Heading3 size={18} />, type: 'h3', description: 'Small section heading.' },
  { id: 'quote', label: 'Quote', icon: <Quote size={18} />, type: 'quote', description: 'Capture a quote.' },
  // Adding placeholders for future features
  { id: 'bulleted-list', label: 'Bulleted List', icon: <List size={18} />, type: 'bulleted-list', description: 'Create a simple bulleted list.' },
  { id: 'numbered-list', label: 'Numbered List', icon: <ListOrdered size={18} />, type: 'numbered-list', description: 'Create a numbered list.' },
  { id: 'image', label: 'Image', icon: <Image size={18} />, type: 'image', description: 'Upload or embed an image.' },
  { id: 'divider', label: 'Divider', icon: <MoreHorizontal size={18} />, type: 'divider', description: 'Visually divide blocks.' },
];

export default function SlashCommand({ position, blockId, pageId, onClose }) {
  const { updateBlock } = useEditorStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % COMMANDS.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + COMMANDS.length) % COMMANDS.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelect(COMMANDS[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, onClose]);

  const handleSelect = (command) => {
    const blockEl = document.querySelector(`[data-block-id="${blockId}"]`);
    if (blockEl) {
      blockEl.innerText = '';
    }
    
    updateBlock(blockId, { type: command.type, content: '' });
    onClose();
    
    // Focus back on the block
    setTimeout(() => {
      const block = document.querySelector(`[data-block-id="${blockId}"]`);
      if (block) {
        block.focus();
      }
    }, 0);
  };

  return (
    <div 
      ref={menuRef}
      className={styles.slashCommandMenu}
      style={{ top: position.top, left: position.left }}
    >
      <div className={styles.menuHeader}>Basic blocks</div>
      <div className={styles.commandList}>
        {COMMANDS.map((cmd, index) => (
          <div
            key={cmd.id}
            className={`${styles.commandItem} ${index === selectedIndex ? styles.selected : ''}`}
            onClick={() => handleSelect(cmd)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className={styles.commandIcon}>{cmd.icon}</div>
            <div className={styles.commandText}>
              <div className={styles.commandLabel}>{cmd.label}</div>
              <div className={styles.commandDesc}>{cmd.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
