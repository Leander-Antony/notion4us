import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../utils/generateId';

const createDefaultBlock = (type = 'paragraph', content = '') => ({
  id: generateId(),
  type,
  content,
  properties: {},
});

const useEditorStore = create(
  persist(
    (set, get) => ({
      pagesData: {}, // { pageId: ['blockId1', 'blockId2'] }
      blocks: {},    // { blockId: { id, type, content, properties } }

      initializePage: (pageId) => {
        const { pagesData } = get();
        if (!pagesData[pageId]) {
          const initialBlock = createDefaultBlock();
          set((state) => ({
            pagesData: { ...state.pagesData, [pageId]: [initialBlock.id] },
            blocks: { ...state.blocks, [initialBlock.id]: initialBlock }
          }));
        }
      },

      addBlock: (pageId, blockType = 'paragraph', afterBlockId = null) => {
        const newBlock = createDefaultBlock(blockType);
        set((state) => {
          const pageBlocks = state.pagesData[pageId] || [];
          let newBlockIds = [...pageBlocks];
          
          if (afterBlockId) {
            const index = newBlockIds.indexOf(afterBlockId);
            if (index !== -1) {
              newBlockIds.splice(index + 1, 0, newBlock.id);
            } else {
              newBlockIds.push(newBlock.id);
            }
          } else {
            newBlockIds.push(newBlock.id);
          }

          return {
            pagesData: { ...state.pagesData, [pageId]: newBlockIds },
            blocks: { ...state.blocks, [newBlock.id]: newBlock }
          };
        });
        return newBlock.id;
      },

      updateBlock: (blockId, updates) => set((state) => {
        if (!state.blocks[blockId]) return state;
        return {
          blocks: {
            ...state.blocks,
            [blockId]: { ...state.blocks[blockId], ...updates }
          }
        };
      }),

      removeBlock: (pageId, blockId) => set((state) => {
        const pageBlocks = state.pagesData[pageId] || [];
        // Prevent deleting the very last block on a page, just empty it instead
        if (pageBlocks.length === 1) {
          return {
            blocks: {
              ...state.blocks,
              [blockId]: { ...state.blocks[blockId], content: '', type: 'paragraph' }
            }
          };
        }

        const newBlockIds = pageBlocks.filter((id) => id !== blockId);
        const newBlocks = { ...state.blocks };
        delete newBlocks[blockId];

        return {
          pagesData: { ...state.pagesData, [pageId]: newBlockIds },
          blocks: newBlocks
        };
      }),
      
      moveBlock: (pageId, sourceIndex, destinationIndex) => set((state) => {
        const pageBlocks = [...(state.pagesData[pageId] || [])];
        const [movedBlockId] = pageBlocks.splice(sourceIndex, 1);
        pageBlocks.splice(destinationIndex, 0, movedBlockId);
        
        return {
          pagesData: { ...state.pagesData, [pageId]: pageBlocks }
        };
      })
    }),
    {
      name: 'notion-editor-storage',
    }
  )
);

export default useEditorStore;
