import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../utils/generateId';

const createDefaultPage = (id = generateId(), title = 'Untitled', parentId = null) => ({
  id,
  title,
  icon: '📄',
  cover: null,
  parentId,
  children: [],
  isFavorite: false,
  isDatabase: false,
  schema: {}, // If isDatabase is true, defines properties: { propId: { name: 'Status', type: 'select', options: [] } }
  properties: {}, // Values for database properties: { propId: 'value' }
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const useWorkspaceStore = create(
  persist(
    (set, get) => ({
      pages: {},
      trash: [],
      
      // Initialize with a default page if empty
      initialize: () => {
        const { pages } = get();
        if (Object.keys(pages).length === 0) {
          const homePage = createDefaultPage('home', 'Getting Started');
          homePage.icon = '🏠';
          set({ pages: { home: homePage } });
        }
      },

      addPage: (parentId = null, title = 'Untitled', isDatabase = false) => {
        const newPage = createDefaultPage(generateId(), title, parentId);
        newPage.isDatabase = isDatabase;
        if (isDatabase) {
          // Default schema for new databases
          newPage.schema = {
            title: { id: 'title', name: 'Name', type: 'text' },
            tags: { id: 'tags', name: 'Tags', type: 'multi_select', options: [] }
          };
        }

        set((state) => {
          const newPages = { ...state.pages, [newPage.id]: newPage };
          if (parentId && newPages[parentId]) {
            newPages[parentId] = {
              ...newPages[parentId],
              children: [...newPages[parentId].children, newPage.id],
            };
          }
          return { pages: newPages };
        });
        return newPage.id;
      },

      updatePage: (id, updates) => set((state) => {
        if (!state.pages[id]) return state;
        return {
          pages: {
            ...state.pages,
            [id]: { ...state.pages[id], ...updates, updatedAt: Date.now() },
          },
        };
      }),

      movePageToTrash: (id) => set((state) => {
        const page = state.pages[id];
        if (!page) return state;

        const newPages = { ...state.pages };
        const trashItem = { ...page, deletedAt: Date.now() };
        
        // Remove from parent's children array
        if (page.parentId && newPages[page.parentId]) {
          newPages[page.parentId] = {
            ...newPages[page.parentId],
            children: newPages[page.parentId].children.filter((childId) => childId !== id),
          };
        }

        // Recursively remove children (simplified: just removing the parent from pages, keeping it in trash)
        // For a full tree delete, we would need a recursive function, but we can store the whole tree in trash
        delete newPages[id];

        return {
          pages: newPages,
          trash: [...state.trash, trashItem],
        };
      }),

      restorePage: (id) => set((state) => {
        const trashIndex = state.trash.findIndex((p) => p.id === id);
        if (trashIndex === -1) return state;

        const pageToRestore = state.trash[trashIndex];
        const newTrash = [...state.trash];
        newTrash.splice(trashIndex, 1);
        
        const newPages = { ...state.pages, [pageToRestore.id]: { ...pageToRestore, parentId: null } }; // Restore to root

        return { pages: newPages, trash: newTrash };
      }),

      permanentlyDelete: (id) => set((state) => ({
        trash: state.trash.filter((p) => p.id !== id),
      })),
      
      toggleFavorite: (id) => set((state) => {
        if (!state.pages[id]) return state;
        return {
          pages: {
            ...state.pages,
            [id]: { ...state.pages[id], isFavorite: !state.pages[id].isFavorite },
          },
        };
      }),
    }),
    {
      name: 'notion-workspace-storage',
    }
  )
);

export default useWorkspaceStore;
