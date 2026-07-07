import { RefreshCw, Trash2 } from 'lucide-react';
import useWorkspaceStore from '../store/useWorkspaceStore';
import styles from './TrashView.module.css';

export default function TrashView() {
  const { trash, restorePage, permanentlyDelete } = useWorkspaceStore();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Trash</h1>
        <p className={styles.subtitle}>View and restore deleted pages.</p>
      </div>

      <div className={styles.list}>
        {trash.length === 0 ? (
          <div className={styles.empty}>Trash is empty.</div>
        ) : (
          trash.map((page) => (
            <div key={page.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <span className={styles.icon}>{page.icon}</span>
                <span className={styles.itemTitle}>{page.title || 'Untitled'}</span>
              </div>
              <div className={styles.actions}>
                <button 
                  className={styles.actionBtn}
                  onClick={() => restorePage(page.id)}
                  title="Restore"
                >
                  <RefreshCw size={16} />
                </button>
                <button 
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={() => permanentlyDelete(page.id)}
                  title="Permanently Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}