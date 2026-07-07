import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GripVertical, Plus, FileText, Trash2 } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';
import useEditorStore from '../../store/useEditorStore';
import useWorkspaceStore from '../../store/useWorkspaceStore';
import styles from './EditorBlock.module.css';

export default function EditorBlock({ blockId, pageId, index, onOpenSlashMenu, onCloseSlashMenu, isSlashMenuOpen }) {
  const navigate = useNavigate();
  const { pages } = useWorkspaceStore();
  const { blocks, pagesData, updateBlock, addBlock, removeBlock } = useEditorStore();
  const block = blocks[blockId];
  const blockRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  if (!block) return null;

  useEffect(() => {
    if (blockRef.current && blockRef.current.getAttribute('contenteditable') === 'true') {
      if (blockRef.current.innerText !== (block.content || '')) {
        blockRef.current.innerText = block.content || '';
      }
    }
  }, [block.content, block.type]); // Run when content or type changes to reset the text properly

  const handleInput = (e) => {
    const text = e.currentTarget.innerText;
    
    // Markdown shortcuts
    if (block.type === 'paragraph') {
      let newType = null;
      let newText = null;

      if (text.startsWith('# ')) {
        newType = 'h1';
        newText = text.substring(2);
      } else if (text.startsWith('## ')) {
        newType = 'h2';
        newText = text.substring(3);
      } else if (text.startsWith('### ')) {
        newType = 'h3';
        newText = text.substring(4);
      } else if (text.startsWith('> ')) {
        newType = 'quote';
        newText = text.substring(2);
      }

      if (newType) {
        e.preventDefault(); // Stop default typing
        e.currentTarget.innerText = newText;
        updateBlock(blockId, { type: newType, content: newText });
        setCaretToEnd(e.currentTarget);
        return;
      }
    }

    updateBlock(blockId, { content: text });
    
    if (text === '/' || text.endsWith(' /')) {
      // Get caret position to position the menu
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        onOpenSlashMenu({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        });
      }
    } else if (isSlashMenuOpen) {
      onCloseSlashMenu();
    }
  };

  const setCaretToEnd = (element) => {
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    element.focus();
  };

  const handleKeyDown = (e) => {
    // If slash menu is open, let it handle its own keydown (Arrows, Enter, Escape)
    // We prevent default here so cursor doesn't move when navigating slash menu
    if (isSlashMenuOpen && ['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) {
      // SlashCommand component has a global keydown listener to handle these.
      // We just need to stop the EditorBlock from doing its own handling.
      if (e.key === 'Enter') e.preventDefault(); 
      return; 
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newBlockId = addBlock(pageId, 'paragraph', blockId);
      
      // We need to focus the new block after it mounts.
      // Since React state updates are async, we can use a small timeout or a layout effect,
      // but for simplicity, a setTimeout works well enough for DOM focus.
      setTimeout(() => {
        const nextBlock = document.querySelector(`[data-block-id="${newBlockId}"]`);
        if (nextBlock) nextBlock.focus();
      }, 0);
    } else if (e.key === 'Backspace' && e.currentTarget.innerText === '') {
      e.preventDefault();
      const pageBlocks = pagesData[pageId] || [];
      if (pageBlocks.length > 1) {
        removeBlock(pageId, blockId);
        // Focus previous block
        setTimeout(() => {
          const prevBlockId = pageBlocks[index - 1];
          if (prevBlockId) {
            const prevBlock = document.querySelector(`[data-block-id="${prevBlockId}"]`);
            if (prevBlock) setCaretToEnd(prevBlock);
          }
        }, 0);
      }
    } else if (e.key === 'ArrowUp') {
      const pageBlocks = pagesData[pageId] || [];
      if (index > 0) {
        e.preventDefault();
        const prevBlockId = pageBlocks[index - 1];
        const prevBlock = document.querySelector(`[data-block-id="${prevBlockId}"]`);
        if (prevBlock) setCaretToEnd(prevBlock);
      }
    } else if (e.key === 'ArrowDown') {
      const pageBlocks = pagesData[pageId] || [];
      if (index < pageBlocks.length - 1) {
        e.preventDefault();
        const nextBlockId = pageBlocks[index + 1];
        const nextBlock = document.querySelector(`[data-block-id="${nextBlockId}"]`);
        if (nextBlock) setCaretToEnd(nextBlock);
      }
    }
  };

  const getTag = () => {
    switch (block.type) {
      case 'h1': return 'h1';
      case 'h2': return 'h2';
      case 'h3': return 'h3';
      case 'quote': return 'blockquote';
      default: return 'div';
    }
  };

  const Tag = getTag();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert("Please choose an image under 2MB to avoid filling local storage.");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      updateBlock(blockId, { properties: { url: event.target.result } });
    };
    reader.readAsDataURL(file);
  };

  const getListIndex = () => {
    if (block.type !== 'numbered-list') return null;
    const pageBlocks = pagesData[pageId] || [];
    let listNumber = 1;
    for (let i = index - 1; i >= 0; i--) {
      const prevId = pageBlocks[i];
      if (blocks[prevId]?.type === 'numbered-list') {
        listNumber++;
      } else {
        break;
      }
    }
    return listNumber;
  };

  const handleResizeStart = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = blockRef.current ? blockRef.current.offsetWidth : 500;
    
    const onMouseMove = (moveEvent) => {
      const newWidth = startWidth + (moveEvent.clientX - startX);
      if (blockRef.current) {
        blockRef.current.style.width = `${Math.max(100, newWidth)}px`;
      }
    };
    
    const onMouseUp = (upEvent) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      const newWidth = startWidth + (upEvent.clientX - startX);
      updateBlock(blockId, { properties: { ...block.properties, width: Math.max(100, newWidth) } });
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const renderBlockContent = () => {
    if (block.type === 'divider') {
      return <hr className={styles.divider} />;
    }
    if (block.type === 'image') {
      return (
        <div 
          className={styles.mediaBlockContainer} 
          ref={blockRef} 
          style={{ width: block.properties?.width ? `${block.properties.width}px` : '100%' }}
        >
          {block.properties?.url ? (
            <>
              <img src={block.properties.url} alt="User added" className={styles.image} />
              <div className={styles.resizeHandle} onMouseDown={handleResizeStart} />
            </>
          ) : (
            <div className={styles.imageUploadPlaceholder}>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className={styles.imageFileInput}
              />
              <span>Click to choose an image (Max 2MB)</span>
            </div>
          )}
        </div>
      );
    }
    
    if (block.type === 'embed') {
      return (
        <div 
          className={styles.mediaBlockContainer} 
          ref={blockRef} 
          style={{ width: block.properties?.width ? `${block.properties.width}px` : '100%' }}
        >
          {block.properties?.url ? (
            <>
              <iframe 
                src={block.properties.url} 
                title="Embedded Content"
                className={styles.embedIframe}
                allowFullScreen
              />
              <div className={styles.resizeHandle} onMouseDown={handleResizeStart} />
            </>
          ) : (
            <input 
              type="text" 
              placeholder="Paste embed link (e.g. YouTube embed URL) and press Enter..." 
              className={styles.imageInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  let url = e.currentTarget.value;
                  // Auto-convert standard youtube links to embed links if possible
                  if (url.includes('youtube.com/watch?v=')) {
                    url = url.replace('watch?v=', 'embed/');
                    // Strip extra params
                    const ampersandIndex = url.indexOf('&');
                    if (ampersandIndex !== -1) {
                      url = url.substring(0, ampersandIndex);
                    }
                  } else if (url.includes('youtu.be/')) {
                    url = url.replace('youtu.be/', 'youtube.com/embed/');
                  }
                  updateBlock(blockId, { properties: { url } });
                }
              }}
            />
          )}
        </div>
      );
    }
    
    if (block.type === 'page-link') {
      if (block.properties?.targetPageId) {
        const targetPage = pages[block.properties.targetPageId];
        return (
          <div 
            className={styles.pageLink} 
            onClick={() => navigate(`/page/${block.properties.targetPageId}`)}
            contentEditable={false}
          >
            <FileText size={16} className={styles.pageLinkIcon} />
            <span className={styles.pageLinkTitle}>{targetPage?.title || 'Untitled'}</span>
          </div>
        );
      } else {
        const allPages = Object.values(pages).filter(p => !p.isDatabase && !p.isTrash);
        return (
          <div className={styles.pageLinkSelector} contentEditable={false}>
            <select 
              className={styles.pageSelect}
              onChange={(e) => {
                if (e.target.value) {
                  updateBlock(blockId, { properties: { targetPageId: e.target.value } });
                }
              }}
              defaultValue=""
            >
              <option value="" disabled>Select a page to link...</option>
              {allPages.map(p => (
                <option key={p.id} value={p.id}>{p.title || 'Untitled'}</option>
              ))}
            </select>
          </div>
        );
      }
    }
    
    const editableTag = (
      <Tag
        ref={blockRef}
        data-block-id={blockId}
        className={`${styles.editableBlock} ${styles[block.type]}`}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={block.type === 'paragraph' ? "Type '/' for commands" : block.type.includes('list') ? "List item" : `Heading ${block.type.replace('h', '')}`}
      >
        {/* We only want to set initial content once to avoid cursor jumping */}
      </Tag>
    );

    if (block.type === 'todo-list') {
      return (
        <div className={styles.listWrapper}>
          <input 
            type="checkbox" 
            className={styles.todoCheckbox}
            checked={block.properties?.checked || false} 
            onChange={(e) => updateBlock(blockId, { properties: { checked: e.target.checked } })}
          />
          <div className={`${styles.todoContent} ${block.properties?.checked ? styles.todoChecked : ''}`}>
            {editableTag}
          </div>
        </div>
      );
    }
    
    if (block.type === 'bulleted-list') {
      return (
        <div className={styles.listWrapper}>
          <span className={styles.bullet}>•</span>
          <div className={styles.listContent}>{editableTag}</div>
        </div>
      );
    }
    
    if (block.type === 'numbered-list') {
      return (
        <div className={styles.listWrapper}>
          <span className={styles.number}>{getListIndex()}.</span>
          <div className={styles.listContent}>{editableTag}</div>
        </div>
      );
    }

    return editableTag;
  };

  return (
    <Draggable draggableId={blockId} index={index}>
      {(provided, snapshot) => (
        <div 
          className={`${styles.blockContainer} ${snapshot.isDragging ? styles.isDragging : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div className={`${styles.blockHandles} ${isHovered || snapshot.isDragging ? styles.handlesVisible : ''}`}>
            <button className={styles.handleBtn} onClick={() => addBlock(pageId, 'paragraph', blockId)}>
              <Plus size={16} />
            </button>
            <div 
              className={styles.handleBtn} 
              style={{ cursor: 'grab' }}
              {...provided.dragHandleProps}
            >
              <GripVertical size={16} />
            </div>
            <button className={styles.handleBtn} onClick={() => removeBlock(pageId, blockId)}>
              <Trash2 size={14} />
            </button>
          </div>
          
          <div className={styles.blockContent}>
            {renderBlockContent()}
          </div>
        </div>
      )}
    </Draggable>
  );
}
