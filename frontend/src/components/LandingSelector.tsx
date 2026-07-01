import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import LandingPage from '../pages/public/LandingPage';

export const LandingSelector: React.FC = () => {
  const { authUser, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg-dark text-white gradient-bg px-6">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-t-neon-purple border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
        <p className="font-display text-sm tracking-widest text-purple-300 font-bold uppercase animate-pulse">
          Loading CrackPlace AI...
        </p>
      </div>
    );
  }

  if (authUser) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LandingPage />;
};

export default LandingSelector;
