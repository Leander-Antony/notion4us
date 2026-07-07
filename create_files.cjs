const fs = require('fs');
const path = require('path');

const files = {
  'src/components/layout/AppLayout.jsx': `import { Outlet } from 'react-router-dom';\nimport styles from './AppLayout.module.css';\n\nexport default function AppLayout() {\n  return (\n    <div className={styles.layout}>\n      <aside className={styles.sidebar}>Sidebar</aside>\n      <main className={styles.main}>\n        <Outlet />\n      </main>\n    </div>\n  );\n}`,
  'src/components/layout/AppLayout.module.css': `.layout {\n  display: flex;\n  height: 100vh;\n  width: 100vw;\n  overflow: hidden;\n}\n\n.sidebar {\n  width: var(--sidebar-width);\n  background-color: var(--bg-secondary);\n  border-right: 1px solid var(--border-color);\n  height: 100%;\n}\n\n.main {\n  flex: 1;\n  height: 100%;\n  overflow-y: auto;\n  background-color: var(--bg-primary);\n}`,
  'src/pages/PageEditor.jsx': `export default function PageEditor() {\n  return <div>Page Editor</div>;\n}`,
  'src/pages/DatabaseView.jsx': `export default function DatabaseView() {\n  return <div>Database View</div>;\n}`,
  'src/pages/TrashView.jsx': `export default function TrashView() {\n  return <div>Trash View</div>;\n}`,
  'src/pages/SettingsView.jsx': `export default function SettingsView() {\n  return <div>Settings View</div>;\n}`,
  'src/pages/TemplatesView.jsx': `export default function TemplatesView() {\n  return <div>Templates View</div>;\n}`
};

for (const [filePath, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(__dirname, filePath), content);
  console.log('Created', filePath);
}
