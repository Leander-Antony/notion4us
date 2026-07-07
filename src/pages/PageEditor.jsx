import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import useWorkspaceStore from '../store/useWorkspaceStore';
import useEditorStore from '../store/useEditorStore';
import EditorBlock from '../features/editor/EditorBlock';
import SlashCommand from '../features/editor/SlashCommand';
import FloatingToolbar from '../features/editor/FloatingToolbar';
import DatabaseView from './DatabaseView';
import styles from './PageEditor.module.css';

export default function PageEditor() {
  const { pageId } = useParams();
  const { pages, updatePage } = useWorkspaceStore();
  const { pagesData, initializePage, addBlock, moveBlock } = useEditorStore();
  const [title, setTitle] = useState('');
  const [slashMenu, setSlashMenu] = useState(null); // { position: {top, left}, blockId }

  const page = pages[pageId];
  const blockIds = pagesData[pageId] || [];

  useEffect(() => {
    if (page) {
      setTitle(page.title);
    }
    initializePage(pageId);
  }, [pageId, page, initializePage]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    if (page && title !== page.title) {
      updatePage(pageId, { title });
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // If there are no blocks, create one, otherwise focus the first block
      if (blockIds.length === 0) {
        addBlock(pageId);
      } else {
        const firstBlock = document.querySelector(`[data-block-id="${blockIds[0]}"]`);
        if (firstBlock) {
          firstBlock.focus();
        }
      }
    }
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.index === destination.index) return;
    moveBlock(pageId, source.index, destination.index);
  };

  if (!page) {
    return <div className={styles.container}>Page not found</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageContent}>
        {/* Cover and Icon can go here */}
        <div className={styles.iconLarge}>{page.icon}</div>
        
        <input
          type="text"
          className={styles.titleInput}
          value={title}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          placeholder="Untitled"
        />

        {page.isDatabase ? (
          <DatabaseView databaseId={pageId} />
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={pageId}>
              {(provided) => (
                <div 
                  className={styles.editorBody}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {blockIds.map((blockId, index) => (
                    <EditorBlock
                      key={blockId}
                      blockId={blockId}
                      pageId={pageId}
                      index={index}
                      onOpenSlashMenu={(position) => setSlashMenu({ position, blockId })}
                      onCloseSlashMenu={() => setSlashMenu(null)}
                      isSlashMenuOpen={slashMenu?.blockId === blockId}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
      
      {slashMenu && (
        <SlashCommand
          position={slashMenu.position}
          blockId={slashMenu.blockId}
          pageId={pageId}
          onClose={() => setSlashMenu(null)}
        />
      )}

      <FloatingToolbar />
    </div>
  );
}