import { Outlet } from 'react-router-dom';
import { Panel, Group, Separator } from 'react-resizable-panels';
import Sidebar from './Sidebar';
import styles from './AppLayout.module.css';

export default function AppLayout() {
  return (
    <div className={styles.appContainer}>
      <Group direction="horizontal">
        <Panel
          defaultSize={200}
          minSize={30}
          maxSize={250}
          className={styles.sidebarPanel}
        >
          <Sidebar />
        </Panel>
        
        <Separator className={styles.resizeHandle} />
        
        <Panel className={styles.mainPanel}>
          <main className={styles.mainContent}>
            <Outlet />
          </main>
        </Panel>
      </Group>
    </div>
  );
}