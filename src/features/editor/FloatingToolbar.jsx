import { useState, useEffect, useRef } from 'react';
import { Bold, Italic, Underline, Strikethrough, Code } from 'lucide-react';
import styles from './FloatingToolbar.module.css';

export default function FloatingToolbar() {
  const [position, setPosition] = useState(null);
  const toolbarRef = useRef(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        setPosition(null);
        return;
      }

      // Ensure selection is within an editable block
      let node = selection.anchorNode;
      let isEditable = false;
      while (node) {
        if (node.nodeType === 1 && node.getAttribute('contenteditable') === 'true') {
          isEditable = true;
          break;
        }
        node = node.parentNode;
      }

      if (!isEditable) {
        setPosition(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setPosition({
        top: rect.top + window.scrollY - 40,
        left: rect.left + window.scrollX + (rect.width / 2),
      });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    // Hide toolbar on mousedown (if it's not on the toolbar itself)
    const handleMouseDown = (e) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        // Selection will naturally change, but we can fast-hide it
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const formatText = (command) => {
    document.execCommand(command, false, null);
  };

  if (!position) return null;

  return (
    <div 
      ref={toolbarRef}
      className={styles.toolbar}
      style={{ top: position.top, left: position.left }}
    >
      <button className={styles.toolBtn} onClick={() => formatText('bold')}><Bold size={14} /></button>
      <button className={styles.toolBtn} onClick={() => formatText('italic')}><Italic size={14} /></button>
      <button className={styles.toolBtn} onClick={() => formatText('underline')}><Underline size={14} /></button>
      <button className={styles.toolBtn} onClick={() => formatText('strikeThrough')}><Strikethrough size={14} /></button>
    </div>
  );
}
