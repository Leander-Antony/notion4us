import { useNavigate } from 'react-router-dom';
import { Plus, MoreHorizontal, FileText } from 'lucide-react';
import useWorkspaceStore from '../store/useWorkspaceStore';
import styles from './DatabaseView.module.css';

export default function DatabaseView({ databaseId }) {
  const { pages, addPage } = useWorkspaceStore();
  const navigate = useNavigate();
  const database = pages[databaseId];
  
  if (!database || !database.isDatabase) {
    return <div>Not a valid database</div>;
  }

  const schema = Object.values(database.schema || {});
  const rows = database.children.map(id => pages[id]).filter(Boolean);

  const handleAddRow = () => {
    // A row is just a child page
    addPage(databaseId, 'Untitled');
  };

  const handleRowClick = (rowId) => {
    // Could open as a peek or full page
    navigate(`/page/${rowId}`);
  };

  return (
    <div className={styles.databaseContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Name</th>
              {schema.filter(prop => prop.id !== 'title').map(prop => (
                <th key={prop.id} className={styles.th}>{prop.name}</th>
              ))}
              <th className={styles.th} style={{ width: '40px' }}><Plus size={14} /></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} className={styles.tr}>
                <td className={styles.td} onClick={() => handleRowClick(row.id)}>
                  <div className={styles.rowTitle}>
                    <FileText size={14} className={styles.pageIcon} />
                    {row.title || 'Untitled'}
                  </div>
                </td>
                {schema.filter(prop => prop.id !== 'title').map(prop => (
                  <td key={prop.id} className={styles.td}>
                    {/* Render property value based on type */}
                    <div className={styles.cellContent}>
                      {row.properties?.[prop.id] || ''}
                    </div>
                  </td>
                ))}
                <td className={styles.td}></td>
              </tr>
            ))}
            <tr>
              <td colSpan={schema.length + 1} className={styles.addNewRow} onClick={handleAddRow}>
                <Plus size={14} style={{ marginRight: '8px' }} /> New
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}