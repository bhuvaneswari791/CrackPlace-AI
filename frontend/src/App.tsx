import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import Coding from './pages/Coding';
import HRInterview from './pages/HRInterview';
import Battle from './pages/Battle';
import PracticeHub from './pages/PracticeHub';
import Leaderboards from './pages/Leaderboards';
import Profile from './pages/Profile';
import Store from './pages/Store';
import Invite from './pages/Invite';
import Personalization from './pages/Personalization';
import StudyNotes from './pages/StudyNotes';

// Public SEO and Marketing components
import LandingSelector from './components/LandingSelector';
import About from './pages/public/About';
import Contact from './pages/public/Contact';
import FAQPage from './pages/public/FAQPage';
import Privacy from './pages/public/Privacy';
import Terms from './pages/public/Terms';
import BlogHub from './pages/public/BlogHub';
import BlogPost from './pages/public/BlogPost';
import CompanyHub from './pages/public/CompanyHub';
import CompanyDetail from './pages/public/CompanyDetail';
import PublicNotesHub from './pages/public/PublicNotesHub';
import PublicNotesDetail from './pages/public/PublicNotesDetail';

export const App: React.FC = () => {
  const { initializeAuth, userProfile } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, [initializeAuth]);

  useEffect(() => {
    if (userProfile?.equippedTheme) {
      document.documentElement.setAttribute('data-theme', userProfile.equippedTheme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [userProfile?.equippedTheme]);

  return (
    <BrowserRouter basename={import.meta.env.DEV ? '/' : '/CrackPlace-AI'}>
      <Routes>
        {/* Public Marketing & SEO Resource Pages */}
        <Route path="/" element={<LandingSelector />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/blog" element={<BlogHub />} />
        <Route path="/blog/:postSlug" element={<BlogPost />} />
        <Route path="/company" element={<CompanyHub />} />
        <Route path="/company/:companyName" element={<CompanyDetail />} />
        <Route path="/notes" element={<PublicNotesHub />} />
        <Route path="/notes/:category" element={<PublicNotesDetail />} />

        {/* Public auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/invite/:roomId" element={<Invite />} />

        {/* Authenticated Dashboard layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/coding" element={<Coding />} />
            <Route path="/hr-interview" element={<HRInterview />} />
            <Route path="/battle" element={<Battle />} />
            <Route path="/practice" element={<PracticeHub />} />
            <Route path="/leaderboard" element={<Leaderboards />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/personalization" element={<Personalization />} />
            <Route path="/store" element={<Store />} />
            <Route path="/study-notes" element={<StudyNotes />} />
            <Route path="/admin" element={<div className="p-6 glass-panel rounded-2xl text-white font-bold">Admin Panel: Under Construction</div>} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
