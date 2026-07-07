import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Plus, Settings, Trash, FileText, LayoutTemplate, Search, ChevronRight, ChevronDown, MoreHorizontal } from 'lucide-react';
import useWorkspaceStore from '../../store/useWorkspaceStore';
import useSettingsStore from '../../store/useSettingsStore';
import styles from './Sidebar.module.css';

// Recursive Tree Item for Pages
const PageTreeItem = ({ pageId, depth = 0 }) => {
  const { pages, addPage, toggleFavorite, movePageToTrash } = useWorkspaceStore();
  const navigate = useNavigate();
  const page = pages[pageId];
  const [expanded, setExpanded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  if (!page) return null;

  const hasChildren = page.children && page.children.length > 0;

  const handleAddSubpage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newPageId = addPage(pageId);
    setExpanded(true);
    navigate(`/page/${newPageId}`);
  };

  const handleToggleExpand = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded(!expanded);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    movePageToTrash(pageId);
    navigate(`/`);
  };

  return (
    <div className={styles.treeNode}>
      <NavLink
        to={`/page/${pageId}`}
        className={({ isActive }) => `${styles.pageItem} ${isActive ? styles.active : ''}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onMouseEnter={() => setShowOptions(true)}
        onMouseLeave={() => setShowOptions(false)}
      >
        <button 
          className={`${styles.collapseBtn} ${!hasChildren ? styles.hidden : ''}`} 
          onClick={handleToggleExpand}
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <span className={styles.icon}>{page.icon}</span>
        <span className={styles.title}>{page.title || 'Untitled'}</span>
        
        <div className={`${styles.actions} ${showOptions ? styles.actionsVisible : ''}`}>
          <button onClick={handleAddSubpage} className={styles.iconBtn}>
            <Plus size={14} />
          </button>
          <button onClick={handleDelete} className={styles.iconBtn}>
            <Trash size={14} />
          </button>
        </div>
      </NavLink>

      {expanded && hasChildren && (
        <div className={styles.children}>
          {page.children.map(childId => (
            <PageTreeItem key={childId} pageId={childId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function Sidebar() {
  const { sidebarWidth, setSidebarWidth } = useSettingsStore();
  const { pages, initialize, addPage } = useWorkspaceStore();
  const navigate = useNavigate();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Root pages (pages without parents)
  const rootPageIds = Object.keys(pages).filter(id => !pages[id].parentId);

  const handleAddRootPage = () => {
    const newPageId = addPage(null, 'Untitled', false);
    navigate(`/page/${newPageId}`);
  };

  return (
    <div className={styles.sidebarContainer}>
      <div className={styles.workspaceHeader}>
        <div className={styles.workspaceInfo}>
          <div className={styles.avatar}>N</div>
          <span className={styles.workspaceName}>My Workspace</span>
        </div>
      </div>

      <div className={styles.quickLinks}>
        <NavLink to="/settings" className={({ isActive }) => `${styles.quickLinkItem} ${isActive ? styles.active : ''}`}>
          <Settings size={16} />
          <span>Settings</span>
        </NavLink>
        <button className={styles.quickLinkItem} onClick={handleAddRootPage}>
          <Plus size={16} />
          <span>New page</span>
        </button>
      </div>

      <div className={styles.scrollArea}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span>Private</span>
            <button onClick={handleAddRootPage}><Plus size={14} /></button>
          </div>
          <div className={styles.tree}>
            {rootPageIds.map(id => (
              <PageTreeItem key={id} pageId={id} />
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <NavLink to="/trash" className={({ isActive }) => `${styles.pageItem} ${isActive ? styles.active : ''}`}>
            <Trash size={16} className={styles.mr} />
            <span>Trash</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
}
