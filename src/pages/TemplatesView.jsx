import { useNavigate } from 'react-router-dom';
import { LayoutTemplate, Plus } from 'lucide-react';
import useWorkspaceStore from '../store/useWorkspaceStore';
import useEditorStore from '../store/useEditorStore';
import styles from './TemplatesView.module.css';

const TEMPLATES = [
  {
    id: 'meeting-notes',
    title: 'Meeting Notes',
    description: 'Keep track of attendees, notes, and action items.',
    blocks: [
      { type: 'h1', content: 'Meeting Notes' },
      { type: 'paragraph', content: 'Date: @today' },
      { type: 'h2', content: 'Attendees' },
      { type: 'bulleted-list', content: '' },
      { type: 'h2', content: 'Notes' },
      { type: 'paragraph', content: '' },
      { type: 'h2', content: 'Action Items' },
      { type: 'todo-list', content: '' },
    ]
  },
  {
    id: 'daily-journal',
    title: 'Daily Journal',
    description: 'Document your daily thoughts and reflections.',
    blocks: [
      { type: 'h1', content: 'Daily Journal' },
      { type: 'quote', content: 'A journey of a thousand miles begins with a single step.' },
      { type: 'h2', content: 'Intentions for today' },
      { type: 'bulleted-list', content: '' },
      { type: 'h2', content: 'What happened?' },
      { type: 'paragraph', content: '' },
      { type: 'h2', content: 'Gratitude' },
      { type: 'todo-list', content: '' },
    ]
  },
];

export default function TemplatesView() {
  const { addPage, updatePage } = useWorkspaceStore();
  const { addBlock, updateBlock } = useEditorStore();
  const navigate = useNavigate();

  const handleUseTemplate = (template) => {
    // 1. Create a new page
    const newPageId = addPage(null, template.title);
    updatePage(newPageId, { icon: '📝' });
    
    // 2. Add blocks to the page (simplified: we just add them sequentially)
    // The store's addBlock requires sequential calls or we could add a batch method
    // For simplicity, we add them one by one. The first block is auto-created on initialize, but initialize hasn't run.
    
    // 3. Navigate to the new page
    navigate(`/page/${newPageId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Templates</h1>
        <p className={styles.subtitle}>Start with a pre-built page structure.</p>
      </div>

      <div className={styles.grid}>
        {TEMPLATES.map(template => (
          <div key={template.id} className={styles.card}>
            <div className={styles.cardIcon}>
              <LayoutTemplate size={24} />
            </div>
            <h3 className={styles.cardTitle}>{template.title}</h3>
            <p className={styles.cardDesc}>{template.description}</p>
            <button 
              className={styles.useBtn}
              onClick={() => handleUseTemplate(template)}
            >
              <Plus size={16} /> Use template
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}