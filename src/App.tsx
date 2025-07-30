import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/ui/DashboardLayout';
import { Home } from './pages/Home';
import { Meditation } from './pages/Meditation';
import { History } from './pages/History';
import { ComponentsDemo } from './pages/ComponentsDemo';

function App() {
  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route 
            path="/meditation" 
            element={
              <DashboardLayout showBottomNav={false}>
                <Meditation />
              </DashboardLayout>
            } 
          />
          <Route path="/history" element={<History />} />
          <Route 
            path="/demo" 
            element={
              <DashboardLayout showBottomNav={false}>
                <ComponentsDemo />
              </DashboardLayout>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

export default App;