import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Analytics from './pages/Analytics';
import Slider from './pages/Slider';
import Content from './pages/Content';
import ContactInfo from './pages/ContactInfo';
import Projects from './pages/Projects';
import ProjectEdit from './pages/ProjectEdit';
import Story from './pages/Story';
import Messages from './pages/Messages';
import Media from './pages/Media';
import Users from './pages/Users';
import Settings from './pages/Settings';

function Guard({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="boot"><span className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Guard><Layout /></Guard>}>
          <Route index element={<Overview />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="slider/*" element={<Slider />} />
          <Route path="content/*" element={<Content />} />
          <Route path="contact-info" element={<ContactInfo />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id/*" element={<ProjectEdit />} />
          <Route path="story/*" element={<Story />} />
          <Route path="messages" element={<Messages />} />
          <Route path="media" element={<Media />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
