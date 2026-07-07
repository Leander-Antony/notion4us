import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useSettingsStore from './store/useSettingsStore';
import AppLayout from './components/layout/AppLayout';
import PageEditor from './pages/PageEditor';
import DatabaseView from './pages/DatabaseView';
import TrashView from './pages/TrashView';
import SettingsView from './pages/SettingsView';
import TemplatesView from './pages/TemplatesView';

function App() {
  const { theme, setTheme } = useSettingsStore();

  useEffect(() => {
    // Force dark theme as requested by user
    if (theme !== 'dark') {
      setTheme('dark');
    }
    document.documentElement.setAttribute('data-theme', 'dark');
  }, [theme, setTheme]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/page/home" replace />} />
          <Route path="page/:pageId" element={<PageEditor />} />
          <Route path="db/:databaseId" element={<DatabaseView />} />
          <Route path="templates" element={<TemplatesView />} />
          <Route path="trash" element={<TrashView />} />
          <Route path="settings" element={<SettingsView />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
